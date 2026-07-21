// src/components/MadisonianComplianceTest.tsx
// Interactive Madisonian Six-Step Compliance Test

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { constitutionalPositions } from '@/data/constitutionalPositions';

// Types for the test
type CoordinateActionType = 'legislative' | 'judicial' | 'executive' | '';
type TestResult = 'pass' | 'fail' | 'pending';

interface TestState {
  // Step 1: Clause Identification
  selectedPosition: string;
  selectedPower: string;
  customClause: string;

  // Step 2: Coordinate Action
  coordinateAction: CoordinateActionType;
  actionDescription: string;
  claimedActor: string;

  // Step 3: Syllogism
  majorPremiseValid: boolean | null;
  minorPremiseValid: boolean | null;

  // Step 4: Textual Consistency
  parallelClausesIdentified: boolean | null;
  sameMethodWorksForAll: boolean | null;
  absurdResultsForParallel: boolean | null;

  // Step 5: Structural Impossibility
  expressPersonalAssignment: boolean | null;
  constitutionalSpecificity: boolean | null;
  separationArchitectureViolated: boolean | null;
  incompatibilityClauseImplied: boolean | null;

  // Step 6: Position Indivisibility (generic)
  actorSatisfiesSelection: boolean | null;
  actorSatisfiesQualifications: boolean | null;
  actorSatisfiesOath: boolean | null;
  actorSatisfiesAccountability: boolean | null;

  // Step 6: Dynamic condition responses
  conditionResponses: Record<string, boolean | null>;
}

const initialState: TestState = {
  selectedPosition: '',
  selectedPower: '',
  customClause: '',
  coordinateAction: '',
  actionDescription: '',
  claimedActor: '',
  majorPremiseValid: null,
  minorPremiseValid: null,
  parallelClausesIdentified: null,
  sameMethodWorksForAll: null,
  absurdResultsForParallel: null,
  expressPersonalAssignment: null,
  constitutionalSpecificity: null,
  separationArchitectureViolated: null,
  incompatibilityClauseImplied: null,
  actorSatisfiesSelection: null,
  actorSatisfiesQualifications: null,
  actorSatisfiesOath: null,
  actorSatisfiesAccountability: null,
  conditionResponses: {},
};

