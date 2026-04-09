/**
 * ONIX Admin - Input Validation Middleware
 */

function validateRequired(body, fields) {
    const missing = fields.filter(f => !body[f] && body[f] !== 0);
    if (missing.length > 0) {
        return `Missing required fields: ${missing.join(', ')}`;
    }
    return null;
}

function validateEmail(email) {
    if (!email) return null;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email) ? null : 'Invalid email format';
}

function validateEnum(value, allowed, fieldName) {
    if (!value) return null;
    return allowed.includes(value) ? null : `${fieldName} must be one of: ${allowed.join(', ')}`;
}

function validateLength(value, max, fieldName) {
    if (!value) return null;
    return value.length <= max ? null : `${fieldName} must be ${max} characters or less`;
}

function validate(checks) {
    for (const check of checks) {
        if (check) return check;
    }
    return null;
}

module.exports = { validateRequired, validateEmail, validateEnum, validateLength, validate };
