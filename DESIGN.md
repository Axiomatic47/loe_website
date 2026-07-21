# The Laws of Existence — Design System

This document is the persistent brand context for **The Laws of Existence**, a public legal-advocacy website at `lawsofexistence.com`. Drop this file into `claude.ai/design` so every prompt applies these guidelines automatically.

---

## 1. Brand identity

### What this site is
A first-person legal-advocacy publication. The plaintiff Joseph Kirchner self-publishes three active federal constitutional cases (Kirchner v. Johnson, v. Ellison, v. Acosta), the underlying research framework ("Laws of Existence"), evidentiary exhibits, and supporting analyses. The audience is journalists, attorneys, judges, researchers, and concerned citizens — not casual readers. Many visitors arrive via direct URL to a specific filed document.

### Voice
- **Serious without being academic.** Legal precision when the topic demands it; plain English everywhere else.
- **First-person plaintiff voice in legal pages**, third-person editorial voice in analysis and research.
- **Restraint.** No marketing copywriting tricks ("Discover…", "Unlock…", "Game-changing…"). No exclamation marks except in original document quotes.
- **Confident, not defensive.** This site exists because the cases are filed and pending; the visual language should match that gravity.

### Tone words
*Considered. Documentary. Resolute. Warm. Old-paper. Civic.*

### Tone words to avoid
*Edgy. Playful. Corporate. Salesy. Cold. Cyberpunk. Maximalist.*

---

## 2. Color palette

The palette is a **warm tonal staircase** — cream paper at the page level, soft white documents on top, beige sidebars between, leather brown chrome at top and bottom. Both light and dark modes are user-selectable via a header toggle (defaults to light, persisted in `localStorage`, applied pre-paint to prevent FOUC). The dark mode mirrors the same staircase in walnut tones.

### Light mode tokens

| Token | HSL | Hex | Role |
|---|---|---|---|
| `--background` | `38 30% 84%` | `#DDD0B0` | Page surface (warm aged paper) |
| `--foreground` | `30 16% 9%` | `#1C1812` | Body text (warm near-black) |
| `--card` | `40 36% 91%` | `#ECE3CA` | Document card (soft warm white) |
| `--card-foreground` | `30 16% 9%` | `#1C1812` | Text on cards |
| `--secondary` | `38 28% 76%` | `#CDBE9C` | Secondary surfaces (callout panels, badges) |
| `--muted` | `38 28% 80%` | `#D6C7A6` | Muted surfaces (code blocks, search bars) |
| `--muted-foreground` | `30 14% 24%` | `#463E32` | Secondary text (warm gray) |
| `--primary` | `14 58% 46%` | `#B85436` | Terracotta — CTAs, active state, accents |
| `--primary-foreground` | `40 36% 91%` | `#ECE3CA` | Text on terracotta |
| `--border` | `38 26% 60%` | `#A09173` | Standard border (warm tan) |
| `--destructive` | `0 65% 42%` | — | Errors |
| `--surface-sidebar` | `38 30% 72%` | `#C3B388` | Sidebar — darker beige between bg and leather |
| `--surface-sidebar-border` | `36 28% 52%` | `#957F5A` | Sidebar separators |
| `--surface-leather` | `28 30% 54%` | `#A28664` | Header / Footer — light leather brown |
| `--surface-leather-border` | `26 30% 38%` | `#7A5A3E` | Leather separators |
| `--surface-leather-foreground` | `30 30% 8%` | `#1C1610` | Strong dark text on leather |

### Dark mode tokens

Dark mode is **warm ink**, not walnut: near-black surfaces with a whisper of warmth
(hue 24–26, saturation ≤10%). The earlier brown/walnut tiers read muddy and were
retired 2026-07.

| Token | HSL | Hex | Role |
|---|---|---|---|
| `--background` | `24 10% 8%` | `#171310` | Page surface (warm ink) |
| `--foreground` | `40 30% 92%` | `#F0EADC` | Body text (soft cream) |
| `--card` | `24 10% 12%` | `#231E1A` | Document card (ink) |
| `--secondary` | `24 9% 17%` | `#2F2A26` | Secondary surfaces |
| `--muted` | `24 9% 21%` | `#3A342F` | Muted surfaces |
| `--muted-foreground` | `36 14% 74%` | `#C6BDAF` | Secondary text |
| `--primary` | `16 66% 62%` | `#DE7E5B` | Terracotta — lifted for dark bg legibility |
| `--border` | `26 10% 26%` | `#49423B` | Visible neutral-warm border |
| `--surface-sidebar` | `24 9% 14%` | `#282320` | Raised ink sidebar |
| `--surface-leather` | `24 10% 15%` | `#2B2521` | Ink panel header / footer |

