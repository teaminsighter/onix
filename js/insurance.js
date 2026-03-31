/**
 * ONIX Insurance Page - Animations & Interactions
 * GSAP-powered animations matching the main site
 */

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// ============ SPLIT TEXT UTILITY ============
function splitTextToChars(element) {
    const text = element.textContent;
    element.innerHTML = '';

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const span = document.createElement('span');
        span.className = char === ' ' ? 'char space' : 'char';
        span.textContent = char === ' ' ? '\u00A0' : char;
        element.appendChild(span);
    }

    return element.querySelectorAll('.char');
}

function splitWordsToChars(element) {
    const words = element.querySelectorAll('.word');
    const allChars = [];

    words.forEach(word => {
        const text = word.textContent;
        const isHighlight = word.classList.contains('highlight');
        word.innerHTML = '';

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const span = document.createElement('span');
            span.className = char === ' ' ? 'char space' : 'char';
            span.textContent = char === ' ' ? '\u00A0' : char;
            if (isHighlight) span.classList.add('highlight-char');
            word.appendChild(span);
            allChars.push(span);
        }

        // Add space after word
        const spaceSpan = document.createElement('span');
        spaceSpan.className = 'char space';
        spaceSpan.innerHTML = '&nbsp;';
        word.appendChild(spaceSpan);
    });

    return allChars;
}

// Split subtitle into words (preserving hero-highlight spans)
function splitSubtitleToWords(element) {
    const processNode = (node) => {
        if (node.nodeType === 3) { // Text node
            return node.textContent.split(' ').filter(w => w).map(word =>
                `<span class="word">${word}</span>`
            ).join(' ');
        } else if (node.nodeType === 1 && node.classList.contains('hero-highlight')) {
            // Keep hero-highlight spans intact but wrap content in words
            const words = node.textContent.split(' ').filter(w => w).map(word =>
                `<span class="word">${word}</span>`
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

    return element.querySelectorAll('.word');
}

// ============ DATA ============
// Partner logos (same as main page)
const clientLogos = [
    '../logos/logot1.jpeg',
    '../logos/logot2.png',
    '../logos/logot3.png',
    '../logos/logot4.png',
    '../logos/logot5.png',
    '../logos/logot6.png',
    '../logos/logot7.png',
    '../logos/logot8.png',
    '../logos/logot9.png',
    '../logos/logot10.png'
];

const googleReviews = [
    { initials: 'NM', name: 'Nicky M.', role: 'Real Estate · Auckland', text: '"Sean\'s leads gave us an extra $100k on our bottom line year on year."' },
    { initials: 'PS', name: 'Paul S.', role: 'Risk Insurance', text: '"I\'ve invested 17k and my return was $110k. Super happy and gets better each year."' },
    { initials: 'MM', name: 'Mike M.', role: 'ACC Business', text: '"My site generates 20–25 leads a month returning $8k–$10k in commission."' },
    { initials: 'DK', name: 'David K.', role: 'Solar · Auckland', text: '"ONIX transformed our business. Revenue is up 40% with a full calendar."' },
    { initials: 'SL', name: 'Sarah L.', role: 'Insurance · Hamilton', text: '"We\'ve doubled our lead conversion rate since using ONIX."' },
    { initials: 'JT', name: 'James T.', role: 'Trades Business', text: '"We save 10+ hours a week. Booking rate jumped from 12% to 35%."' },
    { initials: 'LR', name: 'Lisa R.', role: 'Mortgage · Christchurch', text: '"The follow-up automation is worth 10x the price. Game changer."' },
    { initials: 'CM', name: 'Carolyn M.', role: 'Real Estate · Napier', text: '"Sean is a sharp, smart mover who gets things done."' },
];

const markets = {
    au: {
        flag: 'AU',
        name: 'Australia',
        desc: "Australia's insurance market is one of Asia-Pacific's most competitive — millions of households remain underinsured. We're launching with the exact campaign infrastructure that made us #1 in NZ, rebuilt for Australian compliance and buyer behaviour.",
        specs: [
            { label: 'Lead Types', val: 'Life · IP · Private Health' },
            { label: 'Target CPL', val: 'AUD $38–$75' },
            { label: 'Exclusivity', val: '100% — yours alone' },
            { label: 'Delivery', val: 'Real-time to your CRM' },
            { label: 'Compliance', val: 'ASIC-aware campaigns' },
            { label: 'Volume', val: 'Flexible — discuss with us' },
        ],
        cta: 'Apply for AU Access'
    },
    us: {
        flag: 'US',
        name: 'United States',
        desc: "The world's largest insurance market — and one of the most fragmented. Our system cuts through the noise to deliver exclusive, verified leads to brokers across life, health, and Medicare supplement.",
        specs: [
            { label: 'Lead Types', val: 'Life · Health · Medicare Supp.' },
            { label: 'Target CPL', val: 'USD $28–$60' },
            { label: 'Exclusivity', val: '100% — yours alone' },
            { label: 'Delivery', val: 'Real-time to your CRM' },
            { label: 'Coverage', val: 'National · State-by-state' },
            { label: 'Compliance', val: 'State-licensed management' },
        ],
        cta: 'Apply for US Access'
    },
    uk: {
        flag: 'UK',
        name: 'United Kingdom',
        desc: "The UK protection market is underpenetrated and price-sensitive — ideal conditions for a qualified-lead system. We're bringing our NZ model to British brokers with FCA-aware campaign structures.",
        specs: [
            { label: 'Lead Types', val: 'Life · Critical Illness · IP' },
            { label: 'Target CPL', val: 'GBP £25–£55' },
            { label: 'Exclusivity', val: '100% — yours alone' },
            { label: 'Delivery', val: 'Real-time to your CRM' },
            { label: 'Coverage', val: 'England · Scotland · Wales · NI' },
            { label: 'Compliance', val: 'FCA-aware management' },
        ],
        cta: 'Apply for UK Access'
    }
};

// Chart data
const onixData = [92, 89, 94, 91, 90, 93, 88, 95, 91, 89, 94, 92];
const industryData = [95, 58, 82, 44, 90, 35, 75, 88, 42, 68, 93, 52];

// ============ CURSOR ============
function initCursor() {
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursorFollower');

    if (!cursor || !follower) return;

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Smooth cursor animation
    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;
        followerX += (mouseX - followerX) * 0.1;
        followerY += (mouseY - followerY) * 0.1;

        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        follower.style.left = followerX + 'px';
        follower.style.top = followerY + 'px';

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover states
    const hoverElements = document.querySelectorAll('a, button, .magnetic');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            follower.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            follower.classList.remove('hover');
        });
    });
}

// ============ MAGNETIC BUTTONS ============
function initMagnetic() {
    document.querySelectorAll('.magnetic').forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            gsap.to(el, {
                x: x * 0.25,
                y: y * 0.25,
                duration: 0.3,
                ease: "power2.out"
            });
        });
        el.addEventListener('mouseleave', () => {
            gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
        });
    });
}

// ============ NAVBAR ============
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    if (!navbar) return;

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
            if (currentScrollY > lastScrollY && currentScrollY - lastScrollY > 10) {
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

    // Mobile menu
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            const isActive = hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');

            // Lock body scroll when menu is open
            if (isActive) {
                document.body.classList.add('menu-open');
            } else {
                document.body.classList.remove('menu-open');
            }
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }
}

