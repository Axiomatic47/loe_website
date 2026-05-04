// src/components/RelationshipMatrix.tsx
// Visual grid showing checks, balances, and coordinate relationships
// Based on the Madisonian Separation of Powers framework

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  type ConstitutionalAuthorityMap,
  type Position,
  type ChecksMatrixEntry,
  type CoordinationEntry,
  BRANCH_INFO,
  getPosition,
  getPositionsByBranch,
  getAllPositions,
  getChecksMatrix,
  getCoordinationMatrix,
  getPositionRelationships,
  type Branch,
} from '@/data/constitutionalAuthority';

interface RelationshipMatrixProps {
  data: ConstitutionalAuthorityMap;
}

type ViewMode = 'checks' | 'coordination' | 'detail';

export const RelationshipMatrix: React.FC<RelationshipMatrixProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('checks');
  const [selectedPositionId, setSelectedPositionId] = useState<string>('');
  const [highlightedRelation, setHighlightedRelation] = useState<{ from: string; to: string } | null>(null);

  // Get all positions for the matrix
  const allPositions = useMemo(() => getAllPositions(data), [data]);

  // Get main positions for the matrix (filter to tier 1-2 for readability)
  const mainPositions = useMemo(() => {
    return allPositions.filter(p => p.authority_tier <= 2);
  }, [allPositions]);

  const checksMatrix = useMemo(() => getChecksMatrix(data), [data]);
  const coordinationMatrix = useMemo(() => getCoordinationMatrix(data), [data]);

  const selectedPosition = useMemo(() => {
    if (!selectedPositionId) return null;
    return getPosition(data, selectedPositionId);
  }, [data, selectedPositionId]);

  const selectedRelationships = useMemo(() => {
    if (!selectedPositionId) return null;
    return getPositionRelationships(data, selectedPositionId);
  }, [data, selectedPositionId]);

  // Build a check relationship lookup
  const checkRelationships = useMemo(() => {
    const relationships = new Map<string, Set<string>>();

    mainPositions.forEach(pos => {
      const checks = pos.relationships?.checks || [];
      if (checks.length > 0) {
        relationships.set(pos.id, new Set(checks));
      }
    });

    return relationships;
  }, [mainPositions]);

  const hasCheck = (fromId: string, toId: string): boolean => {
    return checkRelationships.get(fromId)?.has(toId) || false;
  };

  const renderChecksMatrix = () => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-3 text-left text-xs text-muted-foreground/80 border-b border-border">
                Checker ↓ / Checked →
              </th>
              {mainPositions.map(pos => (
                <th
                  key={pos.id}
                  className="p-2 text-center text-xs border-b border-border min-w-[80px]"
                >
                  <div className={cn(
                    'px-2 py-1 rounded text-xs',
                    BRANCH_INFO[pos.branch]?.bgClass
                  )}>
                    {pos.name.split(' ')[0]}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mainPositions.map(fromPos => (
              <tr key={fromPos.id} className="border-b border-white/5">
                <td className="p-2 text-sm">
                  <button
                    onClick={() => setSelectedPositionId(fromPos.id)}
                    className={cn(
                      'flex items-center gap-2 px-2 py-1 rounded transition-colors',
                      selectedPositionId === fromPos.id
                        ? 'bg-blue-900/40'
                        : 'hover:bg-secondary/60'
                    )}
                  >
                    <span className="text-sm">{BRANCH_INFO[fromPos.branch]?.icon}</span>
                    <span className="text-foreground">{fromPos.name.split(' ')[0]}</span>
                  </button>
                </td>
                {mainPositions.map(toPos => {
                  const checks = hasCheck(fromPos.id, toPos.id);
                  const isHighlighted = highlightedRelation?.from === fromPos.id && highlightedRelation?.to === toPos.id;
                  const isSelf = fromPos.id === toPos.id;

                  return (
                    <td
                      key={toPos.id}
                      className={cn(
                        'p-2 text-center cursor-pointer transition-all',
                        isSelf && 'bg-card/80',
                        isHighlighted && 'bg-blue-900/40',
                        !isSelf && !isHighlighted && 'hover:bg-secondary/60'
                      )}
                      onMouseEnter={() => !isSelf && setHighlightedRelation({ from: fromPos.id, to: toPos.id })}
                      onMouseLeave={() => setHighlightedRelation(null)}
                      onClick={() => {
                        setSelectedPositionId(fromPos.id);
                      }}
                    >
                      {isSelf ? (
                        <span className="text-muted-foreground/70">—</span>
                      ) : checks ? (
                        <span className="text-emerald-400 font-bold">✓</span>
                      ) : (
                        <span className="text-muted-foreground/60">·</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Legend */}
        <div className="mt-4 flex gap-6 text-xs text-muted-foreground/80">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>Has check power</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground/60">·</span>
            <span>No direct check</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground/70">—</span>
            <span>Self (N/A)</span>
          </div>
        </div>
      </div>
    );
  };

  const renderCoordinationView = () => {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground/80 text-sm mb-4">
          Constitutional functions that require coordination between multiple positions.
        </p>

        {Object.entries(coordinationMatrix).map(([functionName, entry]) => (
          <div
            key={functionName}
            className="bg-card/80 border border-border rounded-lg p-4 hover:border-border transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-foreground font-semibold mb-2">{functionName}</h4>
                <p className="text-sm text-muted-foreground/80 mb-3">{entry.requirement}</p>
                <div className="flex flex-wrap gap-2">
                  {entry.positions.map((posId, idx) => {
                    const pos = getPosition(data, posId);
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedPositionId(posId)}
                        className={cn(
                          'px-3 py-1 text-xs rounded-full border transition-colors',
                          pos ? BRANCH_INFO[pos.branch]?.bgClass : 'bg-gray-900/30 text-muted-foreground/80 border-gray-500/30',
                          'hover:opacity-80'
                        )}
                      >
                        {pos?.name || posId}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="text-2xl opacity-30">🤝</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDetailView = () => {
    if (!selectedPosition || !selectedRelationships) {
      return (
        <div className="text-center py-12 text-muted-foreground/80">
          <div className="text-4xl mb-4 opacity-30">⚖️</div>
          <p>Select a position to view its relationships</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Position Header */}
        <div className="flex items-center gap-4">
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center text-xl',
            BRANCH_INFO[selectedPosition.branch]?.bgClass
          )}>
            {BRANCH_INFO[selectedPosition.branch]?.icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{selectedPosition.name}</h3>
            <p className="text-sm text-muted-foreground/80">{selectedPosition.status}</p>
          </div>
        </div>

        {/* Relationship Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Checks */}
          <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4">
            <h4 className="text-emerald-400 font-semibold mb-3 flex items-center gap-2">
              <span>⚔️</span> Checks (This position checks)
            </h4>
            {selectedRelationships.checks.length > 0 ? (
              <div className="space-y-2">
                {selectedRelationships.checks.map(pos => (
                  <button
                    key={pos.id}
                    onClick={() => setSelectedPositionId(pos.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-card/60 rounded hover:bg-card transition-colors text-left"
                  >
                    <span className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs',
                      BRANCH_INFO[pos.branch]?.bgClass
                    )}>
                      {BRANCH_INFO[pos.branch]?.icon}
                    </span>
                    <span className="text-foreground text-sm">{pos.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground/70 text-sm italic">No direct checks</p>
            )}
          </div>

          {/* Checked By */}
          <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
            <h4 className="text-amber-400 font-semibold mb-3 flex items-center gap-2">
              <span>🛡️</span> Checked By
            </h4>
            {selectedRelationships.checkedBy.length > 0 ? (
              <div className="space-y-2">
                {selectedRelationships.checkedBy.map(pos => (
                  <button
                    key={pos.id}
                    onClick={() => setSelectedPositionId(pos.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-card/60 rounded hover:bg-card transition-colors text-left"
                  >
                    <span className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs',
                      BRANCH_INFO[pos.branch]?.bgClass
                    )}>
                      {BRANCH_INFO[pos.branch]?.icon}
                    </span>
                    <span className="text-foreground text-sm">{pos.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground/70 text-sm italic">No positions check this</p>
            )}
          </div>

          {/* Superiors */}
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
            <h4 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
              <span>↑</span> Reports To
            </h4>
            {selectedRelationships.superiors.length > 0 ? (
              <div className="space-y-2">
                {selectedRelationships.superiors.map(pos => (
                  <button
                    key={pos.id}
                    onClick={() => setSelectedPositionId(pos.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-card/60 rounded hover:bg-card transition-colors text-left"
                  >
                    <span className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs',
                      BRANCH_INFO[pos.branch]?.bgClass
                    )}>
                      {BRANCH_INFO[pos.branch]?.icon}
                    </span>
                    <span className="text-foreground text-sm">{pos.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground/70 text-sm italic">No superiors (top of hierarchy)</p>
            )}
          </div>

          {/* Subordinates */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
              <span>↓</span> Supervises
            </h4>
            {selectedRelationships.subordinates.length > 0 ? (
              <div className="space-y-2">
                {selectedRelationships.subordinates.map(pos => (
                  <button
                    key={pos.id}
                    onClick={() => setSelectedPositionId(pos.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-card/60 rounded hover:bg-card transition-colors text-left"
                  >
                    <span className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs',
                      BRANCH_INFO[pos.branch]?.bgClass
                    )}>
                      {BRANCH_INFO[pos.branch]?.icon}
                    </span>
                    <span className="text-foreground text-sm">{pos.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground/70 text-sm italic">No subordinates</p>
            )}
          </div>

          {/* Coordinates With */}
          <div className="col-span-full bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
            <h4 className="text-cyan-400 font-semibold mb-3 flex items-center gap-2">
              <span>🤝</span> Coordinates With
            </h4>
            {selectedRelationships.coordinatesWith.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedRelationships.coordinatesWith.map(pos => (
                  <button
                    key={pos.id}
                    onClick={() => setSelectedPositionId(pos.id)}
                    className={cn(
                      'px-3 py-2 rounded-lg border transition-colors',
                      BRANCH_INFO[pos.branch]?.bgClass,
                      'hover:opacity-80'
                    )}
                  >
                    <span className="text-sm">{pos.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground/70 text-sm italic">No coordinate relationships defined</p>
            )}
          </div>
        </div>

        {/* Checks Matrix Entry (if available) */}
        {checksMatrix[selectedPosition.id] && (
          <div className="bg-card/80 border border-border rounded-lg p-4">
            <h4 className="text-foreground font-semibold mb-3">Check Mechanisms</h4>
            <div className="space-y-2">
              {checksMatrix[selectedPosition.id].mechanisms.map((mechanism, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-emerald-400">•</span>
                  <span className="text-muted-foreground">{mechanism}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-foreground">Relationship Matrix</h2>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('checks')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm transition-colors',
              viewMode === 'checks'
                ? 'bg-emerald-600 text-foreground'
                : 'bg-card/80 text-muted-foreground/80 hover:text-foreground'
            )}
          >
            Checks Grid
          </button>
          <button
            onClick={() => setViewMode('coordination')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm transition-colors',
              viewMode === 'coordination'
                ? 'bg-cyan-600 text-foreground'
                : 'bg-card/80 text-muted-foreground/80 hover:text-foreground'
            )}
          >
            Coordination
          </button>
          <button
            onClick={() => setViewMode('detail')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm transition-colors',
              viewMode === 'detail'
                ? 'bg-purple-600 text-foreground'
                : 'bg-card/80 text-muted-foreground/80 hover:text-foreground'
            )}
          >
            Detail View
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="text-muted-foreground/80 text-sm">
        {viewMode === 'checks' && (
          <p>Madison's "Balance and Check" framework: First BALANCE powers between branches, then CHECK their exercise. This grid shows who has constitutional authority to check whom.</p>
        )}
        {viewMode === 'coordination' && (
          <p>Constitutional functions requiring coordinate action between multiple positions. No single branch can act alone.</p>
        )}
        {viewMode === 'detail' && (
          <p>Detailed view of all relationships for a selected position.</p>
        )}
      </div>

      {/* Position Selector (for detail view) */}
      {viewMode === 'detail' && (
        <div>
          <label className="block text-sm text-muted-foreground/80 mb-2">Select Position</label>
          <select
            value={selectedPositionId}
            onChange={(e) => setSelectedPositionId(e.target.value)}
            className="w-full md:w-96 bg-card border border-border rounded-lg px-4 py-2 text-foreground focus:border-blue-500 focus:outline-none"
          >
            <option value="">-- Select a Position --</option>
            {allPositions.map((pos) => (
              <option key={pos.id} value={pos.id}>
                {BRANCH_INFO[pos.branch]?.icon} {pos.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-card border border-border rounded-xl p-6">
        {viewMode === 'checks' && renderChecksMatrix()}
        {viewMode === 'coordination' && renderCoordinationView()}
        {viewMode === 'detail' && renderDetailView()}
      </div>
    </div>
  );
};

export default RelationshipMatrix;
