// src/components/worldmap/SimulationTab.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, ComposedChart
} from 'recharts';
import {
  Play, Loader2, RefreshCw, TrendingDown, TrendingUp,
  Minus, AlertTriangle, Activity, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SimulationResult,
  SimulationResultsData,
  getRiskLevelColor,
  getCoherenceColor
} from "@/lib/gdeltApi";

// Helper to get auth token from Netlify Identity
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined' && window.netlifyIdentity) {
    const user = window.netlifyIdentity.currentUser();
    return user?.token?.access_token || null;
  }
  return null;
};

// API endpoint for full simulations
// In production: uses Netlify Function as proxy (/.netlify/functions/simulate)
// In development: can override with VITE_SIMULATION_API_URL env var for direct API access
const getSimulationEndpoint = () => {
  const envUrl = import.meta.env.VITE_SIMULATION_API_URL;
  if (envUrl) {
    // Development: use direct API URL
    return `${envUrl}/api/simulate`;
  }
  // Production: use Netlify Function proxy
  return '/.netlify/functions/simulate';
};

interface SimulationTabProps {
  simulationData: SimulationResultsData | null;
  isLoading: boolean;
}

interface SimulationParameters {
  suppression_level: number;
  fear_factor: number;
  supremacist_ideology: number;
  resource_availability: number;  // Note: inverted from scarcity for API
  identity_bias: number;          // -1 (out-group) to +1 (in-group)
  initial_coherence: number;
}

// Scenario interfaces - v2 with modifiers
interface ScenarioModifier {
  type: 'delta' | 'multiply' | 'set';
  value: number;
}

interface ScenarioModifiers {
  suppression_level?: ScenarioModifier;
  fear_factor?: ScenarioModifier;
  supremacist_ideology?: ScenarioModifier;
  resource_scarcity?: ScenarioModifier;
  identity_bias?: ScenarioModifier;
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  type: 'stress_test' | 'recovery' | 'intervention' | 'target_state';
  modifiers: ScenarioModifiers;
}

interface ScenarioCategory {
  name: string;
  description: string;
  scenarios: Scenario[];
}

interface ScenariosData {
  generated_at: string;
  schema_version?: string;
  total_scenarios: number;
  categories: {
    [key: string]: ScenarioCategory;
  };
}

/**
 * Apply scenario modifiers to entity baseline parameters
 * - delta: baseline + value (add/subtract fixed amount)
 * - multiply: baseline * value (scale proportionally)
 * - set: value (override to specific target)
 */
function applyModifiers(
  baseline: SimulationParameters,
  modifiers: ScenarioModifiers
): SimulationParameters {
  const result = { ...baseline };

  // Helper to clamp values between bounds
  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

  // Map modifier keys to result keys (handle resource_scarcity → resource_availability inversion)
  const applyModifier = (
    paramKey: keyof SimulationParameters,
    modifierKey: keyof ScenarioModifiers,
    invert: boolean = false
  ) => {
    const mod = modifiers[modifierKey];
    if (!mod) return;

    const baseValue = baseline[paramKey] as number;
    let newValue: number;

    switch (mod.type) {
      case 'delta':
        // For inverted params (scarcity→availability), invert the delta
        newValue = baseValue + (invert ? -mod.value : mod.value);
        break;
      case 'multiply':
        newValue = baseValue * mod.value;
        break;
      case 'set':
        // For inverted params, invert the set value
        newValue = invert ? (1 - mod.value) : mod.value;
        break;
      default:
        return;
    }

    // Clamp to valid range (identity_bias is -1 to +1, others are 0 to 1)
    if (paramKey === 'identity_bias') {
      result[paramKey] = clamp(newValue, -1, 1);
    } else {
      result[paramKey] = clamp(newValue, 0, 1);
    }
  };

  // Apply each modifier
  applyModifier('suppression_level', 'suppression_level');
  applyModifier('fear_factor', 'fear_factor');
  applyModifier('supremacist_ideology', 'supremacist_ideology');
  applyModifier('resource_availability', 'resource_scarcity', true);  // Inverted
  applyModifier('identity_bias', 'identity_bias');

  return result;
}

// Entity data interface - loaded from country JSON files
interface EntityData {
  country_code: string;
  country_name: string;
  latitude: number;
  longitude: number;
  category: string;  // Governance category
  metrics: {
    sgm: number;
    gscs: number;
    srsD: number;
    srsI: number;
    sti: number;
    sim_suppression: number;
    sim_fear_factor: number;
    sim_coherence: number;
    sim_ideology: number;
    fatalities: number;
    event_count: number;
  };
  simulation_source: string;
  updated_at: string;
}

/**
 * Mathematical model parameter correlations
 *
 * From the unified mathematical model:
 * - Suppression reduces knowledge: dK/dt = (W·K)/(1 + K/K_max) - S
 * - Fear reduces egalitarian prob: P(E) includes -1.0512·F term
 * - Suppression feedback: F_s = α·S - β·K (suppression and fear linked)
 * - Val(v) = tanh(q_Id·E_K - q_R·E_F) (identity bias affects valence)
 *
 * Correlation rules:
 * - High suppression → high fear (suppression generates fear)
 * - High suppression → low knowledge → high supremacist ideology
 * - High fear → resource scarcity (often co-occur)
 * - High supremacist → negative identity bias (in-group preference)
 */