// ============ HERO ANIMATIONS ============
function initHeroAnimations() {
    const heroTitle = document.getElementById('heroTitle');
    const heroSubtitle = document.getElementById('heroSubtitle');
    if (!heroTitle) return;

    // Split each title line into characters
    const titleLines = heroTitle.querySelectorAll('.title-line');
    const allChars = [];

    titleLines.forEach(line => {
        const chars = splitTextToChars(line);
        chars.forEach(char => allChars.push(char));
    });

    // Split subtitle into words
    let subtitleWords = [];
    if (heroSubtitle) {
        subtitleWords = splitSubtitleToWords(heroSubtitle);
    }

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Badge
    tl.to('.hero-badge', { opacity: 1, y: 0, duration: 0.8 }, 0.2);

    // Title characters - staggered reveal with 3D rotation
    tl.to(allChars, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.8,
        stagger: 0.02,
        ease: "back.out(1.7)"
    }, 0.4);

    // Subtitle words - word by word animation
    if (subtitleWords.length) {
        tl.to(subtitleWords, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.04,
            ease: "power3.out"
        }, 1.4);
    }

    // Primary button - blur + scale animation
    tl.to('.hero-actions .btn-primary', {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.8,
        ease: "power2.out"
    }, 2.0);

    // Ghost button - blur + scale animation with slight delay
    tl.to('.hero-actions .btn-ghost', {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.8,
        ease: "power2.out"
    }, 2.15);

    // Hero cards - appear from below slowly and smoothly
    tl.to('.hero-card', {
        opacity: 1,
        y: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "power3.out",
        onComplete: () => {
            // Start counting animation after cards appear
            animateHeroCounts();
            // Initialize magnetic hover effect
            initHeroMagnetic();
        }
    }, 2.2);

    // Scroll indicator
    tl.to('.scroll-indicator', { opacity: 1, duration: 0.8 }, 2.8);
}

// ============ HERO COUNTING ANIMATION ============
function animateHeroCounts() {
    document.querySelectorAll('.hero-count').forEach((el, index) => {
        const target = parseFloat(el.dataset.target);
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        const text = el.dataset.text; // For non-numeric values like "$32–$65"

        if (text) {
            // Typewriter effect for text values
            el.textContent = '';
            let i = 0;
            const typeInterval = setInterval(() => {
                if (i < text.length) {
                    el.textContent += text[i];
                    i++;
                } else {
                    clearInterval(typeInterval);
                }
            }, 50);
        } else if (!isNaN(target)) {
            // Counting animation for numbers
            const duration = 1.5;
            const startTime = performance.now();
            const isDecimal = target % 1 !== 0;

            function updateCount(currentTime) {
                const elapsed = (currentTime - startTime) / 1000;
                const progress = Math.min(elapsed / duration, 1);

                // Ease out cubic
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                const current = target * easeProgress;

                let numText;
                if (isDecimal) {
                    numText = prefix + current.toFixed(1);
                } else {
                    numText = prefix + Math.round(current);
                }

                // Add suffix with styling
                if (suffix) {
                    el.innerHTML = numText + '<span class="hero-card-suffix">' + suffix + '</span>';
                } else {
                    el.textContent = numText;
                }

                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                }
            }

            // Delay each counter slightly
            setTimeout(() => {
                requestAnimationFrame(updateCount);
            }, index * 150);
        }
    });
}

// ============ HERO MAGNETIC HOVER EFFECT ============
function initHeroMagnetic() {
    const grid = document.getElementById('heroStats');
    const cards = document.querySelectorAll('.hero-card');

    if (!grid || cards.length === 0) return;

    grid.addEventListener('mousemove', (e) => {
        const rect = grid.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        cards.forEach((card, index) => {
            const cardRect = card.getBoundingClientRect();
            const cardCenterX = cardRect.left + cardRect.width / 2;
            const cardCenterY = cardRect.top + cardRect.height / 2;

            // Calculate direction from mouse to card center
            const deltaX = e.clientX - cardCenterX;
            const deltaY = e.clientY - cardCenterY;

            // Move cards away from mouse (opposite direction)
            const moveX = -deltaX * 0.08;
            const moveY = -deltaY * 0.08;

            gsap.to(card, {
                x: moveX,
                y: moveY,
                duration: 0.4,
                ease: "power2.out"
            });
        });
    });

    grid.addEventListener('mouseleave', () => {
        cards.forEach(card => {
            gsap.to(card, {
                x: 0,
                y: 0,
                duration: 0.6,
                ease: "elastic.out(1, 0.5)"
            });
        });
    });
}

// ============ SECTION TITLE ANIMATIONS ============
function initTitleAnimations() {
    document.querySelectorAll('.section-title').forEach(title => {
        // Split words into characters
        const chars = splitWordsToChars(title);

        ScrollTrigger.create({
            trigger: title,
            start: "top 80%",
            onEnter: () => {
                gsap.to(chars, {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    duration: 0.6,
                    stagger: 0.015,
                    ease: "back.out(1.7)"
                });
            },
            once: true
        });
    });

    // CTA title animation
    const ctaTitle = document.querySelector('.cta-title');
    if (ctaTitle) {
        const ctaWords = ctaTitle.querySelectorAll('.word');
        const ctaChars = [];

        ctaWords.forEach(word => {
            const text = word.textContent;
            const isHighlight = word.classList.contains('highlight');
            word.innerHTML = '';

            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                const span = document.createElement('span');
                span.className = char === ' ' ? 'char space' : 'char';
                span.textContent = char === ' ' ? '\u00A0' : char;
                word.appendChild(span);
                ctaChars.push(span);
            }
        });

        ScrollTrigger.create({
            trigger: ctaTitle,
            start: "top 80%",
            onEnter: () => {
                gsap.to(ctaChars, {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    duration: 0.6,
                    stagger: 0.02,
                    ease: "back.out(1.7)"
                });
            },
            once: true
        });
    }
}

// ============ AUTHORITY SECTION ANIMATIONS ============
function initAuthorityAnimations() {
    const authorityTitle = document.getElementById('authorityTitle');
    const authoritySub = document.getElementById('authoritySub');

    if (!authorityTitle) return;

    // Split title into characters
    const titleSpan = authorityTitle.querySelector('.highlight');
    if (titleSpan) {
        const text = titleSpan.getAttribute('data-text') || titleSpan.textContent;
        titleSpan.innerHTML = '';

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char;
            titleSpan.appendChild(span);
        }
    }

    const titleChars = authorityTitle.querySelectorAll('.char');

    // Setup subtitle for typewriter
    if (authoritySub) {
        const subText = authoritySub.getAttribute('data-text') || '';
        authoritySub.innerHTML = '<span class="typewriter-text"></span><span class="typewriter-cursor"></span>';
        const typewriterEl = authoritySub.querySelector('.typewriter-text');
        const cursorEl = authoritySub.querySelector('.typewriter-cursor');
        cursorEl.style.opacity = '0'; // Hide cursor initially

        ScrollTrigger.create({
            trigger: authorityTitle,
            start: "top 75%",
            onEnter: () => {
                // Animate title chars
                gsap.to(titleChars, {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    duration: 0.8,
                    stagger: 0.04,
                    ease: "back.out(1.7)",
                    onComplete: () => {
                        // Start typewriter after title animation
                        cursorEl.style.opacity = '1';
                        typewriterEffect(typewriterEl, subText, 30, () => {
                            // Hide cursor after typing complete
                            setTimeout(() => {
                                gsap.to(cursorEl, { opacity: 0, duration: 0.3 });
                            }, 1000);
                        });
                    }
                });

                // Animate authority cards
                gsap.to('.auth-card', {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: "back.out(1.5)",
                    delay: 1.2
                });
            },
            once: true
        });
    }
}