// Pre-defined constitutional clauses for quick selection with parallel clauses for Step 4
const COMMON_CLAUSES = [
  {
    id: 'pardon',
    clause: 'Art. II, § 2, cl. 1',
    text: 'Pardon Power - "he shall have Power to grant Reprieves and Pardons"',
    position: 'president',
    section: 'Art. II, § 2',
    parallelClauses: [
      'Commander in Chief of Army and Navy',
      'Require opinions from principal officers',
      'Make Treaties (with Senate consent)',
      'Nominate ambassadors, judges, officers',
      'Fill vacancies during Senate recess'
    ]
  },
  {
    id: 'takecare',
    clause: 'Art. II, § 3',
    text: 'Take Care Clause - "he shall take Care that the Laws be faithfully executed"',
    position: 'president',
    section: 'Art. II, § 3',
    parallelClauses: [
      'Give Congress State of the Union information',
      'Recommend measures to Congress',
      'Convene both Houses on extraordinary occasions',
      'Adjourn Congress in case of disagreement',
      'Receive Ambassadors and public Ministers',
      'Commission all Officers of the United States'
    ]
  },
  {
    id: 'commander',
    clause: 'Art. II, § 2, cl. 1',
    text: 'Commander in Chief - "shall be Commander in Chief of the Army and Navy"',
    position: 'president',
    section: 'Art. II, § 2',
    parallelClauses: [
      'Require opinions from principal officers',
      'Grant Reprieves and Pardons',
      'Make Treaties (with Senate consent)',
      'Nominate ambassadors, judges, officers',
      'Fill vacancies during Senate recess'
    ]
  },
  {
    id: 'treaty',
    clause: 'Art. II, § 2, cl. 2',
    text: 'Treaty Power - "shall have Power, by and with the Advice and Consent of the Senate, to make Treaties"',
    position: 'president',
    section: 'Art. II, § 2',
    parallelClauses: [
      'Commander in Chief of Army and Navy',
      'Require opinions from principal officers',
      'Grant Reprieves and Pardons',
      'Nominate ambassadors, judges, officers',
      'Fill vacancies during Senate recess'
    ]
  },
  {
    id: 'appointments',
    clause: 'Art. II, § 2, cl. 2',
    text: 'Appointments Clause - "shall nominate, and...appoint Ambassadors, Judges..."',
    position: 'president',
    section: 'Art. II, § 2',
    parallelClauses: [
      'Commander in Chief of Army and Navy',
      'Require opinions from principal officers',
      'Grant Reprieves and Pardons',
      'Make Treaties (with Senate consent)',
      'Fill vacancies during Senate recess'
    ]
  },
  {
    id: 'legislative',
    clause: 'Art. I, § 1',
    text: 'Legislative Vesting - "All legislative Powers herein granted shall be vested in a Congress"',
    position: 'congress',
    section: 'Art. I, § 1',
    parallelClauses: []
  },
  {
    id: 'taxing',
    clause: 'Art. I, § 8, cl. 1',
    text: 'Taxing Power - "shall have Power To lay and collect Taxes, Duties, Imposts and Excises"',
    position: 'congress',
    section: 'Art. I, § 8',
    parallelClauses: [
      'Borrow money on credit of United States',
      'Regulate Commerce with foreign nations',
      'Establish uniform Rule of Naturalization',
      'Coin Money, regulate Value thereof',
      'Establish Post Offices and post Roads',
      'Constitute Tribunals inferior to Supreme Court',
      'Declare War, grant Letters of Marque',
      'Raise and support Armies',
      'Provide and maintain a Navy',
      'Make all Laws necessary and proper'
    ]
  },
  {
    id: 'war',
    clause: 'Art. I, § 8, cl. 11',
    text: 'Declare War - "To declare War, grant Letters of Marque and Reprisal"',
    position: 'congress',
    section: 'Art. I, § 8',
    parallelClauses: [
      'Lay and collect Taxes, Duties, Imposts',
      'Borrow money on credit of United States',
      'Regulate Commerce with foreign nations',
      'Coin Money, regulate Value thereof',
      'Raise and support Armies',
      'Provide and maintain a Navy',
      'Make Rules for Government of land and naval Forces'
    ]
  },
  {
    id: 'commerce',
    clause: 'Art. I, § 8, cl. 3',
    text: 'Commerce Clause - "To regulate Commerce with foreign Nations, and among the several States"',
    position: 'congress',
    section: 'Art. I, § 8',
    parallelClauses: [
      'Lay and collect Taxes, Duties, Imposts',
      'Establish uniform Rule of Naturalization',
      'Coin Money, regulate Value thereof',
      'Declare War, grant Letters of Marque',
      'Raise and support Armies',
      'Make all Laws necessary and proper'
    ]
  },
  {
    id: 'judicial',
    clause: 'Art. III, § 1',
    text: 'Judicial Vesting - "The judicial Power of the United States, shall be vested in one supreme Court"',
    position: 'supreme-court',
    section: 'Art. III, § 1',
    parallelClauses: []
  },
  {
    id: 'jury-criminal',
    clause: 'Art. III, § 2, cl. 3; 6th Amend.',
    text: 'Criminal Jury Trial - "The Trial of all Crimes...shall be by Jury"',
    position: 'petit-jury-criminal',
    section: 'Art. III, § 2',
    parallelClauses: [
      'Judicial power extends to all Cases in Law and Equity',
      'Original jurisdiction in cases affecting Ambassadors',
      'Appellate jurisdiction as to Law and Fact'
    ]
  },
  {
    id: 'jury-civil',
    clause: '7th Amend.',
    text: 'Civil Jury Trial - "the right of trial by jury shall be preserved"',
    position: 'petit-jury-civil',
    section: '7th Amend.',
    parallelClauses: [
      'No fact tried by jury re-examined except by common law rules'
    ]
  },
  {
    id: 'grand-jury',
    clause: '5th Amend.',
    text: 'Grand Jury Indictment - "No person shall be held to answer...unless on...indictment of a Grand Jury"',
    position: 'grand-jury',
    section: '5th Amend.',
    parallelClauses: [
      'No double jeopardy',
      'No compelled self-incrimination',
      'Due process of law required',
      'Just compensation for takings'
    ]
  },
];

