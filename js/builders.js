/* ========================================
   MRQ BUILDERS - JAVASCRIPT
   Animations & Interactions
======================================== */

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// ========== CURSOR ==========
const cursor = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');

if (cursor && cursorFollower) {
    document.addEventListener('mousemove', (e) => {
        gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
        gsap.to(cursorFollower, { x: e.clientX, y: e.clientY, duration: 0.3 });
    });

    // Hover effects
    const hoverElements = document.querySelectorAll('a, button, .magnetic, .hero-card, .job-card-wrapper, .bento-card, .window-card');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hovering');
            cursorFollower.classList.add('hovering');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hovering');
            cursorFollower.classList.remove('hovering');
        });
    });
}

// ========== NAVBAR ==========
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

let lastScrollY = window.scrollY;
let ticking = false;

function updateNavbar() {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY && currentScrollY > 100) {
        navbar.classList.add('hidden');
    } else {
        navbar.classList.remove('hidden');
    }

    lastScrollY = currentScrollY;
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(updateNavbar);
        ticking = true;
    }
});

// Mobile menu toggle
if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            gsap.to(window, {
                duration: 1,
                scrollTo: { y: target, offsetY: 80 },
                ease: 'power3.inOut'
            });
        }
    });
});

// ========== MAGNETIC BUTTONS ==========
const magneticElements = document.querySelectorAll('.magnetic');

magneticElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(el, {
            x: x * 0.3,
            y: y * 0.3,
            duration: 0.3,
            ease: 'power2.out'
        });
    });

    el.addEventListener('mouseleave', () => {
        gsap.to(el, {
            x: 0,
            y: 0,
            duration: 0.3,
            ease: 'power2.out'
        });
    });
});

// ========== SPLIT TEXT HELPER ==========
// Split word elements into characters (keeps words together, won't break mid-word)
function splitWordsToChars(container) {
    const words = container.querySelectorAll('.word');
    const allChars = [];

    words.forEach((word, wordIndex) => {
        const text = word.textContent;
        const isHighlight = word.closest('.highlight') !== null;
        word.innerHTML = '';

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char;
            if (isHighlight) span.classList.add('highlight-char');
            word.appendChild(span);
            allChars.push(span);
        }

        // Add space after each word (except last in line)
        if (wordIndex < words.length - 1) {
            const spaceSpan = document.createElement('span');
            spaceSpan.className = 'char space';
            spaceSpan.innerHTML = '&nbsp;';
            word.appendChild(spaceSpan);
        }
    });

    return allChars;
}

// Split subtitle text while preserving highlight spans
function splitSubtitleToWords(element) {
    const processNode = (node) => {
        if (node.nodeType === 3) { // Text node
            return node.textContent.split(' ').filter(w => w).map(word =>
                `<span class="subtitle-word">${word}</span>`
            ).join(' ');
        } else if (node.nodeType === 1 && node.classList.contains('hero-highlight')) {
            const words = node.textContent.split(' ').filter(w => w).map(word =>
                `<span class="subtitle-word">${word}</span>`
            ).join(' ');
            return `<span class="hero-highlight">${words}</span>`;
        } else if (node.nodeType === 1) {
            return node.outerHTML;
        }
        return '';
    };

    let newHTML = '';
    element.childNodes.forEach(node => {
        newHTML += processNode(node) + ' ';
    });
    element.innerHTML = newHTML.trim();

    return element.querySelectorAll('.subtitle-word');
}

