/**
 * ONIX Real Estate Page - Animations & Interactions
 * GSAP-powered animations + Three.js 3D Property Model
 */

// Wait for GSAP to be available (loaded from CDN)
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
} else {
    console.error('GSAP not loaded - animations will not work');
}

// ============ DATA ============

const heroStats = [
    { target: 156, suffix: '', prefix: '', label: 'Listings Sold', desc: 'Properties closed this year', change: '+28%' },
    { target: 4.8, suffix: 'M', prefix: '$', label: 'Total Sales', desc: 'Revenue generated for clients', change: '+52%', decimals: 1 },
    { target: 892, suffix: '', prefix: '', label: 'Buyer Leads', desc: 'Qualified buyers delivered', change: '+41%' },
    { target: 64, suffix: '', prefix: '', label: 'Showings Booked', desc: 'Automated viewing bookings', change: '+35%' }
];

const authorityStats = [
    { value: '100%', label: 'Exclusive Leads', desc: 'Never resold' },
    { value: '3', label: 'Markets', desc: 'NZ, AU & Bali' },
    { value: 'Zero', label: 'Peaks & Troughs', desc: 'Consistent delivery' },
    { value: '12/12', label: 'Months Delivery', desc: 'Unbroken performance' }
];

const markets = {
    nz: {
        flag: 'NZ',
        name: 'New Zealand',
        desc: "New Zealand's property market is our home ground. We've perfected lead generation across Auckland, Wellington, Christchurch and regional markets with deep understanding of local buyer behaviour.",
        specs: [
            { label: 'Lead Types', val: 'Buyer \u00B7 Seller \u00B7 Investor \u00B7 Valuation' },
            { label: 'Target CPL', val: 'NZD $28\u2013$55' },
            { label: 'Exclusivity', val: '100% \u2014 yours alone' },
            { label: 'Delivery', val: 'Real-time to your CRM' },
            { label: 'Coverage', val: 'Auckland \u00B7 Wellington \u00B7 All Regions' },
            { label: 'Volume', val: 'Scalable to your capacity' }
        ],
        cta: 'Apply for NZ Access'
    },
    au: {
        flag: 'AU',
        name: 'Australia',
        desc: "Australia's competitive real estate market demands precision. We deliver pre-qualified property leads across Sydney, Melbourne, Brisbane and beyond with REIA-aware compliance.",
        specs: [
            { label: 'Lead Types', val: 'Buyer \u00B7 Seller \u00B7 Investor \u00B7 Valuation' },
            { label: 'Target CPL', val: 'AUD $35\u2013$65' },
            { label: 'Exclusivity', val: '100% \u2014 yours alone' },
            { label: 'Delivery', val: 'Real-time to your CRM' },
            { label: 'Coverage', val: 'Sydney \u00B7 Melbourne \u00B7 Brisbane \u00B7 Perth' },
            { label: 'Compliance', val: 'REIA-aware campaigns' }
        ],
        cta: 'Apply for AU Access'
    },
    bali: {
        flag: 'ID',
        name: 'Bali / Indonesia',
        desc: "The Bali property market attracts global investors and lifestyle buyers. We connect agents with high-intent international and domestic buyers seeking villas, land and investment properties.",
        specs: [
            { label: 'Lead Types', val: 'Buyer \u00B7 Investor \u00B7 Rental \u00B7 Development' },
            { label: 'Target CPL', val: 'USD $40\u2013$75' },
            { label: 'Exclusivity', val: '100% \u2014 yours alone' },
            { label: 'Delivery', val: 'Real-time to your CRM' },
            { label: 'Coverage', val: 'Bali \u00B7 Jakarta \u00B7 Major Indonesian Markets' },
            { label: 'Buyer Type', val: 'International & Domestic' }
        ],
        cta: 'Apply for Bali Access'
    }
};

const leadTypes = [
    {
        icon: '/images/icons/real-estate.png',
        title: 'Buyer Leads',
        desc: 'Pre-qualified buyers actively searching for properties in your target areas. Verified budget, timeline, and property preferences.',
        stat: { value: '12k+', label: 'Leads/Year' }
    },
    {
        icon: '/images/icons/real-estate.png',
        title: 'Seller Leads',
        desc: 'Homeowners ready to list their property. Pre-screened for motivation level, timeline, and property details.',
        stat: { value: '8k+', label: 'Leads/Year' }
    },
    {
        icon: '/images/icons/real-estate.png',
        title: 'Investor Leads',
        desc: 'Property investors seeking rental yields or capital growth. Qualified by budget, investment criteria, and purchase timeline.',
        stat: { value: '5k+', label: 'Leads/Year' }
    },
    {
        icon: '/images/icons/real-estate.png',
        title: 'Property Valuations',
        desc: 'Homeowners requesting property appraisals. High-intent listing opportunities with verified ownership and motivation.',
        stat: { value: '85%', label: 'List Conversion' }
    }
];

