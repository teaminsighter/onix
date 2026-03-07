/**
 * ONIX - Industry Dashboard
 * Handles industry data, bento grid, charts, and tab switching
 */

// ============================================================
//  INDUSTRY DATA — Bento + Charts
// ============================================================
const industries = {
    tradies: {
        title: 'Tradies',
        bentoClass: 'bento-tradies',
        shapes: ['s-round', 's-pill', 's-round', 's-cut'],
        stats: [
            { icon: '&#128295;', val: '342', num: 342, lbl: 'Booked Jobs', change: '+38%' },
            { icon: '&#128176;', val: '$84k', num: 84, lbl: 'Revenue', change: '+45%' },
            { icon: '&#128172;', val: '24.6%', num: 24.6, lbl: 'Reply Rate', change: '+12%' },
            { icon: '&#9203;', val: '12s', num: 12, lbl: 'Avg Response', change: '-8s' },
        ],
        chart: 'bar',
        chartTitle: 'Jobs Booked',
        chartBadge: '+38% growth',
        bars: [28,42,35,55,48,62,58,72,65,80,88,95],
        barLabels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        barColors: ['rgba(201,243,29,0.2)','rgba(201,243,29,0.25)','rgba(201,243,29,0.2)','rgba(201,243,29,0.3)','rgba(201,243,29,0.25)','rgba(201,243,29,0.35)','rgba(201,243,29,0.3)','rgba(201,243,29,0.45)','rgba(201,243,29,0.4)','rgba(201,243,29,0.55)','rgba(201,243,29,0.7)','var(--accent)']
    },
    builders: {
        title: 'Builders',
        bentoClass: 'bento-builders',
        shapes: ['s-cut', 's-sharp', 's-cut', 's-soft'],
        stats: [
            { icon: '&#127959;', val: '$214k', num: 214, lbl: 'Project Revenue', change: '+52%' },
            { icon: '&#128196;', val: '67', num: 67, lbl: 'Quotes Sent', change: '+28%' },
            { icon: '&#127919;', val: '43%', num: 43, lbl: 'Win Rate', change: '+15%' },
            { icon: '&#128200;', val: '$32k', num: 32, lbl: 'Avg Deal Size', change: '+$8k' },
        ],
        chart: 'line',
        chartTitle: 'Revenue Growth',
        chartBadge: '+52% YoY',
        points: [15,22,30,28,40,48,55,62,70,78,85,92],
        lineLabels: ['Q1','Q2','Q3','Q4','Q1','Q2','Q3','Q4','Q1','Q2','Q3','Q4']
    },
    solar: {
        title: 'Solar',
        bentoClass: 'bento-solar',
        shapes: ['s-pill', 's-pill', 's-round', 's-pill'],
        stats: [
            { icon: '&#9728;', val: '189', num: 189, lbl: 'Installs Booked', change: '+41%' },
            { icon: '&#128176;', val: '$12.8', num: 12.8, lbl: 'Cost / Lead', change: '-22%', down: true },
            { icon: '&#127919;', val: '31%', num: 31, lbl: 'Close Rate', change: '+9%' },
            { icon: '&#9889;', val: '8.2x', num: 8.2, lbl: 'ROI', change: '+3.1x' },
        ],
        chart: 'pie',
        chartTitle: 'Lead Sources',
        chartBadge: 'This quarter',
        pie: [
            { label: 'Meta Ads', val: 45, color: 'var(--accent)' },
            { label: 'Google Ads', val: 30, color: 'rgba(100,200,255,0.8)' },
            { label: 'Referral', val: 25, color: 'rgba(255,255,255,0.25)' }
        ]
    },
    insurance: {
        title: 'Insurance',
        bentoClass: 'bento-insurance',
        shapes: ['s-sharp', 's-soft', 's-sharp', 's-round'],
        stats: [
            { icon: '&#128737;', val: '1,247', num: 1247, lbl: 'Leads Captured', change: '+36%' },
            { icon: '&#128176;', val: '$392k', num: 392, lbl: 'Premium Value', change: '+58%' },
            { icon: '&#128200;', val: '18%', num: 18, lbl: 'Conversion', change: '+6%' },
            { icon: '&#9733;', val: '$4.2k', num: 4.2, lbl: 'Avg LTV', change: '+$800' },
        ],
        chart: 'area',
        chartTitle: 'Lead Volume',
        chartBadge: '+36% this month',
        points: [10,18,25,22,35,42,38,52,60,65,72,82],
        lineLabels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    },
    agencies: {
        title: 'Agencies',
        bentoClass: 'bento-agencies',
        shapes: ['s-soft', 's-round', 's-pill', 's-soft'],
        stats: [
            { icon: '&#128640;', val: '48', num: 48, lbl: 'Clients Scaled', change: '+32%' },
            { icon: '&#128176;', val: '$1.2M', num: 1.2, lbl: 'Client Revenue', change: '+67%' },
            { icon: '&#128153;', val: '94%', num: 94, lbl: 'Retention', change: '+8%' },
            { icon: '&#9733;', val: '72', num: 72, lbl: 'NPS Score', change: '+12' },
        ],
        chart: 'donut',
        chartTitle: 'Revenue Split',
        chartBadge: 'All clients',
        pie: [
            { label: 'Paid Ads', val: 40, color: 'var(--accent)' },
            { label: 'SEO', val: 25, color: 'rgba(100,200,255,0.8)' },
            { label: 'CRM Setup', val: 35, color: 'rgba(255,180,100,0.7)' }
        ]
    }
};

