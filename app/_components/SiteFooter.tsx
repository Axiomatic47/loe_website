// app/_components/SiteFooter.tsx — Next port of src/components/Footer.tsx
// (react-router Link → next/link). Keep visual parity with the vite footer;
// delete the src copy at cutover.
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        'w-full border-t border-surface-leather-border bg-surface-leather text-surface-leather-foreground',
        className
      )}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Left side - Brand and copyright */}
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-surface-leather-foreground font-serif text-lg">
                Laws of Existence Framework™
              </span>
            </div>
            {/* suppressHydrationWarning: prerendered year can lag the client's
                across a New Year until the next deploy — let React patch it. */}
            <div className="text-surface-leather-foreground/75 text-sm" suppressHydrationWarning>
              © 2025–{new Date().getFullYear()} Joseph Kirchner
            </div>
          </div>

          {/* Right side - Links */}
          <div className="flex items-center space-x-6 text-sm">
            <Link href="/" className="text-surface-leather-foreground/85 hover:text-surface-leather-foreground transition-colors">Home</Link>
            <Link href="/contact" className="text-surface-leather-foreground/85 hover:text-surface-leather-foreground transition-colors">Contact</Link>
            <Link href="/legal-disclaimers" className="text-surface-leather-foreground/85 hover:text-surface-leather-foreground transition-colors">Legal</Link>
            <Link href="/terms-of-service" className="text-surface-leather-foreground/85 hover:text-surface-leather-foreground transition-colors">Terms</Link>
            <Link href="/privacy-policy" className="text-surface-leather-foreground/85 hover:text-surface-leather-foreground transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
