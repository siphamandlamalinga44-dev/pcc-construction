# PC Chauke Construction and Projects CC — Fullstack Website

A fullstack website for a construction company, built with **Node.js + Express + EJS**.
It comes with a built-in **admin CMS** so you can change anything on the site without
touching code.

## What's included

**Public website**
- Home (hero, welcome video, stats, services preview, projects preview, testimonials, CTA)
- About page (story + team section)
- Services page
- Projects gallery (filterable by category, large images, click-to-zoom lightbox,
  optional video per project)
- Videos page (welcome video + any project videos)
- Contact page with a working enquiry form (service, budget, timeline + message)
- WhatsApp floating chat button on every page
- Footer with social-media icons and a SARS-registered badge
- SEO basics: meta description, Open Graph tags, sitemap.xml, robots.txt

**Admin CMS (`/admin`)** — login-protected
- **Dashboard** — overview of everything you can edit
- **Website Text** — company details (incl. WhatsApp number), hero, home stats,
  about paragraphs + team, contact info, footer, SEO meta description
- **Services** — add / edit / delete services
- **Projects** — add / edit / delete projects, upload project images or paste an
  image URL, attach a video
- **Videos** — manage the videos shown on the Videos page and on project cards
- **Testimonials** — manage client reviews shown on the homepage
- **Messages** — read and delete enquiries from the contact form
- **Email Settings** — configure SMTP so new enquiries email you directly
- **Password** — change the admin login password

**Email notifications (optional)**
- The contact form emails you each new enquiry when SMTP is configured — either
  via environment variables (see `DEPLOY.md`) or via **Admin → Email Settings**.
  Without SMTP configured, enquiries are simply saved and visible in the admin
  Messages page.

## How to run

```bash
cd construction-website
npm install
npm start
```

Then open:
- Website: http://localhost:3000
- Admin: http://localhost:3000/admin

**Admin password:** set via the `ADMIN_PASSWORD` environment variable (pinned on
Render), or change it anytime from Admin → Password, or from the command line:

```bash
node set-password.js "your-new-password"
```

(restart the server after using the command-line option)

## How "changing whatever I want" works

- Everything editable (all text, services, projects, images, testimonials, videos)
  is stored in `data/content.json`.
- Admin edits are saved to that file and go live instantly on the website — no
  restart needed, no code edits required.
- Contact-form enquiries are stored in `data/messages.json` and readable from the
  admin Messages page.
- The admin password (scrypt-hashed) is stored in `data/admin.json`.
- SMTP settings (if used) are stored in `data/settings.json`.

You can also edit `data/content.json` directly while the server is running; the
next page load picks it up.

## Persistent storage (Render)

On Render the free filesystem is ephemeral — admin edits would be lost on
redeploy. To keep them, attach a persistent disk:

1. In the Render dashboard open the service and go to **Disks → Add disk**
   (name `pcc-data`, mount path `/var/data`, size 1 GB+). This requires a payment
   card on the Render account.
2. Add the environment variable **`DATA_DIR` = `/var/data`** to the service.
3. Redeploy — the server automatically seeds the disk with your committed
   content on first boot, then persists every admin edit.

## Project structure

```
construction-website/
├── server.js            # Express server, API routes, admin CMS
├── package.json
├── data/
│   ├── content.json     # all editable website content
│   ├── messages.json    # contact form submissions
│   ├── settings.json    # SMTP settings (admin-managed)
│   └── admin.json       # admin password hash
├── views/
│   ├── partials/        # shared header / footer
│   ├── home.ejs, about.ejs, services.ejs, projects.ejs, videos.ejs,
│   │   contact.ejs, 404.ejs
│   └── admin/           # admin CMS pages
└── public/
    ├── css/style.css
    ├── js/admin.js
    ├── images/          # team photo and other static images
    └── videos/          # welcome.mp4 etc.
```

## 📹 Videos

- **Per project**: each project can have an optional video (`/admin/projects`).
- **Dedicated Videos page** at `/videos`, fully manageable in `/admin/videos`.
- The **welcome video** (built and hosted in `public/videos/welcome.mp4`) plays on
  the homepage for every visitor.

**Supported video sources** (add in the admin form):
1. **YouTube** — paste the full link, e.g. `https://www.youtube.com/watch?v=...`
2. **Vimeo** — paste the full link, e.g. `https://vimeo.com/123456789`
3. **Direct video file** — an `.mp4` / `.webm` / `.ogg` link
4. **File upload** — click "Choose video file" in the admin form (up to 20 MB;
   the file is stored in the page data)

When a project or video has no video, nothing extra is shown.

## 🔗 Domain

See `DOMAIN.md` for choosing and registering a `.co.za` domain, pointing it at
Render, setting up business email, and claiming your Google Business Profile.
