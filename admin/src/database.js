/**
 * ONIX Admin - Database Module
 * SQLite database for lead management
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dataDir, 'onix.db');

let db;
try {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
} catch (error) {
    console.error(`FATAL: Failed to open database at ${dbPath}:`, error.message);
    process.exit(1);
}

// Initialize database schema
function initializeDatabase() {
    // Leads table
    db.exec(`
        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            message TEXT,
            source TEXT DEFAULT 'website',
            page_url TEXT,
            status TEXT DEFAULT 'new',
            priority TEXT DEFAULT 'normal',
            notes TEXT,
            assigned_to TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            contacted_at DATETIME,
            converted_at DATETIME
        )
    `);

    // Lead activities table (for tracking interactions)
    db.exec(`
        CREATE TABLE IF NOT EXISTS lead_activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lead_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            description TEXT,
            created_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
        )
    `);

    // Users table (for admin authentication)
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'admin',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME
        )
    `);

    // Settings table
    db.exec(`
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Meetings table
    db.exec(`
        CREATE TABLE IF NOT EXISTS meetings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lead_id INTEGER,
            title TEXT NOT NULL,
            description TEXT,
            meeting_type TEXT DEFAULT 'call',
            start_time DATETIME NOT NULL,
            end_time DATETIME NOT NULL,
            location TEXT,
            status TEXT DEFAULT 'scheduled',
            outcome TEXT,
            notes TEXT,
            calendly_event_id TEXT,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    `);

    // Costs table (for ad spend tracking)
    db.exec(`
        CREATE TABLE IF NOT EXISTS costs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source TEXT NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            month TEXT NOT NULL,
            campaign_name TEXT,
            leads_count INTEGER DEFAULT 0,
            notes TEXT,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    `);

    // Deals/Revenue table
    db.exec(`
        CREATE TABLE IF NOT EXISTS deals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lead_id INTEGER,
            title TEXT NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            status TEXT DEFAULT 'pending',
            source TEXT,
            notes TEXT,
            closed_at DATETIME,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    `);

    // Integrations table
    db.exec(`
        CREATE TABLE IF NOT EXISTS integrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            label TEXT NOT NULL,
            icon TEXT,
            enabled BOOLEAN DEFAULT 0,
            description TEXT,
            config TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Company profile table
    db.exec(`
        CREATE TABLE IF NOT EXISTS company_profile (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            name TEXT NOT NULL DEFAULT 'ONIX',
            email TEXT,
            phone TEXT,
            address TEXT,
            timezone TEXT DEFAULT 'Australia/Sydney',
            logo_url TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Notification preferences table
    db.exec(`
        CREATE TABLE IF NOT EXISTS notification_preferences (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            new_lead_email BOOLEAN DEFAULT 1,
            new_lead_slack BOOLEAN DEFAULT 0,
            meeting_reminder BOOLEAN DEFAULT 1,
            meeting_reminder_minutes INTEGER DEFAULT 30,
            weekly_summary BOOLEAN DEFAULT 0,
            daily_digest BOOLEAN DEFAULT 1,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // User activity log table
    db.exec(`
        CREATE TABLE IF NOT EXISTS user_activity_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            action TEXT NOT NULL,
            entity_type TEXT,
            entity_id INTEGER,
            entity_name TEXT,
            metadata TEXT,
            ip_address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // Create indexes
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
        CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);
        CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
        CREATE INDEX IF NOT EXISTS idx_activities_lead ON lead_activities(lead_id);
        CREATE INDEX IF NOT EXISTS idx_meetings_lead ON meetings(lead_id);
        CREATE INDEX IF NOT EXISTS idx_meetings_start ON meetings(start_time);
        CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
        CREATE INDEX IF NOT EXISTS idx_costs_month ON costs(month);
        CREATE INDEX IF NOT EXISTS idx_costs_source ON costs(source);
        CREATE INDEX IF NOT EXISTS idx_deals_lead ON deals(lead_id);
        CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
        CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity_log(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_activity_created ON user_activity_log(created_at);
        CREATE INDEX IF NOT EXISTS idx_meetings_created_by ON meetings(created_by);
        CREATE INDEX IF NOT EXISTS idx_costs_created_by ON costs(created_by);
        CREATE INDEX IF NOT EXISTS idx_deals_created_by ON deals(created_by);
    `);

    // Drop orphaned table from incomplete migration
    db.exec(`DROP TABLE IF EXISTS users_new`);

    // Migration: add ghl_appointment_id column to meetings table for GHL bookings
    const meetingCols = db.prepare("PRAGMA table_info(meetings)").all().map(c => c.name);
    if (!meetingCols.includes('ghl_appointment_id')) {
        db.exec(`ALTER TABLE meetings ADD COLUMN ghl_appointment_id TEXT`);
    }

    // Seed default integrations
    const existingIntegrations = db.prepare('SELECT COUNT(*) as count FROM integrations').get();
    if (existingIntegrations.count === 0) {
        const seedIntegration = db.prepare('INSERT OR IGNORE INTO integrations (name, label, icon, enabled, description, config) VALUES (?, ?, ?, ?, ?, ?)');
        seedIntegration.run('ghl', 'GoHighLevel', 'calendar', 1, 'Sync meetings from GHL calendar bookings', '{}');
        seedIntegration.run('formspree', 'Formspree', 'mail', 0, 'Receive form submissions via Formspree', '{}');
        seedIntegration.run('slack', 'Slack', 'message-square', 0, 'Send lead notifications to Slack', '{}');
    }
    // Always ensure GA4/GTM/header_scripts exist (added later)
    {
        const seedIfMissing = db.prepare('INSERT OR IGNORE INTO integrations (name, label, icon, enabled, description, config) VALUES (?, ?, ?, ?, ?, ?)');
        seedIfMissing.run('ga4', 'Google Analytics 4', 'bar-chart', 0, 'Website visitor tracking', '{}');
        seedIfMissing.run('gtm', 'Google Tag Manager', 'bar-chart', 0, 'Tag management for website', '{}');
        seedIfMissing.run('header_scripts', 'Custom Header Scripts', 'code', 1, 'Custom scripts injected into website head', '{"scripts":""}');
        seedIfMissing.run('ghl', 'GoHighLevel', 'calendar', 1, 'Sync meetings from GHL calendar bookings', '{}');
    }

    // Seed default company profile
    const existingProfile = db.prepare('SELECT COUNT(*) as count FROM company_profile').get();
    if (existingProfile.count === 0) {
        db.prepare('INSERT INTO company_profile (id, name, email, phone, address, timezone) VALUES (1, ?, ?, ?, ?, ?)').run('ONIX', 'hello@onixmrkt.com', '+61 400 000 000', 'Sydney, Australia', 'Australia/Sydney');
    }

    // Seed default notification preferences
    const existingNotifs = db.prepare('SELECT COUNT(*) as count FROM notification_preferences').get();
    if (existingNotifs.count === 0) {
        db.prepare('INSERT INTO notification_preferences (id) VALUES (1)').run();
    }

    console.log('✅ Database initialized with all schemas');
}

// Initialize database before preparing statements
initializeDatabase();

// Lead CRUD operations
const leadQueries = {
    create: db.prepare(`
        INSERT INTO leads (name, email, phone, message, source, page_url)
        VALUES (@name, @email, @phone, @message, @source, @page_url)
    `),

    getAll: db.prepare(`
        SELECT * FROM leads ORDER BY created_at DESC
    `),

    getById: db.prepare(`
        SELECT * FROM leads WHERE id = ?
    `),

    getByStatus: db.prepare(`
        SELECT * FROM leads WHERE status = ? ORDER BY created_at DESC
    `),

    getRecent: db.prepare(`
        SELECT * FROM leads ORDER BY created_at DESC LIMIT ?
    `),

    update: db.prepare(`
        UPDATE leads SET
            name = COALESCE(@name, name),
            email = COALESCE(@email, email),
            phone = COALESCE(@phone, phone),
            status = COALESCE(@status, status),
            priority = COALESCE(@priority, priority),
            notes = COALESCE(@notes, notes),
            assigned_to = COALESCE(@assigned_to, assigned_to),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = @id
    `),

    updateStatus: db.prepare(`
        UPDATE leads SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `),

    delete: db.prepare(`
        DELETE FROM leads WHERE id = ?
    `),

    search: db.prepare(`
        SELECT * FROM leads
        WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR message LIKE ?
        ORDER BY created_at DESC
    `),

    searchPaginated: db.prepare(`
        SELECT * FROM leads
        WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR message LIKE ?
        ORDER BY created_at DESC LIMIT ? OFFSET ?
    `),

    searchCount: db.prepare(`
        SELECT COUNT(*) as total FROM leads
        WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR message LIKE ?
    `),

    getPaginated: db.prepare(`
        SELECT * FROM leads ORDER BY created_at DESC LIMIT ? OFFSET ?
    `),

    getByStatusPaginated: db.prepare(`
        SELECT * FROM leads WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?
    `),

    countByStatusValue: db.prepare(`
        SELECT COUNT(*) as total FROM leads WHERE status = ?
    `),

    countByStatus: db.prepare(`
        SELECT status, COUNT(*) as count FROM leads GROUP BY status
    `),

    countTotal: db.prepare(`
        SELECT COUNT(*) as total FROM leads
    `),

    countToday: db.prepare(`
        SELECT COUNT(*) as count FROM leads
        WHERE DATE(created_at) = DATE('now')
    `),

    countThisWeek: db.prepare(`
        SELECT COUNT(*) as count FROM leads
        WHERE created_at >= DATE('now', '-7 days')
    `),

    countThisMonth: db.prepare(`
        SELECT COUNT(*) as count FROM leads
        WHERE created_at >= DATE('now', '-30 days')
    `)
};

// Activity logging
const activityQueries = {
    create: db.prepare(`
        INSERT INTO lead_activities (lead_id, type, description, created_by)
        VALUES (?, ?, ?, ?)
    `),

    getByLead: db.prepare(`
        SELECT * FROM lead_activities WHERE lead_id = ? ORDER BY created_at DESC
    `)
};

// User operations
const userQueries = {
    create: db.prepare(`
        INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)
    `),

    getByUsername: db.prepare(`
        SELECT * FROM users WHERE username = ?
    `),

    updateLastLogin: db.prepare(`
        UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?
    `)
};

// Meeting operations
const meetingQueries = {
    create: db.prepare(`
        INSERT INTO meetings (lead_id, title, description, meeting_type, start_time, end_time, location, status, notes, calendly_event_id, ghl_appointment_id, created_by)
        VALUES (@lead_id, @title, @description, @meeting_type, @start_time, @end_time, @location, @status, @notes, @calendly_event_id, @ghl_appointment_id, @created_by)
    `),
    getAll: db.prepare(`
        SELECT m.*, l.name as lead_name, l.email as lead_email
        FROM meetings m LEFT JOIN leads l ON m.lead_id = l.id
        ORDER BY m.start_time DESC
    `),
    getById: db.prepare(`
        SELECT m.*, l.name as lead_name, l.email as lead_email
        FROM meetings m LEFT JOIN leads l ON m.lead_id = l.id
        WHERE m.id = ?
    `),
    getUpcoming: db.prepare(`
        SELECT m.*, l.name as lead_name, l.email as lead_email
        FROM meetings m LEFT JOIN leads l ON m.lead_id = l.id
        WHERE m.status = 'scheduled' AND m.start_time >= datetime('now')
        ORDER BY m.start_time ASC LIMIT ?
    `),
    getByDateRange: db.prepare(`
        SELECT m.*, l.name as lead_name, l.email as lead_email
        FROM meetings m LEFT JOIN leads l ON m.lead_id = l.id
        WHERE m.start_time BETWEEN ? AND ?
        ORDER BY m.start_time ASC
    `),
    getByStatus: db.prepare(`
        SELECT m.*, l.name as lead_name, l.email as lead_email
        FROM meetings m LEFT JOIN leads l ON m.lead_id = l.id
        WHERE m.status = ? ORDER BY m.start_time DESC
    `),
    getByLead: db.prepare(`
        SELECT * FROM meetings WHERE lead_id = ? ORDER BY start_time DESC
    `),
    getByCalendlyId: db.prepare(`
        SELECT * FROM meetings WHERE calendly_event_id = ?
    `),
    getByGhlId: db.prepare(`
        SELECT * FROM meetings WHERE ghl_appointment_id = ?
    `),
    update: db.prepare(`
        UPDATE meetings SET
            title = COALESCE(@title, title),
            description = COALESCE(@description, description),
            meeting_type = COALESCE(@meeting_type, meeting_type),
            start_time = COALESCE(@start_time, start_time),
            end_time = COALESCE(@end_time, end_time),
            location = COALESCE(@location, location),
            notes = COALESCE(@notes, notes),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = @id
    `),
    updateStatus: db.prepare(`
        UPDATE meetings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `),
    updateOutcome: db.prepare(`
        UPDATE meetings SET outcome = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `),
    delete: db.prepare(`DELETE FROM meetings WHERE id = ?`),
    countByStatus: db.prepare(`SELECT status, COUNT(*) as count FROM meetings GROUP BY status`),
    countThisWeek: db.prepare(`SELECT COUNT(*) as count FROM meetings WHERE start_time >= date('now', '-7 days')`)
};

// Cost operations
const costQueries = {
    create: db.prepare(`
        INSERT INTO costs (source, amount, month, campaign_name, leads_count, notes, created_by)
        VALUES (@source, @amount, @month, @campaign_name, @leads_count, @notes, @created_by)
    `),
    getAll: db.prepare(`SELECT * FROM costs ORDER BY month DESC, source`),
    getById: db.prepare(`SELECT * FROM costs WHERE id = ?`),
    getByMonth: db.prepare(`SELECT * FROM costs WHERE month = ? ORDER BY source`),
    getBySource: db.prepare(`SELECT * FROM costs WHERE source = ? ORDER BY month DESC`),
    update: db.prepare(`
        UPDATE costs SET
            source = COALESCE(@source, source),
            amount = COALESCE(@amount, amount),
            month = COALESCE(@month, month),
            campaign_name = COALESCE(@campaign_name, campaign_name),
            leads_count = COALESCE(@leads_count, leads_count),
            notes = COALESCE(@notes, notes),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = @id
    `),
    delete: db.prepare(`DELETE FROM costs WHERE id = ?`),
    sumByMonth: db.prepare(`SELECT month, SUM(amount) as total, SUM(leads_count) as total_leads FROM costs GROUP BY month ORDER BY month DESC`),
    sumBySource: db.prepare(`SELECT source, SUM(amount) as total, SUM(leads_count) as total_leads FROM costs GROUP BY source ORDER BY total DESC`),
    sumTotal: db.prepare(`SELECT SUM(amount) as total FROM costs`)
};

// Deal operations
const dealQueries = {
    create: db.prepare(`
        INSERT INTO deals (lead_id, title, amount, status, source, notes, created_by)
        VALUES (@lead_id, @title, @amount, @status, @source, @notes, @created_by)
    `),
    getAll: db.prepare(`
        SELECT d.*, l.name as lead_name FROM deals d
        LEFT JOIN leads l ON d.lead_id = l.id
        ORDER BY d.created_at DESC
    `),
    getById: db.prepare(`
        SELECT d.*, l.name as lead_name FROM deals d
        LEFT JOIN leads l ON d.lead_id = l.id
        WHERE d.id = ?
    `),
    getByStatus: db.prepare(`SELECT d.*, l.name as lead_name FROM deals d LEFT JOIN leads l ON d.lead_id = l.id WHERE d.status = ? ORDER BY d.created_at DESC`),
    getByLead: db.prepare(`SELECT * FROM deals WHERE lead_id = ? ORDER BY created_at DESC`),
    update: db.prepare(`
        UPDATE deals SET
            title = COALESCE(@title, title),
            amount = COALESCE(@amount, amount),
            status = COALESCE(@status, status),
            source = COALESCE(@source, source),
            notes = COALESCE(@notes, notes),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = @id
    `),
    updateStatus: db.prepare(`
        UPDATE deals SET status = ?, closed_at = CASE WHEN ? IN ('won','lost') THEN CURRENT_TIMESTAMP ELSE closed_at END, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `),
    delete: db.prepare(`DELETE FROM deals WHERE id = ?`),
    sumRevenue: db.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM deals WHERE status = 'won'`),
    sumRevenueByMonth: db.prepare(`SELECT strftime('%Y-%m', closed_at) as month, SUM(amount) as total FROM deals WHERE status = 'won' AND closed_at IS NOT NULL GROUP BY month ORDER BY month DESC`),
    sumBySource: db.prepare(`SELECT source, SUM(amount) as total, COUNT(*) as count FROM deals WHERE status = 'won' GROUP BY source`),
    countByStatus: db.prepare(`SELECT status, COUNT(*) as count FROM deals GROUP BY status`)
};

// Settings operations
const settingsQueries = {
    get: db.prepare(`SELECT value FROM settings WHERE key = ?`),
    set: db.prepare(`INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)`),
    getAll: db.prepare(`SELECT * FROM settings`),
    delete: db.prepare(`DELETE FROM settings WHERE key = ?`)
};

// Integration operations
const integrationQueries = {
    getAll: db.prepare(`SELECT * FROM integrations ORDER BY name`),
    getByName: db.prepare(`SELECT * FROM integrations WHERE name = ?`),
    updateEnabled: db.prepare(`UPDATE integrations SET enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE name = ?`),
    updateConfig: db.prepare(`UPDATE integrations SET config = ?, updated_at = CURRENT_TIMESTAMP WHERE name = ?`),
    upsert: db.prepare(`
        INSERT INTO integrations (name, label, icon, enabled, description, config)
        VALUES (@name, @label, @icon, @enabled, @description, @config)
        ON CONFLICT(name) DO UPDATE SET enabled=excluded.enabled, config=excluded.config, updated_at=CURRENT_TIMESTAMP
    `)
};

// Company profile operations
const companyProfileQueries = {
    get: db.prepare(`SELECT * FROM company_profile WHERE id = 1`),
    upsert: db.prepare(`
        INSERT INTO company_profile (id, name, email, phone, address, timezone)
        VALUES (1, @name, @email, @phone, @address, @timezone)
        ON CONFLICT(id) DO UPDATE SET name=excluded.name, email=excluded.email, phone=excluded.phone, address=excluded.address, timezone=excluded.timezone, updated_at=CURRENT_TIMESTAMP
    `)
};

// Notification preference operations
const notificationPrefQueries = {
    get: db.prepare(`SELECT * FROM notification_preferences WHERE id = 1`),
    upsert: db.prepare(`
        INSERT INTO notification_preferences (id, new_lead_email, new_lead_slack, meeting_reminder, meeting_reminder_minutes, weekly_summary, daily_digest)
        VALUES (1, @new_lead_email, @new_lead_slack, @meeting_reminder, @meeting_reminder_minutes, @weekly_summary, @daily_digest)
        ON CONFLICT(id) DO UPDATE SET
            new_lead_email=excluded.new_lead_email, new_lead_slack=excluded.new_lead_slack,
            meeting_reminder=excluded.meeting_reminder, meeting_reminder_minutes=excluded.meeting_reminder_minutes,
            weekly_summary=excluded.weekly_summary, daily_digest=excluded.daily_digest,
            updated_at=CURRENT_TIMESTAMP
    `)
};

// User activity log operations
const userActivityLogQueries = {
    create: db.prepare(`
        INSERT INTO user_activity_log (user_id, action, entity_type, entity_id, entity_name, metadata, ip_address)
        VALUES (@user_id, @action, @entity_type, @entity_id, @entity_name, @metadata, @ip_address)
    `),
    getRecent: db.prepare(`SELECT * FROM user_activity_log ORDER BY created_at DESC LIMIT ?`),
    getByUser: db.prepare(`SELECT * FROM user_activity_log WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`)
};

// Analytics queries (raw SQL for aggregations)
const analyticsQueries = {
    leadsOverTimeMonthly: db.prepare(`
        SELECT strftime('%Y-%m', created_at) as period, COUNT(*) as count
        FROM leads WHERE created_at >= date('now', '-6 months')
        GROUP BY period ORDER BY period
    `),
    leadsOverTimeWeekly: db.prepare(`
        SELECT strftime('%Y-W%W', created_at) as period, COUNT(*) as count
        FROM leads WHERE created_at >= date('now', '-84 days')
        GROUP BY period ORDER BY period
    `),
    leadsOverTimeDaily: db.prepare(`
        SELECT DATE(created_at) as period, COUNT(*) as count
        FROM leads WHERE created_at >= date('now', '-30 days')
        GROUP BY period ORDER BY period
    `),
    sourcePerformance: db.prepare(`
        SELECT source,
            COUNT(*) as leads,
            SUM(CASE WHEN status IN ('contacted','scheduled','converted') THEN 1 ELSE 0 END) as contacted,
            SUM(CASE WHEN status IN ('scheduled','converted') THEN 1 ELSE 0 END) as scheduled,
            SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) as converted,
            ROUND(SUM(CASE WHEN status = 'converted' THEN 1.0 ELSE 0 END) / MAX(COUNT(*), 1) * 100, 1) as conversion_rate
        FROM leads GROUP BY source ORDER BY leads DESC
    `),
    avgResponseTime: db.prepare(`
        SELECT ROUND(AVG(julianday(contacted_at) - julianday(created_at)) * 24, 1) as avg_hours
        FROM leads WHERE contacted_at IS NOT NULL
    `),
    avgDealSize: db.prepare(`
        SELECT ROUND(AVG(amount), 2) as avg_amount FROM deals WHERE status = 'won'
    `)
};

// Date-filtered analytics functions (use raw SQL for dynamic date ranges)
function getLeadsInRange(fromDate, toDate) {
    const query = `SELECT * FROM leads WHERE DATE(created_at) BETWEEN ? AND ? ORDER BY created_at DESC`;
    return db.prepare(query).all(fromDate, toDate);
}

function countLeadsInRange(fromDate, toDate) {
    const query = `SELECT COUNT(*) as total FROM leads WHERE DATE(created_at) BETWEEN ? AND ?`;
    return db.prepare(query).get(fromDate, toDate);
}

function countLeadsByStatusInRange(fromDate, toDate) {
    const query = `SELECT status, COUNT(*) as count FROM leads WHERE DATE(created_at) BETWEEN ? AND ? GROUP BY status`;
    return db.prepare(query).all(fromDate, toDate);
}

function getLeadsOverTimeInRange(fromDate, toDate) {
    // Calculate appropriate grouping based on date range
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    let query;
    if (diffDays <= 14) {
        // Daily for short ranges
        query = `SELECT DATE(created_at) as period, COUNT(*) as count
                 FROM leads WHERE DATE(created_at) BETWEEN ? AND ?
                 GROUP BY period ORDER BY period`;
    } else if (diffDays <= 90) {
        // Weekly for medium ranges
        query = `SELECT strftime('%Y-W%W', created_at) as period, COUNT(*) as count
                 FROM leads WHERE DATE(created_at) BETWEEN ? AND ?
                 GROUP BY period ORDER BY period`;
    } else {
        // Monthly for long ranges
        query = `SELECT strftime('%Y-%m', created_at) as period, COUNT(*) as count
                 FROM leads WHERE DATE(created_at) BETWEEN ? AND ?
                 GROUP BY period ORDER BY period`;
    }
    return db.prepare(query).all(fromDate, toDate);
}

function getSourcePerformanceInRange(fromDate, toDate) {
    const query = `SELECT source,
        COUNT(*) as leads,
        SUM(CASE WHEN status IN ('contacted','scheduled','converted') THEN 1 ELSE 0 END) as contacted,
        SUM(CASE WHEN status IN ('scheduled','converted') THEN 1 ELSE 0 END) as scheduled,
        SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) as converted,
        ROUND(SUM(CASE WHEN status = 'converted' THEN 1.0 ELSE 0 END) / MAX(COUNT(*), 1) * 100, 1) as conversion_rate
    FROM leads WHERE DATE(created_at) BETWEEN ? AND ? GROUP BY source ORDER BY leads DESC`;
    return db.prepare(query).all(fromDate, toDate);
}

function getRevenueInRange(fromDate, toDate) {
    const query = `SELECT COALESCE(SUM(amount), 0) as total FROM deals WHERE status = 'won' AND DATE(closed_at) BETWEEN ? AND ?`;
    return db.prepare(query).get(fromDate, toDate);
}

function getMeetingsInRange(fromDate, toDate) {
    const query = `SELECT status, COUNT(*) as count FROM meetings WHERE DATE(start_time) BETWEEN ? AND ? GROUP BY status`;
    return db.prepare(query).all(fromDate, toDate);
}

function getCostsInRange(fromDate, toDate) {
    // Costs are tracked by month, so we need to match months that fall within the date range
    const query = `SELECT COALESCE(SUM(amount), 0) as total FROM costs WHERE month >= substr(?, 1, 7) AND month <= substr(?, 1, 7)`;
    return db.prepare(query).get(fromDate, toDate);
}

function getLeadsByStatusInRange(status, fromDate, toDate) {
    const query = `SELECT * FROM leads WHERE status = ? AND DATE(created_at) BETWEEN ? AND ? ORDER BY created_at DESC`;
    return db.prepare(query).all(status, fromDate, toDate);
}

// Export
module.exports = {
    db,
    initializeDatabase,
    leads: leadQueries,
    activities: activityQueries,
    users: userQueries,
    meetings: meetingQueries,
    costs: costQueries,
    deals: dealQueries,
    settings: settingsQueries,
    integrations: integrationQueries,
    companyProfile: companyProfileQueries,
    notificationPrefs: notificationPrefQueries,
    userActivityLog: userActivityLogQueries,
    analytics: analyticsQueries,
    // Date-filtered analytics
    dateFiltered: {
        getLeadsInRange,
        countLeadsInRange,
        countLeadsByStatusInRange,
        getLeadsByStatusInRange,
        getLeadsOverTimeInRange,
        getSourcePerformanceInRange,
        getRevenueInRange,
        getMeetingsInRange,
        getCostsInRange
    }
};
