// src/pages/SCOTUSShadowDocket.tsx - SCOTUS Shadow Docket with sidebar navigation and PDF viewer
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  ChevronRight,
  ChevronDown,
  FileText,
  Scale,
  Search,
  X,
  Folder,
  FolderOpen,
  Home,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  PanelLeftClose,
  PanelLeft,
  BookOpen,
  Gavel,
} from "lucide-react";

interface CaseFile {
  name: string;
  displayName: string;
  path: string;
  size: number;
}

interface CaseData {
  id: string;
  date: string;
  year: number;
  docketNumber: string;
  caseName: string;
  shortDescription: string;
  files: CaseFile[];
}

interface DecadeGroup {
  decade: string;
  startYear: number;
  endYear: number;
  cases: CaseData[];
}

interface SCOTUSIndex {
  generatedAt: string;
  totalCases: number;
  totalFiles: number;
  decades: DecadeGroup[];
}

interface AnalysisFile {
  id: string;
  name: string;
  displayName: string;
  path: string;
  size: number;
  category: string;
}

interface AnalysisCategory {
  name: string;
  files: AnalysisFile[];
}

interface AnalysisIndex {
  generatedAt: string;
  totalFiles: number;
  categories: AnalysisCategory[];
}

type ViewMode = 'caselaw' | 'analysis';

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const SCOTUSShadowDocket: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState<SCOTUSIndex | null>(null);
  const [analysisIndex, setAnalysisIndex] = useState<AnalysisIndex | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('analysis');
  const [expandedDecades, setExpandedDecades] = useState<Set<string>>(new Set());
  const [expandedCases, setExpandedCases] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDecades, setFilteredDecades] = useState<DecadeGroup[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<AnalysisCategory[]>([]);
  const [selectedFile, setSelectedFile] = useState<CaseFile | null>(null);
  const [selectedAnalysisFile, setSelectedAnalysisFile] = useState<AnalysisFile | null>(null);
  const [selectedCase, setSelectedCase] = useState<CaseData | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [zoom, setZoom] = useState(100);

  // Load both indexes
  useEffect(() => {
    const loadIndexes = async () => {
      try {
        setLoading(true);

        // Load case law index
        const caseResponse = await fetch('/scotus-cases/index.json');
        if (caseResponse.ok) {
          const caseData: SCOTUSIndex = await caseResponse.json();
          setIndex(caseData);
          setFilteredDecades(caseData.decades);
          if (caseData.decades.length > 0) {
            setExpandedDecades(new Set([caseData.decades[0].decade]));
          }
        }

        // Load analysis index
        const analysisResponse = await fetch('/scotus-cases/analysis-index.json');
        if (analysisResponse.ok) {
          const analysisData: AnalysisIndex = await analysisResponse.json();
          setAnalysisIndex(analysisData);
          setFilteredCategories(analysisData.categories);

          // Expand all categories and auto-select Centennial Betrayal
          const allCategoryNames = analysisData.categories.map(c => c.name);
          setExpandedCategories(new Set(allCategoryNames));

          // Find and select Centennial Betrayal as default
          for (const category of analysisData.categories) {
            const centennialFile = category.files.find(f =>
              f.displayName.toLowerCase().includes('centennial betrayal')
            );
            if (centennialFile) {
              setSelectedAnalysisFile(centennialFile);
              setPdfLoading(true);
              break;
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadIndexes();
  }, []);

  // Filter cases based on search
  useEffect(() => {
    if (!index) return;

    if (!searchQuery.trim()) {
      setFilteredDecades(index.decades);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = index.decades
      .map(decade => ({
        ...decade,
        cases: decade.cases.filter(c =>
          c.caseName.toLowerCase().includes(query) ||
          c.docketNumber.toLowerCase().includes(query) ||
          c.shortDescription.toLowerCase().includes(query) ||
          c.date.includes(query)
        )
      }))
      .filter(decade => decade.cases.length > 0);

    setFilteredDecades(filtered);

    // Auto-expand decades with matches
    if (query) {
      setExpandedDecades(new Set(filtered.map(d => d.decade)));
    }
  }, [searchQuery, index]);

  // Filter analysis based on search
  useEffect(() => {
    if (!analysisIndex) return;

    if (!searchQuery.trim()) {
      setFilteredCategories(analysisIndex.categories);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = analysisIndex.categories
      .map(category => ({
        ...category,
        files: category.files.filter(f =>
          f.displayName.toLowerCase().includes(query) ||
          f.name.toLowerCase().includes(query)
        )
      }))
      .filter(category => category.files.length > 0);

    setFilteredCategories(filtered);

    // Auto-expand categories with matches
    if (query) {
      setExpandedCategories(new Set(filtered.map(c => c.name)));
    }
  }, [searchQuery, analysisIndex]);

  const toggleDecade = useCallback((decade: string) => {
    setExpandedDecades(prev => {
      const next = new Set(prev);
      if (next.has(decade)) {
        next.delete(decade);
      } else {
        next.add(decade);
      }
      return next;
    });
  }, []);

  const toggleCase = useCallback((caseId: string) => {
    setExpandedCases(prev => {
      const next = new Set(prev);
      if (next.has(caseId)) {
        next.delete(caseId);
      } else {
        next.add(caseId);
      }
      return next;
    });
  }, []);

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  const selectFile = useCallback((file: CaseFile, caseData: CaseData) => {
    setPdfLoading(true);
    setSelectedFile(file);
    setSelectedAnalysisFile(null);
    setSelectedCase(caseData);
  }, []);

  const selectAnalysisFile = useCallback((file: AnalysisFile) => {
    setPdfLoading(true);
    setSelectedAnalysisFile(file);
    setSelectedFile(null);
    setSelectedCase(null);
  }, []);

  const handleBackClick = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedFile(null);
    setSelectedAnalysisFile(null);
    setSelectedCase(null);
  }, []);

  const handleDownload = useCallback(() => {
    const file = selectedFile || selectedAnalysisFile;
    if (!file) return;
    const link = document.createElement('a');
    link.href = file.path;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [selectedFile, selectedAnalysisFile]);

  const handleOpenNewTab = useCallback(() => {
    const file = selectedFile || selectedAnalysisFile;
    if (!file) return;
    window.open(file.path, '_blank');
  }, [selectedFile, selectedAnalysisFile]);

  // Calculate total matching items for search results
  const totalMatchingCases = filteredDecades.reduce((sum, d) => sum + d.cases.length, 0);
  const totalMatchingAnalysis = filteredCategories.reduce((sum, c) => sum + c.files.length, 0);

  // Get current selected file info
  const currentFile = selectedFile || selectedAnalysisFile;
  const currentFilePath = currentFile?.path || null;

  return (
    <PageLayout>
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div
          className={cn(
            "flex flex-col border-r border-white/10 bg-black/40 backdrop-blur-md transition-all duration-300",
            sidebarCollapsed ? "w-0 overflow-hidden" : "w-80 min-w-80"
          )}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="h-6 w-6 text-amber-400" />
              <h1 className="text-lg font-semibold text-white">Shadow Docket</h1>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-1 mb-3 p-1 bg-black/30 rounded-lg">
              <button
                onClick={() => setViewMode('caselaw')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  viewMode === 'caselaw'
                    ? "bg-amber-500/30 text-amber-200 shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Gavel className="h-3.5 w-3.5" />
                Case Law
              </button>
              <button
                onClick={() => setViewMode('analysis')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  viewMode === 'analysis'
                    ? "bg-blue-500/30 text-blue-200 shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <BookOpen className="h-3.5 w-3.5" />
                Analysis
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={viewMode === 'caselaw' ? "Search cases..." : "Search analysis..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 h-9 bg-black/50 border-white/20 text-white text-sm
                         placeholder:text-gray-500 focus:border-amber-500/50"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {searchQuery && (
              <p className="text-xs text-gray-400 mt-2">
                {viewMode === 'caselaw'
                  ? `${totalMatchingCases} ${totalMatchingCases === 1 ? 'case' : 'cases'} found`
                  : `${totalMatchingAnalysis} ${totalMatchingAnalysis === 1 ? 'file' : 'files'} found`
                }
              </p>
            )}
          </div>

          {/* Navigation Tree */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
                </div>
              )}

              {error && (
                <div className="text-center py-8 text-red-400 text-sm">
                  Error: {error}
                </div>
              )}

              {/* Case Law Navigation */}
              {!loading && !error && viewMode === 'caselaw' && (
                <>
                  {filteredDecades.map((decade) => (
                    <div key={decade.decade} className="mb-1">
                      {/* Decade Header */}
                      <button
                        onClick={() => toggleDecade(decade.decade)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5
                                 text-left transition-colors"
                      >
                        {expandedDecades.has(decade.decade) ? (
                          <ChevronDown className="h-4 w-4 text-amber-400 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-amber-400 flex-shrink-0" />
                        )}
                        <span className="text-white font-medium text-sm">{decade.decade}</span>
                        <Badge className="ml-auto bg-white/10 text-gray-400 text-xs px-1.5 py-0">
                          {decade.cases.length}
                        </Badge>
                      </button>

                      {/* Cases in Decade */}
                      {expandedDecades.has(decade.decade) && (
                        <div className="ml-4">
                          {decade.cases.map((caseData) => (
                            <div key={caseData.id}>
                              {/* Case Header */}
                              <button
                                onClick={() => toggleCase(caseData.id)}
                                className={cn(
                                  "w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors",
                                  selectedCase?.id === caseData.id ? "bg-amber-500/20" : "hover:bg-white/5"
                                )}
                              >
                                {expandedCases.has(caseData.id) ? (
                                  <FolderOpen className="h-4 w-4 text-amber-400 flex-shrink-0" />
                                ) : (
                                  <Folder className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="text-gray-200 text-sm truncate">{caseData.caseName}</p>
                                  <p className="text-gray-500 text-xs">{caseData.date}</p>
                                </div>
                              </button>

                              {/* Files in Case */}
                              {expandedCases.has(caseData.id) && (
                                <div className="ml-6 border-l border-white/10 pl-2 my-1">
                                  {caseData.files.map((file) => (
                                    <button
                                      key={file.name}
                                      onClick={() => selectFile(file, caseData)}
                                      className={cn(
                                        "w-full flex items-center gap-2 px-2 py-1 rounded text-left transition-colors",
                                        selectedFile?.path === file.path
                                          ? "bg-amber-500/30 text-amber-200"
                                          : "hover:bg-white/5 text-gray-300"
                                      )}
                                    >
                                      <FileText className="h-3 w-3 text-red-400 flex-shrink-0" />
                                      <span className="text-xs truncate">{file.displayName}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {filteredDecades.length === 0 && searchQuery && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No cases found
                    </div>
                  )}
                </>
              )}

              {/* Analysis Navigation */}
              {!loading && !error && viewMode === 'analysis' && (
                <>
                  {filteredCategories.map((category) => (
                    <div key={category.name} className="mb-1">
                      {/* Category Header */}
                      <button
                        onClick={() => toggleCategory(category.name)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5
                                 text-left transition-colors"
                      >
                        {expandedCategories.has(category.name) ? (
                          <ChevronDown className="h-4 w-4 text-blue-400 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-blue-400 flex-shrink-0" />
                        )}
                        <span className="text-white font-medium text-sm">{category.name}</span>
                        <Badge className="ml-auto bg-white/10 text-gray-400 text-xs px-1.5 py-0">
                          {category.files.length}
                        </Badge>
                      </button>

                      {/* Files in Category */}
                      {expandedCategories.has(category.name) && (
                        <div className="ml-4">
                          {category.files.map((file) => (
                            <button
                              key={file.id}
                              onClick={() => selectAnalysisFile(file)}
                              className={cn(
                                "w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors",
                                selectedAnalysisFile?.path === file.path
                                  ? "bg-blue-500/30 text-blue-200"
                                  : "hover:bg-white/5 text-gray-300"
                              )}
                            >
                              <FileText className="h-4 w-4 text-red-400 flex-shrink-0" />
                              <span className="text-sm truncate">{file.displayName}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {filteredCategories.length === 0 && searchQuery && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No analysis files found
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-white/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackClick}
              className="w-full text-gray-400 hover:text-white hover:bg-white/5"
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>

        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80
                   border border-white/10 rounded-r-lg p-1.5 transition-all"
          style={{ left: sidebarCollapsed ? 0 : '320px' }}
        >
          {sidebarCollapsed ? (
            <PanelLeft className="h-4 w-4 text-gray-400" />
          ) : (
            <PanelLeftClose className="h-4 w-4 text-gray-400" />
          )}
        </button>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {currentFile ? (
            <>
              {/* PDF Header */}
              <div className="flex items-center justify-between px-6 py-3 bg-black/40 border-b border-white/10">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className={cn(
                      "h-5 w-5 flex-shrink-0",
                      selectedAnalysisFile ? "text-blue-400" : "text-amber-400"
                    )} />
                    <h2 className="text-white font-medium truncate">{currentFile.displayName}</h2>
                    <Badge className="bg-white/10 text-gray-400 text-xs flex-shrink-0">
                      {formatFileSize(currentFile.size)}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-sm mt-0.5 truncate">
                    {selectedCase
                      ? `${selectedCase.caseName} (${selectedCase.docketNumber})`
                      : selectedAnalysisFile?.category || 'Analysis Document'
                    }
                  </p>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {/* Zoom Controls */}
                  <div className="flex items-center gap-1 bg-black/40 rounded-lg p-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setZoom(prev => Math.max(prev - 25, 50))}
                      disabled={zoom <= 50}
                      className="h-7 w-7 p-0 text-white hover:bg-white/10"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-white text-sm min-w-[50px] text-center">{zoom}%</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setZoom(prev => Math.min(prev + 25, 200))}
                      disabled={zoom >= 200}
                      className="h-7 w-7 p-0 text-white hover:bg-white/10"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="bg-black/40 text-white border-white/20 hover:bg-white/10"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenNewTab}
                    className="bg-black/40 text-white border-white/20 hover:bg-white/10"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    New Tab
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelection}
                    className="text-gray-400 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* PDF Viewer */}
              <div className="flex-1 relative bg-black/20">
                {pdfLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                    <div className="text-center">
                      <Loader2 className={cn(
                        "h-8 w-8 animate-spin mx-auto mb-2",
                        selectedAnalysisFile ? "text-blue-400" : "text-amber-400"
                      )} />
                      <p className="text-white">Loading PDF...</p>
                    </div>
                  </div>
                )}
                <iframe
                  key={currentFile.path}
                  src={`${currentFile.path}#zoom=${zoom}`}
                  className="w-full h-full"
                  title={currentFile.displayName}
                  onLoad={() => setPdfLoading(false)}
                  style={{ border: 'none', background: '#1a1a1a' }}
                />
              </div>
            </>
          ) : (
            /* Welcome Screen */
            <div className="flex-1 flex items-center justify-center bg-black/20">
              <div className="text-center max-w-lg px-8">
                <Scale className="h-16 w-16 text-amber-400/50 mx-auto mb-6" />
                <h2 className="text-2xl font-serif text-white mb-4">
                  SCOTUS Shadow Docket Analysis
                </h2>
                <p className="text-gray-400 mb-6">
                  A comprehensive archive of Supreme Court emergency docket cases from 1952 to present.
                  Select a case from the sidebar to view documents.
                </p>
                {index && (
                  <div className="flex justify-center gap-4 flex-wrap">
                    <Badge variant="outline" className="bg-black/50 text-gray-300 border-white/20">
                      {index.totalCases} Cases
                    </Badge>
                    <Badge variant="outline" className="bg-black/50 text-gray-300 border-white/20">
                      {index.totalFiles} Documents
                    </Badge>
                    <Badge variant="outline" className="bg-black/50 text-gray-300 border-white/20">
                      {index.decades.length} Decades
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default SCOTUSShadowDocket;
