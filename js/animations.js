/**
 * ONIX - GSAP Animations
 * Hero intro sequence and scroll-triggered animations
 */

gsap.registerPlugin(ScrollTrigger);

// ============================================================
//  1. SPLIT TEXT — Prepare intro + hero title characters
// ============================================================
function splitLineIntoChars(line) {
    let html = '';
    const processNode = (node) => {
        if (node.nodeType === 3) {
            node.textContent.split('').forEach(ch => {
                if (ch === ' ') html += '<span class="char-space"> </span>';
                else html += '<span class="char">' + ch + '</span>';
            });
        } else if (node.nodeType === 1) {
            html += '<' + node.tagName.toLowerCase();
            for (const attr of node.attributes) html += ' ' + attr.name + '="' + attr.value + '"';
            html += '>';
            node.childNodes.forEach(processNode);
            html += '</' + node.tagName.toLowerCase() + '>';
        }
    };
    line.childNodes.forEach(processNode);
    line.innerHTML = html;
}

// Split hero title into chars
document.querySelectorAll('#hero-title .line').forEach(splitLineIntoChars);
document.getElementById('hero-title').classList.add('ready');

// Split hero subtitle into words
const heroSub = document.querySelector('.hero-sub');
heroSub.innerHTML = heroSub.textContent.split(' ').map(word =>
    `<span class="word">${word}</span>`
).join(' ');

// ============================================================
//  CHECK IF USER SCROLLED — Skip intro if not at top
// ============================================================
const heroTitle = document.getElementById('hero-title');
const isScrolledDown = window.scrollY > 100;

if (isScrolledDown) {
    // User refreshed while scrolled — skip intro, show everything immediately
    document.getElementById('titleIntro').style.display = 'none';
    document.querySelector('.nav-logo').style.opacity = '1';
    gsap.set('.nav-links', { opacity: 1 });
    gsap.set('.nav-cta', { opacity: 1 });
    gsap.set('.hero-bg-grid', { opacity: 1 });
    gsap.set('.hero-glow', { opacity: 1 });
    gsap.set('.hero-glow-2', { opacity: 1 });
    gsap.set('.hero-badge', { opacity: 1, y: 0, visibility: 'visible' });
    gsap.set('#hero-title .char', { opacity: 1, y: 0, rotateX: 0 });
    gsap.set('.hero-sub .word', { opacity: 1, y: 0 });
    gsap.set('.hero-buttons .btn-primary', { opacity: 1, scale: 1, filter: 'blur(0px)' });
    gsap.set('.hero-buttons .btn-secondary', { opacity: 1, scale: 1, filter: 'blur(0px)' });
    gsap.set('#indDashboard', { opacity: 1, y: 0 });
    gsap.set('.ind-tab', { opacity: 1, x: 0 });
    gsap.set('.hero-scroll', { opacity: 1 });

    // Initialize data animations immediately
    if (typeof animateDataIn === 'function') animateDataIn();
    if (typeof animateChartIn === 'function') animateChartIn();

    // Start scroll animations
    initScrollAnimations();
}

