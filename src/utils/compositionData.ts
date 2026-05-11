// src/utils/compositionData.ts - Zustand store for composition content.

import { create } from 'zustand';

const DEV = import.meta.env.DEV;

export interface ImageData {
  src: string;
  alt: string;
  caption?: string;
  position: 'top' | 'middle' | 'bottom' | 'inline';
}

export interface Section {
  title: string;
  featured: boolean;
  content_level_1: string;
  content_level_3: string;
  content_level_5: string;
  pdf_file?: string;
  description?: string;
  images?: ImageData[];
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

  setCompositions: (compositions: Composition[]) => void;
  refreshCompositions: () => Promise<void>;
  forceRefresh: () => Promise<void>;
  getComposition: (collection: string, index: number) => Composition | null;
  getSection: (collection: string, compositionIndex: number, sectionIndex: number) => Section | null;
  getCollectionCompositions: (collection: string) => Composition[];
  setDebugMode: (enabled: boolean) => void;
}

export const useCompositionStore = create<CompositionStore>((set, get) => {
  let isLoading = false;

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
      });
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
  };
});
