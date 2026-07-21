// src/components/worldmap/GlobalTrendsTab.tsx
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

// Helper function for styling
const getColorClass = (score) => {
  if (score <= 2) return "bg-blue-500";
  if (score <= 4) return "bg-green-500";
  if (score <= 6) return "bg-yellow-500";
  if (score <= 8) return "bg-orange-500";
  return "bg-red-500";
};

// Region mapping for countries
const COUNTRY_REGIONS = {
  // North America
  US: 'North America', CA: 'North America', MX: 'North America',
  // Europe
  GB: 'Europe', DE: 'Europe', FR: 'Europe', SE: 'Europe', NO: 'Europe',
  PL: 'Europe', HU: 'Europe', RU: 'Europe', UA: 'Europe', TR: 'Europe',
  // Asia
  CN: 'Asia', JP: 'Asia', KR: 'Asia', KP: 'Asia', TW: 'Asia',
  IN: 'Asia', PK: 'Asia', AF: 'Asia', IR: 'Asia', IL: 'Asia',
  PS: 'Asia', SY: 'Asia', YE: 'Asia', SA: 'Asia', MM: 'Asia',
  // Africa
  ZA: 'Africa', EG: 'Africa', NG: 'Africa', ET: 'Africa', SD: 'Africa',
  // South America
  BR: 'South America', CO: 'South America', VE: 'South America',
  // Oceania
  AU: 'Oceania'
};

// Calculate regional data from actual countries
const calculateRegionalData = (countries) => {
  if (!countries || countries.length === 0) return [];

  // Group countries by region
  const regionGroups: Record<string, any[]> = {};

  for (const country of countries) {
    const region = COUNTRY_REGIONS[country.code] || 'Other';
    if (!regionGroups[region]) {
      regionGroups[region] = [];
    }
    regionGroups[region].push(country);
  }

  // Calculate stats for each region
  return Object.entries(regionGroups).map(([region, regionCountries]) => {
    const sgmValues = regionCountries.map(c => c.sgm || c.gscs || 5);
    const avg_sgm = sgmValues.reduce((sum, v) => sum + v, 0) / sgmValues.length;

    // Find highest and lowest
    let highest = regionCountries[0];
    let lowest = regionCountries[0];

    for (const c of regionCountries) {
      const score = c.sgm || c.gscs || 5;
      if (score > (highest.sgm || highest.gscs || 5)) highest = c;
      if (score < (lowest.sgm || lowest.gscs || 5)) lowest = c;
    }

    return {
      region,
      avg_sgm,
      countries: regionCountries.length,
      highest_country: highest.country || highest.name,
      highest_sgm: highest.sgm || highest.gscs || 5,
      lowest_country: lowest.country || lowest.name,
      lowest_sgm: lowest.sgm || lowest.gscs || 5
    };
  }).sort((a, b) => b.avg_sgm - a.avg_sgm); // Sort by highest avg SGM first
};

