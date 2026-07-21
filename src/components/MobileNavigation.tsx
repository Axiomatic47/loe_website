// src/components/MobileNavigation.tsx

/* eslint-disable react-refresh/only-export-components -- the drawer state
   hook is deliberately co-located with its component. */
import React from 'react';
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X } from "lucide-react";

export const useMobileNavigation = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (!isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  return {
    isSidebarOpen,
    setIsSidebarOpen,
    isMobile
  };
};

interface MobileNavigationProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  children: React.ReactNode;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  children
}) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    // For desktop: Fixed position sidebar with independent scrolling
    return (
      <aside className="fixed top-16 left-0 bottom-0 w-64 border-r border-surface-sidebar-border bg-surface-sidebar z-30">
        <div className="h-full overflow-y-auto sidebar-scroll no-scrollbar">
          {children}
        </div>
      </aside>
    );
  }

  return (
    <aside className="grid grid-cols-[1px,auto,1fr] fixed inset-0 top-16 pointer-events-none z-30">
      {/* Grid Layout:
          1. Vertical line (1px)
          2. Button + Navigation area (auto)
          3. Remaining space (1fr) */}

      {/* Column 1: Vertical Line */}
      <div className="bg-border pointer-events-none" />

      {/* Column 2: Button + Navigation */}
      <div className="relative">
        {/* Toggle Button */}
        <div className="sticky top-1/2 -translate-y-1/2 pointer-events-auto">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={cn(
              "transition-transform duration-300",
              isSidebarOpen && "translate-x-64"
            )}
          >
            <div className={cn(
              "flex items-center justify-center",
              "w-7 h-16",
              "bg-secondary text-foreground border border-border border-l-0",
              "rounded-r-md",
              "-ml-px shadow-sm",
              "transition-colors duration-200",
              "hover:bg-muted"
            )}>
              {isSidebarOpen ? <X size={16} /> : <Menu size={16} />}
            </div>
          </button>
        </div>

        {/* Navigation Panel */}
        <div
          className={cn(
            "fixed top-16 left-0 w-64 h-[calc(100vh-4rem)]",
            "bg-card",
            "border-r border-border shadow-sm",
            "transition-transform duration-300",
            "pointer-events-auto",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="h-full overflow-y-auto sidebar-scroll no-scrollbar">
            {children}
          </div>
        </div>
      </div>

      {/* Column 3: Empty space / Backdrop */}
      {isSidebarOpen && (
        <div
          className="bg-foreground/20 pointer-events-auto"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </aside>
  );
};

export default MobileNavigation;