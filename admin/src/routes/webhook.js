/**
 * ONIX Admin - Webhook Routes
 * Receives form submissions from the main website
 */

const express = require('express');
const router = express.Router();
const { leads, activities } = require('../database');

// Webhook secret for validation (optional but recommended)
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'onix-webhook-secret';

// Validate webhook request
function validateWebhook(req, res, next) {
    const secret = req.headers['x-webhook-secret'] || req.query.secret;

    // In development, allow without secret
    if (process.env.NODE_ENV === 'development') {
        return next();
    }

    if (secret !== WEBHOOK_SECRET) {
        return res.status(401).json({ error: 'Invalid webhook secret' });
    }

    next();
}

// Receive new lead from contact form
router.post('/lead', validateWebhook, (req, res) => {
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
router.post('/formspree', (req, res) => {
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
router.post('/calendly', (req, res) => {
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

            console.log(`📅 Calendly booking: ${invitee.name}`);

            sendNotification({
                type: 'call_scheduled',
                lead: { id: leadId, name: invitee.name, email: invitee.email },
                event: eventType.name
            });
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

module.exports = router;
