import React, { useState, useMemo } from 'react';
import {
  provisions,
  PAEPS,
  getAllEAPs,
  getConstitutiveConditions,
  type ConstitutionalProvision
} from '../data/constitutionalProvisions';

// Common actors who might usurp powers
const POTENTIAL_ACTORS = [
  'President',
  'Vice President',
  'Congress',
  'House of Representatives',
  'Senate',
  'Supreme Court',
  'Inferior Courts',
  'Judges',
  'Federal Prosecutor',
  'Attorney General',
  'Cabinet Secretary',
  'Federal Agency',
  'State Governor',
  'State Legislature',
  'State Court',
  'Private Party',
] as const;

interface ViolationResult {
  isViolation: boolean;
  violationType: 'USURPATION' | 'NONE' | 'IRREFUTABLE';
  assignedPAEP: string[];
  actor: string;
  conditionsMet: number;
  totalConditions: number;
  conditions: { text: string; met: boolean }[];
  peoplesRightSubtracted: string;
}

export function ViolationSimulator() {
  const [selectedProvision, setSelectedProvision] = useState<ConstitutionalProvision | null>(null);
  const [selectedActor, setSelectedActor] = useState<string>('');
  const [showResult, setShowResult] = useState(false);

  // Get all EAPs for the dropdown
  const eaps = useMemo(() => getAllEAPs(), []);

  // Group EAPs by article for easier navigation
  const groupedEAPs = useMemo(() => {
    const groups: Record<string, ConstitutionalProvision[]> = {};
    eaps.forEach(eap => {
      const key = eap.article;
      if (!groups[key]) groups[key] = [];
      groups[key].push(eap);
    });
    return groups;
  }, [eaps]);

  // Calculate violation result
  const result = useMemo((): ViolationResult | null => {
    if (!selectedProvision || !selectedActor) return null;

    const assignedPAEP = selectedProvision.assignedTo;

    // Check if this is an irrefutable provision
    if (selectedProvision.psv === 'IRR') {
      return {
        isViolation: false,
        violationType: 'IRREFUTABLE',
        assignedPAEP,
        actor: selectedActor,
        conditionsMet: 0,
        totalConditions: 0,
        conditions: [],
        peoplesRightSubtracted: ''
      };
    }

    // Check if actor is one of the assigned PAEPs
    const isAssigned = assignedPAEP.some(paep =>
      paep.toLowerCase() === selectedActor.toLowerCase() ||
      (selectedActor === 'Federal Prosecutor' && paep === 'President') // Special case - prosecutors are NOT President
    );

    // If actor is NOT one of the assigned PAEPs, it's usurpation
    const isViolation = !isAssigned && selectedActor !== 'Select Actor...';

    // Get constitutive conditions for the assigned PAEP
    const primaryPAEP = assignedPAEP[0];
    const conditions = getConstitutiveConditions(primaryPAEP);

    // Evaluate which conditions the actor meets
    const evaluatedConditions = conditions.slice(0, 6).map(cond => {
      // Actor can never meet conditions of another position
      const met = isAssigned;
      return {
        text: cond.text,
        met
      };
    });

    const conditionsMet = isAssigned ? evaluatedConditions.length : 0;

    // Generate the People's right that is subtracted
    const peoplesRightSubtracted = isViolation
      ? `The People's right to have "${selectedProvision.text.substring(0, 50)}..." exercised only by ${assignedPAEP.join(' or ')}`
      : '';

    return {
      isViolation,
      violationType: isViolation ? 'USURPATION' : 'NONE',
      assignedPAEP,
      actor: selectedActor,
      conditionsMet,
      totalConditions: evaluatedConditions.length,
      conditions: evaluatedConditions,
      peoplesRightSubtracted
    };
  }, [selectedProvision, selectedActor]);

  const handleProvisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const provision = provisions.find(p => p.id === id);
    setSelectedProvision(provision || null);
    setShowResult(false);
  };

  const handleActorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedActor(e.target.value);
    setShowResult(false);
  };

  const runTest = () => {
    setShowResult(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Violation Simulator</h2>
        <p className="text-muted-foreground/80 text-sm">
          Select a constitutional power and an actor to test for usurpation
        </p>
      </div>

      {/* Step 1: Select Power */}
      <div className="bg-card border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-blue-600 text-foreground text-xs font-bold px-2 py-1 rounded">STEP 1</span>
          <span className="text-blue-400 font-semibold">Select Constitutional Power (EAP)</span>
        </div>

        <select
          value={selectedProvision?.id || ''}
          onChange={handleProvisionChange}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-foreground focus:border-blue-500 focus:outline-none"
        >
          <option value="">Select a power...</option>
          {Object.entries(groupedEAPs).map(([article, eapList]) => (
            <optgroup key={article} label={article}>
              {eapList.map(eap => (
                <option key={eap.id} value={eap.id}>
                  [{eap.id}] {eap.text.substring(0, 80)}{eap.text.length > 80 ? '...' : ''}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        {selectedProvision && (
          <div className="mt-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
            <div className="text-xs text-muted-foreground/70 mb-1">{selectedProvision.article} {selectedProvision.section ? `§${selectedProvision.section}` : ''}</div>
            <div className="text-foreground text-sm italic">"{selectedProvision.text}"</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-xs px-2 py-1 bg-emerald-900/50 text-emerald-400 rounded">
                Assigned to: {selectedProvision.assignedTo.join(', ')}
              </span>
              <span className={`text-xs px-2 py-1 rounded ${
                selectedProvision.psv === 'U' ? 'bg-red-900/50 text-red-400' :
                selectedProvision.psv === 'A' ? 'bg-yellow-900/50 text-yellow-400' :
                selectedProvision.psv === 'U/A' ? 'bg-orange-900/50 text-orange-400' :
                selectedProvision.psv === 'IRR' ? 'bg-green-900/50 text-green-400' :
                'bg-gray-700 text-muted-foreground/80'
              }`}>
                PSV: {selectedProvision.psv || 'N/A'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Select Actor */}
      <div className="bg-card border border-purple-500/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-purple-600 text-foreground text-xs font-bold px-2 py-1 rounded">STEP 2</span>
          <span className="text-purple-400 font-semibold">Who is Exercising This Power?</span>
        </div>

        <select
          value={selectedActor}
          onChange={handleActorChange}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-foreground focus:border-purple-500 focus:outline-none"
          disabled={!selectedProvision}
        >
          <option value="">Select Actor...</option>
          <optgroup label="Constitutional Positions">
            {PAEPS.filter(p => !['Persons', 'Citizens', 'Accused', 'The People'].includes(p)).map(paep => (
              <option key={paep} value={paep}>{paep}</option>
            ))}
          </optgroup>
          <optgroup label="Non-Constitutional Actors">
            {POTENTIAL_ACTORS.filter(a => !PAEPS.includes(a as any)).map(actor => (
              <option key={actor} value={actor}>{actor}</option>
            ))}
          </optgroup>
        </select>

        {selectedProvision && selectedActor && (
          <div className="mt-4">
            <button
              onClick={runTest}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-foreground font-bold rounded-lg transition-all"
            >
              Run Madisonian Test
            </button>
          </div>
        )}
      </div>

      {/* Step 3: Result */}
      {showResult && result && (
        <div className={`border rounded-lg p-4 ${
          result.violationType === 'IRREFUTABLE' ? 'bg-green-950/50 border-green-500/50' :
          result.isViolation ? 'bg-red-950/50 border-red-500/50' :
          'bg-green-950/50 border-green-500/50'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-foreground text-xs font-bold px-2 py-1 rounded ${
              result.violationType === 'IRREFUTABLE' ? 'bg-green-600' :
              result.isViolation ? 'bg-red-600' : 'bg-green-600'
            }`}>RESULT</span>
            <span className={`font-bold ${
              result.violationType === 'IRREFUTABLE' ? 'text-green-400' :
              result.isViolation ? 'text-red-400' : 'text-green-400'
            }`}>
              {result.violationType === 'IRREFUTABLE' ? 'IRREFUTABLE PROVISION' :
               result.isViolation ? 'USURPATION DETECTED' : 'NO VIOLATION'}
            </span>
          </div>

          {result.violationType === 'IRREFUTABLE' ? (
            <div className="text-green-300 text-sm">
              <p className="mb-2">This provision contains a mathematically determinate threshold (e.g., 2/3 vote). Compliance is objectively verifiable by counting - either the threshold was met or it wasn't.</p>
              <p className="font-semibold">No usurpation or abdication is possible.</p>
            </div>
          ) : result.isViolation ? (
            <div className="space-y-4">
              {/* Syllogism */}
              <div className="bg-card/80 rounded-lg p-3">
                <div className="text-xs text-muted-foreground/70 mb-2">MADISONIAN SYLLOGISM</div>
                <div className="space-y-2 text-sm">
                  <div className="text-blue-400">
                    <span className="text-muted-foreground/70">Major Premise:</span> The Constitution assigns this power to <span className="font-bold">{result.assignedPAEP.join(' / ')}</span>
                  </div>
                  <div className="text-purple-400">
                    <span className="text-muted-foreground/70">Minor Premise:</span> <span className="font-bold">{result.actor}</span> is exercising this power
                  </div>
                  <div className="text-red-400 font-bold">
                    <span className="text-muted-foreground/70">Conclusion:</span> {result.actor} ≠ {result.assignedPAEP.join('/')} → USURPATION
                  </div>
                </div>
              </div>

              {/* Conditions Check */}
              <div className="bg-card/80 rounded-lg p-3">
                <div className="text-xs text-muted-foreground/70 mb-2">POSITION INDIVISIBILITY CHECK</div>
                <div className="text-red-400 text-sm mb-2">
                  {result.actor} satisfies <span className="font-bold text-foreground">{result.conditionsMet}/{result.totalConditions}</span> constitutive conditions of {result.assignedPAEP[0]}
                </div>
                {result.conditions.length > 0 && (
                  <div className="space-y-1">
                    {result.conditions.map((cond, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className={cond.met ? 'text-green-400' : 'text-red-400'}>
                          {cond.met ? '✓' : '✗'}
                        </span>
                        <span className="text-muted-foreground/80">{cond.text.substring(0, 60)}...</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* People's Right Subtracted */}
              <div className="bg-red-900/30 rounded-lg p-3 border border-red-500/30">
                <div className="text-xs text-red-400 mb-1 font-semibold">PEOPLE'S RIGHT SUBTRACTED</div>
                <div className="text-foreground text-sm">{result.peoplesRightSubtracted}</div>
              </div>
            </div>
          ) : (
            <div className="text-green-300 text-sm">
              <p><span className="font-bold">{result.actor}</span> is a constitutionally assigned holder of this power.</p>
              <p className="mt-2">No separation of powers violation.</p>
            </div>
          )}
        </div>
      )}

      {/* Quick Examples */}
      <div className="bg-card/80 border border-gray-700 rounded-lg p-4">
        <div className="text-xs text-muted-foreground/70 mb-3">QUICK EXAMPLES</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => {
              const pardon = provisions.find(p => p.id === 'II.2.1c');
              if (pardon) {
                setSelectedProvision(pardon);
                setSelectedActor('Federal Prosecutor');
                setShowResult(true);
              }
            }}
            className="text-left p-2 bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 rounded text-red-300 transition-colors"
          >
            <span className="font-bold">Kirchner Case:</span> Prosecutor exercises Pardon Power
          </button>
          <button
            onClick={() => {
              const declareWar = provisions.find(p => p.id === 'I.8.11a');
              if (declareWar) {
                setSelectedProvision(declareWar);
                setSelectedActor('President');
                setShowResult(true);
              }
            }}
            className="text-left p-2 bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 rounded text-red-300 transition-colors"
          >
            <span className="font-bold">War Powers:</span> President declares war
          </button>
          <button
            onClick={() => {
              const impeach = provisions.find(p => p.id === 'I.2.5b');
              if (impeach) {
                setSelectedProvision(impeach);
                setSelectedActor('House of Representatives');
                setShowResult(true);
              }
            }}
            className="text-left p-2 bg-green-900/20 hover:bg-green-900/40 border border-green-500/30 rounded text-green-300 transition-colors"
          >
            <span className="font-bold">Valid:</span> House exercises Impeachment
          </button>
          <button
            onClick={() => {
              const legislative = provisions.find(p => p.id === 'I.1.1');
              if (legislative) {
                setSelectedProvision(legislative);
                setSelectedActor('Federal Agency');
                setShowResult(true);
              }
            }}
            className="text-left p-2 bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 rounded text-red-300 transition-colors"
          >
            <span className="font-bold">Delegation:</span> Agency exercises Legislative Power
          </button>
        </div>
      </div>
    </div>
  );
}
