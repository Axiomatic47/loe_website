// src/components/Header.tsx - Updated navigation with "Challenges" instead of "Constitutional Challenges"

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

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

  // Calculate opacity and blur based on pull distance
  const opacity = Math.max(0.02, 0.8 - (Math.abs(pullDistance) / (maxPullDistance * 0.7)));
  const blurAmount = Math.max(2, 12 - (Math.abs(pullDistance) / (maxPullDistance * 0.7)) * 10);

  return (
    <>
      <header
        className={cn(
          "w-full z-50 border-b transition-all duration-200",
          "hover:bg-black/40 hover:backdrop-blur-md",
          className
        )}
        style={{
          backgroundColor: `rgba(0, 0, 0, ${opacity})`,
          backdropFilter: `blur(${blurAmount}px)`,
          borderColor: `rgba(255, 255, 255, ${opacity * 0.1})`,
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Title */}
            <Link
              to="/"
              className="text-xl font-serif text-white hover:text-gray-300 transition-colors"
            >
              The Laws of Existence
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-white",
                    isActive(item.path)
                      ? "text-white border-b-2 border-white pb-1"
                      : "text-gray-300"
                  )}
                >
                  {item.label}
                </Link>
              ))}

              {/* Call to Action */}
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                asChild
              >
                <Link to="/donate">Support</Link>
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-white hover:bg-white/10"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Mobile Menu Panel */}
          <div className="fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] bg-black/90 backdrop-blur-md border-l border-white/10 md:hidden">
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-lg font-serif text-white">Navigation</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 px-4 py-6">
                <div className="space-y-3">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "block px-4 py-3 text-base font-medium rounded-lg transition-colors",
                        "text-gray-300 hover:text-white hover:bg-white/10",
                        "border border-transparent hover:border-white/20",
                        isActive(item.path) && "text-white bg-white/10 border-white/20"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                {/* Call to Action */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <Button
                    variant="outline"
                    className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20"
                    asChild
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Link to="/donate">Support the Project</Link>
                  </Button>
                </div>
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-white/10">
                <p className="text-xs text-gray-400 text-center">
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