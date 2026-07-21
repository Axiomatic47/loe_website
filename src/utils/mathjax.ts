// src/utils/mathjax.ts — on-demand MathJax loader.
//
// MathJax (~1 MB CDN bundle + fonts) used to load globally from index.html on
// every page, including court-doc PDF pages with zero TeX. It now loads only
// when a renderer actually encounters math content (see hasMath / ensureMathJax).
//
// The config below moved VERBATIM from index.html — the custom macro set is a
// DESIGN.md §9 contract and must be preserved exactly.

const MATHJAX_SRC = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';

let mathJaxPromise: Promise<void> | null = null;

/** Cheap test: does this markdown/prose contain TeX delimiters? */
export function hasMath(content: string): boolean {
  return /\$|\\\(|\\\[/.test(content);
}

/** Idempotently configure + inject MathJax; resolves when the script loads. */
export function ensureMathJax(): Promise<void> {
  if (mathJaxPromise) return mathJaxPromise;

  mathJaxPromise = new Promise<void>((resolve, reject) => {
    if (window.MathJax?.typesetPromise) {
      resolve();
      return;
    }

    // Configuration must exist BEFORE the script loads.
    window.MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true,
        processEnvironments: true,
        tags: 'ams',
        packages: { '[+]': ['ams', 'newcommand', 'configmacros'] },
        macros: {
          // Laws of Existence specific macros - ONLY custom ones
          LoE: '\\mathfrak{L}',
          Coh: '\\text{Coh}',
          // Custom operators for the framework
          PhiP: '\\Phi_P',
          PhiT: '\\Phi_T',
          PhiU: '\\Phi_U',
          PhiF: '\\Phi_F',
          PhiN: '\\Phi_N',
          // Recursive operator
          RecOp: '\\mathcal{R}',
          // Phase space
          PS: '\\mathcal{PS}',
          // Attractor structure
          Att: '\\mathcal{A}',
          // Basin of attraction
          Basin: '\\mathcal{B}',
          // Evolution function
          Evol: '\\mathcal{F}',
          // Existence threshold
          ExistThresh: '\\tau_{\\text{exist}}',
          // Valence function
          Val: '\\text{Val}',
          // Choice mapping
          Choice: '\\text{Choice}',
          // Correspondence function
          Corresponds: '\\text{Corresponds}'
        }
      },
      options: {
        ignoreHtmlClass: 'tex2jax_ignore',
        processHtmlClass: 'tex2jax_process'
      },
      startup: {
        typeset: false // React will handle typesetting
      },
      svg: {
        fontCache: 'global'
      }
    };

    const script = document.createElement('script');
    script.id = 'MathJax-script';
    script.async = true;
    script.src = MATHJAX_SRC;
    script.onload = () => resolve();
    script.onerror = () => {
      mathJaxPromise = null; // allow a retry on the next math page
      reject(new Error('Failed to load MathJax'));
    };
    document.head.appendChild(script);
  });

  return mathJaxPromise;
}
