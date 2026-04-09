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
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

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

    // Update users table with additional fields if not exist
    db.exec(`
        CREATE TABLE IF NOT EXISTS users_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            full_name TEXT,
            email TEXT,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'sales',
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME
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
    `);

    console.log('✅ Database initialized with all schemas');
}

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

// Export
module.exports = {
    db,
    initializeDatabase,
    leads: leadQueries,
    activities: activityQueries,
    users: userQueries
};
