// src/utils/compositionData.ts - Zustand store for composition content.

import { create } from 'zustand';

const DEV = import.meta.env.DEV;

export type CollectionType =
  | 'manuscript'
  | 'data'
  | 'constitutional'
  | 'copyright'
  | 'timeline'
  | 'map';

export const ALL_COLLECTIONS: CollectionType[] = [
  'manuscript',
  'data',
  'constitutional',
  'copyright',
  'timeline',
  'map',
];

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
  collection_type: 'manuscript' | 'data' | 'constitutional' | 'copyright' | 'timeline' | 'map';
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

interface CompositionStore {
  manuscript: Composition[];
  data: Composition[];
  constitutional: Composition[];
  copyright: Composition[];
  timeline: Composition[];
  map: Composition[];
  initialized: boolean;
  loading: boolean;
  error: string | null;
  lastRefresh: Date | null;
  debugMode: boolean;
  // Per-collection load tracking: routes request only the collections they
  // render (loadCollections), so a deep-link visitor never downloads the
  // whole corpus. refreshCompositions() remains the load-everything path.
  loadedCollections: Record<CollectionType, boolean>;

  setCompositions: (compositions: Composition[]) => void;
  loadCollections: (collections: CollectionType[]) => Promise<void>;
  refreshCompositions: () => Promise<void>;
  forceRefresh: () => Promise<void>;
  getComposition: (collection: string, index: number) => Composition | null;
  getSection: (collection: string, compositionIndex: number, sectionIndex: number) => Section | null;
  getCollectionCompositions: (collection: string) => Composition[];
  // Slug-based accessors (canonical descriptive-URL resolution).
  getCompositionBySlug: (collection: string, slug: string) => Composition | null;
  getCaseComposition: (caseSlug: string) => Composition | null;
  getSectionBySlug: (
    composition: Composition | null,
    slug: string,
  ) => { section: Section; index: number } | null;
  setDebugMode: (enabled: boolean) => void;
}

const NO_COLLECTIONS_LOADED: Record<CollectionType, boolean> = {
  manuscript: false,
  data: false,
  constitutional: false,
  copyright: false,
  timeline: false,
  map: false,
};