// ============================================================
//  MASTER TIMELINE — Hero title: Big Center → Shrink to Place → Reveal rest
// ============================================================
// Only run intro animation if at top of page
if (!isScrolledDown) {
    const masterTL = gsap.timeline({
        onComplete: () => {
            initScrollAnimations();
        }
    });
    // Record the title's natural position in flow
    const naturalRect = heroTitle.getBoundingClientRect();

    // Switch to fixed so it renders above the overlay
    heroTitle.classList.add('intro-active');
    heroTitle.style.left = naturalRect.left + 'px';
    heroTitle.style.top = naturalRect.top + 'px';
    heroTitle.style.width = naturalRect.width + 'px';

    // Calculate center & scale
    const bigScale = 1.8;
    const vpCx = window.innerWidth / 2;
    const vpCy = window.innerHeight / 2;
    const titleCx = naturalRect.left + naturalRect.width / 2;
    const titleCy = naturalRect.top + naturalRect.height / 2;
    const startX = vpCx - titleCx;
    const startY = vpCy - titleCy;

    // Start big & centered
    gsap.set(heroTitle, {
        x: startX,
        y: startY,
        scale: bigScale,
        transformOrigin: 'center center'
    });
    gsap.set('#hero-title .char', { opacity: 0, y: 60, rotateX: -40 });

masterTL
    // PHASE 1: Letters animate in — big & centered
    .to('#hero-title .char', {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.6,
        stagger: 0.03,
        ease: "back.out(1.7)"
    }, 0.3)

    // PHASE 2: Smoothly shrink & move back to natural position
    .to(heroTitle, {
        x: 0,
        y: 0,
        scale: 1,
        duration: 1.6,
        ease: "power2.inOut"
    }, 2.2)

    // Overlay fades out during the move
    .to('#titleIntro', {
        opacity: 0,
        duration: 1,
        ease: "power2.out"
    }, 2.6)

    // Switch back to normal flow
    .add(() => {
        heroTitle.classList.remove('intro-active');
        heroTitle.style.left = '';
        heroTitle.style.top = '';
        heroTitle.style.width = '';
        gsap.set(heroTitle, { clearProps: 'x,y,scale,transformOrigin' });
        document.getElementById('titleIntro').style.display = 'none';
    }, 3.9)

    // PHASE 3: Navbar
    .add(() => {
        document.querySelector('.nav-logo').style.opacity = '1';
    }, 3.4)
    .to('.nav-links', { opacity: 1, duration: 0.6, ease: "power2.out" }, 3.6)
    .to('.nav-cta', { opacity: 1, duration: 0.6, ease: "power2.out" }, 3.7)

    // PHASE 4: Hero background
    .to('.hero-bg-grid', { opacity: 1, duration: 1.5 }, 3.2)
    .to('.hero-glow', { opacity: 1, duration: 2, scale: 1.2 }, 3.2)
    .to('.hero-glow-2', { opacity: 1, duration: 2 }, 3.6)

    // PHASE 5: Badge
    .to('.hero-badge', { opacity: 1, y: 0, visibility: 'visible', duration: 0.8 }, 3.8)

    // PHASE 6: Subtitle (word-by-word)
    .to('.hero-sub .word', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out"
    }, 4.0)

    // PHASE 7: Buttons (blur + scale)
    .to('.hero-buttons .btn-primary', {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        duration: 1,
        ease: "power2.out"
    }, 4.6)
    .to('.hero-buttons .btn-secondary', {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        duration: 1,
        ease: "power2.out"
    }, 4.75)

    // PHASE 8: Dashboard
    .to('#indDashboard', { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, 4.0)

    // PHASE 9: Tabs
    .fromTo('.ind-tab', { opacity: 0, x: -15 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: "power3.out" }, 4.2)

    // PHASE 10: Bento data (calls dashboard.js function)
    .add(() => {
        if (typeof animateDataIn === 'function') animateDataIn();
    }, 4.4)

    // PHASE 11: Chart data (calls dashboard.js function)
    .add(() => {
        if (typeof animateChartIn === 'function') animateChartIn();
    }, 4.8)

    // PHASE 12: Scroll indicator
    .to('.hero-scroll', { opacity: 1, duration: 0.8 }, 6.2);
}

