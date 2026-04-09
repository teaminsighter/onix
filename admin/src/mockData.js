/**
 * ONIX Admin - Mock Data
 * Static data for UI development
 * Replace with real database queries when implementing functionality
 */

// Dashboard overview stats
const dashboardStats = {
    leads: { total: 247, change: '+12%', isPositive: true },
    conversion: { rate: 23.5, change: '+2.4%', isPositive: true },
    revenue: { total: 45800, change: '+18%', isPositive: true },
    meetings: { scheduled: 12, thisWeek: 8 },
    costs: { total: 8000, cpl: 32.39 }
};

// Leads organized by pipeline status
const pipelineLeads = {
    new: [
        { id: 1, name: 'John Smith', email: 'john@example.com', phone: '+61 412 345 678', source: 'website', created_at: '2026-04-05T10:30:00', priority: 'high' },
        { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+61 423 456 789', source: 'facebook', created_at: '2026-04-05T09:15:00', priority: 'normal' },
        { id: 3, name: 'Mike Brown', email: 'mike@example.com', phone: '+61 434 567 890', source: 'google', created_at: '2026-04-04T14:20:00', priority: 'normal' }
    ],
    contacted: [
        { id: 4, name: 'Emily Davis', email: 'emily@example.com', phone: '+61 445 678 901', source: 'linkedin', created_at: '2026-04-03T11:45:00', priority: 'high' },
        { id: 5, name: 'Chris Wilson', email: 'chris@example.com', phone: '+61 456 789 012', source: 'website', created_at: '2026-04-02T16:30:00', priority: 'low' }
    ],
    scheduled: [
        { id: 6, name: 'Lisa Anderson', email: 'lisa@example.com', phone: '+61 467 890 123', source: 'referral', created_at: '2026-04-01T08:00:00', priority: 'high' }
    ],
    converted: [
        { id: 7, name: 'David Lee', email: 'david@example.com', phone: '+61 478 901 234', source: 'website', created_at: '2026-03-28T13:15:00', priority: 'normal' },
        { id: 8, name: 'Anna Taylor', email: 'anna@example.com', phone: '+61 489 012 345', source: 'google', created_at: '2026-03-25T10:00:00', priority: 'normal' }
    ],
    lost: [
        { id: 9, name: 'Tom Martinez', email: 'tom@example.com', phone: '+61 490 123 456', source: 'facebook', created_at: '2026-03-20T15:45:00', priority: 'low' }
    ]
};

// Meetings list
const meetings = [
    {
        id: 1,
        lead_id: 6,
        lead_name: 'Lisa Anderson',
        lead_email: 'lisa@example.com',
        title: 'Initial Consultation',
        description: 'Discuss requirements and service options',
        meeting_type: 'video',
        start_time: '2026-04-07T10:00:00',
        end_time: '2026-04-07T10:30:00',
        location: 'Zoom',
        status: 'scheduled',
        notes: ''
    },
    {
        id: 2,
        lead_id: 4,
        lead_name: 'Emily Davis',
        lead_email: 'emily@example.com',
        title: 'Follow-up Call',
        description: 'Review proposal and answer questions',
        meeting_type: 'call',
        start_time: '2026-04-07T14:00:00',
        end_time: '2026-04-07T14:30:00',
        location: 'Phone',
        status: 'scheduled',
        notes: ''
    },
    {
        id: 3,
        lead_id: 1,
        lead_name: 'John Smith',
        lead_email: 'john@example.com',
        title: 'Demo Presentation',
        description: 'Show platform capabilities and pricing',
        meeting_type: 'video',
        start_time: '2026-04-08T09:00:00',
        end_time: '2026-04-08T10:00:00',
        location: 'Google Meet',
        status: 'scheduled',
        notes: ''
    },
    {
        id: 4,
        lead_id: 7,
        lead_name: 'David Lee',
        lead_email: 'david@example.com',
        title: 'Contract Discussion',
        description: 'Finalize terms and sign agreement',
        meeting_type: 'in_person',
        start_time: '2026-04-09T11:00:00',
        end_time: '2026-04-09T12:00:00',
        location: 'ONIX Office',
        status: 'scheduled',
        notes: 'Bring printed contract copies'
    },
    {
        id: 5,
        lead_id: 8,
        lead_name: 'Anna Taylor',
        lead_email: 'anna@example.com',
        title: 'Onboarding Call',
        description: 'Setup and training session',
        meeting_type: 'video',
        start_time: '2026-04-03T15:00:00',
        end_time: '2026-04-03T15:45:00',
        location: 'Zoom',
        status: 'completed',
        outcome: 'positive',
        notes: 'Client very satisfied, referred a friend'
    },
    {
        id: 6,
        lead_id: 9,
        lead_name: 'Tom Martinez',
        lead_email: 'tom@example.com',
        title: 'Discovery Call',
        description: 'Initial consultation',
        meeting_type: 'call',
        start_time: '2026-03-18T10:00:00',
        end_time: '2026-03-18T10:30:00',
        location: 'Phone',
        status: 'completed',
        outcome: 'negative',
        notes: 'Budget constraints, may revisit next quarter'
    }
];

// Cost entries
const costs = [
    { id: 1, source: 'facebook', amount: 2500.00, month: '2026-04', campaign_name: 'Lead Gen Q2', leads_count: 65, notes: '' },
    { id: 2, source: 'google', amount: 3200.00, month: '2026-04', campaign_name: 'Search Ads', leads_count: 45, notes: '' },
    { id: 3, source: 'linkedin', amount: 1800.00, month: '2026-04', campaign_name: 'B2B Outreach', leads_count: 25, notes: '' },
    { id: 4, source: 'other', amount: 500.00, month: '2026-04', campaign_name: 'Email Tools', leads_count: 0, notes: 'Mailchimp subscription' },
    { id: 5, source: 'facebook', amount: 2200.00, month: '2026-03', campaign_name: 'Lead Gen Q1', leads_count: 58, notes: '' },
    { id: 6, source: 'google', amount: 2800.00, month: '2026-03', campaign_name: 'Search Ads', leads_count: 42, notes: '' },
    { id: 7, source: 'linkedin', amount: 1500.00, month: '2026-03', campaign_name: 'B2B Outreach', leads_count: 20, notes: '' },
    { id: 8, source: 'other', amount: 500.00, month: '2026-03', campaign_name: 'Email Tools', leads_count: 0, notes: '' }
];

// Deals/Revenue
const deals = [
    { id: 1, lead_id: 7, lead_name: 'David Lee', title: 'Solar Installation Package', amount: 15000.00, status: 'won', source: 'website', closed_at: '2026-04-01', notes: '' },
    { id: 2, lead_id: 8, lead_name: 'Anna Taylor', title: 'Consultation Package', amount: 5500.00, status: 'won', source: 'google', closed_at: '2026-03-28', notes: '' },
    { id: 3, lead_id: 6, lead_name: 'Lisa Anderson', title: 'Premium Service', amount: 12000.00, status: 'pending', source: 'referral', closed_at: null, notes: 'Awaiting final approval' },
    { id: 4, lead_id: 9, lead_name: 'Tom Martinez', title: 'Basic Package', amount: 3000.00, status: 'lost', source: 'facebook', closed_at: '2026-03-22', notes: 'Budget constraints' },
    { id: 5, lead_id: 5, lead_name: 'Chris Wilson', title: 'Standard Package', amount: 8000.00, status: 'pending', source: 'website', closed_at: null, notes: '' }
];

// Chart data for visualizations
const chartData = {
    leadsOverTime: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [45, 62, 78, 95, 120, 147],
        colors: ['#c9f31d']
    },
    conversionFunnel: {
        labels: ['Leads', 'Contacted', 'Scheduled', 'Converted'],
        data: [247, 156, 89, 58],
        percentages: ['100%', '63%', '36%', '23%']
    },
    leadSources: {
        labels: ['Website', 'Facebook', 'Google', 'LinkedIn', 'Referral'],
        data: [98, 65, 45, 25, 14],
        colors: ['#c9f31d', '#3b82f6', '#f59e0b', '#22c55e', '#8b5cf6']
    },
    costBySource: {
        labels: ['Facebook', 'Google', 'LinkedIn', 'Other'],
        data: [2500, 3200, 1800, 500],
        colors: ['#3b82f6', '#f59e0b', '#22c55e', '#888888']
    },
    costVsRevenue: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr'],
        costs: [5500, 6200, 7000, 8000],
        revenue: [12000, 18000, 25000, 45800]
    },
    monthlyLeads: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        data: [52, 68, 74, 53]
    }
};

