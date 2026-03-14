/**
 * ONIX - Utility Functions
 * Magnetic buttons and smart navbar
 */

// Magnetic button effect
export function initMagnetic() {
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
}

// Smart navbar - hide on scroll down, show on scroll up or when stopped
export function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let lastScrollY = window.scrollY;
    let ticking = false;
    let scrollDirection = 'up';
    let scrollStopTimer = null;

    function showNavbar() {
        navbar.classList.remove('hidden');
    }

    function updateNavbar() {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY;

        // Add scrolled class when past hero section
        if (currentScrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Determine scroll direction (only if significant movement)
        if (scrollDelta > 10) {
            scrollDirection = 'down';
        } else if (scrollDelta < -10) {
            scrollDirection = 'up';
        }

        // Hide/show based on scroll direction
        if (currentScrollY > 100) {
            if (scrollDirection === 'down') {
                navbar.classList.add('hidden');
            } else {
                navbar.classList.remove('hidden');
            }
        } else {
            // At top - always show
            navbar.classList.remove('hidden');
        }

        lastScrollY = currentScrollY;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        // Clear existing timer
        if (scrollStopTimer) {
            clearTimeout(scrollStopTimer);
        }

        // Update navbar state
        if (!ticking) {
            requestAnimationFrame(updateNavbar);
            ticking = true;
        }

        // Show navbar after scrolling stops (500ms delay)
        scrollStopTimer = setTimeout(showNavbar, 500);
    });

    // Initial check
    updateNavbar();

    // Active section highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    function updateActiveLink() {
        const scrollY = window.scrollY;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 200;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink();
}
