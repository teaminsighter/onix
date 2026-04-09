/**
 * ONIX Admin - Leads API Routes
 */

const express = require('express');
const router = express.Router();
const { leads, activities } = require('../database');

// Get all leads with optional filters
router.get('/', (req, res) => {
    try {
        const { status, search, limit } = req.query;

        let result;

        if (search) {
            const searchTerm = `%${search}%`;
            result = leads.search.all(searchTerm, searchTerm, searchTerm, searchTerm);
        } else if (status) {
            result = leads.getByStatus.all(status);
        } else if (limit) {
            result = leads.getRecent.all(parseInt(limit));
        } else {
            result = leads.getAll.all();
        }

        res.json({ leads: result, total: result.length });
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
});

// Get lead statistics
router.get('/stats', (req, res) => {
    try {
        const statusCounts = leads.countByStatus.all();
        const total = leads.countTotal.get();
        const today = leads.countToday.get();
        const thisWeek = leads.countThisWeek.get();
        const thisMonth = leads.countThisMonth.get();

        // Convert status counts to object
        const byStatus = {};
        statusCounts.forEach(s => {
            byStatus[s.status] = s.count;
        });

        res.json({
            total: total.total,
            today: today.count,
            thisWeek: thisWeek.count,
            thisMonth: thisMonth.count,
            byStatus
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Get single lead
router.get('/:id', (req, res) => {
    try {
        const lead = leads.getById.get(req.params.id);

        if (!lead) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        // Get activities
        const leadActivities = activities.getByLead.all(req.params.id);

        res.json({ lead, activities: leadActivities });
    } catch (error) {
        console.error('Error fetching lead:', error);
        res.status(500).json({ error: 'Failed to fetch lead' });
    }
});

// Update lead
router.put('/:id', (req, res) => {
    try {
        const { name, email, phone, status, priority, notes, assigned_to } = req.body;
        const validStatuses = ['new', 'contacted', 'scheduled', 'converted', 'lost'];
        const validPriorities = ['low', 'normal', 'high'];

        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        if (priority && !validPriorities.includes(priority)) {
            return res.status(400).json({ error: 'Invalid priority' });
        }

        const result = leads.update.run({
            id: req.params.id,
            name: name || null,
            email: email || null,
            phone: phone || null,
            status: status || null,
            priority: priority || null,
            notes: notes || null,
            assigned_to: assigned_to || null
        });

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        // Log activity
        if (status) {
            activities.create.run(
                req.params.id,
                'status_change',
                `Status changed to ${status}`,
                req.user?.username || 'system'
            );
        }

        const updated = leads.getById.get(req.params.id);
        res.json({ success: true, lead: updated });
    } catch (error) {
        console.error('Error updating lead:', error);
        res.status(500).json({ error: 'Failed to update lead' });
    }
});

// Update lead status (quick action)
router.patch('/:id/status', (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['new', 'contacted', 'scheduled', 'converted', 'lost'];

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be: ' + validStatuses.join(', ') });
        }

        const result = leads.updateStatus.run(status, req.params.id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        // Log activity
        activities.create.run(
            req.params.id,
            'status_change',
            `Status changed to ${status}`,
            req.user?.username || 'system'
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// Add note to lead
router.post('/:id/notes', (req, res) => {
    try {
        const { note } = req.body;

        if (!note) {
            return res.status(400).json({ error: 'Note is required' });
        }

        // Get current lead
        const lead = leads.getById.get(req.params.id);
        if (!lead) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        // Append note
        const currentNotes = lead.notes || '';
        const timestamp = new Date().toISOString().split('T')[0];
        const newNotes = currentNotes
            ? `${currentNotes}\n\n[${timestamp}] ${note}`
            : `[${timestamp}] ${note}`;

        leads.update.run({
            id: req.params.id,
            notes: newNotes
        });

        // Log activity
        activities.create.run(
            req.params.id,
            'note_added',
            note.substring(0, 100),
            req.user?.username || 'system'
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error adding note:', error);
        res.status(500).json({ error: 'Failed to add note' });
    }
});

// Delete lead
router.delete('/:id', (req, res) => {
    try {
        const result = leads.delete.run(req.params.id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting lead:', error);
        res.status(500).json({ error: 'Failed to delete lead' });
    }
});

module.exports = router;
