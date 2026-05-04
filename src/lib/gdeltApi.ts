/**
 * Unified API Client for Supremacism Analysis
 *
 * This module provides functions to interact with the FastAPI backend
 * to fetch both GDELT and ACLED data for conflict visualization.
 *
 * Also supports loading from static JSON files exported by Laws of Existence simulations.
 */

// Base API URL - Use environment variables or fallback to development URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4041';

/**
 * Load country data from static map files in public/map-data/
 * @returns {Promise<Array>} Array of country data from static files
 */
async function loadStaticMapData(): Promise<any[]> {
  const countries: any[] = [];

  try {
    // Fetch the list of map data files from the public directory
    // All 37 countries from sample_countries.json
    const knownCountryCodes = [
      'us', 'cn', 'ru', 'ua', 'sy', 'ye', 'af', 'ir', 'il', 'ps',
      'mm', 'sd', 'et', 'ng', 'pk', 'se', 'no', 'de', 'gb', 'fr',
      'in', 'br', 'za', 'jp', 'kr', 'kp', 'tw', 'au', 'ca', 'mx',
      've', 'co', 'sa', 'eg', 'tr', 'pl', 'hu'
    ];

    if (import.meta.env.DEV) console.log('📁 Attempting to load static map files from /map-data/');

    for (const code of knownCountryCodes) {
      try {
        const response = await fetch(`/map-data/country_${code}.json`);
        if (!response.ok) continue;

        const mapData = await response.json();

        // Skip if not valid
        if (!mapData || !mapData.country_code) continue;

        // Transform to expected format
        // Calculate derived scores from simulation metrics
        const simCoherence = mapData.metrics?.sim_coherence;
        const simSuppression = mapData.metrics?.sim_suppression;
        const simFear = mapData.metrics?.sim_fear_factor;

        // SGM: Use stored value or calculate from coherence (lower coherence = higher supremacism)
        const sgmScore = mapData.metrics?.sgm !== undefined ? mapData.metrics.sgm :
          (simCoherence !== undefined ? Math.max(0, (1 - simCoherence) * 10) : 5);

        // GSCS: Use stored value or calculate from suppression
        const gscsScore = mapData.metrics?.gscs !== undefined ? mapData.metrics.gscs :
          (simSuppression !== undefined ? simSuppression * 10 : sgmScore);

        // SRS-D (Domestic): Derived from suppression level (internal control)
        // Higher suppression = higher domestic supremacist risk
        const srsDScore = mapData.metrics?.srsD !== undefined ? mapData.metrics.srsD :
          (simSuppression !== undefined ?
            Math.round((simSuppression * 8 + (1 - (simCoherence || 0.5)) * 2) * 10) / 10 :
            sgmScore * 0.9);

        // SRS-I (International): Derived from fear factor (external aggression/expansion)
        // Higher fear = higher international supremacist risk
        const srsIScore = mapData.metrics?.srsI !== undefined ? mapData.metrics.srsI :
          (simFear !== undefined ?
            Math.round((simFear * 7 + simSuppression * 3) * 10) / 10 :
            sgmScore * 1.1);

        const country = {
          code: mapData.country_code,
          country: mapData.country_name,
          latitude: parseFloat(mapData.latitude) || 0,
          longitude: parseFloat(mapData.longitude) || 0,
          category: mapData.category || 'Unknown',
          description: mapData.description || '',
          updated_at: mapData.updated_at || new Date().toISOString(),
          // Calculated scores
          sgm: sgmScore,
          gscs: gscsScore,
          srsD: Math.min(10, Math.max(0, srsDScore)),
          srsI: Math.min(10, Math.max(0, srsIScore)),
          sti: mapData.metrics?.sti || 50,
          // Include raw simulation metrics
          sim_coherence: simCoherence,
          sim_fear_factor: simFear,
          sim_suppression: simSuppression,
          simulation_source: mapData.simulation_source
        };

        countries.push(country);
        if (import.meta.env.DEV) console.log(`✅ Loaded country from static file: ${country.country} (${country.code})`);
      } catch (err) {
        // File doesn't exist or failed to load - skip silently
      }
    }
  } catch (error) {
    if (import.meta.env.DEV) console.error('❌ Error loading static map files:', error);
  }

  if (import.meta.env.DEV) console.log(`📊 Loaded ${countries.length} countries from static files`);
  return countries;
}

/**
 * Fetches country supremacism data from the GDELT analysis API
 * Always merges with static simulation data for enhanced accuracy.
 * @returns {Promise<Array>} Array of country data with SGM scores
 */
