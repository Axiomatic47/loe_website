// src/components/worldmap/CountryAnalysisTab.tsx
import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

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

// Helper functions for styling and data processing
const getColorClass = (score) => {
  if (score <= 2) return "bg-blue-500";
  if (score <= 4) return "bg-green-500";
  if (score <= 6) return "bg-yellow-500";
  if (score <= 8) return "bg-orange-500";
  return "bg-red-500";
};

const getTextColor = (score) => {
  if (score <= 2) return "text-blue-400";
  if (score <= 4) return "text-green-400";
  if (score <= 6) return "text-yellow-400";
  if (score <= 8) return "text-orange-400";
  return "text-red-400";
};

const getCategoryFromSGM = (sgm: number) => {
  if (sgm <= 2) return { label: "Strong Egalitarianism", color: "text-blue-400" };
  if (sgm <= 4) return { label: "Mixed Governance", color: "text-green-400" };
  if (sgm <= 6) return { label: "Soft Supremacism", color: "text-yellow-400" };
  if (sgm <= 8) return { label: "Structural Supremacism", color: "text-orange-400" };
  return { label: "Extreme Supremacism", color: "text-red-400" };
};

// Helper functions for STI (Stability & Transition Index)
const getSTILabel = (score) => {
  if (score <= 20) return "Rapid Transition";
  if (score <= 40) return "Moderate Transition";
  if (score <= 60) return "Partial Transition";
  if (score <= 80) return "Enduring Supremacism";
  return "Supremacist Persistence";
};

const getSTIColorClass = (score) => {
  if (score <= 20) return "bg-blue-500";
  if (score <= 40) return "bg-green-500";
  if (score <= 60) return "bg-yellow-500";
  if (score <= 80) return "bg-orange-500";
  return "bg-red-500";
};