const properties = [
    {
        image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop',
        address: '42 Remuera Road, Auckland',
        price: '$2,450,000',
        beds: 4,
        baths: 3,
        size: '320m\u00B2',
        status: 'SOLD via ONIX Lead'
    },
    {
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop',
        address: '15 Bondi Beach Rd, Sydney',
        price: '$3,200,000',
        beds: 5,
        baths: 4,
        size: '450m\u00B2',
        status: 'SOLD via ONIX Lead'
    },
    {
        image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop',
        address: 'Jl. Pantai Berawa, Canggu',
        price: '$890,000',
        beds: 3,
        baths: 3,
        size: '280m\u00B2',
        status: 'SOLD via ONIX Lead'
    },
    {
        image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop',
        address: '88 Oriental Parade, Wellington',
        price: '$1,650,000',
        beds: 3,
        baths: 2,
        size: '185m\u00B2',
        status: 'SOLD via ONIX Lead'
    },
    {
        image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=400&fit=crop',
        address: '234 Chapel St, Melbourne',
        price: '$1,890,000',
        beds: 4,
        baths: 3,
        size: '260m\u00B2',
        status: 'SOLD via ONIX Lead'
    },
    {
        image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&h=400&fit=crop',
        address: 'Jl. Kayu Aya, Seminyak',
        price: '$1,200,000',
        beds: 4,
        baths: 4,
        size: '380m\u00B2',
        status: 'SOLD via ONIX Lead'
    }
];

const testimonials = [
    { initials: 'NM', name: 'Nicky M.', role: 'Real Estate Agent \u2014 West Auckland', text: '"Sean\'s leads and system have given us an extra $100k on our bottom line year on year."' },
    { initials: 'AS', name: 'Amanda S.', role: 'Real Estate Agent \u2014 Wellington', text: '"The leads we\'ve been getting have cost us 12% of our gross commission. We\'re very happy!"' },
    { initials: 'CM', name: 'Carolyn M.', role: 'Real Estate Agent \u2014 Napier', text: '"Finally, leads that actually want to buy. Not tyre-kickers or people who listed 3 years ago."' },
    { initials: 'JT', name: 'James T.', role: 'Property Manager \u2014 Sydney', text: '"We doubled our listings in 6 months. The investor leads are particularly high quality."' },
    { initials: 'SL', name: 'Sarah L.', role: 'Real Estate Agent \u2014 Hamilton', text: '"The automation is incredible. Leads appear in my CRM ready to call within minutes."' },
    { initials: 'MK', name: 'Mike K.', role: 'Agency Owner \u2014 Bali', text: '"International buyers from Australia and Europe \u2014 exactly the clients we needed for our villa listings."' },
    { initials: 'RB', name: 'Rachel B.', role: 'Real Estate Agent \u2014 Melbourne', text: '"Consistent flow every month. No more feast or famine cycles."' },
    { initials: 'DW', name: 'David W.', role: 'Team Leader \u2014 Brisbane', text: '"My team of 5 agents all have full pipelines now. Best investment we\'ve made."' }
];

const clientLogos = [
    '/logos/logot1.jpeg',
    '/logos/logot2.webp',
    '/logos/logot3.webp',
    '/logos/logot4.webp',
    '/logos/logot5.png',
    '/logos/logot6.jpeg',
    '/logos/logot7.webp',
    '/logos/logot8.webp',
    '/logos/logot9.webp',
    '/logos/logot10.png'
];

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

    function animate() {
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;
        followerX += (mouseX - followerX) * 0.1;
        followerY += (mouseY - followerY) * 0.1;

        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        follower.style.left = followerX + 'px';
        follower.style.top = followerY + 'px';

        requestAnimationFrame(animate);
    }
    animate();

    // Hover states
    const hoverElements = document.querySelectorAll('a, button, .magnetic, [data-hover]');
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
                duration: 0.5,
                ease: 'elastic.out(1, 0.3)'
            });
        });
    });
}

// ============ NAVBAR ============

function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateNavbar() {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 100) {
            navbar.classList.add('scrolled');

            if (currentScrollY > lastScrollY && currentScrollY > 200) {
                navbar.classList.add('hidden');
            } else {
                navbar.classList.remove('hidden');
            }
        } else {
            navbar.classList.remove('scrolled');
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
}

// ============ MOBILE MENU ============

function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });
}

// ============ SPLIT TEXT UTILITIES ============

function splitTextIntoChars(element) {
    if (!element || element.dataset.split === 'true') return;

    const text = element.textContent;
    element.innerHTML = '';

    text.split('').forEach(char => {
        const span = document.createElement('span');
        span.className = char === ' ' ? 'char space' : 'char';
        span.textContent = char === ' ' ? '\u00A0' : char;
        element.appendChild(span);
    });

    element.dataset.split = 'true';
}

