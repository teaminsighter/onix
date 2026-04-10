/**
 * ONIX Admin - Authentication Middleware
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Require JWT_SECRET in production — sessions won't survive restart without it
if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
        console.error('FATAL: JWT_SECRET environment variable is required in production.');
        console.error('Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
        process.exit(1);
    }
    process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
    console.log('⚠️  No JWT_SECRET in .env — generated random secret (dev only, sessions won\'t survive restart)');
}
const JWT_SECRET = process.env.JWT_SECRET;

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
