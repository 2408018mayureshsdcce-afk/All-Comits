/* Builds the static version of the site into dist/ for hosts without a
   Node server (Vercel, Netlify, GitHub Pages).

     npm run build

   - Copies every page and assets/ (including dashboard uploads).
   - If storage/db.json exists, writes dist/api/data.js from it, so content
     edited in the dashboard shows on the static site exactly as it does on
     backend.js. Without it, pages use assets/js/data.js.
   - The dashboard, backend.js and storage/ are left out. Forms show a
     "preview mode" note instead of sending, because there is no server to
     receive them. */
'use strict';
const fs = require('fs');
const path = require('path');
const SCHEMA = require('../admin/schema.js');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'dist');
const DB_FILE = path.join(ROOT, 'storage', 'db.json');

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const pages = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
for (const f of pages) fs.copyFileSync(path.join(ROOT, f), path.join(OUT, f));
fs.cpSync(path.join(ROOT, 'assets'), path.join(OUT, 'assets'), { recursive: true });

// Same shape as publicContent() in backend.js, minus `TN.api = true`:
// a static host has no /api/submissions, so forms stay in preview mode.
let content = 'assets/js/data.js';
if (fs.existsSync(DB_FILE)) {
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  const sortItems = (col, items) => {
    if (!col.sort) return items;
    const key = i => col.sort.map(k => i[k] || '').join('|');
    return items.slice().sort((a, b) => key(a).localeCompare(key(b)));
  };
  const data = {
    fest: db.settings.fest,
    protocols: db.settings.protocols,
    sets: Object.entries(SCHEMA.collections)
      .filter(([name]) => Array.isArray(db.collections[name]))
      .map(([name, col]) => ({ path: col.path, items: sortItems(col, db.collections[name]) })),
  };
  const script = `/* Content from the dashboard (storage/db.json), built by scripts/build-static.js. */
(function (TN, d) {
  if (!TN) return;
  Object.assign(TN.fest, d.fest);
  if (d.protocols) TN.protocols = d.protocols;
  d.sets.forEach(function (s) {
    var o = TN;
    for (var i = 0; i < s.path.length - 1; i++) o = o[s.path[i]] = o[s.path[i]] || {};
    o[s.path[s.path.length - 1]] = s.items;
  });
})(window.TN, ${JSON.stringify(data).replace(/</g, '\\u003c')});
`;
  fs.mkdirSync(path.join(OUT, 'api'), { recursive: true });
  fs.writeFileSync(path.join(OUT, 'api', 'data.js'), script);
  content = 'storage/db.json';
}

console.log(`Static site: ${pages.length} pages + assets/ -> dist/ (content from ${content})`);