function splitIntoWords(element) {
    if (!element || element.dataset.split === 'true') return;

    const html = element.innerHTML;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    function processNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const words = node.textContent.split(/(\s+)/);
            const fragment = document.createDocumentFragment();
            words.forEach(word => {
                if (word.trim()) {
                    const span = document.createElement('span');
                    span.className = 'word';
                    span.textContent = word;
                    fragment.appendChild(span);
                } else if (word) {
                    fragment.appendChild(document.createTextNode(word));
                }
            });
            return fragment;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const clone = node.cloneNode(false);
            node.childNodes.forEach(child => {
                clone.appendChild(processNode(child));
            });
            return clone;
        }
        return node.cloneNode(true);
    }

    element.innerHTML = '';
    tempDiv.childNodes.forEach(child => {
        element.appendChild(processNode(child));
    });

    element.dataset.split = 'true';
}

// ============ HERO ANIMATIONS ============

function initHeroAnimations() {
    const heroTitle = document.getElementById('heroTitle');
    const heroSubtitle = document.getElementById('heroSubtitle');
    const heroBadge = document.querySelector('.hero-badge');
    const heroButtons = document.querySelectorAll('.hero-actions .btn-primary, .hero-actions .btn-ghost');
    const heroCards = document.querySelectorAll('.hero-card');
    const scrollIndicator = document.querySelector('.scroll-indicator');

    // Split title into characters
    if (heroTitle) {
        heroTitle.querySelectorAll('.title-line').forEach(line => {
            const highlight = line.querySelector('.highlight');
            const textHighlighter = line.querySelector('.text-highlighter');

            if (highlight && !textHighlighter) {
                const beforeText = line.childNodes[0]?.textContent || '';
                const highlightText = highlight.textContent;
                const afterText = line.childNodes[2]?.textContent || '';

                line.innerHTML = '';

                if (beforeText.trim()) {
                    beforeText.split('').forEach(char => {
                        const span = document.createElement('span');
                        span.className = char === ' ' ? 'char space' : 'char';
                        span.textContent = char === ' ' ? '\u00A0' : char;
                        line.appendChild(span);
                    });
                }

                const newHighlight = document.createElement('span');
                newHighlight.className = 'highlight';
                highlightText.split('').forEach(char => {
                    const span = document.createElement('span');
                    span.className = char === ' ' ? 'char space' : 'char';
                    span.textContent = char === ' ' ? '\u00A0' : char;
                    newHighlight.appendChild(span);
                });
                line.appendChild(newHighlight);

                if (afterText.trim()) {
                    afterText.split('').forEach(char => {
                        const span = document.createElement('span');
                        span.className = char === ' ' ? 'char space' : 'char';
                        span.textContent = char === ' ' ? '\u00A0' : char;
                        line.appendChild(span);
                    });
                }
            } else if (textHighlighter) {
                // Handle text-highlighter specially
                const parts = [];
                line.childNodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                        parts.push({ type: 'text', content: node.textContent });
                    } else if (node.nodeType === Node.ELEMENT_NODE) {
                        parts.push({ type: 'element', node: node.cloneNode(true) });
                    }
                });

                line.innerHTML = '';
                parts.forEach(part => {
                    if (part.type === 'text') {
                        part.content.split('').forEach(char => {
                            const span = document.createElement('span');
                            span.className = char === ' ' ? 'char space' : 'char';
                            span.textContent = char === ' ' ? '\u00A0' : char;
                            line.appendChild(span);
                        });
                    } else {
                        // For text-highlighter, split its text content
                        const el = part.node;
                        const innerText = el.textContent;
                        el.innerHTML = '';
                        innerText.split('').forEach(char => {
                            const span = document.createElement('span');
                            span.className = char === ' ' ? 'char space' : 'char';
                            span.textContent = char === ' ' ? '\u00A0' : char;
                            el.appendChild(span);
                        });
                        // Re-add highlighter line
                        const highlighterLine = document.createElement('span');
                        highlighterLine.className = 'highlighter-line';
                        el.appendChild(highlighterLine);
                        line.appendChild(el);
                    }
                });
            } else {
                splitTextIntoChars(line);
            }
        });
    }

    // Split subtitle into words
    if (heroSubtitle) {
        splitIntoWords(heroSubtitle);
    }

    // Animation timeline
    const tl = gsap.timeline({ delay: 0.2 });

    // Badge
    if (heroBadge) {
        tl.to(heroBadge, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out'
        }, 0);
    }

    // Title characters
    if (heroTitle) {
        const chars = heroTitle.querySelectorAll('.char');
        tl.to(chars, {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.8,
            stagger: 0.02,
            ease: 'back.out(1.7)'
        }, 0.4);
    }

    // Subtitle words
    if (heroSubtitle) {
        const words = heroSubtitle.querySelectorAll('.word');
        tl.to(words, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.04,
            ease: 'power3.out'
        }, 1.4);
    }

    // Buttons
    if (heroButtons.length) {
        tl.to(heroButtons, {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.6,
            stagger: 0.15,
            ease: 'power3.out'
        }, 2.0);
    }

    // Hero stat cards
    if (heroCards.length) {
        tl.to(heroCards, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: 'back.out(1.5)'
        }, 2.2);

        // Count up animation for stats
        heroCards.forEach((card, index) => {
            const countEl = card.querySelector('.hero-count');
            if (countEl && heroStats[index]) {
                const stat = heroStats[index];
                const decimals = stat.decimals || 0;

                gsap.fromTo(countEl, {
                    textContent: 0
                }, {
                    textContent: stat.target,
                    duration: 2,
                    delay: 2.4 + index * 0.2,
                    ease: 'power2.out',
                    snap: { textContent: decimals ? 0.1 : 1 },
                    onUpdate: function() {
                        const val = parseFloat(this.targets()[0].textContent);
                        countEl.textContent = (stat.prefix || '') + (decimals ? val.toFixed(decimals) : Math.round(val)) + (stat.suffix || '');
                    }
                });
            }
        });
    }

    // Scroll indicator
    if (scrollIndicator) {
        tl.to(scrollIndicator, {
            opacity: 1,
            duration: 0.6,
            ease: 'power3.out'
        }, 2.8);
    }
}