// Typewriter effect function
function typewriterEffect(element, text, speed, callback) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else if (callback) {
            callback();
        }
    }

    type();
}

// ============ COUNTER ANIMATIONS ============
function initCounterAnimations() {
    document.querySelectorAll('[data-target]').forEach(el => {
        const target = parseFloat(el.dataset.target);
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';

        ScrollTrigger.create({
            trigger: el,
            start: "top 85%",
            onEnter: () => {
                gsap.to(el, {
                    duration: 1.5,
                    ease: "power2.out",
                    onUpdate: function() {
                        const progress = this.progress();
                        const current = target * progress;
                        if (target % 1 === 0) {
                            el.textContent = prefix + Math.round(current) + suffix;
                        } else {
                            el.textContent = prefix + current.toFixed(1) + suffix;
                        }
                    }
                });
            },
            once: true
        });
    });
}

// ============ STORY SECTION ANIMATIONS ============
function initStoryAnimations() {
    const storyTitle = document.getElementById('storyTitle');
    const storyQuote = document.getElementById('storyQuote');
    const storyParagraphs = document.querySelectorAll('.story-content > p');

    if (!storyTitle) return;

    // Line sweep animation for story paragraphs
    if (storyParagraphs.length) {
        ScrollTrigger.create({
            trigger: '.story-content',
            start: 'top 70%',
            onEnter: () => {
                storyParagraphs.forEach((p, index) => {
                    setTimeout(() => {
                        p.classList.add('sweep-reveal');
                    }, index * 300);
                });
            },
            once: true
        });
    }

    // Split title words into characters
    const words = storyTitle.querySelectorAll('.word');
    const allChars = [];

    words.forEach(word => {
        const text = word.textContent;
        const isHighlight = word.classList.contains('highlight');
        word.innerHTML = '';

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char;
            if (isHighlight) span.style.color = 'var(--accent)';
            word.appendChild(span);
            allChars.push(span);
        }
    });

    // Set initial state for chars
    gsap.set(allChars, {
        opacity: 0,
        y: 50,
        rotateX: -60
    });

    // Setup quote for typewriter
    if (storyQuote) {
        const quoteText = storyQuote.getAttribute('data-text') || '';
        storyQuote.innerHTML = '<span class="quote-text"></span><span class="typewriter-cursor"></span>';
        const quoteTextEl = storyQuote.querySelector('.quote-text');
        const cursorEl = storyQuote.querySelector('.typewriter-cursor');
        cursorEl.style.opacity = '0';

        ScrollTrigger.create({
            trigger: storyTitle,
            start: "top 75%",
            onEnter: () => {
                // Animate title chars
                gsap.to(allChars, {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    duration: 0.6,
                    stagger: 0.02,
                    ease: "back.out(1.7)",
                    onComplete: () => {
                        // Start typewriter after title
                        cursorEl.style.opacity = '1';
                        typewriterWithHighlight(quoteTextEl, quoteText, 25, 'real thing', () => {
                            setTimeout(() => {
                                gsap.to(cursorEl, { opacity: 0, duration: 0.3 });
                            }, 1000);
                        });
                    }
                });
            },
            once: true
        });
    }
}

// ============ PERFORMANCE SUBTITLE ANIMATION ============
function initPerfSubtitleAnimation() {
    const perfSubtitle = document.getElementById('perfSubtitle');
    if (!perfSubtitle) return;

    const subtitleText = perfSubtitle.getAttribute('data-text') || '';
    perfSubtitle.innerHTML = '<span class="perf-text"></span><span class="typewriter-cursor"></span>';
    const textEl = perfSubtitle.querySelector('.perf-text');
    const cursorEl = perfSubtitle.querySelector('.typewriter-cursor');
    cursorEl.style.opacity = '0';

    ScrollTrigger.create({
        trigger: '#performance',
        start: 'top 70%',
        onEnter: () => {
            cursorEl.style.opacity = '1';
            // Typewriter effect
            let i = 0;
            function type() {
                if (i < subtitleText.length) {
                    textEl.innerHTML += subtitleText.charAt(i);
                    i++;
                    setTimeout(type, 20);
                } else {
                    // Hide cursor after typing completes
                    setTimeout(() => {
                        gsap.to(cursorEl, { opacity: 0, duration: 0.3 });
                    }, 1000);
                }
            }
            type();
        },
        once: true
    });
}

// ============ LEADS SUBTITLE ANIMATION ============
function initLeadsSubtitleAnimation() {
    const leadsSubtitle = document.getElementById('leadsSubtitle');
    if (!leadsSubtitle) return;

    const subtitleText = leadsSubtitle.getAttribute('data-text') || '';
    leadsSubtitle.innerHTML = '<span class="leads-text"></span><span class="typewriter-cursor"></span>';
    const textEl = leadsSubtitle.querySelector('.leads-text');
    const cursorEl = leadsSubtitle.querySelector('.typewriter-cursor');
    cursorEl.style.opacity = '0';

    ScrollTrigger.create({
        trigger: '#leads',
        start: 'top 70%',
        onEnter: () => {
            cursorEl.style.opacity = '1';
            // Typewriter effect
            let i = 0;
            function type() {
                if (i < subtitleText.length) {
                    textEl.innerHTML += subtitleText.charAt(i);
                    i++;
                    setTimeout(type, 20);
                } else {
                    // Hide cursor after typing completes
                    setTimeout(() => {
                        gsap.to(cursorEl, { opacity: 0, duration: 0.3 });
                    }, 1000);
                }
            }
            type();
        },
        once: true
    });
}

// ============ CONSISTENCY SUBTITLE ANIMATION ============
function initConsistencySubtitleAnimation() {
    const consistencySubtitle = document.getElementById('consistencySubtitle');
    if (!consistencySubtitle) return;

    const subtitleText = consistencySubtitle.getAttribute('data-text') || '';
    const highlightPhrase = "We don't.";
    consistencySubtitle.innerHTML = '<span class="consistency-text"></span><span class="typewriter-cursor"></span>';
    const textEl = consistencySubtitle.querySelector('.consistency-text');
    const cursorEl = consistencySubtitle.querySelector('.typewriter-cursor');
    cursorEl.style.opacity = '0';

    ScrollTrigger.create({
        trigger: '#consistency',
        start: 'top 70%',
        onEnter: () => {
            cursorEl.style.opacity = '1';
            // Typewriter effect with highlight
            let i = 0;
            function type() {
                if (i < subtitleText.length) {
                    // Check if we're at the highlight phrase
                    if (subtitleText.substring(i, i + highlightPhrase.length) === highlightPhrase) {
                        textEl.innerHTML += '<strong class="consistency-highlight">' + highlightPhrase + '</strong>';
                        i += highlightPhrase.length;
                        setTimeout(type, 20);
                    } else {
                        textEl.innerHTML += subtitleText.charAt(i);
                        i++;
                        setTimeout(type, 20);
                    }
                } else {
                    // Hide cursor after typing completes
                    setTimeout(() => {
                        gsap.to(cursorEl, { opacity: 0, duration: 0.3 });
                    }, 1000);
                }
            }
            type();
        },
        once: true
    });
}

// Typewriter with highlight for specific words
function typewriterWithHighlight(element, text, speed, highlightPhrase, callback) {
    let i = 0;
    element.innerHTML = '';

    function type() {
        if (i < text.length) {
            // Check if we're at the highlight phrase
            if (text.substring(i, i + highlightPhrase.length) === highlightPhrase) {
                element.innerHTML += '<span class="highlight-word">' + highlightPhrase + '</span>';
                i += highlightPhrase.length;
            } else {
                element.innerHTML += text.charAt(i);
                i++;
            }
            setTimeout(type, speed);
        } else if (callback) {
            callback();
        }
    }

    type();
}