// ========== HERO ANIMATIONS ==========
function initHeroAnimations() {
    const heroTitle = document.getElementById('heroTitle');
    const heroSubtitle = document.getElementById('heroSubtitle');
    if (!heroTitle) return;

    // Split title words into characters (keeps words intact)
    const titleLines = heroTitle.querySelectorAll('.title-line');
    const allChars = [];

    titleLines.forEach(line => {
        const chars = splitWordsToChars(line);
        chars.forEach(char => allChars.push(char));
    });

    // Split subtitle into words
    let subtitleWords = [];
    if (heroSubtitle) {
        subtitleWords = splitSubtitleToWords(heroSubtitle);
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Initial states
    gsap.set('.hero-badge', { opacity: 0, y: 20 });
    gsap.set(allChars, { opacity: 0, y: 50, rotateX: -90 });
    gsap.set(subtitleWords, { opacity: 0, y: 15 });
    gsap.set('.hero-actions .btn-primary', { opacity: 0, scale: 0.9, filter: 'blur(8px)' });
    gsap.set('.hero-actions .btn-ghost', { opacity: 0, scale: 0.9, filter: 'blur(8px)' });
    gsap.set('.hero-trust', { opacity: 0, y: 20 });
    gsap.set('.hero-card', { opacity: 0, y: 60 });
    gsap.set('.scroll-indicator', { opacity: 0 });

    // Animation sequence
    tl
        // Badge
        .to('.hero-badge', { opacity: 1, y: 0, duration: 0.8 }, 0.2)

        // Title characters - smooth staggered 3D rotation reveal
        .to(allChars, {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.8,
            stagger: 0.02,
            ease: 'back.out(1.7)'
        }, 0.4)

        // Subtitle words - word by word smooth fade
        .to(subtitleWords, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.04,
            ease: 'power3.out'
        }, 1.4)

        // Primary button - blur + scale animation
        .to('.hero-actions .btn-primary', {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.8,
            ease: 'power2.out'
        }, 2.0)

        // Ghost button - blur + scale animation with slight delay
        .to('.hero-actions .btn-ghost', {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.8,
            ease: 'power2.out'
        }, 2.15)

        // Trust items
        .to('.hero-trust', { opacity: 1, y: 0, duration: 0.5 }, 2.3)

        // Hero cards - appear from below slowly and smoothly
        .to('.hero-card', {
            opacity: 1,
            y: 0,
            duration: 1.2,
            stagger: 0.15,
            ease: 'power3.out'
        }, 2.2)

        // Scroll indicator
        .to('.scroll-indicator', { opacity: 1, duration: 0.8 }, 3.0);
}

// ========== COUNTER ANIMATION ==========
function animateCounter(element) {
    const target = element.dataset.target;
    const prefix = element.dataset.prefix || '';
    const suffix = element.dataset.suffix || '';
    const text = element.dataset.text;

    if (text) {
        // For text values like "24hrs"
        gsap.to(element, {
            duration: 0.5,
            onComplete: () => {
                element.textContent = text;
            }
        });
    } else if (target) {
        const targetNum = parseFloat(target);
        const decimals = target.includes('.') ? target.split('.')[1].length : 0;

        gsap.to(element, {
            duration: 2,
            ease: 'power2.out',
            onUpdate: function() {
                const progress = this.progress();
                const current = targetNum * progress;
                element.textContent = prefix + current.toFixed(decimals) + suffix;
            }
        });
    }
}

// Initialize counters on scroll
document.querySelectorAll('.hero-count, .bento-num[data-target]').forEach(counter => {
    ScrollTrigger.create({
        trigger: counter,
        start: 'top 80%',
        once: true,
        onEnter: () => animateCounter(counter)
    });
});

// ========== SECTION TITLE ANIMATIONS ==========
function initSectionTitleAnimations() {
    document.querySelectorAll('.section-title').forEach(title => {
        const words = title.querySelectorAll('.word');

        if (words.length > 0) {
            gsap.set(words, { opacity: 0, y: 30, rotateX: -40 });

            ScrollTrigger.create({
                trigger: title,
                start: 'top 80%',
                once: true,
                onEnter: () => {
                    gsap.to(words, {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        duration: 0.8,
                        stagger: 0.05,
                        ease: 'back.out(1.7)'
                    });
                }
            });
        }
    });
}