let currentInd = 'tradies';
let autoRotateTimer = null;

// ── Format number based on original format string ──
function formatNumber(num, format) {
    const prefix = format.match(/^[^0-9.]*/)[0] || '';
    const suffix = format.match(/[^0-9.]*$/)[0] || '';
    const hasDecimal = format.includes('.');
    const decimalPlaces = hasDecimal ? (format.split('.')[1].match(/[0-9]/g) || []).length : 0;

    let formatted;
    if (hasDecimal) {
        formatted = num.toFixed(decimalPlaces);
    } else {
        formatted = Math.round(num).toLocaleString();
    }

    return prefix + formatted + suffix;
}

// ── Count up animation for stat numbers ──
function animateCountUp(element, duration = 1.5, delay = 0) {
    const target = parseFloat(element.dataset.target);
    const format = element.dataset.format;

    gsap.fromTo(element,
        { innerText: 0 },
        {
            innerText: target,
            duration: duration,
            delay: delay,
            ease: "power2.out",
            snap: { innerText: target % 1 === 0 ? 1 : 0.1 },
            onUpdate: function() {
                const current = parseFloat(element.innerText) || 0;
                element.textContent = formatNumber(current, format);
            }
        }
    );
}

// ── Typewriter animation for labels ──
function typewriterLabel(element, text, delay = 0) {
    element.textContent = '';
    element.style.opacity = '1';
    let idx = 0;
    const speed = 40;

    setTimeout(() => {
        const type = () => {
            if (idx <= text.length) {
                element.textContent = text.substring(0, idx);
                idx++;
                setTimeout(type, speed);
            }
        };
        type();
    }, delay);
}

// ── Render Bento ──
function renderBento(ind, skipValues = false) {
    const d = industries[ind];
    const grid = document.getElementById('bentoGrid');
    grid.className = 'bento-grid ' + d.bentoClass;
    grid.innerHTML = d.stats.map((s, i) =>
        '<div class="bento-box ' + d.shapes[i % d.shapes.length] + '">' +
            '<div class="bento-val" data-target="' + s.num + '" data-format="' + s.val + '">' + (skipValues ? '0' : s.val) + '</div>' +
            '<div class="bento-lbl">' + s.lbl + '</div>' +
            '<div class="bento-change' + (s.down ? ' down' : '') + '">' + s.change + '</div>' +
        '</div>'
    ).join('');
}