// Helper function to calculate category distributions
const getCategoryDistribution = (countries) => {
  // Count countries by category
  const categoryCounts = countries.reduce((acc, country) => {
    const category = country.category || "Unknown";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate total for percentages
  const total = Number(Object.values(categoryCounts).reduce((sum: number, count) => sum + Number(count), 0));

  // Map categories to format needed for display
  return Object.entries(categoryCounts).map(([category, count]) => {
    const percentage = ((Number(count) / total) * 100).toFixed(1);
    const colorClass =
      category.includes("Non-Supremacist") ? "bg-blue-500" :
      category.includes("Mixed") ? "bg-green-500" :
      category.includes("Soft") ? "bg-yellow-500" :
      category.includes("Structural") ? "bg-orange-500" :
      "bg-red-500";

    return {
      category,
      count: Number(count),
      percentage,
      colorClass
    };
  });
};

// Helper function to get event type distributions
const getEventTypeDistribution = (events) => {
  // Get event types counts
  const typeCounts = events.reduce((acc, event) => {
    const type = event.event_type || "Unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate total
  const total = Number(Object.values(typeCounts).reduce((sum: number, count) => sum + Number(count), 0));

  // Convert to array and sort by count
  const typeArray = Object.entries(typeCounts)
    .map(([type, count]) => ({
      type,
      count: Number(count),
      percentage: ((Number(count) / total) * 100).toFixed(1)
    }))
    .sort((a, b) => b.count - a.count);

  // Limit to top 5 types for display
  return typeArray.slice(0, 5);
};

interface GlobalTrendsTabProps {
  countries: any[];
  events: any[];
  regionalData: any[];
  isLoading: boolean;
}

const GlobalTrendsTab: React.FC<GlobalTrendsTabProps> = ({
  countries,
  events,
  regionalData,
  isLoading
}) => {
  return (
    <div className="space-y-6">
      {/* Global thermodynamic analysis section */}
      <div className="bg-card/60 p-6 rounded-lg border border-border">
        <h2 className="text-2xl text-foreground mb-4">Global Thermodynamic Analysis</h2>
        <p className="text-muted-foreground mb-4">
          Track worldwide thermodynamic-like patterns in the flow between supremacism and egalitarianism
          according to the Supremacist-Egalitarianism Methodology.
        </p>

        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div className="h-64 bg-card/80 rounded border border-border flex items-center justify-center">
            <span className="text-muted-foreground/80">Thermodynamic trend chart visualization coming soon</span>
          </div>
        )}
      </div>

      {/* Regional charts section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Regional comparison chart */}
        <div className="bg-card/60 p-4 rounded-lg border border-border h-full">
          <h3 className="text-lg font-medium mb-3 text-foreground">Regional Comparison</h3>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="h-64 bg-card/80 rounded border border-border p-4">
              <div className="space-y-4">
                {(regionalData.length > 0 ? regionalData : calculateRegionalData(countries)).map(region => (
                  <div key={region.region}>
                    <div className="flex justify-between text-sm text-muted-foreground/80 mb-1">
                      <span>{region.region}</span>
                      <span>{region.avg_sgm.toFixed(1)}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={getColorClass(region.avg_sgm) + " h-2 rounded-full"}
                        style={{ width: `${(region.avg_sgm / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Category distribution chart */}
        <div className="bg-card/60 p-4 rounded-lg border border-border h-full">
          <h3 className="text-lg font-medium mb-3 text-foreground">Global Category Distribution</h3>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {getCategoryDistribution(countries).map(({ category, count, percentage, colorClass }) => (
                <div key={category}>
                  <div className="flex justify-between text-sm text-muted-foreground/80 mb-1">
                    <span>{category}</span>
                    <span>{count} countries ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className={`${colorClass} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Event statistics section */}
      <div className="bg-card/60 p-6 rounded-lg border border-border">
        <h2 className="text-2xl text-foreground mb-4">Conflict Event Patterns</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Event sources chart */}
          <div className="bg-card/80 p-4 rounded-lg border border-border">
            <h3 className="text-lg font-medium mb-3 text-foreground">Event Sources</h3>

            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="h-64 bg-card rounded border border-border p-4 flex flex-col justify-center">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-muted-foreground/80 mb-1">
                      <span>GDELT Events</span>
                      <span>{events.filter(e => e.data_source === 'GDELT').length} events</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{
                        width: `${(events.filter(e => e.data_source === 'GDELT').length / Math.max(events.length, 1)) * 100}%`
                      }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm text-muted-foreground/80 mb-1">
                      <span>ACLED Events</span>
                      <span>{events.filter(e => e.data_source === 'ACLED').length} events</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{
                        width: `${(events.filter(e => e.data_source === 'ACLED').length / Math.max(events.length, 1)) * 100}%`
                      }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Event type distribution */}
          <div className="bg-card/80 p-4 rounded-lg border border-border">
            <h3 className="text-lg font-medium mb-3 text-foreground">Event Type Distribution</h3>

            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="h-64 bg-card rounded border border-border p-4 flex flex-col justify-center">
                {getEventTypeDistribution(events).map(({ type, count, percentage }) => (
                  <div key={type} className="mb-3">
                    <div className="flex justify-between text-sm text-muted-foreground/80 mb-1">
                      <span>{type}</span>
                      <span>{count} events ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalTrendsTab;