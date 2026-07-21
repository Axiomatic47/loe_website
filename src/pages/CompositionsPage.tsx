// src/pages/CompositionsPage.tsx - Fixed infinite loop issues
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { useCompositionStore } from "@/utils/compositionData";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, RefreshCw, Bug, Eye, EyeOff, Music, FileText, Send, BookOpen, Database, Scale, ChevronRight } from "lucide-react";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

interface BlurPanelProps {
  children: React.ReactNode;
  className?: string;
  darkened?: boolean;
}

const BlurPanel: React.FC<BlurPanelProps> = ({
  children,
  className,
  darkened = false
}) => {
  return (
    <div
      className={cn(
        "relative rounded-lg",
        
        darkened ? "bg-card/80" : "bg-secondary/60",
        "border border-border",
        className
      )}
    >
      {children}
    </div>
  );
};

const getCollectionTitle = (compositionId: string | undefined) => {
  switch (compositionId) {
    case "manuscript":
      return "Research";
    case "data":
      return "Evidence";
    case "map":
      return "Egalitarian World Map";
    case "copyright":
      return "Copyright Holder Notifications";
    case "constitutional":
      return "Cases";
    default:
      return "Content";
  }
};

const CompositionsPage: React.FC = () => {
  const { compositionId } = useParams<{ compositionId: string }>();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [showDebug, setShowDebug] = useState(import.meta.env.DEV);

  useDocumentMeta(getCollectionTitle(compositionId));

  // Get store state and actions separately to prevent dependency issues
  const {
    manuscript,
    data,
    map,
    copyright,
    initialized,
    loading,
    error,
    lastRefresh,
    debugMode
  } = useCompositionStore();

  // Get actions separately to prevent infinite loops
  const refreshCompositions = useCompositionStore(state => state.refreshCompositions);
  const forceRefresh = useCompositionStore(state => state.forceRefresh);
  const setDebugMode = useCompositionStore(state => state.setDebugMode);
  const getCollectionCompositions = useCompositionStore(state => state.getCollectionCompositions);

  // Handle navigation redirects
  useEffect(() => {
    if (compositionId === "memorandum") {
      navigate("/composition/manuscript", { replace: true });
      return;
    }
  }, [compositionId, navigate]);

  // Mount effect - runs only once
  useEffect(() => {
    setMounted(true);
    if (import.meta.env.DEV) console.log('🚀 CompositionsPage mounted for collection:', compositionId);
  }, [compositionId]);

  // Load data effect - stable dependencies to prevent loops
  useEffect(() => {
    if (!mounted) return;

    const loadData = async () => {
      try {
        if (import.meta.env.DEV) console.log('📊 Loading compositions for:', compositionId);

        // Enable debug mode in development
        if (import.meta.env.DEV && !debugMode) {
          setDebugMode(true);
        }

        // Only refresh if not initialized or if collection changed
        if (!initialized) {
          await refreshCompositions();
        }
      } catch (error) {
        if (import.meta.env.DEV) console.error('💥 Error in loadData:', error);
      }
    };

    loadData();
  }, [mounted, compositionId, initialized]); // Stable dependencies

  // Get compositions for current collection
  const compositions = getCollectionCompositions(compositionId || '');
  const collectionTitle = getCollectionTitle(compositionId);

  // Stable event handlers
  const handleCompositionClick = useCallback((index: number) => {
    const targetUrl = `/composition/${compositionId}/composition/${index + 1}/section/1`;
    if (import.meta.env.DEV) console.log('🔗 Navigating to:', targetUrl);
    navigate(targetUrl);
  }, [compositionId, navigate]);

  const handleBackClick = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleForceRefresh = useCallback(async () => {
    if (import.meta.env.DEV) console.log('🔄 Force refresh requested');
    await forceRefresh();
  }, [forceRefresh]);

  const toggleDebugMode = useCallback(() => {
    setShowDebug(!showDebug);
  }, [showDebug]);

  // Don't render until mounted
  if (!mounted) {
    return null;
  }

  if (import.meta.env.DEV) {
    console.log('🎯 CompositionsPage render:', {
      compositionId,
      collectionTitle,
      compositionsCount: compositions.length,
      initialized,
      loading,
      error: !!error
    });
  }

  return (
    <PageLayout>
      <main className="container mx-auto px-4 py-12">
        <BlurPanel className="p-8 sm:p-12 mb-16">
          <div className="flex justify-between items-center mb-8">
            <Button
              variant="ghost"
              onClick={handleBackClick}
              className="text-foreground hover:bg-secondary/60"
            >
              ← Back to Home
            </Button>

            {import.meta.env.DEV && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleDebugMode}
                  className="text-muted-foreground/80 hover:text-foreground hover:bg-secondary/60"
                >
                  {showDebug ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  Debug
                </Button>
              </div>
            )}
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-serif mb-6 text-foreground">
              {collectionTitle}
            </h1>

            {import.meta.env.DEV && (
              <div className="flex justify-center gap-2 mb-4">
                <Badge variant="outline" className="bg-card text-foreground border-border">
                  Collection: {compositionId}
                </Badge>
                <Badge variant="outline" className="bg-card text-foreground border-border">
                  Items: {compositions.length}
                </Badge>
                {lastRefresh && (
                  <Badge variant="outline" className="bg-card text-foreground border-border">
                    Updated: {lastRefresh.toLocaleTimeString()}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Debug Information */}
          {showDebug && (
            <div className="mb-8 p-4 bg-card/80 rounded border border-border text-left">
              <div className="flex items-center gap-2 mb-4">
                <Bug className="h-4 w-4 text-blue-400" />
                <h3 className="text-foreground font-medium">Debug Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <h4 className="text-foreground mb-2">Store State</h4>
                  <div className="space-y-1">
                    <p>Initialized: <span className={initialized ? 'text-green-400' : 'text-red-400'}>{initialized ? 'Yes' : 'No'}</span></p>
                    <p>Loading: <span className={loading ? 'text-yellow-400' : 'text-muted-foreground/80'}>{loading ? 'Yes' : 'No'}</span></p>
                    <p>Error: <span className={error ? 'text-red-400' : 'text-green-400'}>{error || 'None'}</span></p>
                    <p>Last refresh: {lastRefresh?.toLocaleString() || 'Never'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-foreground mb-2">Collection Counts</h4>
                  <div className="space-y-1">
                    <p>Manuscript: <span className="text-blue-400">{manuscript.length}</span></p>
                    <p>Data: <span className="text-green-400">{data.length}</span></p>
                    <p>Map: <span className="text-purple-400">{map.length}</span></p>
                    <p>Copyright: <span className="text-orange-400">{copyright.length}</span></p>
                    <p>Current ({compositionId}): <span className="text-yellow-400">{compositions.length}</span></p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-card text-foreground border-border"
                  onClick={handleForceRefresh}
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Force Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-card text-foreground border-border"
                  onClick={() => window.open('/admin', '_blank')}
                >
                  Open Admin Panel
                </Button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-foreground" />
              <p className="text-foreground text-xl">Loading compositions...</p>
              <p className="text-muted-foreground/80 text-sm mt-2">Collection: {compositionId}</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <Alert className="mb-6 bg-secondary/60 border border-border border-l-2 border-l-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-foreground">
                <div className="mb-2">Error: {error}</div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-destructive/40 text-destructive hover:bg-destructive/10"
                    onClick={() => refreshCompositions()}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-destructive/40 text-destructive hover:bg-destructive/10"
                    onClick={handleForceRefresh}
                  >
                    Force Refresh
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Content */}
          {!loading && (
            <>
              {compositions.length === 0 ? (
                <div className="text-center py-12">
                  <h2 className="text-2xl text-foreground mb-4">No Compositions Found</h2>
                  <p className="text-muted-foreground/80 mb-6">
                    No {collectionTitle.toLowerCase()} compositions have been created yet.
                  </p>
                  <div className="space-x-4">
                    <Button
                      variant="outline"
                      className="bg-card text-foreground border-border"
                      onClick={handleForceRefresh}
                      disabled={loading}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {loading ? 'Loading...' : 'Refresh'}
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-card text-foreground border-border"
                      onClick={() => window.open('/admin', '_blank')}
                    >
                      Create Content
                    </Button>
                  </div>
                </div>
              ) : compositionId === 'copyright' ? (
                /* Special grid layout for Copyright Notifications */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {compositions.map((composition, index) => {
                    // Extract song and artist from title (format: "Song - Artist")
                    const titleParts = composition.title.split(' - ');
                    const songName = titleParts[0] || composition.title;
                    const artistName = titleParts.slice(1).join(' - ') || '';

                    // Get publisher names from section titles
                    const publishers = composition.sections?.map(s => s.title) || [];

                    return (
                      <div
                        key={`${composition.id}-${index}`}
                        className="bg-card rounded-xl p-6 border border-border
                                 cursor-pointer transition-all duration-300
                                 hover:border-primary/30 hover:shadow-md
                                 group"
                        onClick={() => handleCompositionClick(index)}
                      >
                        {/* Icon and Badge Row */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-primary/15 group-hover:bg-primary/25 transition-colors">
                              <Music className="h-5 w-5 text-primary" />
                            </div>
                            <Badge className="bg-primary/15 text-primary border border-primary/30 text-xs">
                              {publishers.length} {publishers.length === 1 ? 'Publisher' : 'Publishers'}
                            </Badge>
                          </div>
                          <Send className="h-4 w-4 text-muted-foreground/70 group-hover:text-primary transition-colors" />
                        </div>

                        {/* Song Title */}
                        <h3 className="text-xl font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                          {songName}
                        </h3>

                        {/* Artist Name */}
                        {artistName && (
                          <p className="text-muted-foreground/80 text-sm mb-4">{artistName}</p>
                        )}

                        {/* Publisher Badges */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          {publishers.map((publisher, pIndex) => (
                            <Badge
                              key={pIndex}
                              variant="outline"
                              className="bg-card/80 text-muted-foreground border-border text-xs
                                       group-hover:border-primary/40 group-hover:text-primary transition-colors"
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              {publisher}
                            </Badge>
                          ))}
                        </div>

                        {/* View Button */}
                        <div className="mt-5 pt-4 border-t border-border">
                          <span className="text-primary group-hover:text-primary/80 text-sm font-medium inline-flex items-center">
                            View Notifications
                            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : compositionId === 'constitutional' ? (
                /* Constitutional Law - Case documents with PDF info */
                <div className="grid grid-cols-1 gap-6">
                  {compositions.map((composition, index) => {
                    const sectionCount = composition.sections?.length || 0;
                    const firstSection = composition.sections?.[0];
                    const description = firstSection?.description || '';

                    return (
                      <div
                        key={`${composition.id}-${index}`}
                        className="bg-card rounded-xl p-6 border border-border
                                 cursor-pointer transition-all duration-300
                                 hover:border-primary/30 hover:shadow-md
                                 group"
                        onClick={() => handleCompositionClick(index)}
                      >
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className="p-3 rounded-lg bg-primary/15 group-hover:bg-primary/25 transition-colors flex-shrink-0">
                            <Scale className="h-6 w-6 text-primary" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                                {composition.title}
                              </h3>
                              <Badge className="bg-primary/10 text-primary border border-primary/30 text-xs flex-shrink-0">
                                {sectionCount} {sectionCount === 1 ? 'Document' : 'Documents'}
                              </Badge>
                            </div>

                            {/* Description or section list preview */}
                            {description ? (
                              <p className="text-muted-foreground/80 text-sm line-clamp-2 mb-4">{description}</p>
                            ) : sectionCount > 0 ? (
                              <p className="text-muted-foreground/80 text-sm mb-4">
                                Includes: {composition.sections?.slice(0, 3).map(s => s.title).join(', ')}
                                {sectionCount > 3 ? ` and ${sectionCount - 3} more...` : ''}
                              </p>
                            ) : null}

                            {/* View link */}
                            <span className="text-primary group-hover:text-primary/80 text-sm font-medium inline-flex items-center">
                              View Case Documents
                              <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Standard layout for manuscript, data, and other collections */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {compositions.map((composition, index) => {
                    const sectionCount = composition.sections?.length || 0;
                    const firstSection = composition.sections?.[0];

                    // Try to get preview content from various fields
                    const previewContent =
                      firstSection?.description ||
                      firstSection?.content_level_3?.replace(/^#.*\n/, '').substring(0, 200) ||
                      firstSection?.content_level_1?.replace(/^#.*\n/, '').substring(0, 200) ||
                      '';

                    // Get icon and color based on collection type
                    const getCollectionStyle = () => {
                      switch (compositionId) {
                        case 'manuscript':
                          return { icon: BookOpen, color: 'blue', label: 'Research' };
                        case 'data':
                          return { icon: Database, color: 'green', label: 'Evidence' };
                        default:
                          return { icon: FileText, color: 'gray', label: 'Content' };
                      }
                    };

                    const style = getCollectionStyle();
                    const IconComponent = style.icon;
                    // Single warm scheme per DESIGN.md — terracotta is the only accent.
                    const colorClasses = {
                      blue: {
                        bg: 'bg-primary/15',
                        bgHover: 'group-hover:bg-primary/25',
                        icon: 'text-primary',
                        badge: 'bg-secondary text-foreground/85 border border-border',
                        border: 'hover:border-primary/30',
                        shadow: 'hover:shadow-md',
                        text: 'text-primary group-hover:text-primary/80',
                        title: 'group-hover:text-primary'
                      },
                      green: {
                        bg: 'bg-primary/15',
                        bgHover: 'group-hover:bg-primary/25',
                        icon: 'text-primary',
                        badge: 'bg-secondary text-foreground/85 border border-border',
                        border: 'hover:border-primary/30',
                        shadow: 'hover:shadow-md',
                        text: 'text-primary group-hover:text-primary/80',
                        title: 'group-hover:text-primary'
                      },
                      gray: {
                        bg: 'bg-muted',
                        bgHover: 'group-hover:bg-secondary',
                        icon: 'text-muted-foreground/80',
                        badge: 'bg-secondary text-muted-foreground border border-border',
                        border: 'hover:border-border',
                        shadow: 'hover:shadow-md',
                        text: 'text-muted-foreground/80 group-hover:text-foreground',
                        title: 'group-hover:text-foreground/90'
                      }
                    };
                    const colors = colorClasses[style.color as keyof typeof colorClasses];

                    return (
                      <div
                        key={`${composition.id}-${index}`}
                        className={cn(
                          "bg-card rounded-xl p-6 border border-border",
                          "cursor-pointer transition-all duration-300",
                          colors.border,
                          colors.shadow,
                          "group"
                        )}
                        onClick={() => handleCompositionClick(index)}
                      >
                        {/* Header with icon */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className={cn("p-2 rounded-lg transition-colors flex-shrink-0", colors.bg, colors.bgHover)}>
                            <IconComponent className={cn("h-5 w-5", colors.icon)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={cn("text-lg font-semibold text-foreground transition-colors line-clamp-2", colors.title)}>
                              {composition.title}
                            </h3>
                          </div>
                          <Badge className={cn("text-xs flex-shrink-0", colors.badge)}>
                            {sectionCount} {sectionCount === 1 ? 'Section' : 'Sections'}
                          </Badge>
                        </div>

                        {/* Preview content */}
                        {previewContent ? (
                          <p className="text-muted-foreground/80 text-sm line-clamp-3 mb-4 leading-relaxed">
                            {previewContent.replace(/[#*_`]/g, '').trim()}...
                          </p>
                        ) : sectionCount > 0 ? (
                          <div className="mb-4">
                            <p className="text-muted-foreground/70 text-sm mb-2">Sections:</p>
                            <div className="flex flex-wrap gap-1">
                              {composition.sections?.slice(0, 4).map((s, i) => (
                                <Badge key={i} variant="outline" className="bg-card/80 text-muted-foreground/80 border-border text-xs">
                                  {s.title.length > 25 ? s.title.substring(0, 25) + '...' : s.title}
                                </Badge>
                              ))}
                              {sectionCount > 4 && (
                                <Badge variant="outline" className="bg-card/80 text-muted-foreground/70 border-border text-xs">
                                  +{sectionCount - 4} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted-foreground/70 text-sm mb-4 italic">No content yet</p>
                        )}

                        {/* Footer */}
                        <div className="pt-4 border-t border-border">
                          <span className={cn("text-sm font-medium inline-flex items-center", colors.text)}>
                            {style.label === 'Research' ? 'Read Research' :
                             style.label === 'Evidence' ? 'View Evidence' : 'View Content'}
                            <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </BlurPanel>
      </main>
    </PageLayout>
  );
};

export default CompositionsPage;