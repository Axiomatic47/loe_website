// src/components/worldmap/WorldMapTab.tsx
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Activity } from "lucide-react";
import LeafletHeatMap from "@/components/LeafletHeatMap";
import { fetchSimulationResults, SimulationResultsData, getRiskLevelColor } from "@/lib/gdeltApi";

interface TimelineData {
  generated_at: string;
  months: string[];
  countries: {
    [key: string]: {
      name: string;
      timeline: Array<{
        month: string;
        sgm: number | null;
        events: number;
        conflict_events: number;
        goldstein: number | null;
        conflict_ratio: number | null;
        violence_events: number;
        protest_events: number;
      }>;
    };
  };
}

interface WorldMapTabProps {
  countries: any[];
  events: any[];
  onSelectCountry: (country: any) => void;
  onSelectEvent: (event: any) => void;
  isLoading: boolean;
  isGdeltAnalysisRunning: boolean;
  isAcledFetchRunning: boolean;
  showGDELT: boolean;
  showACLED: boolean;
  showUCDP: boolean;
  showCountries: boolean;
  onRequestFullData?: () => void;
  hasFullData?: boolean;
}

const WorldMapTab: React.FC<WorldMapTabProps> = ({
  countries,
  events,
  onSelectCountry,
  onSelectEvent,
  isLoading,
  isGdeltAnalysisRunning,
  isAcledFetchRunning,
  showGDELT,
  showACLED,
  showUCDP,
  showCountries,
  onRequestFullData,
  hasFullData
}) => {
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [timelineError, setTimelineError] = useState<string | null>(null);
  const [simulationData, setSimulationData] = useState<SimulationResultsData | null>(null);

  // Load timeline data and simulation results on mount
  useEffect(() => {
    const loadTimelineData = async () => {
      try {
        const response = await fetch('/map-data/timeline_data.json');
        if (!response.ok) {
          throw new Error('Timeline data not available');
        }
        const data = await response.json();
        setTimelineData(data);
        console.log('Timeline data loaded:', data.months?.length, 'months');
      } catch (err) {
        console.warn('Could not load timeline data:', err);
        setTimelineError(err instanceof Error ? err.message : 'Failed to load timeline');
        // Don't block the map from showing - timeline is optional
      }
    };

    const loadSimulationData = async () => {
      try {
        const data = await fetchSimulationResults();
        if (data) {
          setSimulationData(data);
          console.log('🔬 Simulation data loaded:', data.total_countries, 'countries');
        }
      } catch (err) {
        console.warn('Could not load simulation data:', err);
      }
    };

    loadTimelineData();
    loadSimulationData();
  }, []);

  return (
    <>
      <LeafletHeatMap
        countries={countries}
        events={events}
        timelineData={timelineData}
        simulationData={simulationData}
        onSelectCountry={onSelectCountry}
        onSelectEvent={onSelectEvent}
        isLoading={isLoading || isGdeltAnalysisRunning || isAcledFetchRunning}
        showGDELT={showGDELT}
        showACLED={showACLED}
        showUCDP={showUCDP}
        showCountries={showCountries}
        onRequestFullData={onRequestFullData}
        hasFullData={hasFullData}
      />

      {/* Legend and explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <div className="bg-black/30 p-4 rounded-lg border border-white/10">
          <h3 className="text-lg font-medium mb-2 text-white">Supremacism-Egalitarianism Spectrum</h3>
          <div className="mb-4">
            <div className="h-6 w-full rounded-md"
                  style={{background: 'linear-gradient(to right, #3b82f6, #22c55e, #eab308, #f97316, #ef4444)'}}></div>
            <div className="flex justify-between mt-1 text-xs text-gray-300">
              <span>0 (Strong Egalitarianism)</span>
              <span>5 (Neutral)</span>
              <span>10 (Strong Supremacism)</span>
            </div>
          </div>
          <p className="text-sm text-gray-300 mt-2">
            This visualization demonstrates how supremacist and egalitarian forces behave analogously to
            thermodynamic principles, with surges and flows between regions.
          </p>
        </div>

        <div className="bg-black/30 p-4 rounded-lg border border-white/10">
          <h3 className="text-lg font-medium mb-2 text-white">Data Sources</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-1">Countries</h4>
              <ul className="text-gray-400 text-xs space-y-1">
                <li>• GDELT BigQuery Event Data</li>
                <li>• Goldstein Scale Analysis</li>
                <li>• 12 Months Historical Data</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-1">Events</h4>
              <ul className="text-gray-400 text-xs space-y-1">
                <li>• UCDP GED Conflict Data (purple)</li>
                <li>• GDELT Conflict Events (orange)</li>
                <li>• ACLED Armed Conflict Data (red)</li>
              </ul>
            </div>
          </div>
          {timelineData && (
            <p className="text-xs text-gray-500 mt-3">
              Timeline: {timelineData.months[0]} to {timelineData.months[timelineData.months.length - 1]}
            </p>
          )}
        </div>
      </div>

      {/* Simulation Results Summary */}
      {simulationData && simulationData.results.length > 0 && (
        <div className="bg-black/30 p-4 rounded-lg border border-white/10 mt-4">
          <h3 className="text-lg font-medium mb-3 text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-400" />
            Laws of Existence Simulation Results
          </h3>
          <p className="text-sm text-gray-300 mb-4">
            Real-world conflict data processed through the recursive simulation framework.
            Shows how supremacist governance affects primordial coherence.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {simulationData.results
              .sort((a, b) => a.simulation.final_coherence - b.simulation.final_coherence)
              .slice(0, 10)
              .map((result) => (
                <div
                  key={result.country_code}
                  className="bg-black/40 p-3 rounded-lg border border-white/5 hover:border-white/20 transition-colors"
                >
                  <div className="text-sm font-medium text-white truncate" title={result.country_code}>
                    {result.country_code}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-400">Coherence:</span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: getRiskLevelColor(result.simulation.risk_level) }}
                    >
                      {(result.simulation.final_coherence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Risk:</span>
                    <span
                      className="text-xs font-medium uppercase"
                      style={{ color: getRiskLevelColor(result.simulation.risk_level) }}
                    >
                      {result.simulation.risk_level}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {result.source_data.event_count.toLocaleString()} events
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing top 10 most affected countries of {simulationData.total_countries} simulated
            </span>
            <span>
              Generated: {new Date(simulationData.generated_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}

      {/* SGM Calculation Methodology */}
      <div className="bg-black/30 p-4 rounded-lg border border-white/10 mt-4">
        <h3 className="text-lg font-medium mb-3 text-white">How SGM Scores Are Calculated</h3>
        <p className="text-sm text-gray-300 mb-4">
          The Supremacism Governance Model (SGM) score is derived from GDELT's global event database.
          Click any country on the map to see its detailed metrics for the selected month.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-black/40 p-3 rounded-lg">
            <h4 className="text-white font-medium mb-1">Goldstein Scale</h4>
            <p className="text-gray-400">
              Ranges from -10 (extreme conflict) to +10 (extreme cooperation).
              Negative values indicate conflict-dominant events.
            </p>
          </div>
          <div className="bg-black/40 p-3 rounded-lg">
            <h4 className="text-white font-medium mb-1">Conflict Ratio</h4>
            <p className="text-gray-400">
              Percentage of events classified as conflict (QuadClass 3 or 4).
              Higher ratios indicate more adversarial conditions.
            </p>
          </div>
          <div className="bg-black/40 p-3 rounded-lg">
            <h4 className="text-white font-medium mb-1">Violence Events</h4>
            <p className="text-gray-400">
              Events coded as assault, fight, or use of military force (CAMEO codes 18, 19, 20).
              Direct indicators of physical conflict.
            </p>
          </div>
          <div className="bg-black/40 p-3 rounded-lg">
            <h4 className="text-white font-medium mb-1">Protest Events</h4>
            <p className="text-gray-400">
              Events coded as protests or demonstrations (CAMEO code 14).
              Indicates social tension and citizen mobilization.
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          SGM = (Goldstein Factor × 3.0) + (Conflict Ratio × 2.5) + (Violence Factor × 2.0) + (Protest Factor × 1.5) - (Cooperation Offset)
        </p>
      </div>
    </>
  );
};

export default WorldMapTab;
