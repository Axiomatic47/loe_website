// src/lib/simulationDataService.ts
// Service for fetching simulation data from local files and remote API

export interface SimulationRun {
  id: string;
  timestamp: string;
  type: 'mass' | 'data_driven' | 'country';
  country_code?: string;
  country_name?: string;
  parameters: {
    suppression_level?: number;
    fear_factor?: number;
    supremacist_ideology?: number;
    resource_scarcity?: number;
    identity_bias?: number;
    initial_coherence?: number;
  };
  results: {
    final_coherence: number;
    coherence_change?: number;
    min_coherence: number;
    max_coherence: number;
    collapsed: boolean;
    collapse_timestep?: number;
    trend: string;
    risk_level?: string;
  };
  coherence_history?: number[];
}

export interface MassSimulationSummary {
  timestamp: string;
  total_runs: number;
  successful_runs: number;
  mean_coherence_change: number;
  max_coherence_change: number;
  min_coherence_change: number;
  parameter_correlations: Record<string, number>;
  top_performers: string[];
  worst_performers: string[];
}

export interface CountrySimulation {
  country_code: string;
  country_name: string;
  latitude: number;
  longitude: number;
  governance_category: string;
  simulation: {
    initial_coherence: number;
    final_coherence: number;
    coherence_change: number;
    min_coherence: number;
    max_coherence: number;
    risk_level: string;
    trend: string;
    coherence_history?: number[];
  };
  parameters: {
    suppression_level: number;
    fear_factor: number;
    supremacist_ideology: number;
    resource_scarcity: number;
  };
}

// API endpoints
const SIMULATION_API_URL = import.meta.env.VITE_SIMULATION_API_URL || 'http://37.27.59.54:8000';
const LOCAL_DATA_PATH = '/simulation-data';

/**
 * Fetch list of available simulation runs
 */
