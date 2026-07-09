// src/data/constitutionalAuthority.ts
// Constitutional Authority Map - Types and Data Loader
// Based on the Madisonian Separation of Powers Compliance Framework

// ═══════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════

export type Branch = 'sovereign' | 'legislative' | 'executive' | 'judicial' | 'federalism';

export type PSVStatus = 'U' | 'A' | 'U/A' | 'IRR';

export type ProvisionType = 'PW' | 'PH' | 'DT' | 'RT' | 'JR' | 'RV';

export interface HierarchyTier {
  name: string;
  description: string;
  constraint: string;
}

export interface PSVTier {
  name: string;
  definition: string;
  types?: string[];
  examples?: string[];
}

export interface CompoundPSV {
  name: string;
  primary: string;
  enabling: string;
  shielding: string;
}

export interface Power {
  id: string;
  citation?: string;
  source?: string;
  text: string;
  type: ProvisionType;
  psv_status: PSVStatus;
  notes?: string;
  coordinates_with?: string;
  condition?: string;
}

export interface Prohibition {
  id: string;
  citation?: string;
  source?: string;
  text: string;
  type: 'PH';
  notes?: string;
}

export interface Duty {
  id: string;
  citation?: string;
  source?: string;
  text: string;
  type: 'DT';
  psv_status?: PSVStatus;
  notes?: string;
}

export interface Qualification {
  citation: string;
  requirement: string;
}

export interface ConstitutiveConditions {
  selection?: {
    citation?: string;
    text?: string;
    us_attorney?: string;
    ausa?: string;
  };
  qualifications?: Qualification[];
  term?: {
    citation: string;
    duration: string;
  };
  oath?: {
    citation: string;
    text: string;
  };
  compensation?: {
    citation: string;
    text: string;
  };
  removal?: {
    citation?: string;
    method: string;
  };
  succession?: {
    citation?: string;
    text?: string;
    method?: string;
  };
  incompatibilities?: Array<{
    citation: string;
    prohibition: string;
  }>;
}

export interface Relationships {
  superior_to?: string[];
  subordinate_to?: string[];
  accountable_to?: string[];
  checks?: string[];
  checked_by?: string[];
  coordinates_with?: string[];
  component_of?: string[];
  member_of?: string[];
  presides_over?: string[];
  coordinate_with?: string[];
}

export interface AuthorityDerivation {
  tier_1?: string;
  tier_2?: string;
  tier_3?: string;
  tier_4?: string;
  constraint?: string;
}

export interface PSVVulnerabilities {
  usurpation_risk?: string;
  abdication_risk?: string;
  historical_usurpations?: string[];
  historical_abdications?: string[];
  madisonian_test_failure?: Record<string, string>;
}

export interface Position {
  id: string;
  name: string;
  branch: Branch;
  constitutional_source: string[];
  status: string;
  authority_tier: number;
  composition?: string[];
  constitutive_conditions?: ConstitutiveConditions;
  powers?: Power[];
  prohibitions?: Prohibition[];
  duties?: Duty[];
  relationships?: Relationships;
  authority_derivation?: AuthorityDerivation;
  psv_vulnerabilities?: PSVVulnerabilities;
  includes?: string[];
  independence?: string;
}

export interface ChecksMatrixEntry {
  checks: string[];
  mechanisms: string[];
}

export interface CoordinationEntry {
  positions: string[];
  requirement: string;
}

export interface MadisonianTestStep {
  step: number;
  name: string;
  question: string;
  failure_result: string;
}

export interface PowerCrossRef {
  assigned_to: string;
  citation: string;
  constraints?: string[];
  psv_status?: PSVStatus;
  cannot_exercise?: string[];
  requirement?: string;
  kirchner_relevance?: string;
  historical_abdications?: string[];
  revenue_origination?: string;
}

