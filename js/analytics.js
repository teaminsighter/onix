/**
 * ONIX Analytics Module
 * Handles GA4, GTM, Facebook Pixel, and custom event tracking
 *
 * CONFIGURATION: Update the IDs below before going to production
 */

// ============ CONFIGURATION ============
// Replace these with your actual tracking IDs
const ANALYTICS_CONFIG = {
    // Google Analytics 4
    GA4_MEASUREMENT_ID: 'G-XXXXXXXXXX', // Replace with your GA4 ID

    // Google Tag Manager
    GTM_CONTAINER_ID: 'GTM-XXXXXXX', // Replace with your GTM ID

    // Facebook Pixel
    FB_PIXEL_ID: 'XXXXXXXXXXXXXXXX', // Replace with your FB Pixel ID

    // Microsoft Clarity
    CLARITY_PROJECT_ID: 'xxxxxxxxxx', // Replace with your Clarity ID

    // Enable/disable tracking (useful for development)
    ENABLED: true,
    DEBUG: false
};

// ============ GOOGLE TAG MANAGER ============
function initGTM() {
    if (!ANALYTICS_CONFIG.ENABLED || ANALYTICS_CONFIG.GTM_CONTAINER_ID === 'GTM-XXXXXXX') {
        if (ANALYTICS_CONFIG.DEBUG) console.log('[Analytics] GTM not configured');
        return;
    }

    // GTM Script
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer', ANALYTICS_CONFIG.GTM_CONTAINER_ID);

    if (ANALYTICS_CONFIG.DEBUG) console.log('[Analytics] GTM initialized');
}

// ============ GOOGLE ANALYTICS 4 ============
function initGA4() {
    if (!ANALYTICS_CONFIG.ENABLED || ANALYTICS_CONFIG.GA4_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
        if (ANALYTICS_CONFIG.DEBUG) console.log('[Analytics] GA4 not configured');
        return;
    }

    // Load gtag.js
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.GA4_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize dataLayer and gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', ANALYTICS_CONFIG.GA4_MEASUREMENT_ID, {
        page_title: document.title,
        page_location: window.location.href
    });

    if (ANALYTICS_CONFIG.DEBUG) console.log('[Analytics] GA4 initialized');
}

// ============ FACEBOOK PIXEL ============
function initFBPixel() {
    if (!ANALYTICS_CONFIG.ENABLED || ANALYTICS_CONFIG.FB_PIXEL_ID === 'XXXXXXXXXXXXXXXX') {
        if (ANALYTICS_CONFIG.DEBUG) console.log('[Analytics] FB Pixel not configured');
        return;
    }

    // Facebook Pixel Code
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');

    fbq('init', ANALYTICS_CONFIG.FB_PIXEL_ID);
    fbq('track', 'PageView');

    if (ANALYTICS_CONFIG.DEBUG) console.log('[Analytics] FB Pixel initialized');
}

// ============ MICROSOFT CLARITY ============
function initClarity() {
    if (!ANALYTICS_CONFIG.ENABLED || ANALYTICS_CONFIG.CLARITY_PROJECT_ID === 'xxxxxxxxxx') {
        if (ANALYTICS_CONFIG.DEBUG) console.log('[Analytics] Clarity not configured');
        return;
    }

    // Microsoft Clarity Code
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", ANALYTICS_CONFIG.CLARITY_PROJECT_ID);

    if (ANALYTICS_CONFIG.DEBUG) console.log('[Analytics] Clarity initialized');
}

// ============ CUSTOM EVENT TRACKING ============
const Analytics = {
    // Track custom events
    trackEvent(eventName, parameters = {}) {
        if (!ANALYTICS_CONFIG.ENABLED) return;

        // GA4 Event
        if (window.gtag) {
            gtag('event', eventName, parameters);
        }

        // FB Pixel Event
        if (window.fbq) {
            fbq('trackCustom', eventName, parameters);
        }

        // GTM DataLayer
        if (window.dataLayer) {
            dataLayer.push({
                event: eventName,
                ...parameters
            });
        }

        if (ANALYTICS_CONFIG.DEBUG) {
            console.log('[Analytics] Event tracked:', eventName, parameters);
        }
    },

    // Track form submissions
    trackFormSubmit(formName, formData = {}) {
        this.trackEvent('form_submit', {
            form_name: formName,
            ...formData
        });

        // FB Pixel Lead event
        if (window.fbq) {
            fbq('track', 'Lead', { content_name: formName });
        }
    },

    // Track CTA clicks
    trackCTAClick(ctaName, destination = '') {
        this.trackEvent('cta_click', {
            cta_name: ctaName,
            destination: destination
        });
    },

    // Track page sections viewed
    trackSectionView(sectionName) {
        this.trackEvent('section_view', {
            section_name: sectionName
        });
    },

    // Track GHL booking interactions
    trackBookingEvent(eventType) {
        this.trackEvent('booking_interaction', {
            event_type: eventType
        });

        if (eventType === 'scheduled' && window.fbq) {
            fbq('track', 'Schedule');
        }
    },

    // Track industry tab switches
    trackIndustrySwitch(industry) {
        this.trackEvent('industry_switch', {
            industry: industry
        });
    },

    // Track scroll depth
    trackScrollDepth(percentage) {
        this.trackEvent('scroll_depth', {
            percentage: percentage
        });
    }
};

