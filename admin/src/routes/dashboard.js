/**
 * ONIX Admin - Dashboard View Routes
 * All views use real database queries — no mock data.
 */

const express = require('express');
const router = express.Router();
const { authenticateView } = require('../middleware/auth');
const {
    leads, meetings, costs, deals, activities,
    userActivityLog, analytics, dateFiltered,
    companyProfile, integrations, notificationPrefs,
    settings: settingsDb
} = require('../database');

// Helper: relative time string
function timeAgo(dateStr) {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = now - then;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' });
}

// Helper: format activity feed from user_activity_log rows
function formatActivityFeed(rows) {
    return rows.map(row => ({
        id: row.id,
        user: 'Admin',
        user_avatar: 'A',
        action: row.action,
        entity: row.entity_name || '',
        entity_type: row.entity_type || '',
        time: timeAgo(row.created_at),
        icon: row.action.includes('created') ? 'plus' : row.action.includes('deleted') ? 'trash' : 'edit'
    }));
}

// Helper: month label from YYYY-MM
function monthLabel(ym) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const parts = ym.split('-');
    return months[parseInt(parts[1]) - 1] || ym;
}

// ==================== LOGIN ====================

router.get('/login', (req, res) => {
    const token = req.cookies?.auth_token;
    if (token) {
        try {
            const jwt = require('jsonwebtoken');
            jwt.verify(token, process.env.JWT_SECRET);
            return res.redirect('/dashboard');
        } catch (e) { /* show login */ }
    }
    res.render('login', { title: 'Login - ONIX Admin', error: req.query.error, layout: false });
});