// ============ TIMELINE ANIMATIONS ============
function initTimelineAnimations() {
    const listContainer = document.getElementById('yearsList');
    if (!listContainer) return;

    const items = listContainer.querySelectorAll('.list-item');
    if (items.length === 0) return;

    let animationStarted = false;

    // Trigger animation when section comes into view
    ScrollTrigger.create({
        trigger: listContainer,
        start: "top 80%",
        onEnter: () => {
            if (!animationStarted) {
                animationStarted = true;
                startAnimatedList(items, listContainer);
            }
        },
        once: true
    });
}

function startAnimatedList(items, container) {
    const itemsArray = Array.from(items);
    const list = container.querySelector('.animated-list');
    let currentIndex = 0;

    // Slide in items one by one from right
    function slideInNextItem() {
        if (currentIndex < itemsArray.length) {
            const item = itemsArray[currentIndex];

            gsap.to(item, {
                opacity: 1,
                x: 0,
                duration: 0.6,
                ease: "power3.out",
                onComplete: () => {
                    currentIndex++;
                    setTimeout(slideInNextItem, 200);
                }
            });
        } else {
            // Start wrap-around scroll after all items are in
            setTimeout(() => {
                startWrapScroll(list, itemsArray);
            }, 1000);
        }
    }

    slideInNextItem();
}

function startWrapScroll(list, items) {
    if (!list || items.length === 0) return;

    const nowItem = items[items.length - 1]; // "Now" is last item
    const itemsToMove = items.length - 1; // Move all except "Now"
    let movedCount = 0;

    function moveNextItem() {
        if (movedCount >= itemsToMove) {
            // All items moved, "Now" is at top - now swap the years
            setTimeout(() => {
                swapYearTexts(list);
            }, 500);
            return;
        }

        const firstItem = list.children[0]; // Get current first item
        const itemHeight = firstItem.offsetHeight;
        const gap = 24; // 1.5rem gap

        // Scroll up by one item height
        gsap.to(list, {
            y: -(itemHeight + gap),
            duration: 1.2,
            ease: "power2.inOut",
            onComplete: () => {
                // Move first item to the end
                list.appendChild(firstItem);
                // Reset scroll position
                gsap.set(list, { y: 0 });
                movedCount++;

                // Continue with next item after a pause
                setTimeout(moveNextItem, 400);
            }
        });
    }

    // Start the wrap-around animation
    moveNextItem();
}

function swapYearTexts(list) {
    const items = list.querySelectorAll('.list-item');
    // Current order after wrap: Now(0), 2010(1), 2015(2), 2020(3), 2025(4)
    // Target order: Now(0), 2025(1), 2020(2), 2015(3), 2010(4)

    // Data for each position (reverse chronological)
    const newData = [
        { year: '2025', title: '$2.3M Ad Spend', desc: 'Zero underperformance. CPL $32–$65' },
        { year: '2020', title: '#1, #2 & #3 Simultaneously', desc: 'Top three positions across all platforms' },
        { year: '2015', title: 'First #1 Platform Ranking', desc: 'Top position across all major ad platforms' },
        { year: '2010', title: 'Founded in New Zealand', desc: 'Launched our first insurance lead campaigns' }
    ];

    const itemsToSwap = [];
    items.forEach((item, index) => {
        if (index > 0) { // Skip "Now"
            itemsToSwap.push({
                yearEl: item.querySelector('.list-year'),
                titleEl: item.querySelector('.list-title'),
                descEl: item.querySelector('.list-desc')
            });
        }
    });

    // Animate each card's content change with stagger
    itemsToSwap.forEach((els, index) => {
        if (!els.yearEl) return;

        const data = newData[index];
        const delay = index * 0.2;

        // Animate year out and in
        gsap.to(els.yearEl, {
            opacity: 0,
            y: -20,
            duration: 0.3,
            delay: delay,
            ease: "power2.in",
            onComplete: () => {
                els.yearEl.textContent = data.year;
                gsap.fromTo(els.yearEl,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.5)" }
                );
            }
        });

        // Animate title out and in
        gsap.to(els.titleEl, {
            opacity: 0,
            x: -20,
            duration: 0.3,
            delay: delay,
            ease: "power2.in",
            onComplete: () => {
                els.titleEl.textContent = data.title;
                gsap.fromTo(els.titleEl,
                    { opacity: 0, x: 20 },
                    { opacity: 1, x: 0, duration: 0.4, ease: "back.out(1.5)" }
                );
            }
        });

        // Animate description out and in
        gsap.to(els.descEl, {
            opacity: 0,
            x: -20,
            duration: 0.3,
            delay: delay + 0.1,
            ease: "power2.in",
            onComplete: () => {
                els.descEl.textContent = data.desc;
                gsap.fromTo(els.descEl,
                    { opacity: 0, x: 20 },
                    { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
                );
            }
        });
    });
}

// ============ BENTO CARD TILT ============
function initBentoTilt() {
    const bentoCards = document.querySelectorAll('.bento-card');

    // Scroll reveal animation with stagger
    ScrollTrigger.create({
        trigger: '.perf-bento',
        start: "top 80%",
        onEnter: () => {
            gsap.to(bentoCards, {
                opacity: 1,
                y: 0,
                duration: 0.7,
                stagger: 0.12,
                ease: "back.out(1.5)"
            });
        },
        once: true
    });

    // Tilt effect on hover
    document.querySelectorAll('[data-tilt]').forEach(card => {
        const ray = card.querySelector('.bento-card-ray');

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 12;
            const rotateY = (centerX - x) / 12;

            gsap.to(card, {
                rotateX: rotateX,
                rotateY: rotateY,
                transformPerspective: 1000,
                duration: 0.3
            });

            // Move ray to follow mouse
            if (ray) {
                const rayAngle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI) + 90;
                gsap.to(ray, {
                    left: x - 100,
                    top: y - 20,
                    rotation: rayAngle,
                    opacity: 0.4,
                    duration: 0.3
                });
            }
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.5)"
            });

            // Reset ray
            if (ray) {
                gsap.to(ray, {
                    left: 0,
                    top: 0,
                    rotation: 40,
                    opacity: 0.25,
                    duration: 0.5
                });
            }
        });
    });
}

// ============ RANKINGS TABLE ANIMATIONS ============
function initRankingsAnimation() {
    const table = document.querySelector('.rankings-table');
    const rows = document.querySelectorAll('.rank-row');

    if (!table || rows.length === 0) return;

    // Animate all rows with stagger when table comes into view
    ScrollTrigger.create({
        trigger: table,
        start: "top 80%",
        onEnter: () => {
            gsap.to(rows, {
                opacity: 1,
                x: 0,
                duration: 0.7,
                stagger: 0.12,
                ease: "power3.out"
            });
        },
        once: true
    });
}

// ============ PROCESS CARDS ANIMATIONS ============
function initProcessAnimations() {
    const cards = document.querySelectorAll('.process-card');
    const processCards = document.getElementById('processCards');

    if (!processCards || cards.length === 0) return;

    // Animate cards in with stagger
    ScrollTrigger.create({
        trigger: processCards,
        start: "top 75%",
        onEnter: () => {
            gsap.to(cards, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: "back.out(1.5)"
            });
        },
        once: true
    });
}

