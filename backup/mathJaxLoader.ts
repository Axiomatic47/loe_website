// src/utils/mathJaxLoader.ts - MathJax configuration and loader for React

declare global {
  interface Window {
    MathJax: any;
  }
}

// MathJax configuration
const mathJaxConfig = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    processEscapes: true,
    processEnvironments: true,
    tags: 'ams',
    packages: { '[+]': ['ams', 'newcommand', 'configmacros'] }
  },
  options: {
    ignoreHtmlClass: 'tex2jax_ignore',
    processHtmlClass: 'tex2jax_process'
  },
  startup: {
    typeset: false // We'll handle typesetting manually
  },
  svg: {
    fontCache: 'global'
  }
};

let mathJaxLoaded = false;
let mathJaxLoading = false;

export const loadMathJax = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // If already loaded, resolve immediately
    if (mathJaxLoaded && window.MathJax) {
      resolve();
      return;
    }

    // If currently loading, wait for it
    if (mathJaxLoading) {
      const checkLoaded = () => {
        if (mathJaxLoaded && window.MathJax) {
          resolve();
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }

    mathJaxLoading = true;

    // Set up MathJax configuration before loading the script
    window.MathJax = mathJaxConfig;

    // Create and load the MathJax script
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
    script.async = true;

    script.onload = () => {
      console.log('✅ MathJax loaded successfully');
      mathJaxLoaded = true;
      mathJaxLoading = false;
      resolve();
    };

    script.onerror = () => {
      console.error('❌ Failed to load MathJax');
      mathJaxLoading = false;
      reject(new Error('Failed to load MathJax'));
    };

    document.head.appendChild(script);
  });
};

export const typesetMath = async (element?: HTMLElement): Promise<void> => {
  if (!window.MathJax || !window.MathJax.typesetPromise) {
    console.warn('⚠️ MathJax not ready for typesetting');
    return;
  }

  try {
    if (element) {
      await window.MathJax.typesetPromise([element]);
    } else {
      await window.MathJax.typesetPromise();
    }
    console.log('✅ MathJax typesetting complete');
  } catch (error) {
    console.error('❌ MathJax typesetting error:', error);
  }
};

export const isMathJaxReady = (): boolean => {
  return mathJaxLoaded && window.MathJax && window.MathJax.typesetPromise;
};