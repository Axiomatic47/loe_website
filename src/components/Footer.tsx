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
  // Calculate opacity and blur based on pull distance
  const opacity = Math.max(0.02, 0.8 - (Math.abs(pullDistance) / (maxPullDistance * 0.7)));
  const blurAmount = Math.max(2, 12 - (Math.abs(pullDistance) / (maxPullDistance * 0.7)) * 10);

  return (
    <footer
      className={cn(
        "w-full border-t transition-all duration-200",
        "hover:bg-black/40 hover:backdrop-blur-md",
        className
      )}
      style={{
        backgroundColor: `rgba(0, 0, 0, ${opacity})`,
        backdropFilter: `blur(${blurAmount}px)`,
        borderColor: `rgba(255, 255, 255, ${opacity * 0.1})`,
      }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Left side - Brand and Patent Notice */}
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-white font-serif text-lg">
                Laws of Existence Framework™
              </span>
              <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                PATENT PENDING
              </span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 Joseph Kirchner
            </div>
          </div>

          {/* Right side - Links */}
          <div className="flex items-center space-x-6 text-sm">
            <Link
              to="/"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              to="/worldmap"
              className="text-gray-300 hover:text-white transition-colors"
            >
              World Map
            </Link>
            <Link
              to="/contact"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Contact
            </Link>
            <Link
              to="/legal-disclaimers"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Legal
            </Link>
            <Link
              to="/terms-of-service"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Terms
            </Link>
            <Link
              to="/privacy-policy"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Privacy
            </Link>
          </div>
        </div>


      </div>
    </footer>
  );
};

export default Footer;