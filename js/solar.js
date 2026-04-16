/* ========================================
   ONIX SOLAR - JAVASCRIPT
   Animations & ROI Calculator
======================================== */

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// ========== CUSTOM CURSOR ==========
function initCursor() {
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursorFollower');

    if (!cursor || !follower) return;

    // Check for touch device
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        cursor.style.display = 'none';
        follower.style.display = 'none';
        return;
    }

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        // Cursor follows immediately
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;

        // Follower has more lag
        followerX += (mouseX - followerX) * 0.1;
        followerY += (mouseY - followerY) * 0.1;

        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        follower.style.left = followerX + 'px';
        follower.style.top = followerY + 'px';

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effects
    const hoverElements = document.querySelectorAll('a, button, .magnetic, .bento-card, .process-card, .market-card');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hovering');
            follower.classList.add('hovering');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hovering');
            follower.classList.remove('hovering');
        });
    });
}

// ========== SMART NAVBAR ==========
function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateNavbar() {
        const currentScrollY = window.scrollY;

        // Add/remove scrolled class
        if (currentScrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Hide/show on scroll direction
        if (currentScrollY > lastScrollY && currentScrollY > 200) {
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
}

// ========== MOBILE MENU ==========
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// ========== MAGNETIC BUTTONS ==========
function initMagneticButtons() {
    const magnetics = document.querySelectorAll('.magnetic');

    magnetics.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(btn, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.5)'
            });
        });
    });
}

// ========== HERO ANIMATIONS ==========
function initHeroAnimations() {
    // Split title words
    const heroTitle = document.getElementById('heroTitle');
    if (heroTitle) {
        const words = heroTitle.querySelectorAll('.word');
        words.forEach(word => {
            word.style.opacity = '0';
            word.style.transform = 'translateY(30px) rotateX(-40deg)';
        });
    }

    // Split subtitle into words
    const heroSubtitle = document.getElementById('heroSubtitle');
    if (heroSubtitle) {
        splitSubtitleToWords(heroSubtitle);
    }

    // Create timeline
    const tl = gsap.timeline({ delay: 0.3 });

    // Badge
    tl.to('.hero-badge', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out'
    });

    // Title words
    tl.to('.hero-title .word', {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: 'back.out(1.7)'
    }, '-=0.4');

    // Subtitle words
    tl.to('.hero-subtitle .word', {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.03,
        ease: 'power3.out'
    }, '-=0.3');

    // Set subtitle container visible
    tl.to('.hero-subtitle', {
        opacity: 1,
        duration: 0.1
    }, '<');

    // Buttons
    tl.to('.hero-actions', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out'
    }, '-=0.3');

    // Trust items
    tl.to('.hero-trust', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out'
    }, '-=0.5');

    // Stats grid
    tl.to('.hero-stats-grid', {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        onComplete: () => {
            // Animate hero counters
            animateHeroCounters();
        }
    }, '-=0.5');

    // Scroll indicator
    tl.to('.scroll-indicator', {
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out'
    }, '-=0.3');
}

function splitSubtitleToWords(element) {
    const html = element.innerHTML;
    // Preserve highlight spans
    const parts = html.split(/(<span class="hero-highlight">.*?<\/span>)/g);

    let newHtml = '';
    parts.forEach(part => {
        if (part.includes('hero-highlight')) {
            // It's a highlight span, split its content
            const match = part.match(/<span class="hero-highlight">(.*?)<\/span>/);
            if (match) {
                const words = match[1].split(/\s+/);
                const wordSpans = words.map(w => `<span class="word">${w}</span>`).join(' ');
                newHtml += `<span class="hero-highlight">${wordSpans}</span>`;
            }
        } else {
            // Regular text
            const words = part.split(/\s+/).filter(w => w.trim());
            words.forEach(word => {
                newHtml += `<span class="word">${word}</span> `;
            });
        }
    });

    element.innerHTML = newHtml;
    element.querySelectorAll('.word').forEach(word => {
        word.style.opacity = '0';
        word.style.transform = 'translateY(15px)';
        word.style.display = 'inline-block';
    });
}

function animateHeroCounters() {
    const counters = document.querySelectorAll('.hero-count');

    counters.forEach(counter => {
        const target = parseFloat(counter.dataset.target);
        const text = counter.dataset.text;
        const suffix = counter.dataset.suffix || '';
        const prefix = counter.dataset.prefix || '';

        if (text) {
            // Text animation (like "$45-$85")
            setTimeout(() => {
                counter.textContent = text;
            }, 500);
        } else if (target) {
            // Number counter animation
            const isDecimal = target % 1 !== 0;
            const duration = 1.5;

            gsap.to({ val: 0 }, {
                val: target,
                duration: duration,
                ease: 'power2.out',
                onUpdate: function() {
                    const current = this.targets()[0].val;
                    if (isDecimal) {
                        counter.textContent = prefix + current.toFixed(1) + suffix;
                    } else {
                        counter.textContent = prefix + Math.round(current).toLocaleString() + suffix;
                    }
                }
            });
        }
    });
}

