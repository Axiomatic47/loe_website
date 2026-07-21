import React, { useState, useMemo } from 'react';
import {
  provisions,
  PAEPS,
  getStatistics,
  type ElementType,
  type PSVStatus
} from '../data/constitutionalProvisions';

type FilterMode = 'all' | 'paep' | 'type' | 'psv' | 'article';

const TYPE_INFO: Record<ElementType, { name: string; color: string; description: string }> = {
  PAEP: { name: 'Position', color: 'emerald', description: 'Position of Assigned Enumerated Power' },
  EAP: { name: 'Power', color: 'cyan', description: 'Enumerated Assigned Power' },
  CC: { name: 'Condition', color: 'blue', description: 'Constitutive Condition' },
  PRO: { name: 'Prohibition', color: 'red', description: 'Constitutional Prohibition' },
  RT: { name: 'Right', color: 'green', description: 'Protected Right' },
  DEF: { name: 'Definition', color: 'gray', description: 'Constitutional Definition' },
  PROC: { name: 'Procedure', color: 'purple', description: 'Constitutional Procedure' },
  TRANS: { name: 'Transitional', color: 'slate', description: 'Transitional Provision' }
};

const PSV_INFO: Record<string, { name: string; color: string; description: string }> = {
  'U': { name: 'Usurpation Only', color: 'red', description: 'Vulnerable to wrongful exercise by another' },
  'A': { name: 'Abdication Only', color: 'yellow', description: 'Vulnerable to failure to exercise' },
  'U/A': { name: 'Both', color: 'orange', description: 'Vulnerable to both usurpation and abdication' },
  'IRR': { name: 'Irrefutable', color: 'green', description: 'Mathematically determinate - cannot be violated' },
  'null': { name: 'Not Applicable', color: 'gray', description: 'No PSV classification' }
};

