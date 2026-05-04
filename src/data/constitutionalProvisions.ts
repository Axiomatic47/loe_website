// Constitutional Provisions Master Data
// Generated from CONSTITUTION_COMPLETE_ANALYSIS.md

// ============ TYPE DEFINITIONS ============

export type ElementType =
  | 'PAEP'    // Position of Assigned Enumerated Power
  | 'EAP'     // Enumerated Assigned Power
  | 'CC'      // Constitutive Condition
  | 'PRO'     // Prohibition
  | 'RT'      // Right
  | 'DEF'     // Definition
  | 'PROC'    // Procedure
  | 'TRANS';  // Transitional

export type CCSubtype =
  | 'CC-PW'   // Power
  | 'CC-QL'   // Qualification
  | 'CC-TM'   // Term
  | 'CC-SL'   // Selection
  | 'CC-OT'   // Oath
  | 'CC-CP'   // Compensation
  | 'CC-RM'   // Removal
  | 'CC-NM'   // Number
  | 'CC-SC'   // Succession
  | 'CC-IC'   // Incompatibility
  | 'CC-JR'   // Jurisdiction
  | 'CC-AC'   // Accountability
  | 'CC-DT';  // Duty

export type PSVStatus = 'U' | 'A' | 'U/A' | 'IRR' | null;

export interface ConstitutionalProvision {
  id: string;
  text: string;
  type: ElementType | ElementType[];
  ccSubtype?: CCSubtype;
  assignedTo: string[];
  psv: PSVStatus;
  article: string;
  section?: string;
  clause?: string;
}

// All 25 PAEPs
export const PAEPS = [
  'The People',
  'Congress',
  'House of Representatives',
  'Senate',
  'Representatives',
  'Senators',
  'Speaker of the House',
  'President Pro Tempore',
  'President',
  'Vice President',
  'Principal Officers',
  'Heads of Departments',
  'Inferior Officers',
  'Presidential Electors',
  'Supreme Court',
  'Chief Justice',
  'Judges',
  'Inferior Courts',
  'Grand Jury',
  'Petit Jury (Criminal)',
  'Petit Jury (Civil)',
  'States',
  'State Legislatures',
  'State Executive',
  'State Judicial Officers',
  'Persons',
  'Citizens',
  'Accused',
  'United States'
] as const;

export type PAEP = typeof PAEPS[number];

// ============ PROVISIONS DATA ============

