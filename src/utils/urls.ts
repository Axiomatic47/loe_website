// src/utils/urls.ts — single source of truth for building in-app URLs and for
// normalizing case document ids typed into the address bar.
//
// Canonical descriptive-URL scheme (Phase 1):
//   Constitutional cases →  /<case-slug>/<section-slug>
//                           (case slugs: kirchner-v-johnson / -ellison / -acosta / scotus-amicus)
//   Other collections    →  /composition/<collection>/<composition-slug>/<section-slug>
//   Case landing pages   →  /<case-slug>   (scotus-amicus has no landing; its bare URL reads part 1)
//
// The legacy positional URLs (/composition/:type/composition/:i/section/:n) are
// still accepted by the router but only ever *redirect* to the canonical form —
// nothing in the app should emit them anymore.
import type { Composition, Section } from '@/lib/content-types';

export const SITE_ORIGIN = 'https://lawsofexistence.com';

export function absoluteUrl(path: string): string {
  return `${SITE_ORIGIN}${path}`;
}

// The four constitutional compositions addressed by descriptive slug.
export const CASE_SLUGS = [
  'kirchner-v-johnson',
  'kirchner-v-ellison',
  'kirchner-v-acosta',
  'scotus-amicus',
] as const;
export type CaseSlug = (typeof CASE_SLUGS)[number];

export function isCaseSlug(slug: string | undefined): slug is CaseSlug {
  return !!slug && (CASE_SLUGS as readonly string[]).includes(slug);
}

/** Canonical reader URL for a specific section of a composition. */
export function sectionUrl(composition: Composition, section: Section): string {
  if (composition.collection_type === 'constitutional' && isCaseSlug(composition.slug)) {
    return `/${composition.slug}/${section.slug}`;
  }
  return `/composition/${composition.collection_type}/${composition.slug}/${section.slug}`;
}

/**
 * Canonical entry URL for a composition.
 *   Constitutional cases → the bare case slug (landing page; scotus-amicus reads
 *   part 1 at that URL). Other collections → the first section's reader URL,
 *   matching the existing "deep-link to section 1" UX for Research/Evidence.
 */
export function compositionUrl(composition: Composition): string {
  if (composition.collection_type === 'constitutional' && isCaseSlug(composition.slug)) {
    return `/${composition.slug}`;
  }
  const first = composition.sections?.[0];
  return first ? sectionUrl(composition, first) : `/composition/${composition.collection_type}`;
}

/**
 * Normalize a raw document id from a case URL into a candidate section slug for
 * comparison against Section.slug. Lowercases, drops a leading "doc" prefix that
 * precedes a digit ("doc51" → "51"), and strips leading zeros within each
 * hyphen-delimited numeric segment ("01" → "1", "doc01-02" → "1-2"). Non-numeric
 * segments ("8cir-brief", "mo-stay", "2594-summons") pass through untouched.
 *
 * `caseSlug` is accepted for API stability / future case-specific rules.
 */
export function normalizeDocId(_caseSlug: string, raw: string): string {
  let s = (raw || '').toLowerCase();
  s = s.replace(/^doc(?=\d)/, '');
  s = s
    .split('-')
    .map(seg => (/^\d+$/.test(seg) ? String(parseInt(seg, 10)) : seg))
    .join('-');
  return s;
}
