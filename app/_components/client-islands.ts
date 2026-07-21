// app/_components/client-islands.ts — 'use client' boundary for router-free
// vite-era components reused by the Next app WITHOUT copies. Server pages
// import interactive pieces from here; the directive makes the whole subtree
// a client island while the components themselves stay single-sourced in src/.
'use client';

export { PDFViewer } from '@/components/PDFViewer';
export { CollapsibleSummary } from '@/components/CollapsibleSummary';
export { default as ImageEnhancedMarkdownRenderer } from '@/components/ImageEnhancedMarkdownRenderer';