export const provisions: ConstitutionalProvision[] = [
  // PREAMBLE
  {
    id: 'P.1',
    text: 'We the People of the United States',
    type: 'PAEP',
    assignedTo: ['The People'],
    psv: null,
    article: 'Preamble'
  },
  {
    id: 'P.8',
    text: 'do ordain and establish this Constitution for the United States of America',
    type: 'EAP',
    assignedTo: ['The People'],
    psv: 'U',
    article: 'Preamble'
  },

  // ARTICLE I, SECTION 1 - Legislative Vesting
  {
    id: 'I.1.1',
    text: 'All legislative Powers herein granted',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U/A',
    article: 'Article I',
    section: '1'
  },
  {
    id: 'I.1.2',
    text: 'shall be vested in a Congress of the United States',
    type: 'PAEP',
    assignedTo: ['Congress'],
    psv: null,
    article: 'Article I',
    section: '1'
  },
  {
    id: 'I.1.3',
    text: 'which shall consist of a Senate and House of Representatives',
    type: 'CC',
    ccSubtype: 'CC-NM',
    assignedTo: ['Congress'],
    psv: null,
    article: 'Article I',
    section: '1'
  },

  // ARTICLE I, SECTION 2 - House of Representatives
  {
    id: 'I.2.1a',
    text: 'The House of Representatives shall be composed of Members',
    type: 'PAEP',
    assignedTo: ['House of Representatives', 'Representatives'],
    psv: null,
    article: 'Article I',
    section: '2',
    clause: '1'
  },
  {
    id: 'I.2.1b',
    text: 'chosen every second Year',
    type: 'CC',
    ccSubtype: 'CC-TM',
    assignedTo: ['Representatives'],
    psv: null,
    article: 'Article I',
    section: '2',
    clause: '1'
  },
  {
    id: 'I.2.1c',
    text: 'by the People of the several States',
    type: 'CC',
    ccSubtype: 'CC-SL',
    assignedTo: ['Representatives'],
    psv: null,
    article: 'Article I',
    section: '2',
    clause: '1'
  },
  {
    id: 'I.2.2a',
    text: 'No Person shall be a Representative who shall not have attained to the Age of twenty five Years',
    type: 'CC',
    ccSubtype: 'CC-QL',
    assignedTo: ['Representatives'],
    psv: null,
    article: 'Article I',
    section: '2',
    clause: '2'
  },
  {
    id: 'I.2.2b',
    text: 'and been seven Years a Citizen of the United States',
    type: 'CC',
    ccSubtype: 'CC-QL',
    assignedTo: ['Representatives'],
    psv: null,
    article: 'Article I',
    section: '2',
    clause: '2'
  },
  {
    id: 'I.2.2c',
    text: 'and who shall not, when elected, be an Inhabitant of that State in which he shall be chosen',
    type: 'CC',
    ccSubtype: 'CC-QL',
    assignedTo: ['Representatives'],
    psv: null,
    article: 'Article I',
    section: '2',
    clause: '2'
  },
  {
    id: 'I.2.3e',
    text: 'in such Manner as they shall by Law direct',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U',
    article: 'Article I',
    section: '2',
    clause: '3'
  },
  {
    id: 'I.2.4b',
    text: 'the Executive Authority thereof shall issue Writs of Election to fill such Vacancies',
    type: 'EAP',
    ccSubtype: 'CC-DT',
    assignedTo: ['State Executive'],
    psv: 'U/A',
    article: 'Article I',
    section: '2',
    clause: '4'
  },
  {
    id: 'I.2.5a',
    text: 'The House of Representatives shall chuse their Speaker and other Officers',
    type: 'EAP',
    assignedTo: ['House of Representatives'],
    psv: 'U',
    article: 'Article I',
    section: '2',
    clause: '5'
  },
  {
    id: 'I.2.5b',
    text: 'and shall have the sole Power of Impeachment',
    type: 'EAP',
    assignedTo: ['House of Representatives'],
    psv: 'U/A',
    article: 'Article I',
    section: '2',
    clause: '5'
  },

  // ARTICLE I, SECTION 3 - Senate
  {
    id: 'I.3.1a',
    text: 'The Senate of the United States shall be composed of two Senators from each State',
    type: ['PAEP', 'CC'],
    ccSubtype: 'CC-NM',
    assignedTo: ['Senate', 'Senators'],
    psv: null,
    article: 'Article I',
    section: '3',
    clause: '1'
  },
  {
    id: 'I.3.1c',
    text: 'for six Years',
    type: 'CC',
    ccSubtype: 'CC-TM',
    assignedTo: ['Senators'],
    psv: null,
    article: 'Article I',
    section: '3',
    clause: '1'
  },
  {
    id: 'I.3.1d',
    text: 'and each Senator shall have one Vote',
    type: 'CC',
    ccSubtype: 'CC-PW',
    assignedTo: ['Senators'],
    psv: null,
    article: 'Article I',
    section: '3',
    clause: '1'
  },
  {
    id: 'I.3.3a',
    text: 'No Person shall be a Senator who shall not have attained to the Age of thirty Years',
    type: 'CC',
    ccSubtype: 'CC-QL',
    assignedTo: ['Senators'],
    psv: null,
    article: 'Article I',
    section: '3',
    clause: '3'
  },
  {
    id: 'I.3.3b',
    text: 'and been nine Years a Citizen of the United States',
    type: 'CC',
    ccSubtype: 'CC-QL',
    assignedTo: ['Senators'],
    psv: null,
    article: 'Article I',
    section: '3',
    clause: '3'
  },
  {
    id: 'I.3.3c',
    text: 'and who shall not, when elected, be an Inhabitant of that State for which he shall be chosen',
    type: 'CC',
    ccSubtype: 'CC-QL',
    assignedTo: ['Senators'],
    psv: null,
    article: 'Article I',
    section: '3',
    clause: '3'
  },
  {
    id: 'I.3.4a',
    text: 'The Vice President of the United States shall be President of the Senate',
    type: ['PAEP', 'CC'],
    ccSubtype: 'CC-PW',
    assignedTo: ['Vice President'],
    psv: 'U',
    article: 'Article I',
    section: '3',
    clause: '4'
  },
  {
    id: 'I.3.4b',
    text: 'but shall have no Vote, unless they be equally divided',
    type: 'CC',
    ccSubtype: 'CC-PW',
    assignedTo: ['Vice President'],
    psv: 'U/A',
    article: 'Article I',
    section: '3',
    clause: '4'
  },
  {
    id: 'I.3.5a',
    text: 'The Senate shall chuse their other Officers',
    type: 'EAP',
    assignedTo: ['Senate'],
    psv: 'U',
    article: 'Article I',
    section: '3',
    clause: '5'
  },
  {
    id: 'I.3.5b',
    text: 'and also a President pro tempore',
    type: 'PAEP',
    assignedTo: ['President Pro Tempore'],
    psv: null,
    article: 'Article I',
    section: '3',
    clause: '5'
  },
  {
    id: 'I.3.6a',
    text: 'The Senate shall have the sole Power to try all Impeachments',
    type: 'EAP',
    assignedTo: ['Senate'],
    psv: 'U/A',
    article: 'Article I',
    section: '3',
    clause: '6'
  },
  {
    id: 'I.3.6b',
    text: 'When sitting for that Purpose, they shall be on Oath or Affirmation',
    type: 'CC',
    ccSubtype: 'CC-OT',
    assignedTo: ['Senators'],
    psv: null,
    article: 'Article I',
    section: '3',
    clause: '6'
  },
  {
    id: 'I.3.6c',
    text: 'When the President of the United States is tried, the Chief Justice shall preside',
    type: 'CC',
    ccSubtype: 'CC-DT',
    assignedTo: ['Chief Justice'],
    psv: 'U/A',
    article: 'Article I',
    section: '3',
    clause: '6'
  },
  {
    id: 'I.3.6d',
    text: 'And no Person shall be convicted without the Concurrence of two thirds of the Members present',
    type: 'PROC',
    assignedTo: ['Senate'],
    psv: 'IRR',
    article: 'Article I',
    section: '3',
    clause: '6'
  },
  {
    id: 'I.3.7a',
    text: 'Judgment in Cases of Impeachment shall not extend further than to removal from Office',
    type: 'CC',
    ccSubtype: 'CC-JR',
    assignedTo: ['Senate'],
    psv: null,
    article: 'Article I',
    section: '3',
    clause: '7'
  },
  {
    id: 'I.3.7b',
    text: 'and disqualification to hold and enjoy any Office of honor, Trust or Profit under the United States',
    type: 'CC',
    ccSubtype: 'CC-JR',
    assignedTo: ['Senate'],
    psv: null,
    article: 'Article I',
    section: '3',
    clause: '7'
  },

  // ARTICLE I, SECTION 4 - Elections
  {
    id: 'I.4.1a',
    text: 'The Times, Places and Manner of holding Elections for Senators and Representatives, shall be prescribed in each State by the Legislature thereof',
    type: 'EAP',
    assignedTo: ['State Legislatures'],
    psv: 'U',
    article: 'Article I',
    section: '4',
    clause: '1'
  },
  {
    id: 'I.4.1b',
    text: 'but the Congress may at any time by Law make or alter such Regulations',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U',
    article: 'Article I',
    section: '4',
    clause: '1'
  },
  {
    id: 'I.4.2a',
    text: 'The Congress shall assemble at least once in every Year',
    type: 'CC',
    ccSubtype: 'CC-DT',
    assignedTo: ['Congress'],
    psv: 'A',
    article: 'Article I',
    section: '4',
    clause: '2'
  },

  // ARTICLE I, SECTION 5 - Rules and Proceedings
  {
    id: 'I.5.1a',
    text: 'Each House shall be the Judge of the Elections, Returns and Qualifications of its own Members',
    type: 'EAP',
    assignedTo: ['House of Representatives', 'Senate'],
    psv: 'U',
    article: 'Article I',
    section: '5',
    clause: '1'
  },
  {
    id: 'I.5.1d',
    text: 'and may be authorized to compel the Attendance of absent Members',
    type: 'EAP',
    assignedTo: ['House of Representatives', 'Senate'],
    psv: 'U',
    article: 'Article I',
    section: '5',
    clause: '1'
  },
  {
    id: 'I.5.2a',
    text: 'Each House may determine the Rules of its Proceedings',
    type: 'EAP',
    assignedTo: ['House of Representatives', 'Senate'],
    psv: 'U',
    article: 'Article I',
    section: '5',
    clause: '2'
  },
  {
    id: 'I.5.2b',
    text: 'punish its Members for disorderly Behaviour',
    type: 'EAP',
    assignedTo: ['House of Representatives', 'Senate'],
    psv: 'U',
    article: 'Article I',
    section: '5',
    clause: '2'
  },
  {
    id: 'I.5.2c',
    text: 'and, with the Concurrence of two thirds, expel a Member',
    type: 'EAP',
    assignedTo: ['House of Representatives', 'Senate'],
    psv: 'IRR',
    article: 'Article I',
    section: '5',
    clause: '2'
  },
  {
    id: 'I.5.3a',
    text: 'Each House shall keep a Journal of its Proceedings',
    type: 'CC',
    ccSubtype: 'CC-DT',
    assignedTo: ['House of Representatives', 'Senate'],
    psv: 'A',
    article: 'Article I',
    section: '5',
    clause: '3'
  },

  // ARTICLE I, SECTION 6 - Compensation and Privileges
  {
    id: 'I.6.1a',
    text: 'The Senators and Representatives shall receive a Compensation for their Services',
    type: 'CC',
    ccSubtype: 'CC-CP',
    assignedTo: ['Senators', 'Representatives'],
    psv: null,
    article: 'Article I',
    section: '6',
    clause: '1'
  },
  {
    id: 'I.6.1d',
    text: 'They shall in all Cases, except Treason, Felony and Breach of the Peace, be privileged from Arrest during their Attendance',
    type: 'RT',
    assignedTo: ['Senators', 'Representatives'],
    psv: 'U',
    article: 'Article I',
    section: '6',
    clause: '1'
  },
  {
    id: 'I.6.1e',
    text: 'and for any Speech or Debate in either House, they shall not be questioned in any other Place',
    type: 'RT',
    assignedTo: ['Senators', 'Representatives'],
    psv: 'U',
    article: 'Article I',
    section: '6',
    clause: '1'
  },
  {
    id: 'I.6.2a',
    text: 'No Senator or Representative shall, during the Time for which he was elected, be appointed to any civil Office under the Authority of the United States',
    type: 'CC',
    ccSubtype: 'CC-IC',
    assignedTo: ['Senators', 'Representatives'],
    psv: null,
    article: 'Article I',
    section: '6',
    clause: '2'
  },
  {
    id: 'I.6.2b',
    text: 'and no Person holding any Office under the United States, shall be a Member of either House during his Continuance in Office',
    type: 'CC',
    ccSubtype: 'CC-IC',
    assignedTo: ['Senators', 'Representatives'],
    psv: null,
    article: 'Article I',
    section: '6',
    clause: '2'
  },

  // ARTICLE I, SECTION 7 - Revenue Bills; Veto
  {
    id: 'I.7.1a',
    text: 'All Bills for raising Revenue shall originate in the House of Representatives',
    type: 'EAP',
    assignedTo: ['House of Representatives'],
    psv: 'U',
    article: 'Article I',
    section: '7',
    clause: '1'
  },
  {
    id: 'I.7.1b',
    text: 'but the Senate may propose or concur with Amendments as on other Bills',
    type: 'EAP',
    assignedTo: ['Senate'],
    psv: 'U',
    article: 'Article I',
    section: '7',
    clause: '1'
  },
  {
    id: 'I.7.2b',
    text: 'If he approve he shall sign it',
    type: 'EAP',
    assignedTo: ['President'],
    psv: 'A',
    article: 'Article I',
    section: '7',
    clause: '2'
  },
  {
    id: 'I.7.2c',
    text: 'but if not he shall return it, with his Objections to that House in which it shall have originated',
    type: 'EAP',
    assignedTo: ['President'],
    psv: 'U/A',
    article: 'Article I',
    section: '7',
    clause: '2'
  },
  {
    id: 'I.7.2e',
    text: 'If after such Reconsideration two thirds of that House shall agree to pass the Bill',
    type: 'PROC',
    assignedTo: ['House of Representatives', 'Senate'],
    psv: 'IRR',
    article: 'Article I',
    section: '7',
    clause: '2'
  },
  {
    id: 'I.7.2i',
    text: 'unless the Congress by their Adjournment prevent its Return, in which Case it shall not be a Law',
    type: 'EAP',
    assignedTo: ['President'],
    psv: 'U',
    article: 'Article I',
    section: '7',
    clause: '2'
  },

  // ARTICLE I, SECTION 8 - Powers of Congress
  {
    id: 'I.8.1a',
    text: 'The Congress shall have Power To lay and collect Taxes, Duties, Imposts and Excises',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U/A',
    article: 'Article I',
    section: '8',
    clause: '1'
  },
  {
    id: 'I.8.1b',
    text: 'to pay the Debts and provide for the common Defence and general Welfare of the United States',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U/A',
    article: 'Article I',
    section: '8',
    clause: '1'
  },
  {
    id: 'I.8.1c',
    text: 'but all Duties, Imposts and Excises shall be uniform throughout the United States',
    type: 'PRO',
    assignedTo: ['Congress'],
    psv: null,
    article: 'Article I',
    section: '8',
    clause: '1'
  },
  {
    id: 'I.8.2',
    text: 'To borrow Money on the credit of the United States',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U/A',
    article: 'Article I',
    section: '8',
    clause: '2'
  },
  {
    id: 'I.8.3',
    text: 'To regulate Commerce with foreign Nations, and among the several States, and with the Indian Tribes',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U/A',
    article: 'Article I',
    section: '8',
    clause: '3'
  },
  {
    id: 'I.8.4a',
    text: 'To establish an uniform Rule of Naturalization',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U/A',
    article: 'Article I',
    section: '8',
    clause: '4'
  },
  {
    id: 'I.8.4b',
    text: 'and uniform Laws on the subject of Bankruptcies throughout the United States',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U/A',
    article: 'Article I',
    section: '8',
    clause: '4'
  },
  {
    id: 'I.8.5a',
    text: 'To coin Money, regulate the Value thereof, and of foreign Coin',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U/A',
    article: 'Article I',
    section: '8',
    clause: '5'
  },
  {
    id: 'I.8.5b',
    text: 'and fix the Standard of Weights and Measures',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U',
    article: 'Article I',
    section: '8',
    clause: '5'
  },
  {
    id: 'I.8.6',
    text: 'To provide for the Punishment of counterfeiting the Securities and current Coin of the United States',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U',
    article: 'Article I',
    section: '8',
    clause: '6'
  },
  {
    id: 'I.8.7',
    text: 'To establish Post Offices and post Roads',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U',
    article: 'Article I',
    section: '8',
    clause: '7'
  },
  {
    id: 'I.8.8',
    text: 'To promote the Progress of Science and useful Arts, by securing for limited Times to Authors and Inventors the exclusive Right to their respective Writings and Discoveries',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U/A',
    article: 'Article I',
    section: '8',
    clause: '8'
  },
  {
    id: 'I.8.9',
    text: 'To constitute Tribunals inferior to the supreme Court',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U',
    article: 'Article I',
    section: '8',
    clause: '9'
  },
  {
    id: 'I.8.10',
    text: 'To define and punish Piracies and Felonies committed on the high Seas, and Offences against the Law of Nations',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U',
    article: 'Article I',
    section: '8',
    clause: '10'
  },
  {
    id: 'I.8.11a',
    text: 'To declare War',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U/A',
    article: 'Article I',
    section: '8',
    clause: '11'
  },
  {
    id: 'I.8.11b',
    text: 'grant Letters of Marque and Reprisal',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U',
    article: 'Article I',
    section: '8',
    clause: '11'
  },
  {
    id: 'I.8.11c',
    text: 'and make Rules concerning Captures on Land and Water',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U',
    article: 'Article I',
    section: '8',
    clause: '11'
  },
  {
    id: 'I.8.12a',
    text: 'To raise and support Armies',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U/A',
    article: 'Article I',
    section: '8',
    clause: '12'
  },
  {
    id: 'I.8.12b',
    text: 'but no Appropriation of Money to that Use shall be for a longer Term than two Years',
    type: 'PRO',
    assignedTo: ['Congress'],
    psv: null,
    article: 'Article I',
    section: '8',
    clause: '12'
  },
  {
    id: 'I.8.13',
    text: 'To provide and maintain a Navy',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U/A',
    article: 'Article I',
    section: '8',
    clause: '13'
  },
  {
    id: 'I.8.14',
    text: 'To make Rules for the Government and Regulation of the land and naval Forces',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U',
    article: 'Article I',
    section: '8',
    clause: '14'
  },
  {
    id: 'I.8.15',
    text: 'To provide for calling forth the Militia to execute the Laws of the Union, suppress Insurrections and repel Invasions',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U/A',
    article: 'Article I',
    section: '8',
    clause: '15'
  },
  {
    id: 'I.8.16a',
    text: 'To provide for organizing, arming, and disciplining, the Militia',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U',
    article: 'Article I',
    section: '8',
    clause: '16'
  },
  {
    id: 'I.8.16c',
    text: 'reserving to the States respectively, the Appointment of the Officers',
    type: 'EAP',
    assignedTo: ['States'],
    psv: 'U',
    article: 'Article I',
    section: '8',
    clause: '16'
  },
  {
    id: 'I.8.16d',
    text: 'and the Authority of training the Militia according to the discipline prescribed by Congress',
    type: 'EAP',
    assignedTo: ['States'],
    psv: 'U/A',
    article: 'Article I',
    section: '8',
    clause: '16'
  },
  {
    id: 'I.8.17a',
    text: 'To exercise exclusive Legislation in all Cases whatsoever, over such District as may become the Seat of Government of the United States',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U',
    article: 'Article I',
    section: '8',
    clause: '17'
  },
  {
    id: 'I.8.17b',
    text: 'and to exercise like Authority over all Places purchased for the Erection of Forts, Magazines, Arsenals, dock-Yards, and other needful Buildings',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U',
    article: 'Article I',
    section: '8',
    clause: '17'
  },
  {
    id: 'I.8.18',
    text: 'To make all Laws which shall be necessary and proper for carrying into Execution the foregoing Powers',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U/A',
    article: 'Article I',
    section: '8',
    clause: '18'
  },

  // ARTICLE I, SECTION 9 - Limits on Congress
  {
    id: 'I.9.2a',
    text: 'The Privilege of the Writ of Habeas Corpus shall not be suspended',
    type: 'RT',
    assignedTo: ['Persons'],
    psv: 'U',
    article: 'Article I',
    section: '9',
    clause: '2'
  },
  {
    id: 'I.9.3',
    text: 'No Bill of Attainder or ex post facto Law shall be passed',
    type: 'PRO',
    assignedTo: ['Congress'],
    psv: null,
    article: 'Article I',
    section: '9',
    clause: '3'
  },
  {
    id: 'I.9.4',
    text: 'No Capitation, or other direct, Tax shall be laid, unless in Proportion to the Census',
    type: 'PRO',
    assignedTo: ['Congress'],
    psv: null,
    article: 'Article I',
    section: '9',
    clause: '4'
  },
  {
    id: 'I.9.5',
    text: 'No Tax or Duty shall be laid on Articles exported from any State',
    type: 'PRO',
    assignedTo: ['Congress'],
    psv: null,
    article: 'Article I',
    section: '9',
    clause: '5'
  },
  {
    id: 'I.9.6a',
    text: 'No Preference shall be given by any Regulation of Commerce or Revenue to the Ports of one State over those of another',
    type: 'PRO',
    assignedTo: ['Congress'],
    psv: null,
    article: 'Article I',
    section: '9',
    clause: '6'
  },
  {
    id: 'I.9.7a',
    text: 'No Money shall be drawn from the Treasury, but in Consequence of Appropriations made by Law',
    type: 'PRO',
    assignedTo: ['Congress', 'President'],
    psv: null,
    article: 'Article I',
    section: '9',
    clause: '7'
  },
  {
    id: 'I.9.7b',
    text: 'and a regular Statement and Account of the Receipts and Expenditures of all public Money shall be published from time to time',
    type: 'CC',
    ccSubtype: 'CC-DT',
    assignedTo: ['Congress'],
    psv: 'A',
    article: 'Article I',
    section: '9',
    clause: '7'
  },
  {
    id: 'I.9.8a',
    text: 'No Title of Nobility shall be granted by the United States',
    type: 'PRO',
    assignedTo: ['United States'],
    psv: null,
    article: 'Article I',
    section: '9',
    clause: '8'
  },

  // ARTICLE I, SECTION 10 - Limits on States
  {
    id: 'I.10.1a',
    text: 'No State shall enter into any Treaty, Alliance, or Confederation',
    type: 'PRO',
    assignedTo: ['States'],
    psv: null,
    article: 'Article I',
    section: '10',
    clause: '1'
  },
  {
    id: 'I.10.1c',
    text: 'coin Money',
    type: 'PRO',
    assignedTo: ['States'],
    psv: null,
    article: 'Article I',
    section: '10',
    clause: '1'
  },
  {
    id: 'I.10.1f',
    text: 'pass any Bill of Attainder, ex post facto Law, or Law impairing the Obligation of Contracts',
    type: 'PRO',
    assignedTo: ['States'],
    psv: null,
    article: 'Article I',
    section: '10',
    clause: '1'
  },

  // ============ ARTICLE II - EXECUTIVE BRANCH ============

  // ARTICLE II, SECTION 1 - Executive Vesting and Election
  {
    id: 'II.1.1a',
    text: 'The executive Power shall be vested in a President of the United States of America',
    type: ['PAEP', 'EAP'],
    assignedTo: ['President'],
    psv: 'U/A',
    article: 'Article II',
    section: '1',
    clause: '1'
  },
  {
    id: 'II.1.1b',
    text: 'He shall hold his Office during the Term of four Years',
    type: 'CC',
    ccSubtype: 'CC-TM',
    assignedTo: ['President'],
    psv: null,
    article: 'Article II',
    section: '1',
    clause: '1'
  },
  {
    id: 'II.1.2a',
    text: 'Each State shall appoint, in such Manner as the Legislature thereof may direct, a Number of Electors',
    type: ['PAEP', 'EAP'],
    assignedTo: ['State Legislatures', 'Presidential Electors'],
    psv: 'U',
    article: 'Article II',
    section: '1',
    clause: '2'
  },
  {
    id: 'II.1.2c',
    text: 'but no Senator or Representative, or Person holding an Office of Trust or Profit under the United States, shall be appointed an Elector',
    type: 'CC',
    ccSubtype: 'CC-IC',
    assignedTo: ['Presidential Electors'],
    psv: null,
    article: 'Article II',
    section: '1',
    clause: '2'
  },
  {
    id: 'II.1.4a',
    text: 'The Congress may determine the Time of chusing the Electors',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U',
    article: 'Article II',
    section: '1',
    clause: '4'
  },
  {
    id: 'II.1.5a',
    text: 'No Person except a natural born Citizen, or a Citizen of the United States, at the time of the Adoption of this Constitution, shall be eligible to the Office of President',
    type: 'CC',
    ccSubtype: 'CC-QL',
    assignedTo: ['President'],
    psv: null,
    article: 'Article II',
    section: '1',
    clause: '5'
  },
  {
    id: 'II.1.5b',
    text: 'neither shall any Person be eligible to that Office who shall not have attained to the Age of thirty five Years',
    type: 'CC',
    ccSubtype: 'CC-QL',
    assignedTo: ['President'],
    psv: null,
    article: 'Article II',
    section: '1',
    clause: '5'
  },
  {
    id: 'II.1.5c',
    text: 'and been fourteen Years a Resident within the United States',
    type: 'CC',
    ccSubtype: 'CC-QL',
    assignedTo: ['President'],
    psv: null,
    article: 'Article II',
    section: '1',
    clause: '5'
  },
  {
    id: 'II.1.6a',
    text: 'In Case of the Removal of the President from Office, or of his Death, Resignation, or Inability to discharge the Powers and Duties of the said Office, the Same shall devolve on the Vice President',
    type: 'CC',
    ccSubtype: 'CC-SC',
    assignedTo: ['Vice President'],
    psv: null,
    article: 'Article II',
    section: '1',
    clause: '6'
  },
  {
    id: 'II.1.6b',
    text: 'and the Congress may by law provide for the Case of Removal, Death, Resignation or Inability, both of the President and Vice President',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'A',
    article: 'Article II',
    section: '1',
    clause: '6'
  },
  {
    id: 'II.1.7a',
    text: 'The President shall, at stated Times, receive for his Services, a Compensation',
    type: 'CC',
    ccSubtype: 'CC-CP',
    assignedTo: ['President'],
    psv: null,
    article: 'Article II',
    section: '1',
    clause: '7'
  },
  {
    id: 'II.1.7b',
    text: 'which shall neither be encreased nor diminished during the Period for which he shall have been elected',
    type: 'PRO',
    assignedTo: ['Congress'],
    psv: null,
    article: 'Article II',
    section: '1',
    clause: '7'
  },
  {
    id: 'II.1.8a',
    text: 'Before he enter on the Execution of his Office, he shall take the following Oath or Affirmation',
    type: 'CC',
    ccSubtype: 'CC-OT',
    assignedTo: ['President'],
    psv: null,
    article: 'Article II',
    section: '1',
    clause: '8'
  },
  {
    id: 'II.1.8b',
    text: 'I do solemnly swear (or affirm) that I will faithfully execute the Office of President of the United States, and will to the best of my Ability, preserve, protect and defend the Constitution of the United States',
    type: 'CC',
    ccSubtype: 'CC-OT',
    assignedTo: ['President'],
    psv: null,
    article: 'Article II',
    section: '1',
    clause: '8'
  },

  // ARTICLE II, SECTION 2 - Powers
  {
    id: 'II.2.1a',
    text: 'The President shall be Commander in Chief of the Army and Navy of the United States, and of the Militia of the several States, when called into the actual Service of the United States',
    type: 'EAP',
    assignedTo: ['President'],
    psv: 'U/A',
    article: 'Article II',
    section: '2',
    clause: '1'
  },
  {
    id: 'II.2.1b',
    text: 'he may require the Opinion, in writing, of the principal Officer in each of the executive Departments, upon any Subject relating to the Duties of their respective Offices',
    type: 'EAP',
    assignedTo: ['President'],
    psv: 'U',
    article: 'Article II',
    section: '2',
    clause: '1'
  },
  {
    id: 'II.2.1c',
    text: 'and he shall have Power to grant Reprieves and Pardons for Offences against the United States, except in Cases of Impeachment',
    type: 'EAP',
    assignedTo: ['President'],
    psv: 'U',
    article: 'Article II',
    section: '2',
    clause: '1'
  },
  {
    id: 'II.2.2a',
    text: 'He shall have Power, by and with the Advice and Consent of the Senate, to make Treaties',
    type: 'EAP',
    assignedTo: ['President', 'Senate'],
    psv: 'U/A',
    article: 'Article II',
    section: '2',
    clause: '2'
  },
  {
    id: 'II.2.2b',
    text: 'provided two thirds of the Senators present concur',
    type: 'PROC',
    assignedTo: ['Senate'],
    psv: 'IRR',
    article: 'Article II',
    section: '2',
    clause: '2'
  },
  {
    id: 'II.2.2c',
    text: 'and he shall nominate',
    type: 'EAP',
    assignedTo: ['President'],
    psv: 'U/A',
    article: 'Article II',
    section: '2',
    clause: '2'
  },
  {
    id: 'II.2.2d',
    text: 'and by and with the Advice and Consent of the Senate, shall appoint Ambassadors, other public Ministers and Consuls, Judges of the supreme Court, and all other Officers of the United States',
    type: 'EAP',
    assignedTo: ['President', 'Senate'],
    psv: 'U',
    article: 'Article II',
    section: '2',
    clause: '2'
  },
  {
    id: 'II.2.2f',
    text: 'but the Congress may by Law vest the Appointment of such inferior Officers, as they think proper, in the President alone, in the Courts of Law, or in the Heads of Departments',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U/A',
    article: 'Article II',
    section: '2',
    clause: '2'
  },
  {
    id: 'II.2.3',
    text: 'The President shall have Power to fill up all Vacancies that may happen during the Recess of the Senate, by granting Commissions which shall expire at the End of their next Session',
    type: 'EAP',
    assignedTo: ['President'],
    psv: 'U',
    article: 'Article II',
    section: '2',
    clause: '3'
  },

  // ARTICLE II, SECTION 3 - Duties
  {
    id: 'II.3.1',
    text: 'He shall from time to time give to the Congress Information of the State of the Union',
    type: 'CC',
    ccSubtype: 'CC-DT',
    assignedTo: ['President'],
    psv: 'A',
    article: 'Article II',
    section: '3'
  },
  {
    id: 'II.3.2',
    text: 'and recommend to their Consideration such Measures as he shall judge necessary and expedient',
    type: 'CC',
    ccSubtype: 'CC-DT',
    assignedTo: ['President'],
    psv: 'A',
    article: 'Article II',
    section: '3'
  },
  {
    id: 'II.3.3',
    text: 'he may, on extraordinary Occasions, convene both Houses, or either of them',
    type: 'EAP',
    assignedTo: ['President'],
    psv: 'U',
    article: 'Article II',
    section: '3'
  },
  {
    id: 'II.3.4',
    text: 'and in Case of Disagreement between them, with Respect to the Time of Adjournment, he may adjourn them to such Time as he shall think proper',
    type: 'EAP',
    assignedTo: ['President'],
    psv: 'U',
    article: 'Article II',
    section: '3'
  },
  {
    id: 'II.3.5',
    text: 'he shall receive Ambassadors and other public Ministers',
    type: 'EAP',
    assignedTo: ['President'],
    psv: 'U/A',
    article: 'Article II',
    section: '3'
  },
  {
    id: 'II.3.6',
    text: 'he shall take Care that the Laws be faithfully executed',
    type: 'EAP',
    assignedTo: ['President'],
    psv: 'U/A',
    article: 'Article II',
    section: '3'
  },
  {
    id: 'II.3.7',
    text: 'and shall Commission all the Officers of the United States',
    type: 'EAP',
    assignedTo: ['President'],
    psv: 'U/A',
    article: 'Article II',
    section: '3'
  },

  // ARTICLE II, SECTION 4 - Impeachment
  {
    id: 'II.4.1',
    text: 'The President, Vice President and all civil Officers of the United States, shall be removed from Office on Impeachment for, and Conviction of, Treason, Bribery, or other high Crimes and Misdemeanors',
    type: 'CC',
    ccSubtype: 'CC-RM',
    assignedTo: ['President', 'Vice President', 'Principal Officers'],
    psv: null,
    article: 'Article II',
    section: '4'
  },

  // ============ ARTICLE III - JUDICIAL BRANCH ============

  // ARTICLE III, SECTION 1 - Judicial Vesting
  {
    id: 'III.1.1a',
    text: 'The judicial Power of the United States, shall be vested in one supreme Court',
    type: ['PAEP', 'EAP'],
    assignedTo: ['Supreme Court'],
    psv: 'U/A',
    article: 'Article III',
    section: '1'
  },
  {
    id: 'III.1.1b',
    text: 'and in such inferior Courts as the Congress may from time to time ordain and establish',
    type: ['PAEP', 'EAP'],
    assignedTo: ['Inferior Courts', 'Congress'],
    psv: 'U',
    article: 'Article III',
    section: '1'
  },
  {
    id: 'III.1.2a',
    text: 'The Judges, both of the supreme and inferior Courts, shall hold their Offices during good Behaviour',
    type: 'CC',
    ccSubtype: 'CC-TM',
    assignedTo: ['Judges'],
    psv: 'U',
    article: 'Article III',
    section: '1'
  },
  {
    id: 'III.1.2b',
    text: 'and shall, at stated Times, receive for their Services, a Compensation',
    type: 'CC',
    ccSubtype: 'CC-CP',
    assignedTo: ['Judges'],
    psv: null,
    article: 'Article III',
    section: '1'
  },
  {
    id: 'III.1.2c',
    text: 'which shall not be diminished during their Continuance in Office',
    type: 'PRO',
    assignedTo: ['Congress'],
    psv: 'U',
    article: 'Article III',
    section: '1'
  },

  // ARTICLE III, SECTION 2 - Jurisdiction
  {
    id: 'III.2.1a',
    text: 'The judicial Power shall extend to all Cases, in Law and Equity, arising under this Constitution, the Laws of the United States, and Treaties made',
    type: 'CC',
    ccSubtype: 'CC-JR',
    assignedTo: ['Supreme Court', 'Inferior Courts'],
    psv: null,
    article: 'Article III',
    section: '2',
    clause: '1'
  },
  {
    id: 'III.2.2a',
    text: 'In all Cases affecting Ambassadors, other public Ministers and Consuls, and those in which a State shall be Party, the supreme Court shall have original Jurisdiction',
    type: 'CC',
    ccSubtype: 'CC-JR',
    assignedTo: ['Supreme Court'],
    psv: 'U/A',
    article: 'Article III',
    section: '2',
    clause: '2'
  },
  {
    id: 'III.2.2b',
    text: 'In all the other Cases before mentioned, the supreme Court shall have appellate Jurisdiction, both as to Law and Fact',
    type: 'CC',
    ccSubtype: 'CC-JR',
    assignedTo: ['Supreme Court'],
    psv: 'U/A',
    article: 'Article III',
    section: '2',
    clause: '2'
  },
  {
    id: 'III.2.2c',
    text: 'with such Exceptions, and under such Regulations as the Congress shall make',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U/A',
    article: 'Article III',
    section: '2',
    clause: '2'
  },
  {
    id: 'III.2.3a',
    text: 'The Trial of all Crimes, except in Cases of Impeachment, shall be by Jury',
    type: ['RT', 'EAP'],
    assignedTo: ['Accused', 'Petit Jury (Criminal)'],
    psv: 'U',
    article: 'Article III',
    section: '2',
    clause: '3'
  },
  {
    id: 'III.2.3b',
    text: 'and such Trial shall be held in the State where the said Crimes shall have been committed',
    type: 'RT',
    assignedTo: ['Accused'],
    psv: 'U',
    article: 'Article III',
    section: '2',
    clause: '3'
  },

  // ARTICLE III, SECTION 3 - Treason
  {
    id: 'III.3.1a',
    text: 'Treason against the United States, shall consist only in levying War against them, or in adhering to their Enemies, giving them Aid and Comfort',
    type: 'DEF',
    assignedTo: [],
    psv: null,
    article: 'Article III',
    section: '3',
    clause: '1'
  },
  {
    id: 'III.3.1b',
    text: 'No Person shall be convicted of Treason unless on the Testimony of two Witnesses to the same overt Act, or on Confession in open Court',
    type: 'RT',
    assignedTo: ['Accused'],
    psv: 'U',
    article: 'Article III',
    section: '3',
    clause: '1'
  },
  {
    id: 'III.3.2a',
    text: 'The Congress shall have Power to declare the Punishment of Treason',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U',
    article: 'Article III',
    section: '3',
    clause: '2'
  },
  {
    id: 'III.3.2b',
    text: 'but no Attainder of Treason shall work Corruption of Blood, or Forfeiture except during the Life of the Person attainted',
    type: 'PRO',
    assignedTo: ['Congress'],
    psv: null,
    article: 'Article III',
    section: '3',
    clause: '2'
  },

  // ============ ARTICLE IV - STATES RELATIONS ============

  {
    id: 'IV.1.1a',
    text: 'Full Faith and Credit shall be given in each State to the public Acts, Records, and judicial Proceedings of every other State',
    type: 'CC',
    ccSubtype: 'CC-DT',
    assignedTo: ['States'],
    psv: 'A',
    article: 'Article IV',
    section: '1'
  },
  {
    id: 'IV.1.1b',
    text: 'And the Congress may by general Laws prescribe the Manner in which such Acts, Records and Proceedings shall be proved',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U',
    article: 'Article IV',
    section: '1'
  },
  {
    id: 'IV.2.1',
    text: 'The Citizens of each State shall be entitled to all Privileges and Immunities of Citizens in the several States',
    type: 'RT',
    assignedTo: ['Citizens'],
    psv: 'U',
    article: 'Article IV',
    section: '2',
    clause: '1'
  },
  {
    id: 'IV.2.2',
    text: 'A Person charged in any State with Treason, Felony, or other Crime, who shall flee from Justice, shall on Demand of the executive Authority of the State from which he fled, be delivered up',
    type: 'EAP',
    assignedTo: ['State Executive'],
    psv: 'U/A',
    article: 'Article IV',
    section: '2',
    clause: '2'
  },
  {
    id: 'IV.3.1a',
    text: 'New States may be admitted by the Congress into this Union',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U',
    article: 'Article IV',
    section: '3',
    clause: '1'
  },
  {
    id: 'IV.3.2a',
    text: 'The Congress shall have Power to dispose of and make all needful Rules and Regulations respecting the Territory or other Property belonging to the United States',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U',
    article: 'Article IV',
    section: '3',
    clause: '2'
  },
  {
    id: 'IV.4.1a',
    text: 'The United States shall guarantee to every State in this Union a Republican Form of Government',
    type: 'CC',
    ccSubtype: 'CC-DT',
    assignedTo: ['United States'],
    psv: 'A',
    article: 'Article IV',
    section: '4'
  },
  {
    id: 'IV.4.1b',
    text: 'and shall protect each of them against Invasion',
    type: 'CC',
    ccSubtype: 'CC-DT',
    assignedTo: ['United States'],
    psv: 'A',
    article: 'Article IV',
    section: '4'
  },
  {
    id: 'IV.4.1c',
    text: 'and on Application of the Legislature, or of the Executive (when the Legislature cannot be convened) against domestic Violence',
    type: 'CC',
    ccSubtype: 'CC-DT',
    assignedTo: ['United States', 'State Legislatures', 'State Executive'],
    psv: 'A',
    article: 'Article IV',
    section: '4'
  },

  // ============ ARTICLE V - AMENDMENT ============

  {
    id: 'V.1a',
    text: 'The Congress, whenever two thirds of both Houses shall deem it necessary, shall propose Amendments to this Constitution',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'IRR',
    article: 'Article V'
  },
  {
    id: 'V.1b',
    text: 'or, on the Application of the Legislatures of two thirds of the several States, shall call a Convention for proposing Amendments',
    type: 'EAP',
    assignedTo: ['State Legislatures', 'Congress'],
    psv: 'IRR',
    article: 'Article V'
  },
  {
    id: 'V.2a',
    text: 'when ratified by the Legislatures of three fourths of the several States',
    type: 'EAP',
    assignedTo: ['State Legislatures'],
    psv: 'IRR',
    article: 'Article V'
  },
  {
    id: 'V.2c',
    text: 'as the one or the other Mode of Ratification may be proposed by the Congress',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U',
    article: 'Article V'
  },

  // ============ ARTICLE VI - SUPREMACY ============

  {
    id: 'VI.2a',
    text: 'This Constitution, and the Laws of the United States which shall be made in Pursuance thereof; and all Treaties made shall be the supreme Law of the Land',
    type: 'DEF',
    assignedTo: [],
    psv: null,
    article: 'Article VI',
    clause: '2'
  },
  {
    id: 'VI.2b',
    text: 'and the Judges in every State shall be bound thereby, any Thing in the Constitution or Laws of any State to the Contrary notwithstanding',
    type: 'CC',
    ccSubtype: 'CC-DT',
    assignedTo: ['State Judicial Officers'],
    psv: 'A',
    article: 'Article VI',
    clause: '2'
  },
  {
    id: 'VI.3a',
    text: 'The Senators and Representatives before mentioned, and the Members of the several State Legislatures, and all executive and judicial Officers, both of the United States and of the several States, shall be bound by Oath or Affirmation, to support this Constitution',
    type: 'CC',
    ccSubtype: 'CC-OT',
    assignedTo: ['Senators', 'Representatives', 'State Legislatures', 'President', 'Judges', 'State Executive', 'State Judicial Officers'],
    psv: null,
    article: 'Article VI',
    clause: '3'
  },
  {
    id: 'VI.3b',
    text: 'but no religious Test shall ever be required as a Qualification to any Office or public Trust under the United States',
    type: 'PRO',
    assignedTo: [],
    psv: null,
    article: 'Article VI',
    clause: '3'
  },

  // ============ AMENDMENTS ============

  // FIRST AMENDMENT
  {
    id: '1.1a',
    text: 'Congress shall make no law respecting an establishment of religion',
    type: 'PRO',
    assignedTo: ['Congress'],
    psv: null,
    article: 'Amendment 1'
  },
  {
    id: '1.1b',
    text: 'or prohibiting the free exercise thereof',
    type: 'RT',
    assignedTo: ['The People'],
    psv: 'U',
    article: 'Amendment 1'
  },
  {
    id: '1.1c',
    text: 'or abridging the freedom of speech',
    type: 'RT',
    assignedTo: ['The People'],
    psv: 'U',
    article: 'Amendment 1'
  },
  {
    id: '1.1d',
    text: 'or of the press',
    type: 'RT',
    assignedTo: ['The People'],
    psv: 'U',
    article: 'Amendment 1'
  },
  {
    id: '1.1e',
    text: 'or the right of the people peaceably to assemble',
    type: 'RT',
    assignedTo: ['The People'],
    psv: 'U',
    article: 'Amendment 1'
  },
  {
    id: '1.1f',
    text: 'and to petition the Government for a redress of grievances',
    type: 'RT',
    assignedTo: ['The People'],
    psv: 'U',
    article: 'Amendment 1'
  },

  // SECOND AMENDMENT
  {
    id: '2.1b',
    text: 'the right of the people to keep and bear Arms, shall not be infringed',
    type: 'RT',
    assignedTo: ['The People'],
    psv: 'U',
    article: 'Amendment 2'
  },

  // THIRD AMENDMENT
  {
    id: '3.1a',
    text: 'No Soldier shall, in time of peace be quartered in any house, without the consent of the Owner',
    type: 'RT',
    assignedTo: ['Persons'],
    psv: 'U',
    article: 'Amendment 3'
  },

  // FOURTH AMENDMENT
  {
    id: '4.1a',
    text: 'The right of the people to be secure in their persons, houses, papers, and effects, against unreasonable searches and seizures, shall not be violated',
    type: 'RT',
    assignedTo: ['The People'],
    psv: 'U',
    article: 'Amendment 4'
  },
  {
    id: '4.1b',
    text: 'and no Warrants shall issue, but upon probable cause, supported by Oath or affirmation, and particularly describing the place to be searched, and the persons or things to be seized',
    type: 'PROC',
    assignedTo: ['Judges'],
    psv: 'U',
    article: 'Amendment 4'
  },

  // FIFTH AMENDMENT
  {
    id: '5.1a',
    text: 'No person shall be held to answer for a capital, or otherwise infamous crime, unless on a presentment or indictment of a Grand Jury',
    type: ['RT', 'EAP'],
    assignedTo: ['Accused', 'Grand Jury'],
    psv: 'U/A',
    article: 'Amendment 5'
  },
  {
    id: '5.1c',
    text: 'nor shall any person be subject for the same offence to be twice put in jeopardy of life or limb',
    type: 'RT',
    assignedTo: ['Accused'],
    psv: 'U',
    article: 'Amendment 5'
  },
  {
    id: '5.1d',
    text: 'nor shall be compelled in any criminal case to be a witness against himself',
    type: 'RT',
    assignedTo: ['Accused'],
    psv: 'U',
    article: 'Amendment 5'
  },
  {
    id: '5.1e',
    text: 'nor be deprived of life, liberty, or property, without due process of law',
    type: 'RT',
    assignedTo: ['Persons'],
    psv: 'U',
    article: 'Amendment 5'
  },
  {
    id: '5.1f',
    text: 'nor shall private property be taken for public use, without just compensation',
    type: 'RT',
    assignedTo: ['Persons'],
    psv: 'U',
    article: 'Amendment 5'
  },

  // SIXTH AMENDMENT
  {
    id: '6.1a',
    text: 'In all criminal prosecutions, the accused shall enjoy the right to a speedy and public trial',
    type: 'RT',
    assignedTo: ['Accused'],
    psv: 'U',
    article: 'Amendment 6'
  },
  {
    id: '6.1b',
    text: 'by an impartial jury of the State and district wherein the crime shall have been committed',
    type: ['RT', 'EAP'],
    assignedTo: ['Accused', 'Petit Jury (Criminal)'],
    psv: 'U',
    article: 'Amendment 6'
  },
  {
    id: '6.1d',
    text: 'and to be informed of the nature and cause of the accusation',
    type: 'RT',
    assignedTo: ['Accused'],
    psv: 'U',
    article: 'Amendment 6'
  },
  {
    id: '6.1e',
    text: 'to be confronted with the witnesses against him',
    type: 'RT',
    assignedTo: ['Accused'],
    psv: 'U',
    article: 'Amendment 6'
  },
  {
    id: '6.1f',
    text: 'to have compulsory process for obtaining witnesses in his favor',
    type: 'RT',
    assignedTo: ['Accused'],
    psv: 'U',
    article: 'Amendment 6'
  },
  {
    id: '6.1g',
    text: 'and to have the Assistance of Counsel for his defence',
    type: 'RT',
    assignedTo: ['Accused'],
    psv: 'U',
    article: 'Amendment 6'
  },

  // SEVENTH AMENDMENT
  {
    id: '7.1a',
    text: 'In Suits at common law, where the value in controversy shall exceed twenty dollars, the right of trial by jury shall be preserved',
    type: ['RT', 'EAP'],
    assignedTo: ['Persons', 'Petit Jury (Civil)'],
    psv: 'U',
    article: 'Amendment 7'
  },
  {
    id: '7.1b',
    text: 'and no fact tried by a jury, shall be otherwise re-examined in any Court of the United States, than according to the rules of the common law',
    type: 'PRO',
    assignedTo: ['Supreme Court', 'Inferior Courts'],
    psv: 'U',
    article: 'Amendment 7'
  },

  // EIGHTH AMENDMENT
  {
    id: '8.1a',
    text: 'Excessive bail shall not be required',
    type: 'RT',
    assignedTo: ['Accused'],
    psv: 'U',
    article: 'Amendment 8'
  },
  {
    id: '8.1b',
    text: 'nor excessive fines imposed',
    type: 'RT',
    assignedTo: ['Persons'],
    psv: 'U',
    article: 'Amendment 8'
  },
  {
    id: '8.1c',
    text: 'nor cruel and unusual punishments inflicted',
    type: 'RT',
    assignedTo: ['Persons'],
    psv: 'U',
    article: 'Amendment 8'
  },

  // NINTH AMENDMENT
  {
    id: '9.1',
    text: 'The enumeration in the Constitution, of certain rights, shall not be construed to deny or disparage others retained by the people',
    type: 'RT',
    assignedTo: ['The People'],
    psv: 'U',
    article: 'Amendment 9'
  },

  // TENTH AMENDMENT
  {
    id: '10.1c',
    text: 'The powers not delegated to the United States by the Constitution, nor prohibited by it to the States, are reserved to the States respectively, or to the people',
    type: ['EAP', 'RT'],
    assignedTo: ['States', 'The People'],
    psv: 'U',
    article: 'Amendment 10'
  },

  // ELEVENTH AMENDMENT
  {
    id: '11.1',
    text: 'The Judicial power of the United States shall not be construed to extend to any suit in law or equity, commenced or prosecuted against one of the United States by Citizens of another State',
    type: 'PRO',
    assignedTo: ['Supreme Court', 'Inferior Courts'],
    psv: null,
    article: 'Amendment 11'
  },

  // TWELFTH AMENDMENT
  {
    id: '12.1a',
    text: 'The Electors shall meet in their respective states and vote by ballot for President and Vice-President',
    type: 'EAP',
    assignedTo: ['Presidential Electors'],
    psv: 'U/A',
    article: 'Amendment 12'
  },
  {
    id: '12.1d',
    text: 'they shall make distinct lists and sign and certify, and transmit sealed to the seat of government, directed to the President of the Senate',
    type: 'EAP',
    assignedTo: ['Presidential Electors'],
    psv: 'U/A',
    article: 'Amendment 12'
  },
  {
    id: '12.2a',
    text: 'the President of the Senate shall, in the presence of the Senate and House of Representatives, open all the certificates and the votes shall then be counted',
    type: 'CC',
    ccSubtype: 'CC-DT',
    assignedTo: ['Vice President'],
    psv: 'A',
    article: 'Amendment 12'
  },
  {
    id: '12.3a',
    text: 'if no person have such majority, then from the persons having the highest numbers not exceeding three on the list, the House of Representatives shall choose immediately, by ballot, the President',
    type: 'EAP',
    assignedTo: ['House of Representatives'],
    psv: 'U/A',
    article: 'Amendment 12'
  },
  {
    id: '12.4b',
    text: 'if no person have a majority, then from the two highest numbers on the list, the Senate shall choose the Vice-President',
    type: 'EAP',
    assignedTo: ['Senate'],
    psv: 'U/A',
    article: 'Amendment 12'
  },
  {
    id: '12.5',
    text: 'no person constitutionally ineligible to the office of President shall be eligible to that of Vice-President',
    type: 'CC',
    ccSubtype: 'CC-QL',
    assignedTo: ['Vice President'],
    psv: null,
    article: 'Amendment 12'
  },

  // THIRTEENTH AMENDMENT
  {
    id: '13.1.1c',
    text: 'Neither slavery nor involuntary servitude shall exist within the United States',
    type: 'RT',
    assignedTo: ['Persons'],
    psv: 'U',
    article: 'Amendment 13',
    section: '1'
  },
  {
    id: '13.2.1',
    text: 'Congress shall have power to enforce this article by appropriate legislation',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U/A',
    article: 'Amendment 13',
    section: '2'
  },

  // FOURTEENTH AMENDMENT
  {
    id: '14.1.1a',
    text: 'All persons born or naturalized in the United States, and subject to the jurisdiction thereof, are citizens of the United States and of the State wherein they reside',
    type: 'DEF',
    assignedTo: ['Citizens'],
    psv: null,
    article: 'Amendment 14',
    section: '1'
  },
  {
    id: '14.1.1b',
    text: 'No State shall make or enforce any law which shall abridge the privileges or immunities of citizens of the United States',
    type: 'RT',
    assignedTo: ['Citizens'],
    psv: 'U',
    article: 'Amendment 14',
    section: '1'
  },
  {
    id: '14.1.1c',
    text: 'nor shall any State deprive any person of life, liberty, or property, without due process of law',
    type: 'RT',
    assignedTo: ['Persons'],
    psv: 'U',
    article: 'Amendment 14',
    section: '1'
  },
  {
    id: '14.1.1d',
    text: 'nor deny to any person within its jurisdiction the equal protection of the laws',
    type: 'RT',
    assignedTo: ['Persons'],
    psv: 'U',
    article: 'Amendment 14',
    section: '1'
  },
  {
    id: '14.3.2',
    text: 'But Congress may by a vote of two-thirds of each House, remove such disability',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'IRR',
    article: 'Amendment 14',
    section: '3'
  },
  {
    id: '14.5.1',
    text: 'The Congress shall have power to enforce, by appropriate legislation, the provisions of this article',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U/A',
    article: 'Amendment 14',
    section: '5'
  },

  // FIFTEENTH AMENDMENT
  {
    id: '15.1.1',
    text: 'The right of citizens of the United States to vote shall not be denied or abridged by the United States or by any State on account of race, color, or previous condition of servitude',
    type: 'RT',
    assignedTo: ['Citizens'],
    psv: 'U',
    article: 'Amendment 15',
    section: '1'
  },
  {
    id: '15.2.1',
    text: 'The Congress shall have power to enforce this article by appropriate legislation',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U/A',
    article: 'Amendment 15',
    section: '2'
  },

  // SIXTEENTH AMENDMENT
  {
    id: '16.1',
    text: 'The Congress shall have power to lay and collect taxes on incomes, from whatever source derived, without apportionment among the several States',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U/A',
    article: 'Amendment 16'
  },

  // SEVENTEENTH AMENDMENT
  {
    id: '17.1a',
    text: 'The Senate of the United States shall be composed of two Senators from each State, elected by the people thereof',
    type: 'CC',
    ccSubtype: 'CC-SL',
    assignedTo: ['Senators'],
    psv: null,
    article: 'Amendment 17'
  },
  {
    id: '17.2a',
    text: 'When vacancies happen in the representation of any State in the Senate, the executive authority of such State shall issue writs of election to fill such vacancies',
    type: 'EAP',
    assignedTo: ['State Executive'],
    psv: 'U/A',
    article: 'Amendment 17'
  },
  {
    id: '17.2b',
    text: 'the legislature of any State may empower the executive thereof to make temporary appointments',
    type: 'EAP',
    assignedTo: ['State Legislatures', 'State Executive'],
    psv: 'U',
    article: 'Amendment 17'
  },

  // NINETEENTH AMENDMENT
  {
    id: '19.1.1',
    text: 'The right of citizens of the United States to vote shall not be denied or abridged by the United States or by any State on account of sex',
    type: 'RT',
    assignedTo: ['Citizens'],
    psv: 'U',
    article: 'Amendment 19',
    section: '1'
  },
  {
    id: '19.2.1',
    text: 'Congress shall have power to enforce this article by appropriate legislation',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U/A',
    article: 'Amendment 19',
    section: '2'
  },

  // TWENTIETH AMENDMENT
  {
    id: '20.1.1a',
    text: 'The terms of the President and the Vice President shall end at noon on the 20th day of January',
    type: 'CC',
    ccSubtype: 'CC-TM',
    assignedTo: ['President', 'Vice President'],
    psv: null,
    article: 'Amendment 20',
    section: '1'
  },
  {
    id: '20.2.1',
    text: 'The Congress shall assemble at least once in every year, and such meeting shall begin at noon on the 3d day of January, unless they shall by law appoint a different day',
    type: 'CC',
    ccSubtype: 'CC-DT',
    assignedTo: ['Congress'],
    psv: 'A',
    article: 'Amendment 20',
    section: '2'
  },
  {
    id: '20.3.1',
    text: 'If, at the time fixed for the beginning of the term of the President, the President elect shall have died, the Vice President elect shall become President',
    type: 'CC',
    ccSubtype: 'CC-SC',
    assignedTo: ['Vice President'],
    psv: null,
    article: 'Amendment 20',
    section: '3'
  },

  // TWENTY-SECOND AMENDMENT
  {
    id: '22.1.1',
    text: 'No person shall be elected to the office of the President more than twice',
    type: 'CC',
    ccSubtype: 'CC-TM',
    assignedTo: ['President'],
    psv: null,
    article: 'Amendment 22',
    section: '1'
  },

  // TWENTY-THIRD AMENDMENT
  {
    id: '23.1.1a',
    text: 'The District constituting the seat of Government of the United States shall appoint in such manner as the Congress may direct',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U',
    article: 'Amendment 23',
    section: '1'
  },
  {
    id: '23.2.1',
    text: 'The Congress shall have power to enforce this article by appropriate legislation',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U/A',
    article: 'Amendment 23',
    section: '2'
  },

  // TWENTY-FOURTH AMENDMENT
  {
    id: '24.1.1',
    text: 'The right of citizens of the United States to vote in any primary or other election shall not be denied or abridged by reason of failure to pay any poll tax or other tax',
    type: 'RT',
    assignedTo: ['Citizens'],
    psv: 'U',
    article: 'Amendment 24',
    section: '1'
  },
  {
    id: '24.2.1',
    text: 'The Congress shall have power to enforce this article by appropriate legislation',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U/A',
    article: 'Amendment 24',
    section: '2'
  },

  // TWENTY-FIFTH AMENDMENT
  {
    id: '25.1.1',
    text: 'In case of the removal of the President from office or of his death or resignation, the Vice President shall become President',
    type: 'CC',
    ccSubtype: 'CC-SC',
    assignedTo: ['Vice President'],
    psv: null,
    article: 'Amendment 25',
    section: '1'
  },
  {
    id: '25.2.1',
    text: 'Whenever there is a vacancy in the office of the Vice President, the President shall nominate a Vice President who shall take office upon confirmation by a majority vote of both Houses of Congress',
    type: 'EAP',
    assignedTo: ['President', 'Congress'],
    psv: 'IRR',
    article: 'Amendment 25',
    section: '2'
  },
  {
    id: '25.3.1',
    text: 'Whenever the President transmits his written declaration that he is unable to discharge the powers and duties of his office, such powers and duties shall be discharged by the Vice President as Acting President',
    type: 'EAP',
    assignedTo: ['President', 'Vice President'],
    psv: 'U',
    article: 'Amendment 25',
    section: '3'
  },
  {
    id: '25.4.1',
    text: 'Whenever the Vice President and a majority of either the principal officers of the executive departments transmit their written declaration that the President is unable to discharge the powers and duties of his office, the Vice President shall immediately assume the powers',
    type: 'EAP',
    assignedTo: ['Vice President', 'Principal Officers'],
    psv: 'U/A',
    article: 'Amendment 25',
    section: '4'
  },
  {
    id: '25.4.3',
    text: 'If the Congress determines by two-thirds vote of both Houses that the President is unable to discharge the powers and duties of his office, the Vice President shall continue to discharge the same',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'IRR',
    article: 'Amendment 25',
    section: '4'
  },

  // TWENTY-SIXTH AMENDMENT
  {
    id: '26.1.1',
    text: 'The right of citizens of the United States, who are eighteen years of age or older, to vote shall not be denied or abridged by the United States or by any State on account of age',
    type: 'RT',
    assignedTo: ['Citizens'],
    psv: 'U',
    article: 'Amendment 26',
    section: '1'
  },
  {
    id: '26.2.1',
    text: 'The Congress shall have power to enforce this article by appropriate legislation',
    type: 'EAP',
    assignedTo: ['Congress'],
    psv: 'U/A',
    article: 'Amendment 26',
    section: '2'
  },

  // TWENTY-SEVENTH AMENDMENT
  {
    id: '27.1',
    text: 'No law, varying the compensation for the services of the Senators and Representatives, shall take effect, until an election of Representatives shall have intervened',
    type: 'PRO',
    assignedTo: ['Congress'],
    psv: null,
    article: 'Amendment 27'
  },
];