// ============ CONSISTENCY SECTION ANIMATIONS (Redesigned) ============
function initConsistencyAnimations() {
    const consistencySection = document.getElementById('consistency');
    const consistencyTitle = document.getElementById('consistencyTitle');
    const proofCards = document.querySelectorAll('.proof-card');
    const chartPanel = document.querySelector('.chart-panel');

    if (!consistencySection) return;

    // Animate consistency title
    if (consistencyTitle) {
        const words = consistencyTitle.querySelectorAll('.word');
        const allChars = [];

        words.forEach(word => {
            const text = word.textContent;
            const isHighlight = word.classList.contains('highlight');
            word.innerHTML = '';

            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                const span = document.createElement('span');
                span.className = 'char';
                span.textContent = char;
                if (isHighlight) span.style.color = 'var(--accent)';
                word.appendChild(span);
                allChars.push(span);
            }
        });

        // Set initial state
        gsap.set(allChars, {
            opacity: 0,
            y: 50,
            rotateX: -60
        });

        ScrollTrigger.create({
            trigger: consistencyTitle,
            start: "top 80%",
            onEnter: () => {
                gsap.to(allChars, {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    duration: 0.6,
                    stagger: 0.02,
                    ease: "back.out(1.7)"
                });
            },
            once: true
        });
    }

    // Animate proof cards with stagger
    if (proofCards.length > 0) {
        ScrollTrigger.create({
            trigger: '.proof-cards',
            start: "top 75%",
            onEnter: () => {
                gsap.to(proofCards, {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    stagger: {
                        each: 0.15,
                        from: "start"
                    },
                    ease: "back.out(1.5)"
                });
            },
            once: true
        });
    }

    // Animate chart panel
    if (chartPanel) {
        ScrollTrigger.create({
            trigger: chartPanel,
            start: "top 80%",
            onEnter: () => {
                gsap.to(chartPanel, {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: "power3.out"
                });

                // Animate comparison values with counting effect
                animateVarianceCounters();
            },
            once: true
        });
    }
}

// Animate the variance counter values
function animateVarianceCounters() {
    const onixVariance = document.getElementById('onixVariance');
    const industryVariance = document.getElementById('industryVariance');

    if (onixVariance) {
        let count = 0;
        const target = 4;
        const interval = setInterval(() => {
            count++;
            onixVariance.textContent = `±${count}%`;
            if (count >= target) clearInterval(interval);
        }, 100);
    }

    if (industryVariance) {
        let count = 0;
        const target = 48;
        const interval = setInterval(() => {
            count += 4;
            industryVariance.textContent = `±${Math.min(count, target)}%`;
            if (count >= target) clearInterval(interval);
        }, 50);
    }
}

// ============ TESTIMONIAL ANIMATIONS ============
function initTestimonialAnimations() {
    // Handle single row white card ticker
    const track = document.getElementById('testimonialRow1');
    if (track) {
        // Duplicate cards for seamless infinite scroll
        const cards = track.innerHTML;
        track.innerHTML = cards + cards;
        return;
    }

    // Fallback to old ticker
    const oldTrack = document.getElementById('testimonialsTicker');
    if (oldTrack) {
        const cards = oldTrack.innerHTML;
        oldTrack.innerHTML = cards + cards;
    }
}

// ============ POPULATE TICKERS ============
function populateClientsTicker() {
    const tickerRow1 = document.getElementById('clientsTickerRow1');
    const tickerRow2 = document.getElementById('clientsTickerRow2');

    if (!tickerRow1 && !tickerRow2) {
        // Fallback to old single ticker
        const ticker = document.getElementById('clientsTicker');
        if (!ticker) return;

        const createItem = (logo) => `
            <div class="ticker-logo-item">
                <img src="${logo}" alt="Partner logo" loading="lazy">
            </div>
        `;
        ticker.innerHTML = [...clientLogos, ...clientLogos, ...clientLogos].map(createItem).join('');
        return;
    }

    const createItem = (logo) => `
        <div class="ticker-logo-card">
            <img src="${logo}" alt="Partner logo" loading="lazy">
        </div>
    `;

    // Split logos for two rows
    const row1Logos = clientLogos.slice(0, 5);
    const row2Logos = clientLogos.slice(5, 10);

    // Quadruple for seamless loop
    if (tickerRow1) {
        tickerRow1.innerHTML = [...row1Logos, ...row1Logos, ...row1Logos, ...row1Logos].map(createItem).join('');
    }
    if (tickerRow2) {
        tickerRow2.innerHTML = [...row2Logos, ...row2Logos, ...row2Logos, ...row2Logos].map(createItem).join('');
    }
}

function populateReviewsTicker() {
    const ticker = document.getElementById('reviewsTicker');
    if (!ticker) return;

    const createReview = (review) => `
        <div class="review-mini">
            <div class="review-mini-stars">★★★★★</div>
            <div class="review-mini-text">${review.text}</div>
            <div class="review-mini-author">
                <div class="review-mini-avatar">${review.initials}</div>
                <div>
                    <div class="review-mini-name">${review.name}</div>
                    <div class="review-mini-role">${review.role}</div>
                </div>
            </div>
        </div>
    `;

    // Double for seamless loop
    ticker.innerHTML = [...googleReviews, ...googleReviews].map(createReview).join('');
}

// ============ CONSISTENCY CHART (Enhanced) ============
function initConsistencyChart() {
    const chartContainer = document.getElementById('consistencyChart');
    if (!chartContainer) return;

    const maxHeight = 180;
    let chartAnimated = false;

    // Create bar groups
    onixData.forEach((onix, i) => {
        const industry = industryData[i];
        const group = document.createElement('div');
        group.className = 'bar-group';

        const industryBar = document.createElement('div');
        industryBar.className = 'bar industry';
        industryBar.style.height = '0px';

        const onixBar = document.createElement('div');
        onixBar.className = 'bar onix';
        onixBar.style.height = '0px';

        group.appendChild(industryBar);
        group.appendChild(onixBar);
        chartContainer.appendChild(group);
    });

    // Animate all bars together when chart comes into view
    ScrollTrigger.create({
        trigger: chartContainer,
        start: "top 80%",
        onEnter: () => {
            if (chartAnimated) return;
            chartAnimated = true;

            const barGroups = chartContainer.querySelectorAll('.bar-group');

            barGroups.forEach((group, i) => {
                const industryBar = group.querySelector('.bar.industry');
                const onixBar = group.querySelector('.bar.onix');
                const onix = onixData[i];
                const industry = industryData[i];

                // Industry bars animate first with chaotic timing
                gsap.to(industryBar, {
                    height: (industry / 100) * maxHeight + 'px',
                    duration: 1.2,
                    delay: i * 0.06,
                    ease: "elastic.out(1, 0.5)"
                });

                // ONIX bars animate with smooth, consistent timing
                gsap.to(onixBar, {
                    height: (onix / 100) * maxHeight + 'px',
                    duration: 1,
                    delay: i * 0.08 + 0.3,
                    ease: "power3.out"
                });
            });

            // Add subtle pulse animation to ONIX bars after initial animation
            setTimeout(() => {
                const onixBars = chartContainer.querySelectorAll('.bar.onix');
                onixBars.forEach((bar, i) => {
                    gsap.to(bar, {
                        boxShadow: '0 0 25px rgba(201, 243, 29, 0.5)',
                        duration: 1,
                        delay: i * 0.05,
                        yoyo: true,
                        repeat: 1,
                        ease: "power2.inOut"
                    });
                });
            }, 2000);
        },
        once: true
    });
}

