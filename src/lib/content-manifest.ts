// src/lib/content-manifest.ts — build-time content manifest for the Next.js app.
//
// SERVER ONLY (uses node:fs): import from Server Components, generateStaticParams,
// generateMetadata, app/sitemap.ts — never from a 'use client' module.
//
// This is the SSG replacement for src/utils/compositionLoader.ts (the vite client
// loader): identical normalization and display ordering, but it reads
// content/<collection>/*.json from disk at build time and THROWS on malformed
// content instead of injecting "(Error Loading)" fallback compositions —
// scripts/validate-content.mjs runs earlier in the build and reports friendly
// errors first, so a throw here is a hard stop, never a silently renumbered site.
//
// Slugs are DATA: content JSON `slug` fields are authoritative (written by
// scripts/enrich-content-slugs.mjs using scripts/lib/content-model.mjs). The
// fallback derivations below mirror that module exactly, like the vite loader
// they replace, so an un-enriched file resolves to the same canonical URL.

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Composition, ImageData, Section, CollectionType } from '@/lib/content-types';
import type { CaseSlug } from '@/utils/urls';
import { isCaseSlug, normalizeDocId } from '@/utils/urls';

const CONTENT_ROOT = join(process.cwd(), 'content');

export const ALL_COLLECTIONS: CollectionType[] = [
  'manuscript',
  'data',
  'constitutional',
  'copyright',
  'timeline',
  'map',
];

// ---------------------------------------------------------------------------
// Slug fallbacks — mirror scripts/lib/content-model.mjs (authoritative copy).
// ---------------------------------------------------------------------------

function fileStem(filename: string): string {
  return filename.replace(/\.json$/i, '');
}

function basenameNoExt(pdf: string): string {
  const base = pdf.split('/').pop() || '';
  return base.replace(/\.[^.]*$/, '');
}

function stripLeadingZerosPerSegment(s: string): string {
  return s
    .split('-')
    .map(seg => (/^\d+$/.test(seg) ? String(parseInt(seg, 10)) : seg))
    .join('-');
}

function slugifyTitle(s: string): string {
  const base = (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base.slice(0, 60).replace(/-+$/g, '');
}

function deriveCompositionSlug(collectionType: string, filename: string, title: string): string {
  if (collectionType === 'constitutional') {
    const hay = `${filename} ${title}`.toLowerCase();
    if (hay.includes('johnson')) return 'kirchner-v-johnson';
    if (hay.includes('ellison')) return 'kirchner-v-ellison';
    if (hay.includes('acosta')) return 'kirchner-v-acosta';
    if (hay.includes('scotus') || hay.includes('amicus') || hay.includes('barbara')) return 'scotus-amicus';
  }
  return fileStem(filename);
}

function deriveConstitutionalSectionSlug(
  caseSlug: string,
  section: { pdf_file?: string; title?: string; description?: string },
  index: number,
): string {
  const base = section.pdf_file ? basenameNoExt(section.pdf_file).toLowerCase() : '';
  if (!base) {
    return slugifyTitle(section.title || '') || slugifyTitle(section.description || '') || `section-${index + 1}`;
  }
  switch (caseSlug) {
    case 'kirchner-v-acosta':
    case 'scotus-amicus': {
      const m = base.match(/^(\d+)/);
      return m ? String(parseInt(m[1], 10)) : base;
    }
    case 'kirchner-v-ellison':
      return stripLeadingZerosPerSegment(base);
    default: // kirchner-v-johnson (and any future case) — as-is
      return base;
  }
}

// ---------------------------------------------------------------------------
// Normalization — mirrors compositionLoader.ts processCompositionData/
// processTimelineData/processImageData so both renderers agree byte-for-byte.
// ---------------------------------------------------------------------------

function processImageData(img: unknown): ImageData | null {
  let imageSrc = '';

  if (typeof img === 'string') {
    imageSrc = img;
  } else if (img && typeof img === 'object') {
    const o = img as Record<string, unknown>;
    let srcCandidate: unknown = o.src || o.image || o.url || o.path || o.file || '';
    if (Array.isArray(srcCandidate)) {
      srcCandidate = srcCandidate.length > 0 ? srcCandidate[0] : '';
    }
    if (typeof srcCandidate === 'object' && srcCandidate !== null) {
      const so = srcCandidate as Record<string, unknown>;
      srcCandidate = so.path || so.src || so.url || so.file || '';
    }
    imageSrc = typeof srcCandidate === 'string' ? srcCandidate : '';
    if (!imageSrc && o.name && o.size) {
      imageSrc = String(o.name);
    }
  }

  if (!imageSrc || typeof imageSrc !== 'string') return null;
  imageSrc = imageSrc.trim();

  const o = (img && typeof img === 'object' ? img : {}) as Record<string, unknown>;
  return {
    src: imageSrc,
    alt: extractStringValue(o.alt || o.alt_text || o.title || 'Image'),
    caption: extractStringValue(o.caption || o.description || ''),
    position: validatePosition(o.position || 'middle'),
  };
}

function extractStringValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && value.toString) return value.toString();
  return String(value || '');
}