// ========== CARD ANIMATIONS ==========
function initCardAnimations() {
    // Problem cards
    gsap.set('.problem-card', { opacity: 0, y: 40 });
    ScrollTrigger.create({
        trigger: '.problem-grid',
        start: 'top 80%',
        once: true,
        onEnter: () => {
            gsap.to('.problem-card', {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power3.out'
            });
        }
    });

    // Solution box
    gsap.set('.problem-solution', { opacity: 0, y: 30, scale: 0.98 });
    ScrollTrigger.create({
        trigger: '.problem-solution',
        start: 'top 85%',
        once: true,
        onEnter: () => {
            gsap.to('.problem-solution', {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
                ease: 'power3.out'
            });
        }
    });

    // Pipeline window cards
    gsap.set('.pipeline-step', { opacity: 0, y: 60 });
    gsap.set('.pipeline-arrow', { opacity: 0, scale: 0.5 });

    // Inner elements - sweep from left
    gsap.set('.field-row', { opacity: 0, x: -40 });
    gsap.set('.form-status', { opacity: 0, x: -40 });
    gsap.set('.builder-row', { opacity: 0, x: 40 });
    gsap.set('.win-celebration', { opacity: 0, x: -100 });
    gsap.set('.win-details', { opacity: 0, x: -120 });
    gsap.set('.win-cta-mock', { opacity: 0, x: -150 });

    ScrollTrigger.create({
        trigger: '.pipeline-flow',
        start: 'top 75%',
        once: true,
        onEnter: () => {
            // Animate window cards with stagger
            gsap.to('.pipeline-step', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: 'power3.out'
            });

            // Animate arrows after cards
            gsap.to('.pipeline-arrow', {
                opacity: 0.5,
                scale: 1,
                duration: 0.5,
                stagger: 0.2,
                delay: 0.4,
                ease: 'back.out(1.4)'
            });

            // Card 1: Form fields sweep from left
            gsap.to('.field-row', {
                opacity: 1,
                x: 0,
                duration: 0.6,
                stagger: 0.1,
                delay: 0.5,
                ease: 'power3.out'
            });
            gsap.to('.form-status', {
                opacity: 1,
                x: 0,
                duration: 0.5,
                delay: 1,
                ease: 'power3.out'
            });

            // Card 2: Builder rows sweep from right
            gsap.to('.builder-row', {
                opacity: 1,
                x: 0,
                duration: 0.6,
                stagger: 0.12,
                delay: 0.7,
                ease: 'power3.out'
            });

            // Card 3: Win elements - smooth sweep from far left
            gsap.to('.win-celebration', {
                opacity: 1,
                x: 0,
                duration: 1,
                delay: 0.9,
                ease: 'power4.out'
            });
            gsap.to('.win-details', {
                opacity: 1,
                x: 0,
                duration: 1.1,
                delay: 1.1,
                ease: 'power4.out'
            });
            gsap.to('.win-cta-mock', {
                opacity: 1,
                x: 0,
                duration: 1.2,
                delay: 1.4,
                ease: 'power4.out'
            });
        }
    });

    // Job cards
    gsap.set('.job-card-wrapper', { opacity: 0, y: 40 });
    ScrollTrigger.create({
        trigger: '.jobs-grid',
        start: 'top 80%',
        once: true,
        onEnter: () => {
            gsap.to('.job-card-wrapper', {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power3.out'
            });
        }
    });

    // Bento cards
    gsap.set('.bento-card', { opacity: 0, y: 30, scale: 0.95 });
    ScrollTrigger.create({
        trigger: '.results-bento',
        start: 'top 80%',
        once: true,
        onEnter: () => {
            gsap.to('.bento-card', {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                stagger: 0.08,
                ease: 'power3.out'
            });
        }
    });

    // Region cards
    gsap.set('.region-card', { opacity: 0, y: 20 });
    ScrollTrigger.create({
        trigger: '.regions-grid',
        start: 'top 85%',
        once: true,
        onEnter: () => {
            gsap.to('.region-card', {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.05,
                ease: 'power3.out'
            });
        }
    });

    // Pricing card
    gsap.set('.pricing-card', { opacity: 0, y: 40, scale: 0.95 });
    ScrollTrigger.create({
        trigger: '.pricing-card',
        start: 'top 80%',
        once: true,
        onEnter: () => {
            gsap.to('.pricing-card', {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
                ease: 'back.out(1.4)'
            });
        }
    });

    // CTA section
    gsap.set('.cta-content > *', { opacity: 0, y: 30 });
    gsap.set('.visual-card', { opacity: 0, x: 50 });

    ScrollTrigger.create({
        trigger: '.cta-section',
        start: 'top 70%',
        once: true,
        onEnter: () => {
            gsap.to('.cta-content > *', {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power3.out'
            });
            gsap.to('.visual-card', {
                opacity: 1,
                x: 0,
                duration: 0.8,
                delay: 0.3,
                ease: 'power3.out'
            });
        }
    });
}

