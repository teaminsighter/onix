# ONIX Client Handover Checklist

This document lists everything the client must provide or configure before the site goes fully live.

---

## 1. Required Assets (provide to developer)

### Favicon
- **Format:** PNG, 32x32px minimum (ideally also 16x16 and 180x180 for Apple)
- **Where it goes:** `public/images/favicon.png`
- **Status:** [ ] Not provided

### Open Graph Image (social media preview)
- **Format:** PNG, 1200x630px
- **Where it goes:** `public/images/og-image.png`
- **Status:** [ ] Not provided

---

## 2. Third-Party Accounts (provide IDs to developer)

### Calendly
- **Current:** Placeholder URL (someone else's account)
- **Needed:** Your Calendly scheduling link
- **File to update:** `index.html` line 864
- **Status:** [ ] Not provided

### Google Analytics 4
- **Needed:** GA4 Measurement ID (format: `G-XXXXXXXXXX`)
- **File to update:** `js/analytics.js` line 12
- **Status:** [ ] Not provided

### Google Tag Manager (optional)
- **Needed:** GTM Container ID (format: `GTM-XXXXXXX`)
- **File to update:** `js/analytics.js` line 15
- **Status:** [ ] Not configured

### Facebook Pixel (optional)
- **Needed:** Pixel ID
- **File to update:** `js/analytics.js` line 18
- **Status:** [ ] Not configured

### Microsoft Clarity (optional, free)
- **Needed:** Project ID from clarity.microsoft.com
- **File to update:** `js/analytics.js` line 21
- **Status:** [ ] Not configured

---

## 3. Domain & DNS

### Domain
- **Expected:** `onixmrkt.com`
- **Required DNS records:** A record pointing to Hostinger VPS IP address
- **Status:** [ ] DNS configured

### SSL
- Handled automatically by Coolify (Let's Encrypt)
- **Status:** [ ] Auto-configured on deploy

---

## 4. Production Secrets (set in Coolify environment)

Generate these before deployment:

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate webhook secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

| Variable | Description | Status |
|----------|-------------|--------|
| `JWT_SECRET` | 64-char hex string (generated above) | [ ] Set |
| `WEBHOOK_SECRET` | 64-char hex string (generated above) | [ ] Set |
| `ADMIN_USERNAME` | Admin login username | [ ] Set |
| `ADMIN_PASSWORD` | Strong admin password | [ ] Set |

---

## 5. Email Notifications (optional)

If you want email alerts when new leads come in:

| Variable | Description |
|----------|-------------|
| `SMTP_HOST` | Email server (e.g., smtp.gmail.com) |
| `SMTP_PORT` | Usually 587 |
| `SMTP_USER` | Email address |
| `SMTP_PASS` | Email password or app password |
| `NOTIFICATION_EMAIL` | Where to receive alerts |

---

## 6. Coolify Deployment Steps

1. **Install Coolify** on Hostinger VPS (follow https://coolify.io/docs/installation)
2. **Create new Application** in Coolify dashboard
3. **Connect git repository** — point to this repo
4. **Set Dockerfile path** to `admin/Dockerfile`
5. **Set build context** to repository root (`.`)
6. **Add environment variables** from Section 4 above
7. **Add persistent volume:** mount at `/data` (for SQLite database)
8. **Set domain** to `onixmrkt.com`
9. **Enable HTTPS** (automatic with Coolify)
10. **Deploy**

### Post-Deployment Verification

- [ ] Homepage loads at `https://onixmrkt.com`
- [ ] Admin login works at `https://onixmrkt.com/login`
- [ ] Contact form submits and creates lead in admin dashboard
- [ ] Calendly widget loads (after URL is updated)
- [ ] All service pages accessible
- [ ] HTTPS active (padlock in browser)
- [ ] Favicon appears in browser tab

---

## 7. Ongoing Maintenance

### Database Backups
SQLite database is stored in the Docker volume at `/data/onix.db`. Set up a backup cron:

```bash
# Add to VPS crontab (runs daily at 2am)
0 2 * * * docker cp onix:/data/onix.db /backups/onix-$(date +\%Y\%m\%d).db
```

### Updating the Site
Push changes to git, then redeploy from Coolify dashboard (or enable auto-deploy).

### Admin Password Change
Update `ADMIN_PASSWORD` in Coolify environment variables, delete the existing admin user from the database, and restart the container. A new user will be created on startup.