export const fetchSupremacismData = async () => {
  // Always load static map data first (from simulation exports)
  const staticData = await loadStaticMapData();
  if (import.meta.env.DEV) console.log(`📁 Loaded ${staticData.length} countries from static simulation files`);

  // Get sample data as base
  const sampleData = getSampleData();

  // Create map for merging: sample data first, then API, then static (highest priority)
  const countryMap = new Map();

  // Add sample data first (lowest priority)
  for (const country of sampleData) {
    countryMap.set(country.code, country);
  }

  // Try to fetch from API
  try {
    if (import.meta.env.DEV) console.log(`Fetching data from: ${API_BASE_URL}/sgm/countries`);
    const response = await fetch(`${API_BASE_URL}/sgm/countries`);

    if (response.ok) {
      const apiData = await response.json();
      if (import.meta.env.DEV) console.log(`Successfully fetched ${apiData.length} country data points from API`);

      // Add API data (medium priority - overrides sample data)
      for (const country of apiData) {
        const existing = countryMap.get(country.code) || {};
        countryMap.set(country.code, {
          ...existing,
          ...country,
          sgm: country.sgm || country.gscs || existing.sgm || 5,
          latitude: parseFloat(country.latitude) || existing.latitude || 0,
          longitude: parseFloat(country.longitude) || existing.longitude || 0
        });
      }
    }
  } catch (error) {
    if (import.meta.env.DEV) console.log('API unavailable, using static data:', (error as Error).message);
  }

  // Add static simulation data (highest priority - always overrides)
  for (const country of staticData) {
    const existing = countryMap.get(country.code) || {};
    countryMap.set(country.code, {
      ...existing,
      ...country,
      // Ensure simulation-derived values take precedence
      sgm: country.sgm,
      gscs: country.gscs,
      sim_coherence: country.sim_coherence,
      sim_fear_factor: country.sim_fear_factor,
      sim_suppression: country.sim_suppression
    });
  }

  const mergedData = Array.from(countryMap.values());
  if (import.meta.env.DEV) console.log(`📊 Returning ${mergedData.length} countries total (${staticData.length} enhanced with simulation data)`);

  return mergedData;
};

/**
 * Fetches detailed GDELT analysis for a specific country
 * @param {string} countryCode - The ISO country code
 * @returns {Promise<Object>} Detailed country analysis data
 */
export const fetchCountryAnalysis = async (countryCode) => {
  try {
    const response = await fetch(`${API_BASE_URL}/sgm/countries/${countryCode}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (import.meta.env.DEV) console.error(`Error fetching analysis for country ${countryCode}:`, error);

    // Fallback to sample data for the specific country
    const sampleData = getSampleData();
    return sampleData.find(country => country.code === countryCode) || null;
  }
};

/**
 * Triggers a new SGM analysis run based on latest GDELT data
 * @returns {Promise<Object>} Status of the analysis job
 */
export const runGdeltAnalysis = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/sgm/run-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (import.meta.env.DEV) console.error('Error triggering GDELT analysis:', error);

    // Return a simulated job response
    return {
      jobId: "sample-job-" + Date.now(),
      status: "started"
    };
  }
};

/**
 * Fetches regional supremacism summary data
 * @returns {Promise<Object>} Regional summary data
 */
export const fetchRegionalSummary = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/sgm/regions`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (import.meta.env.DEV) console.error('Error fetching regional summary:', error);

    // Return sample regional data
    return getSampleRegionData();
  }
};

/**
 * Check the status of a running GDELT analysis job
 * @param {string} jobId - The ID of the analysis job
 * @returns {Promise<Object>} Status of the analysis job
 */
export const checkAnalysisStatus = async (jobId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/sgm/analysis-status/${jobId}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (import.meta.env.DEV) console.error(`Error checking analysis status for job ${jobId}:`, error);

    // Return a simulated status response with progress
    return {
      jobId: jobId,
      status: "in_progress",
      progress: Math.random(), // Random progress between 0 and 1
      message: "Processing GDELT data..."
    };
  }
};

/**
 * Load conflict events from static JSON files
 * Uses progressive loading: recent files first for fast initial load,
 * full files available on demand for animation features
 * @param {string} source - 'ucdp' or 'acled'
 * @param {boolean} loadFull - If true, try full files first (slower but more data for animation)
 * @returns {Promise<Array|null>} Array of events or null if not found
 */
