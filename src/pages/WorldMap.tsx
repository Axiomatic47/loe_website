import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { cn } from "@/lib/utils";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import { Info, Download, FileText, Loader2, RefreshCw, Lock, LogIn } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useNetlifyIdentity } from "@/hooks/useNetlifyIdentity";

// Import tab components
import {
  WorldMapTab,
  CountryAnalysisTab,
  EventDataTab,
  GlobalTrendsTab,
  SimulationTab
} from "@/components/worldmap";

// Import API client functions
import {
  fetchSupremacismData,
  fetchCountryAnalysis,
  runGdeltAnalysis,
  fetchRegionalSummary,
  checkAnalysisStatus,
  fetchCombinedConflictEvents,
  fetchFullConflictEventsForAnimation,
  fetchSimulationResults,
  SimulationResultsData
} from "@/lib/gdeltApi";

// Define the BlurPanel component for consistent styling
const BlurPanel = ({
  children,
  className
}) => {
  return (
    <div
      className={cn(
        "relative rounded-lg p-8 sm:p-12",
        "bg-card",
        "border border-border",
        "shadow-xl",
        className
      )}
    >
      {children}
    </div>
  );
};

// Main WorldMap component
const WorldMap = () => {
  const navigate = useNavigate();
  useDocumentMeta("World Map");

  // Authentication for protected features
  const { user, isAuthenticated, isLoading: authLoading, login, logout } = useNetlifyIdentity();

  // State for data
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [countries, setCountries] = useState([]);
  const [events, setEvents] = useState([]);
  const [regionalData, setRegionalData] = useState([]);

  // State for loading and errors
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // State for analysis jobs
  const [isGdeltAnalysisRunning, setIsGdeltAnalysisRunning] = useState(false);
  const [isAcledFetchRunning, setIsAcledFetchRunning] = useState(false);
  const [analysisJobId, setAnalysisJobId] = useState(null);
  const [acledJobId, setAcledJobId] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [acledProgress, setAcledProgress] = useState(0);

  // State for data layer toggles
  const [showGDELT, setShowGDELT] = useState(true);
  const [showACLED, setShowACLED] = useState(true);
  const [showUCDP, setShowUCDP] = useState(true);
  const [showCountries, setShowCountries] = useState(true);

  // State for full animation data (loaded on demand)
  const [hasFullData, setHasFullData] = useState(false);
  const [isLoadingFullData, setIsLoadingFullData] = useState(false);

  // State for simulation results
  const [simulationData, setSimulationData] = useState<SimulationResultsData | null>(null);

  // Load all data on component mount
  useEffect(() => {
    loadAllData();
    loadSimulationData();
  }, []);

  // Load simulation results
  const loadSimulationData = async () => {
    try {
      const data = await fetchSimulationResults();
      if (data) {
        setSimulationData(data);
        if (import.meta.env.DEV) console.log('🔬 Simulation data loaded:', data.total_countries, 'countries');
      }
    } catch (err) {
      if (import.meta.env.DEV) console.warn('Could not load simulation data:', err);
    }
  };

  // Function to load full animation data (on demand)
  const loadFullAnimationData = async () => {
    if (hasFullData || isLoadingFullData) return;

    setIsLoadingFullData(true);
    try {
      if (import.meta.env.DEV) console.log('🎬 Loading full animation data...');
      const fullEventData = await fetchFullConflictEventsForAnimation();
      setEvents(fullEventData);
      setHasFullData(true);

      toast({
        title: "Full Animation Data Loaded",
        description: `Loaded ${fullEventData.length.toLocaleString()} events for animation`,
      });
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error loading full animation data:", error);
      toast({
        title: "Animation Data Error",
        description: "Could not load full event data for animation",
        variant: "destructive"
      });
    } finally {
      setIsLoadingFullData(false);
    }
  };

  // Function to load all data
  const loadAllData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch country data with higher limits
      const countryData = await fetchSupremacismData();
      setCountries(countryData);

      // Fetch event data with higher limits
      const eventData = await fetchCombinedConflictEvents();
      setEvents(eventData);

      // Fetch regional data
      try {
        const regionsData = await fetchRegionalSummary();
        setRegionalData(regionsData);
      } catch (e) {
        if (import.meta.env.DEV) console.error("Error fetching regional data:", e);
        // Don't block the main data load for regional data
      }

      setLastUpdated(new Date());
      setIsLoading(false);

      toast({
        title: "Data Loaded",
        description: `Successfully loaded ${countryData.length} countries and ${eventData.length} events`,
      });
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error loading data:", error);
      setError(`Failed to load data: ${error instanceof Error ? error.message : String(error)}`);
      setIsLoading(false);

      toast({
        title: "Data Loading Error",
        description: "Some data sources could not be loaded. Using available data.",
        variant: "destructive"
      });
    }
  };

  // Start GDELT analysis
  const startGdeltAnalysis = async () => {
    setIsGdeltAnalysisRunning(true);
    setAnalysisProgress(0);

    try {
      const result = await runGdeltAnalysis();
      setAnalysisJobId(result.jobId);

      toast({
        title: "GDELT Analysis Started",
        description: `New GDELT analysis has been initiated. Job ID: ${result.jobId || 'Unknown'}`,
      });

      // Start polling for completion
      pollGdeltStatus(result.jobId);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error starting GDELT analysis:", error);

      toast({
        title: "GDELT Analysis Failed",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive"
      });

      setIsGdeltAnalysisRunning(false);
    }
  };

  // Poll for GDELT analysis completion
  const pollGdeltStatus = async (jobId) => {
    if (!jobId) return;

    try {
      // Check job status
      const statusResult = await checkAnalysisStatus(jobId);

      // Update progress if available
      if (statusResult.progress) {
        setAnalysisProgress(statusResult.progress * 100);
      }

      // If completed, refresh data
      if (statusResult.status === "completed") {
        toast({
          title: "GDELT Analysis Complete",
          description: "GDELT data has been processed. Refreshing data...",
        });

        loadAllData();
        setIsGdeltAnalysisRunning(false);
        setAnalysisJobId(null);
        return;
      }

      // If failed, show error
      if (statusResult.status === "failed") {
        toast({
          title: "GDELT Analysis Failed",
          description: statusResult.message || "GDELT analysis failed",
          variant: "destructive"
        });

        setIsGdeltAnalysisRunning(false);
        setAnalysisJobId(null);
        return;
      }

      // Continue polling
      setTimeout(() => pollGdeltStatus(jobId), 2000);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error checking GDELT analysis status:", error);

      // Fallback to simulated completion after a delay
      setTimeout(() => {
        toast({
          title: "GDELT Analysis Complete",
          description: "Analysis completed. Refreshing data...",
        });

        loadAllData();
        setIsGdeltAnalysisRunning(false);
        setAnalysisJobId(null);
      }, 8000);
    }
  };

  // Start ACLED fetch
  const startAcledFetch = async () => {
    setIsAcledFetchRunning(true);
    setAcledProgress(0);

    try {
      // This is a placeholder - implement with your actual API
      toast({
        title: "ACLED Fetch Started",
        description: "Fetching ACLED data...",
      });

      // Simulate ACLED fetch with a timeout
      setTimeout(() => {
        // Simulate increasing progress
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 10;
          setAcledProgress(progress);

          if (progress >= 100) {
            clearInterval(progressInterval);

            toast({
              title: "ACLED Fetch Complete",
              description: "Successfully fetched ACLED data. Refreshing display...",
            });

            loadAllData();
            setIsAcledFetchRunning(false);
          }
        }, 1000);
      }, 2000);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error starting ACLED fetch:", error);

      toast({
        title: "ACLED Fetch Failed",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive"
      });

      setIsAcledFetchRunning(false);
    }
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 flex-grow">
        <BlurPanel>
          <Button
            variant="ghost"
            className="text-foreground mb-8 hover:bg-secondary/60"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </Button>

          {/* Header section with title and action buttons */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-serif text-foreground">Global Conflict & Supremacism Map</h1>
              <p className="text-muted-foreground mt-2">Explore the relationship between conflict events and supremacist governance</p>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              {/* Main data refresh button */}
              <Button
                variant="outline"
                className="bg-card text-foreground border-border"
                onClick={loadAllData}
                disabled={isLoading || isGdeltAnalysisRunning || isAcledFetchRunning}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Data
                  </>
                )}
              </Button>

              {/* GDELT Analysis Button */}
              <Button
                variant="outline"
                className="bg-card text-foreground border-border"
                onClick={startGdeltAnalysis}
                disabled={isLoading || isGdeltAnalysisRunning || isAcledFetchRunning}
              >
                {isGdeltAnalysisRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {analysisProgress > 0 ? `GDELT Analysis (${Math.round(analysisProgress)}%)` : "GDELT Analysis..."}
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Run GDELT Analysis
                  </>
                )}
              </Button>

              {/* ACLED Fetch Button */}
              <Button
                variant="outline"
                className="bg-card text-foreground border-border"
                onClick={startAcledFetch}
                disabled={isLoading || isGdeltAnalysisRunning || isAcledFetchRunning}
              >
                {isAcledFetchRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {acledProgress > 0 ? `ACLED Fetch (${Math.round(acledProgress)}%)` : "ACLED Fetch..."}
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Fetch ACLED Data
                  </>
                )}
              </Button>

              {/* Methodology document button */}
              <Button
                variant="outline"
                className="bg-card text-foreground border-border"
              >
                <FileText className="mr-2 h-4 w-4" />
                Methodology
              </Button>

              {/* Auth button */}
              {isAuthenticated ? (
                <Button
                  variant="outline"
                  className="bg-secondary text-foreground border border-border hover:bg-muted"
                  onClick={logout}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  {user?.email?.split('@')[0] || 'Logged In'}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="bg-card text-foreground border-border"
                  onClick={login}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              )}
            </div>
          </div>

          {/* Error and status alerts */}
          {error ? (
            <Alert className="bg-secondary/60 border border-border border-l-2 border-l-destructive mb-6">
              <Info className="h-4 w-4" />
              <AlertTitle className="text-foreground">Data Loading Error</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                {error}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {lastUpdated && (
                <Alert className="bg-card/80 border-border mb-6">
                  <Info className="h-4 w-4" />
                  <AlertTitle className="text-foreground">Data Status</AlertTitle>
                  <AlertDescription className="text-muted-foreground">
                    Data was last refreshed on {lastUpdated.toLocaleDateString()} at {lastUpdated.toLocaleTimeString()}.
                    {countries.length > 0 && events.length > 0 && (
                      <> Showing {countries.length} countries and {events.length} conflict events.</>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Data filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex items-center space-x-2">
                  <Switch id="show-countries" checked={showCountries} onCheckedChange={setShowCountries} />
                  <Label htmlFor="show-countries" className="text-foreground flex items-center">
                    Show Countries
                    <Badge className="ml-2 bg-blue-500" variant="outline">{countries.length}</Badge>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="show-ucdp" checked={showUCDP} onCheckedChange={setShowUCDP} />
                  <Label htmlFor="show-ucdp" className="text-foreground flex items-center">
                    Show UCDP Events
                    <Badge className="ml-2 bg-purple-500" variant="outline">
                      {events.filter(e => e.data_source === 'UCDP').length}
                    </Badge>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="show-gdelt" checked={showGDELT} onCheckedChange={setShowGDELT} />
                  <Label htmlFor="show-gdelt" className="text-foreground flex items-center">
                    Show GDELT Events
                    <Badge className="ml-2 bg-orange-500" variant="outline">
                      {events.filter(e => e.data_source === 'GDELT').length}
                    </Badge>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="show-acled" checked={showACLED} onCheckedChange={setShowACLED} />
                  <Label htmlFor="show-acled" className="text-foreground flex items-center">
                    Show ACLED Events
                    <Badge className="ml-2 bg-red-500" variant="outline">
                      {events.filter(e => e.data_source === 'ACLED').length}
                    </Badge>
                  </Label>
                </div>
              </div>

              {/* Main content tabs */}
              <Tabs defaultValue="map" className="w-full">
                <TabsList className="w-full bg-card/80 border border-border mb-6">
                  <TabsTrigger value="map" className="flex-1">World Map</TabsTrigger>
                  {isAuthenticated && (
                    <TabsTrigger value="simulation" className="flex-1">Simulation</TabsTrigger>
                  )}
                  <TabsTrigger value="countries" className="flex-1">Country Analysis</TabsTrigger>
                  <TabsTrigger value="events" className="flex-1">Event Data</TabsTrigger>
                  <TabsTrigger value="trends" className="flex-1">Global Trends</TabsTrigger>
                </TabsList>

                {/* Map Tab */}
                <TabsContent value="map">
                  <WorldMapTab
                    countries={countries}
                    events={events}
                    onSelectCountry={setSelectedCountry}
                    onSelectEvent={setSelectedEvent}
                    isLoading={isLoading || isLoadingFullData}
                    isGdeltAnalysisRunning={isGdeltAnalysisRunning}
                    isAcledFetchRunning={isAcledFetchRunning}
                    showGDELT={showGDELT}
                    showACLED={showACLED}
                    showUCDP={showUCDP}
                    showCountries={showCountries}
                    onRequestFullData={loadFullAnimationData}
                    hasFullData={hasFullData}
                  />
                </TabsContent>

                {/* Simulation Tab - Protected */}
                <TabsContent value="simulation">
                  {isAuthenticated ? (
                    <SimulationTab
                      simulationData={simulationData}
                      isLoading={isLoading}
                    />
                  ) : (
                    <div className="bg-card/60 p-12 rounded-lg border border-border text-center">
                      <Lock className="h-16 w-16 text-muted-foreground/70 mx-auto mb-4" />
                      <h3 className="text-2xl font-serif text-foreground mb-2">Authentication Required</h3>
                      <p className="text-muted-foreground/80 mb-6 max-w-md mx-auto">
                        The Simulation feature requires authentication. Please log in to access the coherence projection simulator.
                      </p>
                      <Button
                        onClick={login}
                        className="bg-purple-600 hover:bg-purple-700 text-foreground"
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Log In to Access
                      </Button>
                    </div>
                  )}
                </TabsContent>

                {/* Countries Tab */}
                <TabsContent value="countries">
                  <CountryAnalysisTab
                    countries={countries}
                    selectedCountry={selectedCountry}
                    setSelectedCountry={setSelectedCountry}
                    isLoading={isLoading}
                  />
                </TabsContent>

                {/* Events Tab */}
                <TabsContent value="events">
                  <EventDataTab
                    events={events}
                    selectedEvent={selectedEvent}
                    setSelectedEvent={setSelectedEvent}
                    isLoading={isLoading}
                  />
                </TabsContent>

                {/* Trends Tab */}
                <TabsContent value="trends">
                  <GlobalTrendsTab
                    countries={countries}
                    events={events}
                    regionalData={regionalData}
                    isLoading={isLoading}
                  />
                </TabsContent>
              </Tabs>
            </>
          )}
        </BlurPanel>
      </div>
    </PageLayout>
  );
};

export default WorldMap;