// ============ AUTO-TRACK SETUP ============
function setupAutoTracking() {
    // Track CTA button clicks
    document.querySelectorAll('.btn-primary, .btn-secondary, .nav-cta').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const ctaText = btn.textContent.trim();
            const href = btn.getAttribute('href') || '';
            Analytics.trackCTAClick(ctaText, href);
        });
    });

    // Track industry tab switches
    document.querySelectorAll('.ind-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const industry = tab.dataset.ind;
            Analytics.trackIndustrySwitch(industry);
        });
    });

    // Track scroll depth milestones
    let scrollMilestones = [25, 50, 75, 100];
    let trackedMilestones = [];

    window.addEventListener('scroll', () => {
        const scrollPercent = Math.round(
            (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        );

        scrollMilestones.forEach(milestone => {
            if (scrollPercent >= milestone && !trackedMilestones.includes(milestone)) {
                trackedMilestones.push(milestone);
                Analytics.trackScrollDepth(milestone);
            }
        });
    });

    // Track section views with Intersection Observer
    const sections = document.querySelectorAll('section[id]');
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                Analytics.trackSectionView(entry.target.id);
            }
        });
    }, { threshold: 0.3 });

    sections.forEach(section => sectionObserver.observe(section));

    // Track GHL booking iframe events (postMessage from leadconnectorhq)
    window.addEventListener('message', (e) => {
        const ghlOrigins = ['https://api.leadconnectorhq.com', 'https://link.msgsndr.com', 'https://msgsndr.com'];
        if (!ghlOrigins.includes(e.origin)) return;

        const eventName = e.data?.event || e.data?.type || '';
        if (typeof eventName !== 'string') return;

        if (/scheduled|booked|confirmed/i.test(eventName)) {
            Analytics.trackBookingEvent('scheduled');
        } else if (/viewed|loaded/i.test(eventName)) {
            Analytics.trackBookingEvent('viewed');
        }
    });

    if (ANALYTICS_CONFIG.DEBUG) console.log('[Analytics] Auto-tracking setup complete');
}

// ============ CUSTOM HEADER SCRIPTS (from Admin Panel) ============
function loadCustomHeaderScripts() {
    // Try to fetch custom header scripts from admin panel
    // This works when admin is on same domain or when CORS is configured
    const adminUrl = window.ONIX_ADMIN_URL || '';
    const scriptUrl = adminUrl ? `${adminUrl}/api/webhook/header-scripts` : '/api/webhook/header-scripts';

    fetch(scriptUrl)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch');
            return response.text();
        })
        .then(scripts => {
            if (scripts && scripts.trim()) {
                // Create a container div and inject the scripts
                const container = document.createElement('div');
                container.innerHTML = scripts;

                // Move script elements to head to execute them
                container.querySelectorAll('script').forEach(script => {
                    const newScript = document.createElement('script');
                    if (script.src) {
                        newScript.src = script.src;
                        newScript.async = script.async;
                    } else {
                        newScript.textContent = script.textContent;
                    }
                    document.head.appendChild(newScript);
                });

                // Move non-script elements (like noscript, meta) to head
                container.querySelectorAll(':not(script)').forEach(el => {
                    document.head.appendChild(el.cloneNode(true));
                });

                if (ANALYTICS_CONFIG.DEBUG) console.log('[Analytics] Custom header scripts loaded');
            }
        })
        .catch(err => {
            // Silently fail - custom scripts are optional
            if (ANALYTICS_CONFIG.DEBUG) console.log('[Analytics] No custom header scripts:', err.message);
        });
}

// ============ INITIALIZATION ============
function initAnalytics() {
    // Load custom header scripts from admin panel (runs regardless of consent)
    loadCustomHeaderScripts();

    // Check for cookie consent before initializing tracking
    const hasConsent = localStorage.getItem('cookie_consent') === 'accepted';

    if (!hasConsent && ANALYTICS_CONFIG.ENABLED) {
        // Only initialize essential tracking, wait for consent for full tracking
        if (ANALYTICS_CONFIG.DEBUG) {
            console.log('[Analytics] Waiting for cookie consent');
        }
        return;
    }

    initGTM();
    initGA4();
    initFBPixel();
    initClarity();
    setupAutoTracking();

    if (ANALYTICS_CONFIG.DEBUG) console.log('[Analytics] All tracking initialized');
}

// Initialize after consent or if consent already given
function initAnalyticsWithConsent() {
    localStorage.setItem('cookie_consent', 'accepted');
    initGTM();
    initGA4();
    initFBPixel();
    initClarity();
    setupAutoTracking();
}

// Export for use in other modules
export {
    Analytics,
    initAnalytics,
    initAnalyticsWithConsent,
    ANALYTICS_CONFIG
};
