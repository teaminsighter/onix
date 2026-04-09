# ONIX Deployment Guide

This guide covers deploying the ONIX website and admin panel to Hostinger.

## Prerequisites

- Hostinger account with:
  - Web Hosting (for static site) OR
  - VPS (for admin panel + static site)
- Domain name configured
- SSL certificate (free with Hostinger)

---

## Part 1: Static Website Deployment

### Option A: Hostinger Shared Hosting (Recommended for static site only)

1. **Build the website:**
   ```bash
   npm install
   npm run build
   ```

2. **Upload to Hostinger:**
   - Log into Hostinger hPanel
   - Go to Files → File Manager
   - Navigate to `public_html`
   - Delete existing files (if any)
   - Upload contents of `dist/` folder
   - Upload `.htaccess` from `public/` folder

3. **Configure domain:**
   - In hPanel, go to Domains
   - Point your domain to the hosting
   - Enable SSL certificate

### Option B: Hostinger VPS (For both static site + admin panel)

See Part 2 below.

---

## Part 2: Admin Panel Deployment (VPS Required)

### Step 1: Prepare VPS

1. **Order Hostinger VPS** (KVM 1 or higher recommended)

2. **Connect via SSH:**
   ```bash
   ssh root@your-vps-ip
   ```

3. **Install Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Install PM2 (process manager):**
   ```bash
   npm install -g pm2
   ```

5. **Install Nginx:**
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

### Step 2: Deploy Static Site

1. **Create web directory:**
   ```bash
   sudo mkdir -p /var/www/onixmrkt.com
   ```

2. **Upload built files:**
   - Use SFTP to upload `dist/` contents to `/var/www/onixmrkt.com`
   - Or use Git:
     ```bash
     cd /var/www/onixmrkt.com
     git clone your-repo .
     npm install
     npm run build
     cp -r dist/* .
     ```

### Step 3: Deploy Admin Panel

1. **Create admin directory:**
   ```bash
   sudo mkdir -p /var/www/admin.onixmrkt.com
   cd /var/www/admin.onixmrkt.com
   ```

2. **Upload admin files:**
   ```bash
   # Copy admin/ folder contents here
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Create environment file:**
   ```bash
   cp .env.example .env
   nano .env
   ```

   Update these values:
   ```env
   PORT=3001
   NODE_ENV=production
   JWT_SECRET=your-very-long-random-secret-key-here
   ADMIN_USERNAME=your-admin-username
   ADMIN_PASSWORD=your-secure-password
   CORS_ORIGIN=https://onixmrkt.com,https://admin.onixmrkt.com
   ```

5. **Start with PM2:**
   ```bash
   pm2 start src/server.js --name "onix-admin"
   pm2 save
   pm2 startup
   ```

### Step 4: Configure Nginx

1. **Create Nginx config:**
   ```bash
   sudo nano /etc/nginx/sites-available/onixmrkt.com
   ```

2. **Add configuration:**
   ```nginx
   # Main website
   server {
       listen 80;
       server_name onixmrkt.com www.onixmrkt.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name onixmrkt.com www.onixmrkt.com;

       ssl_certificate /etc/letsencrypt/live/onixmrkt.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/onixmrkt.com/privkey.pem;

       root /var/www/onixmrkt.com;
       index index.html;

       # Security headers
       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header X-XSS-Protection "1; mode=block" always;

       # Gzip compression
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }

   # Admin panel
   server {
       listen 80;
       server_name admin.onixmrkt.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name admin.onixmrkt.com;

       ssl_certificate /etc/letsencrypt/live/admin.onixmrkt.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/admin.onixmrkt.com/privkey.pem;

       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Enable site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/onixmrkt.com /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Step 5: SSL Certificates

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d onixmrkt.com -d www.onixmrkt.com -d admin.onixmrkt.com
```

---

## Part 3: Form Integration

### Option A: Use Admin Panel Webhooks

Update `js/form-handler.js`:
```javascript
FORMSPREE_ENDPOINT: 'https://admin.onixmrkt.com/api/webhook/lead'
```

### Option B: Use Formspree (Simpler)

1. Create account at formspree.io
2. Get your form ID
3. Update `js/form-handler.js`:
   ```javascript
   FORMSPREE_ENDPOINT: 'https://formspree.io/f/YOUR-FORM-ID'
   ```

---

## Part 4: Analytics Setup

1. **Google Analytics 4:**
   - Create GA4 property at analytics.google.com
   - Get Measurement ID (G-XXXXXXXXXX)
   - Update `js/analytics.js`

2. **Google Tag Manager (optional):**
   - Create container at tagmanager.google.com
   - Get Container ID (GTM-XXXXXXX)
   - Update `js/analytics.js`

3. **Facebook Pixel (optional):**
   - Create pixel at business.facebook.com
   - Get Pixel ID
   - Update `js/analytics.js`

4. **Microsoft Clarity (recommended - free):**
   - Create project at clarity.microsoft.com
   - Get Project ID
   - Update `js/analytics.js`

---

## Part 5: Post-Deployment Checklist

- [ ] Website loads with HTTPS
- [ ] All pages render correctly
- [ ] Contact form submits successfully
- [ ] Calendly widget loads
- [ ] Cookie consent banner appears
- [ ] Analytics tracking works (check real-time in GA4)
- [ ] Admin panel accessible at admin.onixmrkt.com
- [ ] Admin login works
- [ ] Leads appear in admin after form submission
- [ ] Legal pages accessible
- [ ] robots.txt accessible at /robots.txt
- [ ] sitemap.xml accessible at /sitemap.xml

---

## Maintenance

### Rebuild static site:
```bash
cd /var/www/onixmrkt.com
git pull
npm run build
cp -r dist/* .
```

### Restart admin panel:
```bash
pm2 restart onix-admin
```

### View admin logs:
```bash
pm2 logs onix-admin
```

### Backup database:
```bash
cp /var/www/admin.onixmrkt.com/data/onix.db ~/backups/onix-$(date +%Y%m%d).db
```

---

## Troubleshooting

### Admin panel not starting
```bash
cd /var/www/admin.onixmrkt.com
pm2 logs onix-admin --lines 50
```

### 502 Bad Gateway
- Check if Node.js process is running: `pm2 status`
- Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

### Forms not submitting
- Check browser console for errors
- Verify CORS settings in admin `.env`
- Test endpoint: `curl -X POST https://admin.onixmrkt.com/api/webhook/lead`

---

## Support

For issues, check:
- Hostinger Knowledge Base
- PM2 documentation: https://pm2.keymetrics.io/docs/
- Nginx documentation: https://nginx.org/en/docs/
