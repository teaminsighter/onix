/**
 * ONIX - Main Entry Point
 * Imports styles and initializes all modules
 */

// Import styles (Vite handles CSS imports)
import '../styles/main.css';

// Import modules
import { initCursor } from './cursor.js';
import { initMagnetic, initNavbar } from './utils.js';
import { initDashboard } from './dashboard.js';
import { initAnimations } from './animations.js';
// Logo rain moved to: components/logo-rain/ (import if needed)

// Initialize when DOM is ready
function init() {
    initCursor();
    initMagnetic();
    initNavbar();
    initDashboard();
    initAnimations();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