### Color principles
- **Warmth is non-negotiable.** Never introduce cold gray or neutral white. All grays in the palette are warm-shifted (hue 26–40, saturation 12–30%).
- **The four-tier staircase is the visual signature.** Background → card → sidebar → header/footer = increasing depth/darkness in light mode, decreasing in dark mode.
- **Terracotta is the only accent.** Don't add a second brand color. Use opacity ramps (`primary/10`, `primary/30`, `primary/80`) for emphasis variation, not new hues.
- **Status colors** (success/warning/error) inherit from Tailwind defaults: `bg-amber-50` for soft notices, `text-destructive` for errors, `text-primary` for in-progress states.
- **Image lightboxes intentionally use `bg-black/90`** in both themes — full-screen image viewing always wants a dark backdrop.

---

## 3. Typography

### Fonts (loaded via Google Fonts as variable fonts)
- **Source Serif 4** — display headings + reading prose. Variable weight 300–700, opsz 8–60, both upright and italic.
- **Inter** — UI labels, navigation, buttons. Variable weight 300–700.
- **Noto Serif** — fallback for Source Serif 4.
- **MathJax** — renders all `$inline$` and `$$display$$` math expressions inside prose using a custom macro set (see Section 9).

### Display scale
| Use | Family | Size | Weight | Letter-spacing | Line-height |
|---|---|---|---|---|---|
| Site wordmark | Source Serif 4 | 1.25rem | 400 | -0.018em | 1.0 |
| Hero heading (H1) | Source Serif 4 | clamp(36px, 6vw, 64px) | 580 | -0.022em | 1.05 |
| Page heading (H2) | Source Serif 4 | 2.25rem | 580 | -0.018em | 1.15 |
| Section heading (H3) | Source Serif 4 | 1.5rem | 580 | -0.018em | 1.2 |
| Subsection (H4) | Source Serif 4 | 1.25rem | 620 | normal | 1.3 |
| Body prose | Source Serif 4 | 1.0625rem | 430 | normal | 1.72 |
| UI body | Inter | 0.875rem | 430 | normal | 1.5 |
| UI eyebrow | Inter | 0.75rem | 600 | 0.04em (uppercase) | 1.3 |

### Typography principles
- **Body weight 430 is intentional**, not 400. Source Serif 4 at 430 is slightly more substantive — better for sustained reading of legal copy on a slightly-textured cream background. Don't drop it back to 400.
- **Headings use weight 580**, not full bold (700). Calmer, more publication-feel.
- **Strong/`<b>` is weight 640**, slightly stronger than headings to stand out within a paragraph.
- **Letter-spacing is tightened on display sizes** (-0.018 to -0.022em). Body text uses default tracking.
- **Italic is rendered from the variable italic axis**, not faux-italic. Source Serif 4 includes an authored italic.
- **No drop-shadows.** Drop-shadows on type were used in the old dark-glass design; they don't belong on cream surfaces.

---

## 4. Surfaces and elevation

### Component surface conventions
| Component | Surface | Border | Shadow | Radius |
|---|---|---|---|---|
| Document card (PDF wrapper, hero panel, featured work) | `bg-card` | `border border-border` | `shadow-sm` | `rounded-2xl` |
| Soft callout panel | `bg-secondary` | `border border-border` | none | `rounded-lg` |
| PDF viewer chrome | `bg-card` | `border border-border` | none | `rounded-t-xl` (top), `rounded-b-xl` (iframe wrapper) |
| Sidebar (case-doc nav) | `bg-surface-sidebar` | `border-r border-surface-sidebar-border` | none | none (full-bleed) |
| Header / Footer | `bg-surface-leather` | `border-b/-t border-surface-leather-border` | none | none (full-bleed) |
| Primary button | `bg-primary text-primary-foreground` | none | `shadow-sm`, `hover:shadow-md` | `rounded-md` |
| Outline button | `bg-card text-foreground` | `border border-border` | `shadow-sm`, `hover:shadow-md` | `rounded-md` |
| Active sidebar item | `bg-card/90 text-primary` | `border-l-2 border-primary -ml-[2px]` | `shadow-sm` | `rounded-md` |