// ── Render Chart ──
function renderChart(ind) {
    const d = industries[ind];
    const area = document.getElementById('chartArea');
    const labels = document.getElementById('chartLabels');
    document.getElementById('chartTitle').textContent = d.chartTitle;
    document.getElementById('chartBadge').textContent = d.chartBadge;

    if (d.chart === 'bar') {
        area.innerHTML = '<div class="chart-bars" id="cBars">' +
            d.bars.map((h, i) => '<div class="chart-bar" style="height:0%;background:' + d.barColors[i] + '" data-h="' + h + '"></div>').join('') +
            '</div>';
        labels.innerHTML = d.barLabels.map(l => '<span>' + l + '</span>').join('');
    }
    else if (d.chart === 'line' || d.chart === 'area') {
        const w = 340, h = 100;
        const step = w / (d.points.length - 1);
        const coords = d.points.map((p, i) => [i * step, h - (p / 100) * h]);
        const pts = coords.map(c => c.join(',')).join(' ');
        const areaD = 'M0,' + h + ' L' + pts + ' L' + w + ',' + h + ' Z';
        const grad = d.chart === 'area' ? 'url(#areaGradBlue)' : 'url(#areaGrad)';
        area.innerHTML =
            '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">' +
            '<defs>' +
            '<linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">' +
            '<stop offset="0%" stop-color="rgba(201,243,29,0.3)"/>' +
            '<stop offset="100%" stop-color="rgba(201,243,29,0)"/>' +
            '</linearGradient>' +
            '<linearGradient id="areaGradBlue" x1="0%" y1="0%" x2="0%" y2="100%">' +
            '<stop offset="0%" stop-color="rgba(100,200,255,0.3)"/>' +
            '<stop offset="100%" stop-color="rgba(100,200,255,0)"/>' +
            '</linearGradient>' +
            '</defs>' +
            '<path class="svg-area" d="' + areaD + '" fill="' + grad + '" />' +
            '<polyline class="svg-line" points="' + pts + '" style="stroke:' + (d.chart === 'area' ? 'rgba(100,200,255,0.8)' : 'var(--accent)') + '" />' +
            coords.map(c => '<circle class="svg-dot" cx="' + c[0] + '" cy="' + c[1] + '" r="3"/>').join('') +
            '</svg>';
        labels.innerHTML = d.lineLabels.map(l => '<span>' + l + '</span>').join('');
    }
    else if (d.chart === 'pie' || d.chart === 'donut') {
        const r = 42, cx = 50, cy = 50;
        const circ = 2 * Math.PI * r;
        const innerR = d.chart === 'donut' ? 28 : 0;
        let offset = 0;
        const segs = d.pie.map(s => {
            const dash = (s.val / 100) * circ;
            const seg = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + s.color + '" stroke-width="' + (r - innerR) + '" stroke-dasharray="' + dash + ' ' + (circ - dash) + '" stroke-dashoffset="-' + offset + '" class="pie-seg" />';
            offset += dash;
            return seg;
        });
        const legend = d.pie.map(s =>
            '<div class="pie-legend-item"><span class="pie-legend-dot" style="background:' + s.color + '"></span>' + s.label + '<span class="pie-legend-val">' + s.val + '%</span></div>'
        ).join('');
        area.innerHTML =
            '<div class="chart-pie">' +
            '<svg viewBox="0 0 100 100"><g transform="rotate(-90 50 50)">' + segs.join('') + '</g>' +
            (d.chart === 'donut' ? '<circle cx="50" cy="50" r="' + innerR + '" fill="rgba(20,20,20,0.6)"/>' : '') +
            '</svg>' +
            '<div class="pie-legend">' + legend + '</div></div>';
        labels.innerHTML = '';
    }
}

// ── Animate data text IN — counting + typewriter ──
function animateDataIn(isInitial = true) {
    const d = industries[currentInd];

    // Values: counting animation
    document.querySelectorAll('#bentoGrid .bento-val').forEach((el, i) => {
        gsap.to(el, { opacity: 1, duration: 0.1 });
        animateCountUp(el, 1.2, i * 0.15);
    });

    // Labels: typewriter animation
    if (isInitial) {
        document.querySelectorAll('#bentoGrid .bento-lbl').forEach((el, i) => {
            const text = d.stats[i].lbl;
            el.style.opacity = '0';
            typewriterLabel(el, text, 500 + i * 200);
        });

        // Change badges scale in with bounce
        gsap.fromTo('#bentoGrid .bento-change',
            { opacity: 0, scale: 0.7 },
            { opacity: 1, scale: 1, duration: 0.8, stagger: 0.2, delay: 1.2, ease: "back.out(1.8)" }
        );
    }
}

