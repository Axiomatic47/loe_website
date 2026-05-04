// src/pages/SimulationAdmin.tsx
// Protected admin page for viewing historical simulation data

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter, Legend
} from 'recharts';
import {
  ArrowLeft, RefreshCw, Database, Globe, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, Lock, Activity, BarChart3, Map, Wifi, WifiOff,
  Clock, Play, Server, Zap
} from 'lucide-react';
import { useNetlifyIdentity } from '@/hooks/useNetlifyIdentity';
import {
  fetchCountrySimulations,
  fetchCountryDetail,
  calculateSimulationStats,
  checkAPIHealth,
  fetchRecentRuns,
  fetchOutputsSummary,
  getAPIInfo,
  CountrySimulation,
  OutputsSummary
} from '@/lib/simulationDataService';

// Color palette for charts
const COLORS = {
  low: '#22c55e',
  moderate: '#eab308',
  elevated: '#f97316',
  high: '#ef4444',
  critical: '#dc2626',
  improving: '#22c55e',
  stable: '#3b82f6',
  declining: '#ef4444'
};

const RISK_COLORS = ['#22c55e', '#eab308', '#f97316', '#ef4444', '#dc2626'];

// Helper to get risk color
const getRiskColor = (risk: string) => COLORS[risk as keyof typeof COLORS] || '#666';

// API Health Status Interface
interface APIStatus {
  healthy: boolean;
  message: string;
  lastChecked: Date;
  version?: string;
  uptime?: string;
}

const SimulationAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading, login } = useNetlifyIdentity();

  // Data state
  const [countrySimulations, setCountrySimulations] = useState<CountrySimulation[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountrySimulation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time status state
  const [apiStatus, setApiStatus] = useState<APIStatus | null>(null);
  const [recentRuns, setRecentRuns] = useState<any[]>([]);
  const [outputsSummary, setOutputsSummary] = useState<OutputsSummary | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check API health
  const checkHealth = useCallback(async () => {
    try {
      const [health, info] = await Promise.all([
        checkAPIHealth(),
        getAPIInfo()
      ]);

      setApiStatus({
        healthy: health.healthy,
        message: health.message,
        lastChecked: new Date(),
        version: info?.version || 'unknown',
        uptime: info?.uptime || 'unknown'
      });
    } catch (err) {
      setApiStatus({
        healthy: false,
        message: 'Connection failed',
        lastChecked: new Date()
      });
    }
  }, []);

  // Load all data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [countries, runs, summary] = await Promise.all([
        fetchCountrySimulations(),
        fetchRecentRuns(20),
        fetchOutputsSummary()
      ]);

      setCountrySimulations(countries);
      setRecentRuns(runs);
      setOutputsSummary(summary);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load simulation data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load and health check
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      checkHealth();
    }
  }, [isAuthenticated, loadData, checkHealth]);

  // Auto-refresh handler
  useEffect(() => {
    if (autoRefresh && isAuthenticated) {
      refreshTimerRef.current = setInterval(() => {
        loadData();
        checkHealth();
      }, refreshInterval * 1000);
    }

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, isAuthenticated, loadData, checkHealth]);

  // Health check every 30 seconds regardless of auto-refresh
  useEffect(() => {
    if (!isAuthenticated) return;

    const healthCheck = setInterval(checkHealth, 30000);
    return () => clearInterval(healthCheck);
  }, [isAuthenticated, checkHealth]);

  // Calculate statistics
  const stats = useMemo(() => {
    return calculateSimulationStats(countrySimulations);
  }, [countrySimulations]);

  // Prepare chart data
  const riskDistributionData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.riskDistribution).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: getRiskColor(name)
    }));
  }, [stats]);

  const trendDistributionData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.trendDistribution).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: COLORS[name as keyof typeof COLORS] || '#666'
    }));
  }, [stats]);

  const governanceData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.governanceDistribution).map(([name, value]) => ({
      name,
      count: value
    }));
  }, [stats]);

  const scatterData = useMemo(() => {
    return countrySimulations.map(c => ({
      name: c.country_name,
      code: c.country_code,
      x: c.parameters.suppression_level,
      y: c.simulation.final_coherence,
      risk: c.simulation.risk_level
    }));
  }, [countrySimulations]);

  const coherenceRankingData = useMemo(() => {
    return [...countrySimulations]
      .sort((a, b) => a.simulation.final_coherence - b.simulation.final_coherence)
      .slice(0, 20)
      .map(c => ({
        name: c.country_code,
        fullName: c.country_name,
        coherence: c.simulation.final_coherence,
        change: c.simulation.coherence_change,
        risk: c.simulation.risk_level
      }));
  }, [countrySimulations]);

  // Auth check
  if (authLoading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground/80">Checking authentication...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto bg-card rounded-lg p-8 border border-border text-center">
            <Lock className="h-16 w-16 text-muted-foreground/70 mx-auto mb-4" />
            <h1 className="text-2xl font-serif text-foreground mb-2">Admin Access Required</h1>
            <p className="text-muted-foreground/80 mb-6">
              Please log in to access the Simulation Admin dashboard.
            </p>
            <Button onClick={login} className="bg-purple-600 hover:bg-purple-700">
              Log In
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-card rounded-lg p-6 border border-border mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              className="text-muted-foreground/80 hover:text-foreground"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex items-center gap-3">
              {/* API Status Indicator */}
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm",
                apiStatus?.healthy
                  ? "bg-green-900/30 text-green-400 border border-green-500/30"
                  : "bg-red-900/30 text-red-400 border border-red-500/30"
              )}>
                {apiStatus?.healthy ? (
                  <Wifi className="h-4 w-4" />
                ) : (
                  <WifiOff className="h-4 w-4" />
                )}
                <span>API {apiStatus?.healthy ? 'Connected' : 'Offline'}</span>
                {apiStatus?.version && apiStatus.version !== 'unknown' && (
                  <span className="text-xs opacity-60">v{apiStatus.version}</span>
                )}
              </div>

              {/* Auto-refresh toggle */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-card/80 rounded-full border border-border">
                <Clock className="h-4 w-4 text-muted-foreground/80" />
                <span className="text-sm text-muted-foreground/80">Auto</span>
                <Switch
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>

              <Badge variant="outline" className="bg-purple-900/50 text-purple-300 border-purple-500/30">
                {user?.email}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { loadData(); checkHealth(); }}
                disabled={isLoading}
                className="bg-card text-foreground border-border"
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-purple-400" />
              <div>
                <h1 className="text-3xl font-serif text-foreground">Simulation Admin</h1>
                <p className="text-muted-foreground/80">View and analyze historical simulation data</p>
              </div>
            </div>

            {/* Last refresh timestamp */}
            {lastRefresh && (
              <div className="text-xs text-muted-foreground/70">
                Last updated: {lastRefresh.toLocaleTimeString()}
                {autoRefresh && (
                  <span className="ml-2 text-purple-400">
                    (auto-refresh every {refreshInterval}s)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {error && (
          <Alert className="bg-red-900/20 border-red-500/30 mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <StatCard
              label="Total Countries"
              value={stats.total}
              icon={<Globe className="h-5 w-5" />}
            />
            <StatCard
              label="Mean Coherence"
              value={`${(stats.meanFinalCoherence * 100).toFixed(1)}%`}
              icon={<Activity className="h-5 w-5" />}
              color={stats.meanFinalCoherence > 0.5 ? 'green' : stats.meanFinalCoherence > 0.35 ? 'yellow' : 'red'}
            />
            <StatCard
              label="Mean Change"
              value={`${stats.meanCoherenceChange > 0 ? '+' : ''}${(stats.meanCoherenceChange * 100).toFixed(1)}%`}
              icon={stats.meanCoherenceChange > 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              color={stats.meanCoherenceChange > 0 ? 'green' : 'red'}
            />
            <StatCard
              label="Critical Risk"
              value={stats.riskDistribution.critical || 0}
              icon={<AlertTriangle className="h-5 w-5" />}
              color="red"
            />
            <StatCard
              label="Declining"
              value={stats.trendDistribution.declining || 0}
              icon={<TrendingDown className="h-5 w-5" />}
              color="orange"
            />
            <StatCard
              label="Stable/Improving"
              value={(stats.trendDistribution.stable || 0) + (stats.trendDistribution.improving || 0)}
              icon={<CheckCircle className="h-5 w-5" />}
              color="green"
            />
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="status" className="w-full">
          <TabsList className="w-full bg-card/80 border border-border mb-6">
            <TabsTrigger value="status" className="flex-1">
              <Server className="h-4 w-4 mr-2" />
              Status
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex-1">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="countries" className="flex-1">
              <Map className="h-4 w-4 mr-2" />
              Countries
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex-1">
              <Activity className="h-4 w-4 mr-2" />
              Analysis
            </TabsTrigger>
          </TabsList>

          {/* Status Tab */}
          <TabsContent value="status">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* API Server Status */}
              <div className="bg-card rounded-lg p-6 border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Server className="h-5 w-5 text-purple-400" />
                  <h3 className="text-lg font-medium text-foreground">API Server</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground/80">Status</span>
                    <Badge className={cn(
                      apiStatus?.healthy
                        ? "bg-green-900/50 text-green-400 border-green-500/30"
                        : "bg-red-900/50 text-red-400 border-red-500/30"
                    )}>
                      {apiStatus?.healthy ? 'Online' : 'Offline'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground/80">Version</span>
                    <span className="text-foreground">{apiStatus?.version || 'Unknown'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground/80">Message</span>
                    <span className="text-foreground text-sm">{apiStatus?.message || '-'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground/80">Last Check</span>
                    <span className="text-foreground text-sm">
                      {apiStatus?.lastChecked?.toLocaleTimeString() || '-'}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={checkHealth}
                      className="w-full bg-card/80 text-foreground border-border"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Test Connection
                    </Button>
                  </div>
                </div>
              </div>

              {/* Data Summary */}
              <div className="bg-card rounded-lg p-6 border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Database className="h-5 w-5 text-purple-400" />
                  <h3 className="text-lg font-medium text-foreground">Data Summary</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground/80">Total Runs</span>
                    <span className="text-foreground text-xl font-bold">
                      {outputsSummary?.total_runs || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground/80">Data-Driven</span>
                    <span className="text-foreground">
                      {outputsSummary?.data_driven?.length || 0} simulations
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground/80">Mass Batches</span>
                    <span className="text-foreground">
                      {outputsSummary?.mass_simulations?.length || 0} batches
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground/80">Countries Exported</span>
                    <span className="text-foreground">
                      {outputsSummary?.website_export?.length || 0} countries
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground/80">Local Countries</span>
                    <span className="text-foreground">
                      {countrySimulations.length} loaded
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-card rounded-lg p-6 border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-5 w-5 text-purple-400" />
                  <h3 className="text-lg font-medium text-foreground">Recent Activity</h3>
                </div>

                {outputsSummary?.data_driven && outputsSummary.data_driven.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {outputsSummary.data_driven.slice(0, 8).map((run, index) => (
                      <div
                        key={run.id || index}
                        className="flex items-center justify-between p-2 bg-card/80 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground/80" />
                          <span className="text-foreground text-sm">{run.country_name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground/80">
                            {new Date(run.timestamp).toLocaleDateString()}
                          </div>
                          <div className="text-sm" style={{ color: getRiskColor(run.final_coherence > 0.5 ? 'low' : run.final_coherence > 0.35 ? 'moderate' : 'high') }}>
                            {(run.final_coherence * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground/70 py-8">
                    No recent runs available
                  </div>
                )}
              </div>
            </div>

            {/* Recent Runs List */}
            {recentRuns.length > 0 && (
              <div className="mt-6 bg-card rounded-lg p-6 border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Play className="h-5 w-5 text-purple-400" />
                  <h3 className="text-lg font-medium text-foreground">Recent Simulation Runs</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 text-sm text-muted-foreground/80">ID</th>
                        <th className="text-left py-2 px-3 text-sm text-muted-foreground/80">Type</th>
                        <th className="text-left py-2 px-3 text-sm text-muted-foreground/80">Country</th>
                        <th className="text-left py-2 px-3 text-sm text-muted-foreground/80">Status</th>
                        <th className="text-left py-2 px-3 text-sm text-muted-foreground/80">Coherence</th>
                        <th className="text-left py-2 px-3 text-sm text-muted-foreground/80">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRuns.slice(0, 10).map((run, index) => (
                        <tr key={run.id || index} className="border-b border-border hover:bg-secondary/40">
                          <td className="py-2 px-3 text-sm text-muted-foreground font-mono">
                            {run.id?.slice(0, 12) || '-'}...
                          </td>
                          <td className="py-2 px-3">
                            <Badge variant="outline" className="text-xs">
                              {run.type || run.run_type || 'unknown'}
                            </Badge>
                          </td>
                          <td className="py-2 px-3 text-sm text-foreground">
                            {run.country_name || run.country_code || '-'}
                          </td>
                          <td className="py-2 px-3">
                            <Badge className={cn(
                              "text-xs",
                              run.status === 'completed' || run.collapsed === false
                                ? "bg-green-900/50 text-green-400"
                                : "bg-yellow-900/50 text-yellow-400"
                            )}>
                              {run.status || (run.collapsed ? 'collapsed' : 'stable')}
                            </Badge>
                          </td>
                          <td className="py-2 px-3 text-sm">
                            <span style={{
                              color: getRiskColor(
                                run.final_coherence > 0.5 ? 'low' :
                                run.final_coherence > 0.35 ? 'moderate' : 'high'
                              )
                            }}>
                              {run.final_coherence
                                ? `${(run.final_coherence * 100).toFixed(1)}%`
                                : '-'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-sm text-muted-foreground/80">
                            {run.timestamp
                              ? new Date(run.timestamp).toLocaleString()
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Risk Distribution */}
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="text-lg font-medium text-foreground mb-4">Risk Level Distribution</h3>
                {isLoading ? (
                  <Skeleton className="h-64" />
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={riskDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {riskDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Trend Distribution */}
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="text-lg font-medium text-foreground mb-4">Coherence Trends</h3>
                {isLoading ? (
                  <Skeleton className="h-64" />
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trendDistributionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="name" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.9)',
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}
                        />
                        <Bar dataKey="value" fill="#8b5cf6">
                          {trendDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Governance Distribution */}
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="text-lg font-medium text-foreground mb-4">By Governance Category</h3>
                {isLoading ? (
                  <Skeleton className="h-64" />
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={governanceData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis type="number" stroke="#666" />
                        <YAxis dataKey="name" type="category" stroke="#666" width={150} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.9)',
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}
                        />
                        <Bar dataKey="count" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Suppression vs Coherence Scatter */}
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="text-lg font-medium text-foreground mb-4">Suppression vs Final Coherence</h3>
                {isLoading ? (
                  <Skeleton className="h-64" />
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis
                          dataKey="x"
                          name="Suppression"
                          stroke="#666"
                          label={{ value: 'Suppression Level', position: 'bottom', fill: '#666' }}
                        />
                        <YAxis
                          dataKey="y"
                          name="Coherence"
                          stroke="#666"
                          label={{ value: 'Final Coherence', angle: -90, position: 'left', fill: '#666' }}
                        />
                        <Tooltip
                          cursor={{ strokeDasharray: '3 3' }}
                          contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.9)',
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}
                          formatter={(value: number) => value.toFixed(3)}
                          labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ''}
                        />
                        <Scatter
                          data={scatterData}
                          fill="#8b5cf6"
                        >
                          {scatterData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getRiskColor(entry.risk)} />
                          ))}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Countries Tab */}
          <TabsContent value="countries">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Country List */}
              <div className="lg:col-span-1 bg-card rounded-lg p-4 border border-border max-h-[600px] overflow-y-auto">
                <h3 className="text-lg font-medium text-foreground mb-4 sticky top-0 bg-card py-2">
                  Countries ({countrySimulations.length})
                </h3>
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(10)].map((_, i) => (
                      <Skeleton key={i} className="h-12" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {countrySimulations
                      .sort((a, b) => a.simulation.final_coherence - b.simulation.final_coherence)
                      .map(country => (
                        <button
                          key={country.country_code}
                          onClick={() => setSelectedCountry(country)}
                          className={cn(
                            "w-full text-left p-3 rounded-lg border transition-colors",
                            selectedCountry?.country_code === country.country_code
                              ? "bg-purple-900/50 border-purple-500/50"
                              : "bg-card/80 border-border hover:border-border"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-foreground font-medium">
                              {country.country_code} - {country.country_name}
                            </span>
                            <Badge
                              style={{ backgroundColor: getRiskColor(country.simulation.risk_level) }}
                              className="text-foreground text-xs"
                            >
                              {country.simulation.risk_level}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between mt-1 text-sm">
                            <span className="text-muted-foreground/80">
                              Coherence: {(country.simulation.final_coherence * 100).toFixed(1)}%
                            </span>
                            <span className={cn(
                              country.simulation.coherence_change > 0 ? "text-green-400" : "text-red-400"
                            )}>
                              {country.simulation.coherence_change > 0 ? '+' : ''}
                              {(country.simulation.coherence_change * 100).toFixed(1)}%
                            </span>
                          </div>
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* Country Detail */}
              <div className="lg:col-span-2 bg-card rounded-lg p-6 border border-border">
                {selectedCountry ? (
                  <CountryDetail country={selectedCountry} />
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground/70">
                    Select a country to view details
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis">
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="text-lg font-medium text-foreground mb-4">Lowest Coherence Countries</h3>
              {isLoading ? (
                <Skeleton className="h-96" />
              ) : (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={coherenceRankingData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis type="number" domain={[0, 1]} stroke="#666" />
                      <YAxis dataKey="name" type="category" stroke="#666" width={50} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0,0,0,0.9)',
                          border: '1px solid rgba(255,255,255,0.1)'
                        }}
                        formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
                      />
                      <Bar dataKey="coherence" name="Final Coherence">
                        {coherenceRankingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getRiskColor(entry.risk)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'green' | 'yellow' | 'orange' | 'red' | 'purple';
}> = ({ label, value, icon, color }) => {
  const colorClasses = {
    green: 'text-green-400 bg-green-900/20 border-green-500/30',
    yellow: 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30',
    orange: 'text-orange-400 bg-orange-900/20 border-orange-500/30',
    red: 'text-red-400 bg-red-900/20 border-red-500/30',
    purple: 'text-purple-400 bg-purple-900/20 border-purple-500/30'
  };

  return (
    <div className={cn(
      "rounded-lg p-4 border",
      color ? colorClasses[color] : "bg-card border-border text-foreground"
    )}>
      <div className="flex items-center gap-2 mb-2 text-muted-foreground/80">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
};

// Country Detail Component
const CountryDetail: React.FC<{ country: CountrySimulation }> = ({ country }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-foreground">{country.country_name}</h2>
          <p className="text-muted-foreground/80">{country.governance_category}</p>
        </div>
        <Badge
          style={{ backgroundColor: getRiskColor(country.simulation.risk_level) }}
          className="text-foreground text-lg px-3 py-1"
        >
          {country.simulation.risk_level.toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card/80 rounded-lg p-3">
          <div className="text-xs text-muted-foreground/70">Initial Coherence</div>
          <div className="text-xl text-foreground">
            {(country.simulation.initial_coherence * 100).toFixed(1)}%
          </div>
        </div>
        <div className="bg-card/80 rounded-lg p-3">
          <div className="text-xs text-muted-foreground/70">Final Coherence</div>
          <div className="text-xl" style={{ color: getRiskColor(country.simulation.risk_level) }}>
            {(country.simulation.final_coherence * 100).toFixed(1)}%
          </div>
        </div>
        <div className="bg-card/80 rounded-lg p-3">
          <div className="text-xs text-muted-foreground/70">Change</div>
          <div className={cn(
            "text-xl",
            country.simulation.coherence_change > 0 ? "text-green-400" : "text-red-400"
          )}>
            {country.simulation.coherence_change > 0 ? '+' : ''}
            {(country.simulation.coherence_change * 100).toFixed(1)}%
          </div>
        </div>
        <div className="bg-card/80 rounded-lg p-3">
          <div className="text-xs text-muted-foreground/70">Trend</div>
          <div className="text-xl text-foreground capitalize flex items-center gap-1">
            {country.simulation.trend === 'improving' && <TrendingUp className="h-4 w-4 text-green-400" />}
            {country.simulation.trend === 'declining' && <TrendingDown className="h-4 w-4 text-red-400" />}
            {country.simulation.trend}
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h4 className="text-sm font-medium text-muted-foreground/80 mb-3">Simulation Parameters</h4>
        <div className="grid grid-cols-2 gap-4">
          <ParameterBar label="Suppression" value={country.parameters.suppression_level} />
          <ParameterBar label="Fear Factor" value={country.parameters.fear_factor} />
          <ParameterBar label="Supremacist Ideology" value={country.parameters.supremacist_ideology} />
          <ParameterBar label="Resource Scarcity" value={country.parameters.resource_scarcity} />
        </div>
      </div>

      {country.simulation.coherence_history && (
        <div className="border-t border-border pt-4">
          <h4 className="text-sm font-medium text-muted-foreground/80 mb-3">Coherence History</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={country.simulation.coherence_history.map((c, i) => ({ timestep: i, coherence: c }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="timestep" stroke="#666" />
                <YAxis domain={[0, 1]} stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                  formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                />
                <Line
                  type="monotone"
                  dataKey="coherence"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

// Parameter Bar Component
const ParameterBar: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  const percentage = value * 100;
  const color = value > 0.7 ? '#ef4444' : value > 0.4 ? '#eab308' : '#22c55e';

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-muted-foreground/80">{label}</span>
        <span className="text-foreground">{percentage.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-card rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

export default SimulationAdmin;