export const useCompositionStore = create<CompositionStore>((set, get) => {
  let isLoading = false;
  // In-flight per-collection loads (deduped across concurrent callers).
  const inflight = new Map<CollectionType, Promise<void>>();

  return {
    manuscript: [],
    data: [],
    constitutional: [],
    copyright: [],
    timeline: [],
    map: [],
    initialized: false,
    loading: false,
    error: null,
    lastRefresh: null,
    debugMode: DEV || false,
    loadedCollections: { ...NO_COLLECTIONS_LOADED },

    setDebugMode: (enabled) => {
      set({ debugMode: enabled });
    },

    setCompositions: (compositions) => {
      const manuscript = compositions.filter(comp => comp.collection_type === 'manuscript');
      const data = compositions.filter(comp => comp.collection_type === 'data');
      const constitutional = compositions.filter(comp => comp.collection_type === 'constitutional');
      const copyright = compositions.filter(comp => comp.collection_type === 'copyright');
      const timeline = compositions.filter(comp => comp.collection_type === 'timeline');
      const map = compositions.filter(comp => comp.collection_type === 'map');

      set({
        manuscript,
        data,
        constitutional,
        copyright,
        timeline,
        map,
        initialized: true,
        loading: false,
        error: null,
        lastRefresh: new Date(),
        loadedCollections: {
          manuscript: true,
          data: true,
          constitutional: true,
          copyright: true,
          timeline: true,
          map: true,
        },
      });
    },

    loadCollections: async (collections) => {
      const state = get();
      const missing = collections.filter(
        c => !state.loadedCollections[c] && !inflight.has(c),
      );

      if (missing.length > 0) {
        const load = (async () => {
          set({ loading: true, error: null });
          try {
            const { loadCompositions } = await import('./compositionLoader');
            const loaded = await loadCompositions(missing);

            set(s => {
              const patch: Record<string, unknown> = {
                initialized: true,
                lastRefresh: new Date(),
                loadedCollections: {
                  ...s.loadedCollections,
                  ...Object.fromEntries(missing.map(c => [c, true])),
                },
              };
              for (const c of missing) {
                patch[c] = loaded.filter(comp => comp.collection_type === c);
              }
              return patch as Partial<CompositionStore>;
            });
          } catch (error) {
            console.error('Error loading collections:', missing, error);
            set({
              error: error instanceof Error ? error.message : 'Unknown error',
              initialized: true,
            });
          } finally {
            missing.forEach(c => inflight.delete(c));
            set({ loading: inflight.size > 0 });
          }
        })();

        missing.forEach(c => inflight.set(c, load));
      }

      // Wait for everything the caller asked for that is still in flight.
      await Promise.all(
        collections
          .map(c => inflight.get(c))
          .filter((p): p is Promise<void> => Boolean(p)),
      );
    },

    refreshCompositions: async () => {
      if (isLoading) return;

      const state = get();
      if (state.lastRefresh && Date.now() - state.lastRefresh.getTime() < 1000) return;

      isLoading = true;
      set({ loading: true, error: null });

      try {
        const { loadCompositions } = await import('./compositionLoader');
        const compositions = await loadCompositions();

        if (!compositions || compositions.length === 0) {
          set({
            loading: false,
            error: 'No compositions found. Create content in the admin panel.',
            initialized: true,
          });
          return;
        }

        get().setCompositions(compositions);
      } catch (error) {
        console.error('Error loading compositions:', error);
        set({
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          initialized: true,
        });
      } finally {
        isLoading = false;
      }
    },

    forceRefresh: async () => {
      inflight.clear();
      set({
        manuscript: [],
        data: [],
        constitutional: [],
        copyright: [],
        timeline: [],
        map: [],
        initialized: false,
        loading: false,
        error: null,
        lastRefresh: null,
        loadedCollections: { ...NO_COLLECTIONS_LOADED },
      });
      await get().refreshCompositions();
    },

    getComposition: (collection: string, index: number) => {
      const state = get();
      let compositions: Composition[] = [];

      switch (collection) {
        case 'manuscript': compositions = state.manuscript; break;
        case 'data': compositions = state.data; break;
        case 'constitutional': compositions = state.constitutional; break;
        case 'copyright': compositions = state.copyright; break;
        case 'timeline': compositions = state.timeline; break;
        case 'map': compositions = state.map; break;
        default:
          if (DEV) console.warn('Unknown collection:', collection);
          return null;
      }

      return compositions[index - 1] || null;
    },

    getSection: (collection: string, compositionIndex: number, sectionIndex: number) => {
      const composition = get().getComposition(collection, compositionIndex);
      if (!composition || !composition.sections) return null;
      return composition.sections[sectionIndex - 1] || null;
    },

    getCollectionCompositions: (collection: string) => {
      const state = get();

      switch (collection) {
        case 'manuscript': return state.manuscript;
        case 'data': return state.data;
        case 'constitutional': return state.constitutional;
        case 'copyright': return state.copyright;
        case 'timeline': return state.timeline;
        case 'map': return state.map;
        default:
          if (DEV) console.warn('Unknown collection:', collection);
          return [];
      }
    },

    getCompositionBySlug: (collection: string, slug: string) => {
      const comps = get().getCollectionCompositions(collection);
      return comps.find(c => c.slug === slug) || null;
    },

    getCaseComposition: (caseSlug: string) => {
      return get().constitutional.find(c => c.slug === caseSlug) || null;
    },

    getSectionBySlug: (composition: Composition | null, slug: string) => {
      if (!composition || !composition.sections) return null;
      const index = composition.sections.findIndex(s => s.slug === slug);
      if (index === -1) return null;
      return { section: composition.sections[index], index: index + 1 };
    },
  };
});