export function ProvisionBrowser() {
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [selectedPAEP, setSelectedPAEP] = useState<string>('');
  const [selectedType, setSelectedType] = useState<ElementType | ''>('');
  const [selectedPSV, setSelectedPSV] = useState<PSVStatus | 'null' | ''>('');
  const [selectedArticle, setSelectedArticle] = useState<string>('');
  const [searchText, setSearchText] = useState('');
  const [expandedProvision, setExpandedProvision] = useState<string | null>(null);

  const stats = useMemo(() => getStatistics(), []);

  // Get unique articles for filtering
  const articles = useMemo(() => {
    const unique = new Set(provisions.map(p => p.article));
    return Array.from(unique).sort((a, b) => {
      // Sort articles in order
      const order = ['Preamble', 'Article I', 'Article II', 'Article III', 'Article IV', 'Article V', 'Article VI', 'Article VII'];
      const aIdx = order.findIndex(o => a.startsWith(o)) ?? 99;
      const bIdx = order.findIndex(o => b.startsWith(o)) ?? 99;
      if (aIdx !== bIdx) return aIdx - bIdx;
      // For amendments, sort numerically
      const aNum = parseInt(a.replace('Amendment ', '')) || 0;
      const bNum = parseInt(b.replace('Amendment ', '')) || 0;
      return aNum - bNum;
    });
  }, []);

  // Filter provisions based on current filters
  const filteredProvisions = useMemo(() => {
    let result = provisions;

    // Apply mode-specific filter
    if (filterMode === 'paep' && selectedPAEP) {
      result = result.filter(p => p.assignedTo.includes(selectedPAEP));
    } else if (filterMode === 'type' && selectedType) {
      result = result.filter(p =>
        Array.isArray(p.type) ? p.type.includes(selectedType) : p.type === selectedType
      );
    } else if (filterMode === 'psv' && selectedPSV !== '') {
      const psvValue = selectedPSV === 'null' ? null : selectedPSV;
      result = result.filter(p => p.psv === psvValue);
    } else if (filterMode === 'article' && selectedArticle) {
      result = result.filter(p => p.article === selectedArticle);
    }

    // Apply text search
    if (searchText) {
      const search = searchText.toLowerCase();
      result = result.filter(p =>
        p.text.toLowerCase().includes(search) ||
        p.id.toLowerCase().includes(search) ||
        p.assignedTo.some(a => a.toLowerCase().includes(search))
      );
    }

    return result;
  }, [filterMode, selectedPAEP, selectedType, selectedPSV, selectedArticle, searchText]);

  const getTypeColor = (type: ElementType | ElementType[]) => {
    const t = Array.isArray(type) ? type[0] : type;
    return TYPE_INFO[t]?.color || 'gray';
  };

  const getPSVColor = (psv: PSVStatus) => {
    const key = psv === null ? 'null' : psv;
    return PSV_INFO[key]?.color || 'gray';
  };

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-cyan-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-cyan-400">{stats.totalProvisions}</div>
          <div className="text-xs text-muted-foreground/80">Total Provisions</div>
        </div>
        <div className="bg-card border border-emerald-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-emerald-400">{stats.totalEAPs}</div>
          <div className="text-xs text-muted-foreground/80">Powers (EAPs)</div>
        </div>
        <div className="bg-card border border-red-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-400">{stats.usurpationVulnerable}</div>
          <div className="text-xs text-muted-foreground/80">Usurpation Vulnerable</div>
        </div>
        <div className="bg-card border border-green-500/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{stats.rights}</div>
          <div className="text-xs text-muted-foreground/80">Rights</div>
        </div>
      </div>

      {/* Filter Mode Selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {(['all', 'paep', 'type', 'psv', 'article'] as FilterMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => {
              setFilterMode(mode);
              setSelectedPAEP('');
              setSelectedType('');
              setSelectedPSV('');
              setSelectedArticle('');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterMode === mode
                ? 'bg-blue-600 text-foreground'
                : 'bg-card/80 text-muted-foreground/80 hover:bg-card border border-border'
            }`}
          >
            {mode === 'all' && 'All Provisions'}
            {mode === 'paep' && 'By Position (PAEP)'}
            {mode === 'type' && 'By Type'}
            {mode === 'psv' && 'By PSV Status'}
            {mode === 'article' && 'By Article'}
          </button>
        ))}
      </div>

      {/* Secondary Filter */}
      <div className="flex flex-wrap gap-4 items-center justify-center">
        {filterMode === 'paep' && (
          <select
            value={selectedPAEP}
            onChange={(e) => setSelectedPAEP(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-foreground focus:border-emerald-500 focus:outline-none"
          >
            <option value="">Select Position...</option>
            {PAEPS.map(paep => (
              <option key={paep} value={paep}>{paep}</option>
            ))}
          </select>
        )}

        {filterMode === 'type' && (
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as ElementType)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-foreground focus:border-cyan-500 focus:outline-none"
          >
            <option value="">Select Type...</option>
            {(Object.keys(TYPE_INFO) as ElementType[]).map(type => (
              <option key={type} value={type}>{type} - {TYPE_INFO[type].name}</option>
            ))}
          </select>
        )}

        {filterMode === 'psv' && (
          <select
            value={selectedPSV}
            onChange={(e) => setSelectedPSV(e.target.value as PSVStatus | 'null')}
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-foreground focus:border-red-500 focus:outline-none"
          >
            <option value="">Select PSV Status...</option>
            <option value="U">U - Usurpation Only</option>
            <option value="A">A - Abdication Only</option>
            <option value="U/A">U/A - Both</option>
            <option value="IRR">IRR - Irrefutable</option>
            <option value="null">N/A - Not Applicable</option>
          </select>
        )}

        {filterMode === 'article' && (
          <select
            value={selectedArticle}
            onChange={(e) => setSelectedArticle(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-foreground focus:border-purple-500 focus:outline-none"
          >
            <option value="">Select Article...</option>
            {articles.map(article => (
              <option key={article} value={article}>{article}</option>
            ))}
          </select>
        )}

        {/* Text Search */}
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search text..."
          className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-foreground focus:border-blue-500 focus:outline-none w-64"
        />
      </div>

      {/* Results Count */}
      <div className="text-center text-sm text-muted-foreground/80">
        Showing <span className="text-foreground font-bold">{filteredProvisions.length}</span> provisions
      </div>

      {/* Provisions List */}
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
        {filteredProvisions.map((provision) => (
          <div
            key={provision.id}
            className={`bg-card border rounded-lg p-3 transition-all cursor-pointer ${
              expandedProvision === provision.id
                ? 'border-blue-500/50'
                : 'border-border hover:border-border'
            }`}
            onClick={() => setExpandedProvision(
              expandedProvision === provision.id ? null : provision.id
            )}
          >
            {/* Provision Header */}
            <div className="flex items-start gap-3">
              {/* ID */}
              <span className="text-xs font-mono text-muted-foreground/70 w-16 shrink-0">
                {provision.id}
              </span>

              {/* Type Badge */}
              <span className={`px-2 py-0.5 text-xs rounded font-mono bg-${getTypeColor(provision.type)}-500/20 text-${getTypeColor(provision.type)}-400 shrink-0`}>
                {Array.isArray(provision.type) ? provision.type.join('/') : provision.type}
              </span>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm text-muted-foreground ${expandedProvision !== provision.id ? 'line-clamp-1' : ''}`}>
                  {provision.text}
                </p>
              </div>

              {/* PSV Badge */}
              {provision.psv && (
                <span className={`px-2 py-0.5 text-xs rounded font-bold shrink-0 ${
                  provision.psv === 'U' ? 'bg-red-500/20 text-red-400' :
                  provision.psv === 'A' ? 'bg-yellow-500/20 text-yellow-400' :
                  provision.psv === 'U/A' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {provision.psv}
                </span>
              )}
            </div>

            {/* Expanded Details */}
            {expandedProvision === provision.id && (
              <div className="mt-3 pt-3 border-t border-border space-y-2">
                <div className="text-xs text-muted-foreground/80">
                  <span className="text-muted-foreground/70">Source:</span> {provision.article}
                  {provision.section && ` §${provision.section}`}
                  {provision.clause && `, Cl. ${provision.clause}`}
                </div>

                <div className="text-xs">
                  <span className="text-muted-foreground/70">Assigned to:</span>{' '}
                  <span className="text-emerald-400">
                    {provision.assignedTo.length > 0 ? provision.assignedTo.join(', ') : 'N/A'}
                  </span>
                </div>

                <div className="text-xs">
                  <span className="text-muted-foreground/70">Type:</span>{' '}
                  {(Array.isArray(provision.type) ? provision.type : [provision.type]).map(t => (
                    <span key={t} className="mr-2">
                      <span className={`text-${getTypeColor(t)}-400`}>{t}</span>
                      <span className="text-muted-foreground/70"> ({TYPE_INFO[t as ElementType]?.description})</span>
                    </span>
                  ))}
                </div>

                {provision.ccSubtype && (
                  <div className="text-xs">
                    <span className="text-muted-foreground/70">CC Subtype:</span>{' '}
                    <span className="text-blue-400 font-mono">{provision.ccSubtype}</span>
                  </div>
                )}

                {provision.psv && (
                  <div className="text-xs">
                    <span className="text-muted-foreground/70">PSV:</span>{' '}
                    <span className={`text-${getPSVColor(provision.psv)}-400`}>
                      {provision.psv} - {PSV_INFO[provision.psv]?.description}
                    </span>
                  </div>
                )}

                <div className="mt-2 p-2 bg-gray-900/50 rounded text-sm italic text-foreground">
                  "{provision.text}"
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="bg-card/80 border border-border rounded-lg p-4">
        <div className="text-xs text-muted-foreground/70 mb-3">ELEMENT TYPES</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {(Object.entries(TYPE_INFO) as [ElementType, typeof TYPE_INFO[ElementType]][]).map(([type, info]) => (
            <div key={type} className="flex items-center gap-2">
              <span className={`px-2 py-0.5 bg-${info.color}-500/20 text-${info.color}-400 rounded font-mono`}>
                {type}
              </span>
              <span className="text-muted-foreground/80">{info.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
