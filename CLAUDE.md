# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# ONIX Website

Lead generation automation platform marketing website. Dark theme with lime green (#c9f31d) accent.

## Development

```bash
npm install              # Install dependencies (first time)
npm run dev              # Start dev server with hot reload (port 5173)
npm run build            # Build for production (outputs to dist/)
npm run build:optimized  # Optimize images (sharp) then build
npm run preview          # Preview production build
npm run start            # Serve dist/ folder on port 3000 (production)
npm run optimize-images  # Run image optimization (sharp) without build
```

**Running Both Frontend + Admin**: In development, run `npm run dev` (port 5173) for frontend and `cd admin && npm run dev` (port 3001) for admin simultaneously.

### Admin Dashboard (separate app in `admin/`)

Express + EJS + SQLite backend for lead management. Separate `npm install` required.

```bash
cd admin
npm install
cp .env.example .env     # Configure JWT_SECRET, etc.
npm run init-db           # Initialize SQLite database
npm run dev               # Start with nodemon (port 3001)
npm start                 # Production start
```

**Environment Variables**: Copy `admin/.env.example` to `admin/.env`. Required: `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `WEBHOOK_SECRET`. Optional: `CORS_ORIGIN` (comma-separated allowed origins), `DB_PATH` (defaults to `./data/onix.db`), `TRUST_PROXY` (set to 1 behind reverse proxy), SMTP settings for email notifications. Requires Node.js >=18.0.0.

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
- `js/form-handler.js` - Form validation and submission to admin webhook endpoint
- `js/analytics.js` - GA4, GTM, Facebook Pixel, Clarity integration (disabled until config IDs set)
- `js/cookie-consent.js` - Cookie banner that gates analytics initialization
- `js/image-utils.js` - Image lazy-loading utilities
- `js/insurance.js`, `js/solar.js`, `js/real-estate.js`, `js/tradies.js`, `js/builders.js` - Per-service-page standalone modules. Each is self-contained (registers its own GSAP plugins, cursor, navbar, animations) and is loaded directly by its service HTML — NOT imported via `main.js`.

## Architecture

**Multi-Page Setup**: Vite config defines entry points for main site + service pages. Current pages: main, privacy-policy, terms-of-service, insurance (+ life/income-protection/health sub-pages), solar, real-estate, mortgage-loans, tradies, builders, coming-soon. Each service page is a standalone HTML file in `services/`. To add a new service page:
1. Create `services/new-page.html` (copy structure from existing)
2. Add entry to `vite.config.js` rollupOptions.input
3. Create page-specific styles in `styles/` if needed

**JS Module System**: ES modules with Vite bundling. Initialization order in `main.js`: cursor → magnetic → navbar → mobile menu → dashboard → animations → form handler → cookie consent.

**GSAP Usage**: GSAP 3.12.5 + ScrollTrigger + ScrollToPlugin loaded via CDN (NOT bundled/imported). Use `gsap`, `ScrollTrigger`, and `ScrollToPlugin` as globals. Register plugins at top of animation files: `gsap.registerPlugin(ScrollTrigger)` or `gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)`.

**CSS Organization**: `main.css` uses `@import` for section stylesheets. Variables in `base.css`. Responsive breakpoints in `responsive.css`: ultrawide (>1920px), desktop (1200-1920px), tablet (768-1200px), mobile (<768px).

**Dashboard**: `js/dashboard.js` exports `industries` object with stats/charts per industry. Auto-rotates every 8s (pauses on hover). Exports `animateDataIn()` and `animateChartIn()` for animation triggers.

**Admin Dashboard** (`admin/`): Express server (port 3001) with EJS templates, SQLite via better-sqlite3, JWT auth. Routes in `admin/src/routes/`: `auth` (login/JWT), `leads` (CRUD), `meetings` (calendar management), `costs` (tracking), `settings` (system/branding/integrations), `webhook` (inbound lead capture with optional secret validation), `dashboard` (pipeline/analytics with date filtering). Views use a shared `layout.ejs` with `partials/sidebar.ejs`. Database schema in `admin/src/database.js` includes: leads, lead_activities, users, settings, meetings, costs, deals, integrations, company_profile, notification_preferences, user_activity_log.

**Form Submission Flow**: Frontend `form-handler.js` submits to `/api/webhook/lead` endpoint → admin webhook route validates and stores in SQLite → lead appears in admin dashboard. Cookie consent gates analytics tracking (GA4, GTM, Facebook Pixel, Clarity) via `cookie-consent.js` → `analytics.js`.

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

**Service-Page Animation Modules**: Each major service page (`insurance`, `solar`, `real-estate`, `tradies`, `builders`) has its own self-contained JS module under `js/`. They do NOT go through `main.js` — they each register GSAP plugins, set up their own cursor/navbar, and run their page-specific animations. When changing animation behavior site-wide, expect to touch each of these modules separately. `insurance.js` additionally drives the Three.js 3D globe and pinned markets slideshow; `real-estate.js` also uses Three.js for a 3D property model.

## Mobile Considerations

- Features horizontal scroll disabled on mobile (≤768px) — cards stack vertically
- Expert cards use individual lazy-load triggers on mobile vs staggered reveal on desktop
- Hero intro: no horizontal centering on mobile, scale stays at 1
- Custom cursor hidden on touch devices

## Admin Dashboard Details

**Database Access Pattern**: All database queries use prepared statements defined in `admin/src/database.js`. Query objects are exported as `leads`, `meetings`, `costs`, `deals`, `settings`, etc.

**Date-Filtered Analytics**: The `dateFiltered` export provides functions for analytics with custom date ranges: `getLeadsInRange()`, `countLeadsByStatusInRange()`, `getSourcePerformanceInRange()`, `getRevenueInRange()`.

**Production Deployment**: Admin serves both backend and frontend. Built frontend files go to `admin/public/site/`. The server auto-serves frontend for non-admin paths.
