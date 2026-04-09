/**
 * ONIX Admin - Dashboard View Routes
 */

const express = require('express');
const router = express.Router();
const { authenticateView } = require('../middleware/auth');
const { leads } = require('../database');
const mockData = require('../mockData');

// Login page
router.get('/login', (req, res) => {
    // If already logged in, redirect to dashboard
    const token = req.cookies?.auth_token;
    if (token) {
        try {
            const jwt = require('jsonwebtoken');
            jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-change-me');
            return res.redirect('/dashboard');
        } catch (e) {
            // Token invalid, show login
        }
    }

    res.render('login', {
        title: 'Login - ONIX Admin',
        error: req.query.error
    });
});

// Dashboard home
router.get('/dashboard', authenticateView, (req, res) => {
    try {
        // Get stats from database
        const statusCounts = leads.countByStatus.all();
        const total = leads.countTotal.get();
        const today = leads.countToday.get();
        const thisWeek = leads.countThisWeek.get();
        const thisMonth = leads.countThisMonth.get();

        // Get recent leads
        const recentLeads = leads.getRecent.all(10);

        // Convert status counts
        const byStatus = {};
        statusCounts.forEach(s => {
            byStatus[s.status] = s.count;
        });

        // Get additional mock data for enhanced dashboard
        const upcomingMeetings = mockData.getUpcomingMeetings(5);
        const calculatedStats = mockData.calculateStats();

        res.render('dashboard', {
            title: 'Dashboard - ONIX Admin',
            user: req.user,
            stats: {
                total: total.total || mockData.dashboardStats.leads.total,
                today: today.count,
                thisWeek: thisWeek.count,
                thisMonth: thisMonth.count,
                byStatus,
                // Enhanced stats from mock data
                conversion: mockData.dashboardStats.conversion,
                revenue: mockData.dashboardStats.revenue,
                meetings: mockData.dashboardStats.meetings,
                costs: mockData.dashboardStats.costs
            },
            recentLeads: recentLeads.length > 0 ? recentLeads : mockData.getAllLeads().slice(0, 10),
            upcomingMeetings,
            activityFeed: mockData.activityFeed,
            chartData: mockData.chartData
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.render('error', { title: 'Error', message: 'Failed to load dashboard' });
    }
});

// Leads list
router.get('/leads', authenticateView, (req, res) => {
    try {
        const { status, search } = req.query;
        let allLeads;

        if (search) {
            const searchTerm = `%${search}%`;
            allLeads = leads.search.all(searchTerm, searchTerm, searchTerm, searchTerm);
        } else if (status && status !== 'all') {
            allLeads = leads.getByStatus.all(status);
        } else {
            allLeads = leads.getAll.all();
        }

        res.render('leads', {
            title: 'Leads - ONIX Admin',
            user: req.user,
            leads: allLeads,
            filters: { status, search }
        });
    } catch (error) {
        console.error('Leads page error:', error);
        res.render('error', { title: 'Error', message: 'Failed to load leads' });
    }
});

// Single lead view
router.get('/leads/:id', authenticateView, (req, res) => {
    try {
        const lead = leads.getById.get(req.params.id);

        if (!lead) {
            return res.render('error', { title: 'Not Found', message: 'Lead not found' });
        }

        const { activities } = require('../database');
        const leadActivities = activities.getByLead.all(req.params.id);

        res.render('lead-detail', {
            title: `${lead.name} - ONIX Admin`,
            user: req.user,
            lead,
            activities: leadActivities
        });
    } catch (error) {
        console.error('Lead detail error:', error);
        res.render('error', { title: 'Error', message: 'Failed to load lead' });
    }
});

// Pipeline (Kanban board)
router.get('/pipeline', authenticateView, (req, res) => {
    try {
        res.render('pipeline', {
            title: 'Pipeline - ONIX Admin',
            user: req.user,
            leads: mockData.pipelineLeads
        });
    } catch (error) {
        console.error('Pipeline error:', error);
        res.render('error', { title: 'Error', message: 'Failed to load pipeline' });
    }
});

// Calendar
router.get('/calendar', authenticateView, (req, res) => {
    try {
        res.render('calendar', {
            title: 'Calendar - ONIX Admin',
            user: req.user,
            meetings: mockData.meetings
        });
    } catch (error) {
        console.error('Calendar error:', error);
        res.render('error', { title: 'Error', message: 'Failed to load calendar' });
    }
});

// Meeting detail
router.get('/meetings/:id', authenticateView, (req, res) => {
    try {
        const meeting = mockData.meetings.find(m => m.id === parseInt(req.params.id));

        if (!meeting) {
            return res.render('error', { title: 'Not Found', message: 'Meeting not found' });
        }

        res.render('meeting-detail', {
            title: `${meeting.title} - ONIX Admin`,
            user: req.user,
            meeting
        });
    } catch (error) {
        console.error('Meeting detail error:', error);
        res.render('error', { title: 'Error', message: 'Failed to load meeting' });
    }
});

// Costs & ROI
router.get('/costs', authenticateView, (req, res) => {
    try {
        const stats = mockData.calculateStats();

        res.render('costs', {
            title: 'Costs & ROI - ONIX Admin',
            user: req.user,
            costs: mockData.costs,
            deals: mockData.deals,
            stats,
            chartData: mockData.chartData
        });
    } catch (error) {
        console.error('Costs error:', error);
        res.render('error', { title: 'Error', message: 'Failed to load costs' });
    }
});

// Analytics
router.get('/analytics', authenticateView, (req, res) => {
    try {
        res.render('analytics', {
            title: 'Analytics - ONIX Admin',
            user: req.user,
            chartData: mockData.chartData,
            sourcePerformance: mockData.sourcePerformance
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.render('error', { title: 'Error', message: 'Failed to load analytics' });
    }
});

// Team management
router.get('/team', authenticateView, (req, res) => {
    try {
        res.render('team', {
            title: 'Team - ONIX Admin',
            user: req.user,
            teamMembers: mockData.teamMembers,
            activityFeed: mockData.activityFeed
        });
    } catch (error) {
        console.error('Team error:', error);
        res.render('error', { title: 'Error', message: 'Failed to load team' });
    }
});

// User detail
router.get('/team/:id', authenticateView, (req, res) => {
    try {
        const member = mockData.teamMembers.find(m => m.id === parseInt(req.params.id));

        if (!member) {
            return res.render('error', { title: 'Not Found', message: 'Team member not found' });
        }

        // Mock user activity
        const userActivity = [
            { timestamp: '2026-04-06T08:30:00', type: 'login', action: 'Logged in', entity: '' },
            { timestamp: '2026-04-05T16:45:00', type: 'contact', action: 'Contacted lead', entity: 'John Smith' },
            { timestamp: '2026-04-05T14:20:00', type: 'schedule', action: 'Scheduled meeting', entity: 'Emily Davis' },
            { timestamp: '2026-04-05T11:00:00', type: 'convert', action: 'Converted lead', entity: 'David Lee' },
            { timestamp: '2026-04-04T09:15:00', type: 'note', action: 'Added note to', entity: 'Sarah Johnson' },
            { timestamp: '2026-04-03T15:30:00', type: 'contact', action: 'Contacted lead', entity: 'Mike Brown' }
        ];

        // Mock assigned leads
        const assignedLeads = [
            { id: 1, name: 'John Smith', status: 'new' },
            { id: 4, name: 'Emily Davis', status: 'contacted' },
            { id: 6, name: 'Lisa Anderson', status: 'scheduled' }
        ];

        res.render('user-detail', {
            title: `${member.full_name} - ONIX Admin`,
            user: req.user,
            member,
            userActivity,
            assignedLeads
        });
    } catch (error) {
        console.error('User detail error:', error);
        res.render('error', { title: 'Error', message: 'Failed to load user' });
    }
});

// Settings
router.get('/settings', authenticateView, (req, res) => {
    try {
        res.render('settings', {
            title: 'Settings - ONIX Admin',
            user: req.user,
            companyProfile: mockData.companyProfile,
            integrations: mockData.integrations,
            notificationPreferences: mockData.notificationPreferences
        });
    } catch (error) {
        console.error('Settings error:', error);
        res.render('error', { title: 'Error', message: 'Failed to load settings' });
    }
});

// Redirect root to dashboard or login
router.get('/', (req, res) => {
    res.redirect('/dashboard');
});

module.exports = router;
