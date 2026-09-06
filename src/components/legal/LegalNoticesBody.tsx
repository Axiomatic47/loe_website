// src/components/legal/LegalNoticesBody.tsx — the Legal Notices page body,
// shared by both renderers (vite src/views/LegalDisclaimers.tsx and Next
// app/legal-disclaimers/page.tsx). Pure prose in the site's reading
// typography (DESIGN.md: Source Serif 4 body at 430, Inter eyebrows).
//
// Rewritten 2026-09-06 (owner: the old page was a July 2025 patent-threat
// notice that no longer described the site). It now states what the site is
// and how its four kinds of material may be read and reused: the docket
// mirror, the licensed archive reproductions, the author's writings, and
// the testimony records. Patent language was removed with the footer badge;
// governing-law and contract terms live in the Terms of Service.
import React from 'react';
import { H2, P, LegalPage, LEGAL_CONTACT_EMAIL, LEGAL_LINK_CLASS, type RenderLink } from './prose';

export const LEGAL_NOTICES_UPDATED = 'September 6, 2026';
export { LEGAL_CONTACT_EMAIL, LEGAL_LINK_CLASS };

export function LegalNoticesBody({ renderLink }: { renderLink: RenderLink }) {
  const L = (href: string, text: string) => renderLink(href, text);
  return (
    <LegalPage eyebrow="Legal notices" title="Legal Notices" updated={LEGAL_NOTICES_UPDATED}>

      <P>
        These notices explain what this website is, where its material comes from, and how that material may be
        read and reused. They are written to be read, not skimmed. The{' '}
        {L('/terms-of-service', 'Terms of Service')} and the {L('/privacy-policy', 'Privacy Policy')} are separate
        documents.
      </P>

      <H2>What this site is</H2>
      <P>
        lawsofexistence.com is the personal publication of Joseph Kirchner. It publishes three kinds of material: the
        public record of federal litigation in which he is a party, primary-source research on the early history of
        judicial immunity, and his own academic writing. It is not a law firm, a news organisation, an archive, or a
        court. Nothing here is offered for sale.
      </P>
      <P>
        The author represents himself in the cases published here. He is not an attorney, and the site is not a
        solicitation for legal work of any kind.
      </P>

      <H2>No legal advice</H2>
      <P>
        Nothing on this site is legal advice, and reading it creates no attorney-client relationship with anyone. The
        filings, articles, and research notes state the author's positions and findings as of their dates. Anyone
        with a legal question should consult a licensed attorney in their own jurisdiction.
      </P>

      <H2>Court documents</H2>
      <P>
        Court documents are reproduced from the public docket of each case as filed with the court through its
        electronic filing system. Each document is presented under its docket coordinate, and the document pages
        carry the filing date shown on the court's stamp. The court's own record is the authoritative copy. Where this
        site and the docket differ, the docket controls.
      </P>
      <P>
        A pleading is a party's statement of its claims or defences. Allegations in a complaint are allegations, not
        findings, and the other parties' filings state their own positions. Nothing published here has been decided
        unless a court order or judgment on the docket says so. Earlier pleadings may have been superseded by later
        ones; the case pages identify the operative pleading.
      </P>
      <P>
        The site is updated after filings and may lag the docket. Anyone relying on the current state of a case should
        check the docket directly.
      </P>

      <H2>Persons and organisations named</H2>
      <P>
        Officials, companies, courts, libraries, and individuals are named on this site because they are parties to
        the cases, appear in the public record, or hold the source material reproduced here. Their appearance is not an
        endorsement of this site and implies no affiliation. Names and marks of third parties belong to their owners.
      </P>

      <H2>Research archives</H2>
      <P>
        The research pages reproduce two manuscript sources with the permission or under the policies of the
        institutions that hold them. Each archive page and each leaf carries its own credit line and reuse note, and
        that note governs.
      </P>
      <P>
        STAC 8/203/38, the Star Chamber proceedings of 1607, is reproduced by permission of The National Archives (UK)
        Image Library under a web-publication licence; the underlying record copies were supplied under order
        RC8368179. Full-resolution downloads are provided for private study and non-commercial research. Republishing
        the images requires a licence from The National Archives Image Library. The transcription text of that piece
        contains public sector information licensed under the Open Government Licence v3.0, and the piece should be
        cited as “The National Archives, ref. STAC 8/203/38.”
      </P>
      <P>
        HLS MS 149, folios 81r to 83v, is reproduced from Harvard Law School Library's open digital reproductions of
        public-domain material under Harvard Library's policy on access to digital reproductions of works in the
        public domain. No permission or fee is required; credit as shown on each folio.
      </P>
      <P>
        Transcriptions, line indexes, and working papers on the research pages are the work of the author and the
        named contributors. They are offered for study and citation with attribution. Verification transcriptions
        commissioned from professional archivists are credited by name where they appear.
      </P>

      <H2>The author's writings</H2>
      <P>
        The academic articles, essays, case dossiers, and editorial text on this site are © 2025–2026 Joseph Kirchner.
        All rights reserved. Quotation with attribution for scholarship, journalism, criticism, and teaching is
        welcome. Republishing an article in full, or adapting it, requires the author's permission. “Laws of
        Existence” and “Laws of Existence Framework” are names the author uses for this body of work.
      </P>

      <H2>Testimony collections</H2>
      <P>
        The testimony collections publish records of conversations with commercial AI systems as they were recorded.
        Where a collection carries an integrity manifest, the manifest lists each file with its size and checksum so a
        reader can confirm that what is published is what was recorded. These records are presented as records. They
        are not statements by the companies that operate those systems, and any interpretation placed on them is the
        author's own.
      </P>

      <H2>Accuracy, corrections, and removal requests</H2>
      <P>
        The author takes care that documents, dates, and captions match their sources, and corrects errors promptly
        when they are reported. To report an error, write to {L(`mailto:${LEGAL_CONTACT_EMAIL}`, LEGAL_CONTACT_EMAIL)}{' '}
        or use the {L('/contact', 'contact page')}, identifying the page and the correction.
      </P>
      <P>
        Requests concerning a court document should be directed to the court, whose docket is the public record this
        site mirrors. Requests concerning archive images are governed by the holding institution's licence or policy
        stated above. Other requests will be answered in good faith.
      </P>

      <H2>Contributions</H2>
      <P>
        The {L('/donate', 'Support page')} accepts voluntary contributions toward this work through PayPal. Contributions
        are gifts to an individual's research and publishing, not charitable donations, and are not tax-deductible. No
        goods or services are provided in return.
      </P>

      <H2>Privacy and analytics</H2>
      <P>
        Site analytics are cookieless and aggregate only. The site stores a few display preferences, such as your theme,
        in your own browser. Embedded third-party services on specific pages, video playback and payment processing,
        operate under their own policies when you use them. The {L('/privacy-policy', 'Privacy Policy')} has the
        details.
      </P>

      <H2>Warranties and liability</H2>
      <P>
        The site and its material are provided as they are and as available, without warranty of any kind, express or
        implied, including any warranty of accuracy, completeness, or fitness for a particular purpose. To the fullest
        extent the law allows, Joseph Kirchner is not liable for any loss or damage arising from use of the site or
        reliance on its contents.
      </P>

      <H2>Changes to these notices</H2>
      <P>
        These notices are revised when the site's material or its sources change. The date at the top is the date of
        the last revision. Contract terms, including governing law, are in the{' '}
        {L('/terms-of-service', 'Terms of Service')}.
      </P>

      <H2>Contact</H2>
      <P>
        Joseph Kirchner · {L(`mailto:${LEGAL_CONTACT_EMAIL}`, LEGAL_CONTACT_EMAIL)} · {L('/contact', 'contact page')}
      </P>
    </LegalPage>
  );
}
