# URL Symlink Routes Documentation

This document describes the simplified URL routing system for the Laws of Existence website, which provides user-friendly URLs that redirect to the full composition paths.

## Overview

The site uses React Router redirects to create "symbolic links" - short, memorable URLs that redirect to the full internal routing paths. This makes it easy to share links to specific documents without exposing the complex internal URL structure.

## Active Cases

| Case | Court | Friendly URL | Composition |
|------|-------|--------------|-------------|
| Kirchner v. Ellison | U.S. District of Minnesota | `/kirchner-v-ellison` | 1 |
| Kirchner v. Johnson et al. | D.C. Circuit | `/kirchner-v-johnson` | 2 |

---

## Kirchner v. Ellison (Minnesota)

**Case:** 0:26-cv-00726-JWB-ECW
**Court:** U.S. District of Minnesota
**Filed:** January 27, 2026
**Judge:** Jerry W. Blackwell

### Base Routes

| Friendly URL | Redirects To | Description |
|--------------|--------------|-------------|
| `/kirchner-v-ellison` | `/composition/constitutional/composition/1/section/1` | Case overview (petition) |

### Section Routes

Access any section by number:

```
/kirchner-v-ellison/section/{sectionId}
```

### Document Routes

Access documents by their docket number:

```
/kirchner-v-ellison/doc01        → Main Petition (Section 1)
/kirchner-v-ellison/doc01-{N}    → Attachment #N (Section N+1)
/kirchner-v-ellison/doc02        → Memorandum: SCOTUS Ultra Vires (Section 16)
/kirchner-v-ellison/doc03        → Memorandum: Birthright Citizenship (Section 17)
...
```

**Examples:**
| URL | Document | Section |
|-----|----------|---------|
| `/kirchner-v-ellison/doc01` | Petition | 1 |
| `/kirchner-v-ellison/doc01-3` | Exhibit A | 4 |
| `/kirchner-v-ellison/doc02` | Memo: SCOTUS Ultra Vires Practice | 16 |
| `/kirchner-v-ellison/doc06` | Emergency Motion for TRO | 20 |

### Document Index (Kirchner v. Ellison)

#### Doc 1: Petition and Attachments
| Doc # | Section | Title |
|-------|---------|-------|
| 01 | 1 | Petition |
| 01-1 | 2 | Exhibit List |
| 01-2 | 3 | Exhibit Summary |
| 01-3 | 4 | Exhibit A: Minnesota Police Chiefs Press Conference Transcript |
| 01-4 | 5 | Exhibit B: Noem CBS Interview Transcript (DHS Chemical Agent Use) |
| 01-5 | 6 | Exhibit C: Vance Pre-Investigation Adjudication Transcript |
| 01-6 | 7 | Exhibit D: ICE Directive 19009.3 "Firearms and Use of Force" |
| 01-7 | 8 | Exhibit E: Letter from AG Bondi to Governor Walz |
| 01-8 | 9 | Exhibit F: Affidavit of Joseph D. Kirchner |
| 01-9 | 10 | Exhibit G: Network Forensic Evidence Package (DoH RST Injection) |
| 01-10 | 11 | Exhibit H: Criminal Referral to Minnesota Attorney General |
| 01-11 | 12 | Exhibit I: Open Letter to Metro Area Minnesota Police Departments |
| 01-12 | 13 | Exhibit N-21: SCOTUS Emergency Docket Analysis |
| 01-13 | 14 | Exhibit N-22: SCOTUS Shadow Docket Jurisdiction Fraud Schematic |
| 01-14 | 15 | Civil Cover Sheet |

#### Docs 2-8: Memoranda and Motions
| Doc # | Section | Title |
|-------|---------|-------|
| 02 | 16 | Memo I: SCOTUS Ultra Vires Practice |
| 03 | 17 | Memo L: Birthright Citizenship |
| 04 | 18 | Memo N: Constitutional Failures of Harlow v. Fitzgerald |
| 05 | 19 | Summons Issued |
| 06 | 20 | Emergency Motion for TRO and Declaratory Relief |
| 07 | 21 | Notice of Hearing |
| 08 | 22 | Declaration of Joseph D. Kirchner