// ============ HELPER FUNCTIONS ============

// Get all provisions for a specific PAEP
export function getProvisionsByPAEP(paep: string): ConstitutionalProvision[] {
  return provisions.filter(p => p.assignedTo.includes(paep));
}

// Get all provisions of a specific type
export function getProvisionsByType(type: ElementType): ConstitutionalProvision[] {
  return provisions.filter(p =>
    Array.isArray(p.type) ? p.type.includes(type) : p.type === type
  );
}

// Get all EAPs (powers)
export function getAllEAPs(): ConstitutionalProvision[] {
  return getProvisionsByType('EAP');
}

// Get all provisions with a specific PSV status
export function getProvisionsByPSV(status: PSVStatus): ConstitutionalProvision[] {
  return provisions.filter(p => p.psv === status);
}

// Get all provisions vulnerable to usurpation
export function getUsurpationVulnerable(): ConstitutionalProvision[] {
  return provisions.filter(p => p.psv === 'U' || p.psv === 'U/A');
}

// Get all provisions vulnerable to abdication
export function getAbdicationVulnerable(): ConstitutionalProvision[] {
  return provisions.filter(p => p.psv === 'A' || p.psv === 'U/A');
}

// Get all irrefutable provisions
export function getIrrefutableProvisions(): ConstitutionalProvision[] {
  return getProvisionsByPSV('IRR');
}

// Get constitutive conditions for a PAEP
export function getConstitutiveConditions(paep: string): ConstitutionalProvision[] {
  return provisions.filter(p =>
    p.assignedTo.includes(paep) &&
    (Array.isArray(p.type) ? p.type.includes('CC') : p.type === 'CC')
  );
}

// Get rights
export function getAllRights(): ConstitutionalProvision[] {
  return getProvisionsByType('RT');
}

// Get prohibitions
export function getAllProhibitions(): ConstitutionalProvision[] {
  return getProvisionsByType('PRO');
}

// Get provision by ID
export function getProvisionById(id: string): ConstitutionalProvision | undefined {
  return provisions.find(p => p.id === id);
}

// Summary statistics
export function getStatistics() {
  const eaps = getAllEAPs();
  return {
    totalProvisions: provisions.length,
    totalEAPs: eaps.length,
    usurpationVulnerable: getUsurpationVulnerable().length,
    abdicationVulnerable: getAbdicationVulnerable().length,
    irrefutable: getIrrefutableProvisions().length,
    rights: getAllRights().length,
    prohibitions: getAllProhibitions().length,
    paepCount: PAEPS.length
  };
}
