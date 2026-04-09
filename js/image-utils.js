/**
 * ONIX Image Utilities
 * Helpers for WebP detection and responsive images
 */

// Check if browser supports WebP
const supportsWebP = (function() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
})();

// Add class to body for CSS-based image handling
if (supportsWebP) {
    document.documentElement.classList.add('webp');
} else {
    document.documentElement.classList.add('no-webp');
}

/**
 * Convert image src to WebP if supported
 * @param {string} src - Original image source
 * @returns {string} - WebP source if supported, original otherwise
 */
function getOptimizedImageSrc(src) {
    if (!supportsWebP) return src;

    // Replace extension with .webp
    return src.replace(/\.(png|jpg|jpeg|gif)$/i, '.webp');
}

/**
 * Lazy load images with WebP support
 * Add data-src attribute to images for lazy loading
 */
function initLazyImages() {
    const lazyImages = document.querySelectorAll('img[data-src]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.dataset.src;

                    // Use WebP if supported
                    img.src = getOptimizedImageSrc(src);

                    // Handle load/error
                    img.onload = () => img.classList.add('loaded');
                    img.onerror = () => {
                        // Fallback to original if WebP fails
                        img.src = src;
                    };

                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

/**
 * Create picture element with WebP source
 * @param {string} src - Original image source
 * @param {string} alt - Alt text
 * @param {string} className - CSS class
 * @returns {HTMLElement} - Picture element
 */
function createPictureElement(src, alt = '', className = '') {
    const picture = document.createElement('picture');

    // WebP source
    const webpSource = document.createElement('source');
    webpSource.srcset = src.replace(/\.(png|jpg|jpeg|gif)$/i, '.webp');
    webpSource.type = 'image/webp';

    // Fallback img
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    if (className) img.className = className;
    img.loading = 'lazy';

    picture.appendChild(webpSource);
    picture.appendChild(img);

    return picture;
}

// Export for use in modules
export {
    supportsWebP,
    getOptimizedImageSrc,
    initLazyImages,
    createPictureElement
};