// Team members
const teamMembers = [
    {
        id: 1,
        username: 'admin',
        full_name: 'Alex Admin',
        email: 'alex@onix.com',
        role: 'admin',
        is_active: true,
        last_login: '2026-04-06T08:30:00',
        stats: { leads_contacted: 45, meetings_scheduled: 18, conversions: 12 }
    },
    {
        id: 2,
        username: 'jsmith',
        full_name: 'Jane Smith',
        email: 'jane@onix.com',
        role: 'manager',
        is_active: true,
        last_login: '2026-04-05T16:45:00',
        stats: { leads_contacted: 38, meetings_scheduled: 15, conversions: 10 }
    },
    {
        id: 3,
        username: 'bwilson',
        full_name: 'Bob Wilson',
        email: 'bob@onix.com',
        role: 'sales',
        is_active: true,
        last_login: '2026-04-06T09:15:00',
        stats: { leads_contacted: 52, meetings_scheduled: 22, conversions: 8 }
    },
    {
        id: 4,
        username: 'cjones',
        full_name: 'Carol Jones',
        email: 'carol@onix.com',
        role: 'sales',
        is_active: false,
        last_login: '2026-03-15T11:00:00',
        stats: { leads_contacted: 24, meetings_scheduled: 8, conversions: 4 }
    }
];