// ── Animate chart data IN — slow and cinematic ──
function animateChartIn() {
    const d = industries[currentInd];

    // Chart title slides in from left
    gsap.fromTo('#chartTitle',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 1, ease: "power3.out" }
    );
    // Badge pops in with delay
    gsap.fromTo('#chartBadge',
        { opacity: 0, scale: 0.6 },
        { opacity: 1, scale: 1, duration: 0.8, delay: 0.5, ease: "back.out(2)" }
    );

    if (d.chart === 'bar') {
        // Bars rise slowly one by one
        document.querySelectorAll('#cBars .chart-bar').forEach((bar, i) => {
            gsap.fromTo(bar,
                { height: '0%' },
                { height: bar.dataset.h + '%', duration: 1.4, delay: 0.5 + i * 0.12, ease: "power3.out" }
            );
        });
    } else if (d.chart === 'line' || d.chart === 'area') {
        // Line draws very slowly
        const line = document.querySelector('#chartArea .svg-line');
        if (line) {
            const len = line.getTotalLength ? line.getTotalLength() : 600;
            gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
            gsap.to(line, { strokeDashoffset: 0, duration: 2.8, delay: 0.4, ease: "power1.inOut" });
        }
        // Area fills in slowly behind the line
        gsap.set('#chartArea .svg-area', { opacity: 0 });
        gsap.to('#chartArea .svg-area', { opacity: 0.8, duration: 1.8, delay: 1.8, ease: "power2.out" });
        // Dots pop in one by one after line passes them
        gsap.set('#chartArea .svg-dot', { scale: 0, transformOrigin: 'center' });
        gsap.to('#chartArea .svg-dot', { scale: 1, duration: 0.6, stagger: 0.15, delay: 1.5, ease: "elastic.out(1, 0.5)" });
    } else if (d.chart === 'pie' || d.chart === 'donut') {
        // Animate each segment by growing its visible dash from 0
        const segs = document.querySelectorAll('#chartArea .pie-seg');
        segs.forEach((seg, i) => {
            const dashArray = seg.getAttribute('stroke-dasharray');
            const dash = parseFloat(dashArray.split(' ')[0]);
            const gap = parseFloat(dashArray.split(' ')[1]);
            const circ = dash + gap;
            // Start invisible (0-length dash)
            seg.setAttribute('stroke-dasharray', '0 ' + circ);
            // Animate to full segment
            gsap.to(seg, {
                attr: { 'stroke-dasharray': dash + ' ' + gap },
                duration: 2.2,
                delay: 0.4 + i * 0.5,
                ease: "power2.inOut"
            });
        });
        // Legend items appear one by one
        gsap.fromTo('#chartArea .pie-legend-item',
            { opacity: 0, x: 15 },
            { opacity: 1, x: 0, duration: 1, stagger: 0.3, delay: 1.2, ease: "power2.out" }
        );
    }

    // Labels fade in slowly one by one
    gsap.fromTo('#chartLabels span',
        { opacity: 0, y: 5 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, delay: 1, ease: "power2.out" }
    );
}

