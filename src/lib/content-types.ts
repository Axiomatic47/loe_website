// src/lib/content-types.ts — shared content-model types. PURE TYPES ONLY:
// this module is imported by both the vite client store (compositionData.ts)
// and the Next.js server manifest (content-manifest.ts), so it must never
// gain runtime imports or vite-/next-specific globals.

export type CollectionType =
  | 'manuscript'
  | 'data'
  | 'constitutional'
  | 'copyright'
  | 'timeline'
  | 'map';

export interface ImageData {
  src: string;
  alt: string;
  caption?: string;
  position: 'top' | 'middle' | 'bottom' | 'inline';
}

export interface Section {
  title: string;
  featured: boolean;
  featured_order?: number;
  content_level_1: string;
  content_level_3: string;
  content_level_5: string;
  pdf_file?: string;
  description?: string;
  images?: ImageData[];
  case_group?: string;
  date?: string;
  // Descriptive URL slug. Read from content JSON when present; otherwise derived
  // by the loader. Authoritative rules: scripts/lib/content-model.mjs.
  slug: string;
}

export interface Composition {
  id: number;
  title: string;
  collection_type: CollectionType;
  section: number;
  section_title: string;
  featured: boolean;
  content_level_1: string;
  content_level_3: string;
  content_level_5: string;
  sections: Section[];
  hidden_case_groups?: string[];
  // Descriptive URL slug. Read from content JSON when present; otherwise derived
  // by the loader. Authoritative rules: scripts/lib/content-model.mjs.
  slug: string;
}