// ========== TESTIMONIAL TICKER ==========
function initTestimonialTicker() {
    const track = document.getElementById('testimonialTrack');
    if (!track) return;

    // Clone cards for infinite scroll
    const cards = track.querySelectorAll('.review-card');
    cards.forEach(card => {
        const clone = card.cloneNode(true);
        track.appendChild(clone);
    });
}

// ========== CARD TILT EFFECT ==========
function initTiltEffect() {
    // Hero cards tilt effect
    const heroCards = document.querySelectorAll('.hero-card');

    heroCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 15;
            const rotateY = (centerX - x) / 15;

            gsap.to(card, {
                rotateX: -rotateX,
                rotateY: rotateY,
                transformPerspective: 1000,
                transformOrigin: 'center center',
                duration: 0.4,
                ease: 'power2.out'
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                scale: 1,
                duration: 0.6,
                ease: 'power2.out'
            });
        });
    });

    // Other cards with data-tilt attribute
    const tiltCards = document.querySelectorAll('[data-tilt]');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            gsap.to(card, {
                rotateX: -rotateX,
                rotateY: rotateY,
                transformPerspective: 1000,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.5,
                ease: 'power2.out'
            });
        });
    });
}

// ========== WIN BAR ANIMATION ==========
function initWinBarAnimation() {
    const winBars = document.querySelectorAll('.win-fill');

    winBars.forEach(bar => {
        gsap.set(bar, { width: '0%' });

        ScrollTrigger.create({
            trigger: bar,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                gsap.to(bar, {
                    width: '33%',
                    duration: 1.5,
                    ease: 'power3.out'
                });
            }
        });
    });
}

// ========== FORM HANDLING ==========
const ctaForm = document.getElementById('ctaForm');

if (ctaForm) {
    ctaForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = ctaForm.querySelector('.form-submit');
        const originalText = submitBtn.innerHTML;

        // Show loading state
        submitBtn.innerHTML = '<span>Submitting...</span>';
        submitBtn.disabled = true;

        const formData = {
            name: document.getElementById('ctaName').value,
            phone: document.getElementById('ctaPhone').value,
            email: document.getElementById('ctaEmail').value,
            region: document.getElementById('ctaRegion').value,
            source: 'MRQ Builders Page',
            industry: 'builders'
        };

        try {
            const response = await fetch('/api/webhook/lead', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                // Success state
                submitBtn.innerHTML = '<span>Thanks! We\'ll be in touch</span>';
                submitBtn.style.background = '#34a853';
                ctaForm.reset();

                // Reset button after 3 seconds
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 3000);
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            submitBtn.innerHTML = '<span>Error - Try Again</span>';
            submitBtn.style.background = '#ea4335';

            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
            }, 3000);
        }
    });
}

// ========== PARALLAX EFFECTS ==========
function initParallax() {
    gsap.to('.hero-glow-1', {
        y: 100,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
        }
    });

    gsap.to('.hero-glow-2', {
        y: -50,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
        }
    });
}

// ========== INITIALIZE ==========
document.addEventListener('DOMContentLoaded', () => {
    initHeroAnimations();
    initSectionTitleAnimations();
    initCardAnimations();
    initTestimonialTicker();
    initTiltEffect();
    initWinBarAnimation();
    initParallax();
});