function correlateParameters(
  primaryParam: keyof SimulationParameters,
  primaryValue: number,
  currentParams: SimulationParameters
): SimulationParameters {
  // Start with current params
  const params = { ...currentParams };

  // NOTE: initial_coherence is INDEPENDENT per the mathematical model
  // Coherence is an OUTPUT of choices, not an input that drives parameters
  // P(E) = f(Id, R, F, K) - coherence not in equation
  // dCoh/dt = ∫Ψ(v)·f(v)dv - coherence is the result

  if (primaryParam === 'suppression_level') {
    const S = primaryValue;
    params.suppression_level = S;
    // From suppression feedback equation: suppression generates fear
    params.fear_factor = Math.min(0.95, 0.3 + 0.6 * S);
    // Suppression often accompanies supremacist ideology (justification)
    params.supremacist_ideology = Math.min(0.95, 0.1 + 0.8 * S);
    // Negative identity bias correlates with supremacism
    params.identity_bias = -0.7 * S;
    // Suppressive regimes often misallocate resources
    params.resource_availability = Math.max(0.15, 0.7 - 0.5 * S);
    // initial_coherence stays independent
  }
  else if (primaryParam === 'fear_factor') {
    const F = primaryValue;
    params.fear_factor = F;
    // High fear often comes with some suppression
    params.suppression_level = Math.min(0.9, 0.5 * F);
    // Fear breeds supremacist thinking (scapegoating)
    params.supremacist_ideology = Math.min(0.8, 0.3 + 0.5 * F);
    // Fear correlates with resource scarcity
    params.resource_availability = Math.max(0.2, 0.8 - 0.5 * F);
    // Fear increases in-group bias
    params.identity_bias = -0.5 * F;
    // initial_coherence stays independent
  }
  else if (primaryParam === 'supremacist_ideology') {
    const Sup = primaryValue;
    params.supremacist_ideology = Sup;
    // Supremacism requires suppression to enforce
    params.suppression_level = Math.min(0.9, 0.3 + 0.6 * Sup);
    // Supremacism uses fear as tool
    params.fear_factor = Math.min(0.9, 0.3 + 0.5 * Sup);
    // Strong negative identity bias
    params.identity_bias = -0.8 * Sup;
    // Supremacist systems often have resource concentration
    params.resource_availability = Math.max(0.25, 0.6 - 0.3 * Sup);
    // initial_coherence stays independent
  }
  else if (primaryParam === 'resource_availability') {
    const R = primaryValue;
    params.resource_availability = R;
    // Scarcity breeds fear
    params.fear_factor = Math.max(0.2, 0.8 - 0.6 * R);
    // Scarcity can lead to suppression
    params.suppression_level = Math.max(0.0, 0.5 - 0.5 * R);
    // Scarcity increases in-group competition
    params.supremacist_ideology = Math.max(0.0, 0.4 - 0.4 * R);
    params.identity_bias = -0.3 * (1 - R);
    // initial_coherence stays independent
  }
  else if (primaryParam === 'identity_bias') {
    const Id = primaryValue;
    params.identity_bias = Id;
    // Negative identity bias (in-group preference) correlates with supremacism
    // From Val(v) = tanh(q_Id·E_K - q_R·E_F)
    params.supremacist_ideology = Math.max(0, Math.min(0.9, 0.3 - 0.6 * Id));
    // In-group bias correlates with fear of out-groups
    params.fear_factor = Math.max(0.2, Math.min(0.9, 0.5 - 0.4 * Id));
    // Supremacist systems use suppression
    params.suppression_level = Math.max(0, Math.min(0.8, 0.3 - 0.5 * Id));
    // In-group bias often correlates with resource hoarding
    params.resource_availability = Math.max(0.2, Math.min(0.8, 0.5 + 0.3 * Id));
    // initial_coherence stays independent
  }

  return params;
}

interface ProjectionResult {
  timestep: number;
  coherence: number;
  risk_level: string;
  trend: string;
}