export interface ConstitutionalAuthorityMap {
  metadata: {
    title: string;
    version: string;
    created: string;
    purpose: string;
    framework: string;
  };
  hierarchy_tiers: Record<string, HierarchyTier>;
  psv_framework: {
    tiers: Record<string, PSVTier>;
    compound_psvs: CompoundPSV[];
  };
  branches: Record<string, {
    name: string;
    description?: string;
    vesting_clause?: string;
    vesting_text?: string;
    source?: string;
  }>;
  positions: Record<string, Position>;
  relationship_matrices: {
    checks_matrix: Record<string, ChecksMatrixEntry>;
    coordination_matrix: Record<string, CoordinationEntry>;
    hierarchy_matrix: Record<string, any>;
  };
  compliance_tools: {
    madisonian_test: {
      name: string;
      purpose: string;
      steps: MadisonianTestStep[];
    };
    authority_derivation_checker: any;
    psv_identifier: any;
  };
  cross_reference_indexes: {
    by_power: Record<string, PowerCrossRef | any>;
    by_function: Record<string, any>;
  };
  sample_queries: Record<string, any>;
}

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const BRANCH_INFO: Record<Branch, { name: string; color: string; icon: string; bgClass: string }> = {
  sovereign: { name: 'Sovereign', color: 'amber', icon: '👑', bgClass: 'bg-secondary text-foreground/85' },
  legislative: { name: 'Legislative', color: 'blue', icon: '⚖️', bgClass: 'bg-primary/15 text-primary' },
  executive: { name: 'Executive', color: 'red', icon: '🏛️', bgClass: 'bg-destructive/15 text-destructive' },
  judicial: { name: 'Judicial', color: 'purple', icon: '⚔️', bgClass: 'bg-secondary text-foreground/85' },
  federalism: { name: 'Federalism', color: 'green', icon: '🗺️', bgClass: 'bg-primary/15 text-primary' },
};

export const PSV_STATUS_INFO: Record<PSVStatus, { name: string; description: string; color: string; bgClass: string }> = {
  'U': { name: 'Usurpation', description: 'Vulnerable to wrongful exercise by another', color: 'red', bgClass: 'bg-destructive/15 text-destructive' },
  'A': { name: 'Abdication', description: 'Vulnerable to failure to exercise', color: 'orange', bgClass: 'bg-orange-500/20 text-orange-400' },
  'U/A': { name: 'Both', description: 'Vulnerable to both usurpation and abdication', color: 'amber', bgClass: 'bg-secondary text-foreground/85' },
  'IRR': { name: 'Irrefutable', description: 'Self-executing; cannot be violated', color: 'green', bgClass: 'bg-primary/15 text-primary' },
};

export const PSV_TIER_INFO = {
  primary: { name: 'Primary PSV', color: 'red', bgClass: 'bg-destructive/15 text-destructive border-destructive/30' },
  enabling: { name: 'Enabling PSV', color: 'amber', bgClass: 'bg-secondary text-foreground/85 border-border' },
  shielding: { name: 'Shielding PSV', color: 'purple', bgClass: 'bg-secondary text-foreground/85 border-border' },
};

export const HIERARCHY_TIER_COLORS = {
  tier_1: 'bg-primary/15 text-primary border-primary/30',
  tier_2: 'bg-primary/15 text-primary border-primary/30',
  tier_3: 'bg-secondary text-foreground/85 border-border',
  tier_4: 'bg-muted text-muted-foreground border-border',
};

// ═══════════════════════════════════════════════════════════════════
// DATA LOADING
// ═══════════════════════════════════════════════════════════════════

let cachedData: ConstitutionalAuthorityMap | null = null;

export async function loadConstitutionalAuthorityMap(): Promise<ConstitutionalAuthorityMap> {
  if (cachedData) return cachedData;

  const response = await fetch('/data/constitutional-authority-map.json');
  if (!response.ok) {
    throw new Error('Failed to load Constitutional Authority Map');
  }

  cachedData = await response.json();
  return cachedData!;
}

// Synchronous access (requires data to be pre-loaded)
export function getConstitutionalAuthorityMap(): ConstitutionalAuthorityMap | null {
  return cachedData;
}

// ═══════════════════════════════════════════════════════════════════
// QUERY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

export function getPosition(data: ConstitutionalAuthorityMap, positionId: string): Position | undefined {
  return data.positions[positionId.toUpperCase()];
}

export function getPositionsByBranch(data: ConstitutionalAuthorityMap, branch: Branch): Position[] {
  return Object.values(data.positions).filter(p => p.branch === branch);
}

export function getAllPositions(data: ConstitutionalAuthorityMap): Position[] {
  return Object.values(data.positions);
}

