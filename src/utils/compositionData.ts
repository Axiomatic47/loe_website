// src/utils/compositionData.ts - Updated with Constitutional and Timeline Support

import { create } from 'zustand';

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
  images?: ImageData[]; // Add images support
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

  // Actions - these don't change reference
  setCompositions: (compositions: Composition[]) => void;
  refreshCompositions: () => Promise<void>;
  forceRefresh: () => Promise<void>;
  getComposition: (collection: string, index: number) => Composition | null;
  getSection: (collection: string, compositionIndex: number, sectionIndex: number) => Section | null;
  getCollectionCompositions: (collection: string) => Composition[];
  setDebugMode: (enabled: boolean) => void;
}

// Create store with stable actions to prevent infinite loops
export const useCompositionStore = create<CompositionStore>((set, get) => {

  // Private flag to prevent multiple simultaneous loads
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
    debugMode: import.meta.env.DEV || false,

    setDebugMode: (enabled) => {
      set({ debugMode: enabled });
      console.log('🐛 Debug mode:', enabled ? 'ENABLED' : 'DISABLED');
    },

    setCompositions: (compositions) => {
      console.log('🔄 Setting compositions in store:', compositions.length);

      const manuscript = compositions.filter(comp => comp.collection_type === 'manuscript');
      const data = compositions.filter(comp => comp.collection_type === 'data');
      const constitutional = compositions.filter(comp => comp.collection_type === 'constitutional');
      const copyright = compositions.filter(comp => comp.collection_type === 'copyright');
      const timeline = compositions.filter(comp => comp.collection_type === 'timeline');
      const map = compositions.filter(comp => comp.collection_type === 'map');

      console.log('📊 Filtered compositions:', {
        manuscript: manuscript.length,
        data: data.length,
        constitutional: constitutional.length,
        copyright: copyright.length,
        timeline: timeline.length,
        map: map.length,
        total: compositions.length
      });

      // Single state update to prevent loops
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
        lastRefresh: new Date()
      });

      console.log('✅ Store updated successfully');
    },

    refreshCompositions: async () => {
      // Prevent multiple simultaneous calls
      if (isLoading) {
        console.log('⏳ Already loading, skipping refresh');
        return;
      }

      const state = get();

      // Don't refresh too frequently (debounce)
      if (state.lastRefresh && (Date.now() - state.lastRefresh.getTime()) < 1000) {
        console.log('⏳ Recently refreshed, skipping');
        return;
      }

      isLoading = true;
      console.log('🚀 Starting composition refresh...');

      // Set loading state
      set({ loading: true, error: null });

      try {
        const { loadCompositions } = await import('./compositionLoader');
        const compositions = await loadCompositions();

        console.log('📦 Loaded compositions:', compositions.length);

        if (!compositions || compositions.length === 0) {
          console.warn('⚠️ No compositions found');
          set({
            loading: false,
            error: 'No compositions found. Create content in the admin panel.',
            initialized: true
          });
          return;
        }

        // Use the setCompositions method to update store
        get().setCompositions(compositions);

      } catch (error) {
        console.error('💥 Error loading compositions:', error);
        set({
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          initialized: true
        });
      } finally {
        isLoading = false;
      }
    },

    forceRefresh: async () => {
      console.log('🔄 Force refresh - clearing cache');

      // Reset state
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
        lastRefresh: null
      });

      // Force refresh
      await get().refreshCompositions();
    },

    getComposition: (collection: string, index: number) => {
      const state = get();
      let compositions: Composition[] = [];

      switch (collection) {
        case 'manuscript':
          compositions = state.manuscript;
          break;
        case 'data':
          compositions = state.data;
          break;
        case 'constitutional':
          compositions = state.constitutional;
          break;
        case 'copyright':
          compositions = state.copyright;
          break;
        case 'timeline':
          compositions = state.timeline;
          break;
        case 'map':
          compositions = state.map;
          break;
        default:
          console.warn('❓ Unknown collection:', collection);
          return null;
      }

      // Index is 1-based in URL, convert to 0-based
      const composition = compositions[index - 1] || null;

      if (!composition) {
        console.warn(`❌ No composition at index ${index} in ${collection}`);
      }

      return composition;
    },

    getSection: (collection: string, compositionIndex: number, sectionIndex: number) => {
      const composition = get().getComposition(collection, compositionIndex);
      if (!composition || !composition.sections) {
        return null;
      }

      // Section index is 1-based in URL, convert to 0-based
      const section = composition.sections[sectionIndex - 1] || null;

      if (!section) {
        console.warn(`❌ No section at index ${sectionIndex}`);
      }

      return section;
    },

    getCollectionCompositions: (collection: string) => {
      const state = get();

      console.log(`🔍 Getting compositions for collection: "${collection}"`);
      console.log('📊 Current store state:', {
        manuscript: state.manuscript.length,
        data: state.data.length,
        constitutional: state.constitutional.length,
        copyright: state.copyright.length,
        timeline: state.timeline.length,
        map: state.map.length,
        initialized: state.initialized
      });

      let compositions: Composition[] = [];

      switch (collection) {
        case 'manuscript':
          compositions = state.manuscript;
          console.log(`📚 Returning ${compositions.length} manuscript compositions`);
          break;
        case 'data':
          compositions = state.data;
          console.log(`📊 Returning ${compositions.length} data compositions`);
          break;
        case 'constitutional':
          compositions = state.constitutional;
          console.log(`🏛️ Returning ${compositions.length} constitutional compositions`);
          break;
        case 'copyright':
          compositions = state.copyright;
          console.log(`©️ Returning ${compositions.length} copyright compositions`);
          break;
        case 'timeline':
          compositions = state.timeline;
          console.log(`📅 Returning ${compositions.length} timeline compositions`);
          break;
        case 'map':
          compositions = state.map;
          console.log(`🗺️ Returning ${compositions.length} map compositions`);
          break;
        default:
          console.warn(`❓ Unknown collection: "${collection}"`);
          console.log('Valid collections are: manuscript, data, constitutional, copyright, timeline, map');
          return [];
      }

      console.log(`✅ Compositions for ${collection}:`, compositions.map(c => ({ id: c.id, title: c.title })));
      return compositions;
    }
  };
});