// ========== BENTO TILT EFFECT ==========
function initBentoTilt() {
    const cards = document.querySelectorAll('[data-tilt]');

    cards.forEach(card => {
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

// ========== TYPEWRITER EFFECT ==========
function typewriterEffect(element, text, speed = 30) {
    const textEl = element.querySelector('.typewriter-text');
    if (!textEl) return;

    let index = 0;

    function type() {
        if (index < text.length) {
            textEl.textContent += text.charAt(index);
            index++;
            setTimeout(type, speed);
        }
    }

    type();
}

// ========== SCROLL ANIMATIONS ==========
function initScrollAnimations() {
    // Authority cards
    gsap.from('.authority-card', {
        scrollTrigger: {
            trigger: '.authority-section',
            start: 'top 80%'
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.15,
        ease: 'back.out(1.5)'
    });

    // Quality checklist
    gsap.from('.checklist-item', {
        scrollTrigger: {
            trigger: '.quality-section',
            start: 'top 70%'
        },
        opacity: 0,
        x: -30,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out'
    });

    // Lead preview card
    gsap.from('.lead-card-preview', {
        scrollTrigger: {
            trigger: '.quality-preview',
            start: 'top 75%'
        },
        opacity: 0,
        scale: 0.95,
        duration: 1,
        ease: 'power3.out'
    });

    // Process cards
    gsap.from('.process-card', {
        scrollTrigger: {
            trigger: '.process-section',
            start: 'top 70%'
        },
        opacity: 0,
        y: 40,
        duration: 0.7,
        stagger: 0.12,
        ease: 'back.out(1.5)'
    });

    // Process typewriter
    const processTypewriter = document.querySelector('.process-section .typewriter');
    if (processTypewriter) {
        ScrollTrigger.create({
            trigger: '.process-section',
            start: 'top 75%',
            onEnter: () => {
                const text = processTypewriter.dataset.typewriter;
                typewriterEffect(processTypewriter, text);
            },
            once: true
        });
    }

    // Commercial comparison
    gsap.from('.comparison-card', {
        scrollTrigger: {
            trigger: '.commercial-section',
            start: 'top 75%'
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out'
    });

    // Bento cards
    gsap.from('.bento-card', {
        scrollTrigger: {
            trigger: '.results-section',
            start: 'top 75%'
        },
        opacity: 0,
        y: 40,
        duration: 0.7,
        stagger: 0.1,
        ease: 'back.out(1.5)'
    });

    // Animate bento counters on scroll
    const bentoCounters = document.querySelectorAll('.bento-num[data-target]');
    bentoCounters.forEach(counter => {
        ScrollTrigger.create({
            trigger: counter,
            start: 'top 85%',
            onEnter: () => {
                animateCounter(counter);
            },
            once: true
        });
    });

    // Chart bars animation
    const chartBars = document.querySelectorAll('.chart-bar');
    chartBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';

        ScrollTrigger.create({
            trigger: bar,
            start: 'top 90%',
            onEnter: () => {
                gsap.to(bar, {
                    width: width,
                    duration: 1,
                    ease: 'power2.out'
                });
            },
            once: true
        });
    });

    // Calculator section
    gsap.from('.calculator-card', {
        scrollTrigger: {
            trigger: '.calculator-section',
            start: 'top 75%'
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out'
    });

    // Market cards
    gsap.from('.market-card', {
        scrollTrigger: {
            trigger: '.markets-section',
            start: 'top 75%'
        },
        opacity: 0,
        y: 40,
        duration: 0.7,
        stagger: 0.1,
        ease: 'back.out(1.5)'
    });

    // Section titles
    document.querySelectorAll('.section-title').forEach(title => {
        const words = title.querySelectorAll('.word');
        if (words.length === 0) return;

        gsap.from(words, {
            scrollTrigger: {
                trigger: title,
                start: 'top 85%'
            },
            opacity: 0,
            y: 30,
            rotateX: -40,
            duration: 0.7,
            stagger: 0.05,
            ease: 'back.out(1.7)'
        });
    });
}

function animateCounter(element) {
    const target = parseFloat(element.dataset.target);
    const suffix = element.dataset.suffix || '';
    const prefix = element.dataset.prefix || '';
    const isDecimal = target % 1 !== 0;

    gsap.to({ val: 0 }, {
        val: target,
        duration: 1.5,
        ease: 'power2.out',
        onUpdate: function() {
            const current = this.targets()[0].val;
            if (isDecimal) {
                element.textContent = prefix + current.toFixed(1) + suffix;
            } else {
                element.textContent = prefix + Math.round(current).toLocaleString() + suffix;
            }
        }
    });
}

// ========== ROI CALCULATOR ==========
function initROICalculator() {
    const slider = document.getElementById('budgetSlider');
    const budgetValue = document.getElementById('budgetValue');
    const estimatedLeads = document.getElementById('estimatedLeads');
    const estimatedCloses = document.getElementById('estimatedCloses');
    const estimatedRevenue = document.getElementById('estimatedRevenue');
    const estimatedROI = document.getElementById('estimatedROI');

    if (!slider) return;

    // Constants for calculation
    const AVG_CPL = 65;          // Average cost per lead
    const CLOSE_RATE = 0.28;     // 28% close rate
    const AVG_INSTALL_VALUE = 15000; // $15k average install

    function updateCalculator() {
        const budget = parseInt(slider.value);

        // Calculate values
        const leads = Math.round(budget / AVG_CPL);
        const closes = Math.round(leads * CLOSE_RATE);
        const revenue = closes * AVG_INSTALL_VALUE;
        const roi = budget > 0 ? Math.round(revenue / budget) : 0;

        // Animate updates
        animateValue(budgetValue, `$${budget.toLocaleString()}`);
        animateNumberTo(estimatedLeads, leads);
        animateNumberTo(estimatedCloses, closes);
        animateValue(estimatedRevenue, `$${revenue.toLocaleString()}`);
        animateValue(estimatedROI, `${roi}x`);
    }

    function animateValue(element, value) {
        gsap.to(element, {
            duration: 0.2,
            onComplete: () => {
                element.textContent = value;
            }
        });
    }

    function animateNumberTo(element, target) {
        const current = parseInt(element.textContent) || 0;
        gsap.to({ val: current }, {
            val: target,
            duration: 0.4,
            ease: 'power2.out',
            onUpdate: function() {
                element.textContent = Math.round(this.targets()[0].val);
            }
        });
    }

    // Initial calculation
    updateCalculator();

    // Update on slider change
    slider.addEventListener('input', updateCalculator);

    // Update slider track fill
    function updateSliderTrack() {
        const min = parseInt(slider.min);
        const max = parseInt(slider.max);
        const value = parseInt(slider.value);
        const percentage = ((value - min) / (max - min)) * 100;

        slider.style.background = `linear-gradient(to right, #c9f31d 0%, #c9f31d ${percentage}%, #1a1a1a ${percentage}%, #1a1a1a 100%)`;
    }

    updateSliderTrack();
    slider.addEventListener('input', updateSliderTrack);
}

// ========== TESTIMONIALS TICKER ==========
function initTestimonialsTicker() {
    const track = document.getElementById('testimonialTrack');
    if (!track) return;

    // Clone items for seamless loop
    const items = track.innerHTML;
    track.innerHTML = items + items;
}

// ========== CTA STARS ANIMATION ==========
function initCtaStars() {
    const starsContainer = document.querySelector('.cta-stars');
    if (!starsContainer) return;

    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.style.cssText = `
            position: absolute;
            width: ${Math.random() * 3 + 1}px;
            height: ${Math.random() * 3 + 1}px;
            background: rgba(201, 243, 29, ${Math.random() * 0.5 + 0.2});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: twinkle ${Math.random() * 3 + 2}s ease-in-out infinite;
            animation-delay: ${Math.random() * 2}s;
        `;
        starsContainer.appendChild(star);
    }

    // Add twinkle keyframes if not exists
    if (!document.querySelector('#twinkle-keyframes')) {
        const style = document.createElement('style');
        style.id = 'twinkle-keyframes';
        style.textContent = `
            @keyframes twinkle {
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.2); }
            }
        `;
        document.head.appendChild(style);
    }
}

// ========== FORM HANDLER ==========
function initFormHandler() {
    const form = document.getElementById('ctaForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('.form-submit');
        const originalText = submitBtn.innerHTML;

        // Disable and show loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Sending...</span>';

        const formData = {
            name: document.getElementById('ctaName').value,
            company: document.getElementById('ctaCompany').value,
            phone: document.getElementById('ctaPhone').value,
            email: document.getElementById('ctaEmail').value,
            budget: document.getElementById('ctaBudget').value,
            region: document.getElementById('ctaRegion').value,
            source: 'solar',
            industry: 'solar'
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
                submitBtn.innerHTML = '<span>Submitted!</span>';
                submitBtn.style.background = '#22c55e';
                form.reset();

                // Reset button after delay
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
            submitBtn.style.background = '#ef4444';

            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
            }, 3000);
        }
    });
}

// ========== SMOOTH SCROLL ==========
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                gsap.to(window, {
                    duration: 1,
                    scrollTo: {
                        y: target,
                        offsetY: 80
                    },
                    ease: 'power3.inOut'
                });
            }
        });
    });
}

// ========== INITIALIZE ==========
document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initNavbar();
    initMobileMenu();
    initMagneticButtons();
    initHeroAnimations();
    initBentoTilt();
    initScrollAnimations();
    initROICalculator();
    initTestimonialsTicker();
    initCtaStars();
    initFormHandler();
    initSmoothScroll();
});