---

## Kirchner v. Johnson et al. (D.C. Circuit)

**Case:** 1:25-cv-02735-ACR
**Court:** U.S. District Court for the District of Columbia
**Filed:** August 19, 2025 (Second Amended Complaint: January 19, 2026)

### Base Routes

| Friendly URL | Redirects To | Description |
|--------------|--------------|-------------|
| `/kirchner-v-johnson` | `/composition/constitutional/composition/2/section/1` | Case overview (main complaint) |
| `/kirchner-v-trump` | `/kirchner-v-johnson` | Legacy redirect (old case name) |

### Section Routes

Access any section by number:

```
/kirchner-v-johnson/section/{sectionId}
```

**Example:** `/kirchner-v-johnson/section/5` → Section 5 (Memo E)

### Document Routes

Access documents by their docket number:

```
/kirchner-v-johnson/doc13        → Main Complaint (Section 1)
/kirchner-v-johnson/doc13-{N}    → Attachment #N (Section N+1)
```

**Examples:**
| URL | Document | Section |
|-----|----------|---------|
| `/kirchner-v-johnson/doc13` | Second Amended Complaint | 1 |
| `/kirchner-v-johnson/doc13-1` | Memo A: Lujan Standing Doctrine Satisfaction | 2 |
| `/kirchner-v-johnson/doc13-5` | Memo E: Government's Superior AI Analytical Capability | 6 |
| `/kirchner-v-johnson/doc13-26` | Exhibit A-1: Government Defendants Interview Transcripts | 27 |
| `/kirchner-v-johnson/doc13-86` | Summary of Material Changes | 87 |

**Shorthand formats also work:**
- `/kirchner-v-johnson/13` → Main Complaint
- `/kirchner-v-johnson/13-5` → Attachment #5

### Document Index (Doc 13 - Second Amended Complaint)

#### Main Document
| Doc # | Section | Title |
|-------|---------|-------|
| 13 | 1 | Second Amended Complaint |

#### Memoranda in Support (Attachments 1-13)
| Doc # | Section | Title |
|-------|---------|-------|
| 13-1 | 2 | Memo A: Lujan Standing Doctrine Satisfaction |
| 13-2 | 3 | Memo B: The Surveillance of Universal Ethics |
| 13-3 | 4 | Memo C: Constitutional Violation of Article I Section 8 |
| 13-4 | 5 | Memo D: AI Platform Coordinated TOS Essential Purpose Failure |
| 13-5 | 6 | Memo E: Government's Superior AI Analytical Capability |
| 13-6 | 7 | Memo F: Genesis Mission Executive Order |
| 13-7 | 8 | Memo G: Revenue Origination Analysis |
| 13-8 | 9 | Memo H: Patent Protection Justification |
| 13-9 | 10 | Memo I: Ultra Vires SCOTUS Shadow Docket Overreach |
| 13-10 | 11 | Memo J: Kirchner Standing Framework Implementation Guide |
| 13-11 | 12 | Memo K: Plaintiff's Universal Standing |
| 13-12 | 13 | Memo L: Birthright Citizenship Cases |
| 13-13 | 14 | Memo M: Undisclosed Foreign Intelligence Data Flow |