// ============ SECTION TITLE ANIMATIONS ============

function initSectionTitleAnimations() {
    const sectionTitles = document.querySelectorAll('.section-title');

    sectionTitles.forEach(title => {
        // Split words into chars
        title.querySelectorAll('.word').forEach(word => {
            const text = word.textContent;
            const isHighlight = word.classList.contains('highlight');
            word.innerHTML = '';

            text.split('').forEach(char => {
                const span = document.createElement('span');
                span.className = char === ' ' ? 'char space' : 'char';
                if (isHighlight) span.style.color = 'var(--accent)';
                span.textContent = char === ' ' ? '\u00A0' : char;
                word.appendChild(span);
            });
        });

        // Animate on scroll
        ScrollTrigger.create({
            trigger: title,
            start: 'top 80%',
            onEnter: () => {
                gsap.to(title.querySelectorAll('.char'), {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    duration: 0.6,
                    stagger: 0.015,
                    ease: 'back.out(1.7)'
                });
            },
            once: true
        });
    });
}

// ============ AUTHORITY SECTION ============

function initAuthoritySection() {
    const authorityTitle = document.getElementById('authorityTitle');
    const authoritySub = document.getElementById('authoritySub');
    const authCards = document.querySelectorAll('.auth-card');

    if (authorityTitle) {
        splitTextIntoChars(authorityTitle.querySelector('.highlight') || authorityTitle);

        ScrollTrigger.create({
            trigger: authorityTitle,
            start: 'top 80%',
            onEnter: () => {
                gsap.to(authorityTitle.querySelectorAll('.char'), {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    duration: 0.8,
                    stagger: 0.02,
                    ease: 'back.out(1.7)'
                });

                // Typewriter for subtitle
                if (authoritySub) {
                    typewriterEffect(authoritySub, authoritySub.dataset.text || authoritySub.textContent, 1.5);
                }
            },
            once: true
        });
    }

    // Auth cards animation
    if (authCards.length) {
        ScrollTrigger.create({
            trigger: authCards[0],
            start: 'top 80%',
            onEnter: () => {
                gsap.to(authCards, {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: 'back.out(1.5)'
                });
            },
            once: true
        });
    }
}

// ============ TYPEWRITER EFFECT ============

function typewriterEffect(element, text, delay = 0) {
    if (!element) return;

    element.innerHTML = '<span class="typewriter-text"></span><span class="typewriter-cursor"></span>';
    const textEl = element.querySelector('.typewriter-text');

    gsap.to({}, {
        duration: text.length * 0.05,
        delay: delay,
        onUpdate: function() {
            const progress = Math.floor(this.progress() * text.length);
            textEl.textContent = text.substring(0, progress);
        },
        onComplete: () => {
            textEl.textContent = text;
            // Fade cursor after completion
            gsap.to(element.querySelector('.typewriter-cursor'), {
                opacity: 0,
                delay: 2,
                duration: 0.3
            });
        }
    });
}

// ============ BENTO CARDS ANIMATION ============

