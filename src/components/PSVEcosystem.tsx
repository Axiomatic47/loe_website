// src/components/PSVEcosystem.tsx
// Three-Tier PSV (Power Separation Vulnerability) Framework Visualizer
// Based on the Madisonian Separation of Powers Compliance Framework

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  type ConstitutionalAuthorityMap,
  type Position,
  type Power,
  type CompoundPSV,
  BRANCH_INFO,
  PSV_STATUS_INFO,
  PSV_TIER_INFO,
  getPosition,
  getAllPositions,
  getCompoundPSVs,
  hasUSurpationRisk,
  hasAbdicationRisk,
  countPSVs,
  type PSVStatus,
} from '@/data/constitutionalAuthority';

interface PSVEcosystemProps {
  data: ConstitutionalAuthorityMap;
}

type ViewMode = 'overview' | 'positions' | 'compound' | 'analysis';

export const PSVEcosystem: React.FC<PSVEcosystemProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedPositionId, setSelectedPositionId] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<PSVStatus | ''>('');

  const allPositions = useMemo(() => getAllPositions(data), [data]);
  const compoundPSVs = useMemo(() => getCompoundPSVs(data), [data]);
  const psvFramework = data.psv_framework;

  const selectedPosition = useMemo(() => {
    if (!selectedPositionId) return null;
    return getPosition(data, selectedPositionId);
  }, [data, selectedPositionId]);

  // Aggregate PSV statistics
  const psvStats = useMemo(() => {
    let totalUsurpation = 0;
    let totalAbdication = 0;
    let totalBoth = 0;
    let totalIrrefutable = 0;
    let positionsWithRisk = 0;

    allPositions.forEach(pos => {
      const counts = countPSVs(pos);
      totalUsurpation += counts.usurpation;
      totalAbdication += counts.abdication;
      totalBoth += counts.both;
      totalIrrefutable += counts.irrefutable;

      if (hasUSurpationRisk(pos) || hasAbdicationRisk(pos)) {
        positionsWithRisk++;
      }
    });

    return {
      usurpation: totalUsurpation,
      abdication: totalAbdication,
      both: totalBoth,
      irrefutable: totalIrrefutable,
      positionsWithRisk,
      totalPositions: allPositions.length,
    };
  }, [allPositions]);

  // Filter positions by PSV status
  const filteredPositions = useMemo(() => {
    if (!filterStatus) return allPositions;

    return allPositions.filter(pos => {
      const powers = pos.powers || [];
      return powers.some(p => {
        if (filterStatus === 'U') return p.psv_status === 'U' || p.psv_status === 'U/A';
        if (filterStatus === 'A') return p.psv_status === 'A' || p.psv_status === 'U/A';
        return p.psv_status === filterStatus;
      });
    });
  }, [allPositions, filterStatus]);

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Three-Tier Framework */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-4">Three-Tier PSV Framework</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(psvFramework.tiers).map(([tierId, tier]) => {
            const tierInfo = PSV_TIER_INFO[tierId as keyof typeof PSV_TIER_INFO];
            return (
              <div
                key={tierId}
                className={cn(
                  'p-5 rounded-xl border',
                  tierInfo?.bgClass || 'bg-muted border-border'
                )}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">
                    {tierId === 'primary' ? '⚠️' : tierId === 'enabling' ? '🔓' : '🛡️'}
                  </span>
                  <h4 className="text-lg font-semibold">{tier.name}</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{tier.definition}</p>
                {tier.types && (
                  <div className="mt-3">
                    <div className="text-xs text-muted-foreground/80 mb-2">Types:</div>
                    <div className="flex flex-wrap gap-1">
                      {tier.types.map((type, idx) => (
                        <span key={idx} className="px-2 py-0.5 text-xs bg-card/60 rounded">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {tier.examples && (
                  <div className="mt-3">
                    <div className="text-xs text-muted-foreground/80 mb-2">Examples:</div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {tier.examples.slice(0, 3).map((ex, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-muted-foreground/70">•</span>
                          <span>{ex}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* PSV Status Types */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-4">PSV Status Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(PSV_STATUS_INFO).map(([status, info]) => (
            <button
              key={status}
              onClick={() => {
                setFilterStatus(status as PSVStatus);
                setViewMode('positions');
              }}
              className={cn(
                'p-4 rounded-lg border text-left transition-all hover:scale-105',
                info.bgClass
              )}
            >
              <div className="text-2xl font-bold mb-1">{status}</div>
              <div className="text-sm font-semibold mb-1">{info.name}</div>
              <div className="text-xs opacity-80">{info.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-4">System Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-destructive">{psvStats.usurpation}</div>
            <div className="text-sm text-muted-foreground/80">Usurpation Risks</div>
          </div>
          <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-orange-400">{psvStats.abdication}</div>
            <div className="text-sm text-muted-foreground/80">Abdication Risks</div>
          </div>
          <div className="bg-secondary border border-border rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-foreground/85">{psvStats.both}</div>
            <div className="text-sm text-muted-foreground/80">Both U/A Risks</div>
          </div>
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-primary">{psvStats.irrefutable}</div>
            <div className="text-sm text-muted-foreground/80">Irrefutable</div>
          </div>
        </div>
        <div className="mt-4 text-center text-muted-foreground/80 text-sm">
          {psvStats.positionsWithRisk} of {psvStats.totalPositions} positions have vulnerability risks
        </div>
      </div>

      {/* PSV Interaction Diagram */}
      <div className="bg-card/80 border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">PSV Ecosystem Interaction</h3>
        <div className="relative">
          <pre className="text-xs text-muted-foreground font-mono overflow-x-auto">
{`                    ┌─────────────────────────────────────┐
                    │         CONSTITUTIONAL TEXT          │
                    │    (Enumerated Assigned Powers)      │
                    └─────────────────┬───────────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
              ▼                       ▼                       ▼
    ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
    │   USURPATION    │     │   ABDICATION    │     │   IRREFUTABLE   │
    │    (Type U)     │     │    (Type A)     │     │    (Type IRR)   │
    │                 │     │                 │     │                 │
    │ Wrongful        │     │ Failure to      │     │ Self-executing  │
    │ exercise by     │     │ exercise        │     │ Cannot be       │
    │ non-holder      │     │ assigned power  │     │ violated        │
    └────────┬────────┘     └────────┬────────┘     └─────────────────┘
             │                       │
             └───────────┬───────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │   ENABLING PSVs     │
              │                     │
              │ Laws/doctrines that │
              │ permit delegation   │
              │ of non-delegable    │
              │ powers              │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │  SHIELDING PSVs     │
              │                     │
              │ Doctrines blocking  │
              │ remedy for          │
              │ violations          │
              └─────────────────────┘`}
          </pre>
        </div>
      </div>
    </div>
  );

  const renderPositions = () => (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus('')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm transition-colors',
            filterStatus === ''
              ? 'bg-secondary text-foreground'
              : 'bg-card/80 text-muted-foreground/80 hover:text-foreground'
          )}
        >
          All
        </button>
        {Object.entries(PSV_STATUS_INFO).map(([status, info]) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status as PSVStatus)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm transition-colors',
              filterStatus === status
                ? info.bgClass
                : 'bg-card/80 text-muted-foreground/80 hover:text-foreground'
            )}
          >
            {status} - {info.name}
          </button>
        ))}
      </div>

      {/* Position List */}
      <div className="space-y-4">
        {filteredPositions.map(pos => {
          const counts = countPSVs(pos);
          const hasRisk = hasUSurpationRisk(pos) || hasAbdicationRisk(pos);

          return (
            <div
              key={pos.id}
              className={cn(
                'bg-card/80 border rounded-lg p-4 cursor-pointer transition-all',
                selectedPositionId === pos.id
                  ? 'border-primary/40 bg-primary/10'
                  : hasRisk
                    ? 'border-border hover:border-primary/40'
                    : 'border-border hover:border-border'
              )}
              onClick={() => setSelectedPositionId(pos.id === selectedPositionId ? '' : pos.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-lg',
                    BRANCH_INFO[pos.branch]?.bgClass
                  )}>
                    {BRANCH_INFO[pos.branch]?.icon}
                  </span>
                  <div>
                    <h4 className="text-foreground font-semibold">{pos.name}</h4>
                    <p className="text-xs text-muted-foreground/70">{pos.status}</p>
                  </div>
                </div>

                {/* PSV Counts */}
                <div className="flex gap-2">
                  {counts.usurpation > 0 && (
                    <span className={cn('px-2 py-1 text-xs rounded', PSV_STATUS_INFO['U'].bgClass)}>
                      U: {counts.usurpation}
                    </span>
                  )}
                  {counts.abdication > 0 && (
                    <span className={cn('px-2 py-1 text-xs rounded', PSV_STATUS_INFO['A'].bgClass)}>
                      A: {counts.abdication}
                    </span>
                  )}
                  {counts.both > 0 && (
                    <span className={cn('px-2 py-1 text-xs rounded', PSV_STATUS_INFO['U/A'].bgClass)}>
                      U/A: {counts.both}
                    </span>
                  )}
                  {counts.irrefutable > 0 && (
                    <span className={cn('px-2 py-1 text-xs rounded', PSV_STATUS_INFO['IRR'].bgClass)}>
                      IRR: {counts.irrefutable}
                    </span>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {selectedPositionId === pos.id && pos.powers && (
                <div className="mt-4 pt-4 border-t border-border space-y-3">
                  {pos.powers.map((power, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 text-sm"
                    >
                      <span className={cn(
                        'px-2 py-0.5 text-xs rounded shrink-0',
                        PSV_STATUS_INFO[power.psv_status]?.bgClass
                      )}>
                        {power.psv_status}
                      </span>
                      <div>
                        <div className="text-foreground">{power.text}</div>
                        {power.citation && (
                          <div className="text-muted-foreground/70 text-xs mt-1">{power.citation}</div>
                        )}
                        {power.notes && (
                          <div className="text-muted-foreground text-xs mt-1 italic">{power.notes}</div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* PSV Vulnerabilities */}
                  {pos.psv_vulnerabilities && (
                    <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                      <div className="text-destructive text-xs font-semibold mb-2">PSV VULNERABILITIES</div>
                      {pos.psv_vulnerabilities.usurpation_risk && (
                        <div className="text-sm text-muted-foreground mb-1">
                          <span className="text-destructive">Usurpation:</span> {pos.psv_vulnerabilities.usurpation_risk}
                        </div>
                      )}
                      {pos.psv_vulnerabilities.abdication_risk && (
                        <div className="text-sm text-muted-foreground">
                          <span className="text-orange-400">Abdication:</span> {pos.psv_vulnerabilities.abdication_risk}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderCompound = () => (
    <div className="space-y-6">
      <div className="text-muted-foreground/80 text-sm mb-4">
        Compound PSVs are doctrines that simultaneously exhibit Primary, Enabling, AND Shielding characteristics.
        They represent the most severe form of constitutional vulnerability.
      </div>

      {compoundPSVs.length > 0 ? (
        <div className="space-y-4">
          {compoundPSVs.map((psv, idx) => (
            <div
              key={idx}
              className="bg-secondary/60 border border-border rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">⚡</span>
                <h3 className="text-xl font-bold text-foreground">{psv.name}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Primary */}
                <div className={cn('p-4 rounded-lg', PSV_TIER_INFO.primary.bgClass)}>
                  <div className="text-xs font-semibold mb-2">PRIMARY PSV</div>
                  <p className="text-sm">{psv.primary}</p>
                </div>

                {/* Enabling */}
                <div className={cn('p-4 rounded-lg', PSV_TIER_INFO.enabling.bgClass)}>
                  <div className="text-xs font-semibold mb-2">ENABLING PSV</div>
                  <p className="text-sm">{psv.enabling}</p>
                </div>

                {/* Shielding */}
                <div className={cn('p-4 rounded-lg', PSV_TIER_INFO.shielding.bgClass)}>
                  <div className="text-xs font-semibold mb-2">SHIELDING PSV</div>
                  <p className="text-sm">{psv.shielding}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground/80">
          <div className="text-4xl mb-4 opacity-30">⚡</div>
          <p>No compound PSVs defined in the database</p>
        </div>
      )}

      {/* Example Analysis */}
      <div className="bg-card/80 border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Example: Qualified Immunity as Compound PSV</h3>
        <div className="space-y-4 text-sm">
          <div className="flex items-start gap-3">
            <span className="px-2 py-1 text-xs rounded bg-destructive/15 text-destructive shrink-0">PRIMARY</span>
            <div className="text-muted-foreground">
              Shields officials who violate constitutional rights from personal liability, enabling the original violation to persist without remedy.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="px-2 py-1 text-xs rounded bg-secondary text-foreground/85 shrink-0">ENABLING</span>
            <div className="text-muted-foreground">
              By eliminating consequences, creates institutional tolerance for rights violations and disincentivizes constitutional compliance.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="px-2 py-1 text-xs rounded bg-secondary text-foreground/85 shrink-0">SHIELDING</span>
            <div className="text-muted-foreground">
              Prevents victims from obtaining damages for constitutional violations, blocking the Article III remedy pathway.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalysis = () => (
    <div className="space-y-6">
      <div className="text-muted-foreground/80 text-sm mb-4">
        Analyze a specific position's PSV exposure and constitutional vulnerabilities.
      </div>

      {/* Position Selector */}
      <div>
        <label className="block text-sm text-muted-foreground/80 mb-2">Select Position to Analyze</label>
        <select
          value={selectedPositionId}
          onChange={(e) => setSelectedPositionId(e.target.value)}
          className="w-full md:w-96 bg-card border border-border rounded-lg px-4 py-2 text-foreground focus:border-primary focus:outline-none"
        >
          <option value="">-- Select a Position --</option>
          {allPositions.map((pos) => (
            <option key={pos.id} value={pos.id}>
              {BRANCH_INFO[pos.branch]?.icon} {pos.name}
            </option>
          ))}
        </select>
      </div>

      {selectedPosition ? (
        <div className="space-y-6">
          {/* Position Summary */}
          <div className="bg-card/80 border border-border rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <span className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center text-2xl',
                BRANCH_INFO[selectedPosition.branch]?.bgClass
              )}>
                {BRANCH_INFO[selectedPosition.branch]?.icon}
              </span>
              <div>
                <h3 className="text-xl font-bold text-foreground">{selectedPosition.name}</h3>
                <p className="text-muted-foreground/80">{selectedPosition.status}</p>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {(() => {
                const counts = countPSVs(selectedPosition);
                return (
                  <>
                    <div className={cn(
                      'p-3 rounded-lg text-center',
                      counts.usurpation > 0 ? 'bg-destructive/15 border border-destructive/30' : 'bg-card/60 border border-border'
                    )}>
                      <div className={cn('text-2xl font-bold', counts.usurpation > 0 ? 'text-destructive' : 'text-muted-foreground/70')}>
                        {counts.usurpation}
                      </div>
                      <div className="text-xs text-muted-foreground/80">Usurpation</div>
                    </div>
                    <div className={cn(
                      'p-3 rounded-lg text-center',
                      counts.abdication > 0 ? 'bg-orange-900/30 border border-orange-500/30' : 'bg-card/60 border border-border'
                    )}>
                      <div className={cn('text-2xl font-bold', counts.abdication > 0 ? 'text-orange-400' : 'text-muted-foreground/70')}>
                        {counts.abdication}
                      </div>
                      <div className="text-xs text-muted-foreground/80">Abdication</div>
                    </div>
                    <div className={cn(
                      'p-3 rounded-lg text-center',
                      counts.both > 0 ? 'bg-secondary border border-border' : 'bg-card/60 border border-border'
                    )}>
                      <div className={cn('text-2xl font-bold', counts.both > 0 ? 'text-foreground/85' : 'text-muted-foreground/70')}>
                        {counts.both}
                      </div>
                      <div className="text-xs text-muted-foreground/80">Both U/A</div>
                    </div>
                    <div className={cn(
                      'p-3 rounded-lg text-center',
                      counts.irrefutable > 0 ? 'bg-primary/15 border border-primary/30' : 'bg-card/60 border border-border'
                    )}>
                      <div className={cn('text-2xl font-bold', counts.irrefutable > 0 ? 'text-primary' : 'text-muted-foreground/70')}>
                        {counts.irrefutable}
                      </div>
                      <div className="text-xs text-muted-foreground/80">Irrefutable</div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Powers with PSV Analysis */}
          {selectedPosition.powers && selectedPosition.powers.length > 0 && (
            <div className="bg-card/80 border border-border rounded-xl p-6">
              <h4 className="text-lg font-semibold text-foreground mb-4">Powers & PSV Status</h4>
              <div className="space-y-3">
                {selectedPosition.powers.map((power, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'p-4 rounded-lg border',
                      PSV_STATUS_INFO[power.psv_status]?.bgClass.replace('text-', 'border-').replace('/20', '/30')
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className={cn(
                        'px-2 py-1 text-xs font-bold rounded shrink-0',
                        PSV_STATUS_INFO[power.psv_status]?.bgClass
                      )}>
                        {power.psv_status}
                      </span>
                      <div>
                        <div className="text-foreground font-medium">{power.text}</div>
                        {power.citation && (
                          <div className="text-muted-foreground/70 text-sm mt-1">{power.citation}</div>
                        )}
                        {power.notes && (
                          <div className="text-muted-foreground text-sm mt-2 italic bg-secondary px-2 py-1 rounded">
                            {power.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vulnerabilities Detail */}
          {selectedPosition.psv_vulnerabilities && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-destructive mb-4">Identified Vulnerabilities</h4>

              {selectedPosition.psv_vulnerabilities.usurpation_risk && (
                <div className="mb-4">
                  <div className="text-destructive text-sm font-semibold mb-1">Usurpation Risk</div>
                  <p className="text-muted-foreground text-sm">{selectedPosition.psv_vulnerabilities.usurpation_risk}</p>
                </div>
              )}

              {selectedPosition.psv_vulnerabilities.abdication_risk && (
                <div className="mb-4">
                  <div className="text-orange-400 text-sm font-semibold mb-1">Abdication Risk</div>
                  <p className="text-muted-foreground text-sm">{selectedPosition.psv_vulnerabilities.abdication_risk}</p>
                </div>
              )}

              {selectedPosition.psv_vulnerabilities.historical_usurpations && (
                <div className="mb-4">
                  <div className="text-destructive text-sm font-semibold mb-1">Historical Usurpations</div>
                  <ul className="text-muted-foreground text-sm space-y-1">
                    {selectedPosition.psv_vulnerabilities.historical_usurpations.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-destructive">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedPosition.psv_vulnerabilities.madisonian_test_failure && (
                <div>
                  <div className="text-foreground/85 text-sm font-semibold mb-2">Madisonian Test Failures</div>
                  <div className="space-y-2">
                    {Object.entries(selectedPosition.psv_vulnerabilities.madisonian_test_failure).map(([step, failure]) => (
                      <div key={step} className="flex items-start gap-2 text-sm">
                        <span className="px-2 py-0.5 bg-secondary text-foreground/85 rounded text-xs shrink-0">
                          Step {step}
                        </span>
                        <span className="text-muted-foreground">{failure}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground/80">
          <div className="text-4xl mb-4 opacity-30">📊</div>
          <p>Select a position to view its PSV analysis</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-foreground">PSV Ecosystem</h2>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setViewMode('overview')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm transition-colors',
              viewMode === 'overview'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card/80 text-muted-foreground/80 hover:text-foreground'
            )}
          >
            Overview
          </button>
          <button
            onClick={() => setViewMode('positions')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm transition-colors',
              viewMode === 'positions'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card/80 text-muted-foreground/80 hover:text-foreground'
            )}
          >
            By Position
          </button>
          <button
            onClick={() => setViewMode('compound')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm transition-colors',
              viewMode === 'compound'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card/80 text-muted-foreground/80 hover:text-foreground'
            )}
          >
            Compound PSVs
          </button>
          <button
            onClick={() => setViewMode('analysis')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm transition-colors',
              viewMode === 'analysis'
                ? 'bg-destructive text-destructive-foreground'
                : 'bg-card/80 text-muted-foreground/80 hover:text-foreground'
            )}
          >
            Analysis
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-card border border-border rounded-xl p-6">
        {viewMode === 'overview' && renderOverview()}
        {viewMode === 'positions' && renderPositions()}
        {viewMode === 'compound' && renderCompound()}
        {viewMode === 'analysis' && renderAnalysis()}
      </div>
    </div>
  );
};

export default PSVEcosystem;
