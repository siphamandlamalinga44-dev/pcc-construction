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

4. **Use HTTPS** — put the app behind a TLS-terminating reverse proxy (most
   hosts do this automatically).

---

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

## Option 2: Railway (simplest)

1. Create an account at [railway.com](https://railway.com) and link your repo
   (or use the CLI: `railway init && railway up`).
2. Railway auto-detects Node and deploys — no build/start commands needed
   (it uses the `start` script from `package.json`).
3. Add SMTP variables under **Variables**.
4. You get an instant `*.up.railway.app` HTTPS URL.
5. ⚠️ Railway is also ephemeral — keep `data/` backed up or mirror it to a
   volume/object store.

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

---

## After deployment

- Verify: open the public site, log into `/admin`, submit a test contact
  form, confirm the message appears in Admin → Messages (and your email if
  SMTP is configured).
- Change the admin password to your own from Admin → Password.
