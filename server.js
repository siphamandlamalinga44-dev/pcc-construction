const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, 'data');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const ADMIN_FILE = path.join(DATA_DIR, 'admin.json');
const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours

// ---------------------------------------------------------------- data layer
function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadJSON(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return fallback;
  }
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function newId() {
  return crypto.randomUUID();
}

function defaultContent() {
  return {
    site: {
      companyName: 'Granite Peak Construction',
      tagline: 'Building Strength, Delivering Excellence',
      phone: '+27 11 555 0198',
      email: 'hello@granitepeak.co.za',
      address: '12 Foundry Road, Germiston, Gauteng, 2040',
      established: '2009'
    },
    hero: {
      title: "Building South Africa's Future, One Foundation at a Time",
      subtitle:
        'From civil works to complete turnkey construction, we deliver durable, on-time, on-budget projects across Gauteng and beyond.',
      ctaText: 'Get a Free Quote'
    },
    home: {
      aboutPreview:
        'For over 15 years, Granite Peak Construction has delivered complex building and civil projects with uncompromising quality and service.',
      stats: [
        { value: '15+', label: 'Years in Business' },
        { value: '320+', label: 'Projects Delivered' },
        { value: '98%', label: 'Client Satisfaction' },
        { value: '40+', label: 'Expert Crew' }
      ],
      whyChooseUs: [
        {
          title: 'On-Time Delivery',
          text: 'Tight scheduling and solid project management keep every build on track, every time.'
        },
        {
          title: 'Quality First',
          text: 'We use premium materials and strict workmanship standards, so results last for decades.'
        },
        {
          title: 'Transparent Pricing',
          text: 'Clear quotes with no hidden costs — you always know exactly where your money goes.'
        }
      ]
    },
    about: {
      body: [
        'Granite Peak Construction was founded in 2009 with a single belief: that every structure should be built to outlast trends, weather, and time. What started as a small crew of three has grown into a full-service construction partner working across Gauteng.',
        'We handle the full lifecycle of a project — planning, earthworks, civil works, structural building, finishes, and handover — which means one accountable team from foundation to final inspection.',
        'Our work spans commercial office blocks, industrial warehouses, residential developments, and municipal infrastructure. No matter the scale, we apply the same disciplined standards to every site.'
      ]
    },
    services: [
      {
        id: newId(),
        icon: '🏗️',
        title: 'Civil & Infrastructure Works',
        description:
          'Roads, drainage, earthworks and site preparation — the solid ground every project stands on.'
      },
      {
        id: newId(),
        icon: '🏢',
        title: 'Commercial Construction',
        description:
          'Office blocks, retail spaces and mixed-use developments built to spec and on schedule.'
      },
      {
        id: newId(),
        icon: '🏠',
        title: 'Residential Building',
        description:
          'From individual homes to multi-unit housing estates with turnkey finishing and handover.'
      },
      {
        id: newId(),
        icon: '🏭',
        title: 'Industrial & Warehouses',
        description:
          'Heavy-duty structures, warehouses and factory builds engineered for heavy use.'
      },
      {
        id: newId(),
        icon: '🛠️',
        title: 'Renovations & Alterations',
        description:
          'Retrofits, extensions and modernisations that give existing buildings a new lease on life.'
      },
      {
        id: newId(),
        icon: '📋',
        title: 'Project Management',
        description:
          'End-to-end planning, budgeting and site supervision with transparent reporting.'
      }
    ],
    projects: [
      {
        id: newId(),
        title: 'Randburg Corporate Office Block',
        category: 'Commercial',
        date: '2024',
        description:
          'A five-storey office development delivered on schedule with energy-efficient glazing and modern interiors.',
        image: '',
        video: ''
      },
      {
        id: newId(),
        title: 'East Rand Logistics Warehouse',
        category: 'Industrial',
        date: '2023',
        description:
          'A 12,000 m² distribution warehouse with heavy-duty flooring and automated loading bays.',
        image: '',
        video: ''
      },
      {
        id: newId(),
        title: 'Midrand Residential Estate',
        category: 'Residential',
        date: '2023',
        description:
          'A 48-unit secure estate with finishes and landscaping completed to a high standard.',
        image: '',
        video: ''
      },
      {
        id: newId(),
        title: 'City of Joburg Road Upgrade',
        category: 'Infrastructure',
        date: '2022',
        description:
          'Dual-lane road resurfacing and stormwater drainage for a major municipal corridor.',
        image: '',
        video: ''
      }
    ],
    videos: [
      {
        id: newId(),
        title: 'Sample Project Video',
        description: 'This is a sample video entry - replace it with your own videos in the admin panel.',
        video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      }
    ],
    contact: {
      intro:
        'Have a project in mind? Send us your details and we will get back to you within one business day with a free, no-obligation quote.',
      hours: 'Office hours: Monday – Friday, 07:30 – 17:00'
    },
    footer: {
      text:
        'PCC – Philip Chauke Construction — trusted building, renovation and maintenance services across Gauteng.',
      copyright: '© 2026 PCC – Philip Chauke Construction. All rights reserved.'
    }
  };
}

