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
    // Select all titles that should animate
    const allTitles = document.querySelectorAll('.section-title, .cta-title, .guarantee-title');

    allTitles.forEach(title => {
        const words = title.querySelectorAll('.word');

        if (words.length > 0) {
            // Set initial state - hidden and slightly below
            gsap.set(words, {
                opacity: 0,
                y: 40,
                rotateX: -60,
                transformOrigin: 'center bottom'
            });

            ScrollTrigger.create({
                trigger: title,
                start: 'top 85%',
                once: true,
                onEnter: () => {
                    gsap.to(words, {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        duration: 1,
                        stagger: 0.08,
                        ease: 'power3.out'
                    });
                }
            });
        } else {
            // For titles without .word spans, animate the whole title
            gsap.set(title, {
                opacity: 0,
                y: 30
            });

            ScrollTrigger.create({
                trigger: title,
                start: 'top 85%',
                once: true,
                onEnter: () => {
                    gsap.to(title, {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: 'power3.out'
                    });
                }
            });
        }
    });
}

// ========== CARD ANIMATIONS ==========
function initCardAnimations() {
    // Section tags - sweep in from left
    gsap.set('.section-tag', { opacity: 0, x: -30 });
    document.querySelectorAll('.section-tag').forEach(tag => {
        ScrollTrigger.create({
            trigger: tag,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                gsap.to(tag, {
                    opacity: 1,
                    x: 0,
                    duration: 0.8,
                    ease: 'power3.out'
                });
            }
        });
    });

    // Problem cards - alternate left/right sweep
    const problemCards = document.querySelectorAll('.problem-card');
    problemCards.forEach((card, index) => {
        // Alternate: even from left, odd from right
        const fromX = index % 2 === 0 ? -150 : 150;
        gsap.set(card, { opacity: 0, x: fromX });
    });

    ScrollTrigger.create({
        trigger: '.problem-grid',
        start: 'top 80%',
        once: true,
        onEnter: () => {
            problemCards.forEach((card, index) => {
                gsap.to(card, {
                    opacity: 1,
                    x: 0,
                    duration: 1.2,
                    delay: index * 0.15,
                    ease: 'power2.out'
                });
            });
        }
    });

    // Solution box - smooth sweep animations from left/right
    const solutionBox = document.querySelector('.problem-solution');
    if (solutionBox) {
        const solutionBadge = solutionBox.querySelector('.solution-badge');
        const solutionHeadline = solutionBox.querySelector('.solution-headline');
        const solutionParagraphs = solutionBox.querySelectorAll('.solution-content > p');
        const solutionFeatures = solutionBox.querySelectorAll('.solution-feature');

        gsap.set(solutionBox, { opacity: 0 });
        gsap.set(solutionBadge, { opacity: 0, x: -100 });
        gsap.set(solutionHeadline, { opacity: 0, x: 150 });
        // Alternate paragraphs left/right
        solutionParagraphs.forEach((p, i) => {
            gsap.set(p, { opacity: 0, x: i % 2 === 0 ? -120 : 120 });
        });
        // Features from left
        solutionFeatures.forEach((f, i) => {
            gsap.set(f, { opacity: 0, x: -100 - (i * 20) });
        });

        ScrollTrigger.create({
            trigger: solutionBox,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                const tl = gsap.timeline();

                // Container fades in
                tl.to(solutionBox, {
                    opacity: 1,
                    duration: 0.5,
                    ease: 'power2.out'
                }, 0);

                // Badge sweeps in from left
                tl.to(solutionBadge, {
                    opacity: 1,
                    x: 0,
                    duration: 1.2,
                    ease: 'power2.out'
                }, 0.1);

                // Headline sweeps in from right
                tl.to(solutionHeadline, {
                    opacity: 1,
                    x: 0,
                    duration: 1.3,
                    ease: 'power2.out'
                }, 0.2);

                // Paragraphs sweep in alternating
                solutionParagraphs.forEach((p, i) => {
                    tl.to(p, {
                        opacity: 1,
                        x: 0,
                        duration: 1.1,
                        ease: 'power2.out'
                    }, 0.4 + (i * 0.15));
                });

                // Features sweep in from left with stagger
                tl.to(solutionFeatures, {
                    opacity: 1,
                    x: 0,
                    duration: 1,
                    stagger: 0.12,
                    ease: 'power2.out'
                }, 0.8);
            }
        });
    }

    // Typewriter animation for pipeline subtitle
    const typewriterEl = document.querySelector('.section-desc.typewriter');
    if (typewriterEl) {
        const text = typewriterEl.dataset.typewriter;
        const textSpan = typewriterEl.querySelector('.typewriter-text');
        let charIndex = 0;
        let typewriterStarted = false;

        ScrollTrigger.create({
            trigger: typewriterEl,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                if (typewriterStarted) return;
                typewriterStarted = true;

                const typeInterval = setInterval(() => {
                    if (charIndex < text.length) {
                        textSpan.textContent = text.substring(0, charIndex + 1);
                        charIndex++;
                    } else {
                        clearInterval(typeInterval);
                        // Hide cursor after typing
                        setTimeout(() => {
                            const cursor = typewriterEl.querySelector('.typewriter-cursor');
                            if (cursor) cursor.style.display = 'none';
                        }, 2000);
                    }
                }, 40);
            }
        });
    }

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

    // Bento cards - smooth staggered reveal with text animations
    const bentoLarge = document.querySelector('.bento-card.bento-large');
    const bentoDashboard = document.querySelector('.bento-card.bento-dashboard');
    const bentoSmall = document.querySelectorAll('.bento-card:not(.bento-large):not(.bento-dashboard)');
    const allStatCards = document.querySelectorAll('.bento-card:not(.bento-dashboard)');

    // Set initial states for cards
    if (bentoLarge) {
        gsap.set(bentoLarge, { opacity: 0, x: -60, scale: 0.95 });
    }
    if (bentoDashboard) {
        gsap.set(bentoDashboard, { opacity: 0, x: 60, scale: 0.95 });
    }
    gsap.set(bentoSmall, { opacity: 0, y: 50, scale: 0.9 });

    // Set initial states for inner text elements
    allStatCards.forEach(card => {
        const tag = card.querySelector('.bento-tag');
        const num = card.querySelector('.bento-num');
        const desc = card.querySelector('.bento-desc');

        if (tag) gsap.set(tag, { opacity: 0, x: -40 });
        if (num) gsap.set(num, { opacity: 0, y: 30, scale: 0.8 });
        if (desc) gsap.set(desc, { opacity: 0, y: 20 });
    });

    ScrollTrigger.create({
        trigger: '.results-bento',
        start: 'top 80%',
        once: true,
        onEnter: () => {
            const tl = gsap.timeline();

            // Large card slides in from left
            if (bentoLarge) {
                tl.to(bentoLarge, {
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    duration: 1,
                    ease: 'power3.out'
                }, 0);
            }

            // Dashboard slides in from right
            if (bentoDashboard) {
                tl.to(bentoDashboard, {
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    duration: 1,
                    ease: 'power3.out'
                }, 0.1);
            }

            // Small cards rise up with stagger
            tl.to(bentoSmall, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
                stagger: 0.12,
                ease: 'back.out(1.2)'
            }, 0.2);

            // Animate inner text elements for each stat card
            allStatCards.forEach((card, cardIndex) => {
                const tag = card.querySelector('.bento-tag');
                const num = card.querySelector('.bento-num');
                const desc = card.querySelector('.bento-desc');
                const baseDelay = 0.4 + (cardIndex * 0.15);

                // Tag sweeps in from left
                if (tag) {
                    tl.to(tag, {
                        opacity: 1,
                        x: 0,
                        duration: 0.8,
                        ease: 'power2.out'
                    }, baseDelay);
                }

                // Number scales up
                if (num) {
                    tl.to(num, {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.9,
                        ease: 'back.out(1.5)'
                    }, baseDelay + 0.15);
                }

                // Description fades up
                if (desc) {
                    tl.to(desc, {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: 'power2.out'
                    }, baseDelay + 0.3);
                }
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
                rotateX: -rotateX,
                rotateY: rotateY,
                transformPerspective: 1000,
                duration: 0.3,
                ease: 'power2.out'
            });

            // Update border glow position
            if (ray) {
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
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

// ========== SOLUTION IMAGE CAROUSEL ==========
function initSolutionCarousel() {
    const images = document.querySelectorAll('.solution-image');
    const dots = document.querySelectorAll('.solution-image-dots .dot');
    if (!images.length) return;

    let currentIndex = 0;
    let interval;
    const totalImages = images.length;

    function showImage(index) {
        // Remove all classes
        images.forEach((img, i) => {
            img.classList.remove('active', 'prev', 'next');
            if (i === index) {
                img.classList.add('active');
            } else if (i === (index - 1 + totalImages) % totalImages) {
                img.classList.add('prev');
            } else if (i === (index + 1) % totalImages) {
                img.classList.add('next');
            }
        });

        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });

        currentIndex = index;
    }

    function nextImage() {
        showImage((currentIndex + 1) % totalImages);
    }

    function startAutoplay() {
        interval = setInterval(nextImage, 3500);
    }

    function stopAutoplay() {
        clearInterval(interval);
    }

    // Click on dots
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            stopAutoplay();
            showImage(i);
            startAutoplay();
        });
    });

    // Pause on hover
    const container = document.querySelector('.solution-images');
    if (container) {
        container.addEventListener('mouseenter', stopAutoplay);
        container.addEventListener('mouseleave', startAutoplay);
    }

    // Initial state
    showImage(0);
    startAutoplay();
}