// Helper: get date range label
function getDateRangeLabel(preset, fromDate, toDate) {
    const presetLabels = {
        'today': 'Today',
        'yesterday': 'Yesterday',
        'this_week': 'This week',
        'last_7_days': 'Last 7 days',
        'last_week': 'Last week',
        'last_14_days': 'Last 14 days',
        'this_month': 'This month',
        'last_30_days': 'Last 30 days',
        'last_month': 'Last month',
        'all_time': 'All time'
    };
    if (presetLabels[preset]) return presetLabels[preset];
    if (fromDate && toDate) {
        const from = new Date(fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const to = new Date(toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return `${from} - ${to}`;
    }
    return 'All time';
}

// ==================== DASHBOARD ====================

router.get('/dashboard', authenticateView, (req, res) => {
    try {
        // Parse date filter from query params
        const { from, to, preset } = req.query;
        const hasDateFilter = from && to;

        // Date range info for the view
        const dateRange = {
            from: from || null,
            to: to || null,
            preset: preset || 'all_time',
            label: getDateRangeLabel(preset, from, to)
        };

        let totalLeads, byStatus, leadsOverTime, sourceData, recentLeads;
        let totalRevenue, totalCost;

        if (hasDateFilter) {
            // Use date-filtered queries
            const countResult = dateFiltered.countLeadsInRange(from, to);
            totalLeads = countResult?.total || 0;

            const statusCounts = dateFiltered.countLeadsByStatusInRange(from, to);
            byStatus = {};
            statusCounts.forEach(s => { byStatus[s.status] = s.count; });

            leadsOverTime = dateFiltered.getLeadsOverTimeInRange(from, to);
            sourceData = dateFiltered.getSourcePerformanceInRange(from, to);

            // For recent leads in range, get the actual leads
            const leadsInRange = dateFiltered.getLeadsInRange(from, to);
            recentLeads = leadsInRange.slice(0, 10);

            // Revenue and costs in range
            const revenueResult = dateFiltered.getRevenueInRange(from, to);
            totalRevenue = revenueResult?.total || 0;
            const costResult = dateFiltered.getCostsInRange(from, to);
            totalCost = costResult?.total || 0;
        } else {
            // Use all-time queries (original behavior)
            const statusCounts = leads.countByStatus.all();
            const total = leads.countTotal.get();
            totalLeads = total.total || 0;

            byStatus = {};
            statusCounts.forEach(s => { byStatus[s.status] = s.count; });

            leadsOverTime = analytics.leadsOverTimeMonthly.all();
            sourceData = analytics.sourcePerformance.all();
            recentLeads = leads.getRecent.all(10);

            const revenue = deals.sumRevenue.get();
            totalRevenue = revenue.total || 0;
            const costTotal = costs.sumTotal.get();
            totalCost = costTotal.total || 0;
        }

        const converted = byStatus.converted || 0;
        const conversionRate = totalLeads > 0 ? Math.round((converted / totalLeads) * 1000) / 10 : 0;
        const cpl = totalLeads > 0 ? Math.round((totalCost / totalLeads) * 100) / 100 : 0;

        // Meetings (always show upcoming, not filtered)
        const meetingStatusCounts = meetings.countByStatus.all();
        const scheduledMeetings = meetingStatusCounts.find(m => m.status === 'scheduled');
        const meetingsThisWeek = meetings.countThisWeek.get();
        const upcomingMeetings = meetings.getUpcoming.all(5);

        // Activity feed (always show recent)
        const activityRows = userActivityLog.getRecent.all(10);
        const activityFeed = formatActivityFeed(activityRows);

        // Chart data: leads over time
        const leadsOverTimeChart = {
            labels: leadsOverTime.map(r => {
                // Format based on period type
                if (r.period.includes('-W')) {
                    return 'W' + r.period.split('-W')[1];
                } else if (r.period.length === 7) {
                    return monthLabel(r.period);
                }
                // Daily: show as "Jan 15"
                const d = new Date(r.period);
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }),
            data: leadsOverTime.map(r => r.count)
        };

        // Chart data: lead sources
        const leadSourcesChart = {
            labels: sourceData.map(r => r.source || 'unknown'),
            data: sourceData.map(r => r.leads),
            colors: ['#c9f31d', '#3b82f6', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6', '#06b6d4']
        };

        // Chart data: conversion funnel
        const contacted = (byStatus.contacted || 0) + (byStatus.scheduled || 0) + converted;
        const scheduled = (byStatus.scheduled || 0) + converted;
        const funnelChart = {
            labels: ['Total Leads', 'Contacted', 'Scheduled', 'Converted'],
            data: [totalLeads, contacted, scheduled, converted],
            percentages: [
                '100%',
                totalLeads > 0 ? Math.round((contacted / totalLeads) * 100) + '%' : '0%',
                totalLeads > 0 ? Math.round((scheduled / totalLeads) * 100) + '%' : '0%',
                totalLeads > 0 ? Math.round((converted / totalLeads) * 100) + '%' : '0%'
            ]
        };

        // Calculate change % (compare to previous period if filtered, else use month comparison)
        let leadsChangeStr = '+0%';
        if (!hasDateFilter && leadsOverTime.length >= 2) {
            const thisMonth = leads.countThisMonth.get();
            const thisMonthCount = thisMonth.count || 0;
            const lastMonthLeads = leadsOverTime.length >= 2 ? leadsOverTime[leadsOverTime.length - 2]?.count || 0 : 0;
            const leadsChange = lastMonthLeads > 0 ? Math.round(((thisMonthCount - lastMonthLeads) / lastMonthLeads) * 100) : 0;
            leadsChangeStr = leadsChange >= 0 ? `+${leadsChange}%` : `${leadsChange}%`;
        }

        res.render('dashboard', {
            title: 'Dashboard - ONIX Admin',
            user: req.user,
            dateRange,
            stats: {
                leads: { total: totalLeads, change: leadsChangeStr },
                today: leads.countToday.get().count,
                thisWeek: leads.countThisWeek.get().count,
                thisMonth: leads.countThisMonth.get().count,
                conversion: { rate: conversionRate, change: conversionRate > 0 ? `+${conversionRate}%` : '0%' },
                revenue: { total: totalRevenue, change: totalRevenue > 0 ? '+' + Math.round(totalRevenue / 100) + '%' : '0%' },
                meetings: { scheduled: scheduledMeetings?.count || 0, thisWeek: meetingsThisWeek.count || 0 },
                costs: { total: totalCost, cpl: cpl }
            },
            statusCounts: byStatus,
            recentLeads,
            upcomingMeetings,
            activityFeed,
            chartData: {
                leadsOverTime: leadsOverTimeChart,
                leadSources: leadSourcesChart,
                conversionFunnel: funnelChart
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.render('error', { layout: false, title: 'Error', message: 'Failed to load dashboard' });
    }
});

// ==================== LEADS ====================

router.get('/leads', authenticateView, (req, res) => {
    try {
        const { status, search } = req.query;
        let allLeads;
        if (search) {
            const t = `%${search}%`;
            allLeads = leads.search.all(t, t, t, t);
        } else if (status && status !== 'all') {
            allLeads = leads.getByStatus.all(status);
        } else {
            allLeads = leads.getAll.all();
        }
        res.render('leads', { title: 'Leads - ONIX Admin', user: req.user, leads: allLeads, filters: { status, search } });
    } catch (error) {
        console.error('Leads page error:', error);
        res.render('error', { layout: false, title: 'Error', message: 'Failed to load leads' });
    }
});

router.get('/leads/:id', authenticateView, (req, res) => {
    try {
        const lead = leads.getById.get(req.params.id);
        if (!lead) return res.render('error', { layout: false, title: 'Not Found', message: 'Lead not found' });
        const leadActivities = activities.getByLead.all(req.params.id);
        res.render('lead-detail', { title: `${lead.name} - ONIX Admin`, user: req.user, lead, activities: leadActivities });
    } catch (error) {
        console.error('Lead detail error:', error);
        res.render('error', { layout: false, title: 'Error', message: 'Failed to load lead' });
    }
});

// ==================== PIPELINE ====================

router.get('/pipeline', authenticateView, (req, res) => {
    try {
        // Parse date filter from query params
        const { from, to, preset } = req.query;
        const hasDateFilter = from && to;

        // Date range info for the view
        const dateRange = {
            from: from || null,
            to: to || null,
            preset: preset || 'all_time',
            label: getDateRangeLabel(preset, from, to)
        };

        const statuses = ['new', 'contacted', 'scheduled', 'converted', 'lost'];
        const pipelineLeads = {};

        if (hasDateFilter) {
            // Use date-filtered queries
            statuses.forEach(status => {
                pipelineLeads[status] = dateFiltered.getLeadsByStatusInRange(status, from, to);
            });
        } else {
            // Use all-time queries (original behavior)
            statuses.forEach(status => {
                pipelineLeads[status] = leads.getByStatus.all(status);
            });
        }

        res.render('pipeline', { title: 'Pipeline - ONIX Admin', user: req.user, leads: pipelineLeads, dateRange });
    } catch (error) {
        console.error('Pipeline error:', error);
        res.render('error', { layout: false, title: 'Error', message: 'Failed to load pipeline' });
    }
});

// ==================== CALENDAR & MEETINGS ====================

router.get('/calendar', authenticateView, (req, res) => {
    try {
        const allMeetings = meetings.getAll.all();
        res.render('calendar', { title: 'Calendar - ONIX Admin', user: req.user, meetings: allMeetings });
    } catch (error) {
        console.error('Calendar error:', error);
        res.render('error', { layout: false, title: 'Error', message: 'Failed to load calendar' });
    }
});

router.get('/meetings/:id', authenticateView, (req, res) => {
    try {
        const meeting = meetings.getById.get(req.params.id);
        if (!meeting) return res.render('error', { layout: false, title: 'Not Found', message: 'Meeting not found' });
        res.render('meeting-detail', { title: `${meeting.title} - ONIX Admin`, user: req.user, meeting });
    } catch (error) {
        console.error('Meeting detail error:', error);
        res.render('error', { layout: false, title: 'Error', message: 'Failed to load meeting' });
    }
});

// ==================== COSTS & ROI ====================

router.get('/costs', authenticateView, (req, res) => {
    try {
        const allCosts = costs.getAll.all();
        const allDeals = deals.getAll.all();

        // Summary stats
        const totalCost = costs.sumTotal.get();
        const totalRevenue = deals.sumRevenue.get();
        const totalLeads = leads.countTotal.get();
        const total = totalCost.total || 0;
        const rev = totalRevenue.total || 0;
        const tl = totalLeads.total || 0;

        const costBySource = costs.sumBySource.all();
        const costByMonth = costs.sumByMonth.all();
        const revenueByMonth = deals.sumRevenueByMonth.all();

        // Build chart data
        const allMonths = [...new Set([...costByMonth.map(c => c.month), ...revenueByMonth.map(r => r.month)])].sort();
        const costMap = Object.fromEntries(costByMonth.map(c => [c.month, c.total]));
        const revMap = Object.fromEntries(revenueByMonth.map(r => [r.month, r.total]));

        res.render('costs', {
            title: 'Costs & ROI - ONIX Admin',
            user: req.user,
            costs: allCosts,
            deals: allDeals,
            stats: {
                totalSpend: total,
                totalRevenue: rev,
                cpl: tl > 0 ? Math.round((total / tl) * 100) / 100 : 0,
                roi: total > 0 ? Math.round(((rev - total) / total) * 100) : 0,
                totalLeads: tl
            },
            chartData: {
                costBySource: {
                    labels: costBySource.map(c => c.source),
                    data: costBySource.map(c => c.total),
                    colors: ['#3b82f6', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6', '#06b6d4']
                },
                costVsRevenue: {
                    labels: allMonths.map(m => monthLabel(m)),
                    costs: allMonths.map(m => costMap[m] || 0),
                    revenue: allMonths.map(m => revMap[m] || 0)
                }
            }
        });
    } catch (error) {
        console.error('Costs error:', error);
        res.render('error', { layout: false, title: 'Error', message: 'Failed to load costs' });
    }
});

// ==================== ANALYTICS ====================

router.get('/analytics', authenticateView, (req, res) => {
    try {
        // Lead trends
        const monthlyTrends = analytics.leadsOverTimeMonthly.all();
        const leadsOverTime = {
            labels: monthlyTrends.map(r => monthLabel(r.period)),
            data: monthlyTrends.map(r => r.count)
        };

        // Source performance
        const sourcePerformance = analytics.sourcePerformance.all();
        const leadSources = {
            labels: sourcePerformance.map(r => r.source || 'unknown'),
            data: sourcePerformance.map(r => r.leads),
            colors: ['#c9f31d', '#3b82f6', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6']
        };

        // Conversion funnel
        const statusCounts = leads.countByStatus.all();
        const byStatus = {};
        statusCounts.forEach(s => { byStatus[s.status] = s.count; });
        const totalLeads = Object.values(byStatus).reduce((a, b) => a + b, 0);
        const converted = byStatus.converted || 0;
        const contacted = (byStatus.contacted || 0) + (byStatus.scheduled || 0) + converted;
        const scheduled = (byStatus.scheduled || 0) + converted;

        const conversionFunnel = {
            labels: ['Total Leads', 'Contacted', 'Scheduled', 'Converted'],
            data: [totalLeads, contacted, scheduled, converted],
            percentages: [
                '100%',
                totalLeads > 0 ? Math.round((contacted / totalLeads) * 100) + '%' : '0%',
                totalLeads > 0 ? Math.round((scheduled / totalLeads) * 100) + '%' : '0%',
                totalLeads > 0 ? Math.round((converted / totalLeads) * 100) + '%' : '0%'
            ]
        };

        // Quick stats
        const avgResponse = analytics.avgResponseTime.get();
        const avgDeal = analytics.avgDealSize.get();
        const meetingsTotal = meetings.countByStatus.all();
        const scheduledCount = meetingsTotal.find(m => m.status === 'scheduled')?.count || 0;
        const completedCount = meetingsTotal.find(m => m.status === 'completed')?.count || 0;

        res.render('analytics', {
            title: 'Analytics - ONIX Admin',
            user: req.user,
            chartData: { leadsOverTime, leadSources, conversionFunnel },
            sourcePerformance,
            quickStats: {
                avgResponseTime: avgResponse.avg_hours || 0,
                leadToMeetingRate: totalLeads > 0 ? Math.round((scheduled / totalLeads) * 100) : 0,
                meetingToCloseRate: (scheduledCount + completedCount) > 0 ? Math.round((converted / (scheduledCount + completedCount)) * 100) : 0,
                avgDealSize: avgDeal.avg_amount || 0
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.render('error', { layout: false, title: 'Error', message: 'Failed to load analytics' });
    }
});

// ==================== SETTINGS ====================

router.get('/settings', authenticateView, (req, res) => {
    try {
        const { settings: settingsDb } = require('../database');
        const profile = companyProfile.get.get() || { name: 'ONIX', email: '', phone: '', address: '', timezone: 'Australia/Sydney' };
        const allIntegrations = integrations.getAll.all().map(i => ({ ...i, config: JSON.parse(i.config || '{}') }));
        const notifPrefs = notificationPrefs.get.get() || {};
        const faviconRow = settingsDb.get.get('favicon_url');
        const ogRow = settingsDb.get.get('og-image_url');
        const logoRow = settingsDb.get.get('logo_url');
        res.render('settings', {
            title: 'Settings - ONIX Admin',
            user: req.user,
            companyProfile: profile,
            integrations: allIntegrations,
            notificationPreferences: notifPrefs,
            brandingAssets: {
                favicon: faviconRow?.value || null,
                ogImage: ogRow?.value || null,
                logo: logoRow?.value || null
            }
        });
    } catch (error) {
        console.error('Settings error:', error);
        res.render('error', { layout: false, title: 'Error', message: 'Failed to load settings' });
    }
});

// ==================== REDIRECTS ====================

router.get('/', (req, res) => { res.redirect('/dashboard'); });

// Redirect team to dashboard (hidden tab)
router.get('/team', (req, res) => { res.redirect('/dashboard'); });
router.get('/team/:id', (req, res) => { res.redirect('/dashboard'); });

module.exports = router;
