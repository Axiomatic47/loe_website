// src/components/legal/TermsBody.tsx — Terms of Service body, shared by
// src/views/TermsOfService.tsx and app/terms-of-service/page.tsx.
//
// Rewritten 2026-09-06 (owner direction). The July 2025 text was a "Company"
// contract with a patent-pending block, a broad indemnity, California venue
// and a one-year limitation clause. These terms are scaled to what the site
// is: a personal publication read for free, with no accounts and no sales.
// Governing law and venue are set to Minnesota, the author's home forum —
// flagged to the owner as the one term that is his to confirm.
import React from 'react';
import { H2, P, UL, LegalPage, LEGAL_CONTACT_EMAIL, type RenderLink } from './prose';

export const TERMS_UPDATED = 'September 6, 2026';

export function TermsBody({ renderLink }: { renderLink: RenderLink }) {
  const L = (href: string, text: string) => renderLink(href, text);
  return (
    <LegalPage eyebrow="Terms of service" title="Terms of Service" updated={TERMS_UPDATED}>
      <P>
        These terms govern your use of lawsofexistence.com, a website published by Joseph Kirchner. By using the
        site you accept them. If you do not accept them, do not use the site. The{' '}
        {L('/legal-disclaimers', 'Legal Notices')} explain where the site's material comes from and how it may be
        reused, and the {L('/privacy-policy', 'Privacy Policy')} explains what information the site handles. Both
        are part of these terms.
      </P>

      <H2>What the site provides</H2>
      <P>
        The site publishes court documents from the public record, primary-source research material, the author's
        writings, and records of conversations with AI systems. Reading is free. There are no accounts, no
        subscriptions, and nothing is sold. The author may change, add to, or remove material at any time.
      </P>

      <H2>How you may use the material</H2>
      <UL>
        <li>Read, print, and download anything the site offers for download, for your own study or work.</li>
        <li>Link to any page. Descriptive document URLs are stable and may be cited.</li>
        <li>Quote the author's writings with attribution for scholarship, journalism, criticism, or teaching.</li>
        <li>
          Use court documents as the public records they are. The author claims no rights in them and imposes no
          conditions on them beyond those the courts themselves impose.
        </li>
        <li>
          Use the archive images and transcriptions under the credit and reuse note shown on each archive page. Those
          notes state the holding institutions' terms and take precedence over anything here.
        </li>
      </UL>

      <H2>What you may not do</H2>
      <UL>
        <li>Republish the author's writings in full, or adapt them, without permission.</li>
        <li>Remove or alter credit lines, licence notes, or the docket stamps and captions on documents.</li>
        <li>
          Republish archive images beyond what their holding institution's licence or policy allows, or present any
          material here as endorsed by the courts, the institutions, or the parties named in it.
        </li>
        <li>
          Crawl or download at a rate that burdens the site, probe or interfere with the site or its hosting, or use
          the site for anything unlawful.
        </li>
      </UL>

      <H2>Court documents and the public record</H2>
      <P>
        Court documents are reproduced as filed. The court's docket is the authoritative record; where the two differ,
        the docket controls. Pleadings state their authors' positions, and nothing on the site has been decided unless
        an order or judgment on the docket says so. The site may lag the docket.
      </P>

      <H2>The author's content</H2>
      <P>
        The articles, essays, case dossiers, transcriptions, working papers, and editorial text are © 2025–2026 Joseph
        Kirchner unless another author is credited. All rights reserved, subject to the quotation permission above and
        to fair use. “Laws of Existence” and “Laws of Existence Framework” are names the author uses for this body of
        work.
      </P>

      <H2>Third-party services</H2>
      <P>
        The site is hosted by Netlify. Page analytics are provided by Plausible. The contact form is relayed by
        FormSubmit to the author's mailbox. Contributions are processed by PayPal. Some pages embed YouTube video. Each
        of these services runs under its own terms and privacy policy when you use it, and none of them is operated by
        the author.
      </P>

      <H2>Messages you send</H2>
      <P>
        Anything you send through the contact form or by email may be read and used to reply to you and to keep a
        record of the correspondence. Do not send confidential information. Sending a message creates no
        attorney-client or other confidential relationship, and the author is not an attorney.
      </P>

      <H2>Contributions</H2>
      <P>
        Contributions made through the {L('/donate', 'Support page')} are voluntary gifts toward the author's work.
        They are not charitable donations, are not tax-deductible, and buy no goods or services. Refunds are handled
        under PayPal's own rules.
      </P>

      <H2>No advice</H2>
      <P>
        Nothing on the site is legal, financial, medical, or other professional advice. Decisions you make on the basis
        of the material are your own. If you have a legal question, consult a licensed attorney in your jurisdiction.
      </P>

      <H2>Disclaimer of warranties</H2>
      <P>
        THE SITE AND ITS MATERIAL ARE PROVIDED AS THEY ARE AND AS AVAILABLE, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        IMPLIED, INCLUDING ANY WARRANTY OF ACCURACY, COMPLETENESS, MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        OR NON-INFRINGEMENT. THE SITE MAY BE UNAVAILABLE FROM TIME TO TIME.
      </P>

      <H2>Limitation of liability</H2>
      <P>
        TO THE FULLEST EXTENT THE LAW ALLOWS, JOSEPH KIRCHNER IS NOT LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL,
        SPECIAL, OR PUNITIVE DAMAGES, OR FOR ANY LOSS OF DATA, PROFIT, OR GOODWILL, ARISING FROM YOUR USE OF THE SITE OR
        RELIANCE ON ITS MATERIAL. WHERE LIABILITY CANNOT BE EXCLUDED, IT IS LIMITED TO THE GREATEST EXTENT THE LAW
        PERMITS.
      </P>

      <H2>Your responsibility</H2>
      <P>
        You are responsible for your own use of the site and of any material you take from it, including for complying
        with the holding institutions' licence terms on archive images and with the law where you are.
      </P>

      <H2>Governing law and venue</H2>
      <P>
        These terms are governed by the laws of the State of Minnesota and the United States, without regard to
        conflict-of-law rules. Any dispute arising from these terms or from use of the site shall be brought in the
        state or federal courts located in Minnesota, and you consent to their jurisdiction.
      </P>

      <H2>General</H2>
      <P>
        If any part of these terms is found unenforceable, the rest remains in effect. A failure to enforce a term is
        not a waiver of it. These terms, with the Legal Notices and the Privacy Policy, are the whole agreement between
        you and the author about use of the site. The author may revise them; the date at the top is the date of the
        current version, and continued use after a revision is acceptance of it.
      </P>

      <H2>Contact</H2>
      <P>
        Joseph Kirchner · {L(`mailto:${LEGAL_CONTACT_EMAIL}`, LEGAL_CONTACT_EMAIL)} · {L('/contact', 'contact page')}
      </P>
    </LegalPage>
  );
}