function initBentoCards() {
    const bentoCards = document.querySelectorAll('.bento-card');

    bentoCards.forEach(card => {
        ScrollTrigger.create({
            trigger: card,
            start: 'top 85%',
            onEnter: () => {
                gsap.to(card, {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    ease: 'back.out(1.5)'
                });
            },
            once: true
        });

        // Tilt effect
        if (card.dataset.tilt !== undefined) {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;

                gsap.to(card, {
                    rotateY: x * 10,
                    rotateX: -y * 10,
                    duration: 0.3,
                    ease: 'power2.out'
                });

                // Move ray
                const ray = card.querySelector('.bento-card-ray');
                if (ray) {
                    gsap.to(ray, {
                        x: x * 50,
                        y: y * 30,
                        duration: 0.3
                    });
                }
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    rotateY: 0,
                    rotateX: 0,
                    duration: 0.5,
                    ease: 'elastic.out(1, 0.5)'
                });

                const ray = card.querySelector('.bento-card-ray');
                if (ray) {
                    gsap.to(ray, {
                        x: 0,
                        y: 0,
                        duration: 0.5
                    });
                }
            });
        }
    });
}

// ============ LEAD CARDS ANIMATION ============

function initLeadCards() {
    const leadCards = document.querySelectorAll('.lead-card');

    if (leadCards.length) {
        ScrollTrigger.create({
            trigger: leadCards[0],
            start: 'top 80%',
            onEnter: () => {
                gsap.to(leadCards, {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.15,
                    ease: 'back.out(1.5)'
                });
            },
            once: true
        });
    }
}

// ============ PROCESS CARDS ANIMATION ============

function initProcessCards() {
    const processCards = document.querySelectorAll('.process-card');

    if (processCards.length) {
        ScrollTrigger.create({
            trigger: processCards[0],
            start: 'top 80%',
            onEnter: () => {
                gsap.to(processCards, {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.15,
                    ease: 'back.out(1.5)'
                });
            },
            once: true
        });
    }
}

// ============ PROPERTY SHOWCASE CAROUSEL ============

function initPropertyShowcase() {
    const track = document.getElementById('carouselTrack');
    const carousel = document.getElementById('showcaseCarousel');

    if (!track) return;

    // Hide the controls (we'll use continuous scroll instead)
    const controls = carousel?.querySelector('.carousel-controls');
    if (controls) controls.style.display = 'none';

    // Create card HTML
    const createCard = (p) => `
        <div class="property-card">
            <div class="property-image-wrapper">
                <img src="${p.image}" alt="${p.address}" class="property-image" loading="lazy">
                <span class="property-status">${p.status}</span>
            </div>
            <div class="property-details">
                <h4 class="property-address">${p.address}</h4>
                <span class="property-price">${p.price}</span>
                <div class="property-meta">
                    <span>${p.beds} Beds</span>
                    <span>${p.baths} Baths</span>
                    <span>${p.size}</span>
                </div>
            </div>
        </div>
    `;

    // Duplicate properties for seamless infinite scroll
    const allCards = [...properties, ...properties, ...properties];
    track.innerHTML = allCards.map(createCard).join('');

    // Set up continuous scroll animation
    const cards = track.querySelectorAll('.property-card');
    const cardWidth = 380; // Approximate card width
    const gap = 32;
    const totalWidth = (cardWidth + gap) * properties.length;

    // Apply initial position
    gsap.set(track, { x: 0 });

    // Create continuous scroll animation
    let scrollTween = gsap.to(track, {
        x: -totalWidth,
        duration: 30,
        ease: 'none',
        repeat: -1,
        modifiers: {
            x: gsap.utils.unitize(x => parseFloat(x) % totalWidth)
        }
    });

    // Pause on hover
    track.addEventListener('mouseenter', () => scrollTween.pause());
    track.addEventListener('mouseleave', () => scrollTween.play());

    // Scroll trigger animation for initial reveal
    ScrollTrigger.create({
        trigger: carousel,
        start: 'top 80%',
        onEnter: () => {
            gsap.from(cards, {
                opacity: 0,
                y: 50,
                duration: 0.8,
                stagger: 0.05,
                ease: 'power3.out'
            });
        },
        once: true
    });
}

// ============ ROI CALCULATOR ============