// Country list component for the sidebar
const CountryList = ({
  countries,
  onSelect,
  selectedCountry,
  isLoading,
  timelineData
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "sgm">("sgm");

  // Filter countries based on search term
  const filteredCountries = countries
    .filter(country =>
      (country.name || country.country || "").toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") {
        return (a.name || a.country || "").localeCompare(b.name || b.country || "");
      }
      return (b.gscs || b.sgm || 0) - (a.gscs || a.sgm || 0);
    });

  if (isLoading) {
    return (
      <div className="bg-black/30 p-4 rounded-lg border border-white/10 h-96 overflow-y-auto mt-4">
        <div className="sticky top-0 bg-black/70 p-2 -m-2 mb-2 backdrop-blur-sm border-b border-white/10">
          <Skeleton className="w-full h-10" />
        </div>
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="w-full h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/30 p-4 rounded-lg border border-white/10 h-[600px] overflow-y-auto mt-4">
      <div className="sticky top-0 bg-black/70 p-2 -m-2 mb-2 backdrop-blur-sm border-b border-white/10 space-y-2">
        <input
          type="text"
          placeholder="Search countries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-black/50 text-white border border-white/20 rounded p-2 text-sm"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy("sgm")}
            className={cn(
              "flex-1 text-xs py-1 px-2 rounded",
              sortBy === "sgm" ? "bg-white/20 text-white" : "bg-black/30 text-gray-400"
            )}
          >
            Sort by SGM
          </button>
          <button
            onClick={() => setSortBy("name")}
            className={cn(
              "flex-1 text-xs py-1 px-2 rounded",
              sortBy === "name" ? "bg-white/20 text-white" : "bg-black/30 text-gray-400"
            )}
          >
            Sort by Name
          </button>
        </div>
      </div>
      <div className="space-y-2 pt-2">
        {filteredCountries.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No countries match your search
          </div>
        )}
        {filteredCountries.map(country => {
          // Get trend from timeline data
          const countryTimeline = timelineData?.countries?.[country.code]?.timeline;
          let trend = null;
          if (countryTimeline && countryTimeline.length >= 2) {
            const recent = countryTimeline[countryTimeline.length - 1]?.sgm;
            const previous = countryTimeline[countryTimeline.length - 2]?.sgm;
            if (recent !== null && previous !== null) {
              trend = recent - previous;
            }
          }

          return (
            <div
              key={country.code}
              onClick={() => onSelect(country)}
              className={cn(
                "p-2 rounded cursor-pointer border transition-colors",
                selectedCountry?.code === country.code
                  ? "bg-white/20 border-white/30"
                  : "bg-black/40 hover:bg-black/60 border-white/10"
              )}
            >
              <div className="flex justify-between items-center">
                <span className="text-white">{country.name || country.country}</span>
                <div className="flex items-center gap-2">
                  {trend !== null && (
                    <span className="text-xs">
                      {trend > 0.1 ? (
                        <TrendingUp className="h-3 w-3 text-red-400" />
                      ) : trend < -0.1 ? (
                        <TrendingDown className="h-3 w-3 text-green-400" />
                      ) : (
                        <Minus className="h-3 w-3 text-gray-400" />
                      )}
                    </span>
                  )}
                  <span className={`${getColorClass(country.gscs || country.sgm)} px-2 rounded text-sm text-white`}>
                    {(country.gscs || country.sgm).toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-400">{country.category}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Country detail component
const CountryDetail = ({
  country,
  isLoading,
  timelineData
}) => {
  if (isLoading) {
    return (
      <div className="bg-black/40 p-6 rounded-lg border border-white/10 mt-4">
        <Skeleton className="h-8 w-2/3 mb-4" />
        <div className="space-y-6">
          <div>
            <Skeleton className="h-6 w-1/3 mb-2" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          </div>
          <div>
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-16" />
          </div>
          <div>
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!country) return (
    <div className="bg-black/40 p-6 rounded-lg border border-white/10 mt-4 text-center py-12">
      <p className="text-gray-300">Select a country to view detailed analysis</p>
    </div>
  );

  // Get timeline data for this country
  const countryCode = country.code?.toUpperCase();
  const countryTimeline = timelineData?.countries?.[countryCode]?.timeline || [];
  const latestMonth = countryTimeline[countryTimeline.length - 1];
  const previousMonth = countryTimeline[countryTimeline.length - 2];

  // Calculate trends
  const sgmTrend = latestMonth?.sgm && previousMonth?.sgm
    ? latestMonth.sgm - previousMonth.sgm
    : null;

  // Get category
  const sgmScore = latestMonth?.sgm || country.gscs || country.sgm || 5;
  const { label: categoryLabel, color: categoryColor } = getCategoryFromSGM(sgmScore);

  return (
    <div className="bg-black/40 p-6 rounded-lg border border-white/10 mt-4 space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-medium text-white mb-1">{country.name || country.country}</h3>
        <p className={`text-sm ${categoryColor}`}>{categoryLabel}</p>
      </div>

      {/* SGM Overview */}
      <div>
        <h4 className="text-lg text-white mb-3">Supremacism Governance Model (SGM)</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/30 p-3 rounded">
            <div className="text-sm text-gray-400">Current SGM</div>
            <div className={`text-2xl font-bold ${getTextColor(sgmScore)}`}>
              {sgmScore.toFixed(2)}
            </div>
            {sgmTrend !== null && (
              <div className={`text-xs flex items-center gap-1 mt-1 ${sgmTrend > 0 ? 'text-red-400' : sgmTrend < 0 ? 'text-green-400' : 'text-gray-400'}`}>
                {sgmTrend > 0 ? <TrendingUp className="h-3 w-3" /> : sgmTrend < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                {sgmTrend > 0 ? '+' : ''}{sgmTrend.toFixed(2)} vs last month
              </div>
            )}
          </div>
          <div className="bg-black/30 p-3 rounded">
            <div className="text-sm text-gray-400">Domestic (SRS-D)</div>
            <div className={`text-xl font-medium ${getTextColor(country.srsD || 0)}`}>
              {country.srsD?.toFixed(1) || "N/A"}
            </div>
          </div>
          <div className="bg-black/30 p-3 rounded">
            <div className="text-sm text-gray-400">International (SRS-I)</div>
            <div className={`text-xl font-medium ${getTextColor(country.srsI || 0)}`}>
              {country.srsI?.toFixed(1) || "N/A"}
            </div>
          </div>
          <div className="bg-black/30 p-3 rounded">
            <div className="text-sm text-gray-400">GSCS</div>
            <div className={`text-xl font-medium ${getTextColor(country.gscs || country.sgm)}`}>
              {(country.gscs || country.sgm).toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      {/* GDELT Metrics - Latest Month */}
      {latestMonth && (
        <div>
          <h4 className="text-lg text-white mb-3">
            GDELT Analysis ({latestMonth.month})
            <span className="text-xs text-gray-500 ml-2">Source: GDELT BigQuery</span>
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-black/30 p-3 rounded">
              <div className="text-sm text-gray-400">Goldstein Scale</div>
              <div className={`text-xl font-medium ${latestMonth.goldstein && latestMonth.goldstein < 0 ? 'text-orange-400' : 'text-green-400'}`}>
                {latestMonth.goldstein?.toFixed(2) || "N/A"}
              </div>
              <div className="text-xs text-gray-500">-10 (conflict) to +10 (cooperation)</div>
            </div>
            <div className="bg-black/30 p-3 rounded">
              <div className="text-sm text-gray-400">Total Events</div>
              <div className="text-xl font-medium text-white">
                {latestMonth.events?.toLocaleString() || 0}
              </div>
              <div className="text-xs text-gray-500">GDELT coded events</div>
            </div>
            <div className="bg-black/30 p-3 rounded">
              <div className="text-sm text-gray-400">Conflict Ratio</div>
              <div className="text-xl font-medium text-yellow-400">
                {latestMonth.conflict_ratio ? (latestMonth.conflict_ratio * 100).toFixed(1) + '%' : 'N/A'}
              </div>
              <div className="text-xs text-gray-500">% of adversarial events</div>
            </div>
            <div className="bg-black/30 p-3 rounded">
              <div className="text-sm text-gray-400">Conflict Events</div>
              <div className="text-xl font-medium text-orange-400">
                {latestMonth.conflict_events?.toLocaleString() || 0}
              </div>
              <div className="text-xs text-gray-500">QuadClass 3 & 4</div>
            </div>
            <div className="bg-black/30 p-3 rounded">
              <div className="text-sm text-gray-400">Violence Events</div>
              <div className="text-xl font-medium text-red-400">
                {latestMonth.violence_events?.toLocaleString() || 0}
              </div>
              <div className="text-xs text-gray-500">CAMEO 18, 19, 20</div>
            </div>
            <div className="bg-black/30 p-3 rounded">
              <div className="text-sm text-gray-400">Protest Events</div>
              <div className="text-xl font-medium text-purple-400">
                {latestMonth.protest_events?.toLocaleString() || 0}
              </div>
              <div className="text-xs text-gray-500">CAMEO 14</div>
            </div>
          </div>
        </div>
      )}

      {/* Historical Trend Table */}
      {countryTimeline.length > 0 && (
        <div>
          <h4 className="text-lg text-white mb-3">12-Month Historical Data</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-white/10">
                  <th className="text-left py-2 px-2">Month</th>
                  <th className="text-right py-2 px-2">SGM</th>
                  <th className="text-right py-2 px-2">Goldstein</th>
                  <th className="text-right py-2 px-2">Events</th>
                  <th className="text-right py-2 px-2">Conflicts</th>
                  <th className="text-right py-2 px-2">Violence</th>
                  <th className="text-right py-2 px-2">Protests</th>
                </tr>
              </thead>
              <tbody>
                {countryTimeline.slice().reverse().map((month, idx) => (
                  <tr key={month.month} className={cn(
                    "border-b border-white/5",
                    idx === 0 ? "bg-white/5" : "hover:bg-white/5"
                  )}>
                    <td className="py-2 px-2 text-white">
                      {month.month}
                      {idx === 0 && <span className="text-xs text-gray-500 ml-1">(latest)</span>}
                    </td>
                    <td className={`py-2 px-2 text-right font-mono ${getTextColor(month.sgm || 5)}`}>
                      {month.sgm?.toFixed(2) || 'N/A'}
                    </td>
                    <td className={`py-2 px-2 text-right font-mono ${month.goldstein && month.goldstein < 0 ? 'text-orange-400' : 'text-green-400'}`}>
                      {month.goldstein?.toFixed(2) || 'N/A'}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-gray-300">
                      {month.events?.toLocaleString() || 0}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-orange-400">
                      {month.conflict_events?.toLocaleString() || 0}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-red-400">
                      {month.violence_events?.toLocaleString() || 0}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-purple-400">
                      {month.protest_events?.toLocaleString() || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STI Index */}
      {country.sti !== undefined && (
        <div>
          <h4 className="text-lg text-white mb-2">Stability & Transition Index</h4>
          <div className="bg-black/30 p-3 rounded">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-400">STI Score: {country.sti}</span>
              <span className="text-sm text-gray-400">{getSTILabel(country.sti)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`${getSTIColorClass(country.sti)} h-2 rounded-full`}
                style={{ width: `${country.sti}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Description / Analysis */}
      <div>
        <h4 className="text-lg text-white mb-2">Analysis Summary</h4>
        <div className="bg-black/30 p-4 rounded">
          <p className="text-gray-300">
            {country.description || `${country.name || country.country} has an SGM score of ${sgmScore.toFixed(2)}, placing it in the "${categoryLabel}" category. This assessment is based on GDELT global event data analysis.`}
          </p>
          {latestMonth && (
            <p className="text-gray-400 text-sm mt-3">
              In {latestMonth.month}, there were {latestMonth.events?.toLocaleString()} recorded events,
              with {latestMonth.conflict_events?.toLocaleString()} classified as conflict events
              ({latestMonth.conflict_ratio ? (latestMonth.conflict_ratio * 100).toFixed(1) : 0}% conflict ratio).
              The average Goldstein scale was {latestMonth.goldstein?.toFixed(2)}, indicating
              {latestMonth.goldstein && latestMonth.goldstein < -2 ? ' significant conflict activity' :
               latestMonth.goldstein && latestMonth.goldstein < 0 ? ' moderate tension' :
               latestMonth.goldstein && latestMonth.goldstein < 2 ? ' relative stability' : ' cooperative conditions'}.
            </p>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="text-xs text-gray-500 pt-4 border-t border-white/10">
        <div className="flex justify-between">
          <span>Country Code: {country.code}</span>
          {country.updated_at && (
            <span>Last updated: {new Date(country.updated_at).toLocaleString()}</span>
          )}
        </div>
        {timelineData?.generated_at && (
          <div className="mt-1">Timeline data generated: {new Date(timelineData.generated_at).toLocaleString()}</div>
        )}
      </div>
    </div>
  );
};

interface CountryAnalysisTabProps {
  countries: any[];
  selectedCountry: any;
  setSelectedCountry: (country: any) => void;
  isLoading: boolean;
}

const CountryAnalysisTab: React.FC<CountryAnalysisTabProps> = ({
  countries,
  selectedCountry,
  setSelectedCountry,
  isLoading
}) => {
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);

  // Load timeline data
  useEffect(() => {
    const loadTimelineData = async () => {
      try {
        const response = await fetch('/map-data/timeline_data.json');
        if (response.ok) {
          const data = await response.json();
          setTimelineData(data);
        }
      } catch (err) {
        console.warn('Could not load timeline data for analysis:', err);
      }
    };
    loadTimelineData();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <h2 className="text-xl text-white mb-2">Countries ({countries.length})</h2>
        <CountryList
          countries={countries}
          onSelect={setSelectedCountry}
          selectedCountry={selectedCountry}
          isLoading={isLoading}
          timelineData={timelineData}
        />
      </div>
      <div className="md:col-span-2">
        <h2 className="text-xl text-white mb-2">Detailed Analysis</h2>
        <CountryDetail
          country={selectedCountry}
          isLoading={isLoading}
          timelineData={timelineData}
        />
      </div>
    </div>
  );
};

export default CountryAnalysisTab;
