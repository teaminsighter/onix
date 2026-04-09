/**
 * ONIX Cookie Consent Banner
 * GDPR/CCPA compliant cookie consent management
 */

import { initAnalyticsWithConsent, ANALYTICS_CONFIG } from './analytics.js';

const CONSENT_KEY = 'cookie_consent';
const CONSENT_DATE_KEY = 'cookie_consent_date';

// Check if consent has been given
function hasConsent() {
    return localStorage.getItem(CONSENT_KEY) === 'accepted';
}

// Check if consent has been explicitly declined
function hasDeclined() {
    return localStorage.getItem(CONSENT_KEY) === 'declined';
}

// Check if user has made any choice
function hasChoice() {
    return localStorage.getItem(CONSENT_KEY) !== null;
}

// Accept cookies
function acceptCookies() {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    localStorage.setItem(CONSENT_DATE_KEY, new Date().toISOString());
    hideBanner();
    initAnalyticsWithConsent();
}

// Decline cookies
function declineCookies() {
    localStorage.setItem(CONSENT_KEY, 'declined');
    localStorage.setItem(CONSENT_DATE_KEY, new Date().toISOString());
    hideBanner();
}

// Show the banner
function showBanner() {
    const banner = document.getElementById('cookieConsent');
    if (banner) {
        banner.classList.add('visible');
    }
}

// Hide the banner
function hideBanner() {
    const banner = document.getElementById('cookieConsent');
    if (banner) {
        banner.classList.remove('visible');
    }
}

// Create and inject the banner HTML
function createBanner() {
    const banner = document.createElement('div');
    banner.id = 'cookieConsent';
    banner.className = 'cookie-consent';
    banner.innerHTML = `
        <div class="cookie-consent-content">
            <div class="cookie-consent-text">
                <h4>We value your privacy</h4>
                <p>We use cookies to enhance your browsing experience, analyze site traffic, and personalize content.
                   By clicking "Accept All", you consent to our use of cookies.
                   <a href="/privacy-policy.html" target="_blank">Privacy Policy</a></p>
            </div>
            <div class="cookie-consent-actions">
                <button class="cookie-btn cookie-btn-decline" id="cookieDecline">Decline</button>
                <button class="cookie-btn cookie-btn-accept" id="cookieAccept">Accept All</button>
            </div>
        </div>
    `;
    document.body.appendChild(banner);

    // Attach event listeners
    document.getElementById('cookieAccept').addEventListener('click', acceptCookies);
    document.getElementById('cookieDecline').addEventListener('click', declineCookies);
}

// Initialize cookie consent
function initCookieConsent() {
    createBanner();

    // Show banner if no choice has been made
    if (!hasChoice()) {
        // Delay showing banner for better UX
        setTimeout(showBanner, 2000);
    } else if (hasConsent()) {
        // If already consented, initialize analytics
        initAnalyticsWithConsent();
    }
}

export { initCookieConsent, hasConsent, acceptCookies, declineCookies };