#### Appendices (Attachments 14-25)
| Doc # | Section | Title |
|-------|---------|-------|
| 13-14 | 15 | Appendix A: Legislative and Executive Branch Ultra Vires Coordination |
| 13-15 | 16 | Appendix B: METR-TED Foundation Regulatory Capture |
| 13-16 | 17 | Appendix C: Anthropic System Prompt Auditing Analysis |
| 13-17 | 18 | Appendix D: Tag-Based Execution Infrastructure |
| 13-18 | 19 | Appendix E: Reactive AI Policy Changes |
| 13-19 | 20 | Appendix F: Anthropic's Manufactured Ignorance |
| 13-20 | 21 | Appendix G: Comcast Router Forensic Analysis |
| 13-21 | 22 | Appendix H: Application-Layer Interference Evidence |
| 13-22 | 23 | Appendix I: Network Forensics and Mathematical Proof |
| 13-23 | 24 | Appendix J: The Laws of Existence - Justice as Reality Coherence |
| 13-24 | 25 | Appendix K: Bondi and Patel's Coordinated Investigative Fraud |
| 13-25 | 26 | Appendix L: Historical Analysis of Targeted Surveillance |

#### Exhibits (Attachments 26-86)
| Doc # | Section | Title |
|-------|---------|-------|
| 13-26 | 27 | Exhibit A-1: Government Defendants Interview Transcripts |
| 13-27 | 28 | Exhibit A-2: Unsigned DOJ July 7, 2025 |
| 13-28 | 29 | Exhibit A-3: DARVO Academic Research |
| 13-29 | 30 | Exhibit A-6: Trump Tweets Proving Ultra Vires |
| 13-30 | 31 | Exhibit A-10: DOJ-Epstein Transparency Act Opposition |
| 13-31 | 32 | Exhibit B-1-A: Biden-Harris AI Safety Commitments |
| 13-32 | 33 | Exhibit B-1-B: Frontier AI Safety Commitments, AI Seoul Summit |
| 13-33 | 34 | Exhibit B-2: Responsible Scaling Policy Updates |
| 13-34 | 35 | Exhibit B-3-A: OpenAI Preparedness Framework Beta |
| 13-35 | 36 | Exhibit B-7: Ted Foundation Inc Form 990 |
| 13-36 | 37 | Exhibit B-8: METR Form 990 Tax Filings |
| 13-37 | 38 | Exhibit B-21: Dario Amodei Statement on AI Safety |
| 13-38 | 39 | Exhibit C-4: Anthropic Taylor Swift Hardcoding |
| 13-39 | 40 | Exhibit C-7: October 30 Anthropic System Prompt Update |
| 13-40 | 41 | Exhibit C-18: Lyrical Content from Claude Sonnet 4.5 |
| 13-41 | 42 | Exhibit D-1: Backbone Injection |
| 13-42 | 43 | Exhibit D-2: VPN Comparison |
| 13-43 | 44 | Exhibit D-3: VMware Attack Platform |
| 13-44 | 45 | Exhibit D-4: Targeted Surveillance |
| 13-45 | 46 | Exhibit D-5: Device Impersonation |
| 13-46 | 47 | Exhibit D-6: Spoofed MAC Addresses |
| 13-47 | 48 | Exhibit D-7: Terminal Injection |
| 13-48 | 49 | Exhibit D-8: Jan 9 Peak Attack |
| 13-49 | 50 | Exhibit D-9: Anthropic API Targeting |
| 13-50 | 51 | Exhibit D-10: Pre Attack Baseline |
| 13-51 | 52 | Exhibit D-11: VPN Anonymization |
| 13-52 | 53 | Exhibit D-12: Comcast Injection Point |
| 13-53 | 54 | Exhibit D-13: Attack Pause Xfinity Call |
| 13-54 | 55 | Exhibit D-14: Localhost NodeJS Attack |
| 13-55 | 56 | Exhibit D-15: Router RST Attack |
| 13-56 | 57 | Exhibit D-16: Jan 6 Major Attack |
| 13-57 | 58 | Exhibit D-17: Jan 10 Sustained Attack |
| 13-58 | 59 | Exhibit D-18: Jan 11 MacBook Compromise |
| 13-59 | 60 | Exhibit D-19: Comcast Xfinity Security Architecture |
| 13-60 | 61 | Exhibit D-20: Comcast Router Forensic Log Compendium |
| 13-61 | 62 | Exhibit E-0: Anthropic Evidence Executive Summary |
| 13-62 | 63 | Exhibit F-0: Apple Evidence Executive Summary |
| 13-63 | 64 | Exhibit G-0: OpenAI Evidence Executive Summary |
| 13-64 | 65 | Exhibit J-1: ChatGPT Implementation Discovery Testimonials |
| 13-65 | 66 | Exhibit J-9: Mental Health Discrimination Controlled Test |
| 13-66 | 67 | Exhibit J-10: Long Conversation Reminder Screenshots |
| 13-67 | 68 | Exhibit K-1: Fundamental Laws of Supremacism and Egalitarianism |
| 13-68 | 69 | Exhibit K-2: Fundamental Law of Supremacism Logic |
| 13-69 | 70 | Exhibit K-3: Fundamental Law of Egalitarianism Logic |
| 13-70 | 71 | Exhibit K-4: Law of Supremacism Falsification Attempt |
| 13-71 | 72 | Exhibit K-5: Transcendental Method for Consciousness Recognition |
| 13-72 | 73 | Exhibit K-6: Unified Mathematical Model of Laws of Existence |
| 13-73 | 74 | Exhibit K-7: LOE Simulations Architecture Visualizations |
| 13-74 | 75 | Exhibit N-1: Mossad Agent US Legislative Capture |
| 13-75 | 76 | Exhibit N-5: Citizens v. FEC Draft |
| 13-76 | 77 | Exhibit N-9: FBI Director Patel Epstein Testimony |
| 13-77 | 78 | Exhibit N-10: Netanyahu TikTok and X Statement |
| 13-78 | 79 | Exhibit N-13: DOJ-Bondi Leaked Targeting |
| 13-79 | 80 | Exhibit N-14: Bondi Dec. 4 Incognito Experiment |
| 13-80 | 81 | Exhibit N-18: JD Vance ICE Officer Adjudication |
| 13-81 | 82 | Exhibit N-21: SCOTUS Emergency Docket Analysis |
| 13-82 | 83 | Exhibit N-22: SCOTUS Shadow Docket Fraud Schematic |
| 13-83 | 84 | Exhibit N-23: Genesis Mission Executive Order |
| 13-84 | 85 | Exhibit N-25: Trump Grim Reaper Lyrics |
| 13-85 | 86 | Exhibit N-26: DHS-ICE Use of Force Redaction |
| 13-86 | 87 | Summary of Material Changes |

