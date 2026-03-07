/**
 * ONIX - App Utilities
 * Custom cursor, magnetic effects, and smart navbar
 */

// ============================================================
//  CUSTOM CURSOR — Smooth Follow
// ============================================================
const cursor = document.querySelector('.cursor');
const cursorDot = document.querySelector('.cursor-dot');
let mouseX = 0, mouseY = 0;

if (cursor && cursorDot) {
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    gsap.ticker.add(() => {
        gsap.to(cursor, {
            x: mouseX - 10,
            y: mouseY - 10,
            duration: 0.4,
            ease: "power2.out"
        });
        gsap.to(cursorDot, {
            x: mouseX - 3,
            y: mouseY - 3,
            duration: 0.1
        });
    });

    // Hover effect on interactive elements
    document.querySelectorAll('a, button, .magnetic').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });
}

// ============================================================
//  MAGNETIC BUTTON EFFECT
// ============================================================
document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, {
            x: x * 0.3,
            y: y * 0.3,
            duration: 0.4,
            ease: "power2.out"
        });
    });
    el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
    });
});

// ============================================================
//  SMART NAVBAR — Hide on scroll down, show on scroll up
// ============================================================
const navbar = document.getElementById('navbar');
let lastScrollY = window.scrollY;
let ticking = false;

function updateNavbar() {
    const currentScrollY = window.scrollY;

    // Only hide/show after scrolling past 100px
    if (currentScrollY > 100) {
        if (currentScrollY > lastScrollY) {
            // Scrolling down — hide navbar
            navbar.classList.add('hidden');
        } else {
            // Scrolling up — show navbar
            navbar.classList.remove('hidden');
        }
    } else {
        // At top — always show
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
