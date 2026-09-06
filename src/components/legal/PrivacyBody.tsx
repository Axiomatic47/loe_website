// src/components/legal/PrivacyBody.tsx — Privacy Policy body, shared by
// src/views/PrivacyPolicy.tsx and app/privacy-policy/page.tsx.
//
// Rewritten 2026-09-06 (owner direction). The prior text described staff,
// contractors, multi-factor administrative access, network segmentation,
// seven-year security logs and business transfers — none of which exist for
// a personal static site. This version states the site's ACTUAL data flows:
// Netlify hosting logs, cookieless Plausible analytics, the FormSubmit
// contact relay to the author's mailbox, PayPal for contributions, YouTube
// embeds, and browser storage for display preferences. Keep it true: if a
// service is added or removed, change this page in the same commit.
import React from 'react';
import { H2, P, UL, LegalPage, LEGAL_CONTACT_EMAIL, type RenderLink } from './prose';

export const PRIVACY_UPDATED = 'September 6, 2026';

export function PrivacyBody({ renderLink }: { renderLink: RenderLink }) {
  const L = (href: string, text: string) => renderLink(href, text);
  return (
    <LegalPage eyebrow="Privacy policy" title="Privacy Policy" updated={PRIVACY_UPDATED}>
      <P>
        This policy describes what information lawsofexistence.com handles when you visit, and what happens to it. The
        site is published by Joseph Kirchner as an individual. It has no user accounts, sells nothing, runs no
        advertising, and does not sell, rent, or trade personal information.
      </P>

      <H2>Information the site handles</H2>
      <P>
        <strong>Reading the site.</strong> You can read everything without giving any information. The site's host,
        Netlify, keeps ordinary server logs of requests, which include the requesting IP address, browser type, and
        the pages requested, under Netlify's own privacy policy and retention practice. The author does not build
        profiles from them.
      </P>
      <P>
        <strong>Analytics.</strong> The site uses Plausible Analytics, which is cookieless and reports only aggregate
        figures such as page views, referring sites, countries, and file downloads. It stores no personal identifier
        and does not track you across sites. Plausible's servers are in the European Union.
      </P>
      <P>
        <strong>Your browser's storage.</strong> The site keeps a few display preferences in your own browser, such as
        your theme choice and the layout of the archive reading view. They stay on your device and are not sent to
        the author.
      </P>
      <P>
        <strong>Writing to the author.</strong> If you use the {L('/contact', 'contact form')}, the name, email
        address, and message you enter are relayed by FormSubmit to the author's mailbox at{' '}
        {L(`mailto:${LEGAL_CONTACT_EMAIL}`, LEGAL_CONTACT_EMAIL)}. Email you send directly arrives the same way.
        Correspondence is kept as ordinary email for as long as it is needed to reply and to keep a record of the
        exchange.
      </P>
      <P>
        <strong>Contributions.</strong> Contributions on the {L('/donate', 'Support page')} are processed by PayPal.
        PayPal handles your payment details under its own policy; the author receives what PayPal reports about a
        completed contribution, typically a name, an email address, and the amount, and keeps that record as required
        for accounting.
      </P>
      <P>
        <strong>Embedded video.</strong> Some pages embed YouTube video. The player first shows a preview image fetched
        from YouTube's image server; the video itself, served through YouTube's privacy-enhanced embed, loads when you
        press play. When you play a video, YouTube may set its own cookies and collect information under Google's
        privacy policy.
      </P>

      <H2>How the information is used</H2>
      <UL>
        <li>To serve the pages you request and keep the site working.</li>
        <li>To understand, in aggregate, which material is read and how the site is found.</li>
        <li>To reply to messages and keep a record of correspondence.</li>
        <li>To record contributions for accounting.</li>
        <li>To comply with the law, or to respond to a court order or lawful request.</li>
      </UL>

      <H2>Sharing</H2>
      <P>
        Information is shared only with the service providers named above, each for its own function, and with
        authorities when the law requires it. There is no sale of personal information, no advertising network, and no
        sharing with data brokers.
      </P>

      <H2>Retention</H2>
      <P>
        Hosting logs are kept by Netlify under its own schedule. Plausible holds only aggregate statistics with no
        personal data to retain. Correspondence is kept as long as needed for the purposes above, and is deleted on
        request unless the law requires otherwise. Contribution records are kept as long as accounting rules require.
      </P>

      <H2>Your rights</H2>
      <P>
        You may ask what correspondence or contribution records the author holds about you, ask for corrections, or
        ask for deletion, by writing to {L(`mailto:${LEGAL_CONTACT_EMAIL}`, LEGAL_CONTACT_EMAIL)}. Identity may need to
        be confirmed before a request is acted on. If you are in the European Union or the United Kingdom, the legal
        basis for handling your correspondence is the author's legitimate interest in replying to you and keeping a
        record, and you have the rights those laws provide. California residents: the site does not sell or share
        personal information for cross-context advertising.
      </P>

      <H2>Security</H2>
      <P>
        The site is served over HTTPS. Correspondence travels and is stored as ordinary email, with the protections
        email provides and no more. No method of transmission or storage is completely secure, and the author cannot
        guarantee absolute security.
      </P>

      <H2>Where the information is processed</H2>
      <P>
        The site is hosted in the United States. Plausible processes analytics in the European Union. FormSubmit and
        PayPal process their parts under their own policies. If you visit from outside the United States, your
        requests are handled where these services operate.
      </P>

      <H2>Children</H2>
      <P>
        The site is not directed at children under 13, and the author does not knowingly collect information from
        them. A parent or guardian who believes a child has written in may ask for the message to be deleted.
      </P>

      <H2>Changes</H2>
      <P>
        This policy is revised when the site's services change. The date at the top is the date of the current
        version.
      </P>

      <H2>Contact</H2>
      <P>
        Joseph Kirchner · {L(`mailto:${LEGAL_CONTACT_EMAIL}`, LEGAL_CONTACT_EMAIL)} · {L('/contact', 'contact page')}
      </P>
    </LegalPage>
  );
}
