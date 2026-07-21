'use client';

import { ThemeProvider } from 'next-themes';

// Mirrors the vite app's provider exactly (src/App.tsx): class strategy on
// <html>, light default, System option, and the same storage key so existing
// visitors keep their theme choice across the renderer migration.
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem storageKey="loe-theme">
      {children}
    </ThemeProvider>
  );
}
