// src/data/constitutionalPositions.ts
// Complete Constitutional Positions of Assigned Power (PAEPs) with Constitutive Conditions

export type ConditionCode =
  | 'PW'  // Power - What position CAN do
  | 'PH'  // Prohibition - What position CANNOT do
  | 'DT'  // Duty - What position MUST do
  | 'QL'  // Qualification - Who CAN hold position
  | 'DQ'  // Disqualification - Who CANNOT hold position
  | 'TM'  // Term - Duration of service
  | 'SL'  // Selection - How position is filled
  | 'RM'  // Removal - How position is vacated
  | 'SC'  // Succession - Who replaces position
  | 'OT'  // Oath - What position swears
  | 'CP'  // Compensation - How position is paid
  | 'PR'  // Procedure - How position must act
  | 'IC'  // Incompatibility - What cannot be held simultaneously
  | 'AC'  // Accountability - To whom position answers
  | 'JR'  // Jurisdiction - Scope of authority
  | 'NM'  // Number - How many hold position
  | 'RT'  // Right - What position holds as of right
  | 'RV'  // Reservation - Powers/rights reserved to position
  | 'DF'; // Definition - Who or what the position IS

export type Branch = 'sovereign' | 'legislative' | 'executive' | 'judicial' | 'federalism' | 'electoral' | 'individual';

export type PSVType = 'usurpation' | 'abdication';

export interface ConstitutiveCondition {
  code: ConditionCode;
  category: string;
  clause: string;
  provisionText: string;
  isPSVVulnerable?: boolean;
}

export interface VulnerableEAP {
  name: string;
  clause: string;
  provisionText: string;
  psvRisks: {
    usurpation?: string;
    abdication?: string;
  };
}

export interface Position {
  id: string;
  name: string;
  shortName?: string;
  branch: Branch;
  constitutionalSource: string;
  description: string;
  constitutiveConditions: ConstitutiveCondition[];
  vulnerableEAPs: VulnerableEAP[];
}

export const CONDITION_CATEGORIES: Record<ConditionCode, { name: string; description: string; color: string }> = {
  PW: { name: 'Power', description: 'What position CAN do', color: 'emerald' },
  PH: { name: 'Prohibition', description: 'What position CANNOT do', color: 'red' },
  DT: { name: 'Duty', description: 'What position MUST do', color: 'amber' },
  QL: { name: 'Qualification', description: 'Who CAN hold position', color: 'blue' },
  DQ: { name: 'Disqualification', description: 'Who CANNOT hold position', color: 'rose' },
  TM: { name: 'Term', description: 'Duration of service', color: 'purple' },
  SL: { name: 'Selection', description: 'How position is filled', color: 'cyan' },
  RM: { name: 'Removal', description: 'How position is vacated', color: 'orange' },
  SC: { name: 'Succession', description: 'Who replaces position', color: 'indigo' },
  OT: { name: 'Oath', description: 'What position swears', color: 'yellow' },
  CP: { name: 'Compensation', description: 'How position is paid', color: 'lime' },
  PR: { name: 'Procedure', description: 'How position must act', color: 'teal' },
  IC: { name: 'Incompatibility', description: 'What cannot be held simultaneously', color: 'pink' },
  AC: { name: 'Accountability', description: 'To whom position answers', color: 'sky' },
  JR: { name: 'Jurisdiction', description: 'Scope of authority', color: 'violet' },
  NM: { name: 'Number', description: 'How many hold position', color: 'slate' },
  RT: { name: 'Right', description: 'What position holds as of right', color: 'green' },
  RV: { name: 'Reservation', description: 'Powers/rights reserved to position', color: 'fuchsia' },
  DF: { name: 'Definition', description: 'Who or what the position IS', color: 'stone' },
};

export const BRANCH_INFO: Record<Branch, { name: string; color: string; icon: string }> = {
  sovereign: { name: 'Sovereign', color: 'gold', icon: '👑' },
  legislative: { name: 'Legislative Branch', color: 'blue', icon: '⚖️' },
  executive: { name: 'Executive Branch', color: 'red', icon: '🏛️' },
  judicial: { name: 'Judicial Branch', color: 'purple', icon: '⚔️' },
  federalism: { name: 'Federalism', color: 'green', icon: '🗺️' },
  electoral: { name: 'Electoral', color: 'cyan', icon: '🗳️' },
  individual: { name: 'Individual Rights', color: 'amber', icon: '🛡️' },
};

