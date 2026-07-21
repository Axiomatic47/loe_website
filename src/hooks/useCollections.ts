// src/hooks/useCollections.ts — request only the content collections a route
// actually renders. Pass a MODULE-LEVEL constant array so the effect dep stays
// stable across renders.
import { useEffect } from 'react';
import { useCompositionStore, CollectionType } from '@/utils/compositionData';

export function useCollections(collections: CollectionType[]) {
  const loadCollections = useCompositionStore(s => s.loadCollections);
  const loadedCollections = useCompositionStore(s => s.loadedCollections);
  const loading = useCompositionStore(s => s.loading);
  const error = useCompositionStore(s => s.error);

  useEffect(() => {
    loadCollections(collections);
  }, [loadCollections, collections]);

  const ready = collections.every(c => loadedCollections[c]);
  return { ready, loading, error };
}