// Position-specific constitutive condition questions for Step 6
const POSITION_CONDITIONS: Record<string, { code: string; question: string; helpText: string }[]> = {
  'president': [
    { code: 'V', question: 'Is the actor vested with "the executive Power"?', helpText: 'Art. II, § 1, Cl. 1 - "The executive Power shall be vested in a President"' },
    { code: 'S', question: 'Was the actor selected by constitutional Electors?', helpText: 'Art. II, § 1, Cl. 2-3 - Electoral College selection process' },
    { code: 'Q', question: 'Does the actor satisfy presidential qualifications?', helpText: 'Art. II, § 1, Cl. 5 - Natural born citizen, 35 years old, 14 years resident' },
    { code: 'O', question: 'Did the actor take the PRESIDENTIAL oath?', helpText: 'Art. II, § 1, Cl. 8 - "preserve, protect and defend the Constitution" (distinct from Art. VI oath to "support")' },
    { code: 'T', question: 'Is the actor serving a constitutional term?', helpText: 'Art. II, § 1, Cl. 1 - Four year term' },
    { code: 'A', question: 'Is the actor subject to presidential accountability?', helpText: 'Art. II, § 4 - Impeachment for high crimes and misdemeanors; Electoral accountability' },
  ],
  'congress': [
    { code: 'V', question: 'Is this the body vested with "All legislative Powers"?', helpText: 'Art. I, § 1 - Legislative powers vested in Congress' },
    { code: 'S', question: 'Does the body consist of elected Representatives and Senators?', helpText: 'Art. I, § 2-3 - Bicameral structure with specific selection methods' },
    { code: 'P', question: 'Does the action follow bicameralism and presentment?', helpText: 'Art. I, § 7 - Both houses must pass, presented to President' },
    { code: 'O', question: 'Did members take the Art. VI oath to support the Constitution?', helpText: 'Art. VI, Cl. 3 - All legislative officers bound by oath' },
  ],
  'supreme-court': [
    { code: 'V', question: 'Is this the body vested with "the judicial Power"?', helpText: 'Art. III, § 1 - Judicial power vested in Supreme Court' },
    { code: 'S', question: 'Were judges nominated by President and confirmed by Senate?', helpText: 'Art. II, § 2, Cl. 2 - Appointment process' },
    { code: 'T', question: 'Do judges hold office during good behavior?', helpText: 'Art. III, § 1 - Life tenure during good behavior' },
    { code: 'C', question: 'Is compensation protected from diminution?', helpText: 'Art. III, § 1 - Compensation cannot be diminished' },
  ],
  'grand-jury': [
    { code: 'F', question: 'Is this a body of citizens exercising the indictment function?', helpText: '5th Amendment - Grand jury required for infamous crimes' },
    { code: 'I', question: 'Is the body independent of prosecutorial control?', helpText: 'Historical: Grand jury as shield against government overreach' },
  ],
  'petit-jury-criminal': [
    { code: 'F', question: 'Is this a jury of impartial citizens?', helpText: '6th Amendment - Impartial jury requirement' },
    { code: 'L', question: 'Is the jury from the State and district of the crime?', helpText: '6th Amendment - Venue requirement' },
    { code: 'P', question: 'Is the jury the finder of fact on guilt?', helpText: 'Art. III, § 2, Cl. 3 - Trial by jury for crimes' },
  ],
  'petit-jury-civil': [
    { code: 'F', question: 'Is this a jury finding facts in a suit at common law?', helpText: '7th Amendment - Right preserved for suits exceeding $20' },
    { code: 'R', question: 'Are the facts protected from judicial re-examination?', helpText: '7th Amendment - Facts not re-examined except by common law' },
  ],
};

const COORDINATE_ACTION_TYPES = [
  { id: 'legislative', label: 'Legislative Enactment', description: 'A statute enacted by Congress under Art. I, § 7' },
  { id: 'judicial', label: 'Judicial Doctrine', description: 'A doctrine created by courts under Art. III' },
  { id: 'executive', label: 'Executive Enforcement', description: 'An executive action under Art. II' },
];