// ========== GUARANTEE CARDS SCROLL REVEAL ==========
function initGuaranteeAnimation() {
    const cards = document.querySelectorAll('.guarantee-card');
    const banner = document.querySelector('.guarantee-banner');
    if (!cards.length || !banner) return;

    // Set initial states - far outside positions
    gsap.set(cards[0], { opacity: 0, x: -250 }); // Left card - far left
    gsap.set(cards[1], { opacity: 0, y: 120 });  // Middle card - far below
    gsap.set(cards[2], { opacity: 0, x: 250 });  // Right card - far right

    ScrollTrigger.create({
        trigger: banner,
        start: "top 80%",
        once: true,
        onEnter: () => {
            // Timeline for coordinated smooth animation
            const tl = gsap.timeline();

            // All three animate together - slow and smooth
            tl.to(cards[0], {
                opacity: 1,
                x: 0,
                duration: 1.4,
                ease: "power2.out"
            }, 0)
            .to(cards[1], {
                opacity: 1,
                y: 0,
                duration: 1.5,
                ease: "power2.out"
            }, 0.15)
            .to(cards[2], {
                opacity: 1,
                x: 0,
                duration: 1.4,
                ease: "power2.out"
            }, 0);

            // Add revealed class after animation completes
            cards.forEach((card, i) => {
                setTimeout(() => {
                    card.classList.add('revealed');
                }, i * 150 + 800);
            });
        }
    });
}