// Client-side coherence approximation model
// This provides instant feedback while user adjusts sliders
function approximateCoherence(
  params: SimulationParameters,
  timesteps: number
): ProjectionResult[] {
  const results: ProjectionResult[] = [];
  let coherence = params.initial_coherence;

  // Convert resource_availability to scarcity for pressure calculation
  const resourceScarcity = 1 - params.resource_availability;

  // Calculate decay rate based on parameters
  // Higher suppression, fear, and ideology = faster decay
  // Identity bias affects decay (negative bias = worse)
  const baseDecay = 0.002;
  const identityPressure = Math.max(0, -params.identity_bias * 0.15); // Negative bias adds pressure
  const parameterPressure = (
    params.suppression_level * 0.35 +
    params.fear_factor * 0.30 +
    params.supremacist_ideology * 0.25 +
    resourceScarcity * 0.10 +
    identityPressure
  );

  // Recovery factor - lower parameters allow some recovery
  // Positive identity bias helps recovery
  const identityRecovery = Math.max(0, params.identity_bias * 0.1);
  const recoveryPotential = Math.max(0, 0.3 - parameterPressure * 0.4 + identityRecovery);

  // Minimum coherence floor (system can't go below this)
  const coherenceFloor = 0.15 + (1 - parameterPressure) * 0.15;

  for (let t = 0; t <= timesteps; t++) {
    // Calculate instantaneous decay
    const decayRate = baseDecay + parameterPressure * 0.015;

    // Add some noise/variance for realism
    const noise = (Math.sin(t * 0.1) * 0.002 + Math.cos(t * 0.07) * 0.001);

    // Recovery attempts when coherence is low
    const recoveryBoost = coherence < 0.4 ? recoveryPotential * 0.003 : 0;

    // Update coherence
    coherence = coherence - decayRate + recoveryBoost + noise;

    // Apply floor
    coherence = Math.max(coherenceFloor, Math.min(1.0, coherence));

    // Determine risk level
    let risk_level: string;
    if (coherence >= 0.7) risk_level = 'low';
    else if (coherence >= 0.5) risk_level = 'moderate';
    else if (coherence >= 0.35) risk_level = 'elevated';
    else if (coherence >= 0.25) risk_level = 'high';
    else risk_level = 'critical';

    // Determine trend
    const prevCoherence = results.length > 0 ? results[results.length - 1].coherence : params.initial_coherence;
    let trend: string;
    if (coherence > prevCoherence + 0.001) trend = 'improving';
    else if (coherence < prevCoherence - 0.001) trend = 'declining';
    else trend = 'stable';

    results.push({
      timestep: t,
      coherence: Math.round(coherence * 1000) / 1000,
      risk_level,
      trend
    });
  }

  return results;
}

// Get risk level from coherence
function getRiskLevel(coherence: number): string {
  if (coherence >= 0.7) return 'low';
  if (coherence >= 0.5) return 'moderate';
  if (coherence >= 0.35) return 'elevated';
  if (coherence >= 0.25) return 'high';
  return 'critical';
}

