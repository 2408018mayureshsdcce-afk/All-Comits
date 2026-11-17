/* ==========================================================================
   TechNation server: serves the site, the admin dashboard and a small JSON API.
   No dependencies — Node 18+ only.

     npm start                             # http://127.0.0.1:3000
     PORT=8080 HOST=0.0.0.0 npm start      # settings can also live in .env

   Content lives in storage/db.json. On first start it is seeded from
   assets/js/data.js; after that the dashboard is the source of truth.
   ========================================================================== */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');
const SCHEMA = require('./admin/schema.js');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'storage');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const ENV_FILE = path.join(ROOT, '.env');

// Minimal .env support (KEY=value lines) so Windows users needn't set variables by hand.
if (fs.existsSync(ENV_FILE)) {
  for (const line of fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (m && !line.trim().startsWith('#') && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '127.0.0.1';
// First run without a password: generate one and keep it in .env so it survives restarts.
let generatedPassword = false;
const PASSWORD = process.env.ADMIN_PASSWORD || (() => {
  const pw = crypto.randomBytes(12).toString('base64url');
  fs.appendFileSync(ENV_FILE, `${fs.existsSync(ENV_FILE) ? '\n' : ''}ADMIN_PASSWORD=${pw}\n`);
  generatedPassword = true;
  return pw;
})();
if (PASSWORD.length < 10) console.warn('  Warning: ADMIN_PASSWORD is shorter than 10 characters. Use a longer one before going online.');
const SESSION_MS = 12 * 60 * 60 * 1000;
const MAX_SUBMISSIONS = 20000;

/* ----------------------------------------------------------------- store */
// Runs data.js in a sandbox and returns its window.TN object.
function loadSiteData() {
  const src = fs.readFileSync(path.join(ROOT, 'assets/js/data.js'), 'utf8');
  const ctx = { window: {} };
  vm.runInNewContext(src, ctx, { filename: 'data.js' });
  return ctx.window.TN;
}

const getPath = (obj, p) => p.reduce((o, k) => (o ? o[k] : undefined), obj);
function setPath(obj, p, value) {
  let o = obj;
  p.slice(0, -1).forEach(k => { o = o[k] = o[k] || {}; });
  o[p[p.length - 1]] = value;
}
const newId = () => crypto.randomBytes(5).toString('hex');

function seed() {
  const TN = loadSiteData();
  const db = { version: 1, seededAt: new Date().toISOString(), settings: {}, collections: {}, submissions: [] };
  for (const [key, group] of Object.entries(SCHEMA.settings)) {
    const src = key === 'fest' ? TN.fest : TN[key];
    db.settings[key] = SCHEMA.clean(group.fields, src).value;
  }
  for (const [name, col] of Object.entries(SCHEMA.collections)) {
    const taken = new Set();
    db.collections[name] = (getPath(TN, col.path) || []).map(raw => {
      const item = SCHEMA.clean(col.fields, raw).value;
      item.id = col.slug ? uniqueSlug(item.id || SCHEMA.slugify(item.name), taken) : newId();
      taken.add(item.id);
      return item;
    });
  }
  return db;
}

function uniqueSlug(base, taken) {
  const root = base || 'item';
  let id = root, n = 2;
  while (taken.has(id)) id = `${root}-${n++}`;
  return id;
}

let db;
function loadDb() {
  if (!fs.existsSync(DB_FILE)) {
    db = seed();
    saveDb();
    console.log('  Created storage/db.json from assets/js/data.js');
    return;
  }
  try {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    console.error(`\n  storage/db.json could not be read (${e.message}).\n  Fix or remove it, then start again. Removing it re-seeds from data.js.\n`);
    process.exit(1);
  }
  db.submissions = db.submissions || [];
  if (upgrade()) saveDb();
}

// Brings an older database up to the current schema. Collections and fields
// added since it was created are filled from data.js (matched by page id) or
// from field defaults. Values that already exist, even empty ones, are kept.
function upgrade() {
  const fresh = seed();
  let changed = false;
  const fill = (fields, item, src) => {
    const missing = fields.filter(f => f.type !== 'heading' && !(f.key in item));
    if (!missing.length) return item;
    changed = true;
    const base = SCHEMA.clean(missing, src || {}).value;
    return { ...item, ...base };
  };
  for (const [name, col] of Object.entries(SCHEMA.collections)) {
    if (!db.collections[name]) { db.collections[name] = fresh.collections[name]; changed = true; continue; }
    const byId = new Map(fresh.collections[name].map(i => [i.id, i]));
    db.collections[name] = db.collections[name].map(item => fill(col.fields, item, col.slug ? byId.get(item.id) : null));
  }
  for (const [key, group] of Object.entries(SCHEMA.settings)) {
    db.settings[key] = fill(group.fields, db.settings[key] || {}, fresh.settings[key]);
  }
  return changed;
}

// Write to a temp file and rename, so a crash mid-write never leaves half a file.
function saveDb() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  try { fs.renameSync(tmp, DB_FILE); }
  catch (e) { fs.writeFileSync(DB_FILE, fs.readFileSync(tmp)); fs.unlinkSync(tmp); }
}

// Everything the public pages need, applied on top of data.js in the browser.
function publicContent() {
  return {
    fest: db.settings.fest,
    protocols: db.settings.protocols,
    sets: Object.entries(SCHEMA.collections).map(([name, col]) => ({ path: col.path, items: sortItems(col, db.collections[name]) })),
  };
}
function sortItems(col, items) {
  if (!col.sort) return items;
  const key = i => col.sort.map(k => i[k] || '').join('|');
  return items.slice().sort((a, b) => key(a).localeCompare(key(b)));
}

function publicScript() {
  return `/* Live content from the ${db.settings.fest.name} dashboard. Generated by backend.js. */
(function (TN, d) {
  if (!TN) return;
  Object.assign(TN.fest, d.fest);
  TN.protocols = d.protocols;
  d.sets.forEach(function (s) {
    var o = TN;
    for (var i = 0; i < s.path.length - 1; i++) o = o[s.path[i]] = o[s.path[i]] || {};
    o[s.path[s.path.length - 1]] = s.items;
  });
  TN.api = true;
})(window.TN, ${JSON.stringify(publicContent())});
`;
}

// A standalone data.js with the dashboard's content, for static hosting.
function exportDataJs() {
  const TN = loadSiteData();
  const c = publicContent();
  Object.assign(TN.fest, c.fest);
  TN.protocols = c.protocols;
  c.sets.forEach(s => setPath(TN, s.path, s.items));
  return `/* ==========================================================================
   Site content, exported from the ${c.fest.name} dashboard on ${new Date().toISOString().slice(0, 10)}.
   Replace assets/js/data.js with this file to publish the site without backend.js.
   ========================================================================== */
window.TN = ${JSON.stringify(TN, null, 2)};
`;
}

/* ------------------------------------------------------------- sessions */
const sessions = new Map();
const hash = s => crypto.createHash('sha256').update(String(s)).digest();
const passwordOk = p => crypto.timingSafeEqual(hash(p), hash(PASSWORD));

function cookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach(p => {
    const i = p.indexOf('=');
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}
function authed(req) {
  const t = cookies(req).tn_admin;
  const exp = t && sessions.get(t);
  if (!exp) return false;
  if (exp < Date.now()) { sessions.delete(t); return false; }
  return true;
}
const secure = req => req.socket.encrypted || req.headers['x-forwarded-proto'] === 'https';
const sessionCookie = (req, token, maxAge) =>
  `tn_admin=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure(req) ? '; Secure' : ''}`;

// Fixed-window counters per client IP, e.g. login attempts and form posts.
function limiter(max, windowMs) {
  const hits = new Map();
  return ip => {
    const now = Date.now(), h = hits.get(ip);
    if (!h || h.reset < now) { hits.set(ip, { n: 1, reset: now + windowMs }); return true; }
    h.n++;
    return h.n <= max;
  };
}
const loginLimit = limiter(10, 15 * 60 * 1000);
const submitLimit = limiter(20, 10 * 60 * 1000);
setInterval(() => { const now = Date.now(); sessions.forEach((exp, t) => exp < now && sessions.delete(t)); }, 60 * 60 * 1000).unref();

/* ---------------------------------------------------------------- http */
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon', '.pdf': 'application/pdf',
  '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
};
const ADMIN_CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'";

function send(res, status, body, type = 'application/json; charset=utf-8', extra = {}) {
  const data = typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra });
  res.end(data);
}
const fail = (res, status, error, extra) => send(res, status, { error }, undefined, extra);