export async function fetchSimulationRuns(): Promise<SimulationRun[]> {
  try {
    // Try to fetch from local data first
    const response = await fetch(`${LOCAL_DATA_PATH}/runs-index.json`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    if (import.meta.env.DEV) console.warn('Could not fetch local simulation runs:', error);
  }

  // Fallback to API if available
  if (SIMULATION_API_URL) {
    try {
      const response = await fetch(`${SIMULATION_API_URL}/api/simulations/runs`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      if (import.meta.env.DEV) console.warn('Could not fetch simulation runs from API:', error);
    }
  }

  return [];
}

/**
 * Fetch mass simulation summary
 */
export async function fetchMassSimulationSummary(batchId?: string): Promise<MassSimulationSummary | null> {
  try {
    const path = batchId
      ? `${LOCAL_DATA_PATH}/mass-simulations/${batchId}/summary.json`
      : `${LOCAL_DATA_PATH}/mass-simulations/latest/summary.json`;

    const response = await fetch(path);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    if (import.meta.env.DEV) console.warn('Could not fetch mass simulation summary:', error);
  }

  return null;
}

/**
 * Fetch all country simulation results
 */
export async function fetchCountrySimulations(): Promise<CountrySimulation[]> {
  try {
    // Try the main simulation results file
    const response = await fetch('/map-data/simulation_results.json');
    if (response.ok) {
      const data = await response.json();
      return data.results || [];
    }
  } catch (error) {
    if (import.meta.env.DEV) console.warn('Could not fetch country simulations:', error);
  }

  return [];
}

/**
 * Fetch detailed simulation data for a specific country
 */
export async function fetchCountryDetail(countryCode: string): Promise<CountrySimulation | null> {
  try {
    const response = await fetch(`/map-data/country_${countryCode.toLowerCase()}.json`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    if (import.meta.env.DEV) console.warn(`Could not fetch country detail for ${countryCode}:`, error);
  }

  return null;
}

/**
 * Fetch data-driven simulation results
 */
export async function fetchDataDrivenSimulations(): Promise<SimulationRun[]> {
  try {
    const response = await fetch(`${LOCAL_DATA_PATH}/data-driven/index.json`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    if (import.meta.env.DEV) console.warn('Could not fetch data-driven simulations:', error);
  }

  return [];
}

/**
 * Run a new simulation via the remote API
 */
export async function runSimulation(params: {
  country_code?: string;
  parameters: Record<string, number>;
  timesteps?: number;
}, authToken?: string): Promise<{ success: boolean; result?: SimulationRun; error?: string }> {
  if (!SIMULATION_API_URL) {
    return { success: false, error: 'Simulation API not configured' };
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${SIMULATION_API_URL}/api/simulate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(params)
    });

    if (response.ok) {
      const result = await response.json();
      return { success: true, result };
    } else {
      const error = await response.json();
      return { success: false, error: error.message || 'Simulation failed' };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

// =============================================================================
// API v3 - Historical Data & Run Management
// =============================================================================

export interface OutputsSummary {
  mass_simulations: Array<{
    batch_id: string;
    timestamp: string;
    samples: number;
    total_runs: number;
  }>;
  data_driven: Array<{
    id: string;
    country_code: string;
    country_name: string;
    final_coherence: number;
    timestamp: string;
  }>;
  website_export: string[];
  total_runs: number;
}

export interface DataDrivenSimulation {
  id: string;
  country_code: string;
  country_name: string;
  final_coherence: number;
  coherence_change: number;
  risk_level: string;
  trend: string;
  collapsed: boolean;
  data_source: string;
  governance_category: string;
  timestamp: string;
  parameters: Record<string, number>;
}

export interface SimulationStats {
  total_runs: number;
  data_driven_runs: number;
  mass_simulation_batches: number;
  countries_simulated: string[];
  unique_countries: number;
  risk_distribution: Record<string, number>;
  average_final_coherence: number;
  collapsed_count: number;
}

/**
 * Fetch outputs summary from API v3
 */
export async function fetchOutputsSummary(): Promise<OutputsSummary | null> {
  try {
    const response = await fetch(`${SIMULATION_API_URL}/api/v3/outputs/summary`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    if (import.meta.env.DEV) console.warn('Could not fetch outputs summary:', error);
  }
  return null;
}

/**
 * Fetch data-driven simulations from API v3
 */
export async function fetchDataDrivenSimulationsFromAPI(): Promise<DataDrivenSimulation[]> {
  try {
    const response = await fetch(`${SIMULATION_API_URL}/api/v3/outputs/data-driven`);
    if (response.ok) {
      const data = await response.json();
      return data.simulations || [];
    }
  } catch (error) {
    if (import.meta.env.DEV) console.warn('Could not fetch data-driven simulations:', error);
  }
  return [];
}

/**
 * Fetch simulation stats from API v3
 */
export async function fetchSimulationStatsFromAPI(): Promise<SimulationStats | null> {
  try {
    const response = await fetch(`${SIMULATION_API_URL}/api/v3/stats`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    if (import.meta.env.DEV) console.warn('Could not fetch simulation stats:', error);
  }
  return null;
}

/**
 * Fetch recent runs from API v3
 */
export async function fetchRecentRuns(limit: number = 50): Promise<any[]> {
  try {
    const response = await fetch(`${SIMULATION_API_URL}/api/v3/runs/recent?limit=${limit}`);
    if (response.ok) {
      const data = await response.json();
      return data.runs || [];
    }
  } catch (error) {
    if (import.meta.env.DEV) console.warn('Could not fetch recent runs:', error);
  }
  return [];
}

/**
 * Fetch mass simulation batch details
 */
export async function fetchMassSimulationBatch(batchId: string): Promise<any | null> {
  try {
    const response = await fetch(`${SIMULATION_API_URL}/api/v3/outputs/mass/${batchId}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    if (import.meta.env.DEV) console.warn(`Could not fetch mass simulation batch ${batchId}:`, error);
  }
  return null;
}

/**
 * Check API health
 */
export async function checkAPIHealth(): Promise<{ healthy: boolean; message: string }> {
  try {
    const response = await fetch(`${SIMULATION_API_URL}/api/health`, {
      signal: AbortSignal.timeout(5000)
    });
    if (response.ok) {
      const data = await response.json();
      return { healthy: true, message: data.status || 'healthy' };
    }
    return { healthy: false, message: `HTTP ${response.status}` };
  } catch (error) {
    return {
      healthy: false,
      message: error instanceof Error ? error.message : 'Connection failed'
    };
  }
}

/**
 * Get API info
 */
export async function getAPIInfo(): Promise<any | null> {
  try {
    const response = await fetch(`${SIMULATION_API_URL}/`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    if (import.meta.env.DEV) console.warn('Could not fetch API info:', error);
  }
  return null;
}

/**
 * Calculate statistics from simulation results
 */
export function calculateSimulationStats(simulations: CountrySimulation[]) {
  if (simulations.length === 0) return null;

  const coherenceChanges = simulations.map(s => s.simulation.coherence_change);
  const finalCoherences = simulations.map(s => s.simulation.final_coherence);

  const riskCounts = simulations.reduce((acc, s) => {
    const risk = s.simulation.risk_level || 'unknown';
    acc[risk] = (acc[risk] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const trendCounts = simulations.reduce((acc, s) => {
    const trend = s.simulation.trend || 'unknown';
    acc[trend] = (acc[trend] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const governanceCounts = simulations.reduce((acc, s) => {
    const gov = s.governance_category || 'unknown';
    acc[gov] = (acc[gov] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: simulations.length,
    meanCoherenceChange: coherenceChanges.reduce((a, b) => a + b, 0) / coherenceChanges.length,
    meanFinalCoherence: finalCoherences.reduce((a, b) => a + b, 0) / finalCoherences.length,
    minFinalCoherence: Math.min(...finalCoherences),
    maxFinalCoherence: Math.max(...finalCoherences),
    riskDistribution: riskCounts,
    trendDistribution: trendCounts,
    governanceDistribution: governanceCounts,
    collapsedCount: simulations.filter(s => s.simulation.final_coherence < 0.25).length
  };
}