// ============================================================
//  SCROLL-TRIGGERED ANIMATIONS
// ============================================================
function initScrollAnimations() {

    // Hero glow follows mouse parallax
    document.querySelector('.hero').addEventListener('mousemove', (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to('.hero-glow', {
            x: x * 100,
            y: y * 100,
            duration: 1,
            ease: "power2.out"
        });
    });

    // Infinite Marquee
    const marquee = document.getElementById('marquee');
    if (marquee) {
        const marqueeWidth = marquee.scrollWidth / 2;
        gsap.to(marquee, {
            x: -marqueeWidth,
            duration: 30,
            ease: "none",
            repeat: -1
        });
    }

    // Stats — Counter Animation + Staggered Reveal
    gsap.to('.stat-card', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
            trigger: '.stats',
            start: 'top 80%'
        }
    });

    // Animated counters for stats section
    document.querySelectorAll('.stat-number').forEach(el => {
        const target = parseInt(el.dataset.target);
        const obj = { val: 0 };
        ScrollTrigger.create({
            trigger: el,
            start: 'top 85%',
            onEnter: () => {
                gsap.to(obj, {
                    val: target,
                    duration: 2,
                    ease: "power2.out",
                    onUpdate: () => {
                        const v = Math.floor(obj.val);
                        if (el.textContent.includes('$')) el.textContent = `$${v}k+`;
                        else if (el.textContent.includes('hrs')) el.textContent = `${v} hrs`;
                        else el.textContent = `${v}%`;
                    }
                });
            },
            once: true
        });
    });

    // Section Labels — Fade In
    gsap.utils.toArray('.section-label').forEach(label => {
        gsap.to(label, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: label, start: 'top 85%' }
        });
    });

    // Section Titles — Word-by-Word Reveal
    gsap.utils.toArray('.section-title').forEach(title => {
        const text = title.innerHTML;
        title.innerHTML = text.replace(/(<[^>]+>)|(\S+)/g, (match, tag, word) => {
            if (tag) return tag;
            return '<span class="word" style="display:inline-block;opacity:0;transform:translateY(30px)">' + word + '</span>';
        });
        const words = title.querySelectorAll('.word');
        gsap.to(words, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: title, start: 'top 85%' }
        });
    });

    // Horizontal Scroll — Features Cards
    const track = document.getElementById('features-track');
    if (track) {
        const trackWidth = track.scrollWidth - window.innerWidth;
        gsap.to(track, {
            x: -trackWidth,
            ease: "none",
            scrollTrigger: {
                trigger: '.features-section',
                start: 'top top',
                end: () => `+=${trackWidth}`,
                scrub: 1,
                pin: true,
                anticipatePin: 1,
            }
        });
    }

    // Feature Cards — Spotlight follow mouse
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
            card.style.setProperty('--mouse-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
        });
    });

    // How It Works — Typewriter Animation
    initTypewriterSteps();

    // Testimonials — 3D Card Flip Reveal
    gsap.to('.testimonial-card', {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
            trigger: '.testimonial-grid',
            start: 'top 80%'
        }
    });

    // Pricing Cards — Staggered Scale-Up
    gsap.to('.pricing-card', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "back.out(1.5)",
        scrollTrigger: {
            trigger: '.pricing-grid',
            start: 'top 80%'
        }
    });

    // CTA — Background Text Parallax
    gsap.to('.cta-bg-text', {
        xPercent: -20,
        ease: "none",
        scrollTrigger: {
            trigger: '.cta-section',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
        }
    });

    gsap.from('.cta-section h2', {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: '.cta-section', start: 'top 75%' }
    });

    gsap.from('.cta-btn', {
        scale: 0.8,
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: "elastic.out(1, 0.5)",
        scrollTrigger: { trigger: '.cta-section', start: 'top 75%' }
    });

    // Floating Particles
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        for (let i = 0; i < 30; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.top = Math.random() * 100 + '%';
            particlesContainer.appendChild(p);
            gsap.to(p, {
                opacity: "random(0.1, 0.4)",
                y: "random(-200, 200)",
                x: "random(-100, 100)",
                duration: "random(10, 25)",
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: "random(0, 10)"
            });
        }
    }
}

