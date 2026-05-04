// src/components/Footer.tsx - Footer with TM symbol and fixed World Map link
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
  pullDistance?: number;
  maxPullDistance?: number;
}

export const Footer: React.FC<FooterProps> = ({
  className,
  pullDistance = 0,
  maxPullDistance = 800
}) => {
  return (
    <footer
      className={cn(
        "w-full border-t border-surface-leather-border bg-surface-leather text-surface-leather-foreground",
        className
      )}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Left side - Brand and Patent Notice */}
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-surface-leather-foreground font-serif text-lg">
                Laws of Existence Framework™
              </span>
              <span className="bg-card/80 text-primary border border-primary/40 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide">
                Patent Pending
              </span>
            </div>
            <div className="text-surface-leather-foreground/75 text-sm">
              © 2025 Joseph Kirchner
            </div>
          </div>

          {/* Right side - Links */}
          <div className="flex items-center space-x-6 text-sm">
            <Link to="/" className="text-surface-leather-foreground/85 hover:text-surface-leather-foreground transition-colors">Home</Link>
            <Link to="/worldmap" className="text-surface-leather-foreground/85 hover:text-surface-leather-foreground transition-colors">World Map</Link>
            <Link to="/contact" className="text-surface-leather-foreground/85 hover:text-surface-leather-foreground transition-colors">Contact</Link>
            <Link to="/legal-disclaimers" className="text-surface-leather-foreground/85 hover:text-surface-leather-foreground transition-colors">Legal</Link>
            <Link to="/terms-of-service" className="text-surface-leather-foreground/85 hover:text-surface-leather-foreground transition-colors">Terms</Link>
            <Link to="/privacy-policy" className="text-surface-leather-foreground/85 hover:text-surface-leather-foreground transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;