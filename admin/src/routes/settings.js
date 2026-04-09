/**
 * ONIX Admin - Settings API Routes
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { companyProfile, integrations, notificationPrefs, leads, meetings, costs, deals, db, userActivityLog, settings: settingsDb } = require('../database');

// File upload config
const uploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
    destination: uploadsDir,
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        // Use fixed names so they overwrite on re-upload
        if (req.params.type === 'favicon') cb(null, 'favicon' + ext);
        else if (req.params.type === 'og-image') cb(null, 'og-image' + ext);
        else if (req.params.type === 'logo') cb(null, 'logo' + ext);
        else cb(null, file.fieldname + '-' + Date.now() + ext);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: function (req, file, cb) {
        const allowed = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) cb(null, true);
        else cb(new Error('Only image files (PNG, JPG, WebP, SVG, ICO) are allowed'));
    }
});

// ==================== FILE UPLOADS ====================

router.post('/upload/:type', upload.single('file'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const type = req.params.type;
        const fileUrl = '/uploads/' + req.file.filename;

        // Save URL to settings table
        settingsDb.set.run(type + '_url', fileUrl);

        // Also copy to main website public/images/ for production use
        const mainSiteImages = path.join(__dirname, '../../../public/images');
        if (fs.existsSync(mainSiteImages)) {
            const destName = type === 'og-image' ? 'og-image' + path.extname(req.file.filename) : req.file.filename;
            try {
                fs.copyFileSync(req.file.path, path.join(mainSiteImages, destName));
            } catch (e) { /* non-critical if main site dir doesn't exist */ }
        }

        userActivityLog.create.run({
            user_id: req.user?.id || 0,
            action: 'uploaded ' + type,
            entity_type: 'settings',
            entity_id: null,
            entity_name: type,
            metadata: null,
            ip_address: req.ip
        });

        res.json({ message: type + ' uploaded successfully', url: fileUrl, filename: req.file.filename });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