const SimulationTab: React.FC<SimulationTabProps> = ({
  simulationData,
  isLoading
}) => {
  // Selected entity (country) - now loads full entity data
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [loadedEntity, setLoadedEntity] = useState<EntityData | null>(null);
  const [entityLoading, setEntityLoading] = useState(false);

  // Selected scenario - can be combined WITH entity for "Entity X under Scenario Y"
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [scenariosData, setScenariosData] = useState<ScenariosData | null>(null);
  const [scenariosLoading, setScenariosLoading] = useState(true);

  // Mode: 'entity_baseline' uses entity's own parameters, 'entity_scenario' applies scenario to entity
  const [simulationMode, setSimulationMode] = useState<'custom' | 'entity_baseline' | 'entity_scenario'>('custom');

  // Auto-correlate toggle - when on, changing one parameter updates others
  const [autoCorrelate, setAutoCorrelate] = useState(true);

  // Simulation parameters
  const [params, setParams] = useState<SimulationParameters>({
    suppression_level: 0.0,
    fear_factor: 0.5,
    supremacist_ideology: 0.0,
    resource_availability: 0.5,
    identity_bias: 0.0,
    initial_coherence: 0.6
  });

  // Timesteps for projection
  const [timesteps, setTimesteps] = useState(500);

  // Full simulation state
  const [isRunningFullSim, setIsRunningFullSim] = useState(false);
  const [fullSimResults, setFullSimResults] = useState<ProjectionResult[] | null>(null);
  const [fullSimError, setFullSimError] = useState<string | null>(null);

  // Countries list from simulation data
  const countries = useMemo(() => {
    if (!simulationData?.results) return [];
    return simulationData.results.map(r => ({
      code: r.country_code,
      name: r.country_name,
      params: r.parameters,
      initialCoherence: r.simulation.initial_coherence,
      currentCoherence: r.simulation.final_coherence
    }));
  }, [simulationData]);

  // Load scenarios data
  useEffect(() => {
    const loadScenarios = async () => {
      try {
        const response = await fetch('/map-data/scenarios.json');
        if (response.ok) {
          const data = await response.json();
          setScenariosData(data);
        }
      } catch (error) {
        console.error('Failed to load scenarios:', error);
      } finally {
        setScenariosLoading(false);
      }
    };
    loadScenarios();
  }, []);

  // Apply scenario modifiers when selected - REQUIRES entity baseline
  useEffect(() => {
    if (selectedScenario && scenariosData) {
      // Find the scenario in all categories
      for (const category of Object.values(scenariosData.categories)) {
        const scenario = category.scenarios.find(s => s.id === selectedScenario);
        if (scenario) {
          // Scenarios require an entity baseline to modify
          // Without entity, we can't apply modifiers meaningfully
          if (!loadedEntity) {
            console.warn('Scenario selected but no entity loaded - waiting for entity');
            setSimulationMode('custom');
            return;
          }

          // Get entity baseline parameters
          const entityBaseline: SimulationParameters = {
            suppression_level: loadedEntity.metrics.sim_suppression,
            fear_factor: loadedEntity.metrics.sim_fear_factor,
            supremacist_ideology: loadedEntity.metrics.sim_ideology,
            resource_availability: 0.5,  // Default, could derive from entity
            identity_bias: 0.0,          // Default, could derive from governance category
            initial_coherence: loadedEntity.metrics.sim_coherence
          };

          // Apply scenario modifiers to entity baseline
          const modifiedParams = applyModifiers(entityBaseline, scenario.modifiers);

          // Keep initial coherence from entity (modifiers don't change starting coherence)
          modifiedParams.initial_coherence = loadedEntity.metrics.sim_coherence;

          setParams(modifiedParams);
          setSimulationMode('entity_scenario');
          setFullSimResults(null);
          setFullSimError(null);
          break;
        }
      }
    } else if (!selectedScenario && loadedEntity) {
      // Scenario cleared but entity still selected - revert to entity baseline
      setParams({
        suppression_level: loadedEntity.metrics.sim_suppression,
        fear_factor: loadedEntity.metrics.sim_fear_factor,
        supremacist_ideology: loadedEntity.metrics.sim_ideology,
        resource_availability: 0.5,
        identity_bias: 0.0,
        initial_coherence: loadedEntity.metrics.sim_coherence
      });
      setSimulationMode('entity_baseline');
      setFullSimResults(null);
    } else if (!selectedScenario && selectedCountry && !loadedEntity) {
      // Country selected but still loading - keep waiting
      // Entity effect will handle setting params when loaded
      setSimulationMode('entity_baseline'); // Anticipate entity mode
    } else if (!selectedScenario && !selectedCountry) {
      setSimulationMode('custom');
    }
  }, [selectedScenario, scenariosData, loadedEntity, selectedCountry]);

  // Load entity data from JSON file when country selected
  useEffect(() => {
    if (selectedCountry) {
      setEntityLoading(true);
      fetch(`/map-data/country_${selectedCountry.toLowerCase()}.json`)
        .then(response => {
          if (!response.ok) throw new Error('Entity not found');
          return response.json();
        })
        .then((entity: EntityData) => {
          setLoadedEntity(entity);

          // Set initial coherence from entity's actual simulation result
          // Use entity's baseline parameters if no scenario selected
          if (!selectedScenario) {
            setParams({
              suppression_level: entity.metrics.sim_suppression,
              fear_factor: entity.metrics.sim_fear_factor,
              supremacist_ideology: entity.metrics.sim_ideology,
              resource_availability: 0.5, // Default, could be derived from entity data
              identity_bias: 0.0, // Default, could be derived from governance category
              initial_coherence: entity.metrics.sim_coherence
            });
            setSimulationMode('entity_baseline');
          } else {
            // Keep scenario parameters but use entity's initial coherence
            setParams(p => ({
              ...p,
              initial_coherence: entity.metrics.sim_coherence
            }));
            setSimulationMode('entity_scenario');
          }

          setFullSimResults(null);
          setFullSimError(null);
        })
        .catch(error => {
          console.error('Failed to load entity:', error);
          setLoadedEntity(null);
        })
        .finally(() => {
          setEntityLoading(false);
        });
    } else {
      setLoadedEntity(null);
      if (!selectedScenario) {
        setSimulationMode('custom');
      }
    }
  }, [selectedCountry]);

  // Client-side approximation (updates in real-time)
  const approximation = useMemo(() => {
    return approximateCoherence(params, timesteps);
  }, [params, timesteps]);

  // Chart data - use full sim results if available, otherwise approximation
  const chartData = fullSimResults || approximation;

  // Final coherence from projection
  const finalCoherence = chartData[chartData.length - 1]?.coherence || params.initial_coherence;
  const finalRiskLevel = getRiskLevel(finalCoherence);
  const coherenceChange = finalCoherence - params.initial_coherence;

  // Run full simulation via API (v2 format with entity/scenario support)
  const runFullSimulation = async () => {
    setIsRunningFullSim(true);
    setFullSimError(null);

    try {
      // Build v2 API request
      const requestBody: Record<string, unknown> = {
        // Include entity reference if selected
        entity: loadedEntity ? `countries/${selectedCountry?.toLowerCase()}` : null,

        // Include scenario reference if selected
        scenario: selectedScenario || null,

        // Always include current parameters (may be entity baseline, scenario, or custom)
        parameters: {
          suppression_level: params.suppression_level,
          fear_factor: params.fear_factor,
          supremacist_ideology: params.supremacist_ideology,
          resource_scarcity: 1 - params.resource_availability,
          identity_bias: params.identity_bias
        },

        // Initial coherence from entity or custom
        initial_coherence: params.initial_coherence,

        // Simulation settings
        timesteps: timesteps,

        // Context for API
        simulation_mode: simulationMode,

        // Legacy field for backwards compatibility
        country_code: selectedCountry || 'custom'
      };

      // Get auth token for authenticated API requests
      const authToken = getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      // Include auth token if available (required for production API)
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(getSimulationEndpoint(), {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Transform API response to our format
      const results: ProjectionResult[] = data.coherence_history.map((coherence: number, i: number) => ({
        timestep: i,
        coherence,
        risk_level: getRiskLevel(coherence),
        trend: i > 0
          ? (coherence > data.coherence_history[i-1] ? 'improving' :
             coherence < data.coherence_history[i-1] ? 'declining' : 'stable')
          : 'stable'
      }));

      setFullSimResults(results);
    } catch (error) {
      console.error('Full simulation error:', error);
      setFullSimError(
        error instanceof Error
          ? `Could not connect to simulation server: ${error.message}`
          : 'Simulation server unavailable. Using client-side approximation.'
      );
    } finally {
      setIsRunningFullSim(false);
    }
  };

  // Reset to defaults
  const resetParams = () => {
    setParams({
      suppression_level: 0.0,
      fear_factor: 0.5,
      supremacist_ideology: 0.0,
      resource_availability: 0.5,
      identity_bias: 0.0,
      initial_coherence: 0.6
    });
    setFullSimResults(null);
    setFullSimError(null);
    setSelectedCountry(null);
    setSelectedScenario(null);
    setLoadedEntity(null);
    setSimulationMode('custom');
  };

  // Handle parameter change with optional correlation
  const handleParamChange = (
    paramName: keyof SimulationParameters,
    value: number
  ) => {
    // All main parameters trigger correlation (except initial_coherence which is output-only)
    const correlatedParams = ['suppression_level', 'fear_factor', 'supremacist_ideology', 'resource_availability', 'identity_bias'];

    if (autoCorrelate && correlatedParams.includes(paramName)) {
      // Apply correlation model
      const correlated = correlateParameters(paramName, value, params);
      setParams(correlated);
    } else {
      // Manual mode - only change the specific parameter
      setParams(p => ({ ...p, [paramName]: value }));
    }
    setFullSimResults(null); // Clear full sim when params change
  };

  // Parameter slider component - supports 0-1 range and -1 to +1 range
  const ParameterSlider = ({
    label,
    value,
    paramName,
    description,
    min = 0,
    max = 1,
    inverted = false,  // For sliders where high value = good (like resources)
    showBipolar = false // For -1 to +1 sliders like identity bias
  }: {
    label: string;
    value: number;
    paramName: keyof SimulationParameters;
    description: string;
    min?: number;
    max?: number;
    inverted?: boolean;
    showBipolar?: boolean;
  }) => {
    // Calculate display value and color
    const displayValue = showBipolar
      ? value.toFixed(2)
      : `${(value * 100).toFixed(0)}%`;

    const getColor = () => {
      if (showBipolar) {
        // For identity bias: negative = red, neutral = yellow, positive = green
        if (value < -0.3) return "text-red-400";
        if (value > 0.3) return "text-green-400";
        return "text-yellow-400";
      }
      if (inverted) {
        // For resources: high = good (green), low = bad (red)
        if (value > 0.6) return "text-green-400";
        if (value > 0.3) return "text-yellow-400";
        return "text-red-400";
      }
      // Default: high = bad (red), low = good (green)
      if (value > 0.7) return "text-red-400";
      if (value > 0.4) return "text-yellow-400";
      return "text-green-400";
    };

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-sm text-gray-300">{label}</Label>
          <span className={cn("text-sm font-mono font-bold", getColor())}>
            {displayValue}
          </span>
        </div>
        <Slider
          value={[showBipolar ? (value + 1) * 50 : value * 100]} // Scale to 0-100
          min={0}
          max={100}
          step={1}
          onValueChange={(v) => {
            const newValue = showBipolar
              ? (v[0] / 50) - 1  // Convert 0-100 to -1 to +1
              : v[0] / 100;      // Convert 0-100 to 0-1
            handleParamChange(paramName, newValue);
          }}
          className="cursor-pointer"
        />
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-black/30 p-6 rounded-lg border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl text-white flex items-center gap-2">
              <Activity className="h-6 w-6 text-purple-400" />
              Coherence Projection Simulator
            </h2>
            <p className="text-gray-400 mt-1">
              Project how governance parameters affect primordial coherence over time
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetParams}
            className="bg-black/50 text-white border-white/20"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Mode indicator */}
        <div className="flex items-center gap-2 text-sm">
          <div className={cn(
            "px-2 py-1 rounded text-xs font-medium",
            fullSimResults
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
          )}>
            {fullSimResults ? "Full Simulation" : "Preview Mode"}
          </div>
          {!fullSimResults && (
            <span className="text-gray-500">
              Adjust parameters for instant preview, then run full simulation for accurate results
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Parameters */}
        <div className="space-y-6">
          {/* Simulation Mode Indicator */}
          {(loadedEntity || selectedScenario) && (
            <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/30">
              <div className="text-sm text-purple-300 font-medium mb-2">
                {simulationMode === 'entity_scenario' ? '🎯 Entity + Scenario Modifiers' :
                 simulationMode === 'entity_baseline' ? '🌍 Entity Baseline Trajectory' :
                 '⚙️ Custom Parameters'}
              </div>
              <div className="text-xs text-gray-400">
                {simulationMode === 'entity_scenario' && loadedEntity && selectedScenario && (
                  <>
                    <span className="text-white font-medium">{loadedEntity.country_name}</span>
                    {' baseline '}
                    <span className="text-purple-400">modified by</span>
                    {' '}
                    <span className="text-purple-400 font-medium">{
                      (() => {
                        for (const cat of Object.values(scenariosData?.categories || {})) {
                          const s = cat.scenarios.find(sc => sc.id === selectedScenario);
                          if (s) return s.name;
                        }
                        return selectedScenario;
                      })()
                    }</span>
                    {' → Explore "what if" trajectory'}
                  </>
                )}
                {simulationMode === 'entity_baseline' && loadedEntity && (
                  <>
                    Projecting <span className="text-white font-medium">{loadedEntity.country_name}</span>'s real-world parameters
                    {' → '}
                    <span className="text-gray-500">Select a scenario to apply modifiers</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Entity (Country) selector */}
          <div className="bg-black/30 p-4 rounded-lg border border-white/10">
            <h3 className="text-lg font-medium mb-3 text-white flex items-center gap-2">
              🌍 Select Entity (Country)
            </h3>

            {isLoading || entityLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <select
                value={selectedCountry || ''}
                onChange={(e) => setSelectedCountry(e.target.value || null)}
                className="w-full bg-black/50 text-white border border-white/20 rounded px-3 py-2"
              >
                <option value="">No Entity (Custom)</option>
                {countries
                  .sort((a, b) => a.currentCoherence - b.currentCoherence)
                  .map(country => (
                    <option key={country.code} value={country.code}>
                      {country.code} - {country.name || country.code}
                    </option>
                  ))
                }
              </select>
            )}

            {/* Entity Context - show real data when entity loaded */}
            {loadedEntity && (
              <div className="mt-3 p-3 bg-black/40 rounded border border-white/5">
                <div className="text-sm text-white font-medium mb-2">{loadedEntity.country_name}</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Governance:</span>
                    <span className="text-gray-300 ml-1">{loadedEntity.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Coherence:</span>
                    <span className="text-purple-400 ml-1">{(loadedEntity.metrics.sim_coherence * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Events:</span>
                    <span className="text-orange-400 ml-1">{loadedEntity.metrics.event_count.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Fatalities:</span>
                    <span className="text-red-400 ml-1">{loadedEntity.metrics.fatalities.toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  STI: {loadedEntity.metrics.sti.toFixed(1)} | SGM: {loadedEntity.metrics.sgm.toFixed(1)}
                </div>
              </div>
            )}

            {!selectedCountry && (
              <p className="text-xs text-gray-500 mt-2">
                Select a country to use its real conflict data as starting point
              </p>
            )}
          </div>

          {/* Scenario selector */}
          <div className={cn(
            "bg-black/30 p-4 rounded-lg border",
            loadedEntity ? "border-white/10" : "border-yellow-500/30"
          )}>
            <h3 className="text-lg font-medium mb-3 text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-400" />
              Apply Scenario {loadedEntity && <span className="text-xs text-gray-500 font-normal">(to {loadedEntity.country_code})</span>}
            </h3>

            {scenariosLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <select
                value={selectedScenario || ''}
                onChange={(e) => setSelectedScenario(e.target.value || null)}
                disabled={!loadedEntity}
                className={cn(
                  "w-full bg-black/50 text-white border rounded px-3 py-2",
                  loadedEntity ? "border-white/20" : "border-yellow-500/30 opacity-50 cursor-not-allowed"
                )}
              >
                <option value="">{loadedEntity ? 'Entity Baseline (No Scenario)' : 'Select entity first'}</option>
                {scenariosData && Object.entries(scenariosData.categories).map(([categoryKey, category]) => (
                  <optgroup key={categoryKey} label={category.name}>
                    {category.scenarios.map(scenario => (
                      <option key={scenario.id} value={scenario.id}>
                        {scenario.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            )}

            {/* Show modifier effects when scenario is applied */}
            {selectedScenario && scenariosData && loadedEntity && (() => {
              for (const category of Object.values(scenariosData.categories)) {
                const scenario = category.scenarios.find(s => s.id === selectedScenario);
                if (scenario) {
                  return (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-gray-400">{scenario.description}</p>
                      <div className="bg-black/40 p-2 rounded text-xs space-y-1">
                        <div className="text-purple-400 font-medium mb-1">Modifiers Applied:</div>
                        {Object.entries(scenario.modifiers).map(([param, mod]) => {
                          const baseValue = param === 'suppression_level' ? loadedEntity.metrics.sim_suppression :
                                           param === 'fear_factor' ? loadedEntity.metrics.sim_fear_factor :
                                           param === 'supremacist_ideology' ? loadedEntity.metrics.sim_ideology :
                                           param === 'resource_scarcity' ? 0.5 :
                                           param === 'identity_bias' ? 0.0 : 0;
                          const modValue = mod.value;
                          const resultValue = mod.type === 'delta' ? baseValue + modValue :
                                             mod.type === 'multiply' ? baseValue * modValue :
                                             modValue;
                          const clampedResult = Math.max(param === 'identity_bias' ? -1 : 0,
                                                        Math.min(1, resultValue));
                          const modSign = mod.type === 'delta' ? (modValue >= 0 ? '+' : '') : '';
                          const modSymbol = mod.type === 'multiply' ? '×' : mod.type === 'set' ? '→' : '';

                          return (
                            <div key={param} className="flex justify-between text-gray-300">
                              <span className="text-gray-500">{param.replace(/_/g, ' ')}:</span>
                              <span>
                                <span className="text-gray-400">{baseValue.toFixed(2)}</span>
                                <span className="text-purple-400 mx-1">
                                  {mod.type === 'delta' && `${modSign}${modValue.toFixed(2)}`}
                                  {mod.type === 'multiply' && `${modSymbol}${modValue.toFixed(2)}`}
                                  {mod.type === 'set' && `${modSymbol}${modValue.toFixed(2)}`}
                                </span>
                                <span className="text-white">{clampedResult.toFixed(2)}</span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
              }
              return null;
            })()}

            {!loadedEntity && (
              <p className="text-xs text-yellow-400 mt-2">
                ⚠️ Select an entity (country) first. Scenarios modify entity baseline parameters.
              </p>
            )}

            {loadedEntity && !selectedScenario && (
              <p className="text-xs text-gray-500 mt-2">
                Using {loadedEntity.country_name}'s baseline parameters. Select a scenario to explore "what if" trajectories.
              </p>
            )}
          </div>

          {/* Auto-correlate toggle */}
          <div className="bg-black/30 p-4 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAutoCorrelate(!autoCorrelate)}
                  className={cn(
                    "w-10 h-5 rounded-full transition-colors relative",
                    autoCorrelate ? "bg-purple-600" : "bg-gray-600"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform",
                      autoCorrelate ? "translate-x-5" : "translate-x-0.5"
                    )}
                  />
                </button>
                <Label className="text-sm text-gray-300">🔗 Auto-correlate</Label>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {autoCorrelate
                ? "Parameters auto-adjust based on mathematical model equations"
                : "Manual mode - parameters are independent (for isolated tests)"}
            </p>
          </div>

          {/* Parameter sliders */}
          <div className="bg-black/30 p-4 rounded-lg border border-white/10 space-y-6">
            <h3 className="text-lg font-medium text-white">Stress Factors</h3>

            <ParameterSlider
              label="Suppression Level"
              value={params.suppression_level}
              paramName="suppression_level"
              description="Degree of information/expression suppression (dK/dt equation)"
            />

            <ParameterSlider
              label="Fear Factor"
              value={params.fear_factor}
              paramName="fear_factor"
              description="Level of fear-based control (P(E) probability term)"
            />

            <ParameterSlider
              label="Supremacist Ideology"
              value={params.supremacist_ideology}
              paramName="supremacist_ideology"
              description="Prevalence of in-group superiority beliefs"
            />

            <div className="pt-4 border-t border-white/10">
              <h3 className="text-lg font-medium text-white mb-4">Resources & Bias</h3>

              <ParameterSlider
                label="Resource Availability"
                value={params.resource_availability}
                paramName="resource_availability"
                description="Level of resource abundance (high = good)"
                inverted={true}
              />

              <div className="mt-6">
                <ParameterSlider
                  label="Identity Bias"
                  value={params.identity_bias}
                  paramName="identity_bias"
                  description="Val(v) equation: negative = in-group preference, positive = out-group openness"
                  showBipolar={true}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <ParameterSlider
                label="Initial Coherence"
                value={params.initial_coherence}
                paramName="initial_coherence"
                description="Starting primordial coherence level"
                inverted={true}
              />
            </div>
          </div>

          {/* Timesteps selector */}
          <div className="bg-black/30 p-4 rounded-lg border border-white/10">
            <h3 className="text-lg font-medium mb-3 text-white">Projection Length</h3>
            <div className="flex gap-2">
              {[100, 250, 500, 1000].map(t => (
                <button
                  key={t}
                  onClick={() => {
                    setTimesteps(t);
                    setFullSimResults(null);
                  }}
                  className={cn(
                    "flex-1 px-3 py-2 rounded text-sm transition-colors",
                    timesteps === t
                      ? "bg-purple-600 text-white"
                      : "bg-black/50 text-gray-400 border border-white/10 hover:border-white/30"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Number of simulation timesteps to project
            </p>
          </div>

          {/* Run simulation button */}
          <Button
            onClick={runFullSimulation}
            disabled={isRunningFullSim}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            size="lg"
          >
            {isRunningFullSim ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Running Full Simulation...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5 mr-2" />
                Run Full Simulation
              </>
            )}
          </Button>

          {fullSimError && (
            <Alert className="bg-yellow-500/10 border-yellow-500/30">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-yellow-300 text-sm">
                {fullSimError}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Right column - Chart and results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Coherence chart */}
          <div className="bg-black/30 p-4 rounded-lg border border-white/10">
            <h3 className="text-lg font-medium mb-4 text-white">Coherence Projection</h3>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="coherenceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="timestep"
                    stroke="#666"
                    tickFormatter={(v) => v % 100 === 0 ? v : ''}
                  />
                  <YAxis
                    stroke="#666"
                    domain={[0, 1]}
                    tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Coherence']}
                    labelFormatter={(label) => `Timestep ${label}`}
                  />
                  {/* Risk level zones */}
                  <ReferenceLine y={0.7} stroke="#22c55e" strokeDasharray="5 5" />
                  <ReferenceLine y={0.5} stroke="#eab308" strokeDasharray="5 5" />
                  <ReferenceLine y={0.35} stroke="#f97316" strokeDasharray="5 5" />
                  <ReferenceLine y={0.25} stroke="#ef4444" strokeDasharray="5 5" />

                  <Area
                    type="monotone"
                    dataKey="coherence"
                    stroke="none"
                    fill="url(#coherenceGradient)"
                  />
                  <Line
                    type="monotone"
                    dataKey="coherence"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#8b5cf6' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Risk level legend */}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-green-500"></div>
                <span className="text-gray-400">Low (70%+)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-yellow-500"></div>
                <span className="text-gray-400">Moderate (50%+)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-orange-500"></div>
                <span className="text-gray-400">Elevated (35%+)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-red-500"></div>
                <span className="text-gray-400">High/Critical</span>
              </div>
            </div>
          </div>

          {/* Results summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Initial coherence */}
            <div className="bg-black/30 p-4 rounded-lg border border-white/10">
              <div className="text-xs text-gray-500 mb-1">Initial Coherence</div>
              <div className="text-2xl font-bold" style={{ color: getCoherenceColor(params.initial_coherence) }}>
                {(params.initial_coherence * 100).toFixed(1)}%
              </div>
            </div>

            {/* Final coherence */}
            <div className="bg-black/30 p-4 rounded-lg border border-white/10">
              <div className="text-xs text-gray-500 mb-1">Projected Coherence</div>
              <div className="text-2xl font-bold" style={{ color: getCoherenceColor(finalCoherence) }}>
                {(finalCoherence * 100).toFixed(1)}%
              </div>
            </div>

            {/* Change */}
            <div className="bg-black/30 p-4 rounded-lg border border-white/10">
              <div className="text-xs text-gray-500 mb-1">Change</div>
              <div className={cn(
                "text-2xl font-bold flex items-center gap-1",
                coherenceChange > 0 ? "text-green-400" : coherenceChange < 0 ? "text-red-400" : "text-gray-400"
              )}>
                {coherenceChange > 0 ? <TrendingUp className="h-5 w-5" /> :
                 coherenceChange < 0 ? <TrendingDown className="h-5 w-5" /> :
                 <Minus className="h-5 w-5" />}
                {coherenceChange > 0 ? '+' : ''}{(coherenceChange * 100).toFixed(1)}%
              </div>
            </div>

            {/* Risk level */}
            <div className="bg-black/30 p-4 rounded-lg border border-white/10">
              <div className="text-xs text-gray-500 mb-1">Risk Level</div>
              <div
                className="text-2xl font-bold uppercase"
                style={{ color: getRiskLevelColor(finalRiskLevel) }}
              >
                {finalRiskLevel}
              </div>
            </div>
          </div>

          {/* Interpretation */}
          <div className="bg-black/30 p-4 rounded-lg border border-white/10">
            <h3 className="text-lg font-medium mb-3 text-white">Interpretation</h3>
            <div className="text-gray-300 space-y-2">
              {coherenceChange < -0.2 ? (
                <p>
                  <span className="text-red-400 font-medium">Significant decline projected.</span> The combination of
                  high suppression ({(params.suppression_level * 100).toFixed(0)}%) and fear factor
                  ({(params.fear_factor * 100).toFixed(0)}%) creates conditions where primordial coherence
                  degrades rapidly. This trajectory suggests systemic instability.
                </p>
              ) : coherenceChange < -0.1 ? (
                <p>
                  <span className="text-orange-400 font-medium">Moderate decline projected.</span> Current parameters
                  indicate gradual erosion of coherence. While not catastrophic, sustained conditions at
                  these levels will eventually reach critical thresholds.
                </p>
              ) : coherenceChange < 0 ? (
                <p>
                  <span className="text-yellow-400 font-medium">Slight decline projected.</span> The system shows
                  resilience but is not in equilibrium. Small adjustments to governance parameters could
                  stabilize or improve coherence.
                </p>
              ) : coherenceChange > 0.1 ? (
                <p>
                  <span className="text-green-400 font-medium">Recovery projected.</span> Low suppression and
                  fear factors allow natural coherence recovery mechanisms to function. This trajectory
                  suggests movement toward systemic stability.
                </p>
              ) : (
                <p>
                  <span className="text-blue-400 font-medium">Stable trajectory.</span> The system is near
                  equilibrium at current parameter levels. Coherence will neither significantly improve
                  nor degrade under these conditions.
                </p>
              )}

              <p className="text-sm text-gray-500 mt-4">
                {fullSimResults
                  ? "Results from full Laws of Existence simulation framework."
                  : "Preview approximation. Run full simulation for accurate projections."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationTab;