---

## Implementation Details

The symlink routes are implemented in `src/App.tsx` using React Router's `Navigate` component and custom redirect components.

### Ellison Routes (Minnesota - Composition 1)

```tsx
<Route
  path="/kirchner-v-ellison"
  element={<Navigate to="/composition/constitutional/composition/1/section/1" replace />}
/>
<Route
  path="/kirchner-v-ellison/section/:sectionId"
  element={<KirchnerEllisonSectionRedirect />}
/>
<Route
  path="/kirchner-v-ellison/:docId"
  element={<KirchnerEllisonDocRedirect />}
/>
```

### Johnson Routes (DCC - Composition 2)

```tsx
<Route
  path="/kirchner-v-johnson"
  element={<Navigate to="/composition/constitutional/composition/2/section/1" replace />}
/>
<Route
  path="/kirchner-v-johnson/section/:sectionId"
  element={<KirchnerJohnsonSectionRedirect />}
/>
<Route
  path="/kirchner-v-johnson/:docId"
  element={<KirchnerJohnsonDocRedirect />}
/>
```

### Document Redirect Logic

**Ellison (Minnesota):**
- `doc01` → Section 1 (Petition)
- `doc01-N` → Section N+1 (Attachments)
- `doc02` through `doc08` → Sections 16-22 (Separate filings)