function readRaw(req, limit) {
  return new Promise((resolve, reject) => {
    let size = 0, over = false;
    const chunks = [];
    req.on('data', c => {
      if (over) return;
      size += c.length;
      if (size > limit) { over = true; chunks.length = 0; reject(Object.assign(new Error('That image is too large (max 5 MB).'), { status: 413, headers: { Connection: 'close' } })); return; }
      chunks.push(c);
    });
    req.on('end', () => { if (!over) resolve(Buffer.concat(chunks)); });
    req.on('error', reject);
  });
}

// Recognise an image by its first bytes, never by the name or type the browser claims.
function imageExt(b) {
  if (b.length > 12 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return '.jpg';
  if (b.length > 12 && b.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return '.png';
  if (b.length > 12 && b.slice(0, 4).toString('latin1') === 'RIFF' && b.slice(8, 12).toString('latin1') === 'WEBP') return '.webp';
  return null;
}

function readJson(req, limit) {
  return new Promise((resolve, reject) => {
    if (!/^application\/json\b/i.test(req.headers['content-type'] || '')) return reject(Object.assign(new Error('Send JSON.'), { status: 415 }));
    let size = 0, over = false;
    const chunks = [];
    req.on('data', c => {
      if (over) return;
      size += c.length;
      // Answer straight away; Connection: close makes Node drop the rest of the body.
      if (size > limit) { over = true; chunks.length = 0; reject(Object.assign(new Error('Request too large.'), { status: 413, headers: { Connection: 'close' } })); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      if (over) return;
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); }
      catch (e) { reject(Object.assign(new Error('Invalid JSON.'), { status: 400 })); }
    });
    req.on('error', reject);
  });
}

// Only the site's pages, assets and the dashboard are public. storage/, dotfiles
// and server code are never served.
function staticFile(pathname) {
  if (pathname === '/') return 'index.html';
  if (/^\/[a-z0-9-]+\.html$/.test(pathname)) return pathname.slice(1);
  if (pathname === '/admin/') return 'admin/index.html';
  if (/^\/(assets|admin)\/[\w\-./]+$/.test(pathname) && !pathname.split('/').some(s => s.startsWith('.'))) return pathname.slice(1);
  return null;
}

function serveStatic(req, res, pathname) {
  if (pathname === '/admin') { res.writeHead(301, { Location: '/admin/' }); return res.end(); }
  const rel = staticFile(pathname);
  const file = rel && path.join(ROOT, rel);
  if (!file || !file.startsWith(ROOT + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    if (pathname.startsWith('/admin/') || pathname.startsWith('/assets/')) return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
    return send(res, 404, fs.readFileSync(path.join(ROOT, '404.html')), MIME['.html']);
  }
  const headers = { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' };
  if (rel.startsWith('admin/')) Object.assign(headers, { 'Content-Security-Policy': ADMIN_CSP, 'X-Frame-Options': 'DENY' });
  res.writeHead(200, headers);
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(file).pipe(res);
}

/* ----------------------------------------------------------------- api */
function saveItem(name, input, existingId) {
  const col = SCHEMA.collections[name];
  const list = db.collections[name];
  const { value, errors } = SCHEMA.clean(col.fields, input, col.check);
  if (errors.length) return { errors };
  if (col.slug) {
    const taken = new Set(list.filter(i => i.id !== existingId).map(i => i.id));
    const wanted = value.id || SCHEMA.slugify(value.name);
    if (value.id && taken.has(value.id)) return { errors: [`Another ${col.singular.toLowerCase()} already uses the id "${value.id}".`] };
    value.id = uniqueSlug(wanted, taken);
  } else {
    value.id = existingId || newId();
  }
  return { item: value };
}

function submissionsCsv() {
  const keys = [...new Set(db.submissions.flatMap(s => Object.keys(s.data)))];
  // Leading =, +, - or @ would run as a formula in spreadsheet apps.
  const cell = v => { let s = String(v == null ? '' : v); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return `"${s.replace(/"/g, '""')}"`; };
  const rows = [['Received', 'Form', 'Reference', ...keys], ...db.submissions.map(s => [s.at, s.form, s.ref, ...keys.map(k => s.data[k])])];
  return '﻿' + rows.map(r => r.map(cell).join(',')).join('\r\n');
}

async function api(req, res, pathname) {
  const method = req.method;
  const ip = req.socket.remoteAddress || '';
  const parts = pathname.split('/').filter(Boolean).slice(1); // drop "api"

  // Browsers send Origin on cross-site writes; refuse any that don't match.
  if (method !== 'GET' && method !== 'HEAD' && req.headers.origin) {
    let host = '';
    try { host = new URL(req.headers.origin).host; } catch (e) { /* malformed */ }
    if (host !== req.headers.host && host !== req.headers['x-forwarded-host']) return fail(res, 403, 'Cross-site request refused.');
  }

  if (parts[0] === 'data.js' && method === 'GET') return send(res, 200, publicScript(), MIME['.js']);

  if (parts[0] === 'submissions' && parts.length === 1 && method === 'POST') {
    if (!submitLimit(ip)) return fail(res, 429, 'Too many submissions. Try again in a few minutes.');
    const body = await readJson(req, 16 * 1024);
    const data = body && typeof body.data === 'object' && !Array.isArray(body.data) ? body.data : null;
    if (!data || !Object.keys(data).length) return fail(res, 400, 'Nothing to submit.');
    if (db.submissions.length >= MAX_SUBMISSIONS) return fail(res, 507, 'Submission storage is full.');
    const clean = {};
    Object.entries(data).slice(0, 30).forEach(([k, v]) => { clean[SCHEMA.text(k, 40)] = SCHEMA.text(v, 2000); });
    db.submissions.unshift({ id: newId(), at: new Date().toISOString(), form: SCHEMA.text(body.form, 120) || 'Form', ref: SCHEMA.text(body.ref, 120), data: clean });
    saveDb();
    return send(res, 201, { ok: true });
  }

  if (parts[0] === 'login' && method === 'POST') {
    if (!loginLimit(ip)) return fail(res, 429, 'Too many attempts. Wait 15 minutes and try again.');
    const body = await readJson(req, 2048);
    if (!passwordOk(body.password || '')) return fail(res, 401, 'Wrong password.');
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, Date.now() + SESSION_MS);
    return send(res, 200, { ok: true }, undefined, { 'Set-Cookie': sessionCookie(req, token, SESSION_MS / 1000) });
  }
  if (parts[0] === 'logout' && method === 'POST') {
    sessions.delete(cookies(req).tn_admin);
    return send(res, 200, { ok: true }, undefined, { 'Set-Cookie': sessionCookie(req, '', 0) });
  }
  if (parts[0] === 'session' && method === 'GET') return send(res, 200, { ok: authed(req) });

  if (parts[0] !== 'admin') return fail(res, 404, 'Unknown endpoint.');
  if (!authed(req)) return fail(res, 401, 'Sign in again.');
  const [, a, b, c] = parts;

  if (a === 'upload' && method === 'POST') {
    const buf = await readRaw(req, 5 * 1024 * 1024);
    const ext = imageExt(buf);
    if (!ext) return fail(res, 415, 'Upload a JPG, PNG or WebP image.');
    const dir = path.join(ROOT, 'assets', 'uploads');
    fs.mkdirSync(dir, { recursive: true });
    const name = `${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}${ext}`;
    fs.writeFileSync(path.join(dir, name), buf);
    return send(res, 201, { path: `assets/uploads/${name}` });
  }

  if (a === 'content' && method === 'GET') {
    return send(res, 200, { settings: db.settings, collections: db.collections, submissions: db.submissions.length, seededAt: db.seededAt });
  }

  if (a === 'settings' && method === 'PUT') {
    const body = await readJson(req, 64 * 1024);
    const group = SCHEMA.settings[b];
    if (!group) return fail(res, 404, 'Unknown settings group.');
    const { value, errors } = SCHEMA.clean(group.fields, body, group.check);
    if (errors.length) return send(res, 422, { errors });
    db.settings[b] = value;
    saveDb();
    return send(res, 200, { value });
  }

  if (a === 'submissions') {
    if (!b && method === 'GET') return send(res, 200, db.submissions);
    if (b === 'export.csv' && method === 'GET') {
      return send(res, 200, submissionsCsv(), 'text/csv; charset=utf-8', { 'Content-Disposition': `attachment; filename="registrations-${new Date().toISOString().slice(0, 10)}.csv"` });
    }
    if (b && method === 'DELETE') {
      const i = db.submissions.findIndex(s => s.id === b);
      if (i < 0) return fail(res, 404, 'Already deleted.');
      db.submissions.splice(i, 1);
      saveDb();
      return send(res, 200, { ok: true });
    }
  }

  if (a === 'export' && b === 'data.js' && method === 'GET') {
    return send(res, 200, exportDataJs(), MIME['.js'], { 'Content-Disposition': 'attachment; filename="data.js"' });
  }

  const col = SCHEMA.collections[a];
  if (!col) return fail(res, 404, 'Unknown collection.');
  const list = db.collections[a];

  if (!b && method === 'POST') {
    const { item, errors } = saveItem(a, await readJson(req, 64 * 1024));
    if (errors) return send(res, 422, { errors });
    list.push(item);
    saveDb();
    return send(res, 201, { item });
  }
  if (b === 'reorder' && !c && method === 'POST') {
    const { ids } = await readJson(req, 64 * 1024);
    if (!Array.isArray(ids) || ids.length !== list.length || new Set(ids).size !== list.length || !ids.every(id => list.some(i => i.id === id))) {
      return fail(res, 409, 'The list changed elsewhere. Reload and try again.');
    }
    db.collections[a] = ids.map(id => list.find(i => i.id === id));
    saveDb();
    return send(res, 200, { ok: true });
  }
  const idx = list.findIndex(i => i.id === b);
  if (b && idx < 0) return fail(res, 404, `That ${col.singular.toLowerCase()} no longer exists.`);
  if (b && method === 'PUT') {
    const { item, errors } = saveItem(a, await readJson(req, 64 * 1024), b);
    if (errors) return send(res, 422, { errors });
    list[idx] = item;
    saveDb();
    return send(res, 200, { item });
  }
  if (b && method === 'DELETE') {
    list.splice(idx, 1);
    saveDb();
    return send(res, 200, { ok: true });
  }
  return fail(res, 405, 'Method not allowed.');
}

/* ---------------------------------------------------------------- boot */
loadDb();

const server = http.createServer(async (req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname); }
  catch (e) { return fail(res, 400, 'Bad request.'); }
  try {
    if (pathname.startsWith('/api/')) return await api(req, res, pathname);
    if (req.method !== 'GET' && req.method !== 'HEAD') return fail(res, 405, 'Method not allowed.');
    serveStatic(req, res, pathname);
  } catch (e) {
    if (res.headersSent) return res.destroy();
    if (e.status) return fail(res, e.status, e.message, e.headers);
    console.error(e);
    fail(res, 500, 'Something went wrong on the server.');
  }
});

server.on('error', e => {
  console.error(e.code === 'EADDRINUSE' ? `\n  Port ${PORT} is already in use. Start on another one, e.g. PORT=4000 npm start\n` : e);
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  const base = `http://${HOST === '0.0.0.0' || HOST === '::' ? 'localhost' : HOST}:${PORT}`;
  console.log(`\n  ${db.settings.fest.name} is running`);
  console.log(`  Site       ${base}/`);
  console.log(`  Dashboard  ${base}/admin/`);
  console.log(generatedPassword
    ? `  Password   ${PASSWORD}   (generated and saved to .env; change it there)`
    : '  Password   from ADMIN_PASSWORD (.env or environment)');
  console.log('');
});
