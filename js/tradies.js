/* ========================================
   ONIX TRADIES - JAVASCRIPT
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
    const hoverElements = document.querySelectorAll('a, button, .magnetic, .hero-card, .trade-card-wrapper, .bento-card, .window-card, .emergency-card');
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

    // Add scrolled class after scrolling past hero area
    if (currentScrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Smart hide/show based on scroll direction
    if (currentScrollY > 200) {
        if (lastScrollY < currentScrollY && currentScrollY - lastScrollY > 10) {
            // Scrolling down - hide navbar
            navbar.classList.add('hidden');
        } else if (lastScrollY > currentScrollY && lastScrollY - currentScrollY > 10) {
            // Scrolling up - show navbar
            navbar.classList.remove('hidden');
        }
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
function splitWordsToChars(container) {
    const words = container.querySelectorAll('.word');
    const allChars = [];

    words.forEach((word, wordIndex) => {
        const text = word.textContent;
        const isHighlight = word.closest('.highlight') !== null || word.classList.contains('highlight');
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

    // Make hero-subtitle visible first
    if (heroSubtitle) {
        heroSubtitle.style.opacity = '1';
    }

    // Split title words into characters
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

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.3 });

    // Initial states - set immediately
    gsap.set('.hero-badge', { opacity: 0, y: 20 });
    gsap.set(allChars, { opacity: 0, y: 50, rotateX: -90 });
    gsap.set(subtitleWords, { opacity: 0, y: 15 });
    gsap.set('.hero-actions', { opacity: 1 }); // Make container visible
    gsap.set('.hero-actions .btn-primary', { opacity: 0, scale: 0.9, filter: 'blur(8px)' });
    gsap.set('.hero-actions .btn-ghost', { opacity: 0, scale: 0.9, filter: 'blur(8px)' });
    gsap.set('.hero-trust', { opacity: 0, y: 20 });
    gsap.set('.hero-stats-grid', { opacity: 1 }); // Make container visible
    gsap.set('.hero-card', { opacity: 0, y: 60 });
    gsap.set('.scroll-indicator', { opacity: 0 });

    // Animation sequence
    tl
        .to('.hero-badge', { opacity: 1, y: 0, duration: 0.8 }, 0)
        .to(allChars, {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.8,
            stagger: 0.02,
            ease: 'back.out(1.7)'
        }, 0.2)
        .to(subtitleWords, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.04,
            ease: 'power3.out'
        }, 1.0)
        .to('.hero-actions .btn-primary', {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.8,
            ease: 'power2.out'
        }, 1.6)
        .to('.hero-actions .btn-ghost', {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.8,
            ease: 'power2.out'
        }, 1.75)
        .to('.hero-trust', { opacity: 1, y: 0, duration: 0.5 }, 1.9)
        .to('.hero-card', {
            opacity: 1,
            y: 0,
            duration: 1.2,
            stagger: 0.15,
            ease: 'power3.out'
        }, 1.8)
        .to('.scroll-indicator', { opacity: 1, duration: 0.8 }, 2.6);
}

// ========== COUNTER ANIMATION ==========
function animateCounter(element) {
    const target = element.dataset.target;
    const prefix = element.dataset.prefix || '';
    const suffix = element.dataset.suffix || '';
    const text = element.dataset.text;

    if (text) {
        // For text values like "$25–$55"
        gsap.to(element, {
            duration: 0.5,
            onComplete: () => {
                element.textContent = text;
            }
        });
        return;
    }

    if (!target) return;

    const targetNum = parseFloat(target);
    const decimals = target.includes('.') ? target.split('.')[1].length : 0;
    const duration = 1.5;

    gsap.to(element, {
        duration: duration,
        innerHTML: targetNum,
        snap: { innerHTML: decimals ? 0.1 : 1 },
        ease: 'power2.out',
        onUpdate: function() {
            const current = parseFloat(element.innerHTML) || 0;
            element.innerHTML = prefix + current.toFixed(decimals) + suffix;
        },
        onComplete: function() {
            element.innerHTML = prefix + targetNum.toFixed(decimals) + suffix;
        }
    });
}

// ========== TYPEWRITER EFFECT ==========
function typewriterEffect(element, text, speed = 30) {
    const textElement = element.querySelector('.typewriter-text');
    if (!textElement) return;

    let i = 0;
    textElement.textContent = '';

    function type() {
        if (i < text.length) {
            textElement.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

// ========== BENTO CARD TILT ==========
function initBentoTilt() {
    const cards = document.querySelectorAll('[data-tilt]');

    cards.forEach(card => {
        const ray = card.querySelector('.bento-card-ray');

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            gsap.to(card, {
                rotateX: rotateX,
                rotateY: rotateY,
                duration: 0.3,
                ease: 'power2.out',
                transformPerspective: 1000
            });

            if (ray) {
                gsap.to(ray, {
                    left: x,
                    top: y,
                    duration: 0.1
                });
            }
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

// ========== SCROLL ANIMATIONS ==========
function initScrollAnimations() {
    // Section title animations
    document.querySelectorAll('.section-title').forEach(title => {
        const words = title.querySelectorAll('.word');
        if (words.length === 0) return;

        gsap.set(words, { opacity: 0, y: 30, rotateX: -40 });

        ScrollTrigger.create({
            trigger: title,
            start: 'top 80%',
            onEnter: () => {
                gsap.to(words, {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    duration: 0.8,
                    stagger: 0.05,
                    ease: 'back.out(1.5)'
                });
            },
            once: true
        });
    });

    // Problem cards
    gsap.set('.problem-card', { opacity: 0, y: 40 });
    ScrollTrigger.create({
        trigger: '.problem-grid',
        start: 'top 75%',
        onEnter: () => {
            gsap.to('.problem-card', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out'
            });
        },
        once: true
    });

    // Solution banner
    gsap.set('.solution-banner', { opacity: 0, y: 40 });
    ScrollTrigger.create({
        trigger: '.solution-banner',
        start: 'top 80%',
        onEnter: () => {
            gsap.to('.solution-banner', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power3.out'
            });
        },
        once: true
    });

    // Pipeline steps
    gsap.set('.pipeline-step', { opacity: 0, y: 40 });
    gsap.set('.pipeline-arrow', { opacity: 0 });
    ScrollTrigger.create({
        trigger: '.pipeline-flow',
        start: 'top 75%',
        onEnter: () => {
            gsap.to('.pipeline-step', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: 'power3.out'
            });
            gsap.to('.pipeline-arrow', {
                opacity: 1,
                duration: 0.5,
                delay: 0.4
            });
        },
        once: true
    });

    // Typewriter for How section
    const typewriterElement = document.querySelector('.how-section .typewriter');
    if (typewriterElement) {
        ScrollTrigger.create({
            trigger: typewriterElement,
            start: 'top 80%',
            onEnter: () => {
                const text = typewriterElement.dataset.typewriter;
                if (text) typewriterEffect(typewriterElement, text);
            },
            once: true
        });
    }

    // Trade cards
    gsap.set('.trade-card-wrapper', { opacity: 0, y: 40 });
    ScrollTrigger.create({
        trigger: '.trades-grid',
        start: 'top 75%',
        onEnter: () => {
            gsap.to('.trade-card-wrapper', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.08,
                ease: 'power3.out'
            });
        },
        once: true
    });

    // Emergency cards
    gsap.set('.emergency-card', { opacity: 0, y: 40, scale: 0.95 });
    ScrollTrigger.create({
        trigger: '.emergency-grid',
        start: 'top 75%',
        onEnter: () => {
            gsap.to('.emergency-card', {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                stagger: 0.1,
                ease: 'back.out(1.5)'
            });
        },
        once: true
    });

    // Bento cards
    gsap.set('.bento-card', { opacity: 0, y: 40 });
    ScrollTrigger.create({
        trigger: '.results-grid',
        start: 'top 75%',
        onEnter: () => {
            gsap.to('.bento-card', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.12,
                ease: 'power3.out'
            });

            // Animate counters
            document.querySelectorAll('.bento-num[data-target], .bento-num[data-text]').forEach(counter => {
                animateCounter(counter);
            });
        },
        once: true
    });

    // Hero counters (on page load)
    document.querySelectorAll('.hero-count').forEach(counter => {
        setTimeout(() => animateCounter(counter), 2500);
    });

    // Region cards
    gsap.set('.region-card', { opacity: 0, y: 30 });
    ScrollTrigger.create({
        trigger: '.regions-grid',
        start: 'top 80%',
        onEnter: () => {
            gsap.to('.region-card', {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.08,
                ease: 'power3.out'
            });
        },
        once: true
    });

    // CTA section
    gsap.set('.cta-content', { opacity: 0, y: 40 });
    gsap.set('.cta-visual', { opacity: 0, y: 40 });
    ScrollTrigger.create({
        trigger: '.cta-section',
        start: 'top 75%',
        onEnter: () => {
            gsap.to('.cta-content', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power3.out'
            });
            gsap.to('.cta-visual', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                delay: 0.2,
                ease: 'power3.out'
            });
        },
        once: true
    });
}

// ========== TESTIMONIALS TICKER ==========
function initTestimonialsTicker() {
    const track = document.getElementById('testimonialTrack');
    if (!track) return;

    // Duplicate content for seamless loop
    track.innerHTML += track.innerHTML;
}

// ========== CTA STARS ==========
function initCtaStars() {
    const starsContainer = document.querySelector('.cta-stars');
    if (!starsContainer) return;

    for (let i = 0; i < 60; i++) {
        const star = document.createElement('div');
        star.style.cssText = `
            position: absolute;
            width: ${Math.random() * 2 + 1}px;
            height: ${Math.random() * 2 + 1}px;
            background: white;
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            opacity: ${Math.random() * 0.5 + 0.2};
            animation: twinkle ${Math.random() * 3 + 2}s ease-in-out infinite;
            animation-delay: ${Math.random() * 2}s;
        `;
        starsContainer.appendChild(star);
    }

    // Add twinkle animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes twinkle {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.2); }
        }
    `;
    document.head.appendChild(style);
}

// ========== FORM HANDLING ==========
function initFormHandler() {
    const form = document.getElementById('ctaForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('.form-submit');
        const originalText = submitBtn.innerHTML;

        // Show loading state
        submitBtn.innerHTML = '<span>Sending...</span>';
        submitBtn.disabled = true;

        const formData = {
            name: document.getElementById('ctaName')?.value,
            phone: document.getElementById('ctaPhone')?.value,
            email: document.getElementById('ctaEmail')?.value,
            trade: document.getElementById('ctaTrade')?.value,
            region: document.getElementById('ctaRegion')?.value,
            source: 'tradies-page'
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
                // Success
                submitBtn.innerHTML = '<span>Sent!</span>';
                submitBtn.style.background = '#22c55e';
                form.reset();

                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 3000);
            } else {
                throw new Error('Failed to submit');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            submitBtn.innerHTML = '<span>Error - Try Again</span>';
            submitBtn.style.background = '#ef4444';

            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
            }, 3000);
        }
    });
}

// ========== MINI DASHBOARD ANIMATION ==========
function initMiniDashboard() {
    const bars = document.querySelectorAll('.mini-bar');
    if (!bars.length) return;

    // Initial state
    bars.forEach(bar => {
        const height = bar.style.height;
        bar.dataset.height = height;
        bar.style.height = '0%';
    });

    ScrollTrigger.create({
        trigger: '.mini-dashboard',
        start: 'top 80%',
        onEnter: () => {
            bars.forEach((bar, i) => {
                gsap.to(bar, {
                    height: bar.dataset.height,
                    duration: 0.8,
                    delay: i * 0.1,
                    ease: 'power3.out'
                });
            });
        },
        once: true
    });
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure GSAP is ready
    setTimeout(() => {
        initHeroAnimations();
        initBentoTilt();
        initScrollAnimations();
        initTestimonialsTicker();
        initCtaStars();
        initFormHandler();
        initMiniDashboard();
    }, 100);
});

// Fallback: if animations fail, show elements after 3 seconds
setTimeout(() => {
    document.querySelectorAll('.hero-badge, .hero-title .word, .hero-subtitle, .hero-actions, .hero-trust, .hero-stats-grid, .hero-card, .scroll-indicator').forEach(el => {
        if (el.style.opacity === '0' || getComputedStyle(el).opacity === '0') {
            el.style.opacity = '1';
            el.style.transform = 'none';
        }
    });
}, 3000);
