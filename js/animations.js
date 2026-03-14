/**
 * ONIX - GSAP Animations
 * Hero intro sequence and scroll-triggered animations
 */

import { animateDataIn, animateChartIn } from './dashboard.js';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Split text into characters for animation
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

// Typewriter steps + maze circle animation
function initTypewriterSteps() {
    const steps = document.querySelectorAll('.tw-step');
    const mazeIcons = document.querySelectorAll('.maze-icon');
    const outerRing = document.getElementById('mazeIconsOuter');
    const middleRing = document.getElementById('mazeIconsMiddle');
    const centerNum = document.getElementById('mazeCenterNum');
    const mazeCircle = document.getElementById('mazeCircle');

    if (!steps.length) return;

    let hasAnimated = false;
    let outerRotation = 0;
    let middleRotation = 0;
    let lastScrollY = window.scrollY;

    mazeIcons.forEach(icon => icon.classList.remove('visible'));

    // Helper function to animate section titles (for sections after Features horizontal scroll)
    const animateSectionTitle = (sectionSelector) => {
        const title = document.querySelector(`${sectionSelector} .section-title`);
        if (!title) return;

        // Split into chars
        let html = '';
        title.childNodes.forEach(node => {
            if (node.nodeType === 3) {
                const text = node.textContent;
                for (let i = 0; i < text.length; i++) {
                    const c = text[i];
                    html += c === ' ' ? ' ' : `<span class="char">${c}</span>`;
                }
            } else if (node.nodeType === 1 && node.classList.contains('highlight')) {
                let inner = '';
                for (let i = 0; i < node.textContent.length; i++) {
                    const c = node.textContent[i];
                    inner += c === ' ' ? ' ' : `<span class="char">${c}</span>`;
                }
                html += `<span class="highlight">${inner}</span>`;
            }
        });
        title.innerHTML = html;
        title.classList.add('ready');
        gsap.set(title.querySelectorAll('.char'), { opacity: 0, y: 30, rotateX: -40 });

        ScrollTrigger.create({
            trigger: sectionSelector,
            start: 'top 75%',
            onEnter: () => {
                gsap.to(title.querySelectorAll('.char'), {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    duration: 0.6,
                    stagger: 0.03,
                    ease: "back.out(1.7)"
                });
            },
            once: true
        });
    };

    // Animate all section titles AFTER Features section (affected by horizontal scroll pinning)
    animateSectionTitle('.how-section');
    animateSectionTitle('.testimonials');
    animateSectionTitle('.team-section');
    animateSectionTitle('.book-call');
    animateSectionTitle('.contact-section');

    // Animate maze circle on scroll
    if (mazeCircle) {
        gsap.set(mazeCircle, { opacity: 0, scale: 0.8, rotation: -15 });

        ScrollTrigger.create({
            trigger: '.how-section',
            start: 'top 70%',
            onEnter: () => {
                gsap.to(mazeCircle, {
                    opacity: 1,
                    scale: 1,
                    rotation: 0,
                    duration: 1.2,
                    ease: "elastic.out(1, 0.5)"
                });
            },
            once: true
        });
    }

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
        }, 25);
    }

    function showIconsForStep(stepNum) {
        let delay = 0;
        mazeIcons.forEach(icon => {
            const iconStep = parseInt(icon.dataset.step);
            if (iconStep <= stepNum && !icon.classList.contains('visible')) {
                setTimeout(() => {
                    icon.classList.add('visible');
                }, delay);
                delay += 100;
            }
        });

        if (centerNum) {
            gsap.to(centerNum, {
                opacity: 0,
                scale: 0.5,
                duration: 0.15,
                onComplete: () => {
                    centerNum.textContent = '0' + stepNum;
                    gsap.to(centerNum, {
                        opacity: 1,
                        scale: 1,
                        duration: 0.2,
                        ease: "back.out(1.7)"
                    });
                }
            });
        }
    }

    function animateAllSteps() {
        steps.forEach((step, index) => {
            const title = step.querySelector('.tw-title');
            const subtitle = step.querySelector('.tw-subtitle');
            const checkmark = step.querySelector('.tw-checkmark');

            const titleDelay = index * 600;
            const subtitleDelay = titleDelay + 400;

            setTimeout(() => {
                // Step is already visible from GSAP animation, just add active class
                step.classList.add('active');
                steps.forEach((s, i) => {
                    if (i < index) s.classList.remove('active');
                });

                showIconsForStep(index + 1);

                typeTitle(title, () => {
                    checkmark.classList.add('show');
                    step.classList.add('complete');
                });
            }, titleDelay);

            setTimeout(() => {
                subtitle.classList.add('fade-in');
            }, subtitleDelay);
        });

        setTimeout(() => {
            steps[steps.length - 1].classList.add('active');
        }, steps.length * 600 + 500);
    }

    function updateMazeRotation() {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY;

        const mazeCircle = document.getElementById('mazeCircle');
        if (mazeCircle) {
            const rect = mazeCircle.getBoundingClientRect();
            const isInView = rect.top < window.innerHeight && rect.bottom > 0;

            if (isInView && Math.abs(scrollDelta) > 0) {
                outerRotation += scrollDelta * 0.12;
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

    window.addEventListener('scroll', updateMazeRotation, { passive: true });

    steps.forEach((step, index) => {
        step.addEventListener('click', () => {
            showIconsForStep(index + 1);
            steps.forEach((s, i) => {
                if (i === index) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });

    // Scroll trigger for steps with staggered entrance
    ScrollTrigger.create({
        trigger: '.how-section',
        start: 'top 65%',
        onEnter: () => {
            if (!hasAnimated) {
                hasAnimated = true;

                // First animate each step card into view with stagger
                steps.forEach((step, index) => {
                    gsap.to(step, {
                        opacity: 1,
                        x: 0,
                        y: 0,
                        rotation: 0,
                        scale: 1,
                        duration: 0.8,
                        delay: index * 0.25,
                        ease: "back.out(1.4)",
                        onComplete: () => {
                            step.classList.add('visible');
                        }
                    });
                });

                // Then start the typewriter animation after cards are visible
                setTimeout(() => {
                    animateAllSteps();
                }, steps.length * 250 + 400);
            }
        }
    });
}

// Scroll-triggered animations
function initScrollAnimations() {
    // Hero glow follows mouse
    const heroEl = document.querySelector('.hero');
    if (heroEl) {
        heroEl.addEventListener('mousemove', (e) => {
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
    }

    // Trusted By Section Animation
    const trustedTitle = document.querySelector('.trusted-title');
    const trustedSubtitle = document.getElementById('trustedSubtitle');

    if (trustedTitle && trustedSubtitle) {
        // Split title into characters
        const titleText = trustedTitle.textContent;
        trustedTitle.innerHTML = titleText.split('').map(char =>
            char === ' ' ? ' ' : `<span class="char">${char}</span>`
        ).join('');
        trustedTitle.classList.add('ready'); // Show after processing

        // Subtitle texts to cycle through
        const subtitles = [
            "Leading Brands in New Zealand",
            "150+ Companies",
            "Solar & Energy Leaders",
            "Real Estate Giants",
            "Insurance Providers"
        ];
        let currentIndex = 0;
        let isTyping = false;

        // Typewriter settings
        const typeSpeed = 60;      // ms per character when typing
        const deleteSpeed = 40;    // ms per character when deleting
        const pauseAfterType = 2000;  // pause after typing complete
        const pauseAfterDelete = 500; // pause after deleting

        // Typewriter functions
        function typeText(text, callback) {
            let i = 0;
            trustedSubtitle.textContent = '';

            function typeChar() {
                if (i < text.length) {
                    trustedSubtitle.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeChar, typeSpeed);
                } else {
                    if (callback) setTimeout(callback, pauseAfterType);
                }
            }
            typeChar();
        }

        function deleteText(callback) {
            function deleteChar() {
                const currentText = trustedSubtitle.textContent;
                if (currentText.length > 0) {
                    trustedSubtitle.textContent = currentText.slice(0, -1);
                    setTimeout(deleteChar, deleteSpeed);
                } else {
                    if (callback) setTimeout(callback, pauseAfterDelete);
                }
            }
            deleteChar();
        }

        function typewriterCycle() {
            const text = subtitles[currentIndex];
            typeText(text, () => {
                deleteText(() => {
                    currentIndex = (currentIndex + 1) % subtitles.length;
                    typewriterCycle();
                });
            });
        }

        // Animate title characters with SplitText effect
        ScrollTrigger.create({
            trigger: '.trusted-header',
            start: 'top 85%',
            onEnter: () => {
                gsap.to('.trusted-title .char', {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    duration: 0.8,
                    stagger: 0.05,
                    ease: "power3.out",
                    onComplete: () => {
                        // Clear text FIRST, then show subtitle
                        trustedSubtitle.textContent = '';

                        gsap.to('.trusted-subtitle', {
                            opacity: 1,
                            duration: 0.3,
                            ease: "power2.out"
                        });

                        // Start typewriter immediately (text is already cleared)
                        if (!isTyping) {
                            isTyping = true;
                            typewriterCycle();
                        }
                    }
                });
            },
            once: true
        });
    }

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

    // Experts In Section Animation
    const expertsTitle = document.querySelector('.experts-title');
    if (expertsTitle) {
        // Split title into characters
        const titleText = expertsTitle.textContent;
        expertsTitle.innerHTML = titleText.split('').map(char =>
            char === ' ' ? ' ' : `<span class="char">${char}</span>`
        ).join('');
        expertsTitle.classList.add('ready'); // Show after processing

        // Animate title characters
        ScrollTrigger.create({
            trigger: '.experts-header',
            start: 'top 80%',
            onEnter: () => {
                gsap.to('.experts-title .char', {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.04,
                    ease: "power3.out"
                });

                // Animate subtitle after title
                gsap.to('.experts-sub', {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    delay: 0.4,
                    ease: "power2.out"
                });
            },
            once: true
        });

        // Animate expert cards with stagger
        gsap.to('.expert-card', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: '.experts-grid',
                start: 'top 80%'
            }
        });
    }

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

    // Section Titles — Character-by-Character SplitText Reveal
    // (excluding sections after Features which are handled separately due to pin issues)
    gsap.utils.toArray('.section-title').forEach(title => {
        // Skip sections handled separately (after Features horizontal scroll)
        if (title.closest('.how-section') ||
            title.closest('.testimonials') ||
            title.closest('.team-section') ||
            title.closest('.book-call') ||
            title.closest('.contact-section')) return;
        // Simpler approach: process text and highlight spans separately
        const processTitle = (element) => {
            let html = '';
            element.childNodes.forEach(node => {
                if (node.nodeType === 3) {
                    // Text node - split each character
                    const text = node.textContent;
                    for (let i = 0; i < text.length; i++) {
                        const c = text[i];
                        if (c === ' ') {
                            html += ' ';
                        } else {
                            html += `<span class="char">${c}</span>`;
                        }
                    }
                } else if (node.nodeType === 1 && node.classList.contains('highlight')) {
                    // Highlight span - split inner text
                    const text = node.textContent;
                    let innerHtml = '';
                    for (let i = 0; i < text.length; i++) {
                        const c = text[i];
                        if (c === ' ') {
                            innerHtml += ' ';
                        } else {
                            innerHtml += `<span class="char">${c}</span>`;
                        }
                    }
                    html += `<span class="highlight">${innerHtml}</span>`;
                }
            });
            return html;
        };

        title.innerHTML = processTitle(title);
        title.classList.add('ready'); // Show after processing

        // Set initial state
        gsap.set(title.querySelectorAll('.char'), {
            opacity: 0,
            y: 30,
            rotateX: -40
        });

        // Animate on scroll - trigger when title is visible
        ScrollTrigger.create({
            trigger: title,
            start: 'top 75%',
            invalidateOnRefresh: true, // Recalculate after horizontal scroll pins
            onEnter: () => {
                gsap.to(title.querySelectorAll('.char'), {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    duration: 0.6,
                    stagger: 0.03,
                    ease: "back.out(1.7)"
                });
            },
            once: true
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

    // Refresh ScrollTrigger after horizontal scroll is set up
    setTimeout(() => ScrollTrigger.refresh(), 100);

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

    // Team Section — Founders Animation
    gsap.to('.founder-card', {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.3,
        ease: "power3.out",
        scrollTrigger: {
            trigger: '.team-founders',
            start: 'top 80%'
        }
    });

    // Team Section — Image Scale & Reveal
    gsap.from('.founder-card .team-image-placeholder', {
        scale: 0.5,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "back.out(1.7)",
        scrollTrigger: {
            trigger: '.team-founders',
            start: 'top 75%'
        }
    });

    // Team Grid Cards — Staggered Reveal
    gsap.to('.team-grid .team-card', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
            trigger: '.team-grid',
            start: 'top 80%'
        }
    });

    // Team Grid — Image Pop Animation
    gsap.from('.team-grid .team-image-placeholder', {
        scale: 0,
        rotation: -10,
        duration: 0.6,
        stagger: 0.1,
        ease: "back.out(2)",
        scrollTrigger: {
            trigger: '.team-grid',
            start: 'top 75%'
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

    // CTA Section Title — Character SplitText Animation
    const ctaTitle = document.querySelector('.cta-section h2');
    if (ctaTitle) {
        // Split into characters while preserving <br> and <span class="highlight">
        const splitCtaChars = (html) => {
            let result = '';
            let i = 0;
            while (i < html.length) {
                if (html.substring(i, i + 4) === '<br>') {
                    result += '<br>';
                    i += 4;
                } else if (html.substring(i, i + 24) === '<span class="highlight">') {
                    const closeIndex = html.indexOf('</span>', i);
                    const innerText = html.substring(i + 24, closeIndex);
                    let innerChars = '';
                    for (let j = 0; j < innerText.length; j++) {
                        const c = innerText[j];
                        if (c === ' ') innerChars += ' ';
                        else innerChars += `<span class="char">${c}</span>`;
                    }
                    result += `<span class="highlight">${innerChars}</span>`;
                    i = closeIndex + 7;
                } else if (html[i] === '<') {
                    const closeTag = html.indexOf('>', i);
                    result += html.substring(i, closeTag + 1);
                    i = closeTag + 1;
                } else if (html[i] === ' ') {
                    result += ' ';
                    i++;
                } else {
                    result += `<span class="char">${html[i]}</span>`;
                    i++;
                }
            }
            return result;
        };

        ctaTitle.innerHTML = splitCtaChars(ctaTitle.innerHTML);
        ctaTitle.classList.add('ready'); // Show after processing
        gsap.set(ctaTitle.querySelectorAll('.char'), { opacity: 0, y: 40, rotateX: -40 });

        ScrollTrigger.create({
            trigger: '.cta-section',
            start: 'top 75%',
            onEnter: () => {
                gsap.to(ctaTitle.querySelectorAll('.char'), {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    duration: 0.5,
                    stagger: 0.02,
                    ease: "back.out(1.7)"
                });
            },
            once: true
        });
    }

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

    // Book Call Section - Typewriter subtitle
    const bookSubtitle = document.getElementById('bookSubtitle');
    if (bookSubtitle) {
        ScrollTrigger.create({
            trigger: '#book',
            start: 'top 80%',
            onEnter: () => {
                bookSubtitle.classList.add('animate');
            },
            once: true
        });
    }

    // Contact Section Animations
    const contactSection = document.querySelector('.contact-section');
    if (contactSection) {
        // Section label fade in
        gsap.to('.contact-header .section-label', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
                trigger: '.contact-section',
                start: 'top 80%'
            }
        });

        // Form card slide in from left
        gsap.to('.contact-form-card', {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: '.contact-grid',
                start: 'top 75%'
            }
        });

        // Info card slide in from right
        gsap.to('.contact-info-card', {
            opacity: 1,
            x: 0,
            duration: 1,
            delay: 0.2,
            ease: "power3.out",
            scrollTrigger: {
                trigger: '.contact-grid',
                start: 'top 75%'
            }
        });

        // Info blocks staggered reveal
        gsap.to('.contact-info-card .info-block', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
                trigger: '.contact-info-card',
                start: 'top 75%'
            }
        });

        // Social links reveal
        gsap.to('.social-links', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.3,
            ease: "power3.out",
            scrollTrigger: {
                trigger: '.contact-info-card',
                start: 'top 75%'
            }
        });

        // Social icons bounce in
        gsap.from('.social-icon', {
            scale: 0,
            opacity: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: "back.out(2)",
            scrollTrigger: {
                trigger: '.social-icons',
                start: 'top 85%'
            }
        });

        // Footer bar fade in
        gsap.to('.footer-bar', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
                trigger: '.footer-bar',
                start: 'top 95%'
            }
        });
    }
}

// Initialize animations
export function initAnimations() {
    // Split hero title into chars
    document.querySelectorAll('#hero-title .line').forEach(splitLineIntoChars);
    document.getElementById('hero-title').classList.add('ready');

    // Split hero subtitle into words (preserving hero-highlight spans)
    const heroSub = document.querySelector('.hero-sub');
    if (heroSub) {
        // Process each child node
        const processNode = (node) => {
            if (node.nodeType === 3) { // Text node
                return node.textContent.split(' ').filter(w => w).map(word =>
                    `<span class="word">${word}</span>`
                ).join(' ');
            } else if (node.nodeType === 1 && node.classList.contains('hero-highlight')) {
                // Keep hero-highlight spans intact but wrap content
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
        heroSub.childNodes.forEach(node => {
            newHTML += processNode(node) + ' ';
        });
        heroSub.innerHTML = newHTML.trim();
    }

    const heroTitle = document.getElementById('hero-title');
    const isScrolledDown = window.scrollY > 100;

    if (isScrolledDown) {
        // User refreshed while scrolled — skip intro
        document.getElementById('titleIntro').style.display = 'none';
        document.querySelector('.nav-logo').style.opacity = '1';
        gsap.set('.nav-links', { opacity: 1 });
        gsap.set('.nav-cta', { opacity: 1 });
        gsap.set('.hero-bg-grid', { opacity: 1 });
        gsap.set('.hero-glow', { opacity: 1 });
        gsap.set('.hero-glow-2', { opacity: 1 });
        gsap.set('.hero-badge', { opacity: 1, y: 0 });
        gsap.set('#hero-title .char', { opacity: 1, y: 0, rotateX: 0 });
        gsap.set('.hero-sub .word', { opacity: 1, y: 0 });
        gsap.set('.hero-buttons .btn-primary', { opacity: 1, scale: 1, filter: 'blur(0px)' });
        gsap.set('.hero-buttons .btn-secondary', { opacity: 1, scale: 1, filter: 'blur(0px)' });
        gsap.set('#indDashboard', { opacity: 1, y: 0 });
        gsap.set('.ind-tab', { opacity: 1, x: 0 });
        gsap.set('.hero-scroll', { opacity: 1 });

        animateDataIn();
        animateChartIn();
        initScrollAnimations();
    } else {
        // Full intro animation
        const masterTL = gsap.timeline({
            onComplete: () => {
                initScrollAnimations();
            }
        });

        const naturalRect = heroTitle.getBoundingClientRect();

        heroTitle.classList.add('intro-active');
        heroTitle.style.left = naturalRect.left + 'px';
        heroTitle.style.top = naturalRect.top + 'px';
        heroTitle.style.width = naturalRect.width + 'px';

        const bigScale = 1.8;
        const vpCx = window.innerWidth / 2;
        const vpCy = window.innerHeight / 2;
        const titleCx = naturalRect.left + naturalRect.width / 2;
        const titleCy = naturalRect.top + naturalRect.height / 2;
        const startX = vpCx - titleCx;
        const startY = vpCy - titleCy;

        gsap.set(heroTitle, {
            x: startX,
            y: startY,
            scale: bigScale,
            transformOrigin: 'center center'
        });
        gsap.set('#hero-title .char', { opacity: 0, y: 60, rotateX: -40 });

        masterTL
            .to('#hero-title .char', {
                opacity: 1,
                y: 0,
                rotateX: 0,
                duration: 0.6,
                stagger: 0.03,
                ease: "back.out(1.7)"
            }, 0.3)
            .to(heroTitle, {
                x: 0,
                y: 0,
                scale: 1,
                duration: 1.6,
                ease: "power2.inOut"
            }, 2.2)
            .to('#titleIntro', {
                opacity: 0,
                duration: 1,
                ease: "power2.out"
            }, 2.6)
            .add(() => {
                heroTitle.classList.remove('intro-active');
                heroTitle.style.left = '';
                heroTitle.style.top = '';
                heroTitle.style.width = '';
                gsap.set(heroTitle, { clearProps: 'x,y,scale,transformOrigin' });
                document.getElementById('titleIntro').style.display = 'none';
            }, 3.9)
            .add(() => {
                document.querySelector('.nav-logo').style.opacity = '1';
            }, 3.4)
            .to('.nav-links', { opacity: 1, duration: 0.6, ease: "power2.out" }, 3.6)
            .to('.nav-cta', { opacity: 1, duration: 0.6, ease: "power2.out" }, 3.7)
            .to('.hero-bg-grid', { opacity: 1, duration: 1.5 }, 3.2)
            .to('.hero-glow', { opacity: 1, duration: 2, scale: 1.2 }, 3.2)
            .to('.hero-glow-2', { opacity: 1, duration: 2 }, 3.6)
            .to('.hero-badge', { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 4.1)
            .to('.hero-sub .word', {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.08,
                ease: "power3.out"
            }, 4.0)
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
            .to('#indDashboard', { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, 4.0)
            .fromTo('.ind-tab', { opacity: 0, x: -15 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: "power3.out" }, 4.2)
            .add(() => {
                animateDataIn();
            }, 4.4)
            .add(() => {
                animateChartIn();
            }, 4.8)
            .to('.hero-scroll', { opacity: 1, duration: 0.8 }, 6.2);
    }

    // Initialize highlight text split for bounce animation
    initHighlightTextSplit();
}

// Split highlight text into individual characters for bounce animation
function initHighlightTextSplit() {
    // Split highlight texts
    const highlightTexts = document.querySelectorAll('.highlight-text');
    highlightTexts.forEach(el => {
        const text = el.textContent;
        let html = '';
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === ' ') {
                html += '<span class="char" style="width: 0.3em;">&nbsp;</span>';
            } else {
                html += `<span class="char">${char}</span>`;
            }
        }
        el.innerHTML = html;
    });

    // Split bounce-text (names and roles)
    const bounceTexts = document.querySelectorAll('.bounce-text');
    bounceTexts.forEach(el => {
        const text = el.textContent;
        let html = '';
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === ' ') {
                html += '<span class="char" style="width: 0.3em;">&nbsp;</span>';
            } else {
                html += `<span class="char">${char}</span>`;
            }
        }
        el.innerHTML = html;
    });
}
