// src/components/AuthorityHierarchy.tsx
// Interactive Authority Hierarchy Visualizer
// Displays the constitutional authority derivation chain for positions

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  type ConstitutionalAuthorityMap,
  type Position,
  BRANCH_INFO,
  HIERARCHY_TIER_COLORS,
  getPosition,
  getPositionsByBranch,
  getAllPositions,
  getAuthorityChain,
  type Branch,
} from '@/data/constitutionalAuthority';

interface AuthorityHierarchyProps {
  data: ConstitutionalAuthorityMap;
  initialPosition?: string;
}

const TIER_NAMES = ['', 'Constitution', 'Statutes', 'Regulations', 'Policies'];

export const AuthorityHierarchy: React.FC<AuthorityHierarchyProps> = ({
  data,
  initialPosition
}) => {
  const [selectedPositionId, setSelectedPositionId] = useState<string>(initialPosition || '');
  const [selectedBranch, setSelectedBranch] = useState<Branch | ''>('');
  const [viewMode, setViewMode] = useState<'single' | 'comparison'>('single');
  const [comparePositionId, setComparePositionId] = useState<string>('');

  // Get all positions organized by branch
  const positionsByBranch = useMemo(() => {
    const branches: Branch[] = ['sovereign', 'legislative', 'executive', 'judicial', 'federalism'];
    return branches.reduce((acc, branch) => {
      acc[branch] = getPositionsByBranch(data, branch);
      return acc;
    }, {} as Record<Branch, Position[]>);
  }, [data]);

  // Get selected position
  const selectedPosition = useMemo(() => {
    if (!selectedPositionId) return null;
    return getPosition(data, selectedPositionId);
  }, [data, selectedPositionId]);

  // Get compare position
  const comparePosition = useMemo(() => {
    if (!comparePositionId) return null;
    return getPosition(data, comparePositionId);
  }, [data, comparePositionId]);

  // Filter positions by selected branch
  const filteredPositions = useMemo(() => {
    if (!selectedBranch) return getAllPositions(data);
    return positionsByBranch[selectedBranch] || [];
  }, [data, selectedBranch, positionsByBranch]);

  const renderTierBadge = (tier: number) => {
    const tierKey = `tier_${tier}` as keyof typeof HIERARCHY_TIER_COLORS;
    return (
      <span className={cn(
        'px-2 py-1 text-xs font-semibold rounded border',
        HIERARCHY_TIER_COLORS[tierKey]
      )}>
        Tier {tier}: {TIER_NAMES[tier]}
      </span>
    );
  };

  const renderHierarchyChain = (position: Position) => {
    const chain = getAuthorityChain(position);
    const constraint = position.authority_derivation?.constraint;

    return (
      <div className="space-y-3">
        {/* Position Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className={cn(
            'px-3 py-1 text-sm font-semibold rounded',
            BRANCH_INFO[position.branch]?.bgClass
          )}>
            {BRANCH_INFO[position.branch]?.icon} {position.branch.toUpperCase()}
          </span>
          <h3 className="text-xl font-bold text-foreground">{position.name}</h3>
        </div>

        {/* Authority Tier */}
        <div className="mb-4">
          {renderTierBadge(position.authority_tier)}
        </div>

        {/* Derivation Chain Visualization */}
        <div className="relative">
          {chain.map((step, index) => (
            <div key={index} className="relative pl-8 pb-6 last:pb-0">
              {/* Vertical connector line */}
              {index < chain.length - 1 && (
                <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-gradient-to-b from-white/30 to-white/10" />
              )}

              {/* Node */}
              <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-card border-2 border-border flex items-center justify-center">
                <span className="text-xs font-bold text-foreground">{step.tier}</span>
              </div>

              {/* Content */}
              <div className={cn(
                'p-4 rounded-lg border',
                HIERARCHY_TIER_COLORS[`tier_${step.tier}` as keyof typeof HIERARCHY_TIER_COLORS]
              )}>
                <div className="text-xs text-muted-foreground/80 mb-1">
                  Tier {step.tier}: {TIER_NAMES[step.tier]}
                </div>
                <div className="text-sm text-foreground font-medium">
                  {step.source}
                </div>
              </div>
            </div>
          ))}

          {chain.length === 0 && (
            <div className="text-muted-foreground/80 text-sm italic">
              No derivation chain data available for this position.
            </div>
          )}
        </div>

        {/* Constraint */}
        {constraint && (
          <div className="mt-4 p-3 bg-secondary border border-border rounded-lg">
            <div className="text-foreground/85 text-xs font-semibold mb-1">CONSTRAINT</div>
            <div className="text-foreground text-sm">{constraint}</div>
          </div>
        )}

        {/* Constitutional Sources */}
        {position.constitutional_source && position.constitutional_source.length > 0 && (
          <div className="mt-4">
            <div className="text-muted-foreground/80 text-xs font-semibold mb-2">CONSTITUTIONAL SOURCES</div>
            <div className="flex flex-wrap gap-2">
              {position.constitutional_source.map((source, idx) => (
                <span key={idx} className="px-2 py-1 text-xs bg-primary/10 text-primary border border-primary/30 rounded">
                  {source}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Relationships */}
        {position.relationships && (
          <div className="mt-4 space-y-2">
            {position.relationships.subordinate_to && position.relationships.subordinate_to.length > 0 && (
              <div>
                <div className="text-muted-foreground/80 text-xs font-semibold mb-1">REPORTS TO</div>
                <div className="flex flex-wrap gap-2">
                  {position.relationships.subordinate_to.map((id, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPositionId(id)}
                      className="px-2 py-1 text-xs bg-secondary text-foreground/85 border border-border rounded hover:bg-secondary/80 transition-colors"
                    >
                      ↑ {getPosition(data, id)?.name || id}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {position.relationships.superior_to && position.relationships.superior_to.length > 0 && (
              <div>
                <div className="text-muted-foreground/80 text-xs font-semibold mb-1">SUPERVISES</div>
                <div className="flex flex-wrap gap-2">
                  {position.relationships.superior_to.map((id, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPositionId(id)}
                      className="px-2 py-1 text-xs bg-primary/10 text-primary border border-primary/30 rounded hover:bg-primary/20 transition-colors"
                    >
                      ↓ {getPosition(data, id)?.name || id}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderGlobalHierarchy = () => {
    const tiers = data.hierarchy_tiers;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Constitutional Authority Hierarchy</h3>

        {Object.entries(tiers).map(([tierId, tier], index) => (
          <div key={tierId} className="relative">
            {/* Connector */}
            {index < Object.entries(tiers).length - 1 && (
              <div className="absolute left-6 top-full h-4 w-0.5 bg-secondary" />
            )}

            <div className={cn(
              'p-4 rounded-lg border',
              HIERARCHY_TIER_COLORS[tierId as keyof typeof HIERARCHY_TIER_COLORS]
            )}>
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-8 rounded-full bg-card/80 flex items-center justify-center text-sm font-bold">
                  {tierId.replace('tier_', '')}
                </span>
                <span className="font-semibold text-foreground">{tier.name}</span>
              </div>
              <p className="text-sm text-muted-foreground ml-11">{tier.description}</p>
              <p className="text-xs text-muted-foreground/70 ml-11 mt-1 italic">{tier.constraint}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-foreground">Authority Hierarchy</h2>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('single')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm transition-colors',
              viewMode === 'single'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card/80 text-muted-foreground/80 hover:text-foreground'
            )}
          >
            Single View
          </button>
          <button
            onClick={() => setViewMode('comparison')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm transition-colors',
              viewMode === 'comparison'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card/80 text-muted-foreground/80 hover:text-foreground'
            )}
          >
            Compare
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Branch Filter */}
        <div className="flex-1">
          <label className="block text-sm text-muted-foreground/80 mb-2">Filter by Branch</label>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value as Branch | '')}
            className="w-full bg-card border border-border rounded-lg px-4 py-2 text-foreground focus:border-primary focus:outline-none"
          >
            <option value="">All Branches</option>
            {Object.entries(BRANCH_INFO).map(([branch, info]) => (
              <option key={branch} value={branch}>
                {info.icon} {info.name}
              </option>
            ))}
          </select>
        </div>

        {/* Position Selector */}
        <div className="flex-1">
          <label className="block text-sm text-muted-foreground/80 mb-2">Select Position</label>
          <select
            value={selectedPositionId}
            onChange={(e) => setSelectedPositionId(e.target.value)}
            className="w-full bg-card border border-border rounded-lg px-4 py-2 text-foreground focus:border-primary focus:outline-none"
          >
            <option value="">-- Select a Position --</option>
            {filteredPositions.map((pos) => (
              <option key={pos.id} value={pos.id}>
                {BRANCH_INFO[pos.branch]?.icon} {pos.name}
              </option>
            ))}
          </select>
        </div>

        {/* Compare Position (if comparison mode) */}
        {viewMode === 'comparison' && (
          <div className="flex-1">
            <label className="block text-sm text-muted-foreground/80 mb-2">Compare With</label>
            <select
              value={comparePositionId}
              onChange={(e) => setComparePositionId(e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-4 py-2 text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">-- Select a Position --</option>
              {filteredPositions
                .filter(pos => pos.id !== selectedPositionId)
                .map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {BRANCH_INFO[pos.branch]?.icon} {pos.name}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Global Hierarchy or Selected Position */}
        <div className="bg-card border border-border rounded-xl p-6">
          {selectedPosition ? (
            renderHierarchyChain(selectedPosition)
          ) : (
            renderGlobalHierarchy()
          )}
        </div>

        {/* Right Panel: Compare Position or Position List */}
        <div className="bg-card border border-border rounded-xl p-6">
          {viewMode === 'comparison' && comparePosition ? (
            renderHierarchyChain(comparePosition)
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {selectedBranch ? `${BRANCH_INFO[selectedBranch]?.name} Branch Positions` : 'All Positions by Authority Tier'}
              </h3>

              {/* Group by authority tier */}
              {[1, 2, 3, 4].map(tier => {
                const tierPositions = filteredPositions.filter(p => p.authority_tier === tier);
                if (tierPositions.length === 0) return null;

                return (
                  <div key={tier} className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      {renderTierBadge(tier)}
                      <span className="text-muted-foreground/70 text-xs">({tierPositions.length})</span>
                    </div>
                    <div className="grid gap-2">
                      {tierPositions.map(pos => (
                        <button
                          key={pos.id}
                          onClick={() => setSelectedPositionId(pos.id)}
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
                            selectedPositionId === pos.id
                              ? 'bg-primary/15 border-primary/40'
                              : 'bg-card/80 border-border hover:border-border'
                          )}
                        >
                          <span className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center text-sm',
                            BRANCH_INFO[pos.branch]?.bgClass
                          )}>
                            {BRANCH_INFO[pos.branch]?.icon}
                          </span>
                          <div>
                            <div className="text-sm font-medium text-foreground">{pos.name}</div>
                            <div className="text-xs text-muted-foreground/70">{pos.status}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorityHierarchy;