function initROICalculator() {
    const commissionInput = document.getElementById('calcCommission');
    const cplInput = document.getElementById('calcCPL');
    const conversionSlider = document.getElementById('calcConversion');
    const leadsSlider = document.getElementById('calcLeads');

    const conversionValue = document.getElementById('conversionValue');
    const leadsValue = document.getElementById('leadsValue');

    const resultROI = document.getElementById('resultROI');
    const resultRevenue = document.getElementById('resultRevenue');
    const resultCost = document.getElementById('resultCost');
    const resultProfit = document.getElementById('resultProfit');

    if (!commissionInput) return;

    function calculate() {
        const commission = parseFloat(commissionInput.value) || 25000;
        const cpl = parseFloat(cplInput.value) || 45;
        const conversion = parseFloat(conversionSlider.value) || 8;
        const leads = parseFloat(leadsSlider.value) || 50;

        // Update slider displays
        if (conversionValue) conversionValue.textContent = conversion + '%';
        if (leadsValue) leadsValue.textContent = leads;

        // Calculate results
        const monthlyCost = leads * cpl;
        const salesPerMonth = leads * (conversion / 100);
        const monthlyRevenue = salesPerMonth * commission;
        const monthlyProfit = monthlyRevenue - monthlyCost;
        const roi = monthlyCost > 0 ? ((monthlyRevenue - monthlyCost) / monthlyCost) * 100 : 0;

        // Update display
        if (resultROI) resultROI.textContent = Math.round(roi) + '%';
        if (resultRevenue) resultRevenue.textContent = '$' + Math.round(monthlyRevenue).toLocaleString();
        if (resultCost) resultCost.textContent = '$' + Math.round(monthlyCost).toLocaleString();
        if (resultProfit) resultProfit.textContent = '$' + Math.round(monthlyProfit).toLocaleString();
    }

    // Event listeners
    [commissionInput, cplInput, conversionSlider, leadsSlider].forEach(input => {
        if (input) input.addEventListener('input', calculate);
    });

    // Initial calculation
    calculate();

    // Scroll trigger animation
    ScrollTrigger.create({
        trigger: '.calculator-section',
        start: 'top 70%',
        onEnter: () => {
            gsap.to('.calc-input-group', {
                opacity: 1,
                y: 0,
                stagger: 0.1,
                duration: 0.6,
                ease: 'back.out(1.5)'
            });
            gsap.to('.result-card', {
                opacity: 1,
                scale: 1,
                stagger: 0.1,
                delay: 0.4,
                duration: 0.6,
                ease: 'back.out(1.5)'
            });
        },
        once: true
    });
}

// ============ MARKETS PINNED SLIDESHOW ============

function initMarketsPinnedSlideshow() {
    const pinned = document.getElementById('marketsPinned');
    const slides = document.querySelectorAll('.market-slide');
    const tabs = document.querySelectorAll('.market-tab');

    if (!pinned || slides.length === 0) return;

    const marketKeys = ['nz', 'au', 'bali'];
    let currentIndex = 0;

    // Initialize first slide
    slides[0].style.visibility = 'visible';
    if (tabs[0]) tabs[0].classList.add('active');

    // Populate slide content
    slides.forEach((slide, index) => {
        const marketKey = marketKeys[index];
        const market = markets[marketKey];
        if (!market) return;

        const titleEl = slide.querySelector('.panel-title');
        const descEl = slide.querySelector('.panel-desc');
        const specsEl = slide.querySelector('.panel-specs');
        const ctaEl = slide.querySelector('.panel-cta');
        const badgeEl = slide.querySelector('.slide-badge');

        if (titleEl) titleEl.textContent = market.name;
        if (descEl) descEl.textContent = market.desc;
        if (badgeEl) badgeEl.textContent = market.flag;
        if (ctaEl) ctaEl.textContent = market.cta;

        if (specsEl) {
            specsEl.innerHTML = market.specs.map(spec => `
                <div class="spec-item">
                    <span class="spec-label">${spec.label}</span>
                    <span class="spec-value">${spec.val}</span>
                </div>
            `).join('');
        }
    });

    // Tab click handlers
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            goToSlide(index);
        });
    });

    function goToSlide(index) {
        if (index === currentIndex) return;

        // Hide current
        gsap.to(slides[currentIndex], {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                slides[currentIndex].style.visibility = 'hidden';
            }
        });
        tabs[currentIndex]?.classList.remove('active');

        // Show new
        currentIndex = index;
        slides[currentIndex].style.visibility = 'visible';
        gsap.fromTo(slides[currentIndex],
            { opacity: 0 },
            { opacity: 1, duration: 0.5 }
        );
        tabs[currentIndex]?.classList.add('active');

        // Animate title chars
        const titleEl = slides[currentIndex].querySelector('.panel-title');
        if (titleEl && !titleEl.dataset.split) {
            splitTextIntoChars(titleEl);
            titleEl.dataset.split = 'true';
        }
        if (titleEl) {
            gsap.fromTo(titleEl.querySelectorAll('.char'), {
                opacity: 0,
                y: '120%',
                rotateX: -90
            }, {
                opacity: 1,
                y: 0,
                rotateX: 0,
                duration: 0.6,
                stagger: 0.02,
                ease: 'back.out(1.7)'
            });
        }

        // Update counter
        const counterCurrent = document.querySelector('.counter-current');
        if (counterCurrent) counterCurrent.textContent = String(currentIndex + 1).padStart(2, '0');
    }

    // Scroll-based navigation (simple version - not pinned for simplicity)
    ScrollTrigger.create({
        trigger: pinned,
        start: 'top center',
        onEnter: () => {
            // Animate first slide title
            const titleEl = slides[0].querySelector('.panel-title');
            if (titleEl && !titleEl.dataset.split) {
                splitTextIntoChars(titleEl);
                titleEl.dataset.split = 'true';
            }
            if (titleEl) {
                gsap.to(titleEl.querySelectorAll('.char'), {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    duration: 0.6,
                    stagger: 0.02,
                    ease: 'back.out(1.7)'
                });
            }
        },
        once: true
    });
}