// Recent activity feed
const activityFeed = [
    { id: 1, user: 'Jane Smith', user_avatar: 'J', action: 'converted lead', entity: 'David Lee', entity_type: 'lead', time: '2 hours ago', icon: 'check' },
    { id: 2, user: 'Bob Wilson', user_avatar: 'B', action: 'scheduled meeting with', entity: 'Lisa Anderson', entity_type: 'meeting', time: '3 hours ago', icon: 'calendar' },
    { id: 3, user: 'System', user_avatar: 'S', action: 'New lead received:', entity: 'John Smith', entity_type: 'lead', time: '5 hours ago', icon: 'user-plus' },
    { id: 4, user: 'Jane Smith', user_avatar: 'J', action: 'added note to', entity: 'Emily Davis', entity_type: 'note', time: '6 hours ago', icon: 'edit' },
    { id: 5, user: 'Bob Wilson', user_avatar: 'B', action: 'contacted', entity: 'Sarah Johnson', entity_type: 'contact', time: '1 day ago', icon: 'phone' },
    { id: 6, user: 'Alex Admin', user_avatar: 'A', action: 'added cost entry for', entity: 'Facebook Ads', entity_type: 'cost', time: '1 day ago', icon: 'dollar' },
    { id: 7, user: 'System', user_avatar: 'S', action: 'Meeting completed:', entity: 'Anna Taylor - Onboarding', entity_type: 'meeting', time: '2 days ago', icon: 'check-circle' }
];

