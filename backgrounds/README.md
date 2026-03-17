# Reusable Background Patterns

CSS background patterns that can be used across projects.

## Available Patterns

### geometric-hexagon.css
A geometric hexagonal/diamond pattern with subtle 3D depth effect.

**Usage:**
```html
<link rel="stylesheet" href="backgrounds/geometric-hexagon.css">

<section class="bg-hexagon bg-hexagon-fade-top bg-hexagon-fade-bottom">
  <!-- Your content -->
</section>
```

**Classes:**
- `bg-hexagon` - Base pattern
- `bg-hexagon-fade-top` - Gradient fade at top edge
- `bg-hexagon-fade-bottom` - Gradient fade at bottom edge

**Color Variants:**
- `bg-hexagon-accent` - Lime green tint
- `bg-hexagon-blue` - Blue tint
- `bg-hexagon-purple` - Purple tint

**Customization:**
Override CSS variables to customize:
```css
.my-section {
    --hex-size: 250px;      /* Pattern size */
    --hex-c1: #0a0a0a;      /* Darkest */
    --hex-c2: #1a1a1a;      /* Medium */
    --hex-c3: #151515;      /* Lightest */
}
```

## Adding to Another Project

1. Copy the `backgrounds/` folder to your project
2. Import the CSS file you need
3. Add the appropriate classes to your HTML elements
