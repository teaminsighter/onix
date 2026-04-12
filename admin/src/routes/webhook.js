/**
 * ONIX Admin - Webhook Routes
 * Receives form submissions from the main website
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { leads, activities, meetings, integrations } = require('../database');

// Dedicated rate limiter for public lead endpoint
const leadRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 submissions per minute per IP
    message: { error: 'Too many submissions. Please try again later.' }
});

// Webhook secret for validation
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

if (!WEBHOOK_SECRET && process.env.NODE_ENV === 'production') {
    console.error('FATAL: WEBHOOK_SECRET environment variable is required in production.');
    process.exit(1);
}

// Validate webhook request
function validateWebhook(req, res, next) {
    const secret = req.headers['x-webhook-secret'] || req.query.secret;

    // In development, allow without secret if WEBHOOK_SECRET is not set
    if (!WEBHOOK_SECRET && process.env.NODE_ENV !== 'production') {
        return next();
    }

    if (secret !== WEBHOOK_SECRET) {
        return res.status(401).json({ error: 'Invalid webhook secret' });
    }

    next();
}

// Receive new lead from contact form (public endpoint — protected by rate limiting + CORS)
router.post('/lead', leadRateLimiter, (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            message,
            source = 'website',
            page_url = ''
        } = req.body;

        // Validate required fields
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        // Create lead
        const result = leads.create.run({
            name,
            email,
            phone: phone || null,
            message: message || null,
            source,
            page_url
        });

        const leadId = result.lastInsertRowid;

        // Log activity
        activities.create.run(
            leadId,
            'lead_created',
            `New lead from ${source}`,
            'webhook'
        );

        console.log(`📥 New lead received: ${name} (${email})`);

        // Send notification email if configured
        sendNotification({
            type: 'new_lead',
            lead: { id: leadId, name, email, phone, message, source }
        });

        res.json({
            success: true,
            leadId,
            message: 'Lead received successfully'
        });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Failed to process lead' });
    }
});

// Receive Formspree webhook
router.post('/formspree', validateWebhook, (req, res) => {
    try {
        // Formspree sends data in a specific format
        const {
            name,
            email,
            phone,
            message,
            _replyto,
            _subject
        } = req.body;

        const leadEmail = email || _replyto;

        if (!name || !leadEmail) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        // Create lead
        const result = leads.create.run({
            name,
            email: leadEmail,
            phone: phone || null,
            message: message || null,
            source: 'formspree',
            page_url: req.headers.referer || ''
        });

        const leadId = result.lastInsertRowid;

        // Log activity
        activities.create.run(
            leadId,
            'lead_created',
            'New lead from Formspree',
            'formspree'
        );

        console.log(`📥 Formspree lead: ${name} (${leadEmail})`);

        sendNotification({
            type: 'new_lead',
            lead: { id: leadId, name, email: leadEmail, phone, message, source: 'formspree' }
        });

        res.json({ success: true, leadId });
    } catch (error) {
        console.error('Formspree webhook error:', error);
        res.status(500).json({ error: 'Failed to process lead' });
    }
});

// Receive Calendly webhook
router.post('/calendly', validateWebhook, (req, res) => {
    try {
        const { event, payload } = req.body;

        if (event === 'invitee.created') {
            const invitee = payload.invitee;
            const eventType = payload.event_type;

            // Create or update lead
            const result = leads.create.run({
                name: invitee.name,
                email: invitee.email,
                phone: null,
                message: `Calendly booking: ${eventType.name}`,
                source: 'calendly',
                page_url: ''
            });

            const leadId = result.lastInsertRowid;

            // Update status to scheduled
            leads.updateStatus.run('scheduled', leadId);

            activities.create.run(
                leadId,
                'call_scheduled',
                `Scheduled: ${eventType.name}`,
                'calendly'
            );

            // Also create a meeting record
            const eventDetails = payload.event || {};
            meetings.create.run({
                lead_id: leadId,
                title: eventType.name || 'Calendly Meeting',
                description: `Booked by ${invitee.name} (${invitee.email})`,
                meeting_type: 'video',
                start_time: eventDetails.start_time || new Date().toISOString(),
                end_time: eventDetails.end_time || new Date(Date.now() + 1800000).toISOString(),
                location: eventDetails.location?.join_url || 'Calendly',
                status: 'scheduled',
                notes: '',
                calendly_event_id: eventDetails.uuid || null,
                created_by: null
            });

            console.log(`📅 Calendly booking: ${invitee.name}`);

            sendNotification({
                type: 'call_scheduled',
                lead: { id: leadId, name: invitee.name, email: invitee.email },
                event: eventType.name
            });
        }

        // Handle cancellation
        if (event === 'invitee.canceled') {
            const eventDetails = payload.event || {};
            if (eventDetails.uuid) {
                const existing = meetings.getByCalendlyId.get(eventDetails.uuid);
                if (existing) {
                    meetings.updateStatus.run('cancelled', existing.id);
                    console.log(`❌ Calendly cancellation: ${eventDetails.uuid}`);
                }
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Calendly webhook error:', error);
        res.status(500).json({ error: 'Failed to process Calendly event' });
    }
});

// Simple notification function (can be expanded for email/Slack)
function sendNotification(data) {
    // Log for now - can integrate with email/Slack later
    console.log('📬 Notification:', JSON.stringify(data, null, 2));

    // TODO: Add email notification using nodemailer
    // TODO: Add Slack notification using webhook
}

// ==================== PUBLIC API ====================

// Get header scripts for injection into main website (public, no auth required)
router.get('/header-scripts', (req, res) => {
    try {
        const headerScripts = integrations.getByName.get('header_scripts');
        if (!headerScripts) {
            return res.type('text/html').send('');
        }
        const config = JSON.parse(headerScripts.config || '{}');
        const scripts = config.scripts || '';

        // Return as HTML for direct injection
        res.type('text/html').send(scripts);
    } catch (error) {
        console.error('Error fetching header scripts:', error);
        res.type('text/html').send('');
    }
});

// Get header scripts as JSON (for AJAX fetching)
router.get('/header-scripts.json', (req, res) => {
    try {
        const headerScripts = integrations.getByName.get('header_scripts');
        if (!headerScripts) {
            return res.json({ scripts: '' });
        }
        const config = JSON.parse(headerScripts.config || '{}');
        res.json({ scripts: config.scripts || '' });
    } catch (error) {
        console.error('Error fetching header scripts:', error);
        res.json({ scripts: '' });
    }
});

module.exports = router;
