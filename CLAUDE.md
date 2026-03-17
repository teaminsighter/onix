# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# ONIX Website

Lead generation automation platform marketing website. Dark theme with lime green (#c9f31d) accent.

## Development

```bash
npm install          # Install dependencies (first time)
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build
```

## Project Structure

```
onix/
├── index.html              # Main website
├── vite.config.js          # Multi-page Vite config
├── services/               # Industry-specific landing pages
│   ├── life-insurance.html
│   ├── income-protection.html
│   ├── health-insurance.html
│   ├── solar.html
│   ├── real-estate.html
│   ├── mortgage-loans.html
│   ├── tradies.html
│   ├── builders.html
│   └── coming-soon.html
├── styles/
│   ├── main.css            # Imports all section styles
│   ├── base.css            # CSS variables, reset, shared styles
│   ├── responsive.css      # All media queries
│   └── [section].css       # One CSS file per section (navbar, hero, etc.)
├── js/
│   ├── main.js             # Entry point, imports all modules
│   ├── animations.js       # GSAP hero intro + scroll animations
│   ├── dashboard.js        # Industry dashboard, charts, tab switching
│   ├── utils.js            # Magnetic buttons, smart navbar
│   ├── cursor.js           # Custom cursor effects
│   └── logo-rain.js        # Raining logos animation in stats section
├── logos/                  # Partner/client logos (10 files)
└── images/                 # Feature images, team photos
```

## Architecture

**JS Module System**: ES modules with Vite bundling. Entry point `js/main.js` imports and initializes all modules on DOMContentLoaded.

**CSS Organization**: `styles/main.css` uses `@import` to combine section-specific stylesheets. Variables defined in `base.css`.

**Animation System**: GSAP 3.12.5 + ScrollTrigger loaded via CDN (not bundled). All animations in `animations.js` with two main functions:
- `initAnimations()` - Hero intro sequence (skipped if user scrolled past 100px)
- `initScrollAnimations()` - All scroll-triggered effects

**Dashboard**: `js/dashboard.js` exports `industries` object containing stats, charts, and styling for each industry. Auto-rotates tabs every 8 seconds. Exports `animateDataIn()` and `animateChartIn()` for animation triggers.

## Key Sections

| Section | ID | Description |
|---------|-----|-------------|
| Hero | - | Title animation, industry dashboard with auto-rotating tabs |
| Stats | `#stats` | Animated counters + raining logos background |
| Services | `#services` | 8 expert cards linking to service pages |
| Features | `#features` | 6 feature cards, horizontal scroll (pinned) |
| How it Works | `#how` | Typewriter steps + rotating maze circle SVG |
| Testimonials | `#testimonials` | 2 rows of sliding review cards |
| Team | `#team` | Founder bios + team grid |
| Book a Call | `#book` | Calendly embed + benefits list |
| Contact | `#contact` | Form + info card with NZ map |

## Dashboard Industries

Defined in `js/dashboard.js`. Each industry object has:
- `stats[]` - 4 bento card objects with `val`, `num`, `lbl`, `change`
- `chart` - Type: `bar`, `line`, `area`, `pie`, or `donut`
- Chart data arrays (`bars`, `points`, or `pie`)

Industries: **Tradies, Builders, Solar, Insurance, Real Estate**

## Animation System

### Hero Intro (`initAnimations`)
1. Title scales up centered, characters animate in with `back.out` easing
2. Shrinks/moves to final position over 1.6s
3. Sequential reveal: navbar → badge → subtitle words → buttons → dashboard
4. Dashboard tabs slide in, then `animateDataIn()` and `animateChartIn()` fire

If `window.scrollY > 100` on load, intro is skipped and elements set to final state.

### Scroll Animations (`initScrollAnimations`)
- Section titles split into chars with 3D rotation reveal
- Stats counters animate values on scroll
- Features horizontal scroll (pinned section)
- Maze circle rings rotate opposite directions based on scroll delta
- Floating particles with random GSAP tweens

### Adding a New Industry
Add to `industries` object in `js/dashboard.js`:
```js
newIndustry: {
    title: 'Industry Name',
    bentoClass: 'bento-newindustry',
    shapes: ['s-round', 's-pill', 's-round', 's-cut'],
    stats: [
        { icon: '&#128295;', val: '342', num: 342, lbl: 'Label', change: '+38%' },
        // ... 3 more stats
    ],
    chart: 'bar', // or 'line', 'area', 'pie', 'donut'
    chartTitle: 'Chart Title',
    chartBadge: '+XX% growth',
    bars: [28, 42, 35, ...], // or points/pie array
    barLabels: ['Jan', 'Feb', ...]
}
```
Then add a tab in `index.html` inside `#indTabs`.

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
- GSAP 3.12.5 + ScrollTrigger
- Calendly widget