function validatePosition(position: unknown): 'top' | 'middle' | 'bottom' | 'inline' {
  const validPositions = ['top', 'middle', 'bottom', 'inline'];
  if (typeof position === 'string' && validPositions.includes(position)) {
    return position as 'top' | 'middle' | 'bottom' | 'inline';
  }
  return 'middle';
}

// Raw JSON in, typed out — `any` here matches the vite loader it mirrors
// (the repo-wide no-explicit-any rule is off during the strictness ratchet).
function processCompositionData(data: any, expectedType: string, filename: string): Composition {
  const title = data.title || data.name || 'Untitled';
  const collection_type = data.collection_type || expectedType;

  const compositionSlug =
    typeof data.slug === 'string' && data.slug
      ? data.slug
      : deriveCompositionSlug(collection_type, filename, title);

  let sections: any[] = [];

  if (Array.isArray(data.sections) && data.sections.length > 0) {
    sections = data.sections;
  } else if (data.content || data.body) {
    sections = [
      {
        title,
        featured: false,
        content_level_1: '',
        content_level_3: data.content || data.body,
        content_level_5: '',
        images: [],
      },
    ];
  } else {
    sections = [
      {
        title,
        featured: false,
        content_level_1: '',
        content_level_3: `# ${title}\n\nThis content file has no sections.`,
        content_level_5: '',
        images: [],
      },
    ];
  }

  const usedSlugs = new Set<string>();
  const processedSections: Section[] = sections.map((section, sectionIndex) => {
    let processedImages: ImageData[] = [];
    if (section.images && Array.isArray(section.images)) {
      processedImages = section.images
        .map((img: unknown) => processImageData(img))
        .filter((img: ImageData | null): img is ImageData => img !== null);
    }

    let slug: string;
    if (typeof section.slug === 'string' && section.slug) {
      slug = section.slug;
    } else if (collection_type === 'constitutional') {
      slug = deriveConstitutionalSectionSlug(compositionSlug, section, sectionIndex);
    } else {
      const baseSlug =
        slugifyTitle(section.title || '') ||
        slugifyTitle(section.description || '') ||
        `section-${sectionIndex + 1}`;
      let candidate = baseSlug;
      let n = 2;
      while (usedSlugs.has(candidate)) {
        candidate = `${baseSlug}-${n}`;
        n += 1;
      }
      slug = candidate;
    }
    usedSlugs.add(slug);

    return {
      title: section.title || `Section ${sectionIndex + 1}`,
      featured: Boolean(section.featured),
      featured_order: typeof section.featured_order === 'number' ? section.featured_order : undefined,
      content_level_1: section.content_level_1 || '',
      content_level_3: section.content_level_3 || section.content || '',
      content_level_5: section.content_level_5 || '',
      pdf_file: section.pdf_file || undefined,
      description: section.description || undefined,
      images: processedImages,
      case_group: section.case_group || undefined,
      date: section.date || undefined,
      slug,
    };
  });

  return {
    id: 0, // assigned in display order by loadManifest()
    title,
    collection_type,
    section: 1,
    section_title: processedSections[0]?.title || title,
    featured: processedSections[0]?.featured || false,
    content_level_1: processedSections[0]?.content_level_1 || '',
    content_level_3: processedSections[0]?.content_level_3 || '',
    content_level_5: processedSections[0]?.content_level_5 || '',
    sections: processedSections,
    hidden_case_groups: Array.isArray(data.hidden_case_groups) ? data.hidden_case_groups : undefined,
    slug: compositionSlug,
  };
}

export interface TimelineEvent {
  date?: string;
  title?: string;
  description?: string;
  category?: string;
  documentation?: string;
  impact_score?: number;
  verification_status?: string;
  source?: string;
  cross_references?: string[];
  images?: unknown[];
  [key: string]: unknown;
}

function processTimelineData(data: any, filename: string): Composition {
  const title = data.title || 'Timeline';
  const description = data.description || '';
  const events: any[] = Array.isArray(data.events) ? data.events : [];
  const compositionSlug =
    typeof data.slug === 'string' && data.slug ? data.slug : fileStem(filename);

  const timelineSection: Section = {
    title,
    featured: true,
    content_level_1: '',
    content_level_3: generateTimelineMarkdown(title, description, events),
    content_level_5: '',
    images: [],
    slug: slugifyTitle(title) || 'section-1',
  };

  return {
    id: 0,
    title,
    collection_type: 'timeline',
    section: 1,
    section_title: title,
    featured: true,
    content_level_1: '',
    content_level_3: timelineSection.content_level_3,
    content_level_5: '',
    sections: [timelineSection],
    slug: compositionSlug,
  };
}