// ── Switch Industry — slow, elegant transitions ──
let switching = false;
function switchIndustry(ind, fromAutoRotate) {
    if (ind === currentInd && !fromAutoRotate) return;
    if (switching) return;
    switching = true;
    currentInd = ind;

    // Update tab active state
    document.querySelectorAll('.ind-tab').forEach(t => t.classList.remove('active'));
    const activeTab = document.querySelector('.ind-tab[data-ind="' + ind + '"]');
    activeTab.classList.add('active');

    // Slide indicator — smooth glide
    const slider = document.getElementById('tabSlider');
    const tabsContainer = document.getElementById('indTabs');
    const tabRect = activeTab.getBoundingClientRect();
    const containerRect = tabsContainer.getBoundingClientRect();
    gsap.to(slider, { top: tabRect.top - containerRect.top, height: tabRect.height, duration: 0.8, ease: "power3.inOut" });

    // Title: slide down and fade, then new title slides up
    const title = document.getElementById('indTitle');
    gsap.to(title, { opacity: 0, y: 12, duration: 0.6, ease: "power2.in", onComplete: () => {
        title.textContent = industries[ind].title;
        gsap.fromTo(title, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" });
    }});

    // Bento: update values with counting animation (no fade out)
    const newData = industries[ind];
    const bentoVals = document.querySelectorAll('#bentoGrid .bento-val');
    const bentoLbls = document.querySelectorAll('#bentoGrid .bento-lbl');
    const bentoChanges = document.querySelectorAll('#bentoGrid .bento-change');

    // Update data attributes and animate count to new values
    bentoVals.forEach((el, i) => {
        const stat = newData.stats[i];
        el.dataset.target = stat.num;
        el.dataset.format = stat.val;
        animateCountUp(el, 1, i * 0.1);
    });

    // Update labels with typewriter animation
    bentoLbls.forEach((el, i) => {
        gsap.to(el, {
            opacity: 0,
            duration: 0.15,
            onComplete: () => {
                typewriterLabel(el, newData.stats[i].lbl, i * 100);
            }
        });
    });

    // Update change badges with subtle fade
    bentoChanges.forEach((el, i) => {
        gsap.to(el, {
            opacity: 0,
            scale: 0.8,
            duration: 0.2,
            onComplete: () => {
                el.textContent = newData.stats[i].change;
                el.className = 'bento-change' + (newData.stats[i].down ? ' down' : '');
                gsap.to(el, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.5)" });
            }
        });
    });

    // Chart: fade everything out together, then swap and animate in
    const chartExitTL = gsap.timeline({
        onComplete: () => {
            renderChart(ind);
            gsap.set('#chartArea, #chartTitle, #chartBadge, #chartLabels', { opacity: 1, y: 0, x: 0, scale: 1 });
            animateChartIn();
            setTimeout(() => { switching = false; }, 2000);
        }
    });
    chartExitTL
        .to('#chartTitle, #chartBadge', { opacity: 0, duration: 0.5, ease: "power2.in" }, 0)
        .to('#chartLabels span', { opacity: 0, duration: 0.4, stagger: 0.02, ease: "power2.in" }, 0)
        .to('#chartArea', { opacity: 0, y: 8, duration: 0.6, ease: "power2.in" }, 0);

    // Safety unlock
    setTimeout(() => { switching = false; }, 5000);
}

// ── Auto-rotate functions ──
function startAutoRotate() {
    const keys = Object.keys(industries);
    autoRotateTimer = setInterval(() => {
        const idx = (keys.indexOf(currentInd) + 1) % keys.length;
        switchIndustry(keys[idx], true);
    }, 8000);
}

function stopAutoRotate() {
    clearInterval(autoRotateTimer);
}

// ============================================================
//  INITIALIZE DASHBOARD
// ============================================================
function initDashboard() {
    // Render with 0 values, will count up on animation
    renderBento('tradies', true);
    renderChart('tradies');

    // Position the slider on first tab
    setTimeout(() => {
        const firstTab = document.querySelector('.ind-tab.active');
        const slider = document.getElementById('tabSlider');
        const tabsContainer = document.getElementById('indTabs');
        if (firstTab && tabsContainer) {
            const tabRect = firstTab.getBoundingClientRect();
            const containerRect = tabsContainer.getBoundingClientRect();
            slider.style.top = (tabRect.top - containerRect.top) + 'px';
            slider.style.height = tabRect.height + 'px';
        }
    }, 100);

    // Tab click handlers
    document.querySelectorAll('.ind-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            switchIndustry(tab.dataset.ind, false);
            stopAutoRotate();
            startAutoRotate();
        });
    });

    // Auto-rotate pause on hover
    const dashEl = document.getElementById('indDashboard');
    if (dashEl) {
        dashEl.addEventListener('mouseenter', stopAutoRotate);
        dashEl.addEventListener('mouseleave', startAutoRotate);
    }

    // Start auto-rotate after initial animations
    setTimeout(startAutoRotate, 7000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}