ensureDataFiles();

let content = loadJSON(CONTENT_FILE, null);
if (!content) {
  content = defaultContent();
  saveJSON(CONTENT_FILE, content);
}
if (!Array.isArray(content.videos)) content.videos = [];
let messages = loadJSON(MESSAGES_FILE, []);

let admin = loadJSON(ADMIN_FILE, null);
if (!admin) {
  const salt = crypto.randomBytes(16).toString('hex');
  const initialPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(12).toString('base64url');
  admin = { salt, hash: hashPassword(initialPassword, salt) };
  saveJSON(ADMIN_FILE, admin);
  if (process.env.ADMIN_PASSWORD) {
    console.log('[admin] Admin account created from ADMIN_PASSWORD env var.');
  } else {
    console.log('[admin] Admin account created. Password: ' + initialPassword);
  }
}

// ------------------------------------------------------------- email notifications
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST) return null;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined
  });
  return transporter;
}

async function sendEnquiryEmail(msg) {
  const t = getTransporter();
  if (!t) {
    console.log(`[email] SMTP not configured - enquiry from ${msg.name} (${msg.email}) saved to admin only.`);
    return;
  }
  try {
    await t.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: process.env.MAIL_TO || process.env.SMTP_USER,
      subject: `New website enquiry from ${msg.name}`,
      text:
        `New enquiry via the website contact form\n\n` +
        `Name: ${msg.name}\n` +
        `Email: ${msg.email}\n` +
        `Phone: ${msg.phone || '-'}\n\n` +
        `Message:\n${msg.message}`
    });
    console.log(`[email] Notification sent for enquiry from ${msg.name}.`);
  } catch (e) {
    console.error(`[email] Failed to send notification for ${msg.name}:`, e.message);
  }
}

