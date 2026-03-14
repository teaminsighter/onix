/**
 * ONIX - Raining Logos Animation
 * Mathematical grid-based logo placement
 */

class LogoRain {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) return;

        // 10 logos (absolute paths for production)
        this.icons = [
            '/logos/logot1.jpeg',
            '/logos/logot2.png',
            '/logos/logot3.png',
            '/logos/logot4.png',
            '/logos/logot5.png',
            '/logos/logot6.png',
            '/logos/logot7.png',
            '/logos/logot8.png',
            '/logos/logot9.png',
            '/logos/logot10.png'
        ];

        // 16 fixed positions - zig-zag pattern, no vertical alignment
        this.positions = [
            // Row 1 - Top area
            { x: 3, y: 10 },     // 1: Top-left
            { x: 28, y: 6 },     // 2: Top-center-left
            { x: 68, y: 12 },    // 3: Top-center-right
            { x: 94, y: 8 },     // 4: Top-right

            // Row 2 - Upper middle (zig-zag offset)
            { x: 10, y: 30 },    // 5: Upper-left (shifted right)
            { x: 38, y: 26 },    // 6: Upper-center-left
            { x: 60, y: 32 },    // 7: Upper-center-right
            { x: 88, y: 28 },    // 8: Upper-right (shifted left)

            // Row 3 - Middle (zig-zag opposite)
            { x: 4, y: 55 },     // 9: Mid-left (shifted left)
            { x: 22, y: 58 },    // 10: Mid-center-left
            { x: 78, y: 54 },    // 11: Mid-center-right
            { x: 92, y: 60 },    // 12: Mid-right (shifted right)

            // Row 4 - Bottom area (zig-zag offset)
            { x: 12, y: 85 },    // 13: Bottom-left (shifted right)
            { x: 32, y: 90 },    // 14: Bottom-center-left
            { x: 72, y: 82 },    // 15: Bottom-center-right
            { x: 86, y: 88 },    // 16: Bottom-right (shifted left)
        ];

        // Timing settings
        this.visibilityDuration = 8000;  // 8 seconds total animation
        this.spawnInterval = 1200;       // 1.2 seconds between spawns

        // Queues for equal distribution
        this.iconQueue = [];
        this.positionQueue = [];
        this.running = false;
        this.iconSize = 90;

        this.shuffleIcons();
        this.shufflePositions();
    }

    shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    shuffleIcons() {
        this.iconQueue = this.shuffle(this.icons);
    }

    shufflePositions() {
        this.positionQueue = this.shuffle([...Array(this.positions.length).keys()]);
    }

    getNextIcon() {
        if (this.iconQueue.length === 0) {
            this.shuffleIcons();
        }
        return this.iconQueue.pop();
    }

    getNextPosition() {
        if (this.positionQueue.length === 0) {
            this.shufflePositions();
        }
        const index = this.positionQueue.pop();
        return this.positions[index];
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.spawnNext();
    }

    stop() {
        this.running = false;
    }

    spawnNext() {
        if (!this.running) return;

        this.spawnIcon();

        setTimeout(() => this.spawnNext(), this.spawnInterval);
    }

    spawnIcon() {
        const icon = this.getNextIcon();
        const pos = this.getNextPosition();

        const containerRect = this.container.getBoundingClientRect();
        const w = containerRect.width;
        const h = containerRect.height;

        // Calculate pixel position from percentage
        const x = (pos.x / 100) * w;
        const y = (pos.y / 100) * h;

        // Small random offset (±15px) for natural look
        const offsetX = (Math.random() - 0.5) * 30;
        const offsetY = (Math.random() - 0.5) * 20;

        const wrapper = document.createElement('div');
        wrapper.className = 'icon-wrapper';
        wrapper.style.cssText = `
            --icon-size: ${this.iconSize}px;
            --duration: ${this.visibilityDuration}ms;
            left: ${Math.max(10, Math.min(w - this.iconSize - 10, x + offsetX))}px;
            top: ${Math.max(10, Math.min(h - this.iconSize - 10, y + offsetY))}px;
        `;

        const layer1 = document.createElement('div');
        layer1.className = 'layer-1';

        const layer2 = document.createElement('div');
        layer2.className = 'layer-2';
        layer2.style.backgroundImage = `url('${icon}')`;

        layer1.appendChild(layer2);
        wrapper.appendChild(layer1);
        this.container.appendChild(wrapper);

        // Remove after animation completes
        setTimeout(() => {
            wrapper.remove();
        }, this.visibilityDuration + 100);
    }
}

// Initialize when DOM is ready
export function initLogoRain() {
    const logoRain = new LogoRain('#logo-rain-bg');

    // Use Intersection Observer to start/stop animation when section is visible
    const section = document.querySelector('.trusted-stats-section');
    if (!section) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                logoRain.start();
            } else {
                logoRain.stop();
            }
        });
    }, { threshold: 0.1 });

    observer.observe(section);
}
