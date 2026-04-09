/**
 * ONIX Admin - Authentication Middleware
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';

// Verify JWT token for API routes
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // Also check cookies
    const cookieToken = req.cookies?.auth_token;

    const finalToken = token || cookieToken;

    if (!finalToken) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(finalToken, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
}

// Verify token for view routes (redirect to login if invalid)
function authenticateView(req, res, next) {
    const token = req.cookies?.auth_token;

    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.clearCookie('auth_token');
        return res.redirect('/login');
    }
}

// Generate JWT token
function generateToken(user) {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: process.env.SESSION_EXPIRY || '24h' }
    );
}

module.exports = {
    authenticateToken,
    authenticateView,
    generateToken
};
