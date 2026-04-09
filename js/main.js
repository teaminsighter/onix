/**
 * ONIX - Main Entry Point
 * Imports styles and initializes all modules
 */

// Import styles (Vite handles CSS imports)
import '../styles/main.css';

// Import modules
import { initCursor } from './cursor.js';
import { initMagnetic, initNavbar, initMobileMenu } from './utils.js';
import { initDashboard } from './dashboard.js';
import { initAnimations } from './animations.js';
import { initCookieConsent } from './cookie-consent.js';
import { initAnalytics, Analytics } from './analytics.js';
import { initFormHandler } from './form-handler.js';
// Logo rain moved to: components/logo-rain/ (import if needed)

// Make Analytics available globally for inline event tracking
window.Analytics = Analytics;

// Initialize when DOM is ready
function init() {
    initCursor();
    initMagnetic();
    initNavbar();
    initMobileMenu();
    initDashboard();
    initAnimations();
    initFormHandler(); // Form validation and submission handling
    initCookieConsent(); // Cookie consent handles analytics initialization
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
