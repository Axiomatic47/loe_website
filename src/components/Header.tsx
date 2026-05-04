// src/components/Header.tsx - Updated navigation with "Challenges" instead of "Constitutional Challenges"

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

interface HeaderProps {
  className?: string;
  pullDistance?: number;
  maxPullDistance?: number;
}

export const Header: React.FC<HeaderProps> = ({
  className,
  pullDistance = 0,
  maxPullDistance = 800
}) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    { path: '/', label: 'Home' },
    { path: '/composition/manuscript', label: 'Research' },
    { path: '/composition/data', label: 'Evidence' },
    { path: '/composition/constitutional', label: 'Challenges' },
    { path: '/contact', label: 'Contact' },
  ];

  // Close mobile menu on route change
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header
        className={cn(
          "w-full z-50 border-b border-surface-leather-border bg-surface-leather text-surface-leather-foreground transition-colors",
          className
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Title */}
            <Link
              to="/"
              className="text-xl font-serif tracking-tight text-surface-leather-foreground hover:text-primary transition-colors"
              style={{ letterSpacing: '-0.018em' }}
            >
              The Laws of Existence
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-7">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isActive(item.path)
                      ? "text-primary"
                      : "text-surface-leather-foreground/85 hover:text-surface-leather-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ))}

              {/* Call to Action — terracotta */}
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                asChild
              >
                <Link to="/donate">Support</Link>
              </Button>

              {/* Theme toggle */}
              <ThemeToggle />
            </nav>

            {/* Mobile actions */}
            <div className="flex items-center gap-1 md:hidden">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                className="text-surface-leather-foreground hover:bg-surface-leather-border/40"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-foreground/30 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Mobile Menu Panel */}
          <div className="fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] bg-card border-l border-border md:hidden shadow-xl">
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-serif text-foreground">Navigation</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-foreground hover:bg-secondary"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 px-4 py-6">
                <div className="space-y-2">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "block px-4 py-3 text-base font-medium rounded-lg transition-colors",
                        isActive(item.path)
                          ? "bg-secondary text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                {/* Call to Action */}
                <div className="mt-8 pt-6 border-t border-border">
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    asChild
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Link to="/donate">Support the Project</Link>
                  </Button>
                </div>
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  The Laws of Existence
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};