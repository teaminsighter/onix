# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# ONIX Website

Lead generation automation platform marketing website. Dark theme with lime green (#c9f31d) accent.

## Development

```bash
npm install          # Install dependencies (first time)
npm run dev          # Start dev server with hot reload (port 5173)
npm run build        # Build for production (outputs to dist/)
npm run preview      # Preview production build
npm run start        # Serve dist/ folder on port 3000 (production)
```

## Project Structure

- `index.html` - Main website entry point (GSAP loaded via CDN at end of body, before main.js)
- `vite.config.js` - Multi-page config defining all HTML entry points
- `services/` - Industry landing pages (insurance, solar, real-estate, tradies, builders, etc.)
- `styles/main.css` - Imports all section styles via `@import`
- `styles/base.css` - CSS variables, reset, shared styles
- `styles/responsive.css` - All media queries (ultrawide → mobile)
- `js/main.js` - Entry point, imports and initializes all modules on DOMContentLoaded
- `js/animations.js` - GSAP hero intro + scroll animations
- `js/dashboard.js` - Industry dashboard with stats, charts, tab switching
- `js/utils.js` - Magnetic buttons, smart navbar, mobile menu
- `js/cursor.js` - Custom cursor effects
- `js/insurance.js` - Standalone module for insurance service pages (self-contained, not imported via main.js)

## Architecture

**Multi-Page Setup**: Vite config defines entry points for main site + service pages. Current pages: main, insurance (+ life/income-protection/health sub-pages), solar, real-estate, mortgage-loans, tradies, builders, coming-soon. Each service page is a standalone HTML file in `services/`. To add a new service page:
1. Create `services/new-page.html` (copy structure from existing)
2. Add entry to `vite.config.js` rollupOptions.input
3. Create page-specific styles in `styles/` if needed

**JS Module System**: ES modules with Vite bundling. Initialization order in `main.js`: cursor → magnetic → navbar → mobile menu → dashboard → animations.

**GSAP Usage**: GSAP 3.12.5 + ScrollTrigger + ScrollToPlugin loaded via CDN (NOT bundled/imported). Use `gsap`, `ScrollTrigger`, and `ScrollToPlugin` as globals. Register plugins at top of animation files: `gsap.registerPlugin(ScrollTrigger)` or `gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)`.

**CSS Organization**: `main.css` uses `@import` for section stylesheets. Variables in `base.css`. Responsive breakpoints in `responsive.css`: ultrawide (>1920px), desktop (1200-1920px), tablet (768-1200px), mobile (<768px).

**Dashboard**: `js/dashboard.js` exports `industries` object with stats/charts per industry. Auto-rotates every 8s (pauses on hover). Exports `animateDataIn()` and `animateChartIn()` for animation triggers.

**Desktop-Only Mode**: The `<body>` has `desktop-only` class forcing desktop layout. Remove from `index.html` to enable mobile responsive.

## Dashboard Industries

Industries defined in `js/dashboard.js`: **Tradies, Builders, Solar, Insurance, Real Estate**

Each industry object structure:
- `stats[]` - 4 bento card objects with `val`, `num`, `lbl`, `change`
- `chart` - Type: `bar`, `line`, `area`, `pie`, or `donut`
- Chart data arrays (`bars`, `points`, or `pie`)

## Animation System

**Hero Intro** (`initAnimations`):
1. Title scales up centered, chars animate with `back.out` easing
2. Shrinks/moves to final position over 1.6s
3. Sequential reveal: navbar → badge → subtitle → buttons → dashboard
4. If `window.scrollY > 100` on load, intro skipped and elements set to final state

**Scroll Animations** (`initScrollAnimations`):
- Section titles: split into chars with 3D rotation reveal
- Stats: animated counters on scroll
- Features: horizontal scroll (pinned section, desktop only)
- Maze circle: rings rotate opposite directions based on scroll delta

**Adding a New Industry**: Add to `industries` object in `dashboard.js`, then add tab in `index.html` inside `#indTabs`.

## CSS Variables

```css
--bg: #0a0a0a;
--bg2: #111111;
--accent: #c9f31d;
--accent2: #a8cc18;
--white: #f5f5f5;
--gray: #888888;
--dark-gray: #1a1a1a;
```

## External Dependencies (CDN)

- Google Fonts: Inter, Space Grotesk
- GSAP 3.12.5 + ScrollTrigger + ScrollToPlugin (loaded at end of body, before main.js)
- Three.js (insurance pages only, for 3D globe)
- Calendly widget (for booking section)

## Section Title Animation Pattern

Titles split into `<span class="char">` elements, animated from `opacity: 0, y: 30, rotateX: -40` with `stagger: 0.03` and `back.out(1.7)` easing. Titles inside `.highlight` spans preserve accent color.

**Note**: Sections after Features (How, Testimonials, Team, Book, Contact) have separate title handling due to horizontal scroll pinning.

**Insurance Page Animations** (`js/insurance.js`): Self-contained animation system for insurance service pages. Includes pinned markets slideshow with parallax, 3D globe with Three.js, typewriter effects, and all scroll-triggered animations. Loads its own GSAP plugins and cursor/navbar implementations.

## Mobile Considerations

- Features horizontal scroll disabled on mobile (≤768px) — cards stack vertically
- Expert cards use individual lazy-load triggers on mobile vs staggered reveal on desktop
- Hero intro: no horizontal centering on mobile, scale stays at 1
- Custom cursor hidden on touch devices
