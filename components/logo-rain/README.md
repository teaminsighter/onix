# Logo Rain Animation

Animated logos that reveal and fade across a section background. Logos appear at random positions from a predefined grid, with a clip-path reveal animation.

## Preview
Logos slide into view from bottom, stay visible, then slide out to top - creating a "rain" effect across the section.

## Usage

### 1. HTML
Add the container inside your section:
```html
<section class="your-section">
    <div id="logo-rain-bg"></div>
    <div class="your-content">
        <!-- Content here -->
    </div>
</section>
```

### 2. CSS
Import the styles:
```css
@import './components/logo-rain/logo-rain.css';
```

Make sure your section has:
```css
.your-section {
    position: relative;
    overflow: hidden;
}

.your-content {
    position: relative;
    z-index: 2; /* Above the logo rain */
}
```

### 3. JavaScript
```javascript
import { initLogoRain } from './components/logo-rain/logo-rain.js';

// Initialize (uses IntersectionObserver - only animates when visible)
initLogoRain();
```

## Customization

Edit `logo-rain.js` to customize:

```javascript
// Logo images
this.icons = [
    '/logos/logo1.png',
    '/logos/logo2.png',
    // ...
];

// Grid positions (x, y as percentages)
this.positions = [
    { x: 5, y: 10 },
    { x: 25, y: 30 },
    // ...
];

// Timing
this.visibilityDuration = 8000;  // 8 seconds total animation
this.spawnInterval = 1200;       // 1.2 seconds between spawns
this.iconSize = 90;              // Logo size in pixels
```

## Files
- `logo-rain.js` - Animation logic (ES Module)
- `logo-rain.css` - Styles and keyframe animations
- `README.md` - This file
