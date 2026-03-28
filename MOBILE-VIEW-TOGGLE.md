# Mobile View Toggle - Feature Flag

## Current Status: DESKTOP ONLY MODE (Mobile view disabled)

The website is currently set to show **desktop layout on all devices**, including mobile phones. This is controlled by a CSS class flag.

---

## How to ENABLE Mobile Responsive View

When the client approves the mobile design, follow these steps:

### Step 1: Edit `index.html`

Find this line (around line 19):
```html
<body class="desktop-only">
```

Change it to:
```html
<body>
```

### Step 2: Deploy

Commit and push the change:
```bash
git add index.html
git commit -m "Enable mobile responsive view"
git push
```

---

## How to DISABLE Mobile View (Go back to desktop-only)

If you need to revert to desktop-only mode:

Change:
```html
<body>
```

Back to:
```html
<body class="desktop-only">
```

---

## Technical Details

The `desktop-only` class in `<body>` triggers these CSS rules in `styles/base.css`:

- Forces minimum width of 1200px
- Hides hamburger menu
- Hides mobile menu overlay
- Shows desktop navigation links
- Shows desktop CTA button

All mobile responsive CSS remains in the codebase - it's just not applied when the flag is active.

---

## Files Involved

- `index.html` - Line ~19: `<body class="desktop-only">`
- `styles/base.css` - Desktop-only mode CSS rules

---

## Quick Reference for AI Agent

**To enable mobile view:** Remove `desktop-only` class from `<body>` tag in `index.html`

**To disable mobile view:** Add `desktop-only` class to `<body>` tag in `index.html`
