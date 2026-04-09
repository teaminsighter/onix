/**
 * ONIX Admin - Costs & Deals API Routes
 */
const express = require('express');
const router = express.Router();
const { costs, deals, userActivityLog } = require('../database');
const { validateRequired, validateEnum, validate } = require('../middleware/validate');

// ==================== COSTS ====================

// List all costs (optional filters: month, source)
router.get('/', (req, res) => {
    try {
        const { month, source } = req.query;
        let result;
        if (month) result = costs.getByMonth.all(month);
        else if (source) result = costs.getBySource.all(source);
        else result = costs.getAll.all();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch costs' });
    }
});

// Cost summary/aggregations
router.get('/summary', (req, res) => {
    try {
        const totalCosts = costs.sumTotal.get();
        const byMonth = costs.sumByMonth.all();
        const bySource = costs.sumBySource.all();
        const totalRevenue = deals.sumRevenue.get();
        const revenueByMonth = deals.sumRevenueByMonth.all();

        const total = totalCosts.total || 0;
        const revenue = totalRevenue.total || 0;
        const totalLeads = bySource.reduce((sum, s) => sum + (s.total_leads || 0), 0);

        res.json({
            totalSpend: total,
            totalRevenue: revenue,
            roi: total > 0 ? Math.round(((revenue - total) / total) * 100) : 0,
            cpl: totalLeads > 0 ? Math.round((total / totalLeads) * 100) / 100 : 0,
            byMonth,
            bySource,
            revenueByMonth
        });
    } catch (error) {
        console.error('Cost summary error:', error);
        res.status(500).json({ error: 'Failed to fetch cost summary' });
    }
});

// Get single cost
router.get('/:id', (req, res) => {
    try {
        const cost = costs.getById.get(req.params.id);
        if (!cost) return res.status(404).json({ error: 'Cost entry not found' });
        res.json(cost);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cost' });
    }
});

// Create cost entry
router.post('/', (req, res) => {
    try {
        const err = validateRequired(req.body, ['source', 'amount', 'month']);
        if (err) return res.status(400).json({ error: err });

        const result = costs.create.run({
            source: req.body.source,
            amount: parseFloat(req.body.amount),
            month: req.body.month,
            campaign_name: req.body.campaign_name || null,
            leads_count: parseInt(req.body.leads_count) || 0,
            notes: req.body.notes || null,
            created_by: req.user?.id || null
        });

        userActivityLog.create.run({
            user_id: req.user?.id || 0,
            action: 'added cost entry',
            entity_type: 'cost',
            entity_id: result.lastInsertRowid,
            entity_name: `${req.body.source} - $${req.body.amount}`,
            metadata: null,
            ip_address: req.ip
        });

        res.status(201).json({ id: result.lastInsertRowid, message: 'Cost entry created' });
    } catch (error) {
        console.error('Create cost error:', error);
        res.status(500).json({ error: 'Failed to create cost entry' });
    }
});

// Update cost entry
router.put('/:id', (req, res) => {
    try {
        const existing = costs.getById.get(req.params.id);
        if (!existing) return res.status(404).json({ error: 'Cost entry not found' });

        costs.update.run({
            id: parseInt(req.params.id),
            source: req.body.source || null,
            amount: req.body.amount != null ? parseFloat(req.body.amount) : null,
            month: req.body.month || null,
            campaign_name: req.body.campaign_name !== undefined ? req.body.campaign_name : null,
            leads_count: req.body.leads_count != null ? parseInt(req.body.leads_count) : null,
            notes: req.body.notes !== undefined ? req.body.notes : null
        });

        res.json({ message: 'Cost entry updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update cost entry' });
    }
});

// Delete cost entry
router.delete('/:id', (req, res) => {
    try {
        const existing = costs.getById.get(req.params.id);
        if (!existing) return res.status(404).json({ error: 'Cost entry not found' });
        costs.delete.run(req.params.id);

        userActivityLog.create.run({
            user_id: req.user?.id || 0,
            action: 'deleted cost entry',
            entity_type: 'cost',
            entity_id: parseInt(req.params.id),
            entity_name: `${existing.source} - $${existing.amount}`,
            metadata: null,
            ip_address: req.ip
        });

        res.json({ message: 'Cost entry deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete cost entry' });
    }
});

// ==================== DEALS ====================

// List all deals (optional filter: status)
router.get('/deals', (req, res) => {
    try {
        const { status } = req.query;
        const result = status ? deals.getByStatus.all(status) : deals.getAll.all();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch deals' });
    }
});

// Get single deal
router.get('/deals/:id', (req, res) => {
    try {
        const deal = deals.getById.get(req.params.id);
        if (!deal) return res.status(404).json({ error: 'Deal not found' });
        res.json(deal);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch deal' });
    }
});

// Create deal
router.post('/deals', (req, res) => {
    try {
        const err = validate([
            validateRequired(req.body, ['title', 'amount']),
            validateEnum(req.body.status, ['pending', 'won', 'lost'], 'status')
        ]);
        if (err) return res.status(400).json({ error: err });

        const result = deals.create.run({
            lead_id: req.body.lead_id || null,
            title: req.body.title,
            amount: parseFloat(req.body.amount),
            status: req.body.status || 'pending',
            source: req.body.source || null,
            notes: req.body.notes || null,
            created_by: req.user?.id || null
        });

        userActivityLog.create.run({
            user_id: req.user?.id || 0,
            action: 'created deal',
            entity_type: 'deal',
            entity_id: result.lastInsertRowid,
            entity_name: `${req.body.title} - $${req.body.amount}`,
            metadata: null,
            ip_address: req.ip
        });

        res.status(201).json({ id: result.lastInsertRowid, message: 'Deal created' });
    } catch (error) {
        console.error('Create deal error:', error);
        res.status(500).json({ error: 'Failed to create deal' });
    }
});

// Update deal
router.put('/deals/:id', (req, res) => {
    try {
        const existing = deals.getById.get(req.params.id);
        if (!existing) return res.status(404).json({ error: 'Deal not found' });

        deals.update.run({
            id: parseInt(req.params.id),
            title: req.body.title || null,
            amount: req.body.amount != null ? parseFloat(req.body.amount) : null,
            status: req.body.status || null,
            source: req.body.source !== undefined ? req.body.source : null,
            notes: req.body.notes !== undefined ? req.body.notes : null
        });

        res.json({ message: 'Deal updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update deal' });
    }
});

// Quick status update for deal
router.patch('/deals/:id/status', (req, res) => {
    try {
        const { status } = req.body;
        const err = validateEnum(status, ['pending', 'won', 'lost'], 'status');
        if (err) return res.status(400).json({ error: err });

        deals.updateStatus.run(status, status, req.params.id);

        userActivityLog.create.run({
            user_id: req.user?.id || 0,
            action: `marked deal ${status}`,
            entity_type: 'deal',
            entity_id: parseInt(req.params.id),
            entity_name: null,
            metadata: null,
            ip_address: req.ip
        });

        res.json({ message: 'Deal status updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update deal status' });
    }
});

// Delete deal
router.delete('/deals/:id', (req, res) => {
    try {
        const existing = deals.getById.get(req.params.id);
        if (!existing) return res.status(404).json({ error: 'Deal not found' });
        deals.delete.run(req.params.id);

        userActivityLog.create.run({
            user_id: req.user?.id || 0,
            action: 'deleted deal',
            entity_type: 'deal',
            entity_id: parseInt(req.params.id),
            entity_name: existing.title,
            metadata: null,
            ip_address: req.ip
        });

        res.json({ message: 'Deal deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete deal' });
    }
});

module.exports = router;
