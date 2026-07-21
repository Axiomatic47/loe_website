// app/_components/SiteHeader.tsx — Next port of src/components/Header.tsx
// (react-router Link/useLocation → next/link/usePathname; markup unchanged).
// Delete the src copy at cutover.
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronRight } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
// Dropdown menus read the tiny build-time nav manifest instead of the content
// store — the Header renders on every page and must not pull the corpus.
import navManifest from '@/data/navManifest.json';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

// The three cases are stable, load-bearing destinations — kept explicit.
const CASE_LINKS = [
  { label: 'Kirchner v. Johnson, et al.', sub: 'D.D.C. · 1:25-cv-02735-ACR', href: '/kirchner-v-johnson' },
  { label: 'Kirchner v. Ellison', sub: 'D. Minn. · 0:26-cv-00726 · on appeal', href: '/kirchner-v-ellison' },
  { label: 'Kirchner v. Acosta', sub: 'S.D. Fla. · 9:26-cv-80296-DMM', href: '/kirchner-v-acosta' },
];

const MORE_LINKS = [
  { label: 'For Journalists', sub: 'Case numbers, documents, and press contact', href: '/for-journalists' },
  { label: 'Video Evidence', sub: 'Screen recordings of AI system behavior', href: '/videos' },
  { label: 'Copyright Notifications', sub: 'Notices to copyright holders', href: '/composition/copyright' },
  { label: 'SCOTUS Shadow Docket', sub: 'Emergency-docket archive and analysis', href: '/scotus-shadow-docket' },
  { label: 'Constitutional Accountability', sub: 'Interactive authority map', href: '/constitutional-accountability' },
  { label: 'Timeline', sub: 'Documented events, 2025–present', href: '/timeline' },
];

// Trigger styling tuned for the leather surface (overrides shadcn defaults)
const triggerClass = (active: boolean) =>
  cn(
    'bg-transparent px-3 h-9 text-sm font-medium transition-colors',
    'hover:bg-surface-leather-border/30 focus:bg-surface-leather-border/30',
    'data-[state=open]:bg-surface-leather-border/40',
    active
      ? 'text-primary hover:text-primary focus:text-primary'
      : 'text-surface-leather-foreground/85 hover:text-surface-leather-foreground focus:text-surface-leather-foreground'
  );

const MenuRow = ({ href, label, sub }: { href: string; label: string; sub?: string }) => (
  <NavigationMenuLink asChild>
    <Link
      href={href}
      className="block rounded-md px-3 py-2 hover:bg-secondary focus:bg-secondary outline-none transition-colors"
    >
      <div className="text-sm text-foreground leading-snug line-clamp-1" style={{ fontWeight: 550 }}>
        {label}
      </div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{sub}</div>}
    </Link>
  </NavigationMenuLink>
);

const MenuFooterLink = ({ href, label }: { href: string; label: string }) => (
  <NavigationMenuLink asChild>
    <Link
      href={href}
      className="mt-1 flex items-center rounded-md px-3 py-2 text-sm text-primary hover:bg-secondary focus:bg-secondary outline-none transition-colors"
      style={{ fontWeight: 550 }}
    >
      {label}
      <ChevronRight className="ml-1 h-3.5 w-3.5" />
    </Link>
  </NavigationMenuLink>
);

export function SiteHeader({ className }: { className?: string }) {
  const pathname = usePathname() ?? '/';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { manuscript, data } = navManifest;

  const isActive = (path: string) => pathname === path;
  const inSection = (prefix: string) => pathname.startsWith(prefix);

  // Close mobile menu on route change
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const mobileItems = [
    { path: '/', label: 'Home' },
    { path: '/composition/manuscript', label: 'Research' },
    { path: '/composition/data', label: 'Evidence' },
    { path: '/composition/constitutional', label: 'Cases' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <header
        className={cn(
          'w-full z-50 border-b border-surface-leather-border bg-surface-leather text-surface-leather-foreground transition-colors',
          className
        )}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-md"
        >
          Skip to content
        </a>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Title */}
            <Link
              href="/"
              className="text-xl font-serif tracking-tight text-surface-leather-foreground hover:text-primary transition-colors"
              style={{ letterSpacing: '-0.018em' }}
            >
              The Laws of Existence
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <NavigationMenu>
                <NavigationMenuList className="gap-0.5">
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link href="/" className={cn(triggerClass(isActive('/')), 'inline-flex items-center rounded-md')}>
                        Home
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger className={triggerClass(inSection('/composition/manuscript'))}>
                      Research
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[340px] p-2 bg-card">
                        {manuscript.map((item, i) => (
                          <MenuRow
                            key={i}
                            href={item.url}
                            label={item.title}
                            sub={`${item.sectionCount} section${item.sectionCount === 1 ? '' : 's'}`}
                          />
                        ))}
                        <MenuFooterLink href="/composition/manuscript" label="All research" />
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger className={triggerClass(inSection('/composition/data'))}>
                      Evidence
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[340px] p-2 bg-card">
                        {data.map((item, i) => (
                          <MenuRow
                            key={i}
                            href={item.url}
                            label={item.title}
                            sub={`${item.sectionCount} section${item.sectionCount === 1 ? '' : 's'}`}
                          />
                        ))}
                        <MenuFooterLink href="/composition/data" label="All evidence" />
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger className={triggerClass(inSection('/composition/constitutional'))}>
                      Cases
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[340px] p-2 bg-card">
                        {CASE_LINKS.map((c) => (
                          <MenuRow key={c.href} href={c.href} label={c.label} sub={c.sub} />
                        ))}
                        <MenuFooterLink href="/composition/constitutional" label="All cases" />
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger className={triggerClass(false)}>More</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[360px] p-2 bg-card">
                        {MORE_LINKS.map((l) => (
                          <MenuRow key={l.href} href={l.href} label={l.label} sub={l.sub} />
                        ))}
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/contact"
                        className={cn(triggerClass(isActive('/contact')), 'inline-flex items-center rounded-md')}
                      >
                        Contact
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>

              {/* Call to Action — terracotta */}
              <Button
                size="sm"
                className="ml-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                asChild
              >
                <Link href="/donate">Support</Link>
              </Button>

              {/* Theme toggle */}
              <ThemeToggle />
            </div>

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
          <div className="fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] bg-card border-l border-border md:hidden shadow-md">
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
              <nav className="flex-1 px-4 py-6 overflow-y-auto">
                <div className="space-y-2">
                  {mobileItems.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'block px-4 py-3 text-base font-medium rounded-lg transition-colors',
                        isActive(item.path)
                          ? 'bg-secondary text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                {/* Cases */}
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="px-4 text-[11px] uppercase tracking-wider text-muted-foreground mb-2" style={{ fontWeight: 600 }}>
                    The Cases
                  </div>
                  {CASE_LINKS.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      <span className="block text-sm" style={{ fontWeight: 550 }}>{c.label}</span>
                      <span className="block text-xs text-muted-foreground/80">{c.sub}</span>
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
                    <Link href="/donate">Support the Project</Link>
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
}