// ============ MARKETS PINNED SLIDESHOW ============
function initMarketsPinnedSlideshow() {
    const pinnedContainer = document.getElementById('marketsPinned');
    const slidesContainer = document.getElementById('marketSlides');
    if (!pinnedContainer || !slidesContainer) return;

    // Check if mobile - disable pinned effect
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        // On mobile, just show all slides stacked
        const slides = document.querySelectorAll('.market-slide');
        slides.forEach(slide => {
            slide.style.visibility = 'visible';
            slide.style.position = 'relative';
        });
        return;
    }

    const slides = gsap.utils.toArray('.market-slide');
    const outerWrappers = gsap.utils.toArray('.market-slide .slide-outer');
    const innerWrappers = gsap.utils.toArray('.market-slide .slide-inner');
    const bgElements = gsap.utils.toArray('.market-slide .slide-bg');
    const tabs = gsap.utils.toArray('.market-tabs-nav .market-tab');
    const counterCurrent = document.querySelector('.counter-current');
    const scrollHint = document.querySelector('.markets-scroll-hint');

    const numSlides = slides.length;
    const numTransitions = numSlides - 1;

    if (numSlides === 0) return;

    // ---- Initial States ----
    // Stack all slides with ascending z-index
    slides.forEach((slide, i) => {
        gsap.set(slide, { autoAlpha: 1, zIndex: i + 1 });
    });

    // First slide: fully visible
    gsap.set(outerWrappers[0], { yPercent: 0 });
    gsap.set(innerWrappers[0], { yPercent: 0 });
    gsap.set(bgElements[0], { yPercent: 0 });

    // Remaining slides: positioned below
    for (let i = 1; i < numSlides; i++) {
        gsap.set(outerWrappers[i], { yPercent: 100 });
        gsap.set(innerWrappers[i], { yPercent: -100 });
        gsap.set(bgElements[i], { yPercent: 15 });
    }

    // Set first tab active
    if (tabs[0]) tabs[0].classList.add('active');

    // ---- Build Master Timeline ----
    const masterTl = gsap.timeline();

    for (let i = 0; i < numTransitions; i++) {
        const tl = gsap.timeline();

        // Current slide: parallax up
        tl.to(bgElements[i], {
            yPercent: -15,
            duration: 1,
            ease: 'none'
        }, 0);

        // Next slide: outer/inner/bg slide in with parallax
        tl.to(outerWrappers[i + 1], {
            yPercent: 0,
            duration: 1,
            ease: 'none'
        }, 0);

        tl.to(innerWrappers[i + 1], {
            yPercent: 0,
            duration: 1,
            ease: 'none'
        }, 0);

        tl.to(bgElements[i + 1], {
            yPercent: 0,
            duration: 1,
            ease: 'none'
        }, 0);

        masterTl.add(tl);
    }

    // ---- ScrollTrigger: Pin + Scrub + Snap ----
    ScrollTrigger.create({
        trigger: '.markets-section',
        start: 'top top',
        end: () => '+=' + (numTransitions * window.innerHeight),
        pin: pinnedContainer,
        animation: masterTl,
        scrub: 0.5,
        snap: {
            snapTo: 1 / numTransitions,
            duration: { min: 0.2, max: 0.6 },
            delay: 0.05,
            ease: 'power1.inOut'
        },
        onUpdate: (self) => {
            const progress = self.progress;
            const index = Math.min(
                Math.round(progress * numTransitions),
                numTransitions
            );
            updateMarketsUI(index, progress);
        },
        onEnter: () => {
            // Hide scroll hint after first scroll
            if (scrollHint) {
                gsap.to(scrollHint, { opacity: 0, duration: 0.3 });
            }
        }
    });

    // ---- Split titles into characters for animation ----
    const titles = document.querySelectorAll('.panel-title');
    titles.forEach(title => {
        const text = title.textContent;
        title.innerHTML = '';
        text.split('').forEach((char, i) => {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char === ' ' ? '\u00A0' : char;
            title.appendChild(span);
        });
    });

    let currentSlideIndex = 0;

    // ---- Animate title chars with GSAP ----
    function animateTitleChars(slide, immediate = false) {
        if (!slide) return;

        const title = slide.querySelector('.panel-title');
        if (!title) return;

        const chars = title.querySelectorAll('.char');
        if (chars.length === 0) return;

        // Kill any existing animations on these chars
        gsap.killTweensOf(chars);

        // Set initial hidden state
        gsap.set(chars, {
            opacity: 0,
            y: '120%',
            rotateX: -90,
            scale: 0.8,
            filter: 'blur(4px)'
        });

        // Animate chars in with stagger
        gsap.to(chars, {
            opacity: 1,
            y: '0%',
            rotateX: 0,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.8,
            ease: 'back.out(1.7)',
            stagger: 0.04,
            delay: immediate ? 0 : 0.15
        });
    }

    // ---- UI Update Function ----
    function updateMarketsUI(index, progress) {
        // Update counter
        if (counterCurrent) {
            counterCurrent.textContent = String(index + 1).padStart(2, '0');
        }

        // Update active slide class and trigger animations
        if (index !== currentSlideIndex) {
            // Remove active from previous slide
            slides[currentSlideIndex]?.classList.remove('active');

            // Add active to new slide and animate
            slides[index]?.classList.add('active');
            animateTitleChars(slides[index]);

            currentSlideIndex = index;
        }

        // Update tabs
        tabs.forEach((tab, i) => {
            const isActive = i === index;
            tab.classList.toggle('active', isActive);

            // Update progress bar on active tab
            const progressBar = tab.querySelector('.tab-progress');
            if (progressBar) {
                if (isActive && index < numTransitions) {
                    // Calculate progress within current slide
                    const slideProgress = (progress * numTransitions) - index;
                    progressBar.style.width = (slideProgress * 100) + '%';
                } else if (i < index) {
                    progressBar.style.width = '100%';
                } else {
                    progressBar.style.width = '0%';
                }
            }
        });
    }

    // Set initial hidden state for all slide titles (GSAP will animate them)
    slides.forEach(slide => {
        const chars = slide.querySelectorAll('.panel-title .char');
        gsap.set(chars, {
            opacity: 0,
            y: '120%',
            rotateX: -90,
            scale: 0.8,
            filter: 'blur(4px)'
        });
    });

    // Track if first slide animation has played
    let firstSlideAnimated = false;

    // Animate first slide title when section comes into view
    ScrollTrigger.create({
        trigger: '.markets-section',
        start: 'top 85%',
        onEnter: () => {
            if (!firstSlideAnimated) {
                firstSlideAnimated = true;
                // Add active class and animate
                slides[0]?.classList.add('active');
                setTimeout(() => {
                    animateTitleChars(slides[0], true);
                }, 100);
            }
        },
        once: true
    });

    // Initial UI state (no active class yet - will be added when section enters view)
    updateMarketsUI(0, 0);

    // Tab click - scroll to that slide
    tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => {
            const targetProgress = i / numTransitions;
            const scrollTarget = ScrollTrigger.getAll().find(st => st.trigger === '.markets-section');
            if (scrollTarget) {
                const targetScroll = scrollTarget.start + (targetProgress * (scrollTarget.end - scrollTarget.start));
                gsap.to(window, {
                    scrollTo: targetScroll,
                    duration: 0.8,
                    ease: 'power2.inOut'
                });
            }
        });
    });
}

