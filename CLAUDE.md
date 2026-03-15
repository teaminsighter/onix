# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# ONIX Website

Lead generation automation platform marketing website. Dark theme with lime green (#c9f31d) accent.

## Project Structure

```
onix/
├── index.html              # Main website
├── package.json            # Vite + dependencies
├── vite.config.js          # Vite configuration
├── styles/
│   ├── main.css            # Imports all styles
│   ├── base.css            # Variables, reset, shared
│   ├── cursor.css          # Custom cursor
│   ├── navbar.css          # Navigation
│   ├── hero.css            # Hero + dashboard + charts
│   ├── marquee.css         # Scrolling marquee
│   ├── stats.css           # Statistics section
│   ├── features.css        # Feature cards
│   ├── how-it-works.css    # Typewriter + maze circle
│   ├── testimonials.css    # Testimonial cards
│   ├── book-call.css       # Calendly booking
│   ├── cta.css             # CTA + particles
│   ├── footer.css          # Footer
│   └── responsive.css      # Media queries
├── js/
│   ├── main.js             # Entry point, imports all modules
│   ├── cursor.js           # Custom cursor effects
│   ├── utils.js            # Magnetic buttons, navbar
│   ├── dashboard.js        # Industry data, charts, tabs
│   └── animations.js       # GSAP ScrollTrigger animations
├── public/
│   └── images/             # Feature images (5 files)
├── animation-demo.html     # Animation development demo
└── steps-demo.html         # Typewriter steps demo
```

## Development

```bash
npm install          # Install dependencies (first time)
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build
```

## Technologies

- **Vite** - Build tool with hot reload
- **GSAP 3.12.5** + ScrollTrigger (CDN)
- **Calendly** embed widget
- ES Modules for JavaScript
- CSS with @import for organization

## Key Sections

| Section | ID | Description |
|---------|-----|-------------|
| Hero | - | Title animation, industry dashboard with auto-rotating tabs |
| Stats | `#stats` | Animated counters (45% uplift, 30% reply, 10hrs saved, $100k+) |
| Features | `#features` | 6 feature cards with images, horizontal scroll on desktop |
| How it Works | `#how` | Typewriter animation + rotating maze circle SVG |
| Testimonials | `#testimonials` | 3 flip-reveal cards |
| Book a Call | `#book` | Calendly embed + benefits list |
| CTA | `#cta` | Final call-to-action |

## Dashboard Industries

Defined in `js/dashboard.js`. Each industry has:
- Bento grid stats (4 cards)
- Chart type (bar, line, pie, area, donut)
- Auto-rotates every 8 seconds

Industries: **Tradies, Builders, Solar, Insurance, Agencies**

## Animation System

### Hero Intro (`js/animations.js`)
1. Title appears big & centered, animates characters
2. Shrinks and moves to final position
3. Navbar, badge, subtitle, buttons reveal
4. Dashboard slides in with data animations

### Scroll Animations
- Section labels/titles reveal on scroll
- Stats counter animation (ScrollTrigger)
- Feature cards horizontal scroll (pinned)
- Testimonials flip reveal (rotateX from -20deg)
- CTA section parallax
- Floating particles

### Typewriter Steps (`#how` section)
- Steps reveal sequentially on scroll
- Maze circle rings rotate opposite directions on scroll
- Progress bars fill per step

## Editing Tips

### Add new industry
Edit `js/dashboard.js` - add to `industries` object with:
- `title`, `bentoClass`, `shapes`
- `stats` array (4 objects with val, num, lbl, change)
- `chart`, `chartTitle`, `chartBadge`, chart data

### Modify animations
Edit `js/animations.js`:
- `initAnimations()` - hero intro sequence
- `initScrollAnimations()` - scroll-triggered effects
- `initTypewriterSteps()` - How it Works section

### Update styling
Edit files in `styles/` folder:
- Each section has its own CSS file
- `base.css` contains shared variables and styles
- `responsive.css` handles all media queries

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

## External Dependencies

- Google Fonts: Inter, Space Grotesk
- GSAP: `cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/`
- Calendly: `assets.calendly.com/assets/external/widget.js`
