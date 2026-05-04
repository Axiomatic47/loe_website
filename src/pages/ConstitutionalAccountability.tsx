// src/pages/ConstitutionalAccountability.tsx
// Constitutional Authority Map - Interactive exploration tool
// Based on the Madisonian Separation of Powers Compliance Framework

import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { cn } from '@/lib/utils';
import {
  type ConstitutionalAuthorityMap,
  loadConstitutionalAuthorityMap,
} from '@/data/constitutionalAuthority';
import { AuthorityHierarchy } from '@/components/AuthorityHierarchy';
import { RelationshipMatrix } from '@/components/RelationshipMatrix';
import { PSVEcosystem } from '@/components/PSVEcosystem';
import { MadisonianComplianceTest } from '@/components/MadisonianComplianceTest';

type PageTab = 'hierarchy' | 'relationships' | 'psv' | 'compliance-test';

const ConstitutionalAccountability = () => {
  const [activeTab, setActiveTab] = useState<PageTab>('hierarchy');
  const [data, setData] = useState<ConstitutionalAuthorityMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load the constitutional authority data
  useEffect(() => {
    loadConstitutionalAuthorityMap()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const tabs: { id: PageTab; label: string; icon: string; color: string }[] = [
    { id: 'hierarchy', label: 'Authority Hierarchy', icon: '📊', color: 'blue' },
    { id: 'relationships', label: 'Relationship Matrix', icon: '🔗', color: 'emerald' },
    { id: 'psv', label: 'PSV Ecosystem', icon: '⚠️', color: 'amber' },
    { id: 'compliance-test', label: 'Compliance Test', icon: '✓', color: 'purple' },
  ];

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">⚖️</div>
            <div className="text-foreground text-xl">Loading Constitutional Authority Map...</div>
            <div className="text-muted-foreground/80 text-sm mt-2">Parsing {data?.metadata?.title || 'framework data'}</div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !data) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-4xl mb-4">❌</div>
            <div className="text-foreground text-xl mb-2">Failed to Load Data</div>
            <div className="text-red-400 text-sm">{error || 'Unknown error occurred'}</div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-foreground rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">
            Constitutional Authority Map
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-2">
            {data.metadata.purpose}
          </p>
          <div className="text-sm text-muted-foreground/70">
            {data.metadata.framework} • Version {data.metadata.version}
          </div>
        </div>

        {/* Framework Summary */}
        <div className="bg-gradient-to-r from-blue-950/50 via-purple-950/50 to-amber-950/50 border border-border rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="p-4">
              <div className="text-3xl font-bold text-blue-400">
                {Object.keys(data.positions).length}
              </div>
              <div className="text-sm text-muted-foreground/80">Constitutional Positions</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-emerald-400">
                {Object.keys(data.cross_reference_indexes.by_power).length}
              </div>
              <div className="text-sm text-muted-foreground/80">Enumerated Powers</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-purple-400">
                {Object.keys(data.relationship_matrices.checks_matrix).length}
              </div>
              <div className="text-sm text-muted-foreground/80">Check Relationships</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-amber-400">
                {data.psv_framework.compound_psvs.length}
              </div>
              <div className="text-sm text-muted-foreground/80">Compound PSVs</div>
            </div>
          </div>
        </div>

        {/* Main Tab Selector */}
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2',
                activeTab === tab.id
                  ? `bg-${tab.color}-600 text-foreground shadow-lg shadow-${tab.color}-500/25`
                  : 'bg-card/80 text-muted-foreground hover:bg-card border border-border'
              )}
              style={{
                backgroundColor: activeTab === tab.id
                  ? tab.color === 'blue' ? 'rgb(37, 99, 235)'
                  : tab.color === 'emerald' ? 'rgb(5, 150, 105)'
                  : tab.color === 'amber' ? 'rgb(217, 119, 6)'
                  : 'rgb(147, 51, 234)'
                  : undefined
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === 'hierarchy' && (
            <AuthorityHierarchy data={data} />
          )}

          {activeTab === 'relationships' && (
            <RelationshipMatrix data={data} />
          )}

          {activeTab === 'psv' && (
            <PSVEcosystem data={data} />
          )}

          {activeTab === 'compliance-test' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-card rounded-xl border border-border p-6 mb-8">
                <h2 className="text-2xl font-serif text-foreground mb-4">
                  The Universal Separation of Powers Compliance Test
                </h2>
                <p className="text-muted-foreground mb-4">
                  This six-step test determines whether a coordinate government action impermissibly delegates
                  an assigned enumerated power in violation of the constitutional structure.
                </p>

                {/* Test Logic Overview */}
                <div className="bg-gradient-to-r from-blue-950/50 to-purple-950/50 border border-blue-500/30 rounded-lg p-4 mb-4">
                  <div className="text-blue-400 font-semibold mb-3 text-center">Madisonian Six-Step Test</div>
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-2 text-xs">
                    {data.compliance_tools.madisonian_test.steps.map((step, idx) => (
                      <div key={idx} className="bg-card/80 rounded-lg p-2 border border-border">
                        <div className="text-blue-400 font-semibold mb-1">Step {step.step}</div>
                        <div className="text-muted-foreground">{step.name}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Balance and Check Framework */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="text-amber-400 font-semibold mb-3 text-center text-sm">
                    Madison's "Balance and Check" Framework
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-3">
                      <div className="text-emerald-400 font-semibold mb-1">1. BALANCE</div>
                      <div className="text-muted-foreground">
                        Distribute powers across separate departments to prevent accumulation in any single branch.
                      </div>
                    </div>
                    <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                      <div className="text-purple-400 font-semibold mb-1">2. CHECK</div>
                      <div className="text-muted-foreground">
                        Each branch monitors and restrains the exercise of power by the others.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <MadisonianComplianceTest />
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="bg-card rounded-xl border border-border p-6 max-w-3xl mx-auto">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              The Madisonian Separation of Powers Framework
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              This tool implements the <strong className="text-blue-400">Madisonian Six-Step Compliance Test</strong> framework
              for analyzing constitutional authority. Each Position of Assigned Power is defined by indivisible
              Constitutive Conditions. Power Separation Vulnerabilities (PSVs) occur in three tiers:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-4">
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                <div className="text-red-400 font-semibold mb-1">PRIMARY PSV</div>
                <div className="text-muted-foreground/80">Direct usurpation or abdication of an EAP</div>
              </div>
              <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-3">
                <div className="text-amber-400 font-semibold mb-1">ENABLING PSV</div>
                <div className="text-muted-foreground/80">Law/doctrine permitting improper delegation</div>
              </div>
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                <div className="text-purple-400 font-semibold mb-1">SHIELDING PSV</div>
                <div className="text-muted-foreground/80">Doctrine blocking remedy for violations</div>
              </div>
            </div>
            <div className="flex justify-center gap-4 flex-wrap">
              <a
                href="/composition/constitutional"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-foreground text-sm rounded-lg transition-colors"
              >
                View Constitutional Challenges
              </a>
              <button
                onClick={() => setActiveTab('psv')}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-foreground text-sm rounded-lg transition-colors"
              >
                Explore PSV Ecosystem
              </button>
            </div>
          </div>
        </div>

        {/* Hierarchy Tiers Reference */}
        <div className="mt-8">
          <div className="bg-card border border-border rounded-xl p-6 max-w-3xl mx-auto">
            <h4 className="text-foreground font-semibold mb-4 text-center">Constitutional Authority Derivation Hierarchy</h4>
            <div className="space-y-3">
              {Object.entries(data.hierarchy_tiers).map(([tierId, tier], idx) => (
                <div key={tierId} className="flex items-center gap-4">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold',
                    idx === 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    idx === 1 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    idx === 2 ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                    'bg-gray-500/20 text-muted-foreground/80 border border-gray-500/30'
                  )}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-foreground font-medium">{tier.name}</div>
                    <div className="text-muted-foreground/70 text-xs">{tier.constraint}</div>
                  </div>
                  {idx < Object.entries(data.hierarchy_tiers).length - 1 && (
                    <div className="text-muted-foreground/70">↓</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ConstitutionalAccountability;