async function loadStaticConflictEvents(source: 'ucdp' | 'acled' = 'ucdp', loadFull: boolean = false): Promise<any[] | null> {
  const fullFilename = source === 'ucdp' ? 'ucdp_events.json' : 'acled_events.json';
  const recentFilename = source === 'ucdp' ? 'ucdp_recent.json' : 'acled_recent.json';

  // Progressive loading: recent files first for fast initial display
  // Full files loaded on demand for animation mode
  const filesToTry = loadFull
    ? [fullFilename, recentFilename]  // Animation mode: try full first
    : [recentFilename, fullFilename]; // Default: recent first for speed

  for (const filename of filesToTry) {
    try {
      if (import.meta.env.DEV) console.log(`🔍 Fetching ${source.toUpperCase()} events from /map-data/${filename}`);

      const response = await fetch(`/map-data/${filename}`, {
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-cache'
      });

      if (import.meta.env.DEV) console.log(`🔍 Response: ${response.status} ${response.statusText}, type: ${response.headers.get('content-type')}`);

      if (!response.ok) {
        if (import.meta.env.DEV) console.error(`❌ HTTP error: ${response.status} for ${filename}`);
        continue; // Try next file
      }

      // Get response as text first
      const text = await response.text();
      if (import.meta.env.DEV) console.log(`🔍 Text length: ${text.length}, first 100 chars: ${text.substring(0, 100)}`);

      // Check if it looks like JSON
      if (!text.trim().startsWith('{')) {
        if (import.meta.env.DEV) console.error('❌ Response is not JSON, starts with:', text.substring(0, 50));
        continue; // Try next file
      }

      // Parse JSON
      const data = JSON.parse(text);
      if (import.meta.env.DEV) console.log(`✅ Parsed JSON: event_count=${data.event_count}, events=${data.events?.length}`);

      if (data.events && data.events.length > 0) {
        // Normalize data_source field based on file source
        const normalizedSource = source === 'ucdp' ? 'UCDP' : 'ACLED';
        const events = data.events.map((e: any) => ({
          ...e,
          data_source: e.data_source || normalizedSource
        }));
        if (import.meta.env.DEV) console.log(`📁 Loaded ${events.length} ${normalizedSource} events from ${filename}`);
        return events;
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error(`❌ Error loading ${source.toUpperCase()} events from ${filename}:`, error);
      // Continue to try next file
    }
  }

  return null;
}

/**
 * Load ACLED events from static JSON files (legacy wrapper)
 * @returns {Promise<Array|null>} Array of events or null if not found
 */
async function loadStaticAcledEvents(): Promise<any[] | null> {
  return loadStaticConflictEvents('acled');
}

/**
 * Fetches ACLED conflict event data
 * Priority: 1) Static JSON files, 2) Backend API, 3) Sample data
 * @returns {Promise<Array>} Array of conflict events
 */
export const fetchAcledEvents = async () => {
  // First try static JSON files (from fetch_acled_data.py)
  const staticEvents = await loadStaticAcledEvents();
  if (staticEvents && staticEvents.length > 0) {
    return staticEvents;
  }

  // Try backend API
  try {
    const response = await fetch(`${API_BASE_URL}/acled/events`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (import.meta.env.DEV) console.log(`Successfully fetched ${data.events?.length || 0} ACLED events from API`);

    // Return the events array from the response
    return data.events || [];
  } catch (error) {
    if (import.meta.env.DEV) console.log('ACLED API unavailable, using sample data:', (error as Error).message);
    return getSampleAcledEvents();
  }
};

/**
 * Triggers new ACLED data fetch from the API
 * @param {number} daysBack - Number of days of history to fetch
 * @param {number} limit - Maximum events to fetch
 * @returns {Promise<Object>} Status of the fetch job
 */
export const fetchAcledData = async (daysBack = 30, limit = 500) => {
  try {
    const response = await fetch(`${API_BASE_URL}/acled/fetch?days_back=${daysBack}&limit=${limit}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (import.meta.env.DEV) console.error('Error triggering ACLED fetch:', error);

    // Return a simulated job response
    return {
      jobId: "acled-job-" + Date.now(),
      status: "started"
    };
  }
};

/**
 * Check the status of an ACLED fetch job
 * @param {string} jobId - The ID of the fetch job
 * @returns {Promise<Object>} Status of the fetch job
 */
export const checkAcledFetchStatus = async (jobId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/acled/status/${jobId}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (import.meta.env.DEV) console.error(`Error checking ACLED fetch status for job ${jobId}:`, error);

    // Return a simulated status response with progress
    return {
      jobId: jobId,
      status: "in_progress",
      progress: Math.random(), // Random progress between 0 and 1
      message: "Fetching ACLED data..."
    };
  }
};

/**
 * Fetches UCDP conflict event data (primary source)
 * Priority: 1) Static JSON files, 2) Empty array
 * @returns {Promise<Array>} Array of UCDP conflict events
 */
export const fetchUcdpEvents = async () => {
  // Try static JSON files (from ucdp_import.py)
  const staticEvents = await loadStaticConflictEvents('ucdp');
  if (staticEvents && staticEvents.length > 0) {
    return staticEvents;
  }

  if (import.meta.env.DEV) console.log('⚠️ No UCDP data available - static files not loaded');
  return [];
};

/**
 * Fetches combined conflict event data from UCDP, ACLED, and GDELT
 * Priority: UCDP (primary) > ACLED > GDELT
 * @returns {Promise<Array>} Combined array of conflict events
 */
export const fetchCombinedConflictEvents = async (loadFullData: boolean = false) => {
  try {
    if (import.meta.env.DEV) console.log(`📊 Loading conflict events (full=${loadFullData})...`);

    // Fetch from all sources in parallel
    // Use recent files for fast initial load, full files when requested for animation
    const [ucdpEvents, acledEvents, gdeltEvents] = await Promise.all([
      loadStaticConflictEvents('ucdp', loadFullData).then(e => e || []),
      loadStaticConflictEvents('acled', loadFullData).then(e => e || []),
      fetchGdeltEvents()
    ]);

    // Combine the results (UCDP is primary, others supplement)
    const combinedEvents = [...ucdpEvents, ...acledEvents, ...gdeltEvents];
    if (import.meta.env.DEV) console.log(`📊 Combined events: ${ucdpEvents.length} UCDP + ${acledEvents.length} ACLED + ${gdeltEvents.length} GDELT = ${combinedEvents.length} total`);

    return combinedEvents;
  } catch (error) {
    if (import.meta.env.DEV) console.error('Error fetching combined conflict events:', error);

    // Try UCDP alone as fallback (recent file for speed)
    const ucdpFallback = await loadStaticConflictEvents('ucdp', false);
    if (ucdpFallback && ucdpFallback.length > 0) {
      return ucdpFallback;
    }

    return [];
  }
};

/**
 * Fetches FULL conflict event data for animation mode
 * Loads complete datasets (slower but comprehensive for timeline animation)
 * @returns {Promise<Array>} Full array of conflict events for animation
 */
export const fetchFullConflictEventsForAnimation = async () => {
  if (import.meta.env.DEV) console.log('🎬 Loading full event data for animation...');
  return fetchCombinedConflictEvents(true);
};

/**
 * Fetches GDELT event data for visualization
 * @returns {Promise<Array>} Array of GDELT conflict events
 */
export const fetchGdeltEvents = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/gdelt/events`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Transform GDELT events to the common event format if needed
    return data.map(event => ({
      ...event,
      // Ensure these fields exist
      data_source: 'GDELT',
      intensity: event.intensity ||
        // Calculate intensity if not provided
        (event.goldstein_scale
          ? Math.min(10, Math.max(0, 5 - event.goldstein_scale/2))
          : 5)
    }));
  } catch (error) {
    if (import.meta.env.DEV) console.error('Error fetching GDELT events:', error);
    return getSampleGdeltEvents();
  }
};

/**
 * Get sample country data for development and testing when API is unavailable
 * @returns {Array} Sample country data with SGM scores
 */
function getSampleData() {
  return [
    {
      code: "US",
      country: "United States",
      srsD: 4.2,
      srsI: 6.7,
      gscs: 5.2,
      sgm: 5.2,
      latitude: 37.0902,
      longitude: -95.7129,
      sti: 45,
      category: "Soft Supremacism",
      description: "The United States exhibits soft supremacism patterns with institutional inequalities despite formal legal equality. Historical patterns persist in economic and social structures.",
      event_count: 42,
      avg_tone: -2.7,
      updated_at: new Date().toISOString()
    },
    {
      code: "CN",
      country: "China",
      srsD: 7.1,
      srsI: 6.8,
      gscs: 7.0,
      sgm: 7.0,
      latitude: 35.8617,
      longitude: 104.1954,
      sti: 75,
      category: "Structural Supremacism",
      description: "China demonstrates structural supremacism with notable inequalities at societal and governmental levels. Minority populations face systemic discrimination and there are expansionist tendencies in foreign policy.",
      event_count: 37,
      avg_tone: -3.5,
      updated_at: new Date().toISOString()
    },
    {
      code: "RU",
      country: "Russia",
      srsD: 6.9,
      srsI: 7.8,
      gscs: 7.3,
      sgm: 7.3,
      latitude: 61.5240,
      longitude: 105.3188,
      sti: 80,
      category: "Structural Supremacism",
      description: "Russia shows strong structural supremacism internally and aggressive patterns internationally. Power concentration creates significant disparities for non-dominant groups.",
      event_count: 53,
      avg_tone: -5.2,
      updated_at: new Date().toISOString()
    },
    {
      code: "SE",
      country: "Sweden",
      srsD: 1.8,
      srsI: 1.6,
      gscs: 1.7,
      sgm: 1.7,
      latitude: 60.1282,
      longitude: 18.6435,
      sti: 15,
      category: "Non-Supremacist Governance",
      description: "Sweden demonstrates strong egalitarian governance with robust institutions protecting equality. Social welfare systems minimize power disparities between groups.",
      event_count: 8,
      avg_tone: 3.1,
      updated_at: new Date().toISOString()
    },
    {
      code: "DE",
      country: "Germany",
      srsD: 2.9,
      srsI: 2.1,
      gscs: 2.5,
      sgm: 2.5,
      latitude: 51.1657,
      longitude: 10.4515,
      sti: 25,
      category: "Mixed Governance",
      description: "Germany shows mixed governance with strong democratic institutions and acknowledgment of historical supremacist patterns. Legal frameworks promote equality though challenges persist.",
      event_count: 15,
      avg_tone: 1.8,
      updated_at: new Date().toISOString()
    },
    {
      code: "IN",
      country: "India",
      srsD: 5.8,
      srsI: 4.2,
      gscs: 5.0,
      sgm: 5.0,
      latitude: 20.5937,
      longitude: 78.9629,
      sti: 60,
      category: "Soft Supremacism",
      description: "India exhibits soft supremacism with increasing tensions between religious and caste groups. Constitutional protections coexist with supremacist social structures.",
      event_count: 31,
      avg_tone: -1.9,
      updated_at: new Date().toISOString()
    },
    {
      code: "ZA",
      country: "South Africa",
      srsD: 5.1,
      srsI: 3.2,
      gscs: 4.1,
      sgm: 4.1,
      latitude: -30.5595,
      longitude: 22.9375,
      sti: 48,
      category: "Soft Supremacism",
      description: "South Africa shows signs of soft supremacism despite strong constitutional protections. Post-apartheid transition continues with economic disparities along historical lines.",
      event_count: 28,
      avg_tone: -1.2,
      updated_at: new Date().toISOString()
    },
    {
      code: "BR",
      country: "Brazil",
      srsD: 5.6,
      srsI: 3.8,
      gscs: 4.7,
      sgm: 4.7,
      latitude: -14.2350,
      longitude: -51.9253,
      sti: 55,
      category: "Soft Supremacism",
      description: "Brazil demonstrates soft supremacism with persistent racial and economic inequalities despite formal legal equality. Social mobility remains limited for marginalized groups.",
      event_count: 23,
      avg_tone: -1.6,
      updated_at: new Date().toISOString()
    },
    {
      code: "FR",
      country: "France",
      srsD: 3.7,
      srsI: 3.9,
      gscs: 3.8,
      sgm: 3.8,
      latitude: 46.2276,
      longitude: 2.2137,
      sti: 40,
      category: "Mixed Governance",
      description: "France shows mixed governance with strong republican values alongside challenges integrating minority communities. Colonial legacy impacts domestic and international relations.",
      event_count: 19,
      avg_tone: -0.8,
      updated_at: new Date().toISOString()
    }
  ];
}

/**
 * Get sample regional data when API is unavailable
 * @returns {Array} Sample regional data
 */
function getSampleRegionData() {
  return [
    {
      region: "North America",
      avg_sgm: 4.8,
      countries: 3,
      highest_country: "United States",
      highest_sgm: 5.2,
      lowest_country: "Canada",
      lowest_sgm: 2.8
    },
    {
      region: "Europe",
      avg_sgm: 3.2,
      countries: 5,
      highest_country: "Russia",
      highest_sgm: 7.3,
      lowest_country: "Sweden",
      lowest_sgm: 1.7
    },
    {
      region: "Asia",
      avg_sgm: 6.1,
      countries: 6,
      highest_country: "China",
      highest_sgm: 7.0,
      lowest_country: "Japan",
      lowest_sgm: 3.6
    },
    {
      region: "Africa",
      avg_sgm: 5.7,
      countries: 3,
      highest_country: "South Africa",
      highest_sgm: 5.9,
      lowest_country: "Kenya",
      lowest_sgm: 5.1
    },
    {
      region: "South America",
      avg_sgm: 4.5,
      countries: 4,
      highest_country: "Brazil",
      highest_sgm: 4.7,
      lowest_country: "Chile",
      lowest_sgm: 3.9
    }
  ];
}

/**
 * Get sample ACLED events - returns empty array
 * Real data is loaded from static JSON files in /map-data/
 * Note: UCDP is now the primary conflict data source
 * @returns {Array} Empty array (no fallback sample data)
 */
function getSampleAcledEvents() {
  // No hardcoded fallback - real data comes from static JSON files
  // UCDP is now the primary source for conflict events
  return [];
}

/**
 * Get sample GDELT events - returns empty array
 * Real data should be loaded from API or static files
 * @returns {Array} Empty array (no fallback sample data)
 */
function getSampleGdeltEvents() {
  // No hardcoded fallback - real data comes from API
  return [];
}

/**
 * Simulation result data structure from Laws of Existence framework
 */
export interface SimulationResult {
  country_code: string;
  country_name: string;
  latitude: number;
  longitude: number;
  simulation: {
    initial_coherence: number;
    final_coherence: number;
    coherence_change: number;
    min_coherence: number;
    max_coherence: number;
    stability_index: number;
    risk_level: 'low' | 'moderate' | 'elevated' | 'high' | 'critical';
    trend: 'improving' | 'stable' | 'declining';
    coherence_history: number[];
    domain_coherences?: {
      transcendent?: number;
      universal?: number;
      fundamental?: number;
      natural?: number;
    };
  };
  parameters: {
    suppression_level: number;
    supremacist_ideology: number;
    fear_factor: number;
    resource_scarcity: number;
  };
  source_data: {
    event_count: number;
    total_fatalities: number;
    data_sources: string[];
    date_range: [string, string];
    data_timestamp: string;
  };
  metadata: {
    simulation_steps: number;
    simulation_time_seconds: number;
    generated_at: string;
    framework_version: string;
  };
}

export interface SimulationResultsData {
  generated_at: string;
  total_countries: number;
  results: SimulationResult[];
}

/**
 * Fetches simulation results from Laws of Existence framework
 * These results show how real-world conflict data affects primordial coherence
 * @returns {Promise<SimulationResultsData | null>} Simulation results or null if unavailable
 */
export const fetchSimulationResults = async (): Promise<SimulationResultsData | null> => {
  try {
    if (import.meta.env.DEV) console.log('🔬 Loading simulation results from /map-data/simulation_results.json');

    const response = await fetch('/map-data/simulation_results.json', {
      headers: { 'Accept': 'application/json' },
      cache: 'no-cache'
    });

    if (!response.ok) {
      if (import.meta.env.DEV) console.warn('⚠️ Simulation results not available:', response.status);
      return null;
    }

    const data: SimulationResultsData = await response.json();
    if (import.meta.env.DEV) console.log(`✅ Loaded simulation results for ${data.total_countries} countries (generated: ${data.generated_at})`);

    return data;
  } catch (error) {
    if (import.meta.env.DEV) console.error('❌ Error loading simulation results:', error);
    return null;
  }
};

/**
 * Get risk level color for visualization
 * @param riskLevel - The risk level from simulation
 * @returns Hex color code
 */
export const getRiskLevelColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'low': return '#22c55e';      // Green
    case 'moderate': return '#84cc16'; // Lime
    case 'elevated': return '#eab308'; // Yellow
    case 'high': return '#f97316';     // Orange
    case 'critical': return '#ef4444'; // Red
    default: return '#6b7280';         // Gray
  }
};

/**
 * Get coherence color based on value (0-1 scale)
 * Higher coherence = greener, lower coherence = redder
 * @param coherence - Coherence value between 0 and 1
 * @returns Hex color code
 */
export const getCoherenceColor = (coherence: number): string => {
  if (coherence >= 0.8) return '#22c55e'; // Green - healthy
  if (coherence >= 0.6) return '#84cc16'; // Lime - good
  if (coherence >= 0.4) return '#eab308'; // Yellow - warning
  if (coherence >= 0.2) return '#f97316'; // Orange - danger
  return '#ef4444';                       // Red - critical
};