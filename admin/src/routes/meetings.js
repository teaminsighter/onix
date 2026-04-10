/**
 * ONIX Admin - Meetings API Routes
 */
const express = require('express');
const router = express.Router();
const { meetings, userActivityLog } = require('../database');
const { validateRequired, validateEnum, validate } = require('../middleware/validate');

// List meetings (optional filters: status, from, to)
router.get('/', (req, res) => {
    try {
        const { status, from, to } = req.query;
        let result;
        if (from && to) {
            result = meetings.getByDateRange.all(from, to);
        } else if (status) {
            result = meetings.getByStatus.all(status);
        } else {
            result = meetings.getAll.all();
        }
        res.json(result);
    } catch (error) {
        console.error('Meetings list error:', error);
        res.status(500).json({ error: 'Failed to fetch meetings' });
    }
});

// Upcoming meetings
router.get('/upcoming', (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 10, 100);
        res.json(meetings.getUpcoming.all(limit));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch upcoming meetings' });
    }
});

// Get single meeting
router.get('/:id', (req, res) => {
    try {
        const meeting = meetings.getById.get(req.params.id);
        if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
        res.json(meeting);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch meeting' });
    }
});

// Create meeting
router.post('/', (req, res) => {
    try {
        const err = validate([
            validateRequired(req.body, ['title', 'start_time', 'end_time']),
            validateEnum(req.body.meeting_type, ['call', 'video', 'in_person'], 'meeting_type'),
            validateEnum(req.body.status, ['scheduled', 'completed', 'cancelled'], 'status')
        ]);
        if (err) return res.status(400).json({ error: err });

        const result = meetings.create.run({
            lead_id: req.body.lead_id || null,
            title: req.body.title,
            description: req.body.description || null,
            meeting_type: req.body.meeting_type || 'call',
            start_time: req.body.start_time,
            end_time: req.body.end_time,
            location: req.body.location || null,
            status: req.body.status || 'scheduled',
            notes: req.body.notes || null,
            calendly_event_id: req.body.calendly_event_id || null,
            created_by: req.user?.id || null
        });

        userActivityLog.create.run({
            user_id: req.user?.id || 0,
            action: 'created meeting',
            entity_type: 'meeting',
            entity_id: result.lastInsertRowid,
            entity_name: req.body.title,
            metadata: null,
            ip_address: req.ip
        });

        res.status(201).json({ id: result.lastInsertRowid, message: 'Meeting created' });
    } catch (error) {
        console.error('Create meeting error:', error);
        res.status(500).json({ error: 'Failed to create meeting' });
    }
});

// Update meeting
router.put('/:id', (req, res) => {
    try {
        const existing = meetings.getById.get(req.params.id);
        if (!existing) return res.status(404).json({ error: 'Meeting not found' });

        meetings.update.run({
            id: parseInt(req.params.id),
            title: req.body.title || null,
            description: req.body.description || null,
            meeting_type: req.body.meeting_type || null,
            start_time: req.body.start_time || null,
            end_time: req.body.end_time || null,
            location: req.body.location || null,
            notes: req.body.notes || null
        });

        userActivityLog.create.run({
            user_id: req.user?.id || 0,
            action: 'updated meeting',
            entity_type: 'meeting',
            entity_id: parseInt(req.params.id),
            entity_name: req.body.title || existing.title,
            metadata: null,
            ip_address: req.ip
        });

        res.json({ message: 'Meeting updated' });
    } catch (error) {
        console.error('Update meeting error:', error);
        res.status(500).json({ error: 'Failed to update meeting' });
    }
});

// Quick status update
router.patch('/:id/status', (req, res) => {
    try {
        const { status } = req.body;
        const err = validateEnum(status, ['scheduled', 'completed', 'cancelled'], 'status');
        if (err) return res.status(400).json({ error: err });

        meetings.updateStatus.run(status, req.params.id);
        res.json({ message: 'Meeting status updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// Save outcome
router.patch('/:id/outcome', (req, res) => {
    try {
        const { outcome, notes } = req.body;
        meetings.updateOutcome.run(outcome || '', notes || '', req.params.id);
        res.json({ message: 'Meeting outcome saved' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save outcome' });
    }
});

// Delete meeting
router.delete('/:id', (req, res) => {
    try {
        const existing = meetings.getById.get(req.params.id);
        if (!existing) return res.status(404).json({ error: 'Meeting not found' });

        meetings.delete.run(req.params.id);

        userActivityLog.create.run({
            user_id: req.user?.id || 0,
            action: 'deleted meeting',
            entity_type: 'meeting',
            entity_id: parseInt(req.params.id),
            entity_name: existing.title,
            metadata: null,
            ip_address: req.ip
        });

        res.json({ message: 'Meeting deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete meeting' });
    }
});

module.exports = router;