// ============ CTA STARS BACKGROUND ============
function initCtaStars() {
    const ctaSection = document.querySelector('.cta-section');
    if (!ctaSection) return;

    // Create stars container
    const starsContainer = document.createElement('div');
    starsContainer.className = 'cta-stars';

    // Generate random stars
    const numStars = 80;
    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.className = 'cta-star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.animationDuration = (2 + Math.random() * 2) + 's';

        // Vary star sizes
        const size = 1 + Math.random() * 2;
        star.style.width = size + 'px';
        star.style.height = size + 'px';

        starsContainer.appendChild(star);
    }

    // Insert at beginning of section
    ctaSection.insertBefore(starsContainer, ctaSection.firstChild);
}

// ============ FORM HANDLING ============
function initFormHandling() {
    const form = document.getElementById('ctaForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('ctaEmail').value;
        const button = form.querySelector('button');

        if (email && email.includes('@')) {
            button.innerHTML = `
                <span>Application Received</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
            `;
            button.style.background = '#4CAF50';
        }
    });
}

// ============ SMOOTH SCROLL ============
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ============ LEAD CARDS HORIZONTAL SCROLL ============
function initLeadsScroll() {
    const grid = document.querySelector('.leads-grid');
    const cards = document.querySelectorAll('.lead-card');

    if (!grid || cards.length === 0) return;

    // Animate cards when grid comes into view
    ScrollTrigger.create({
        trigger: grid,
        start: "top 80%",
        onEnter: () => {
            gsap.to(cards, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: "back.out(1.5)"
            });
        },
        once: true
    });
}

// ============ PARALLAX EFFECTS ============
function initParallax() {
    // Hero orbs parallax on mouse move
    const heroOrbs = document.querySelector('.hero-orbs');
    if (heroOrbs) {
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 30;
            const y = (e.clientY / window.innerHeight - 0.5) * 30;

            gsap.to(heroOrbs, {
                x: -x,
                y: -y,
                duration: 0.5,
                ease: "power2.out"
            });
        });
    }
}