export const constitutionalPositions: Position[] = [
  // ═══════════════════════════════════════════════════════════════════
  // SOVEREIGN
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'the-people',
    name: 'The People',
    branch: 'sovereign',
    constitutionalSource: 'Preamble; 9th & 10th Amendments',
    description: 'Sovereign source of all constitutional authority. The People ordained the Constitution and retain all powers not delegated.',
    constitutiveConditions: [
      { code: 'PW', category: 'Power', clause: 'Preamble', provisionText: '"We the People of the United States... do ordain and establish this Constitution"' },
      { code: 'PW', category: 'Power', clause: 'Art. V', provisionText: 'Ratification of amendments through state conventions (direct popular expression)' },
      { code: 'RT', category: 'Right', clause: '1st Amend.', provisionText: '"the right of the people peaceably to assemble"' },
      { code: 'RT', category: 'Right', clause: '1st Amend.', provisionText: '"the right... to petition the Government for a redress of grievances"' },
      { code: 'RT', category: 'Right', clause: '2nd Amend.', provisionText: '"the right of the people to keep and bear Arms, shall not be infringed"' },
      { code: 'RT', category: 'Right', clause: '4th Amend.', provisionText: '"The right of the people to be secure in their persons, houses, papers, and effects, against unreasonable searches and seizures"' },
      { code: 'RV', category: 'Reservation', clause: '9th Amend.', provisionText: '"The enumeration in the Constitution, of certain rights, shall not be construed to deny or disparage others retained by the people"' },
      { code: 'RV', category: 'Reservation', clause: '10th Amend.', provisionText: '"The powers not delegated to the United States by the Constitution, nor prohibited by it to the States, are reserved to the States respectively, or to the people"' },
    ],
    vulnerableEAPs: [
      {
        name: 'Constitutional Amendment',
        clause: 'Art. V',
        provisionText: 'Power to ratify amendments to the Constitution',
        psvRisks: {
          usurpation: 'Government bodies attempting to amend without proper ratification process',
          abdication: 'Failure to engage in the amendment process when constitutional violations occur',
        },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // LEGISLATIVE BRANCH
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'congress',
    name: 'Congress',
    branch: 'legislative',
    constitutionalSource: 'Art. I, § 1',
    description: 'Legislative body; repository of "All legislative Powers herein granted"',
    constitutiveConditions: [
      { code: 'PW', category: 'Power', clause: 'Art. I, § 1', provisionText: '"All legislative Powers herein granted shall be vested in a Congress of the United States"', isPSVVulnerable: true },
      { code: 'NM', category: 'Number', clause: 'Art. I, § 1', provisionText: '"which shall consist of a Senate and House of Representatives"' },
      { code: 'PW', category: 'Power', clause: 'Art. I, § 8, cl. 1', provisionText: '"shall have Power To lay and collect Taxes, Duties, Imposts and Excises"', isPSVVulnerable: true },
      { code: 'PW', category: 'Power', clause: 'Art. I, § 8, cl. 3', provisionText: '"To regulate Commerce with foreign Nations, and among the several States"', isPSVVulnerable: true },
      { code: 'PW', category: 'Power', clause: 'Art. I, § 8, cl. 5', provisionText: '"To coin Money, regulate the Value thereof"', isPSVVulnerable: true },
      { code: 'PW', category: 'Power', clause: 'Art. I, § 8, cl. 11', provisionText: '"To declare War, grant Letters of Marque and Reprisal"', isPSVVulnerable: true },
      { code: 'PW', category: 'Power', clause: 'Art. I, § 8, cl. 18', provisionText: '"To make all Laws which shall be necessary and proper for carrying into Execution the foregoing Powers"' },
      { code: 'PH', category: 'Prohibition', clause: 'Art. I, § 9, cl. 2', provisionText: '"The Privilege of the Writ of Habeas Corpus shall not be suspended, unless when in Cases of Rebellion or Invasion"' },
      { code: 'PH', category: 'Prohibition', clause: 'Art. I, § 9, cl. 3', provisionText: '"No Bill of Attainder or ex post facto Law shall be passed"' },
      { code: 'PH', category: 'Prohibition', clause: '1st Amend.', provisionText: '"Congress shall make no law respecting an establishment of religion, or prohibiting the free exercise thereof; or abridging the freedom of speech, or of the press"' },
      { code: 'DT', category: 'Duty', clause: 'Art. I, § 4, cl. 2', provisionText: '"The Congress shall assemble at least once in every Year"' },
      { code: 'PR', category: 'Procedure', clause: 'Art. I, § 7, cl. 1', provisionText: '"All Bills for raising Revenue shall originate in the House of Representatives"' },
      { code: 'PR', category: 'Procedure', clause: 'Art. I, § 7, cl. 2', provisionText: '"Every Bill which shall have passed the House of Representatives and the Senate, shall, before it become a Law, be presented to the President"' },
    ],
    vulnerableEAPs: [
      {
        name: 'Legislative Power',
        clause: 'Art. I, § 1',
        provisionText: '"All legislative Powers herein granted shall be vested in a Congress"',
        psvRisks: {
          usurpation: 'Executive agencies creating substantive rules with force of law without congressional authorization',
          abdication: 'Delegating legislative power to executive branch without intelligible principle',
        },
      },
      {
        name: 'Declare War',
        clause: 'Art. I, § 8, cl. 11',
        provisionText: '"To declare War, grant Letters of Marque and Reprisal"',
        psvRisks: {
          usurpation: 'President initiating military hostilities without congressional authorization',
          abdication: 'Failure to exercise war power, allowing executive to conduct undeclared wars',
        },
      },
      {
        name: 'Taxing Power',
        clause: 'Art. I, § 8, cl. 1',
        provisionText: '"To lay and collect Taxes, Duties, Imposts and Excises"',
        psvRisks: {
          usurpation: 'Executive imposing tariffs or taxes without congressional authorization',
          abdication: 'Delegating tariff authority to President without constitutional basis',
        },
      },
    ],
  },

  {
    id: 'house-of-representatives',
    name: 'House of Representatives',
    shortName: 'House',
    branch: 'legislative',
    constitutionalSource: 'Art. I, § 2',
    description: 'Lower chamber of Congress; directly elected by the People; sole power of impeachment',
    constitutiveConditions: [
      { code: 'NM', category: 'Number', clause: 'Art. I, § 2, cl. 3', provisionText: '"The Number of Representatives shall not exceed one for every thirty Thousand, but each State shall have at Least one Representative"' },
      { code: 'PW', category: 'Power', clause: 'Art. I, § 2, cl. 5', provisionText: '"The House of Representatives shall chuse their Speaker and other Officers"' },
      { code: 'PW', category: 'Power', clause: 'Art. I, § 2, cl. 5', provisionText: '"shall have the sole Power of Impeachment"', isPSVVulnerable: true },
      { code: 'PW', category: 'Power', clause: 'Art. I, § 5, cl. 1', provisionText: '"shall be the Judge of the Elections, Returns and Qualifications of its own Members"' },
      { code: 'PW', category: 'Power', clause: 'Art. I, § 7, cl. 1', provisionText: '"All Bills for raising Revenue shall originate in the House of Representatives"' },
      { code: 'PW', category: 'Power', clause: '12th Amend.', provisionText: '"the House of Representatives shall choose immediately, by ballot, the President" [if no Electoral majority]' },
      { code: 'DT', category: 'Duty', clause: 'Art. I, § 5, cl. 3', provisionText: '"shall keep a Journal of its Proceedings, and from time to time publish the same"' },
      { code: 'PR', category: 'Procedure', clause: 'Art. I, § 5, cl. 1', provisionText: '"a Majority of each shall constitute a Quorum to do Business"' },
    ],
    vulnerableEAPs: [
      {
        name: 'Impeachment Power',
        clause: 'Art. I, § 2, cl. 5',
        provisionText: '"shall have the sole Power of Impeachment"',
        psvRisks: {
          abdication: 'Failure to investigate and impeach officials who have committed high crimes and misdemeanors',
        },
      },
      {
        name: 'Revenue Origination',
        clause: 'Art. I, § 7, cl. 1',
        provisionText: '"All Bills for raising Revenue shall originate in the House of Representatives"',
        psvRisks: {
          usurpation: 'Senate originating revenue bills or executive imposing revenue measures',
          abdication: 'Allowing revenue measures to bypass House origination',
        },
      },
    ],
  },

  {
    id: 'representative',
    name: 'Representative',
    branch: 'legislative',
    constitutionalSource: 'Art. I, § 2',
    description: 'Individual member of the House of Representatives',
    constitutiveConditions: [
      { code: 'SL', category: 'Selection', clause: 'Art. I, § 2, cl. 1', provisionText: '"chosen every second Year by the People of the several States"' },
      { code: 'QL', category: 'Qualification', clause: 'Art. I, § 2, cl. 2', provisionText: '"No Person shall be a Representative who shall not have attained to the Age of twenty five Years"' },
      { code: 'QL', category: 'Qualification', clause: 'Art. I, § 2, cl. 2', provisionText: '"and been seven Years a Citizen of the United States"' },
      { code: 'QL', category: 'Qualification', clause: 'Art. I, § 2, cl. 2', provisionText: '"and who shall not, when elected, be an Inhabitant of that State in which he shall be chosen"' },
      { code: 'DQ', category: 'Disqualification', clause: '14th Amend., § 3', provisionText: '"No person shall be a Senator or Representative in Congress... who, having previously taken an oath... to support the Constitution of the United States, shall have engaged in insurrection or rebellion"' },
      { code: 'TM', category: 'Term', clause: 'Art. I, § 2, cl. 1', provisionText: '2 years (implied from "chosen every second Year")' },
      { code: 'OT', category: 'Oath', clause: 'Art. VI, cl. 3', provisionText: '"bound by Oath or Affirmation, to support this Constitution"' },
      { code: 'CP', category: 'Compensation', clause: 'Art. I, § 6, cl. 1', provisionText: '"shall receive a Compensation for their Services, to be ascertained by Law, and paid out of the Treasury"' },
      { code: 'CP', category: 'Compensation', clause: '27th Amend.', provisionText: '"No law, varying the compensation for the services of the Senators and Representatives, shall take effect, until an election of Representatives shall have intervened"' },
      { code: 'RT', category: 'Right', clause: 'Art. I, § 6, cl. 1', provisionText: '"shall in all Cases, except Treason, Felony and Breach of the Peace, be privileged from Arrest during their Attendance"' },
      { code: 'RT', category: 'Right', clause: 'Art. I, § 6, cl. 1', provisionText: '"for any Speech or Debate in either House, they shall not be questioned in any other Place"' },
      { code: 'RM', category: 'Removal', clause: 'Art. I, § 5, cl. 2', provisionText: '"with the Concurrence of two thirds, expel a Member"' },
      { code: 'SC', category: 'Succession', clause: 'Art. I, § 2, cl. 4', provisionText: '"When vacancies happen in the Representation from any State, the Executive Authority thereof shall issue Writs of Election"' },
      { code: 'IC', category: 'Incompatibility', clause: 'Art. I, § 6, cl. 2', provisionText: '"no Person holding any Office under the United States, shall be a Member of either House during his Continuance in Office"' },
      { code: 'IC', category: 'Incompatibility', clause: 'Art. II, § 1, cl. 2', provisionText: '"no Senator or Representative... shall be appointed an Elector"' },
      { code: 'AC', category: 'Accountability', clause: 'Art. I, § 2', provisionText: 'Accountable to People of State through biennial elections' },
    ],
    vulnerableEAPs: [],
  },

  {
    id: 'senate',
    name: 'Senate',
    branch: 'legislative',
    constitutionalSource: 'Art. I, § 3',
    description: 'Upper chamber of Congress; represents the States; advice and consent; sole power to try impeachments',
    constitutiveConditions: [
      { code: 'NM', category: 'Number', clause: 'Art. I, § 3, cl. 1; 17th Amend.', provisionText: '"two Senators from each State"' },
      { code: 'PW', category: 'Power', clause: 'Art. I, § 3, cl. 5', provisionText: '"The Senate shall chuse their other Officers, and also a President pro tempore"' },
      { code: 'PW', category: 'Power', clause: 'Art. I, § 3, cl. 6', provisionText: '"The Senate shall have the sole Power to try all Impeachments"', isPSVVulnerable: true },
      { code: 'PW', category: 'Power', clause: 'Art. II, § 2, cl. 2', provisionText: '[Advice and Consent on treaties] "provided two thirds of the Senators present concur"', isPSVVulnerable: true },
      { code: 'PW', category: 'Power', clause: 'Art. II, § 2, cl. 2', provisionText: '[Advice and Consent on appointments] "by and with the Advice and Consent of the Senate"', isPSVVulnerable: true },
      { code: 'PW', category: 'Power', clause: '12th Amend.', provisionText: '"the Senate shall choose the Vice-President" [if no Electoral majority]' },
      { code: 'DT', category: 'Duty', clause: 'Art. I, § 5, cl. 3', provisionText: '"shall keep a Journal of its Proceedings, and from time to time publish the same"' },
      { code: 'PR', category: 'Procedure', clause: 'Art. I, § 3, cl. 6', provisionText: '"When sitting for that Purpose, they shall be on Oath or Affirmation" [impeachment trials]' },
      { code: 'PR', category: 'Procedure', clause: 'Art. I, § 3, cl. 6', provisionText: '"no Person shall be convicted without the Concurrence of two thirds of the Members present"' },
      { code: 'JR', category: 'Jurisdiction', clause: 'Art. I, § 3, cl. 7', provisionText: '"Judgment in Cases of Impeachment shall not extend further than to removal from Office, and disqualification"' },
    ],
    vulnerableEAPs: [
      {
        name: 'Try Impeachments',
        clause: 'Art. I, § 3, cl. 6',
        provisionText: '"The Senate shall have the sole Power to try all Impeachments"',
        psvRisks: {
          abdication: 'Failure to conduct trial when House transmits articles of impeachment',
        },
      },
      {
        name: 'Advice and Consent (Treaties)',
        clause: 'Art. II, § 2, cl. 2',
        provisionText: 'Power to approve treaties by two-thirds vote',
        psvRisks: {
          usurpation: 'Executive entering binding international agreements without Senate ratification',
          abdication: 'Allowing treaties to be treated as executive agreements without Senate consent',
        },
      },
      {
        name: 'Advice and Consent (Appointments)',
        clause: 'Art. II, § 2, cl. 2',
        provisionText: 'Power to confirm presidential nominations',
        psvRisks: {
          abdication: 'Failure to act on nominations, allowing indefinite acting appointments',
        },
      },
    ],
  },

  {
    id: 'senator',
    name: 'Senator',
    branch: 'legislative',
    constitutionalSource: 'Art. I, § 3; 17th Amendment',
    description: 'Individual member of the Senate',
    constitutiveConditions: [
      { code: 'SL', category: 'Selection', clause: '17th Amend.', provisionText: '"elected by the people thereof"' },
      { code: 'QL', category: 'Qualification', clause: 'Art. I, § 3, cl. 3', provisionText: '"No Person shall be a Senator who shall not have attained to the Age of thirty Years"' },
      { code: 'QL', category: 'Qualification', clause: 'Art. I, § 3, cl. 3', provisionText: '"and been nine Years a Citizen of the United States"' },
      { code: 'QL', category: 'Qualification', clause: 'Art. I, § 3, cl. 3', provisionText: '"and who shall not, when elected, be an Inhabitant of that State for which he shall be chosen"' },
      { code: 'DQ', category: 'Disqualification', clause: '14th Amend., § 3', provisionText: '"No person shall be a Senator... who, having previously taken an oath... to support the Constitution, shall have engaged in insurrection"' },
      { code: 'TM', category: 'Term', clause: 'Art. I, § 3, cl. 1', provisionText: '"for six Years"' },
      { code: 'TM', category: 'Term', clause: 'Art. I, § 3, cl. 2', provisionText: 'Staggered terms: "one third may be chosen every second Year"' },
      { code: 'OT', category: 'Oath', clause: 'Art. VI, cl. 3', provisionText: '"bound by Oath or Affirmation, to support this Constitution"' },
      { code: 'CP', category: 'Compensation', clause: 'Art. I, § 6, cl. 1', provisionText: '"shall receive a Compensation for their Services"' },
      { code: 'RT', category: 'Right', clause: 'Art. I, § 6, cl. 1', provisionText: '"shall in all Cases, except Treason, Felony and Breach of the Peace, be privileged from Arrest"' },
      { code: 'RT', category: 'Right', clause: 'Art. I, § 6, cl. 1', provisionText: '"for any Speech or Debate in either House, they shall not be questioned in any other Place"' },
      { code: 'RM', category: 'Removal', clause: 'Art. I, § 5, cl. 2', provisionText: '"with the Concurrence of two thirds, expel a Member"' },
      { code: 'SC', category: 'Succession', clause: '17th Amend.', provisionText: '"the executive authority of such State shall issue writs of election to fill such vacancies"' },
      { code: 'IC', category: 'Incompatibility', clause: 'Art. I, § 6, cl. 2', provisionText: 'Same incompatibilities as Representatives' },
      { code: 'AC', category: 'Accountability', clause: '17th Amend.', provisionText: 'Accountable to People of State through elections' },
    ],
    vulnerableEAPs: [],
  },

  {
    id: 'speaker-of-the-house',
    name: 'Speaker of the House',
    shortName: 'Speaker',
    branch: 'legislative',
    constitutionalSource: 'Art. I, § 2, cl. 5',
    description: 'Presiding officer of the House of Representatives',
    constitutiveConditions: [
      { code: 'SL', category: 'Selection', clause: 'Art. I, § 2, cl. 5', provisionText: '"The House of Representatives shall chuse their Speaker"' },
      { code: 'OT', category: 'Oath', clause: 'Art. VI, cl. 3', provisionText: '"support this Constitution" (as officer)' },
      { code: 'JR', category: 'Jurisdiction', clause: '25th Amend., § 3', provisionText: 'Receives presidential written declaration of inability' },
      { code: 'JR', category: 'Jurisdiction', clause: '25th Amend., § 4', provisionText: 'Receives VP and Cabinet declaration of presidential inability' },
      { code: 'SC', category: 'Succession', clause: '3 U.S.C. § 19', provisionText: 'Second in presidential succession (statutory, not constitutional)' },
    ],
    vulnerableEAPs: [],
  },

  {
    id: 'president-pro-tempore',
    name: 'President Pro Tempore of the Senate',
    shortName: 'President Pro Tem',
    branch: 'legislative',
    constitutionalSource: 'Art. I, § 3, cl. 5',
    description: 'Presiding officer of the Senate in Vice President\'s absence',
    constitutiveConditions: [
      { code: 'SL', category: 'Selection', clause: 'Art. I, § 3, cl. 5', provisionText: '"The Senate shall chuse... a President pro tempore, in the Absence of the Vice President"' },
      { code: 'QL', category: 'Qualification', clause: '(Implied)', provisionText: 'Must be Senator' },
      { code: 'OT', category: 'Oath', clause: 'Art. VI, cl. 3', provisionText: '"support this Constitution"' },
      { code: 'JR', category: 'Jurisdiction', clause: '25th Amend., § 3', provisionText: 'Receives presidential written declaration of inability' },
      { code: 'JR', category: 'Jurisdiction', clause: '25th Amend., § 4', provisionText: 'Receives VP and Cabinet declaration of presidential inability' },
      { code: 'SC', category: 'Succession', clause: '3 U.S.C. § 19', provisionText: 'Third in presidential succession (statutory)' },
    ],
    vulnerableEAPs: [],
  },

  // ═══════════════════════════════════════════════════════════════════
  // EXECUTIVE BRANCH
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'president',
    name: 'President of the United States',
    shortName: 'President',
    branch: 'executive',
    constitutionalSource: 'Art. II, § 1',
    description: 'Chief Executive; repository of "the executive Power"',
    constitutiveConditions: [
      { code: 'PW', category: 'Power', clause: 'Art. II, § 1, cl. 1', provisionText: '"The executive Power shall be vested in a President of the United States of America"', isPSVVulnerable: true },
      { code: 'SL', category: 'Selection', clause: 'Art. II, § 1, cl. 2-4; 12th Amend.', provisionText: 'Electoral College selection; separate ballots; House selects if no majority' },
      { code: 'QL', category: 'Qualification', clause: 'Art. II, § 1, cl. 5', provisionText: '"No Person except a natural born Citizen... shall be eligible to the Office of President"' },
      { code: 'QL', category: 'Qualification', clause: 'Art. II, § 1, cl. 5', provisionText: '"neither shall any Person be eligible... who shall not have attained to the Age of thirty five Years"' },
      { code: 'QL', category: 'Qualification', clause: 'Art. II, § 1, cl. 5', provisionText: '"and been fourteen Years a Resident within the United States"' },
      { code: 'DQ', category: 'Disqualification', clause: '22nd Amend.', provisionText: '"No person shall be elected to the office of the President more than twice"' },
      { code: 'DQ', category: 'Disqualification', clause: '14th Amend., § 3', provisionText: 'Disqualification for insurrection after taking constitutional oath' },
      { code: 'TM', category: 'Term', clause: 'Art. II, § 1, cl. 1', provisionText: '"He shall hold his Office during the Term of four Years"' },
      { code: 'TM', category: 'Term', clause: '20th Amend., § 1', provisionText: '"The terms of the President and the Vice President shall end at noon on the 20th day of January"' },
      { code: 'OT', category: 'Oath', clause: 'Art. II, § 1, cl. 8', provisionText: '"I do solemnly swear (or affirm) that I will faithfully execute the Office of President of the United States, and will to the best of my Ability, preserve, protect and defend the Constitution of the United States."' },
      { code: 'CP', category: 'Compensation', clause: 'Art. II, § 1, cl. 7', provisionText: '"The President shall, at stated Times, receive for his Services, a Compensation, which shall neither be encreased nor diminished during the Period"' },
      { code: 'CP', category: 'Compensation', clause: 'Art. II, § 1, cl. 7', provisionText: '"and he shall not receive within that Period any other Emolument from the United States, or any of them"' },
      { code: 'PW', category: 'Power', clause: 'Art. II, § 2, cl. 1', provisionText: '"The President shall be Commander in Chief of the Army and Navy of the United States"', isPSVVulnerable: true },
      { code: 'PW', category: 'Power', clause: 'Art. II, § 2, cl. 1', provisionText: '"he shall have Power to grant Reprieves and Pardons for Offences against the United States, except in Cases of Impeachment"', isPSVVulnerable: true },
      { code: 'PW', category: 'Power', clause: 'Art. II, § 2, cl. 2', provisionText: '"He shall have Power, by and with the Advice and Consent of the Senate, to make Treaties"' },
      { code: 'PW', category: 'Power', clause: 'Art. II, § 2, cl. 2', provisionText: '"he shall nominate, and by and with the Advice and Consent of the Senate, shall appoint Ambassadors, other public Ministers and Consuls, Judges of the supreme Court"' },
      { code: 'PW', category: 'Power', clause: 'Art. II, § 2, cl. 3', provisionText: '"The President shall have Power to fill up all Vacancies that may happen during the Recess of the Senate"' },
      { code: 'PW', category: 'Power', clause: 'Art. I, § 7, cl. 2', provisionText: 'Sign or veto bills (presentment)' },
      { code: 'DT', category: 'Duty', clause: 'Art. II, § 3', provisionText: '"He shall from time to time give to the Congress Information of the State of the Union"' },
      { code: 'DT', category: 'Duty', clause: 'Art. II, § 3', provisionText: '"he shall receive Ambassadors and other public Ministers"' },
      { code: 'DT', category: 'Duty', clause: 'Art. II, § 3', provisionText: '"he shall take Care that the Laws be faithfully executed"', isPSVVulnerable: true },
      { code: 'DT', category: 'Duty', clause: 'Art. II, § 3', provisionText: '"and shall Commission all the Officers of the United States"' },
      { code: 'PH', category: 'Prohibition', clause: 'Art. II, § 2, cl. 1', provisionText: '[Pardon power] "except in Cases of Impeachment"' },
      { code: 'PH', category: 'Prohibition', clause: 'Art. II, § 1, cl. 7', provisionText: 'Cannot receive emoluments beyond compensation during term' },
      { code: 'RM', category: 'Removal', clause: 'Art. II, § 4', provisionText: '"The President... shall be removed from Office on Impeachment for, and Conviction of, Treason, Bribery, or other high Crimes and Misdemeanors"' },
      { code: 'RM', category: 'Removal', clause: '25th Amend., § 4', provisionText: 'Disability determination by VP + Cabinet majority' },
      { code: 'SC', category: 'Succession', clause: 'Art. II, § 1, cl. 6; 25th Amend., § 1', provisionText: '"In case of the removal of the President from office or of his death or resignation, the Vice President shall become President"' },
      { code: 'IC', category: 'Incompatibility', clause: 'Art. I, § 6, cl. 2', provisionText: 'Cannot be Member of Congress' },
      { code: 'IC', category: 'Incompatibility', clause: 'Art. II, § 1, cl. 2', provisionText: 'Cannot be appointed Elector' },
      { code: 'AC', category: 'Accountability', clause: 'Art. II, § 4', provisionText: 'Impeachment' },
    ],
    vulnerableEAPs: [
      {
        name: 'Pardon Power',
        clause: 'Art. II, § 2, cl. 1',
        provisionText: '"he shall have Power to grant Reprieves and Pardons for Offences against the United States, except in Cases of Impeachment"',
        psvRisks: {
          usurpation: 'Prosecutors granting immunity equivalent to pardons; other actors claiming pardon-derivative authority',
        },
      },
      {
        name: 'Take Care Clause',
        clause: 'Art. II, § 3',
        provisionText: '"he shall take Care that the Laws be faithfully executed"',
        psvRisks: {
          abdication: 'Failure to enforce laws; allowing subordinates to selectively enforce',
          usurpation: 'Subordinates exercising enforcement discretion beyond constitutional bounds',
        },
      },
      {
        name: 'Commander in Chief',
        clause: 'Art. II, § 2, cl. 1',
        provisionText: '"The President shall be Commander in Chief of the Army and Navy"',
        psvRisks: {
          usurpation: 'Military officers acting without presidential authorization',
          abdication: 'Delegating command authority to non-accountable actors',
        },
      },
      {
        name: 'Treaty Power',
        clause: 'Art. II, § 2, cl. 2',
        provisionText: '"He shall have Power, by and with the Advice and Consent of the Senate, to make Treaties"',
        psvRisks: {
          usurpation: 'Creating binding international obligations through executive agreements without Senate consent',
        },
      },
    ],
  },

  {
    id: 'vice-president',
    name: 'Vice President of the United States',
    shortName: 'Vice President',
    branch: 'executive',
    constitutionalSource: 'Art. I, § 3; Art. II, § 1',
    description: 'President of the Senate; first in presidential succession',
    constitutiveConditions: [
      { code: 'SL', category: 'Selection', clause: 'Art. II, § 1; 12th Amend.', provisionText: 'Electoral College (separate ballot)' },
      { code: 'SL', category: 'Selection', clause: '25th Amend., § 2', provisionText: '"Whenever there is a vacancy in the office of the Vice President, the President shall nominate a Vice President who shall take office upon confirmation by a majority vote of both Houses of Congress"' },
      { code: 'QL', category: 'Qualification', clause: '12th Amend.', provisionText: '"no person constitutionally ineligible to the office of President shall be eligible to that of Vice-President"' },
      { code: 'TM', category: 'Term', clause: 'Art. II, § 1, cl. 1', provisionText: '"together with the Vice President, chosen for the same Term" [4 years]' },
      { code: 'TM', category: 'Term', clause: '20th Amend., § 1', provisionText: 'Term ends noon January 20' },
      { code: 'OT', category: 'Oath', clause: 'Art. VI, cl. 3', provisionText: '"support this Constitution"' },
      { code: 'PW', category: 'Power', clause: 'Art. I, § 3, cl. 4', provisionText: '"The Vice President of the United States shall be President of the Senate, but shall have no Vote, unless they be equally divided"' },
      { code: 'PW', category: 'Power', clause: '25th Amend., § 4', provisionText: 'May initiate presidential disability determination with Cabinet majority' },
      { code: 'DT', category: 'Duty', clause: '25th Amend., § 3', provisionText: 'Receives presidential disability declarations' },
      { code: 'RM', category: 'Removal', clause: 'Art. II, § 4', provisionText: 'Impeachment' },
      { code: 'SC', category: 'Succession', clause: 'Art. II, § 1, cl. 6; 25th Amend., § 1', provisionText: 'Becomes President upon removal, death, resignation of President' },
      { code: 'IC', category: 'Incompatibility', clause: 'Art. I, § 3, cl. 4', provisionText: '"shall have no Vote, unless they be equally divided"' },
    ],
    vulnerableEAPs: [],
  },

  {
    id: 'principal-officers',
    name: 'Principal Officers of Executive Departments',
    shortName: 'Cabinet',
    branch: 'executive',
    constitutionalSource: 'Art. II, § 2',
    description: 'Cabinet members; heads of executive departments',
    constitutiveConditions: [
      { code: 'SL', category: 'Selection', clause: 'Art. II, § 2, cl. 2', provisionText: 'Nominated by President, confirmed by Senate (implied in "Officers of the United States")' },
      { code: 'OT', category: 'Oath', clause: 'Art. VI, cl. 3', provisionText: '"support this Constitution"' },
      { code: 'DT', category: 'Duty', clause: 'Art. II, § 2, cl. 1', provisionText: '[May be required to provide] "the Opinion, in writing... upon any Subject relating to the Duties of their respective Offices"' },
      { code: 'PW', category: 'Power', clause: '25th Amend., § 4', provisionText: 'May participate in presidential disability determination' },
      { code: 'RM', category: 'Removal', clause: 'Art. II, § 4', provisionText: 'Impeachment (as "civil Officers of the United States")' },
      { code: 'RM', category: 'Removal', clause: '(Implied)', provisionText: 'Removable by President' },
      { code: 'AC', category: 'Accountability', clause: 'Art. II', provisionText: 'Accountable to President' },
      { code: 'AC', category: 'Accountability', clause: 'Art. II, § 4', provisionText: 'Accountable through impeachment' },
    ],
    vulnerableEAPs: [],
  },

  {
    id: 'heads-of-departments',
    name: 'Heads of Departments',
    branch: 'executive',
    constitutionalSource: 'Art. II, § 2, cl. 2',
    description: 'Officers who may be vested with appointment power for inferior officers',
    constitutiveConditions: [
      { code: 'SL', category: 'Selection', clause: 'Art. II, § 2, cl. 2', provisionText: 'Appointed (same as Principal Officers)' },
      { code: 'OT', category: 'Oath', clause: 'Art. VI, cl. 3', provisionText: '"support this Constitution"' },
      { code: 'PW', category: 'Power', clause: 'Art. II, § 2, cl. 2', provisionText: '"the Congress may by Law vest the Appointment of such inferior Officers, as they think proper... in the Heads of Departments"' },
    ],
    vulnerableEAPs: [],
  },

  {
    id: 'inferior-officers',
    name: 'Inferior Officers',
    branch: 'executive',
    constitutionalSource: 'Art. II, § 2, cl. 2',
    description: 'Officers whose appointment Congress may vest in President alone, Courts, or Heads of Departments',
    constitutiveConditions: [
      { code: 'SL', category: 'Selection', clause: 'Art. II, § 2, cl. 2', provisionText: '"Congress may by Law vest the Appointment of such inferior Officers, as they think proper, in the President alone, in the Courts of Law, or in the Heads of Departments"' },
      { code: 'OT', category: 'Oath', clause: 'Art. VI, cl. 3', provisionText: '"support this Constitution"' },
      { code: 'RM', category: 'Removal', clause: 'Art. II, § 4', provisionText: 'Impeachment (as "civil Officers")' },
      { code: 'AC', category: 'Accountability', clause: '(Implied)', provisionText: 'Accountable to appointing authority' },
    ],
    vulnerableEAPs: [],
  },

  // ═══════════════════════════════════════════════════════════════════
  // ELECTORAL
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'presidential-electors',
    name: 'Presidential Electors',
    shortName: 'Electors',
    branch: 'electoral',
    constitutionalSource: 'Art. II, § 1, cl. 2',
    description: 'Select the President and Vice President',
    constitutiveConditions: [
      { code: 'SL', category: 'Selection', clause: 'Art. II, § 1, cl. 2', provisionText: '"Each State shall appoint, in such Manner as the Legislature thereof may direct, a Number of Electors"' },
      { code: 'NM', category: 'Number', clause: 'Art. II, § 1, cl. 2', provisionText: '"equal to the whole Number of Senators and Representatives to which the State may be entitled in the Congress"' },
      { code: 'NM', category: 'Number', clause: '23rd Amend.', provisionText: 'D.C. receives electors "equal to the whole number of Senators and Representatives in Congress to which the District would be entitled if it were a State"' },
      { code: 'DQ', category: 'Disqualification', clause: 'Art. II, § 1, cl. 2', provisionText: '"no Senator or Representative, or Person holding an Office of Trust or Profit under the United States, shall be appointed an Elector"' },
      { code: 'DT', category: 'Duty', clause: '12th Amend.', provisionText: '"The Electors shall meet in their respective states and vote by ballot for President and Vice-President"' },
      { code: 'PR', category: 'Procedure', clause: '12th Amend.', provisionText: '"they shall name in their ballots the person voted for as President, and in distinct ballots the person voted for as Vice-President"' },
      { code: 'PR', category: 'Procedure', clause: '12th Amend.', provisionText: '"one of whom, at least, shall not be an inhabitant of the same state with themselves"' },
    ],
    vulnerableEAPs: [],
  },

  // ═══════════════════════════════════════════════════════════════════
  // JUDICIAL BRANCH
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'supreme-court',
    name: 'Supreme Court',
    branch: 'judicial',
    constitutionalSource: 'Art. III, § 1',
    description: 'Highest judicial body; repository of "the judicial Power"',
    constitutiveConditions: [
      { code: 'PW', category: 'Power', clause: 'Art. III, § 1', provisionText: '"The judicial Power of the United States, shall be vested in one supreme Court"', isPSVVulnerable: true },
      { code: 'JR', category: 'Jurisdiction', clause: 'Art. III, § 2, cl. 1', provisionText: '"The judicial Power shall extend to all Cases, in Law and Equity, arising under this Constitution, the Laws of the United States, and Treaties"' },
      { code: 'JR', category: 'Jurisdiction', clause: 'Art. III, § 2, cl. 2', provisionText: '"In all Cases affecting Ambassadors, other public Ministers and Consuls, and those in which a State shall be Party, the supreme Court shall have original Jurisdiction"' },
      { code: 'JR', category: 'Jurisdiction', clause: 'Art. III, § 2, cl. 2', provisionText: '"In all the other Cases before mentioned, the supreme Court shall have appellate Jurisdiction, both as to Law and Fact"' },
      { code: 'JR', category: 'Jurisdiction', clause: '11th Amend.', provisionText: '"The Judicial power of the United States shall not be construed to extend to any suit in law or equity, commenced or prosecuted against one of the United States by Citizens of another State"' },
    ],
    vulnerableEAPs: [
      {
        name: 'Judicial Power',
        clause: 'Art. III, § 1',
        provisionText: '"The judicial Power of the United States, shall be vested in one supreme Court"',
        psvRisks: {
          usurpation: 'Executive or legislative branch making final determinations of law',
          abdication: 'Creating judicial doctrines that prevent review of constitutional questions',
        },
      },
    ],
  },

  {
    id: 'chief-justice',
    name: 'Chief Justice',
    branch: 'judicial',
    constitutionalSource: 'Art. I, § 3; Art. III',
    description: 'Presiding officer of the Supreme Court',
    constitutiveConditions: [
      { code: 'SL', category: 'Selection', clause: 'Art. II, § 2, cl. 2', provisionText: 'Nominated by President, confirmed by Senate (as "Judges of the supreme Court")' },
      { code: 'TM', category: 'Term', clause: 'Art. III, § 1', provisionText: '"during good Behaviour"' },
      { code: 'OT', category: 'Oath', clause: 'Art. VI, cl. 3', provisionText: '"support this Constitution"' },
      { code: 'CP', category: 'Compensation', clause: 'Art. III, § 1', provisionText: 'Compensation "shall not be diminished during their Continuance in Office"' },
      { code: 'DT', category: 'Duty', clause: 'Art. I, § 3, cl. 6', provisionText: '"When the President of the United States is tried, the Chief Justice shall preside"' },
      { code: 'RM', category: 'Removal', clause: 'Art. II, § 4', provisionText: 'Impeachment' },
    ],
    vulnerableEAPs: [],
  },

  {
    id: 'judges',
    name: 'Judges (Supreme and Inferior Courts)',
    shortName: 'Federal Judges',
    branch: 'judicial',
    constitutionalSource: 'Art. III, § 1',
    description: 'Exercise the judicial power',
    constitutiveConditions: [
      { code: 'SL', category: 'Selection', clause: 'Art. II, § 2, cl. 2', provisionText: 'Supreme Court: nominated by President, confirmed by Senate; Inferior courts: as Congress provides' },
      { code: 'TM', category: 'Term', clause: 'Art. III, § 1', provisionText: '"The Judges, both of the supreme and inferior Courts, shall hold their Offices during good Behaviour"' },
      { code: 'OT', category: 'Oath', clause: 'Art. VI, cl. 3', provisionText: '"support this Constitution"' },
      { code: 'CP', category: 'Compensation', clause: 'Art. III, § 1', provisionText: '"shall, at stated Times, receive for their Services, a Compensation, which shall not be diminished during their Continuance in Office"' },
      { code: 'RM', category: 'Removal', clause: 'Art. II, § 4', provisionText: 'Impeachment only' },
      { code: 'AC', category: 'Accountability', clause: 'Art. III, § 1', provisionText: 'Accountable only through impeachment (judicial independence)' },
    ],
    vulnerableEAPs: [],
  },

  {
    id: 'inferior-courts',
    name: 'Inferior Courts',
    branch: 'judicial',
    constitutionalSource: 'Art. III, § 1',
    description: 'Federal courts below the Supreme Court',
    constitutiveConditions: [
      { code: 'SL', category: 'Selection', clause: 'Art. III, § 1', provisionText: '"such inferior Courts as the Congress may from time to time ordain and establish"' },
      { code: 'SL', category: 'Selection', clause: 'Art. I, § 8, cl. 9', provisionText: 'Congress has power "To constitute Tribunals inferior to the supreme Court"' },
      { code: 'JR', category: 'Jurisdiction', clause: 'Art. III, § 2', provisionText: 'Jurisdiction within Article III scope as Congress provides' },
      { code: 'PW', category: 'Power', clause: 'Art. II, § 2, cl. 2', provisionText: 'May be vested with appointment power for inferior officers' },
    ],
    vulnerableEAPs: [],
  },

  {
    id: 'grand-jury',
    name: 'Grand Jury',
    branch: 'judicial',
    constitutionalSource: '5th Amendment',
    description: 'Constitutional body for criminal charging',
    constitutiveConditions: [
      { code: 'PW', category: 'Power', clause: '5th Amend.', provisionText: 'Power to issue presentments and indictments', isPSVVulnerable: true },
      { code: 'JR', category: 'Jurisdiction', clause: '5th Amend.', provisionText: '"No person shall be held to answer for a capital, or otherwise infamous crime, unless on a presentment or indictment of a Grand Jury"' },
      { code: 'JR', category: 'Jurisdiction', clause: '5th Amend.', provisionText: 'Exception: "except in cases arising in the land or naval forces, or in the Militia, when in actual service"' },
    ],
    vulnerableEAPs: [
      {
        name: 'Indictment Power',
        clause: '5th Amend.',
        provisionText: 'Power to issue presentments and indictments for infamous crimes',
        psvRisks: {
          usurpation: 'Prosecutors controlling grand jury proceedings to direct outcomes; information proceedings bypassing grand jury',
        },
      },
    ],
  },

  {
    id: 'petit-jury-criminal',
    name: 'Petit Jury (Criminal)',
    shortName: 'Criminal Jury',
    branch: 'judicial',
    constitutionalSource: 'Art. III, § 2; 6th Amendment',
    description: 'Constitutional fact-finder in criminal cases',
    constitutiveConditions: [
      { code: 'PW', category: 'Power', clause: 'Art. III, § 2, cl. 3; 6th Amend.', provisionText: 'Power to determine guilt', isPSVVulnerable: true },
      { code: 'JR', category: 'Jurisdiction', clause: 'Art. III, § 2, cl. 3', provisionText: '"The Trial of all Crimes, except in Cases of Impeachment, shall be by Jury"' },
      { code: 'JR', category: 'Jurisdiction', clause: '6th Amend.', provisionText: '"In all criminal prosecutions, the accused shall enjoy the right to a speedy and public trial, by an impartial jury"' },
      { code: 'QL', category: 'Qualification', clause: '6th Amend.', provisionText: '"impartial"' },
      { code: 'QL', category: 'Qualification', clause: '6th Amend.', provisionText: '"of the State and district wherein the crime shall have been committed"' },
      { code: 'PR', category: 'Procedure', clause: 'Art. III, § 2, cl. 3', provisionText: '"such Trial shall be held in the State where the said Crimes shall have been committed"' },
    ],
    vulnerableEAPs: [
      {
        name: 'Guilt Determination',
        clause: 'Art. III, § 2, cl. 3; 6th Amend.',
        provisionText: 'Power to determine guilt in criminal cases',
        psvRisks: {
          usurpation: 'Bench trials without valid waiver; directed verdicts of guilt; judicial fact-finding on elements',
        },
      },
    ],
  },

  {
    id: 'petit-jury-civil',
    name: 'Petit Jury (Civil)',
    shortName: 'Civil Jury',
    branch: 'judicial',
    constitutionalSource: '7th Amendment',
    description: 'Constitutional fact-finder in civil cases',
    constitutiveConditions: [
      { code: 'PW', category: 'Power', clause: '7th Amend.', provisionText: 'Power to find facts', isPSVVulnerable: true },
      { code: 'JR', category: 'Jurisdiction', clause: '7th Amend.', provisionText: '"In Suits at common law, where the value in controversy shall exceed twenty dollars, the right of trial by jury shall be preserved"' },
      { code: 'RT', category: 'Right', clause: '7th Amend.', provisionText: '"no fact tried by a jury, shall be otherwise re-examined in any Court of the United States, than according to the rules of the common law"' },
    ],
    vulnerableEAPs: [
      {
        name: 'Fact-Finding',
        clause: '7th Amend.',
        provisionText: 'Power to find facts in civil cases at common law',
        psvRisks: {
          usurpation: 'Judicial re-examination of jury-found facts outside common law procedures; doctrines like qualified immunity removing questions from jury',
        },
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // FEDERALISM
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'states',
    name: 'States',
    branch: 'federalism',
    constitutionalSource: 'Art. IV; 10th Amendment',
    description: 'Sovereign political units composing the federal union',
    constitutiveConditions: [
      { code: 'RV', category: 'Reservation', clause: '10th Amend.', provisionText: '"The powers not delegated to the United States by the Constitution, nor prohibited by it to the States, are reserved to the States respectively, or to the people"' },
      { code: 'PW', category: 'Power', clause: 'Art. I, § 8, cl. 16', provisionText: '"reserving to the States respectively, the Appointment of the Officers, and the Authority of training the Militia"' },
      { code: 'PW', category: 'Power', clause: 'Art. V', provisionText: 'May ratify amendments; may apply for convention' },
      { code: 'PW', category: 'Power', clause: '21st Amend., § 2', provisionText: 'Power over transportation and importation of intoxicating liquors' },
      { code: 'PH', category: 'Prohibition', clause: 'Art. I, § 10, cl. 1', provisionText: '"No State shall enter into any Treaty, Alliance, or Confederation; grant Letters of Marque and Reprisal; coin Money"' },
      { code: 'PH', category: 'Prohibition', clause: 'Art. I, § 10, cl. 1', provisionText: '"pass any Bill of Attainder, ex post facto Law, or Law impairing the Obligation of Contracts"' },
      { code: 'PH', category: 'Prohibition', clause: '14th Amend., § 1', provisionText: '"No State shall make or enforce any law which shall abridge the privileges or immunities of citizens; nor deprive any person of life, liberty, or property, without due process of law; nor deny equal protection"' },
      { code: 'PH', category: 'Prohibition', clause: '15th Amend.', provisionText: 'Cannot deny or abridge right to vote "on account of race, color, or previous condition of servitude"' },
      { code: 'PH', category: 'Prohibition', clause: '19th Amend.', provisionText: 'Cannot deny or abridge right to vote "on account of sex"' },
      { code: 'DT', category: 'Duty', clause: 'Art. IV, § 1', provisionText: '"Full Faith and Credit shall be given in each State to the public Acts, Records, and judicial Proceedings of every other State"' },
      { code: 'DT', category: 'Duty', clause: 'Art. IV, § 2, cl. 2', provisionText: 'Extradition: "shall on Demand of the executive Authority of the State from which he fled, be delivered up"' },
      { code: 'RT', category: 'Right', clause: 'Art. IV, § 4', provisionText: '"The United States shall guarantee to every State in this Union a Republican Form of Government, and shall protect each of them against Invasion"' },
      { code: 'RT', category: 'Right', clause: 'Art. V', provisionText: '"no State, without its Consent, shall be deprived of its equal Suffrage in the Senate"' },
    ],
    vulnerableEAPs: [],
  },

  {
    id: 'state-legislatures',
    name: 'State Legislatures',
    branch: 'federalism',
    constitutionalSource: 'Art. I, § 4; Art. IV; Art. V',
    description: 'Legislative bodies of the States',
    constitutiveConditions: [
      { code: 'PW', category: 'Power', clause: 'Art. I, § 4, cl. 1', provisionText: '"The Times, Places and Manner of holding Elections for Senators and Representatives, shall be prescribed in each State by the Legislature thereof"' },
      { code: 'PW', category: 'Power', clause: 'Art. II, § 1, cl. 2', provisionText: '"Each State shall appoint, in such Manner as the Legislature thereof may direct, a Number of Electors"' },
      { code: 'PW', category: 'Power', clause: 'Art. V', provisionText: 'May ratify amendments' },
      { code: 'PW', category: 'Power', clause: 'Art. V', provisionText: '"on the Application of the Legislatures of two thirds of the several States, shall call a Convention"' },
      { code: 'PW', category: 'Power', clause: '17th Amend.', provisionText: '"the legislature of any State may empower the executive thereof to make temporary appointments" [Senate vacancies]' },
      { code: 'OT', category: 'Oath', clause: 'Art. VI, cl. 3', provisionText: '"the Members of the several State Legislatures... shall be bound by Oath or Affirmation, to support this Constitution"' },
    ],
    vulnerableEAPs: [],
  },

  {
    id: 'state-executive',
    name: 'State Executive Authority',
    shortName: 'Governors',
    branch: 'federalism',
    constitutionalSource: 'Art. I, § 2; Art. IV',
    description: 'Executive officers of the States (Governors)',
    constitutiveConditions: [
      { code: 'DT', category: 'Duty', clause: 'Art. I, § 2, cl. 4', provisionText: '"When vacancies happen in the Representation from any State, the Executive Authority thereof shall issue Writs of Election"' },
      { code: 'DT', category: 'Duty', clause: 'Art. IV, § 2, cl. 2', provisionText: '[Demand extradition] "shall on Demand of the executive Authority of the State from which he fled, be delivered up"' },
      { code: 'PW', category: 'Power', clause: '17th Amend.', provisionText: '"the executive authority of such State shall issue writs of election to fill such vacancies"' },
      { code: 'PW', category: 'Power', clause: '17th Amend.', provisionText: 'May make temporary Senate appointments if legislature authorizes' },
      { code: 'PW', category: 'Power', clause: 'Art. IV, § 4', provisionText: 'May apply for federal protection against domestic violence when Legislature cannot be convened' },
      { code: 'OT', category: 'Oath', clause: 'Art. VI, cl. 3', provisionText: '"all executive... Officers, both of the United States and of the several States, shall be bound by Oath or Affirmation, to support this Constitution"' },
    ],
    vulnerableEAPs: [],
  },

  {
    id: 'state-judicial-officers',
    name: 'State Judicial Officers',
    shortName: 'State Judges',
    branch: 'federalism',
    constitutionalSource: 'Art. VI',
    description: 'Judicial officers of the States',
    constitutiveConditions: [
      { code: 'DT', category: 'Duty', clause: 'Art. VI, cl. 2', provisionText: '"the Judges in every State shall be bound thereby, any Thing in the Constitution or Laws of any State to the Contrary notwithstanding" [Supremacy Clause]' },
      { code: 'OT', category: 'Oath', clause: 'Art. VI, cl. 3', provisionText: '"all... judicial Officers, both of the United States and of the several States, shall be bound by Oath or Affirmation, to support this Constitution"' },
    ],
    vulnerableEAPs: [],
  },

  // ═══════════════════════════════════════════════════════════════════
  // INDIVIDUAL RIGHTS HOLDERS
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'persons',
    name: 'Persons',
    branch: 'individual',
    constitutionalSource: '5th & 14th Amendments',
    description: 'Individuals subject to constitutional protections',
    constitutiveConditions: [
      { code: 'RT', category: 'Right', clause: '5th Amend.', provisionText: '"No person shall be held to answer for a capital, or otherwise infamous crime, unless on a presentment or indictment of a Grand Jury"' },
      { code: 'RT', category: 'Right', clause: '5th Amend.', provisionText: '"nor shall any person be subject for the same offence to be twice put in jeopardy of life or limb"' },
      { code: 'RT', category: 'Right', clause: '5th Amend.', provisionText: '"nor shall be compelled in any criminal case to be a witness against himself"' },
      { code: 'RT', category: 'Right', clause: '5th Amend.', provisionText: '"nor be deprived of life, liberty, or property, without due process of law"' },
      { code: 'RT', category: 'Right', clause: '5th Amend.', provisionText: '"nor shall private property be taken for public use, without just compensation"' },
      { code: 'RT', category: 'Right', clause: '6th Amend.', provisionText: '"the accused shall enjoy the right to a speedy and public trial"' },
      { code: 'RT', category: 'Right', clause: '6th Amend.', provisionText: '"to be informed of the nature and cause of the accusation"' },
      { code: 'RT', category: 'Right', clause: '6th Amend.', provisionText: '"to be confronted with the witnesses against him"' },
      { code: 'RT', category: 'Right', clause: '6th Amend.', provisionText: '"to have compulsory process for obtaining witnesses in his favor"' },
      { code: 'RT', category: 'Right', clause: '6th Amend.', provisionText: '"to have the Assistance of Counsel for his defence"' },
      { code: 'RT', category: 'Right', clause: '8th Amend.', provisionText: '"Excessive bail shall not be required, nor excessive fines imposed, nor cruel and unusual punishments inflicted"' },
      { code: 'RT', category: 'Right', clause: '14th Amend., § 1', provisionText: '"nor shall any State deprive any person of life, liberty, or property, without due process of law; nor deny to any person within its jurisdiction the equal protection of the laws"' },
    ],
    vulnerableEAPs: [],
  },

  {
    id: 'citizens',
    name: 'Citizens',
    branch: 'individual',
    constitutionalSource: '14th Amendment; Art. IV',
    description: 'Members of the political community',
    constitutiveConditions: [
      { code: 'DF', category: 'Definition', clause: '14th Amend., § 1', provisionText: '"All persons born or naturalized in the United States, and subject to the jurisdiction thereof, are citizens of the United States and of the State wherein they reside"' },
      { code: 'RT', category: 'Right', clause: 'Art. IV, § 2, cl. 1', provisionText: '"The Citizens of each State shall be entitled to all Privileges and Immunities of Citizens in the several States"' },
      { code: 'RT', category: 'Right', clause: '14th Amend., § 1', provisionText: '"No State shall make or enforce any law which shall abridge the privileges or immunities of citizens of the United States"' },
      { code: 'RT', category: 'Right', clause: '15th Amend.', provisionText: '"The right of citizens of the United States to vote shall not be denied or abridged by the United States or by any State on account of race, color, or previous condition of servitude"' },
      { code: 'RT', category: 'Right', clause: '19th Amend.', provisionText: '"The right of citizens of the United States to vote shall not be denied or abridged by the United States or by any State on account of sex"' },
      { code: 'RT', category: 'Right', clause: '24th Amend.', provisionText: '"The right of citizens of the United States to vote... shall not be denied or abridged by the United States or any State by reason of failure to pay any poll tax or other tax"' },
      { code: 'RT', category: 'Right', clause: '26th Amend.', provisionText: '"The right of citizens of the United States, who are eighteen years of age or older, to vote shall not be denied or abridged by the United States or by any State on account of age"' },
    ],
    vulnerableEAPs: [],
  },
];

// Helper function to get position by ID
export const getPositionById = (id: string): Position | undefined => {
  return constitutionalPositions.find(p => p.id === id);
};

// Helper function to get positions by branch
export const getPositionsByBranch = (branch: Branch): Position[] => {
  return constitutionalPositions.filter(p => p.branch === branch);
};

// Helper function to get all positions with vulnerable EAPs
export const getPositionsWithPSVs = (): Position[] => {
  return constitutionalPositions.filter(p => p.vulnerableEAPs.length > 0);
};