// ============================================================
//  TYPEWRITER STEPS + MAZE CIRCLE ANIMATION
// ============================================================
function initTypewriterSteps() {
    const steps = document.querySelectorAll('.tw-step');
    const mazeIcons = document.querySelectorAll('.maze-icon');
    const outerRing = document.getElementById('mazeIconsOuter');
    const middleRing = document.getElementById('mazeIconsMiddle');
    const centerNum = document.getElementById('mazeCenterNum');

    if (!steps.length) return;

    let currentStep = 0;
    let hasAnimated = false;
    let outerRotation = 0;
    let middleRotation = 0;
    let lastScrollY = window.scrollY;

    // Hide all icons initially
    mazeIcons.forEach(icon => icon.classList.remove('visible'));

    // Typewriter effect for title
    function typeTitle(titleEl, callback) {
        const text = titleEl.getAttribute('data-text');
        titleEl.textContent = '';
        titleEl.style.width = 'auto';
        titleEl.classList.add('typing');

        let charIndex = 0;
        const typeInterval = setInterval(() => {
            if (charIndex < text.length) {
                titleEl.textContent += text.charAt(charIndex);
                charIndex++;
            } else {
                clearInterval(typeInterval);
                titleEl.classList.remove('typing');
                titleEl.classList.add('done');
                if (callback) callback();
            }
        }, 50);
    }

    // Show icons by step
    // Step 1: OUTER ring (4 icons)
    // Step 2: OUTER + MIDDLE ring (4 + 3 = 7 icons)
    function showIconsForStep(stepNum) {
        // Hide all icons first
        mazeIcons.forEach(icon => icon.classList.remove('visible'));

        // Show icons based on step
        let delay = 0;
        mazeIcons.forEach(icon => {
            const iconStep = parseInt(icon.dataset.step);
            if (iconStep <= stepNum) {
                setTimeout(() => {
                    icon.classList.add('visible');
                }, delay);
                delay += 150;
            }
        });

        // Update center number with animation
        if (centerNum) {
            gsap.to(centerNum, {
                opacity: 0,
                scale: 0.5,
                duration: 0.2,
                onComplete: () => {
                    centerNum.textContent = '0' + stepNum;
                    gsap.to(centerNum, {
                        opacity: 1,
                        scale: 1,
                        duration: 0.3,
                        ease: "back.out(1.7)"
                    });
                }
            });
        }
    }

    // Animate a single step
    function animateStep(index) {
        if (index >= steps.length) return;

        const step = steps[index];
        const title = step.querySelector('.tw-title');
        const checkmark = step.querySelector('.tw-checkmark');

        // Make step visible
        step.classList.add('visible', 'active');

        // Remove active from previous steps (but keep them visible)
        steps.forEach((s, i) => {
            if (i < index) {
                s.classList.remove('active');
            }
        });

        // Show icons for this step
        showIconsForStep(index + 1);

        // Start typewriter effect
        setTimeout(() => {
            typeTitle(title, () => {
                // Show checkmark
                checkmark.classList.add('show');

                // Complete progress bar
                step.classList.add('complete');

                // Move to next step after delay
                setTimeout(() => {
                    currentStep++;
                    if (currentStep < steps.length) {
                        animateStep(currentStep);
                    } else {
                        // All done - keep last step active
                        step.classList.add('active');
                    }
                }, 800);
            });
        }, 300);
    }

    // Scroll-based OPPOSITE rotation for outer and middle rings
    function updateMazeRotation() {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY;

        const mazeCircle = document.getElementById('mazeCircle');
        if (mazeCircle) {
            const rect = mazeCircle.getBoundingClientRect();
            const isInView = rect.top < window.innerHeight && rect.bottom > 0;

            if (isInView && Math.abs(scrollDelta) > 0) {
                // Outer ring rotates CLOCKWISE
                outerRotation += scrollDelta * 0.12;
                // Middle ring rotates COUNTER-CLOCKWISE (opposite)
                middleRotation -= scrollDelta * 0.15;

                if (outerRing) {
                    outerRing.style.transform = `rotate(${outerRotation}deg)`;
                }
                if (middleRing) {
                    middleRing.style.transform = `rotate(${middleRotation}deg)`;
                }
            }
        }

        lastScrollY = currentScrollY;
    }

    // Add scroll listener for maze rotation
    window.addEventListener('scroll', updateMazeRotation, { passive: true });

    // Click handlers for steps (manual navigation)
    steps.forEach((step, index) => {
        step.addEventListener('click', () => {
            // Show icons for clicked step
            showIconsForStep(index + 1);

            // Update active state
            steps.forEach((s, i) => {
                if (i === index) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });

    // Trigger on scroll
    ScrollTrigger.create({
        trigger: '.how-section',
        start: 'top 60%',
        onEnter: () => {
            if (!hasAnimated) {
                hasAnimated = true;
                animateStep(0);
            }
        }
    });
}