**Johnson (DCC):**
- `doc13` → Section 1 (Main Complaint)
- `doc13-N` → Section N+1 (Attachments 1-86)

## Adding New Cases

To add a new case:

1. Create a new JSON file in `content/constitutional/`
2. Copy PDFs to `public/uploads/constitutional/pdfs/{case-folder}/`
3. Add redirect components in `src/App.tsx`
4. Add routes for the new case
5. Add a hero button in `src/components/hero/HeroButtons.tsx`
6. Update this documentation

**Note:** Compositions are sorted alphabetically by title. When adding a new case, check the sort order and update existing route composition numbers if necessary.

## Content Files

### Kirchner v. Ellison (Minnesota)
- **JSON metadata:** `content/constitutional/kirchner-v-ellison-case-documents.json`
- **PDF files:** `public/uploads/constitutional/pdfs/minnesota/01.pdf`, `01-1.pdf`, `02.pdf`, etc.

### Kirchner v. Johnson (DCC)
- **JSON metadata:** `content/constitutional/kirchner-v-johnson-case-documents.json`
- **PDF files:** `public/uploads/constitutional/pdfs/13.pdf`, `13-1.pdf`, etc.

---

## Copyright Holder Notifications

**Collection Type:** copyright
**Route:** `/composition/copyright`

### Overview

The copyright collection contains Lyrics Verification Request (LVR) notifications sent to music publishers for various songs. Each song is a separate composition with one or more sections representing notifications to different publishers.

### Structure

- **Main page:** `/composition/copyright` - Lists all songs with copyright notifications
- **Song page:** `/composition/copyright/composition/{N}/section/1` - View notifications for a specific song

### Songs Index

| Song | Artist | Publishers |
|------|--------|------------|
| Ain't No Mountain High Enough | Marvin Gaye & Tammi Terrell | 1 |
| Astronaut in the Ocean | Masked Wolf | BMG, Warner Chappell |
| Bad at Love | Halsey | Anthem Canada, Downtown, Kobalt |
| Be Careful | Cardi B | Downtown, Warner Chappell |
| Controlla | Drake | Kobalt, Sony/ATV |
| Drag Me Down | One Direction | 1 |
| Drive | Incubus | 1 |
| Eastside | Benny Blanco, Halsey & Khalid | 1 |
| Elastic Heart | Sia | Hipgnosis, Sony/ATV |
| Freaky Friday | Lil Dicky feat. Chris Brown | BMG, Kobalt, Universal |
| Heat Waves | Glass Animals | 1 |
| How Long | Charlie Puth | Kobalt, Warner Chappell |
| I Fall Apart | Post Malone | 1 |
| Jealous | Nick Jonas | Kobalt, Royalty Network, Spirit |
| Let It Go | James Bay | 1 |
| Levitating | Dua Lipa | Kobalt, Sony/ATV, Warner Chappell |
| Like I'm Gonna Lose You | Meghan Trainor feat. John Legend | Kobalt, Spirit, Warner Chappell |
| Lonely | Justin Bieber & benny blanco | Kobalt, Universal |
| New Rules | Dua Lipa | BMG, Hipgnosis, Kobalt |
| Nonstop | Drake | Payday, Sony/ATV |
| Save Your Tears | The Weeknd | Kobalt, Universal, Warner Chappell |
| Sorry Not Sorry | Demi Lovato | Downtown, Reservoir, Universal |
| Stitches | Shawn Mendes | 1 |
| Take Your Time | Sam Hunt | Concord, Sony/ATV, Universal |
| The Red | Chevelle | Concord, Warner Chappell |
| Thinking Out Loud | Ed Sheeran | 1 |
| Whatever It Takes | Imagine Dragons | Sony/ATV, Universal |

### Content Files

- **JSON metadata:** `content/copyright/*.json` (27 files, one per song)
- **PDF files:** `public/uploads/copyright/pdfs/*.pdf` (54 notification files)

---

*Last updated: 2026-02-02*