// Get current branding assets
router.get('/branding', (req, res) => {
    try {
        const favicon = settingsDb.get.get('favicon_url');
        const ogImage = settingsDb.get.get('og-image_url');
        const logo = settingsDb.get.get('logo_url');
        res.json({
            favicon: favicon?.value || null,
            ogImage: ogImage?.value || null,
            logo: logo?.value || null
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch branding' });
    }
});

// ==================== COMPANY PROFILE ====================

router.get('/company', (req, res) => {
    try {
        const profile = companyProfile.get.get() || { name: 'ONIX', email: '', phone: '', address: '', timezone: 'Australia/Sydney' };
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch company profile' });
    }
});

router.put('/company', (req, res) => {
    try {
        companyProfile.upsert.run({
            name: req.body.name || 'ONIX',
            email: req.body.email || '',
            phone: req.body.phone || '',
            address: req.body.address || '',
            timezone: req.body.timezone || 'Australia/Sydney'
        });

        userActivityLog.create.run({
            user_id: req.user?.id || 0,
            action: 'updated company profile',
            entity_type: 'settings',
            entity_id: null,
            entity_name: 'Company Profile',
            metadata: null,
            ip_address: req.ip
        });

        res.json({ message: 'Company profile saved' });
    } catch (error) {
        console.error('Save company profile error:', error);
        res.status(500).json({ error: 'Failed to save company profile' });
    }
});

// ==================== INTEGRATIONS ====================

router.get('/integrations', (req, res) => {
    try {
        const all = integrations.getAll.all();
        // Parse config JSON for each
        res.json(all.map(i => ({ ...i, config: JSON.parse(i.config || '{}') })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch integrations' });
    }
});

router.put('/integrations/:name', (req, res) => {
    try {
        const { enabled } = req.body;
        integrations.updateEnabled.run(enabled ? 1 : 0, req.params.name);
        res.json({ message: 'Integration updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update integration' });
    }
});

router.put('/integrations/:name/config', (req, res) => {
    try {
        const existing = integrations.getByName.get(req.params.name);
        if (!existing) return res.status(404).json({ error: 'Integration not found' });

        const currentConfig = JSON.parse(existing.config || '{}');
        const newConfig = { ...currentConfig, ...req.body };
        integrations.updateConfig.run(JSON.stringify(newConfig), req.params.name);

        userActivityLog.create.run({
            user_id: req.user?.id || 0,
            action: `configured ${req.params.name} integration`,
            entity_type: 'integration',
            entity_id: null,
            entity_name: req.params.name,
            metadata: null,
            ip_address: req.ip
        });

        res.json({ message: 'Integration config saved' });
    } catch (error) {
        console.error('Save integration config error:', error);
        res.status(500).json({ error: 'Failed to save integration config' });
    }
});

// Calendly sync - fetch past events and insert as meetings
router.post('/integrations/calendly/sync', async (req, res) => {
    try {
        const calendly = integrations.getByName.get('calendly');
        if (!calendly) return res.status(404).json({ error: 'Calendly integration not found' });

        const config = JSON.parse(calendly.config || '{}');
        if (!config.api_key) return res.status(400).json({ error: 'Calendly API key not configured' });

        // Get current user URI first
        const userResp = await fetch('https://api.calendly.com/users/me', {
            headers: { 'Authorization': `Bearer ${config.api_key}`, 'Content-Type': 'application/json' }
        });
        if (!userResp.ok) return res.status(400).json({ error: 'Invalid Calendly API key' });
        const userData = await userResp.json();
        const userUri = userData.resource.uri;

        // Fetch scheduled events
        const eventsResp = await fetch(`https://api.calendly.com/scheduled_events?user=${encodeURIComponent(userUri)}&count=100&status=active&sort=start_time:desc`, {
            headers: { 'Authorization': `Bearer ${config.api_key}` }
        });
        if (!eventsResp.ok) return res.status(500).json({ error: 'Failed to fetch Calendly events' });
        const eventsData = await eventsResp.json();

        let synced = 0;
        const { meetings: meetingsDb } = require('../database');

        for (const event of eventsData.collection) {
            const eventId = event.uri.split('/').pop();
            const existing = meetingsDb.getByCalendlyId.get(eventId);
            if (existing) continue;

            // Fetch invitees for this event
            const invResp = await fetch(`${event.uri}/invitees`, {
                headers: { 'Authorization': `Bearer ${config.api_key}` }
            });
            const invData = invResp.ok ? await invResp.json() : { collection: [] };
            const invitee = invData.collection[0];

            meetingsDb.create.run({
                lead_id: null,
                title: event.name || 'Calendly Meeting',
                description: invitee ? `Booked by ${invitee.name} (${invitee.email})` : 'Calendly booking',
                meeting_type: 'video',
                start_time: event.start_time,
                end_time: event.end_time,
                location: event.location?.join_url || 'Calendly',
                status: 'scheduled',
                notes: '',
                calendly_event_id: eventId,
                created_by: null
            });
            synced++;
        }

        res.json({ message: `Synced ${synced} meetings from Calendly`, synced });
    } catch (error) {
        console.error('Calendly sync error:', error);
        res.status(500).json({ error: 'Failed to sync Calendly events' });
    }
});

// ==================== NOTIFICATIONS ====================

router.get('/notifications', (req, res) => {
    try {
        const prefs = notificationPrefs.get.get() || {};
        res.json(prefs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notification preferences' });
    }
});

router.put('/notifications', (req, res) => {
    try {
        notificationPrefs.upsert.run({
            new_lead_email: req.body.new_lead_email ? 1 : 0,
            new_lead_slack: req.body.new_lead_slack ? 1 : 0,
            meeting_reminder: req.body.meeting_reminder ? 1 : 0,
            meeting_reminder_minutes: parseInt(req.body.meeting_reminder_minutes) || 30,
            weekly_summary: req.body.weekly_summary ? 1 : 0,
            daily_digest: req.body.daily_digest ? 1 : 0
        });

        userActivityLog.create.run({
            user_id: req.user?.id || 0,
            action: 'updated notification preferences',
            entity_type: 'settings',
            entity_id: null,
            entity_name: 'Notifications',
            metadata: null,
            ip_address: req.ip
        });

        res.json({ message: 'Notification preferences saved' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save notification preferences' });
    }
});

// ==================== DATA EXPORT ====================

function toCSV(rows, columns) {
    if (!rows || rows.length === 0) return columns.join(',') + '\n';
    const header = columns.join(',');
    const body = rows.map(row => columns.map(col => {
        const val = row[col] != null ? String(row[col]).replace(/"/g, '""') : '';
        return `"${val}"`;
    }).join(',')).join('\n');
    return header + '\n' + body;
}

router.get('/export/leads', (req, res) => {
    try {
        const allLeads = leads.getAll.all();
        const csv = toCSV(allLeads, ['id', 'name', 'email', 'phone', 'message', 'source', 'status', 'priority', 'notes', 'created_at', 'updated_at']);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=onix-leads-${new Date().toISOString().slice(0,10)}.csv`);
        res.send(csv);
    } catch (error) {
        res.status(500).json({ error: 'Failed to export leads' });
    }
});

router.get('/export/meetings', (req, res) => {
    try {
        const allMeetings = meetings.getAll.all();
        const csv = toCSV(allMeetings, ['id', 'title', 'lead_name', 'meeting_type', 'start_time', 'end_time', 'location', 'status', 'outcome', 'notes', 'created_at']);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=onix-meetings-${new Date().toISOString().slice(0,10)}.csv`);
        res.send(csv);
    } catch (error) {
        res.status(500).json({ error: 'Failed to export meetings' });
    }
});

router.get('/export/costs', (req, res) => {
    try {
        const allCosts = costs.getAll.all();
        const allDeals = deals.getAll.all();
        const costsCsv = toCSV(allCosts, ['id', 'source', 'amount', 'month', 'campaign_name', 'leads_count', 'notes', 'created_at']);
        const dealsCsv = toCSV(allDeals, ['id', 'title', 'lead_name', 'amount', 'status', 'source', 'notes', 'closed_at', 'created_at']);
        const csv = '=== COSTS ===\n' + costsCsv + '\n\n=== DEALS ===\n' + dealsCsv;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=onix-financials-${new Date().toISOString().slice(0,10)}.csv`);
        res.send(csv);
    } catch (error) {
        res.status(500).json({ error: 'Failed to export financials' });
    }
});

// ==================== DANGER ZONE ====================

router.delete('/data/leads', (req, res) => {
    try {
        const confirm = req.headers['x-confirm'];
        if (confirm !== 'DELETE_ALL_LEADS') return res.status(400).json({ error: 'Confirmation header required' });

        db.exec('DELETE FROM lead_activities');
        db.exec('DELETE FROM leads');

        userActivityLog.create.run({
            user_id: req.user?.id || 0,
            action: 'cleared all leads',
            entity_type: 'system',
            entity_id: null,
            entity_name: 'Danger Zone',
            metadata: null,
            ip_address: req.ip
        });

        res.json({ message: 'All leads cleared' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear leads' });
    }
});

router.delete('/data/all', (req, res) => {
    try {
        const confirm = req.headers['x-confirm'];
        if (confirm !== 'RESET_ALL_DATA') return res.status(400).json({ error: 'Confirmation header required' });

        db.exec('DELETE FROM lead_activities');
        db.exec('DELETE FROM leads');
        db.exec('DELETE FROM meetings');
        db.exec('DELETE FROM costs');
        db.exec('DELETE FROM deals');
        db.exec('DELETE FROM user_activity_log');

        userActivityLog.create.run({
            user_id: req.user?.id || 0,
            action: 'reset all data',
            entity_type: 'system',
            entity_id: null,
            entity_name: 'Danger Zone',
            metadata: null,
            ip_address: req.ip
        });

        res.json({ message: 'All data reset' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reset data' });
    }
});

// ==================== ANALYTICS API ====================

router.get('/analytics/trends', (req, res) => {
    try {
        const { analytics } = require('../database');
        const period = req.query.period || 'monthly';
        let data;
        if (period === 'daily') data = analytics.leadsOverTimeDaily.all();
        else if (period === 'weekly') data = analytics.leadsOverTimeWeekly.all();
        else data = analytics.leadsOverTimeMonthly.all();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

module.exports = router;
