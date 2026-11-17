# Deployment Guide

The site is a standard Node.js app — it can be deployed to any Node-capable
host. Before launching, complete the checklist below, then pick one of the
deployment options.

## Pre-launch checklist

1. **Set a strong admin password**
   ```bash
   node set-password.js "your-strong-password"
   ```
   Restart the server after running this. (You can also change it in
   Admin → Password.)

2. **Configure email notifications (optional but recommended)**
   The contact form can email you each new enquiry. Set these environment
   variables on the host:

   | Variable | Example | Required |
   |---|---|---|
   | `SMTP_HOST` | `smtp.mailtrap.io` | To enable email |
   | `SMTP_PORT` | `587` | No (default `587`) |
   | `SMTP_USER` | `you@example.com` | To enable email |
   | `SMTP_PASS` | `your-app-password` | To enable email |
   | `MAIL_FROM` | `you@example.com` | No (falls back to SMTP_USER) |
   | `MAIL_TO` | `you@example.com` | No (falls back to SMTP_USER) |

   Without these, enquiries are still saved and visible in the admin
   Messages page — email is a bonus, not a requirement.

3. **Back up your data** — all editable content lives in `data/`
   (`content.json`, `messages.json`, `admin.json`). Back it up regularly.

4. **Use HTTPS** — Railway and Render provide this automatically.

---

## Option 2: Railway (simplest)

The project already includes `railway.toml`, so the build, start command and
health check are configured automatically.

### Method A — deploy with the CLI (recommended)

1. Install the Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```
2. In the project folder, run:
   ```bash
   railway up
   ```
   Railway signs you in via your browser, creates the project and service,
   and deploys. You get an instant `*.up.railway.app` HTTPS URL.
3. Add SMTP variables (optional):
   ```bash
   railway variables set SMTP_HOST=smtp.example.com
   railway variables set SMTP_PORT=587
   railway variables set SMTP_USER=you@example.com
   railway variables set SMTP_PASS=your-app-password
   railway variables set MAIL_TO=you@example.com
   ```

### Method B — fully non-interactive (token)

For headless/agent deployments, generate an account token in Railway →
**Account Settings → Tokens** and use it as an environment variable:

```bash
RAILWAY_API_TOKEN=your-token railway up -y
```

You can revoke the token in the same Tokens page after deployment.

### After deploying on Railway

- Railway sets the `PORT` environment variable automatically — the app
  listens on it, no config needed.
- ⚠️ **Data persistence:** Railway's filesystem is ephemeral — your `data/`
  edits are lost on restarts/redeploys. For production, attach a **Volume**
  (Railway → Service → Storage) mounted at `/app/data`, or re-enter content
  after redeploys.

## Option 1: Render (free tier available)

1. Create an account at [render.com](https://render.com) and click **New →
   Web Service**.
2. Connect your Git repository (or upload the project folder as a zip).
3. Set:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
4. In **Environment**, add any SMTP variables from the table above.
5. Deploy. Render gives you a `*.onrender.com` URL with automatic HTTPS.
6. ⚠️ Render's free tier has **ephemeral storage** — your `data/` edits are
   lost if the instance restarts. Add a **persistent disk** (type: standard,
   mount at `/app/data` — or wherever the repo's `data/` directory is) or
   re-enter content after restarts.

## Option 3: Vultr / any VPS (full control, cheapest long-term)

1. Create a VPS (Ubuntu 22.04+, 1 vCPU is enough).
2. On the server:
   ```bash
   sudo apt update && sudo apt install -y nodejs npm git
   # Node 20+ is preferred; install from NodeSource if needed
   git clone <your-repo> /var/www/construction-site   # or upload the files
   cd /var/www/construction-site
   npm install --omit=dev
   npm i -g pm2
   pm2 start server.js --name construction-site
   pm2 save && pm2 startup    # auto-restart on boot
   ```
3. Put it behind **Caddy** for free HTTPS (one config line):
   ```
   yourdomain.com {
       reverse_proxy localhost:3000
   }
   ```
4. Set SMTP variables as process env for the PM2 process:
   `pm2 start server.js --name construction-site --env production` with
   env vars defined in `pm2 ecosystem` or your shell profile.
5. Back up regularly:
   ```bash
   cp -r /var/www/construction-site/data /var/www/backups/data-$(date +%F)
   ```

## After deployment

- Verify: open the public site, log into `/admin`, submit a test contact
  form, confirm the message appears in Admin → Messages (and your email if
  SMTP is configured).
- Change the admin password to your own from Admin → Password.