function generateTimelineMarkdown(title: string, description: string, events: any[]): string {
  let markdown = `# ${title}\n\n`;
  if (description) markdown += `${description}\n\n`;
  markdown += `## Timeline Events\n\nThis timeline contains ${events.length} events.\n\n`;

  if (events.length > 0) {
    markdown += `### Recent Events\n\n`;
    const recentEvents = events.slice(0, 5);
    recentEvents.forEach(event => {
      if (event.date && event.title) {
        markdown += `- **${event.date}**: ${event.title}\n`;
        if (event.description) markdown += `  ${event.description}\n`;
        markdown += `\n`;
      }
    });
    if (events.length > 5) markdown += `*...and ${events.length - 5} more events*\n\n`;
  }

  markdown += `*Navigate to the Timeline page to view the interactive timeline.*`;
  return markdown;
}

// ---------------------------------------------------------------------------
// Loading + accessors
// ---------------------------------------------------------------------------

function readCollectionDir(collection: CollectionType): Array<{ filename: string; data: unknown }> {
  const dir = join(CONTENT_ROOT, collection);
  let files: string[];
  try {
    files = readdirSync(dir).filter(f => f.endsWith('.json'));
  } catch {
    return []; // collection dir absent — legal (mirrors content-model.mjs)
  }
  files.sort();
  return files.map(filename => {
    try {
      return { filename, data: JSON.parse(readFileSync(join(dir, filename), 'utf8')) };
    } catch (err) {
      // validate-content.mjs runs before the build and reports this readably;
      // reaching here means someone skipped the gate — stop the build hard.
      throw new Error(`content/${collection}/${filename} is not valid JSON: ${err}`);
    }
  });
}

let manifestCache: Composition[] | null = null;

function loadManifest(): Composition[] {
  if (manifestCache) return manifestCache;

  const compositions: Composition[] = [];
  for (const collection of ALL_COLLECTIONS) {
    for (const { filename, data } of readCollectionDir(collection)) {
      compositions.push(
        collection === 'timeline'
          ? processTimelineData(data, filename)
          : processCompositionData(data, collection, filename),
      );
    }
  }

  // Display ordering — identical comparator to compositionLoader.ts.
  const typeOrder: Record<string, number> = {
    manuscript: 0, data: 1, constitutional: 2, copyright: 3, timeline: 4, map: 5,
  };
  compositions.sort((a, b) => {
    const aOrder = typeOrder[a.collection_type] ?? 999;
    const bOrder = typeOrder[b.collection_type] ?? 999;
    if (aOrder !== bOrder) return aOrder - bOrder;
    if (a.featured !== b.featured) return b.featured ? 1 : -1;
    return a.title.localeCompare(b.title);
  });

  compositions.forEach((c, i) => { c.id = i + 1; });

  manifestCache = compositions;
  return compositions;
}

export function getAllCompositions(): Composition[] {
  return loadManifest();
}

export function getCollection(collection: CollectionType): Composition[] {
  return loadManifest().filter(c => c.collection_type === collection);
}

export function getComposition(collection: CollectionType, slug: string): Composition | undefined {
  return loadManifest().find(c => c.collection_type === collection && c.slug === slug);
}

/** The four constitutional compositions addressed by case slug. */
export function getCaseComposition(caseSlug: string): Composition | undefined {
  if (!isCaseSlug(caseSlug)) return undefined;
  return loadManifest().find(
    c => c.collection_type === 'constitutional' && c.slug === caseSlug,
  );
}

export function getSection(composition: Composition, sectionSlug: string): Section | undefined {
  return composition.sections.find(s => s.slug === sectionSlug);
}

/**
 * Resolve a raw :docId path segment against a case's sections using the same
 * normalization the vite router applies (doc-prefix drop, zero-stripping).
 * Unknown ids return undefined — callers 404 or land, never index-fallback.
 */
export function getSectionByDocId(caseSlug: CaseSlug, rawDocId: string): Section | undefined {
  const comp = getCaseComposition(caseSlug);
  if (!comp) return undefined;
  const wanted = normalizeDocId(caseSlug, rawDocId);
  return comp.sections.find(s => normalizeDocId(caseSlug, s.slug) === wanted);
}

/** Raw timeline events for the interactive Timeline page (reads content/timeline). */
export function getTimelineEvents(): TimelineEvent[] {
  const out: TimelineEvent[] = [];
  for (const { data } of readCollectionDir('timeline')) {
    const events = (data as { events?: unknown }).events;
    if (Array.isArray(events)) out.push(...(events as TimelineEvent[]));
  }
  return out;
}