### Background texture
The page background carries a three-layer paper texture (`.bg-texture` in `index.css`, mounted as a fixed layer in `PageLayout`): a soft top glow, a fine dot grid (~26px), and SVG grain — all at whisper opacity. It gives the cream surface tooth without competing with content. Both modes; tuned separately for dark.

### Corner radius
`--radius: 0.45rem`. Cards use `rounded-xl` at most (the former `rounded-2xl` read soft/bubbly). Buttons `rounded-md`.

### Elevation principles
- **Shadows are always `shadow-sm` or smaller.** Never `shadow-xl` or `shadow-2xl`. The warm tonal staircase carries the depth — shadows are a subtle reinforcement.
- **No glassmorphism.** No `backdrop-blur` on opaque surfaces. (The previous design relied on it; it conflicts with the warm-paper aesthetic.)
- **No gradients on surfaces.** Solid color only.
- **Borders are visible but not loud.** `border-border` is a warm tan that reads softly on cream.

---

## 5. Component patterns

### Header (`src/components/Header.tsx`)
- Fixed top, full width, leather brown surface, light foreground text.
- Left: serif wordmark "The Laws of Existence", links to `/`.
- Center-right: dropdown navigation (Radix NavigationMenu) — `Home`, `Research ▾`
  (manuscripts), `Evidence ▾` (data collections),
  `Cases ▾` (the cases with case numbers), `More ▾` (feature pages),
  `Contact`. Dropdown panels are `bg-card border-border rounded-lg shadow-md`;
  each row = title + small muted subline; footer row is a terracotta "All …" link.
  Inactive triggers use `text-surface-leather-foreground/85`, active `text-primary`.
- Right: terracotta `Support` button (links to `/donate`), then theme toggle (sun/moon dropdown).
- Mobile: collapse nav into a slide-out drawer (includes a "The Cases" group);
  theme toggle stays in the header bar next to a hamburger icon.

### Footer (`src/components/Footer.tsx`)
- Same leather brown surface as header.
- Left: "Laws of Existence Framework™" wordmark, "Patent Pending" badge (terracotta tinted, uppercase, small caps), copyright line.
- Right: text links — Home, Contact, Legal, Terms, Privacy.

### Reading sidebar (case-document nav, `src/pages/SectionPage.tsx`)
- Fixed left, 16rem (`w-64`) wide, beige sidebar surface.
- Header block: "Back to Constitutional Challenges" ghost button, then a serif H2 with collection title and a small icon, then a smaller line for case title.
- Body: vertical list of section buttons. Each section shows a small uppercase eyebrow (e.g. "SECTION 1") above the section title. Active state has a 2px terracotta left border, soft card background, and primary-tinted text.

### Document card pattern
- Used for: PDF viewers on case-doc pages, hero panel on home page, featured-work cards.
- Always white-card surface on the cream background.
- Padding scales: `p-8` mobile, `p-10` desktop.
- For long-form prose inside, wrap in `.prose` class so typography rules apply.

### PDF viewer (`src/components/PDFViewer.tsx`)
- Top header strip: file icon (terracotta), serif title, optional description, then control row (zoom buttons in a `bg-secondary` group, then `Download`, `Open in New Tab`, `Download All PDFs (N files)`).
- A small terracotta resize-handle pill sits at top-right corner of the header — drag to resize the viewer container.
- Body: native browser PDF iframe, full-width, fills available height. Iframe background is `#f5f3ed` so unrendered margins blend with the warm aesthetic.
- Footer info strip: file-icon + "PDF Document" + bullet + "Click and drag to pan • Scroll to navigate pages".

### Buttons
- **Primary CTA**: terracotta solid (`bg-primary`). Use sparingly — typically the "Support" header button and the most important call-to-action on a page. Never two primary buttons next to each other.
- **Secondary**: outline with card background. Use for nav cards on the home hero.
- **Ghost**: transparent, hover reveals `bg-secondary`. Use for icon buttons and back-links.
- **Accent variant** (only one place: SCOTUS Shadow Docket on home hero): outline with terracotta border instead of border-border, signals "this is the editorial featured analysis". Don't proliferate.