// ============ TESTIMONIALS TICKER ============

function initTestimonialsTicker() {
    const ticker = document.getElementById('testimonialRow1');
    if (!ticker) return;

    // Duplicate testimonials for seamless loop
    const allTestimonials = [...testimonials, ...testimonials];

    ticker.innerHTML = allTestimonials.map(t => `
        <div class="review-card-white">
            <div class="review-stars">\u2605\u2605\u2605\u2605\u2605</div>
            <p class="review-text">${t.text}</p>
            <div class="review-author">
                <div class="review-avatar">${t.initials}</div>
                <div>
                    <div class="review-name">${t.name}</div>
                    <div class="review-role">${t.role}</div>
                </div>
            </div>
        </div>
    `).join('');
}

// ============ PARTNERS TICKER ============

function initPartnersTicker() {
    const row1 = document.getElementById('clientsTickerRow1');
    const row2 = document.getElementById('clientsTickerRow2');

    if (!row1 || !row2) return;

    const logos1 = clientLogos.slice(0, 5);
    const logos2 = clientLogos.slice(5, 10);

    // Duplicate for seamless loop
    const allLogos1 = [...logos1, ...logos1, ...logos1, ...logos1];
    const allLogos2 = [...logos2, ...logos2, ...logos2, ...logos2];

    row1.innerHTML = allLogos1.map(logo => `
        <div class="ticker-logo-card">
            <img src="${logo}" alt="Partner Logo" loading="lazy">
        </div>
    `).join('');

    row2.innerHTML = allLogos2.map(logo => `
        <div class="ticker-logo-card">
            <img src="${logo}" alt="Partner Logo" loading="lazy">
        </div>
    `).join('');
}

// ============ 3D PROPERTY MODEL ============