// ============ 3D GLOBE (Ocean Blue Theme with Pinned Locations) ============
function initGlobe() {
    const container = document.getElementById('globeContainer');
    const canvas = document.getElementById('globeCanvas');
    if (!container || !canvas || typeof THREE === 'undefined') return;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 2.8;

    const RADIUS = 1;
    const LIME = 0xc9f31d; // Accent color

    // Ocean Blue Theme
    const theme = {
        bg: 0x0a0a0a,
        globe: 0x0d3b5e,
        line: 0x1565c0,
        dot: 0x4dd0e1,
        arc: 0x00bcd4,
        glow: 0x00acc1
    };

    // Helper: lat/lon to Vector3
    function latLonToVec3(lat, lon, r) {
        const phi = (90 - lat) * Math.PI / 180;
        const theta = (lon + 180) * Math.PI / 180;
        return new THREE.Vector3(
            -r * Math.sin(phi) * Math.cos(theta),
            r * Math.cos(phi),
            r * Math.sin(phi) * Math.sin(theta)
        );
    }

    // Cities with pinned locations
    const cities = [
        { lat: 51.5, lon: -0.1, label: 'UK', pin: true },
        { lat: 40.7, lon: -74.0, label: 'US', pin: true },
        { lat: 35.7, lon: 139.7, label: null, pin: false },
        { lat: -33.9, lon: 151.2, label: 'AUS', pin: true },
        { lat: 48.9, lon: 2.3, label: null, pin: false },
        { lat: 19.1, lon: 72.9, label: null, pin: false },
        { lat: 55.8, lon: 37.6, label: null, pin: false },
        { lat: -23.5, lon: -46.6, label: null, pin: false },
        { lat: 1.3, lon: 103.8, label: null, pin: false },
        { lat: 30.0, lon: 31.2, label: null, pin: false },
        { lat: 41.0, lon: 29.0, label: null, pin: false },
        { lat: 34.0, lon: -118.2, label: null, pin: false },
        { lat: 43.7, lon: -79.4, label: null, pin: false },
        { lat: -34.6, lon: -58.4, label: null, pin: false },
        { lat: 28.6, lon: 77.2, label: null, pin: false },
        { lat: 23.1, lon: 113.3, label: null, pin: false },
        { lat: 37.6, lon: 126.9, label: null, pin: false },
        { lat: 13.8, lon: 100.5, label: null, pin: false },
        { lat: 6.5, lon: 3.4, label: null, pin: false },
        { lat: 33.9, lon: -6.9, label: null, pin: false },
        { lat: -41.3, lon: 174.8, label: 'NZ', pin: true },
    ];

    const connections = [
        [0, 1], [1, 2], [2, 3], [0, 4], [1, 6], [5, 15], [7, 11],
        [8, 9], [3, 13], [4, 10], [12, 11], [14, 16], [17, 8], [18, 9], [19, 4],
        [20, 3], [20, 0], [20, 1] // NZ connections
    ];

    // Create teardrop pin marker
    function makeTearDrop(color) {
        const shape = new THREE.Shape();
        const w = 0.06, h = 0.12;
        shape.moveTo(0, 0);
        shape.bezierCurveTo(-w, h * 0.4, -w, h * 0.7, 0, h);
        shape.bezierCurveTo(w, h * 0.7, w, h * 0.4, 0, 0);
        const body = new THREE.Mesh(
            new THREE.ShapeGeometry(shape),
            new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })
        );
        const hole = new THREE.Mesh(
            new THREE.CircleGeometry(0.03, 20),
            new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide })
        );
        hole.position.set(0, h * 0.65, 0.001);
        const g = new THREE.Group();
        g.add(body);
        g.add(hole);
        return g;
    }

    // Create label sprite
    function makeLabelSprite(text) {
        const c = document.createElement('canvas');
        c.width = 128;
        c.height = 48;
        const ctx = c.getContext('2d');
        ctx.font = 'bold 26px Arial';
        ctx.fillStyle = '#c9f31d';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 64, 24);
        const mat = new THREE.SpriteMaterial({
            map: new THREE.CanvasTexture(c),
            transparent: true,
            depthTest: false
        });
        const s = new THREE.Sprite(mat);
        s.scale.set(0.3, 0.11, 1);
        return s;
    }

    let globeMesh, atmosphereMesh, gridGroup, dotsGroup, arcsGroup;

    function buildScene() {
        // Stars background
        const sv = [];
        for (let i = 0; i < 2000; i++) {
            sv.push((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200);
        }
        const sg = new THREE.BufferGeometry();
        sg.setAttribute('position', new THREE.Float32BufferAttribute(sv, 3));
        scene.add(new THREE.Points(sg, new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.1,
            transparent: true,
            opacity: 0.4
        })));

        // Globe sphere
        globeMesh = new THREE.Mesh(
            new THREE.SphereGeometry(RADIUS, 64, 64),
            new THREE.MeshPhongMaterial({ color: theme.globe, shininess: 80 })
        );
        scene.add(globeMesh);

        // Atmosphere glow
        atmosphereMesh = new THREE.Mesh(
            new THREE.SphereGeometry(RADIUS * 1.04, 64, 64),
            new THREE.MeshPhongMaterial({
                color: theme.glow,
                transparent: true,
                opacity: 0.07,
                side: THREE.BackSide
            })
        );
        scene.add(atmosphereMesh);

        // Grid lines
        gridGroup = new THREE.Group();
        const lm = new THREE.LineBasicMaterial({ color: theme.line, transparent: true, opacity: 0.4 });
        for (let lat = -80; lat <= 80; lat += 20) {
            const pts = [];
            for (let lon = 0; lon <= 360; lon += 3) pts.push(latLonToVec3(lat, lon - 180, RADIUS + 0.001));
            gridGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lm.clone()));
        }
        for (let lon = -180; lon <= 180; lon += 20) {
            const pts = [];
            for (let lat = -90; lat <= 90; lat += 3) pts.push(latLonToVec3(lat, lon, RADIUS + 0.001));
            gridGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lm.clone()));
        }
        scene.add(gridGroup);

        // Dots and pins
        dotsGroup = new THREE.Group();
        cities.forEach(city => {
            if (city.pin) {
                const surfPos = latLonToVec3(city.lat, city.lon, RADIUS);
                const outPos = latLonToVec3(city.lat, city.lon, RADIUS + 0.01);
                const normal = surfPos.clone().normalize();
                const up = new THREE.Vector3(0, 1, 0);
                const axis = new THREE.Vector3().crossVectors(up, normal).normalize();
                const angle = Math.acos(Math.max(-1, Math.min(1, up.dot(normal))));

                const pin = makeTearDrop(LIME);
                pin.position.copy(outPos);
                pin.quaternion.setFromAxisAngle(axis.lengthSq() < 0.0001 ? new THREE.Vector3(1, 0, 0) : axis, angle);
                dotsGroup.add(pin);

                const labelPos = latLonToVec3(city.lat, city.lon, RADIUS + 0.23);
                const label = makeLabelSprite(city.label);
                label.position.copy(labelPos);
                dotsGroup.add(label);

                const stick = new THREE.Line(
                    new THREE.BufferGeometry().setFromPoints([outPos, latLonToVec3(city.lat, city.lon, RADIUS + 0.19)]),
                    new THREE.LineBasicMaterial({ color: LIME, transparent: true, opacity: 0.55 })
                );
                dotsGroup.add(stick);
            } else {
                const pos = latLonToVec3(city.lat, city.lon, RADIUS + 0.008);
                const dot = new THREE.Mesh(
                    new THREE.SphereGeometry(0.018, 8, 8),
                    new THREE.MeshBasicMaterial({ color: theme.dot })
                );
                dot.position.copy(pos);
                dotsGroup.add(dot);

                const ring = new THREE.Mesh(
                    new THREE.RingGeometry(0.022, 0.03, 16),
                    new THREE.MeshBasicMaterial({ color: theme.dot, side: THREE.DoubleSide, transparent: true, opacity: 0.5 })
                );
                ring.position.copy(pos);
                ring.lookAt(0, 0, 0);
                ring.userData.isRing = true;
                dotsGroup.add(ring);
            }
        });
        scene.add(dotsGroup);

        // Connection arcs
        arcsGroup = new THREE.Group();
        connections.forEach(([a, b]) => {
            const p1 = latLonToVec3(cities[a].lat, cities[a].lon, RADIUS);
            const p2 = latLonToVec3(cities[b].lat, cities[b].lon, RADIUS);
            const mid = p1.clone().add(p2).multiplyScalar(0.5);
            mid.normalize().multiplyScalar(1 + 0.4 + Math.random() * 0.3);
            const arc = new THREE.Line(
                new THREE.BufferGeometry().setFromPoints(new THREE.QuadraticBezierCurve3(p1, mid, p2).getPoints(60)),
                new THREE.LineBasicMaterial({ color: theme.arc, transparent: true, opacity: 0 })
            );
            arc.userData.progress = Math.random() * 1.8;
            arc.userData.speed = 0.003 + Math.random() * 0.004;
            arcsGroup.add(arc);
        });
        scene.add(arcsGroup);

        // Lighting
        scene.add(new THREE.AmbientLight(0xffffff, 0.3));
        const d = new THREE.DirectionalLight(0xffffff, 0.8);
        d.position.set(5, 3, 5);
        scene.add(d);
        const r = new THREE.DirectionalLight(theme.glow, 0.4);
        r.position.set(-5, -3, -5);
        scene.add(r);
    }

    buildScene();

    // Interaction variables
    let isDragging = false, prev = { x: 0, y: 0 };
    let rotX = 0, rotY = 0, velX = 0, velY = 0;
    let autoSpin = true, zoom = 3.6;

    // Mouse/touch events
    canvas.addEventListener('mousedown', e => {
        isDragging = true;
        prev = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mouseup', () => { isDragging = false; });
    window.addEventListener('mousemove', e => {
        if (!isDragging) return;
        velY = (e.clientX - prev.x) * 0.005;
        velX = (e.clientY - prev.y) * 0.005;
        rotY += velY;
        rotX += velX;
        rotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotX));
        prev = { x: e.clientX, y: e.clientY };
    });
    canvas.addEventListener('touchstart', e => {
        isDragging = true;
        prev = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });
    canvas.addEventListener('touchend', () => { isDragging = false; });
    canvas.addEventListener('touchmove', e => {
        e.preventDefault();
        if (!isDragging) return;
        velY = (e.touches[0].clientX - prev.x) * 0.005;
        velX = (e.touches[0].clientY - prev.y) * 0.005;
        rotY += velY;
        rotX += velX;
        rotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotX));
        prev = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: false });

    let t = 0;
    function animate() {
        requestAnimationFrame(animate);
        t += 0.01;

        if (!isDragging) {
            velX *= 0.92;
            velY *= 0.92;
            rotX += velX;
            rotY += velY;
            if (autoSpin) rotY += 0.002;
        }

        [globeMesh, atmosphereMesh, gridGroup, dotsGroup, arcsGroup].forEach(o => {
            if (o) {
                o.rotation.x = rotX;
                o.rotation.y = rotY;
            }
        });

        // Animate arcs
        arcsGroup.children.forEach(arc => {
            arc.userData.progress += arc.userData.speed;
            if (arc.userData.progress > 1.8) arc.userData.progress = 0;
            const p = arc.userData.progress;
            const alpha = p < 0.3 ? p / 0.3 : p > 1.2 ? Math.max(0, (1.8 - p) / 0.6) : 1;
            arc.material.opacity = alpha * 0.85;
        });

        // Animate rings
        dotsGroup.children.forEach((obj, i) => {
            if (obj.userData.isRing) obj.material.opacity = 0.3 + 0.3 * Math.sin(t * 2 + i);
        });

        camera.position.z = zoom;
        renderer.render(scene, camera);
    }
    animate();

    // Handle resize
    function handleResize() {
        const width = container.clientWidth;
        const height = container.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', handleResize);

    // Scroll-triggered appearance
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.create({
            trigger: container,
            start: "top 80%",
            onEnter: () => {
                gsap.from(globeMesh.scale, {
                    x: 0.5, y: 0.5, z: 0.5,
                    duration: 1.2,
                    ease: "elastic.out(1, 0.5)"
                });
            },
            once: true
        });
    }
}

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initCursor();
    initMagnetic();
    initNavbar();

    // Populate dynamic content
    populateClientsTicker();
    initConsistencyChart();
    initMarketsPinnedSlideshow();

    // Initialize 3D Globe
    initGlobe();

    // Hero animations (immediate)
    initHeroAnimations();

    // Scroll-triggered animations
    initTitleAnimations();
    initAuthorityAnimations();
    initCounterAnimations();
    initStoryAnimations();
    initPerfSubtitleAnimation();
    initLeadsSubtitleAnimation();
    initConsistencySubtitleAnimation();
    initTimelineAnimations();
    initBentoTilt();
    initRankingsAnimation();
    initProcessAnimations();
    initConsistencyAnimations();
    initTestimonialAnimations();
    initLeadsScroll();

    // Interactions
    initFormHandling();
    initSmoothScroll();
    initParallax();
    initCtaStars();

    console.log('ONIX Insurance page initialized');
});

// Refresh ScrollTrigger on resize
window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
});