// Integration settings
const integrations = [
    {
        id: 1,
        name: 'google_analytics',
        label: 'Google Analytics',
        icon: 'bar-chart',
        enabled: false,
        description: 'Track website visitors and behavior',
        config: { measurement_id: '' }
    },
    {
        id: 2,
        name: 'calendly',
        label: 'Calendly',
        icon: 'calendar',
        enabled: true,
        description: 'Sync scheduled meetings automatically',
        config: { webhook_url: 'https://api.onix.com/webhook/calendly' }
    },
    {
        id: 3,
        name: 'formspree',
        label: 'Formspree',
        icon: 'inbox',
        enabled: true,
        description: 'Receive form submissions from website',
        config: { form_id: 'your-form-id' }
    },
    {
        id: 4,
        name: 'slack',
        label: 'Slack',
        icon: 'message-square',
        enabled: false,
        description: 'Get notifications in Slack channels',
        config: { webhook_url: '' }
    },
    {
        id: 5,
        name: 'mailchimp',
        label: 'Mailchimp',
        icon: 'mail',
        enabled: false,
        description: 'Sync leads to email marketing lists',
        config: { api_key: '', list_id: '' }
    }
];

// Company profile
const companyProfile = {
    name: 'ONIX',
    email: 'hello@onixmrkt.com',
    phone: '+61 2 1234 5678',
    address: 'Sydney, Australia',
    timezone: 'Australia/Sydney',
    logo_url: null
};

// Notification preferences
const notificationPreferences = {
    new_lead_email: true,
    new_lead_slack: false,
    meeting_reminder: true,
    meeting_reminder_minutes: 30,
    weekly_summary: false,
    daily_digest: true
};

// Source performance data for analytics
const sourcePerformance = [
    { source: 'Website', leads: 98, contacted: 65, scheduled: 38, converted: 25, conversion_rate: 25.5 },
    { source: 'Facebook', leads: 65, contacted: 42, scheduled: 22, converted: 14, conversion_rate: 21.5 },
    { source: 'Google', leads: 45, contacted: 28, scheduled: 16, converted: 11, conversion_rate: 24.4 },
    { source: 'LinkedIn', leads: 25, contacted: 14, scheduled: 8, converted: 5, conversion_rate: 20.0 },
    { source: 'Referral', leads: 14, contacted: 7, scheduled: 5, converted: 3, conversion_rate: 21.4 }
];

// Helper function to get leads as flat array
function getAllLeads() {
    const allLeads = [];
    Object.keys(pipelineLeads).forEach(status => {
        pipelineLeads[status].forEach(lead => {
            allLeads.push({ ...lead, status });
        });
    });
    return allLeads.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

// Helper function to get upcoming meetings
function getUpcomingMeetings(limit = 5) {
    const now = new Date();
    return meetings
        .filter(m => new Date(m.start_time) > now && m.status === 'scheduled')
        .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
        .slice(0, limit);
}

// Helper function to calculate stats
function calculateStats() {
    const totalLeads = Object.values(pipelineLeads).flat().length;
    const convertedLeads = pipelineLeads.converted.length;
    const conversionRate = ((convertedLeads / totalLeads) * 100).toFixed(1);

    const totalRevenue = deals
        .filter(d => d.status === 'won')
        .reduce((sum, d) => sum + d.amount, 0);

    const totalCosts = costs
        .filter(c => c.month === '2026-04')
        .reduce((sum, c) => sum + c.amount, 0);

    const monthlyLeads = costs
        .filter(c => c.month === '2026-04')
        .reduce((sum, c) => sum + c.leads_count, 0);

    const cpl = monthlyLeads > 0 ? (totalCosts / monthlyLeads).toFixed(2) : 0;

    return {
        totalLeads,
        convertedLeads,
        conversionRate,
        totalRevenue,
        totalCosts,
        cpl,
        roi: totalCosts > 0 ? (((totalRevenue - totalCosts) / totalCosts) * 100).toFixed(0) : 0
    };
}

module.exports = {
    dashboardStats,
    pipelineLeads,
    meetings,
    costs,
    deals,
    chartData,
    teamMembers,
    activityFeed,
    integrations,
    companyProfile,
    notificationPreferences,
    sourcePerformance,
    getAllLeads,
    getUpcomingMeetings,
    calculateStats
};
