'use client';

import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';

// Mirrors the vite app shell exactly (src/App.tsx): same theme strategy and
// storage key so existing visitors keep their choice across the renderer
// migration, plus the tooltip context and both toast outlets.
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem storageKey="loe-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {children}
      </TooltipProvider>
    </ThemeProvider>
  );
}
