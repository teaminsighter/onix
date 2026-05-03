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

// Receive GoHighLevel booking webhook
//
// Configure in GHL: Automation → Workflows → trigger on "Appointment Booked"
// (and another for "Appointment Cancelled"). Action: Webhook → POST to this
// endpoint with header `x-webhook-secret: <WEBHOOK_SECRET>`. Map the standard
// contact + appointment fields in the workflow's webhook payload.
//
// This handler is permissive about payload shape — accepts both nested
// (`contact: {...}, appointment: {...}`) and flat (e.g. `first_name`,
// `appointment_start_time`) field names that different GHL workflow configs
// emit.
router.post('/ghl-booking', validateWebhook, (req, res) => {
    try {
        const body = req.body || {};

        // Pull contact data from either nested or flat payload
        const contact = body.contact || body;
        const firstName = contact.firstName || contact.first_name || body.first_name || '';
        const lastName = contact.lastName || contact.last_name || body.last_name || '';
        const fullName = (contact.name || `${firstName} ${lastName}`.trim() || contact.full_name || '').trim();
        const email = contact.email || body.email || '';
        const phone = contact.phone || body.phone || null;

        // Pull appointment data
        const appt = body.appointment || body;
        const apptId = appt.id || body.appointment_id || appt.appointmentId || null;
        const startTime = appt.startTime || appt.start_time || body.appointment_start_time || null;
        const endTime = appt.endTime || appt.end_time || body.appointment_end_time || null;
        const location = appt.address || appt.location || body.location || body.appointment_address || 'GHL Booking';
        const calendarName = body.calendar?.name || body.calendar_name || appt.calendarName || 'GHL Calendar';
        const apptTitle = appt.title || body.appointment_title || calendarName;

        // Event type — GHL workflows can send this in different fields
        const eventType = (body.type || body.event_type || body.event || '').toString().toLowerCase();
        const isCancellation = /cancel/.test(eventType) || appt.status === 'cancelled' || body.appointment_status === 'cancelled';

        // Cancellations: flip the existing meeting to cancelled
        if (isCancellation) {
            if (apptId) {
                const existing = meetings.getByGhlId.get(apptId);
                if (existing) {
                    meetings.updateStatus.run('cancelled', existing.id);
                    console.log(`❌ GHL cancellation: ${apptId}`);
                }
            }
            return res.json({ success: true });
        }

        // Bookings: require email + start_time at minimum
        if (!email || !startTime) {
            return res.status(400).json({ error: 'email and appointment start time are required' });
        }

        // Idempotency: don't double-create if GHL retries the webhook
        if (apptId) {
            const existing = meetings.getByGhlId.get(apptId);
            if (existing) {
                console.log(`↩️  GHL booking already recorded: ${apptId}`);
                return res.json({ success: true, leadId: existing.lead_id, meetingId: existing.id, duplicate: true });
            }
        }

        const leadName = fullName || email;
        const result = leads.create.run({
            name: leadName,
            email,
            phone,
            message: `GHL booking: ${apptTitle}`,
            source: 'ghl',
            page_url: ''
        });
        const leadId = result.lastInsertRowid;

        leads.updateStatus.run('scheduled', leadId);

        activities.create.run(
            leadId,
            'call_scheduled',
            `Scheduled: ${apptTitle}`,
            'ghl'
        );

        const meetingResult = meetings.create.run({
            lead_id: leadId,
            title: apptTitle,
            description: `Booked by ${leadName} (${email})`,
            meeting_type: 'video',
            start_time: startTime,
            end_time: endTime || new Date(new Date(startTime).getTime() + 30 * 60 * 1000).toISOString(),
            location,
            status: 'scheduled',
            notes: '',
            calendly_event_id: null,
            ghl_appointment_id: apptId,
            created_by: null
        });

        console.log(`📅 GHL booking: ${leadName} (${email}) — ${apptTitle}`);

        sendNotification({
            type: 'call_scheduled',
            lead: { id: leadId, name: leadName, email, phone },
            event: apptTitle
        });

        res.json({ success: true, leadId, meetingId: meetingResult.lastInsertRowid });
    } catch (error) {
        console.error('GHL webhook error:', error);
        res.status(500).json({ error: 'Failed to process GHL booking' });
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
