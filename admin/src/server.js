/**
 * ONIX Admin Dashboard - Server
 * Lead management and analytics backend
 */

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const expressLayouts = require('express-ejs-layouts');

const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const meetingRoutes = require('./routes/meetings');
const costRoutes = require('./routes/costs');
const settingRoutes = require('./routes/settings');
const webhookRoutes = require('./routes/webhook');
const dashboardRoutes = require('./routes/dashboard');
const { authenticateToken, authenticateView } = require('./middleware/auth');
const { leads, db } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy when behind reverse proxy (Coolify/Traefik)
if (process.env.TRUST_PROXY || process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Security middleware - relaxed CSP for frontend marketing site
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://www.googletagmanager.com", "https://tagmanager.google.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://fonts.googleapis.com", "data:"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "'unsafe-eval'",
                "https://cdnjs.cloudflare.com",
                "https://link.msgsndr.com",
                "https://static.cloudflareinsights.com",
                "https://www.googletagmanager.com",
                "https://tagmanager.google.com",
                "https://www.google-analytics.com",
                "https://connect.facebook.net",
                "https://www.clarity.ms",
                "https://scripts.clarity.ms",
                "https://ss.onixmrkt.com"
            ],
            scriptSrcAttr: ["'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            frameSrc: ["'self'", "https://api.leadconnectorhq.com", "https://link.msgsndr.com", "https://msgsndr.com", "https://www.google.com", "https://www.googletagmanager.com", "https://tagmanager.google.com"],
            connectSrc: ["'self'", "https://api.leadconnectorhq.com", "https://link.msgsndr.com", "https://www.google-analytics.com", "https://region1.google-analytics.com", "https://www.googletagmanager.com", "https://www.clarity.ms", "https://ss.onixmrkt.com"],
            workerSrc: ["'self'", "blob:"],
        },
    },
}));

// CORS
const corsOrigins = process.env.CORS_ORIGIN?.split(',').map(s => s.trim()).filter(Boolean) || ['http://localhost:5173'];
app.use(cors({
    origin: corsOrigins,
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Stricter rate limit on login to prevent brute force
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many login attempts. Please try again in 15 minutes.' }
});
app.use('/api/auth/login', loginLimiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Attach allLeads to all authenticated views (for modal dropdowns)
app.use((req, res, next) => {
    res.locals.allLeads = [];
    if (req.cookies?.auth_token) {
        try { res.locals.allLeads = leads.getAll.all(); } catch (e) { /* ignore */ }
    }
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', authenticateToken, leadRoutes);
app.use('/api/meetings', authenticateToken, meetingRoutes);
app.use('/api/costs', authenticateToken, costRoutes);
app.use('/api/settings', authenticateToken, settingRoutes);
app.use('/api/webhook', webhookRoutes); // No auth for webhooks (they use secret)

// Serve built frontend static files FIRST (before admin routes)
const frontendPath = path.join(__dirname, '../public/site');
if (fs.existsSync(frontendPath)) {
    // Redirect .html URLs to clean URLs (301 for SEO)
    app.get('*.html', (req, res, next) => {
        // Skip admin/api routes
        if (req.path.startsWith('/api/')) return next();
        // Redirect /page.html to /page
        const cleanPath = req.path.replace(/\.html$/, '');
        return res.redirect(301, cleanPath + (req._parsedUrl.search || ''));
    });

    // Serve all frontend static files (assets, images, logos, etc.)
    // This must come before admin routes
    app.use(express.static(frontendPath, {
        maxAge: '1d',
        index: false // Don't auto-serve index.html, we handle that manually
    }));

    // Serve frontend HTML pages for non-admin paths
    app.get('*', (req, res, next) => {
        // Skip admin routes - let them fall through to dashboardRoutes
        if (req.path.startsWith('/api/') ||
            req.path.startsWith('/admin') ||
            req.path === '/login' ||
            req.path === '/dashboard' ||
            req.path.startsWith('/leads') ||
            req.path.startsWith('/pipeline') ||
            req.path.startsWith('/calendar') ||
            req.path.startsWith('/meetings') ||
            req.path.startsWith('/costs') ||
            req.path.startsWith('/analytics') ||
            req.path.startsWith('/settings') ||
            req.path.startsWith('/team') ||
            req.path.startsWith('/uploads/')) {
            return next();
        }

        // Try to serve the exact file from the built frontend
        const requestPath = req.path === '/' ? 'index.html' : req.path;
        const filePath = path.join(frontendPath, requestPath);
        const htmlPath = filePath.endsWith('.html') ? filePath : filePath + '.html';

        if (fs.existsSync(filePath) && !fs.statSync(filePath).isDirectory()) {
            return res.sendFile(filePath);
        } else if (fs.existsSync(htmlPath)) {
            return res.sendFile(htmlPath);
        }
        // Not a frontend file, continue to admin routes
        next();
    });
}

// Admin dashboard routes (login, dashboard, leads, etc.)
app.use('/', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        res.status(404).json({ error: 'Not found' });
    } else if (req.path === '/login' ||
               req.path === '/dashboard' ||
               req.path.startsWith('/leads') ||
               req.path.startsWith('/pipeline') ||
               req.path.startsWith('/calendar') ||
               req.path.startsWith('/meetings') ||
               req.path.startsWith('/costs') ||
               req.path.startsWith('/analytics') ||
               req.path.startsWith('/settings') ||
               req.path.startsWith('/team') ||
               req.path.startsWith('/admin')) {
        // Admin routes that don't exist - redirect to login
        res.redirect('/login');
    } else {
        // Frontend 404 - serve the frontend's index.html for SPA routing
        // or show a simple 404
        const frontendIndex = path.join(__dirname, '../public/site/index.html');
        if (fs.existsSync(frontendIndex)) {
            res.status(404).sendFile(frontendIndex);
        } else {
            res.status(404).send('Page not found');
        }
    }
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`ONIX Admin running on http://localhost:${PORT}`);
    console.log(`Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`Login: http://localhost:${PORT}/login`);
});

// Graceful shutdown for Docker/Coolify
function gracefulShutdown(signal) {
    console.log(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
        console.log('HTTP server closed.');
        try { db.close(); } catch (e) { /* already closed */ }
        process.exit(0);
    });
    setTimeout(() => {
        console.error('Forceful shutdown after timeout.');
        process.exit(1);
    }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;
