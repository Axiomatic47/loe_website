// src/hooks/useMathJax.ts - React hook for MathJax integration

import { useEffect, useRef, useState } from 'react';
import { loadMathJax, typesetMath, isMathJaxReady } from '@/utils/mathJaxLoader';

interface UseMathJaxOptions {
  autoTypeset?: boolean;
  dependencies?: any[];
}

export const useMathJax = (options: UseMathJaxOptions = {}) => {
  const { autoTypeset = true, dependencies = [] } = options;
  const containerRef = useRef<HTMLElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load MathJax on mount
  useEffect(() => {
    if (isMathJaxReady()) {
      setIsReady(true);
      return;
    }

    setIsLoading(true);
    loadMathJax()
      .then(() => {
        setIsReady(true);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load MathJax:', error);
        setIsLoading(false);
      });
  }, []);

  // Typeset math when content changes
  useEffect(() => {
    if (!isReady || !autoTypeset) return;

    const typesetWithDelay = async () => {
      // Small delay to ensure DOM is updated
      await new Promise(resolve => setTimeout(resolve, 50));

      if (containerRef.current) {
        await typesetMath(containerRef.current);
      }
    };

    typesetWithDelay();
  }, [isReady, autoTypeset, ...dependencies]);

  const manualTypeset = async (element?: HTMLElement) => {
    if (!isReady) {
      console.warn('MathJax not ready for manual typesetting');
      return;
    }

    const target = element || containerRef.current;
    if (target) {
      await typesetMath(target);
    }
  };

  return {
    containerRef,
    isReady,
    isLoading,
    manualTypeset
  };
};