// ========== GUARANTEE 3D TILT ==========
function initGuaranteeTilt() {
    const stage = document.querySelector('.guarantee-stage');
    if (!stage) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    // Only run on devices with hover-capable pointers
    if (!window.matchMedia('(hover: hover)').matches) return;

    const maxTilt = 6; // degrees — keep subtle on a wide card

    stage.addEventListener('mousemove', (e) => {
        const rect = stage.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        // Normalize to -1..1, then scale to maxTilt. Card tilts AWAY from cursor.
        const rotateY = -((x - cx) / cx) * maxTilt;       // cursor right -> right edge recedes, left forward
        const rotateX = -((y - cy) / cy) * maxTilt;       // cursor down  -> bottom edge recedes, top forward

        gsap.to(stage, {
            rotateX,
            rotateY,
            transformPerspective: 1400,
            transformOrigin: 'center center',
            duration: 0.5,
            ease: 'power2.out'
        });
    });

    stage.addEventListener('mouseleave', () => {
        gsap.to(stage, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.7,
            ease: 'power2.out'
        });
    });
}

// ========== NEW SECTION REVEALS (PDF refresh) ==========
function initRefreshSectionReveals() {
    const reveal = (selector, props = {}, opts = {}) => {
        const els = document.querySelectorAll(selector);
        if (!els.length) return;
        const { from = { opacity: 0, y: 40 }, stagger = 0.1, duration = 0.9, ease = 'power3.out', start = 'top 85%', trigger } = { ...opts };
        gsap.set(els, from);
        ScrollTrigger.create({
            trigger: trigger || els[0],
            start,
            once: true,
            onEnter: () => {
                gsap.to(els, {
                    opacity: 1,
                    y: 0,
                    x: 0,
                    scale: 1,
                    duration,
                    stagger,
                    ease,
                    ...props
                });
            }
        });
    };

    // Hero proof + scarcity row — slide up after hero stats
    gsap.set('.hero-proof, .hero-scarcity', { opacity: 0, y: 16 });
    gsap.to('.hero-proof', { opacity: 1, y: 0, duration: 0.7, delay: 1.9, ease: 'power3.out' });
    gsap.to('.hero-scarcity', { opacity: 1, y: 0, duration: 0.7, delay: 2.4, ease: 'power3.out' });

    // Problem prose paragraphs — staggered fade up
    reveal('.problem-prose p', {}, { from: { opacity: 0, y: 24 }, stagger: 0.12, duration: 0.75, trigger: '.problem-prose' });

    // Elephant section — prose left fades, mock right slides in from right
    const elephantProse = document.querySelectorAll('.elephant-prose p');
    if (elephantProse.length) {
        gsap.set(elephantProse, { opacity: 0, x: -40 });
        ScrollTrigger.create({
            trigger: '.elephant-layout',
            start: 'top 78%',
            once: true,
            onEnter: () => {
                gsap.to(elephantProse, { opacity: 1, x: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out' });
            }
        });
    }
    const elephantMock = document.querySelector('.elephant-mock');
    if (elephantMock) {
        gsap.set(elephantMock, { opacity: 0, x: 60 });
        gsap.set('.elephant-mock-card .mock-row, .elephant-mock-card .mock-decision', { opacity: 0, y: 14 });
        ScrollTrigger.create({
            trigger: '.elephant-layout',
            start: 'top 78%',
            once: true,
            onEnter: () => {
                const tl = gsap.timeline();
                tl.to(elephantMock, { opacity: 1, x: 0, duration: 1, ease: 'power3.out' });
                tl.to('.elephant-mock-card .mock-row', { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }, 0.4);
                tl.to('.elephant-mock-card .mock-decision', { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.4)' }, 0.95);
            }
        });
    }

    // Who-this-is-for cards — left/right slide
    const whoYes = document.querySelector('.who-yes');
    const whoNo = document.querySelector('.who-no');
    if (whoYes) gsap.set(whoYes, { opacity: 0, x: -50 });
    if (whoNo) gsap.set(whoNo, { opacity: 0, x: 50 });
    if (whoYes || whoNo) {
        ScrollTrigger.create({
            trigger: '.who-grid',
            start: 'top 80%',
            once: true,
            onEnter: () => {
                if (whoYes) gsap.to(whoYes, { opacity: 1, x: 0, duration: 0.95, ease: 'power3.out' });
                if (whoNo) gsap.to(whoNo, { opacity: 1, x: 0, duration: 0.95, delay: 0.1, ease: 'power3.out' });
                gsap.set('.who-list li', { opacity: 0, y: 12 });
                gsap.to('.who-list li', { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, delay: 0.6, ease: 'power2.out' });
            }
        });
    }

    // Pillars — staggered card lift with internal feature stagger
    reveal('.pillar-card', {}, { from: { opacity: 0, y: 60, scale: 0.96 }, stagger: 0.16, duration: 1, ease: 'power3.out', trigger: '.pillars-grid' });
    const pillarFeatures = document.querySelectorAll('.pillar-features li');
    if (pillarFeatures.length) {
        gsap.set(pillarFeatures, { opacity: 0, x: -16 });
        ScrollTrigger.create({
            trigger: '.pillars-grid',
            start: 'top 75%',
            once: true,
            onEnter: () => {
                gsap.to(pillarFeatures, { opacity: 1, x: 0, duration: 0.5, stagger: 0.05, delay: 0.5, ease: 'power2.out' });
            }
        });
    }

    // Guarantee — stamp scale-in + copy fade
    const stamp = document.querySelector('.guarantee-stamp');
    if (stamp) {
        gsap.set(stamp, { opacity: 0, scale: 0.4 });
        gsap.set('.guarantee-copy > *', { opacity: 0, y: 24 });
        ScrollTrigger.create({
            trigger: '.guarantee-stage',
            start: 'top 78%',
            once: true,
            onEnter: () => {
                const tl = gsap.timeline();
                tl.to(stamp, { opacity: 1, scale: 1, duration: 1.1, ease: 'back.out(1.5)' });
                tl.to('.guarantee-copy > *', { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' }, 0.3);
            }
        });
    }

    // Result stat cards — pop up
    reveal('.result-stat', {}, { from: { opacity: 0, y: 30, scale: 0.94 }, stagger: 0.08, duration: 0.7, ease: 'back.out(1.4)', trigger: '.result-stats' });

    // Case studies — slide up
    reveal('.case-card', {}, { from: { opacity: 0, y: 50 }, stagger: 0.15, duration: 0.9, ease: 'power3.out', trigger: '.case-studies' });

    // Bonus cards — sweep up with subtle ribbon flash
    reveal('.bonus-card', {}, { from: { opacity: 0, y: 60, scale: 0.95 }, stagger: 0.18, duration: 1, ease: 'power3.out', trigger: '.bonus-grid' });
    const bonusRibbons = document.querySelectorAll('.bonus-ribbon');
    if (bonusRibbons.length) {
        gsap.set(bonusRibbons, { opacity: 0, x: 80 });
        ScrollTrigger.create({
            trigger: '.bonus-grid',
            start: 'top 78%',
            once: true,
            onEnter: () => {
                gsap.to(bonusRibbons, { opacity: 1, x: 0, duration: 0.7, stagger: 0.18, delay: 0.4, ease: 'power3.out' });
            }
        });
    }

    // Pricing flag pulse on featured tier
    const pricingFlag = document.querySelector('.pricing-flag');
    if (pricingFlag) {
        gsap.set(pricingFlag, { opacity: 0, x: 80 });
        ScrollTrigger.create({
            trigger: '.pricing-grid',
            start: 'top 80%',
            once: true,
            onEnter: () => {
                gsap.to(pricingFlag, { opacity: 1, x: 0, duration: 0.7, delay: 0.6, ease: 'power3.out' });
            }
        });
    }
    const pricingFeatures = document.querySelectorAll('.pricing-features li');
    if (pricingFeatures.length) {
        gsap.set(pricingFeatures, { opacity: 0, x: -14 });
        ScrollTrigger.create({
            trigger: '.pricing-grid',
            start: 'top 75%',
            once: true,
            onEnter: () => {
                gsap.to(pricingFeatures, { opacity: 1, x: 0, duration: 0.5, stagger: 0.04, delay: 0.5, ease: 'power2.out' });
            }
        });
    }

    // Steps — sequential pop-in
    reveal('.step-item', {}, { from: { opacity: 0, y: 30 }, stagger: 0.12, duration: 0.7, ease: 'back.out(1.3)', trigger: '.steps-track' });

    // Founders cards
    reveal('.founder-card', {}, { from: { opacity: 0, y: 40 }, stagger: 0.18, duration: 0.9, ease: 'power3.out', trigger: '.founders-grid' });
    const foundersSummary = document.querySelector('.founders-summary');
    if (foundersSummary) {
        gsap.set(foundersSummary, { opacity: 0, y: 30 });
        ScrollTrigger.create({
            trigger: foundersSummary,
            start: 'top 88%',
            once: true,
            onEnter: () => {
                gsap.to(foundersSummary, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
            }
        });
    }
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
    initSolutionCarousel();
    initGuaranteeAnimation();
    initGuaranteeTilt();
    initRefreshSectionReveals();
});