function initPropertyModel() {
    const container = document.getElementById('propertyContainer');
    const canvas = document.getElementById('propertyCanvas');

    if (!container || !canvas || typeof THREE === 'undefined') {
        console.log('Three.js not loaded or container missing');
        return;
    }

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(4, 3, 6);
    camera.lookAt(0, 0.5, 0);

    const LIME = 0xc9f31d;
    const DARK = 0x1a1a1a;
    const GRAY = 0x333333;

    // Create house
    function createHouse() {
        const group = new THREE.Group();

        // Foundation
        const foundationGeo = new THREE.BoxGeometry(3, 0.15, 2.2);
        const foundationMat = new THREE.MeshPhongMaterial({ color: GRAY });
        const foundation = new THREE.Mesh(foundationGeo, foundationMat);
        foundation.position.y = 0.075;
        foundation.receiveShadow = true;
        group.add(foundation);

        // Main walls
        const wallsGeo = new THREE.BoxGeometry(2.6, 1.4, 1.8);
        const wallsMat = new THREE.MeshPhongMaterial({ color: DARK, flatShading: true });
        const walls = new THREE.Mesh(wallsGeo, wallsMat);
        walls.position.y = 0.85;
        walls.castShadow = true;
        walls.receiveShadow = true;
        group.add(walls);

        // Roof
        const roofGeo = new THREE.ConeGeometry(2, 0.9, 4);
        roofGeo.rotateY(Math.PI / 4);
        const roofMat = new THREE.MeshPhongMaterial({ color: LIME, flatShading: true });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 2;
        roof.castShadow = true;
        group.add(roof);

        // Windows (glowing)
        const windowMat = new THREE.MeshBasicMaterial({ color: LIME });

        // Front windows
        const window1 = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.45), windowMat);
        window1.position.set(-0.5, 1, 0.91);
        group.add(window1);

        const window2 = window1.clone();
        window2.position.set(0.5, 1, 0.91);
        group.add(window2);

        // Side windows
        const window3 = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.45), windowMat);
        window3.position.set(1.31, 1, 0);
        window3.rotation.y = Math.PI / 2;
        group.add(window3);

        // Door
        const doorGeo = new THREE.PlaneGeometry(0.4, 0.8);
        const doorMat = new THREE.MeshPhongMaterial({ color: 0x444444 });
        const door = new THREE.Mesh(doorGeo, doorMat);
        door.position.set(0, 0.55, 0.91);
        group.add(door);

        // Chimney
        const chimneyGeo = new THREE.BoxGeometry(0.25, 0.6, 0.25);
        const chimneyMat = new THREE.MeshPhongMaterial({ color: GRAY });
        const chimney = new THREE.Mesh(chimneyGeo, chimneyMat);
        chimney.position.set(0.8, 2.2, 0);
        chimney.castShadow = true;
        group.add(chimney);

        return group;
    }

    const house = createHouse();
    scene.add(house);

    // Ground
    const groundGeo = new THREE.PlaneGeometry(12, 12);
    const groundMat = new THREE.MeshPhongMaterial({
        color: 0x0a0a0a,
        transparent: true,
        opacity: 0.8
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid helper
    const gridHelper = new THREE.GridHelper(12, 24, LIME, 0x222222);
    gridHelper.material.opacity = 0.15;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(5, 10, 7);
    directional.castShadow = true;
    directional.shadow.mapSize.width = 1024;
    directional.shadow.mapSize.height = 1024;
    directional.shadow.camera.near = 0.5;
    directional.shadow.camera.far = 50;
    directional.shadow.camera.left = -10;
    directional.shadow.camera.right = 10;
    directional.shadow.camera.top = 10;
    directional.shadow.camera.bottom = -10;
    scene.add(directional);

    const accentLight = new THREE.PointLight(LIME, 0.6, 15);
    accentLight.position.set(-4, 3, 4);
    scene.add(accentLight);

    // Interaction
    let isDragging = false;
    let prevX = 0;
    let rotY = 0;
    let autoRotate = true;

    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        prevX = e.clientX;
        autoRotate = false;
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - prevX;
        rotY += deltaX * 0.005;
        prevX = e.clientX;
    });

    // Touch support
    canvas.addEventListener('touchstart', (e) => {
        isDragging = true;
        prevX = e.touches[0].clientX;
        autoRotate = false;
    });

    canvas.addEventListener('touchend', () => {
        isDragging = false;
    });

    canvas.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const deltaX = e.touches[0].clientX - prevX;
        rotY += deltaX * 0.005;
        prevX = e.touches[0].clientX;
    });

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        if (autoRotate) {
            rotY += 0.003;
        }

        house.rotation.y = rotY;
        renderer.render(scene, camera);
    }
    animate();

    // Resize handler
    function onResize() {
        const width = container.clientWidth;
        const height = container.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', onResize);

    // Scroll-triggered entrance
    ScrollTrigger.create({
        trigger: container,
        start: 'top 80%',
        onEnter: () => {
            gsap.from(house.scale, {
                x: 0.5, y: 0.5, z: 0.5,
                duration: 1.2,
                ease: 'elastic.out(1, 0.5)'
            });
            gsap.from(house.position, {
                y: -1,
                duration: 1,
                ease: 'power3.out'
            });
        },
        once: true
    });
}

// ============ CTA STARS ============

function initCTAStars() {
    const starsContainer = document.querySelector('.cta-stars');
    if (!starsContainer) return;

    for (let i = 0; i < 80; i++) {
        const star = document.createElement('div');
        star.className = 'cta-star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.width = (Math.random() * 2 + 1) + 'px';
        star.style.height = star.style.width;
        star.style.animationDelay = Math.random() * 2 + 's';
        star.style.animationDuration = (Math.random() * 2 + 1) + 's';
        starsContainer.appendChild(star);
    }
}

// ============ CTA FORM ============

function initCTAForm() {
    const form = document.getElementById('ctaForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]').value;
        const button = form.querySelector('button');

        if (!email) return;

        button.textContent = 'Sending...';
        button.disabled = true;

        // Simulate submission (replace with actual endpoint)
        await new Promise(resolve => setTimeout(resolve, 1500));

        button.textContent = '\u2713 Application Received';
        button.style.background = '#22c55e';
    });
}

// ============ SMOOTH SCROLL ============

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                gsap.to(window, {
                    scrollTo: { y: target, offsetY: 80 },
                    duration: 1,
                    ease: 'power3.inOut'
                });
            }
        });
    });
}

// ============ INIT ============

document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initMagnetic();
    initNavbar();
    initMobileMenu();
    initHeroAnimations();
    initSectionTitleAnimations();
    initAuthoritySection();
    initBentoCards();
    initLeadCards();
    initProcessCards();
    initPropertyShowcase();
    initROICalculator();
    initTestimonialsTicker();
    initPartnersTicker();
    initPropertyModel();
    initCTAStars();
    initCTAForm();
    initSmoothScroll();

    console.log('ONIX Real Estate page initialized');
});