// ------------------------------------------------------------- password utils
function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function verifyPassword(password, salt, hash) {
  const a = Buffer.from(hashPassword(password, salt), 'hex');
  const b = Buffer.from(hash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// -------------------------------------------------------------- session utils
const sessions = new Map();

function parseCookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach((part) => {
    const i = part.indexOf('=');
    if (i > -1) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

function getSession(req) {
  const sid = parseCookies(req).sid;
  if (sid && sessions.has(sid)) {
    const s = sessions.get(sid);
    if (s.expires > Date.now()) return s;
    sessions.delete(sid);
  }
  return null;
}

function createSession(res) {
  const sid = crypto.randomBytes(32).toString('hex');
  sessions.set(sid, { expires: Date.now() + SESSION_TTL_MS, flash: [] });
  res.cookie('sid', sid, { httpOnly: true, sameSite: 'lax' });
}

function destroySession(req, res) {
  const sid = parseCookies(req).sid;
  if (sid) sessions.delete(sid);
  res.clearCookie('sid');
}

function flash(req, type, msg) {
  if (req.session) req.session.flash.push({ type, msg });
}

function takeFlash(req) {
  if (!req.session) return [];
  const f = req.session.flash;
  req.session.flash = [];
  return f;
}

// ------------------------------------------------------------ basic middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/videos', express.static(path.join(__dirname, 'public/videos'), { redirect: false }));

app.use((req, res, next) => {
  req.session = getSession(req);
  res.locals.content = content;
  res.locals.flash = takeFlash(req);
  next();
});

// ------------------------------------------------------------- public pages
function render(res, view, extra = {}) {
  res.render(view, { title: '', ...extra });
}

app.get('/', (req, res) => render(res, 'home', { title: 'Home' }));
app.get('/about', (req, res) => render(res, 'about', { title: 'About Us' }));
app.get('/services', (req, res) => render(res, 'services', { title: 'Services' }));
app.get('/projects', (req, res) => render(res, 'projects', { title: 'Projects' }));
app.get('/videos', (req, res) => render(res, 'videos', { title: 'Videos' }));

app.get('/contact', (req, res) =>
  render(res, 'contact', { title: 'Contact Us', sent: req.query.sent === '1' })
);

app.post('/contact', (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !message) {
    return res.redirect('/contact?sent=error');
  }
  messages.push({
    id: newId(),
    name,
    email,
    phone: phone || '',
    message,
    date: new Date().toISOString()
  });
  saveJSON(MESSAGES_FILE, messages);
  sendEnquiryEmail({ name, email, phone: phone || '', message }).catch(() => {});
  res.redirect('/contact?sent=1');
});

// ------------------------------------------------------------- admin: auth
app.get('/admin/login', (req, res) => {
  if (req.session) return res.redirect('/admin');
  res.render('admin/login', { title: 'Admin Login', error: null });
});

app.post('/admin/login', (req, res) => {
  const password = req.body.password || '';
  if (verifyPassword(password, admin.salt, admin.hash)) {
    createSession(res);
    return res.redirect('/admin');
  }
  res.render('admin/login', { title: 'Admin Login', error: 'Incorrect password. Please try again.' });
});

app.post('/admin/logout', (req, res) => {
  destroySession(req, res);
  res.redirect('/admin/login');
});

function requireAdmin(req, res, next) {
  if (!req.session) return res.redirect('/admin/login');
  next();
}

// ------------------------------------------------------------- admin: dashboard
app.get('/admin', requireAdmin, (req, res) => {
  res.render('admin/index', {
    title: 'Admin Dashboard',
    counts: {
      services: content.services.length,
      projects: content.projects.length,
      messages: messages.length
    }
  });
});

// ------------------------------------------------------------- admin: content
app.get('/admin/content', requireAdmin, (req, res) => {
  res.render('admin/content', { title: 'Edit Website Text' });
});

app.post('/admin/content', requireAdmin, (req, res) => {
  const c = req.body;
  const set = (obj, key, val) => {
    if (val !== undefined) obj[key] = val;
  };

  set(content.site, 'companyName', c['site.companyName']);
  set(content.site, 'tagline', c['site.tagline']);
  set(content.site, 'phone', c['site.phone']);
  set(content.site, 'email', c['site.email']);
  set(content.site, 'address', c['site.address']);
  set(content.site, 'established', c['site.established']);

  set(content.hero, 'title', c['hero.title']);
  set(content.hero, 'subtitle', c['hero.subtitle']);
  set(content.hero, 'ctaText', c['hero.ctaText']);

  set(content.home, 'aboutPreview', c['home.aboutPreview']);

  for (let i = 1; i <= 4; i++) {
    content.home.stats[i - 1] = {
      value: c['stat.value' + i] || '',
      label: c['stat.label' + i] || ''
    };
  }

  for (let i = 1; i <= 3; i++) {
    content.home.whyChooseUs[i - 1] = {
      title: c['why.title' + i] || '',
      text: c['why.text' + i] || ''
    };
  }

  const paragraphs = [];
  for (let i = 1; i <= 6; i++) {
    if (c['about.body' + i]) paragraphs.push(c['about.body' + i]);
  }
  if (paragraphs.length) content.about.body = paragraphs;

  set(content.contact, 'intro', c['contact.intro']);
  set(content.contact, 'hours', c['contact.hours']);

  set(content.footer, 'text', c['footer.text']);
  set(content.footer, 'copyright', c['footer.copyright']);

  saveJSON(CONTENT_FILE, content);
  flash(req, 'success', 'Website text updated. Changes are live on the site.');
  res.redirect('/admin/content');
});

// ------------------------------------------------------------- admin: services
app.get('/admin/services', requireAdmin, (req, res) => {
  res.render('admin/services', { title: 'Manage Services', services: content.services });
});

app.post('/admin/services/save', requireAdmin, (req, res) => {
  const { id, icon, title, description } = req.body;
  if (!title || !description) {
    flash(req, 'error', 'Service title and description are required.');
    return res.redirect('/admin/services');
  }
  if (id && content.services.some((s) => s.id === id)) {
    const s = content.services.find((s) => s.id === id);
    s.icon = icon || s.icon;
    s.title = title;
    s.description = description;
  } else {
    content.services.push({ id: newId(), icon: icon || '🏗️', title, description });
  }
  saveJSON(CONTENT_FILE, content);
  flash(req, 'success', 'Service saved.');
  res.redirect('/admin/services');
});

app.post('/admin/services/delete', requireAdmin, (req, res) => {
  content.services = content.services.filter((s) => s.id !== req.body.id);
  saveJSON(CONTENT_FILE, content);
  flash(req, 'success', 'Service deleted.');
  res.redirect('/admin/services');
});

// ------------------------------------------------------------- admin: projects
app.get('/admin/projects', requireAdmin, (req, res) => {
  res.render('admin/projects', { title: 'Manage Projects', projects: content.projects });
});

app.post('/admin/projects/save', requireAdmin, (req, res) => {
  const { id, title, category, date, description, image, video } = req.body;
  if (!title || !description) {
    flash(req, 'error', 'Project title and description are required.');
    return res.redirect('/admin/projects');
  }
  if (id && content.projects.some((p) => p.id === id)) {
    const p = content.projects.find((p) => p.id === id);
    p.title = title;
    p.category = category || p.category;
    p.date = date || p.date;
    p.description = description;
    if (image) p.image = image;
    if (video) p.video = video;
  } else {
    content.projects.push({
      id: newId(),
      title,
      category: category || 'General',
      date: date || new Date().getFullYear().toString(),
      description,
      image: image || '',
      video: video || ''
    });
  }
  saveJSON(CONTENT_FILE, content);
  flash(req, 'success', 'Project saved.');
  res.redirect('/admin/projects');
});

app.post('/admin/projects/delete', requireAdmin, (req, res) => {
  content.projects = content.projects.filter((p) => p.id !== req.body.id);
  saveJSON(CONTENT_FILE, content);
  flash(req, 'success', 'Project deleted.');
  res.redirect('/admin/projects');
});

// ------------------------------------------------------------- admin: videos
app.get('/admin/videos', requireAdmin, (req, res) => {
  res.render('admin/videos', { title: 'Manage Videos', videos: content.videos });
});

app.post('/admin/videos/save', requireAdmin, (req, res) => {
  const { id, title, description, video } = req.body;
  if (!title || !video) {
    flash(req, 'error', 'Video title and a video link/upload are required.');
    return res.redirect('/admin/videos');
  }
  if (id && content.videos.some((v) => v.id === id)) {
    const v = content.videos.find((v) => v.id === id);
    v.title = title;
    v.description = description || v.description;
    if (video) v.video = video;
  } else {
    content.videos.push({ id: newId(), title, description: description || '', video });
  }
  saveJSON(CONTENT_FILE, content);
  flash(req, 'success', 'Video saved.');
  res.redirect('/admin/videos');
});

app.post('/admin/videos/delete', requireAdmin, (req, res) => {
  content.videos = content.videos.filter((v) => v.id !== req.body.id);
  saveJSON(CONTENT_FILE, content);
  flash(req, 'success', 'Video deleted.');
  res.redirect('/admin/videos');
});

// ------------------------------------------------------------- admin: messages
app.get('/admin/messages', requireAdmin, (req, res) => {
  res.render('admin/messages', { title: 'Contact Messages', messages });
});

app.post('/admin/messages/delete', requireAdmin, (req, res) => {
  messages = messages.filter((m) => m.id !== req.body.id);
  saveJSON(MESSAGES_FILE, messages);
  flash(req, 'success', 'Message deleted.');
  res.redirect('/admin/messages');
});

// ------------------------------------------------------------- admin: password
app.get('/admin/password', requireAdmin, (req, res) => {
  res.render('admin/password', { title: 'Change Admin Password', error: null, success: false });
});

app.post('/admin/password', requireAdmin, (req, res) => {
  const { current, next, confirm } = req.body;
  if (!verifyPassword(current || '', admin.salt, admin.hash)) {
    return res.render('admin/password', {
      title: 'Change Admin Password',
      error: 'Current password is incorrect.',
      success: false
    });
  }
  if (!next || next.length < 6) {
    return res.render('admin/password', {
      title: 'Change Admin Password',
      error: 'New password must be at least 6 characters.',
      success: false
    });
  }
  if (next !== confirm) {
    return res.render('admin/password', {
      title: 'Change Admin Password',
      error: 'New password and confirmation do not match.',
      success: false
    });
  }
  const salt = crypto.randomBytes(16).toString('hex');
  admin = { salt, hash: hashPassword(next, salt) };
  saveJSON(ADMIN_FILE, admin);
  res.render('admin/password', {
    title: 'Change Admin Password',
    error: null,
    success: true
  });
});

// ------------------------------------------------------------- 404 + errors
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Something went wrong. Please restart the server and try again.');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Construction website running at http://localhost:${PORT}`);
  console.log(`Admin panel at http://localhost:${PORT}/admin`);
  if (!process.env.SMTP_HOST) console.log('Email notifications disabled (no SMTP_HOST set).');
});