export function searchPositions(data: ConstitutionalAuthorityMap, query: string): Position[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(data.positions).filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.id.toLowerCase().includes(lowerQuery) ||
    p.status.toLowerCase().includes(lowerQuery)
  );
}

export function getPositionRelationships(data: ConstitutionalAuthorityMap, positionId: string): {
  superiors: Position[];
  subordinates: Position[];
  checks: Position[];
  checkedBy: Position[];
  coordinatesWith: Position[];
} {
  const position = getPosition(data, positionId);
  if (!position?.relationships) {
    return { superiors: [], subordinates: [], checks: [], checkedBy: [], coordinatesWith: [] };
  }

  const getPositions = (ids: string[] | undefined) =>
    (ids || []).map(id => getPosition(data, id)).filter((p): p is Position => !!p);

  return {
    superiors: getPositions(position.relationships.subordinate_to),
    subordinates: getPositions(position.relationships.superior_to),
    checks: getPositions(position.relationships.checks),
    checkedBy: getPositions(position.relationships.checked_by),
    coordinatesWith: getPositions(position.relationships.coordinates_with || position.relationships.coordinate_with),
  };
}

export function getPowerByName(data: ConstitutionalAuthorityMap, powerName: string): {
  power: PowerCrossRef | any;
  key: string;
} | undefined {
  const lowerName = powerName.toLowerCase();
  const byPower = data.cross_reference_indexes.by_power;

  for (const [key, value] of Object.entries(byPower)) {
    if (key.toLowerCase().includes(lowerName)) {
      return { power: value, key };
    }
  }
  return undefined;
}

export function getChecksMatrix(data: ConstitutionalAuthorityMap): Record<string, ChecksMatrixEntry> {
  return data.relationship_matrices.checks_matrix;
}

export function getCoordinationMatrix(data: ConstitutionalAuthorityMap): Record<string, CoordinationEntry> {
  return data.relationship_matrices.coordination_matrix;
}

export function getMadisonianTestSteps(data: ConstitutionalAuthorityMap): MadisonianTestStep[] {
  return data.compliance_tools.madisonian_test.steps;
}

export function getCompoundPSVs(data: ConstitutionalAuthorityMap): CompoundPSV[] {
  return data.psv_framework.compound_psvs;
}

export function getHierarchyTiers(data: ConstitutionalAuthorityMap): Record<string, HierarchyTier> {
  return data.hierarchy_tiers;
}

// ═══════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

export function formatAuthority(tier: number, source: string | undefined): string {
  if (!source) return '';
  const tierNames = ['', 'Constitution', 'Statutes', 'Regulations', 'Policies'];
  return `Tier ${tier} (${tierNames[tier]}): ${source}`;
}

export function getAuthorityChain(position: Position): Array<{ tier: number; source: string }> {
  const chain: Array<{ tier: number; source: string }> = [];
  const derivation = position.authority_derivation;

  if (!derivation) return chain;

  if (derivation.tier_1) chain.push({ tier: 1, source: derivation.tier_1 });
  if (derivation.tier_2) chain.push({ tier: 2, source: derivation.tier_2 });
  if (derivation.tier_3) chain.push({ tier: 3, source: derivation.tier_3 });
  if (derivation.tier_4) chain.push({ tier: 4, source: derivation.tier_4 });

  return chain;
}

export function hasUSurpationRisk(position: Position): boolean {
  return position.powers?.some(p => p.psv_status === 'U' || p.psv_status === 'U/A') || false;
}

export function hasAbdicationRisk(position: Position): boolean {
  return position.powers?.some(p => p.psv_status === 'A' || p.psv_status === 'U/A') ||
         position.duties?.some(d => d.psv_status === 'A') || false;
}

export function countPSVs(position: Position): { usurpation: number; abdication: number; both: number; irrefutable: number } {
  const counts = { usurpation: 0, abdication: 0, both: 0, irrefutable: 0 };

  position.powers?.forEach(p => {
    switch (p.psv_status) {
      case 'U': counts.usurpation++; break;
      case 'A': counts.abdication++; break;
      case 'U/A': counts.both++; break;
      case 'IRR': counts.irrefutable++; break;
    }
  });

  return counts;
}