export const MadisonianComplianceTest = () => {
  const [state, setState] = useState<TestState>(initialState);
  const [currentStep, setCurrentStep] = useState(1);
  const [showResults, setShowResults] = useState(false);

  // Calculate step results
  const stepResults = useMemo(() => {
    const results: Record<number, TestResult> = {
      1: 'pending',
      2: 'pending',
      3: 'pending',
      4: 'pending',
      5: 'pending',
      6: 'pending',
    };

    // Step 1: Valid if clause identified
    if (state.selectedPower || state.customClause) {
      results[1] = 'pass';
    }

    // Step 2: Valid if action type selected
    if (state.coordinateAction && state.actionDescription) {
      results[2] = 'pass';
    }

    // Step 3: Syllogism - fails if minor premise invalid
    if (state.majorPremiseValid !== null && state.minorPremiseValid !== null) {
      results[3] = (state.majorPremiseValid && state.minorPremiseValid) ? 'pass' : 'fail';
    }

    // Step 4: Textual Consistency - fails if absurd results for parallel clauses
    if (state.parallelClausesIdentified !== null && state.absurdResultsForParallel !== null) {
      results[4] = state.absurdResultsForParallel ? 'fail' : 'pass';
    }

    // Step 5: Structural Impossibility - fails if any structural issue
    if (state.expressPersonalAssignment !== null || state.separationArchitectureViolated !== null) {
      const hasStructuralIssue = state.expressPersonalAssignment ||
                                  state.constitutionalSpecificity ||
                                  state.separationArchitectureViolated ||
                                  state.incompatibilityClauseImplied;
      results[5] = hasStructuralIssue ? 'fail' : 'pass';
    }

    // Step 6: Position Indivisibility - fails if actor doesn't satisfy all
    if (state.actorSatisfiesSelection !== null) {
      const satisfiesAll = state.actorSatisfiesSelection &&
                           state.actorSatisfiesQualifications &&
                           state.actorSatisfiesOath &&
                           state.actorSatisfiesAccountability;
      results[6] = satisfiesAll ? 'pass' : 'fail';
    }

    return results;
  }, [state]);

  // Calculate final result
  const finalResult = useMemo(() => {
    const failedSteps = Object.values(stepResults).filter(r => r === 'fail').length;
    const pendingSteps = Object.values(stepResults).filter(r => r === 'pending').length;

    if (pendingSteps > 0) return 'incomplete';
    if (failedSteps > 0) return 'unconstitutional';
    return 'constitutional';
  }, [stepResults]);

  const updateState = (updates: Partial<TestState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const resetTest = () => {
    setState(initialState);
    setCurrentStep(1);
    setShowResults(false);
  };

  const renderYesNoSelect = (
    label: string,
    value: boolean | null,
    onChange: (val: boolean | null) => void,
    helpText?: string
  ) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-muted-foreground mb-2">{label}</label>
      {helpText && <p className="text-xs text-muted-foreground/70 mb-2">{helpText}</p>}
      <select
        value={value === null ? '' : value ? 'yes' : 'no'}
        onChange={(e) => onChange(e.target.value === '' ? null : e.target.value === 'yes')}
        className="w-full bg-card border border-border rounded-lg px-4 py-2 text-foreground focus:border-primary focus:outline-none"
      >
        <option value="">-- Select --</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
    </div>
  );

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
      {[1, 2, 3, 4, 5, 6].map((step) => (
        <button
          key={step}
          onClick={() => setCurrentStep(step)}
          className={cn(
            'flex flex-col items-center min-w-[80px] transition-all',
            currentStep === step ? 'opacity-100' : 'opacity-60 hover:opacity-80'
          )}
        >
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all',
            stepResults[step] === 'pass' && 'bg-primary border-primary text-primary-foreground',
            stepResults[step] === 'fail' && 'bg-destructive border-destructive text-destructive-foreground',
            stepResults[step] === 'pending' && currentStep === step && 'bg-primary border-primary text-primary-foreground',
            stepResults[step] === 'pending' && currentStep !== step && 'bg-card/80 border-border text-muted-foreground/80'
          )}>
            {stepResults[step] === 'pass' ? '✓' : stepResults[step] === 'fail' ? '✗' : step}
          </div>
          <span className="text-xs text-muted-foreground/80 mt-1 text-center">
            {['Clause', 'Action', 'Syllogism', 'Consistency', 'Structure', 'Position'][step - 1]}
          </span>
        </button>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Step 1: Identify the Constitutional Clause</h3>
        <p className="text-muted-foreground/80 text-sm mb-4">
          Identify the express textual assignment of power in the Constitution. This establishes the Major Premise for the syllogistic analysis.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">Select a Common Clause</label>
        <select
          value={state.selectedPower}
          onChange={(e) => {
            const selected = COMMON_CLAUSES.find(c => c.id === e.target.value);
            updateState({
              selectedPower: e.target.value,
              selectedPosition: selected?.position || '',
              customClause: ''
            });
          }}
          className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground focus:border-primary focus:outline-none"
        >
          <option value="">-- Select a Constitutional Power --</option>
          <optgroup label="Executive (Art. II)">
            {COMMON_CLAUSES.filter(c => c.position === 'president').map(c => (
              <option key={c.id} value={c.id}>{c.text}</option>
            ))}
          </optgroup>
          <optgroup label="Legislative (Art. I)">
            {COMMON_CLAUSES.filter(c => c.position === 'congress').map(c => (
              <option key={c.id} value={c.id}>{c.text}</option>
            ))}
          </optgroup>
          <optgroup label="Judicial (Art. III)">
            {COMMON_CLAUSES.filter(c => ['supreme-court', 'petit-jury-criminal', 'petit-jury-civil', 'grand-jury'].includes(c.position)).map(c => (
              <option key={c.id} value={c.id}>{c.text}</option>
            ))}
          </optgroup>
        </select>
      </div>

      <div className="text-center text-muted-foreground/70">— OR —</div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">Enter Custom Clause</label>
        <textarea
          value={state.customClause}
          onChange={(e) => updateState({ customClause: e.target.value, selectedPower: '' })}
          placeholder="Enter the constitutional clause text and citation (e.g., Art. II, § 2, cl. 1 - 'The President shall have Power to...')"
          className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground focus:border-primary focus:outline-none min-h-[100px]"
        />
      </div>

      {(state.selectedPower || state.customClause) && (
        <div className="bg-primary/15 border border-primary/30 rounded-lg p-4">
          <div className="text-primary font-semibold mb-1">Major Premise Identified:</div>
          <div className="text-foreground">
            {state.selectedPower
              ? COMMON_CLAUSES.find(c => c.id === state.selectedPower)?.text
              : state.customClause}
          </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Step 2: Determine the Nature of the Coordinate Action</h3>
        <p className="text-muted-foreground/80 text-sm mb-4">
          Classify the government action being tested. Different types have different constitutional constraints.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">Type of Coordinate Action</label>
        <select
          value={state.coordinateAction}
          onChange={(e) => updateState({ coordinateAction: e.target.value as CoordinateActionType })}
          className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground focus:border-primary focus:outline-none"
        >
          <option value="">-- Select Action Type --</option>
          {COORDINATE_ACTION_TYPES.map(type => (
            <option key={type.id} value={type.id}>{type.label}</option>
          ))}
        </select>
        {state.coordinateAction && (
          <p className="text-sm text-muted-foreground/80 mt-2">
            {COORDINATE_ACTION_TYPES.find(t => t.id === state.coordinateAction)?.description}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">Describe the Specific Action Being Tested</label>
        <textarea
          value={state.actionDescription}
          onChange={(e) => updateState({ actionDescription: e.target.value })}
          placeholder="e.g., 'Prosecutorial discretion to grant transactional immunity' or 'Executive tariff authority under Section 232'"
          className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground focus:border-primary focus:outline-none min-h-[80px]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">Who is Claiming to Exercise This Power?</label>
        <input
          type="text"
          value={state.claimedActor}
          onChange={(e) => updateState({ claimedActor: e.target.value })}
          placeholder="e.g., 'Federal Prosecutor' or 'President' or 'Administrative Agency'"
          className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground focus:border-primary focus:outline-none"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Step 3: Construct the Syllogism</h3>
        <p className="text-muted-foreground/80 text-sm mb-4">
          Test whether the coordinate action validly derives from constitutional authority under the Supremacy Clause hierarchy.
        </p>
      </div>

      <div className="bg-card/80 border border-border rounded-lg p-4 mb-6">
        <div className="text-sm space-y-3">
          <div>
            <span className="text-primary font-semibold">MAJOR PREMISE:</span>
            <span className="text-foreground ml-2">
              {state.selectedPower
                ? COMMON_CLAUSES.find(c => c.id === state.selectedPower)?.text
                : state.customClause || '[Not yet identified]'}
            </span>
          </div>
          <div>
            <span className="text-foreground/85 font-semibold">MINOR PREMISE:</span>
            <span className="text-foreground ml-2">
              {state.actionDescription
                ? `"${state.actionDescription}" is law made "in Pursuance" of the Constitution`
                : '[Not yet described]'}
            </span>
          </div>
          <div>
            <span className="text-primary font-semibold">CONCLUSION:</span>
            <span className="text-foreground ml-2">
              Therefore, {state.claimedActor || '[actor]'} may validly exercise this power
            </span>
          </div>
        </div>
      </div>

      {renderYesNoSelect(
        'Is the Major Premise valid?',
        state.majorPremiseValid,
        (val) => updateState({ majorPremiseValid: val }),
        'Does the Constitution actually assign this power to the identified position?'
      )}

      {renderYesNoSelect(
        'Can the Minor Premise be established?',
        state.minorPremiseValid,
        (val) => updateState({ minorPremiseValid: val }),
        'Is the coordinate action truly "in Pursuance" of the constitutional clause? Does valid derivation exist?'
      )}

      {state.majorPremiseValid === true && state.minorPremiseValid === false && (
        <div className="bg-destructive/15 border border-destructive/30 rounded-lg p-4">
          <div className="text-destructive font-semibold">Syllogism FAILS</div>
          <p className="text-muted-foreground text-sm mt-1">
            The Minor Premise cannot be established. The coordinate action is not validly "in Pursuance" of the constitutional clause.
          </p>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => {
    const selectedClause = COMMON_CLAUSES.find(c => c.id === state.selectedPower);
    const parallelClauses = selectedClause?.parallelClauses || [];
    const sectionName = selectedClause?.section || 'the same Section';

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Step 4: Apply the Textual Consistency Test</h3>
          <p className="text-muted-foreground/80 text-sm mb-4">
            Madison's principle: "the same argument results from the same consideration." If an interpretive method is valid for one clause, it must be valid for parallel clauses in the same Section.
          </p>
        </div>

        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
          <div className="text-primary font-semibold mb-2">The Test:</div>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Identify all clauses within the same Section (or Article)</li>
            <li>Apply the SAME interpretive method to each parallel clause</li>
            <li>Determine if the method yields valid results for ALL parallel clauses</li>
            <li>If the method yields ABSURD results for any parallel clause, it is INVALID</li>
          </ol>
        </div>

        {/* Show parallel clauses if available */}
        {parallelClauses.length > 0 && (
          <div className="bg-card/80 border border-border rounded-lg p-4 mb-6">
            <div className="text-foreground/85 font-semibold mb-2">Parallel Clauses in {sectionName}:</div>
            <p className="text-muted-foreground/80 text-xs mb-3">
              If {state.claimedActor || 'the claimed actor'} can exercise the selected power through {state.coordinateAction === 'judicial' ? 'judicial doctrine' : state.coordinateAction === 'legislative' ? 'legislative delegation' : 'executive action'}, can the SAME method derive authority for:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {parallelClauses.map((clause, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-destructive">?</span>
                  <span className="text-muted-foreground">{clause}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {renderYesNoSelect(
          'Have you identified parallel clauses in the same Section/Article?',
          state.parallelClausesIdentified,
          (val) => updateState({ parallelClausesIdentified: val }),
          parallelClauses.length > 0 ? `The parallel clauses in ${sectionName} are shown above` : 'List all other powers assigned in the same Section'
        )}

        {renderYesNoSelect(
          'Does the same interpretive method work for ALL parallel clauses?',
          state.sameMethodWorksForAll,
          (val) => updateState({ sameMethodWorksForAll: val }),
          'If you apply the same logic used to justify this action to parallel clauses, do you get valid results?'
        )}

        {renderYesNoSelect(
          'Does applying this method to parallel clauses produce ABSURD or IMPOSSIBLE results?',
          state.absurdResultsForParallel,
          (val) => updateState({ absurdResultsForParallel: val }),
          `For example: Can ${state.claimedActor || 'this actor'} also exercise ${parallelClauses[0] || 'other powers in the same Section'} using the same reasoning?`
        )}

        {state.absurdResultsForParallel === true && (
          <div className="bg-destructive/15 border border-destructive/30 rounded-lg p-4">
            <div className="text-destructive font-semibold">Textual Consistency Test FAILS</div>
            <p className="text-muted-foreground text-sm mt-1">
              The interpretive method yields absurd results for parallel clauses. By Madison's principle, the claimed derivation is INVALID.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Step 5: Structural Impossibility Determination</h3>
        <p className="text-muted-foreground/80 text-sm mb-4">
          Determine whether the power at issue is inherently non-delegable based on constitutional structure.
        </p>
      </div>

      {renderYesNoSelect(
        'Does the Constitution use EXPRESS PERSONAL ASSIGNMENT?',
        state.expressPersonalAssignment,
        (val) => updateState({ expressPersonalAssignment: val }),
        'Does the text assign power to a specific officer ("The President shall...") rather than to an office or branch generally?'
      )}

      {renderYesNoSelect(
        'Is there CONSTITUTIONAL SPECIFICITY in the assignment?',
        state.constitutionalSpecificity,
        (val) => updateState({ constitutionalSpecificity: val }),
        'Did the Framers choose specific language when general language was available, indicating deliberate limitation?'
      )}

      {renderYesNoSelect(
        'Would delegation VIOLATE the separation of powers architecture?',
        state.separationArchitectureViolated,
        (val) => updateState({ separationArchitectureViolated: val }),
        'Would delegation transfer power between branches, violating the constitutional distribution that prevents accumulation?'
      )}

      {renderYesNoSelect(
        'Does the INCOMPATIBILITY CLAUSE (Art. I, § 6, cl. 2) imply prohibition?',
        state.incompatibilityClauseImplied,
        (val) => updateState({ incompatibilityClauseImplied: val }),
        'If personal accumulation is forbidden, institutional accumulation through delegation is forbidden a fortiori'
      )}

      {(state.expressPersonalAssignment || state.constitutionalSpecificity ||
        state.separationArchitectureViolated || state.incompatibilityClauseImplied) && (
        <div className="bg-destructive/15 border border-destructive/30 rounded-lg p-4">
          <div className="text-destructive font-semibold">Structural Impossibility Determination: NON-DELEGABLE</div>
          <p className="text-muted-foreground text-sm mt-1">
            The power is structurally non-delegable. No coordinate action can create valid delegation authority.
          </p>
        </div>
      )}
    </div>
  );

  const renderStep6 = () => {
    const selectedClause = COMMON_CLAUSES.find(c => c.id === state.selectedPower);
    const positionId = selectedClause?.position || '';
    const positionData = constitutionalPositions.find(p => p.id === positionId);
    const positionName = positionData?.name || 'the assigned position';
    const positionConditions = POSITION_CONDITIONS[positionId] || [];

    const updateConditionResponse = (code: string, value: boolean | null) => {
      updateState({
        conditionResponses: { ...state.conditionResponses, [code]: value }
      });
    };

    const hasAnyFailure = Object.values(state.conditionResponses).some(v => v === false);

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Step 6: Position of Assigned Power (Indivisibility Test)</h3>
          <p className="text-muted-foreground/80 text-sm mb-4">
            When the Constitution assigns power to a position, that term incorporates ALL constitutional provisions defining that position. The constitutive conditions are INDIVISIBLE.
          </p>
        </div>

        <div className="bg-secondary border border-border rounded-lg p-4 mb-6">
          <div className="text-foreground/85 font-semibold mb-2">The Indivisibility Principle:</div>
          <p className="text-sm text-muted-foreground">
            A claim to exercise ANY constitutive condition of a position requires satisfying ALL constitutive conditions of that position.
          </p>
          <p className="text-xs text-muted-foreground/70 mt-2 italic">
            "You cannot selectively adopt the power-granting clause while disclaiming the position-defining clauses."
          </p>
        </div>

        <div className="text-foreground mb-4">
          Does <span className="text-primary font-semibold">{state.claimedActor || '[claimed actor]'}</span> satisfy the constitutive conditions of <span className="text-foreground/85 font-semibold">{positionName}</span>?
        </div>

        {/* Dynamic position-specific conditions */}
        {positionConditions.length > 0 ? (
          <div className="space-y-4">
            {positionConditions.map((condition, idx) => (
              <div key={idx} className="bg-card/60 border border-border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="px-2 py-1 text-xs font-mono font-semibold rounded bg-primary/15 text-primary">
                    C{idx + 1}
                  </span>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-muted-foreground mb-1">{condition.question}</label>
                    <p className="text-xs text-muted-foreground/70 mb-2">{condition.helpText}</p>
                    <select
                      value={state.conditionResponses[condition.code] === null || state.conditionResponses[condition.code] === undefined ? '' : state.conditionResponses[condition.code] ? 'yes' : 'no'}
                      onChange={(e) => {
                        const val = e.target.value === '' ? null : e.target.value === 'yes';
                        updateConditionResponse(condition.code, val);
                        // Also update the main state for result calculation
                        if (idx === 0) updateState({ actorSatisfiesSelection: val });
                        if (idx === 1) updateState({ actorSatisfiesQualifications: val });
                        if (idx === 2) updateState({ actorSatisfiesOath: val });
                        if (idx === 3) updateState({ actorSatisfiesAccountability: val });
                      }}
                      className="w-full bg-card border border-border rounded-lg px-4 py-2 text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="">-- Select --</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                    {state.conditionResponses[condition.code] === false && (
                      <div className="mt-2 text-xs text-destructive">
                        ✗ This condition is NOT satisfied
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Fallback to generic questions if no position-specific ones */
          <>
            {renderYesNoSelect(
              'Does the actor satisfy the SELECTION requirements?',
              state.actorSatisfiesSelection,
              (val) => updateState({ actorSatisfiesSelection: val }),
              'Was the actor selected in the manner the Constitution requires for this position?'
            )}

            {renderYesNoSelect(
              'Does the actor satisfy the QUALIFICATION requirements?',
              state.actorSatisfiesQualifications,
              (val) => updateState({ actorSatisfiesQualifications: val }),
              'Does the actor meet all constitutional qualifications for this position?'
            )}

            {renderYesNoSelect(
              'Does the actor satisfy the OATH requirement?',
              state.actorSatisfiesOath,
              (val) => updateState({ actorSatisfiesOath: val }),
              'Has the actor taken the specific oath the Constitution requires for this position?'
            )}

            {renderYesNoSelect(
              'Does the actor satisfy the ACCOUNTABILITY requirements?',
              state.actorSatisfiesAccountability,
              (val) => updateState({ actorSatisfiesAccountability: val }),
              'Is the actor subject to the same constitutional accountability mechanisms?'
            )}
          </>
        )}

        {(hasAnyFailure || state.actorSatisfiesSelection === false || state.actorSatisfiesQualifications === false ||
          state.actorSatisfiesOath === false || state.actorSatisfiesAccountability === false) && (
          <div className="bg-destructive/15 border border-destructive/30 rounded-lg p-4">
            <div className="text-destructive font-semibold">Position Indivisibility Test FAILS</div>
            <p className="text-muted-foreground text-sm mt-1">
              <span className="text-primary">{state.claimedActor || 'The claimed actor'}</span> does not satisfy ALL constitutive conditions of <span className="text-foreground/85">{positionName}</span>.
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              Therefore, <span className="text-primary">{state.claimedActor || 'this actor'}</span> CANNOT exercise powers assigned to <span className="text-foreground/85">{positionName}</span>.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderResults = () => {
    const failedSteps = Object.entries(stepResults)
      .filter(([_, result]) => result === 'fail')
      .map(([step, _]) => parseInt(step));

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className={cn(
            'inline-flex items-center justify-center w-24 h-24 rounded-full text-4xl font-bold mb-4',
            finalResult === 'unconstitutional' && 'bg-destructive text-destructive-foreground',
            finalResult === 'constitutional' && 'bg-primary text-primary-foreground',
            finalResult === 'incomplete' && 'bg-muted text-foreground'
          )}>
            {finalResult === 'unconstitutional' ? '✗' : finalResult === 'constitutional' ? '✓' : '?'}
          </div>
          <h2 className={cn(
            'text-3xl font-bold mb-2',
            finalResult === 'unconstitutional' && 'text-destructive',
            finalResult === 'constitutional' && 'text-primary',
            finalResult === 'incomplete' && 'text-muted-foreground/80'
          )}>
            {finalResult === 'unconstitutional' && 'UNCONSTITUTIONAL'}
            {finalResult === 'constitutional' && 'CONSTITUTIONAL'}
            {finalResult === 'incomplete' && 'INCOMPLETE'}
          </h2>
          <p className="text-muted-foreground/80">
            {finalResult === 'unconstitutional' && 'The coordinate action fails the Madisonian Compliance Test'}
            {finalResult === 'constitutional' && 'The coordinate action passes the Madisonian Compliance Test'}
            {finalResult === 'incomplete' && 'Complete all steps to determine the result'}
          </p>
        </div>

        {failedSteps.length > 0 && (
          <div className="bg-card/80 border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Failed Steps:</h3>
            <div className="space-y-3">
              {failedSteps.includes(3) && (
                <div className="flex items-start gap-3">
                  <span className="text-destructive font-bold">Step 3:</span>
                  <span className="text-muted-foreground">Syllogism Construction - Minor premise cannot be established</span>
                </div>
              )}
              {failedSteps.includes(4) && (
                <div className="flex items-start gap-3">
                  <span className="text-destructive font-bold">Step 4:</span>
                  <span className="text-muted-foreground">Textual Consistency - Same method produces absurd results for parallel clauses</span>
                </div>
              )}
              {failedSteps.includes(5) && (
                <div className="flex items-start gap-3">
                  <span className="text-destructive font-bold">Step 5:</span>
                  <span className="text-muted-foreground">Structural Impossibility - Power is inherently non-delegable</span>
                </div>
              )}
              {failedSteps.includes(6) && (
                <div className="flex items-start gap-3">
                  <span className="text-destructive font-bold">Step 6:</span>
                  <span className="text-muted-foreground">Position Indivisibility - Actor does not satisfy all constitutive conditions</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-card/80 border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Test Summary:</h3>
          <div className="space-y-2 text-sm">
            <div><span className="text-muted-foreground/80">Constitutional Clause:</span> <span className="text-foreground">{state.selectedPower ? COMMON_CLAUSES.find(c => c.id === state.selectedPower)?.text : state.customClause}</span></div>
            <div><span className="text-muted-foreground/80">Coordinate Action:</span> <span className="text-foreground">{state.actionDescription}</span></div>
            <div><span className="text-muted-foreground/80">Claimed Actor:</span> <span className="text-foreground">{state.claimedActor}</span></div>
            <div><span className="text-muted-foreground/80">Action Type:</span> <span className="text-foreground">{COORDINATE_ACTION_TYPES.find(t => t.id === state.coordinateAction)?.label}</span></div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={resetTest}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
          >
            Start New Test
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {!showResults ? (
        <>
          {renderStepIndicator()}

          <div className="bg-card border border-border rounded-xl p-6">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
            {currentStep === 6 && renderStep6()}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className={cn(
                'px-6 py-3 rounded-lg transition-colors',
                currentStep === 1
                  ? 'bg-muted text-muted-foreground/70 cursor-not-allowed'
                  : 'bg-secondary/60 text-foreground hover:bg-secondary'
              )}
            >
              ← Previous
            </button>

            {currentStep < 6 ? (
              <button
                onClick={() => setCurrentStep(Math.min(6, currentStep + 1))}
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={() => setShowResults(true)}
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
              >
                View Results
              </button>
            )}
          </div>
        </>
      ) : (
        renderResults()
      )}
    </div>
  );
};

export default MadisonianComplianceTest;