### Alerts and notices
- **Pending-filing notice** (Acosta case is mailed but not yet filed): `bg-amber-50 border-amber-300/70 text-amber-900` — a soft cream-amber tint, never red. Reserve red for actual errors.
- **Document Summary callout**: `bg-secondary` panel with a serif H3, used only when an additional plain-English summary accompanies a court PDF.

### Theme toggle
- Lives in header. Sun/moon icon in a ghost button. Dropdown menu with three choices: Light / Dark / System. Active choice marked with a small terracotta dot.
- Icons: `lucide-react` Sun, Moon, Monitor.

---

## 6. Layout conventions

### Page shell
1. Fixed cream `bg-background` div as the lowest layer.
2. Fixed top header (4rem tall).
3. Main content area starts below header (`pt-16`), with elastic scroll behavior on the outer document — pulling beyond top/bottom translates the content with rubber-band easing. (See `src/components/PageLayout.tsx`.)
4. Fixed footer at bottom.
5. On case-document pages, a fixed left sidebar (16rem) lives between header and footer; main content gets `ml-64`.

### Container widths
- Top-level container: `container mx-auto px-4` (Tailwind's container, `2xl: 1400px` cap).
- Hero: `max-w-5xl`.
- Featured panels on home: `max-w-4xl`.
- Reading column inside doc cards: prose self-constrains via `max-w-none` (the card itself caps width at `2xl: 1400px`).

### Spacing
- Vertical rhythm in prose: `mb-5` between paragraphs, `mb-8 mt-8` around H1/H2, `mb-4` after H3/H4.
- Section-to-section spacing on home: `space-y-24`.
- Card internal padding: `p-8 md:p-10` for content cards, `p-6` for callout panels.

---

## 7. URL and routing map

The site is a Vite-built React SPA today. **Descriptive, slug-based URLs are canonical** (since the 2026-07 Phase 1 refactor): court documents resolve by ECF coordinate, all other content by explicit `slug` fields in the content JSON. Identity lives in data, never in sort order. URLs that must remain stable for legal/SEO purposes:

| Pattern | Renders |
|---|---|
| `/` | Home — hero panel + featured-work sections |
| `/kirchner-v-johnson` | Case landing page (documents listed with ECF coordinates) |
| `/kirchner-v-johnson/51` | Doc 51 (the operative pleading), rendered directly |
| `/kirchner-v-johnson/51-N` | Attachment N of Doc 51, rendered directly |
| `/kirchner-v-johnson/mo-stay` | Named docket entries by slug |
| `/kirchner-v-ellison`, `/kirchner-v-ellison/:docId` | Same pattern, Ellison case |
| `/kirchner-v-acosta`, `/kirchner-v-acosta/:docId` | Same pattern, Acosta case |
| `/kirchner-v-trump`, `/kirchner-v-trump/:docId` | Redirects to the Johnson equivalents |
| `/scotus-amicus`, `/scotus-amicus/:docId` | SCOTUS amicus index + per-part reader |
| `/composition/:collection` | Collection grid: `manuscript`, `data`, `constitutional`, `copyright`, `timeline`, `map` |
| `/composition/:collection/:compositionSlug/:sectionSlug` | Canonical section reader (PDF viewer or markdown prose) |
| `/composition/:collection/composition/:i/section/:n` | Legacy positional URLs — **301 to the descriptive successor** (684 frozen in the generated `public/_redirects`; source data `scripts/data/legacy-routes.json`) |
| `/research/:archiveId` (+ `/leaf/:leafId`, `/doc/:docFile`) | Unlisted research archives (noindexed, manifest-resolved IDs) |
| `/copyright` | Redirects to `/composition/copyright` |
| `/donate`, `/contact`, `/partners`, `/for-journalists` | Static pages |
| `/timeline`, `/individuals-metrics`, `/videos`, `/scotus-shadow-docket`, `/constitutional-accountability` | Feature pages |
| `/legal-disclaimers`, `/terms-of-service`, `/privacy-policy` | Footer pages |
| `*` | 404 (noindexed NotFound) — unknown doc ids land here or on the case landing page, never on an array index |

When generating a new page or layout, **maintain these URL patterns**. The `/kirchner-v-johnson/51-N` pattern in particular is referenced from filed legal documents and must continue to resolve. Never hand-edit `public/_redirects` or `legacy-routes.json`, and never reintroduce positional routing.

---

## 8. Content collections

The site's content is JSON files under `content/`, maintained directly in the repo (the CMS stratum was retired 2026-07) and loaded at build time. Every composition and section carries an explicit `slug` field (court docs: the ECF coordinate from the `pdf_file` basename) — the URL contract in §7 reads these, and `validate-content` fails the build on malformed or slug-colliding JSON. Each page that lists or renders content reads from one of six collections:

| Collection | Path | Purpose |
|---|---|---|
| `constitutional` | `content/constitutional/*.json` | Three cases. Each JSON has `title`, `collection_type`, `date`, `featured`, and a `sections[]` array. Sections have `pdf_file`, `title`, `description`, optional `content_level_1/3/5` markdown. |
| `manuscript` | `content/manuscript/*.json` | Long-form research papers. Sections have markdown at three depth levels — `content_level_1` (summary), `content_level_3` (full content), `content_level_5` (additional/methodology). |
| `data` | `content/data/*.json` | Evidence collections (testimonies, exhibits). Same shape as manuscript. |
| `copyright` | `content/copyright/*.json` | Copyright-holder notifications. |
| `timeline` | `content/timeline/*.json` | Time-series of events with dates and descriptions. Renders as an interactive timeline page. |
| `map` | `content/map/*.json` | Country and event data, rendered through the composition reader and the homepage featured-work section. (The interactive world-map page was retired 2026-07.) |

The reading interface on `SectionPage` includes a **content-depth slider** (1 / 3 / 5) for collections that have multiple depth levels. Don't redesign this away — it's a deliberate accessibility feature ("show me the summary" vs "show me the full argument" vs "show me the methodology").

---

## 9. MathJax custom macros

Prose may include LaTeX inline (`$...$`) or display (`$$...$$`). The framework defines custom macros that any new prose template must continue to support:

```latex
\LoE        → \mathfrak{L}             % the Laws of Existence operator
\Coh        → \text{Coh}               % coherence operator
\PhiP       → \Phi_P                   % physical principle
\PhiT       → \Phi_T                   % temporal
\PhiU       → \Phi_U                   % universal
\PhiF       → \Phi_F                   % framework
\PhiN       → \Phi_N                   % normative
\RecOp      → \mathcal{R}              % recursive operator
\PS         → \mathcal{PS}             % phase space
\Att        → \mathcal{A}              % attractor
\Basin      → \mathcal{B}              % basin of attraction
\Evol       → \mathcal{F}              % evolution function
\ExistThresh → \tau_{\text{exist}}    % existence threshold
\Val        → \text{Val}               % valence
\Choice     → \text{Choice}            % choice mapping
\Corresponds → \text{Corresponds}     % correspondence
```

These macros live in the on-demand MathJax loader (`src/utils/mathjax.ts` — config + macro set, loaded by the markdown renderer only when a page contains math). Any new prose surface must keep resolving them.

---

## 10. Animations and motion

- **Theme toggle**: instant. No transition between light and dark.
- **Reveal-on-enter**: content sections fade up 12px over 550ms (`cubic-bezier(0.16,1,0.3,1)`) via the `<Reveal>` component, staggered ≤80ms between siblings. One-shot, IntersectionObserver-driven, disabled under `prefers-reduced-motion`. This is the only scroll-linked motion — no parallax.
- **Hover transitions**: 200ms ease for color and background. Avoid scale-on-hover for primary CTAs (feels marketing).
- **Card hover** on home hero buttons: `shadow-sm → shadow-md`, no movement.
- **Page transitions**: not yet implemented. When added, prefer view transitions or a 200ms fade — avoid translate/slide except on the case-doc sidebar drawer (mobile).
- **Elastic scroll**: pulling past the top or bottom of the page rubber-bands the content with a `translateY` and 800ms cubic-bezier release. This is signature behavior; preserve it.
- **No autoplay video, no parallax on the bg, no scroll-jacking.**

---

## 11. Accessibility minimums

- Min contrast: AA 4.5:1 for body text, 3:1 for large text. Verify if introducing new color combinations.
- All interactive elements have visible focus rings (`ring-2 ring-ring`, where `--ring` resolves to terracotta).
- Skip-to-content link in the header (TODO in current code, add it).
- All images need meaningful `alt` text or `alt=""` for decorative.
- Keyboard navigable: every nav, button, link reachable via Tab.
- Theme respects OS preference if user picks "System".

---

## 12. Things NOT to introduce

- ❌ Cold neutral grays (`#888`, `#ccc`, `slate`, `zinc`, `neutral` Tailwind palettes). Always warm.
- ❌ Pure white (`#FFFFFF`). Use `--card` (`#ECE3CA`).
- ❌ Pure black (`#000000`). Use `--foreground` (`#1C1812`).
- ❌ A second brand color. Terracotta is the only accent.
- ❌ Glass / blur / frosted surfaces.
- ❌ Drop-shadows on text.
- ❌ Multiple elevation tiers via shadow. Use the warm staircase.
- ❌ Icon-only navigation (icons should always be paired with labels except for known affordances like the theme toggle and PDF zoom controls).
- ❌ Marketing copywriting tropes ("Discover…", "Game-changing…", emoji in body copy).
- ❌ Sans-serif body text. Reading copy is always Source Serif 4.
- ❌ Animated GIFs or auto-playing video on content pages.

---

## 13. Things to keep

- ✅ The four-tier warm staircase (cream → card → beige → leather).
- ✅ Terracotta as the only accent.
- ✅ Source Serif 4 + Inter, both as variable fonts.
- ✅ The case-document sidebar pattern with eyebrow + title + active terracotta border.
- ✅ The content-depth slider (1/3/5) on multi-level prose pages.
- ✅ The PDF viewer with iframe + chrome strip + downloadable bundle.
- ✅ "Patent Pending" footer badge in terracotta.
- ✅ The MathJax macro set.
- ✅ The elastic-scroll PageLayout behavior.
- ✅ JSON content collections under `content/` as the single source of truth, edited in-repo (the CMS stratum is retired — don't reintroduce one).
- ✅ All current URL patterns (legal documents are linked from filed pleadings).

---

## 14. New-page checklist

When generating a new page or component:
1. Use existing tokens (`bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, etc.). Never hardcode hex values.
2. Pick the right surface tier: page bg, card, soft panel, sidebar, or leather chrome.
3. Body copy in Source Serif 4 at weight 430. UI labels in Inter at 430.
4. If it's a long-form reading surface, use the `.prose` class.
5. If it includes math, route the markdown through `ImageEnhancedMarkdownRenderer` — MathJax and the macro set load on demand via `src/utils/mathjax.ts`.
6. Test in both light and dark modes before shipping. The dark mode should feel like the same site, not a different one.
7. Court-doc and content URLs resolve from `slug` fields in the content JSON (`src/utils/urls.ts`) — never reintroduce positional offset maps; unknown ids land on the case page or 404, never on an array index.
8. Add a corresponding entry to the relevant content collection JSON if the page is content-driven.

---

## 15. Reference: file locations

| Concern | Lives at |
|---|---|
| Theme tokens (CSS variables) | `src/index.css` (lines 8–110) |
| Tailwind theme | `tailwind.config.ts` |
| FOUC-prevention script | `index.html` `<head>` |
| ThemeProvider | `src/App.tsx` (wraps everything) |
| Theme toggle component | `src/components/ThemeToggle.tsx` |
| Page shell | `src/components/PageLayout.tsx` |
| Header | `src/components/Header.tsx` |
| Footer | `src/components/Footer.tsx` |
| Mobile sidebar drawer | `src/components/MobileNavigation.tsx` |
| PDF viewer | `src/components/PDFViewer.tsx` |
| Section reader | `src/pages/SectionPage.tsx` |
| Composition grid | `src/pages/CompositionsPage.tsx` |
| Home page | `src/pages/Index.tsx` |
| Hero buttons | `src/components/hero/HeroButtons.tsx` |
| Featured work | `src/components/sections/FeaturedWorkSection.tsx` |
| Markdown renderer (images + math; the one live renderer) | `src/components/ImageEnhancedMarkdownRenderer.tsx` |
| MathJax on-demand loader (config + macro set) | `src/utils/mathjax.ts` |
| Composition data store | `src/utils/compositionData.ts` (Zustand, per-collection loading) |
| Composition loader | `src/utils/compositionLoader.ts` (`import.meta.glob`) |
| URL / slug helpers | `src/utils/urls.ts` |
| Generated nav manifest (Header menus) | `src/data/navManifest.json` |
| Frozen legacy-301 map | `public/_redirects`, generated from `scripts/data/legacy-routes.json` |

---

*This document was generated for Anthropic's Claude Design tool (claude.ai/design) so that mockups and prototypes for The Laws of Existence remain on-brand without re-specifying colors and typography in every prompt.*