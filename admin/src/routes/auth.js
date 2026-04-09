/**
 * ONIX Admin - Authentication Routes
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { users, initializeDatabase } = require('../database');
const { generateToken } = require('../middleware/auth');

// Initialize database on first load
initializeDatabase();

// Create default admin user if not exists
function ensureAdminExists() {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';

    const existing = users.getByUsername.get(adminUsername);
    if (!existing) {
        const hash = bcrypt.hashSync(adminPassword, 10);
        users.create.run(adminUsername, hash, 'admin');
        console.log(`✅ Default admin user created: ${adminUsername}`);
    }
}
ensureAdminExists();

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        const user = users.getByUsername.get(username);

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        users.updateLastLogin.run(user.id);

        // Generate token
        const token = generateToken(user);

        // Set cookie
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    res.clearCookie('auth_token');
    res.json({ success: true });
});

// Check auth status
router.get('/me', (req, res) => {
    const token = req.cookies?.auth_token;

    if (!token) {
        return res.status(401).json({ authenticated: false });
    }

    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-change-me');
        res.json({
            authenticated: true,
            user: {
                id: decoded.id,
                username: decoded.username,
                role: decoded.role
            }
        });
    } catch (error) {
        res.status(401).json({ authenticated: false });
    }
});

module.exports = router;
