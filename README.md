# PCC – Philip Chauke Construction — Fullstack Website

A fullstack website for a construction company, built with **Node.js + Express + EJS**.
It comes with a built-in **admin CMS** so you can change anything on the site without
touching code.

## What's included

**Public website**
- Home (hero, stats, services preview, projects preview, CTA)
- About page
- Services page
- Projects gallery (filterable by category, supports project images)
- Contact page with a working enquiry form (messages are saved)

**Admin CMS (`/admin`)** — login-protected
- **Dashboard** — overview of everything you can edit
- **Website Text** — company details, hero, home stats, about paragraphs, contact info, footer
- **Services** — add / edit / delete services
- **Projects** — add / edit / delete projects, upload project images or paste an image URL
- **Messages** — read and delete enquiries from the contact form
- **Password** — change the admin login password

**Email notifications (optional)**
- The contact form emails you each new enquiry when SMTP is configured
  (see `DEPLOY.md` for the environment variables). Without SMTP configured,
  enquiries are simply saved and visible in the admin Messages page.

## How to run

```bash
cd construction-website
npm install
npm start
```

Then open:
- Website: http://localhost:3000
- Admin: http://localhost:3000/admin

**Admin password:** the password was set when the site was built. Change it anytime
from Admin -> Password, or from the command line:

```bash
node set-password.js "your-new-password"
```

(restart the server after using the command-line option)

## How "changing whatever I want" works

- Everything editable (all text, services, projects, images) is stored in
  `data/content.json`.
- Admin edits are saved to that file and go live instantly on the website — no
  restart needed, no code edits required.
- Contact-form enquiries are stored in `data/messages.json` and readable from the
  admin Messages page.
- The admin password (scrypt-hashed) is stored in `data/admin.json`.

You can also edit `data/content.json` directly while the server is running; the
next page load picks it up.

## Project structure

```
construction-website/
├── server.js            # Express server, API routes, admin CMS
├── package.json
├── data/
│   ├── content.json     # all editable website content
│   ├── messages.json    # contact form submissions
│   └── admin.json       # admin password hash
├── views/
│   ├── partials/        # shared header / footer
│   ├── home.ejs, about.ejs, services.ejs, projects.ejs, contact.ejs, 404.ejs
│   └── admin/           # admin CMS pages
└── public/
    ├── css/style.css
    └── js/admin.js
```

## 📹 Videos

- **Per project**: each project can have an optional video (`/admin/projects`).
- **Dedicated Videos page** at `/videos`, fully manageable in `/admin/videos`.

**Supported video sources** (add in the admin form):
1. **YouTube** — paste the full link, e.g. `https://www.youtube.com/watch?v=...`
2. **Vimeo** — paste the full link, e.g. `https://vimeo.com/123456789`
3. **Direct video file** — an `.mp4` / `.webm` / `.ogg` link
4. **File upload** — click "Choose video file" in the admin form (up to 20 MB; the file is stored in the page data)

When a project or video has no video, nothing extra is shown.

