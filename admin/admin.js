/* ==========================================================================
   Dashboard: sign-in, overview, an editor for every collection in schema.js,
   the registrations inbox and festival settings. Talks to backend.js at /api/.
   ========================================================================== */
(() => {
  'use strict';

  const SC = window.TN_SCHEMA;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const inr = n => '₹' + Number(n || 0).toLocaleString('en-IN');
  const app = $('#adm');
  const S = { content: null, subs: [], q: {} };

  /* -------------------------------------------------------------- icons */
  const ICONS = {
    home: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
    trophy: 'M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8M10 17h4',
    cap: 'M2 9l10-5 10 5-10 5zM6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5M22 9v6',
    calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
    lecture: 'M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM6 11a6 6 0 0 0 12 0M12 17v4M9 21h6',
    exhibit: 'M12 3l9 17H3zM8 14h8',
    night: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z',
    pin: 'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
    inbox: 'M3 13l3-8h12l3 8v6H3zM3 13h5l1 3h6l1-3h5',
    gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
    plus: 'M12 5v14M5 12h14',
    edit: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
    copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
    trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
    up: 'M12 19V5M6 11l6-6 6 6',
    down: 'M12 5v14M6 13l6 6 6-6',
    external: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
    download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
    search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
    close: 'M6 6l12 12M18 6L6 18',
    menu: 'M4 7h16M4 12h16M4 17h10',
    logout: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
    check: 'M5 12.5l4.5 4.5L19 7',
    arrow: 'M5 12h14M13 6l6 6-6 6',
    alert: 'M12 3l10 18H2zM12 10v5M12 18v.01',
    chevron: 'M9 6l6 6-6 6',
    refresh: 'M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6',
    users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2 20a7 7 0 0 1 14 0M16 4.5a3.5 3.5 0 0 1 0 6.5M18 13.5a6 6 0 0 1 4 6.5',
    star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z',
    image: 'M4 5h16v14H4zM4 15l4.5-4.5 4 4L15 12l5 5M15.5 9.5v.01',
    help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9a2.6 2.6 0 0 1 5 .9c0 1.7-2.5 2.2-2.5 3.6M12 17v.01',
  };
  const icon = (n, s = 20) =>
    `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICONS[n] || ICONS.arrow}"/></svg>`;
  const mark = () => `<img class="adm-mark" src="../assets/logo-mark.svg" alt="" width="52" height="40">`;

  /* -------------------------------------------------------------- dates */
  const todayIST = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const fmtDay = s => (s ? new Date(s.slice(0, 10) + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
  // "2026-12-18T09:00:00+05:30" → "2026-12-18T09:00" for <input type="datetime-local">, in IST.
  const toLocalInput = v => (v ? new Date(v).toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' }).replace(' ', 'T').slice(0, 16) : '');
  function ago(iso) {
    const s = (Date.now() - new Date(iso)) / 1000;
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)} min ago`;
    if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
    if (s < 86400 * 7) return `${Math.floor(s / 86400)} d ago`;
    return fmtDay(new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }));
  }
  const fullTime = iso => new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) + ' IST';

  /* ---------------------------------------------------------------- api */
  async function call(method, url, body) {
    let r;
    try {
      r = await fetch('/api/' + url, {
        method,
        credentials: 'same-origin',
        headers: body !== undefined ? { 'Content-Type': 'application/json' } : {},
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (e) {
      throw Object.assign(new Error('Cannot reach the server. Is backend.js still running?'), { errors: [] });
    }
    let data = null;
    try { data = await r.json(); } catch (e) { /* empty body */ }
    if (r.status === 401 && url !== 'login') {
      signedOut('Your session ended. Sign in again.');
      throw Object.assign(new Error('Signed out'), { quiet: true, errors: [] });
    }
    if (!r.ok) {
      const errors = (data && data.errors) || [];
      throw Object.assign(new Error((data && data.error) || errors[0] || `Request failed (${r.status}).`), { errors });
    }
    return data;
  }
  // Shrink the picture in the browser first (max 1600px wide), then send the bytes.
  async function uploadImage(file) {
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) throw Object.assign(new Error('Choose a JPG, PNG or WebP image.'), { errors: [] });
    const bmp = await createImageBitmap(file).catch(() => null);
    if (!bmp) throw Object.assign(new Error('That file could not be read as an image.'), { errors: [] });
    const k = Math.min(1, 1600 / bmp.width);
    const cv = document.createElement('canvas');
    cv.width = Math.round(bmp.width * k); cv.height = Math.round(bmp.height * k);
    const g = cv.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height);
    g.drawImage(bmp, 0, 0, cv.width, cv.height);
    const blob = await new Promise(r => cv.toBlob(r, 'image/jpeg', 0.86));
    let r;
    try { r = await fetch('/api/admin/upload', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'image/jpeg' }, body: blob }); }
    catch (e) { throw Object.assign(new Error('Cannot reach the server. Is backend.js still running?'), { errors: [] }); }
    const data = await r.json().catch(() => ({}));
    if (r.status === 401) { signedOut('Your session ended. Sign in again.'); throw Object.assign(new Error('Signed out'), { quiet: true, errors: [] }); }
    if (!r.ok) throw Object.assign(new Error(data.error || `Upload failed (${r.status}).`), { errors: [] });
    return data.path;
  }
  const report = e => { if (!e.quiet) toast(e.message, 'bad'); };
  const loadContent = async () => { S.content = await call('GET', 'admin/content'); };
  const loadSubs = async () => { S.subs = await call('GET', 'admin/submissions'); };

  function toast(msg, type = '') {
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.innerHTML = `${icon(type === 'ok' ? 'check' : type === 'bad' ? 'alert' : 'arrow', 18)}<span>${esc(msg)}</span>`;
    $('.toasts').appendChild(t);
    setTimeout(() => t.classList.add('out'), 3600);
    setTimeout(() => t.remove(), 4100);
  }

  function confirmBox(title, body, ok = 'Confirm') {
    return new Promise(resolve => {
      const d = document.createElement('dialog');
      d.className = 'confirm';
      d.innerHTML = `<form method="dialog" class="confirm-in">
        <h2>${esc(title)}</h2>${body ? `<p class="muted">${esc(body)}</p>` : ''}
        <div class="confirm-btns"><button class="btn sm ghost" value="no">Cancel</button><button class="btn sm danger" value="yes">${esc(ok)}</button></div>
      </form>`;
      document.body.appendChild(d);
      d.addEventListener('close', () => { resolve(d.returnValue === 'yes'); d.remove(); });
      d.showModal();
      $('button[value=no]', d).focus();
    });
  }
  const closeDialogs = () => $$('dialog').forEach(d => { if (d.open) d.close(); d.remove(); });

  /* ------------------------------------------------------------ sign-in */
  function signedOut(msg = '') {
    closeDialogs();
    document.title = 'Sign in · Dashboard';
    app.removeAttribute('aria-busy');
    app.innerHTML = `<section class="login">
      <form class="login-card hud" novalidate>
        ${mark()}
        <p class="kicker">Organiser dashboard</p>
        <h1>Sign in</h1>
        <p class="muted">Use the admin password saved in <code>.env</code> (it is also printed when the server starts).</p>
        <div class="field"><label for="pw">Password</label><input class="input" id="pw" name="password" type="password" autocomplete="current-password" required></div>
        <p class="login-err" role="alert">${esc(msg)}</p>
        <button class="btn full" type="submit">Sign in ${icon('arrow', 18)}</button>
        <a class="login-site mono" href="../index.html">← Back to the site</a>
      </form>
    </section>`;
    const f = $('form', app);
    $('#pw').focus();
    f.addEventListener('submit', async e => {
      e.preventDefault();
      if (!f.password.value) { $('#pw').focus(); return; }
      const btn = $('button[type=submit]', f);
      btn.disabled = true;
      try {
        await call('POST', 'login', { password: f.password.value });
        await start();
      } catch (err) {
        $('.login-err', f).textContent = err.message;
        btn.disabled = false;
        f.password.select();
      }
    });
  }

  async function start() {
    try {
      const { ok } = await call('GET', 'session');
      if (!ok) return signedOut();
      await Promise.all([loadContent(), loadSubs()]);
      shell();
      route();
    } catch (e) {
      if (!e.quiet) signedOut(e.message);
    }
  }

  /* -------------------------------------------------------------- shell */
  const NAV = () => [
    { id: 'overview', label: 'Overview', icon: 'home' },
    ...Object.entries(SC.collections).map(([id, c]) => ({ id: 'c/' + id, label: c.label, icon: c.icon, count: S.content.collections[id].length })),
    { id: 'registrations', label: 'Registrations', icon: 'inbox', count: S.subs.length },
    { id: 'settings', label: 'Settings', icon: 'gear' },
  ];
  const routeParts = () => (location.hash.replace(/^#\/?/, '') || 'overview').split('/').map(decodeURIComponent);

  function shell() {
    app.removeAttribute('aria-busy');
    app.innerHTML = `<div class="adm-app">
      <aside class="adm-side" id="side">
        <div class="adm-brand">${mark()}<span><b data-fest-name></b><small class="mono">Dashboard</small></span></div>
        <nav class="adm-nav" aria-label="Dashboard"></nav>
        <div class="adm-side-foot">
          <a class="adm-link" href="../index.html" target="_blank" rel="noopener">${icon('external', 16)} View site</a>
          <a class="adm-link" href="/api/admin/export/data.js" download>${icon('download', 16)} Export data.js</a>
          <button class="adm-link" data-logout>${icon('logout', 16)} Sign out</button>
        </div>
      </aside>
      <div class="adm-scrim" data-menu></div>
      <div class="adm-main">
        <header class="adm-top">
          <button class="icon-btn adm-burger" data-menu aria-label="Open menu" aria-controls="side" aria-expanded="false">${icon('menu')}</button>
          <div class="adm-top-t"><p class="kicker" id="v-kicker"></p><h1 id="v-title"></h1></div>
          <div class="adm-top-r" id="v-actions"></div>
        </header>
        <div class="adm-view" id="view"></div>
      </div>
    </div>`;
    $('[data-fest-name]').textContent = S.content.settings.fest.name;
    $$('[data-menu]').forEach(b => b.addEventListener('click', () => setMenu(!document.documentElement.classList.contains('side-open'))));
    $('[data-logout]').addEventListener('click', async () => {
      try { await call('POST', 'logout'); } catch (e) { /* signed out either way */ }
      signedOut('Signed out.');
    });
  }
  function setMenu(open) {
    document.documentElement.classList.toggle('side-open', open);
    $('.adm-burger').setAttribute('aria-expanded', String(open));
  }
  function drawNav() {
    const cur = routeParts().slice(0, 2).join('/');
    $('.adm-nav').innerHTML = NAV().map(n => `<a class="adm-nav-i" href="#/${n.id}"${cur === n.id ? ' aria-current="page"' : ''}>
      ${icon(n.icon, 18)}<span>${esc(n.label)}</span>${n.count != null ? `<em>${n.count}</em>` : ''}</a>`).join('');
  }
  function head(kicker, title, actions = '') {
    $('#v-kicker').textContent = kicker;
    $('#v-title').textContent = title;
    $('#v-actions').innerHTML = actions;
    document.title = `${title} · ${S.content.settings.fest.name} dashboard`;
  }

  function route() {
    if (!S.content) return;
    closeDialogs();
    setMenu(false);
    drawNav();
    const [a, b, c] = routeParts();
    const view = $('#view');
    view.scrollTop = 0;
    if (a === 'c' && SC.collections[b]) {
      viewCollection(b);
      if (c === 'new') openEditor(b);
      else if (c) { const it = S.content.collections[b].find(x => x.id === c); if (it) openEditor(b, it); }
      return;
    }
    if (a === 'registrations') return viewSubs();
    if (a === 'settings') return viewSettings();
    viewOverview();
  }
  addEventListener('hashchange', route);

  /* ----------------------------------------------------------- overview */
  const kpi = (label, value, sub, href) => `<a class="kpi hud" href="#/${href}">
      <span class="kpi-l">${esc(label)}</span><b class="kpi-v">${Number(value).toLocaleString('en-IN')}</b><span class="kpi-s">${esc(sub)}</span></a>`;

  function viewOverview() {
    const C = S.content.collections, fest = S.content.settings.fest;
    const today = todayIST();
    const startDay = fest.start.slice(0, 10), endDay = fest.end.slice(0, 10);
    const days = Math.ceil((new Date(fest.start) - Date.now()) / 864e5);
    const comps = C.competitions, open = comps.filter(c => c.status === 'open');
    const week = S.subs.filter(s => Date.now() - new Date(s.at) < 7 * 864e5).length;
    const nDays = new Set(C.schedule.map(s => s.day)).size;
    const closing = open.filter(c => c.deadline >= today).sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 5);
    const left = d => Math.round((new Date(d + 'T23:59:59+05:30') - Date.now()) / 864e5);
    const issues = [
      ...open.filter(c => c.deadline < today).map(c => [`${c.name} is still open, but its deadline passed on ${fmtDay(c.deadline)}.`, `c/competitions/${c.id}`]),
      ...open.filter(c => !c.date && !C.schedule.some(s => s.link === `event.html?id=${c.id}`)).map(c => [`${c.name} has no event date, so its Date tile says "To be announced".`, `c/competitions/${c.id}`]),
      ...comps.filter(c => c.sealed && !c.revealAt).map(c => [`${c.name} is sealed with no reveal time, so its details stay hidden.`, `c/competitions/${c.id}`]),
      ...C.schedule.filter(s => s.day < startDay || s.day > endDay).map(s => [`"${s.title}" is on ${fmtDay(s.day)}, outside the festival dates.`, `c/schedule/${s.id}`]),
      ...(fest.brochureUrl ? [] : [['No brochure link is set, so the Brochure buttons are hidden on the site.', 'settings']]),
    ];
    const status = days > 0 ? `${days} day${days === 1 ? '' : 's'} to go` : new Date(fest.end) > Date.now() ? 'Happening now' : 'Finished';

    head('Overview', `${fest.name} ${fest.edition}`.trim(), `<a class="btn sm ghost" href="../index.html" target="_blank" rel="noopener">View site ${icon('external', 16)}</a>`);
    $('#view').innerHTML = `
      <p class="ov-line">${icon('calendar', 16)} ${esc(fmtDay(startDay))} – ${esc(fmtDay(endDay))} · ${esc(fest.venueShort)} · <b>${status}</b></p>
      <div class="kpis">
        ${kpi('Events', comps.length, `${open.length} open for registration`, 'c/competitions')}
        ${kpi('Team members', C.team.length, `${new Set(C.team.map(t => t.group)).size} groups`, 'c/team')}
        ${kpi('Scheduled sessions', C.schedule.length, `across ${nDays} day${nDays === 1 ? '' : 's'}`, 'c/schedule')}
        ${kpi('Registrations', S.subs.length, `${week} in the last 7 days`, 'registrations')}
      </div>
      <div class="ov-grid">
        <section class="panel hud">
          <div class="panel-top"><h2>Closing soon</h2><a class="link-arrow sm" href="#/c/competitions">All ${icon('arrow', 16)}</a></div>
          ${closing.length ? `<ul class="rows">${closing.map(c => `<li><a href="#/c/competitions/${esc(c.id)}"><span class="hue-dot" style="--h:${c.hue}"></span><b>${esc(c.name)}</b><span class="muted">${esc(fmtDay(c.deadline))}</span><em class="${left(c.deadline) <= 7 ? 'soon' : ''}">${left(c.deadline) <= 0 ? 'today' : `${left(c.deadline)} d left`}</em></a></li>`).join('')}</ul>`
            : '<p class="muted">No open events have upcoming deadlines.</p>'}
        </section>
        <section class="panel hud">
          <div class="panel-top"><h2>Latest registrations</h2><a class="link-arrow sm" href="#/registrations">Inbox ${icon('arrow', 16)}</a></div>
          ${S.subs.length ? `<ul class="rows">${S.subs.slice(0, 5).map(s => `<li><a href="#/registrations"><b>${esc(personOf(s))}</b><span class="muted">${esc(s.form)}</span><em title="${esc(fullTime(s.at))}">${esc(ago(s.at))}</em></a></li>`).join('')}</ul>`
            : '<p class="muted">Nothing yet. Forms on the site send registrations here while backend.js is running.</p>'}
        </section>
        ${issues.length ? `<section class="panel hud warn">
          <div class="panel-top"><h2>${icon('alert', 18)} Needs attention</h2></div>
          <ul class="rows issues">${issues.map(([t, href]) => `<li><a href="#/${esc(href)}"><span>${esc(t)}</span>${icon('chevron', 16)}</a></li>`).join('')}</ul>
        </section>` : ''}
        <section class="panel hud">
          <div class="panel-top"><h2>Quick add</h2></div>
          <div class="quick">
            <a class="btn sm ghost" href="#/c/competitions/new">${icon('plus', 16)} Event</a>
            <a class="btn sm ghost" href="#/c/schedule/new">${icon('plus', 16)} Schedule session</a>
            <a class="btn sm ghost" href="#/c/sponsors/new">${icon('plus', 16)} Sponsor</a>
            <a class="btn sm ghost" href="#/c/team/new">${icon('plus', 16)} Team member</a>
            <a class="btn sm ghost" href="#/c/gallery/new">${icon('plus', 16)} Photo</a>
            <a class="btn sm ghost" href="#/c/faqs/new">${icon('plus', 16)} FAQ</a>
          </div>
        </section>
      </div>`;
  }

  /* -------------------------------------------------------- collections */
  const optLabel = (f, v) => { const o = f.options.find(x => (Array.isArray(x) ? x[0] : x) === v); return Array.isArray(o) ? o[1] : v; };
  const sorted = (col, items) => (col.sort ? items.slice().sort((a, b) => col.sort.map(k => a[k] || '').join('|').localeCompare(col.sort.map(k => b[k] || '').join('|'))) : items);

  function cell(col, key, item) {
    const f = col.fields.find(x => x.key === key);
    const v = item[key];
    if (key === 'status') return `<span class="status ${esc(v)}">${esc(optLabel(f, v))}</span>`;
    if (f.type === 'date') return v ? esc(fmtDay(v)) : '<span class="muted">—</span>';
    if (f.type === 'number') {
      if (key === 'fee' && !v) return 'Free';
      return ['prize', 'fee', 'price', 'early'].includes(key) ? inr(v) : (v ? esc(v) : '<span class="muted">—</span>');
    }
    if (f.type === 'select') return esc(optLabel(f, v));
    return v ? esc(v) : '<span class="muted">—</span>';
  }

  function viewCollection(name) {
    const col = SC.collections[name];
    const grouped = col.sort && col.sort[0] === 'day';
    const cols = col.columns.filter(([k]) => !(grouped && k === 'day'));
    head('Content', col.label, `<button class="btn sm" data-new>${icon('plus', 16)} New ${esc(col.singular.toLowerCase())}</button>`);
    $('[data-new]').addEventListener('click', () => openEditor(name));
    $('#view').innerHTML = `
      <div class="adm-tools">
        <label class="search">${icon('search', 18)}<input type="search" placeholder="Search ${esc(col.label.toLowerCase())}" aria-label="Search ${esc(col.label.toLowerCase())}" data-q></label>
        <span class="mono muted small" data-count></span>
      </div>
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr>${col.sort ? '' : '<th class="c-ord"><span class="sr">Order</span></th>'}<th>${esc(col.fields[0].label)}</th>${cols.map(([, l]) => `<th>${esc(l)}</th>`).join('')}<th class="c-act"><span class="sr">Actions</span></th></tr></thead>
        <tbody></tbody>
      </table></div>
      <p class="empty" hidden></p>`;
    const tbody = $('.tbl tbody'), input = $('[data-q]'), empty = $('#view .empty');
    input.value = S.q[name] || '';

    const draw = () => {
      const q = (S.q[name] || '').trim().toLowerCase();
      const all = sorted(col, S.content.collections[name]);
      const list = q ? all.filter(it => JSON.stringify(it).toLowerCase().includes(q)) : all;
      const canMove = !col.sort && !q;
      let lastDay = '';
      tbody.innerHTML = list.map((it, i) => {
        const title = SC.itemTitle(col, it);
        const badges = [it.sealed ? '<span class="badge gold">Sealed</span>' : '', it.registerUrl ? '<span class="badge">External form</span>' : '', name === 'speakers' && !it.name ? '<span class="badge">Revealing soon</span>' : ''].join('');
        const group = grouped && it.day !== lastDay ? `<tr class="grp"><th colspan="${cols.length + 2}" scope="colgroup">${esc(fmtDay(it.day))}</th></tr>` : '';
        lastDay = it.day;
        const viewHref = col.view ? `../${col.view}${col.slug ? encodeURIComponent(it.id) : ''}` : '';
        return `${group}<tr data-id="${esc(it.id)}">
          ${col.sort ? '' : `<td class="c-ord">
            <button class="icon-btn xs" data-act="up" aria-label="Move ${esc(title)} up"${canMove && i > 0 ? '' : ' disabled'}>${icon('up', 15)}</button>
            <button class="icon-btn xs" data-act="down" aria-label="Move ${esc(title)} down"${canMove && i < list.length - 1 ? '' : ' disabled'}>${icon('down', 15)}</button></td>`}
          <td class="c-title"><div class="ct">${it.hue != null ? `<span class="hue-dot" style="--h:${it.hue}"></span>` : ''}<div>
            <button class="link" data-act="edit">${esc(title)}</button>${badges}
            ${col.slug ? `<small class="mono muted">/${esc(it.id)}</small>` : ''}</div></div></td>
          ${cols.map(([k, l]) => `<td data-label="${esc(l)}">${cell(col, k, it)}</td>`).join('')}
          <td class="c-act">
            ${viewHref ? `<a class="icon-btn sm" href="${esc(viewHref)}" target="_blank" rel="noopener" title="View on site" aria-label="View ${esc(title)} on the site">${icon('external', 16)}</a>` : ''}
            <button class="icon-btn sm" data-act="edit" title="Edit" aria-label="Edit ${esc(title)}">${icon('edit', 16)}</button>
            <button class="icon-btn sm" data-act="dup" title="Duplicate" aria-label="Duplicate ${esc(title)}">${icon('copy', 16)}</button>
            <button class="icon-btn sm danger" data-act="del" title="Delete" aria-label="Delete ${esc(title)}">${icon('trash', 16)}</button>
          </td>
        </tr>`;
      }).join('');
      $('[data-count]').textContent = q ? `${list.length} of ${all.length}` : `${all.length} ${all.length === 1 ? col.singular.toLowerCase() : col.label.toLowerCase()}`;
      empty.hidden = list.length > 0;
      empty.textContent = q ? 'Nothing matches that search.' : `No ${col.label.toLowerCase()} yet. Use "New ${col.singular.toLowerCase()}" to add the first.`;
    };

    async function move(id, d, btn) {
      const list = S.content.collections[name];
      const i = list.findIndex(x => x.id === id), j = i + d;
      if (i < 0 || j < 0 || j >= list.length) return;
      const next = list.slice();
      [next[i], next[j]] = [next[j], next[i]];
      try {
        await call('POST', `admin/${name}/reorder`, { ids: next.map(x => x.id) });
        S.content.collections[name] = next;
        draw();
        const again = $(`tr[data-id="${CSS.escape(id)}"] [data-act="${btn}"]`, tbody);
        (again && !again.disabled ? again : $(`tr[data-id="${CSS.escape(id)}"] .link`, tbody)).focus();
      } catch (e) { report(e); await loadContent(); draw(); }
    }

    async function remove(it) {
      const title = SC.itemTitle(col, it);
      const linked = col.slug ? S.content.collections.schedule.filter(s => s.link && s.link.endsWith('?id=' + it.id)).length : 0;
      const body = `It disappears from the site straight away and can't be restored.${linked ? ` ${linked} schedule session${linked === 1 ? ' links' : 's link'} to it.` : ''}`;
      if (!(await confirmBox(`Delete "${title}"?`, body, 'Delete'))) return;
      try {
        await call('DELETE', `admin/${name}/${encodeURIComponent(it.id)}`);
        S.content.collections[name] = S.content.collections[name].filter(x => x.id !== it.id);
        draw(); drawNav();
        toast(`Deleted "${title}".`, 'ok');
      } catch (e) { report(e); }
    }

    tbody.addEventListener('click', e => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const id = b.closest('tr').dataset.id;
      const it = S.content.collections[name].find(x => x.id === id);
      if (!it) return;
      const act = b.dataset.act;
      if (act === 'edit') openEditor(name, it);
      if (act === 'dup') openEditor(name, it, true);
      if (act === 'del') remove(it);
      if (act === 'up' || act === 'down') move(id, act === 'up' ? -1 : 1, act);
    });
    input.addEventListener('input', () => { S.q[name] = input.value; draw(); });
    draw();
  }

  /* ------------------------------------------------------------- fields */
  let fid = 0;
  function fieldHTML(f, v) {
    const id = 'f' + (++fid);
    const req = f.required ? ' required' : '';
    const hint = f.hint ? `<small class="hint" id="${id}h">${esc(f.hint)}</small>` : '';
    const desc = f.hint ? ` aria-describedby="${id}h"` : '';
    const half = f.half ? ' half' : '';
    const list = f.suggest ? ` list="dl-${f.suggest}"` : '';
    const max = f.max ? ` maxlength="${f.max}"` : '';
    const val = v == null ? '' : v;
    const text = (type, extra = '') => `<input class="input" type="${type}" id="${id}" name="${f.key}" value="${esc(val)}"${req}${desc}${extra}>`;
    let input;
    switch (f.type) {
      case 'heading':
        return `<div class="form-sec"><h3>${esc(f.label)}</h3>${f.hint ? `<small class="hint">${esc(f.hint)}</small>` : ''}</div>`;
      case 'bool':
        return `<label class="check${half}"><input type="checkbox" id="${id}" name="${f.key}"${v ? ' checked' : ''}${desc}><span>${esc(f.label)}${hint}</span></label>`;
      case 'select':
        input = `<select class="input" id="${id}" name="${f.key}"${req}${desc}>${f.options.map(o => {
          const [k, l] = Array.isArray(o) ? o : [o, o];
          return `<option value="${esc(k)}"${String(val) === k ? ' selected' : ''}>${esc(l)}</option>`;
        }).join('')}</select>`;
        break;
      case 'textarea':
        input = `<textarea class="input" id="${id}" name="${f.key}" rows="4"${req}${max}${desc}>${esc(val)}</textarea>`;
        break;
      case 'list':
        input = `<textarea class="input" id="${id}" name="${f.key}" rows="5"${req}${desc}>${esc((val || []).join('\n'))}</textarea>`;
        break;
      case 'rules':
        input = `<div class="rules-ed" data-rules-ed>
          <div class="rules-tools">
            <button type="button" class="btn sm" data-rule="rule">+ Rule / round</button>
            <button type="button" class="btn sm ghost" data-rule="sub">+ Sub-point</button>
            <button type="button" class="btn sm ghost" data-rule="indent">Indent</button>
            <button type="button" class="btn sm ghost" data-rule="outdent">Outdent</button>
          </div>
          <textarea class="input rules-ta" id="${id}" name="${f.key}" rows="12" spellcheck="true" placeholder="Round 1 – MCQ&#10;- Each participant attends individually&#10;- Questions are role based&#10;Round 2 – Interview&#10;- Top 5 qualify"${desc}>${esc((val || []).join('\n'))}</textarea>
        </div>`;
        break;
      case 'people':
        input = `<textarea class="input" id="${id}" name="${f.key}" rows="3" placeholder="Name | Role | +91 00000 00000 | name@example.com"${desc}>${esc((val || []).map(p => [p.name, p.role, p.phone, p.email].join(' | ').replace(/( \| )+$/, '')).join('\n'))}</textarea>`;
        break;
      case 'hue': {
        const h = val === '' ? f.default : Number(val);
        input = `<div class="hue-row"><input type="range" id="${id}" name="${f.key}" min="0" max="359" value="${h}"${desc}><output class="swatch" for="${id}" style="--h:${h}">${h}</output></div>`;
        break;
      }
      case 'number': input = text('number', `${f.min != null ? ` min="${f.min}"` : ''} step="1" inputmode="numeric"`); break;
      case 'date': input = text('date'); break;
      case 'time': input = text('time'); break;
      case 'datetime': input = `<input class="input" type="datetime-local" id="${id}" name="${f.key}" value="${esc(toLocalInput(val))}"${req}${desc}>`; break;
      case 'email': input = text('email', max); break;
      case 'url': input = text('text', ` inputmode="url" placeholder="${esc(f.placeholder || 'https://')}"${list}`); break;
      case 'image':
        input = `<div class="imgfield" data-imgfield data-default-dir="assets/events/">
          <div class="imgfield-prev" data-drop role="button" tabindex="0" aria-label="Choose an image">
            <img alt="" hidden>
            <span class="imgfield-none">${icon('image', 30)}<b>Click or drop an image</b><small>JPG, PNG or WebP</small></span>
            <span class="imgfield-badge" data-badge hidden></span>
          </div>
          <div class="imgfield-side">
            <input type="hidden" id="${id}" name="${f.key}" value="${esc(val)}">
            <p class="imgfield-state" data-state></p>
            <div class="imgfield-btns">
              <button type="button" class="btn sm" data-pick>${icon('up', 16)} <span data-pick-label>Upload image</span></button>
              <button type="button" class="btn sm ghost" data-reset hidden>Use default</button>
            </div>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden data-file>
          </div>
        </div>`;
        break;
      case 'slug': input = text('text', ` pattern="[a-z0-9]+(-[a-z0-9]+)*" data-slug${max}`); break;
      default: input = text('text', `${max}${list}${f.placeholder ? ` placeholder="${esc(f.placeholder)}"` : ''}`);
    }
    const optional = !f.required && !['select', 'hue', 'number'].includes(f.type);
    return `<div class="field${half}"><label for="${id}">${esc(f.label)}${optional ? ' <em>(optional)</em>' : ''}</label>${input}${hint}</div>`;
  }

  function datalists(name) {
    const C = S.content.collections;
    const uniq = a => [...new Set(a.filter(Boolean))].sort();
    const links = [
      ...C.competitions.map(c => [`event.html?id=${c.id}`, c.name]),
      ['events.html', 'All events'], ['schedule.html', 'Schedule'], ['about.html#stay', 'Accommodation & travel'],
    ];
    const opts = arr => arr.map(v => (Array.isArray(v) ? `<option value="${esc(v[0])}">${esc(v[1])}</option>` : `<option value="${esc(v)}">`)).join('');
    return `<datalist id="dl-cat">${opts(uniq((C[name] || []).map(i => i.cat)))}</datalist>
      <datalist id="dl-venue">${opts(uniq(C.schedule.map(s => s.venue)))}</datalist>
      <datalist id="dl-links">${opts(links)}</datalist>`;
  }

  function readForm(fields, form) {
    const out = {};
    fields.forEach(f => {
      if (f.type === 'heading') return;
      const el = form.elements[f.key];
      if (el) out[f.key] = f.type === 'bool' ? el.checked : el.value;
    });
    return out;
  }

  function showErrors(form, errors) {
    const box = $('.form-errors', form);
    box.hidden = !errors.length;
    box.innerHTML = errors.length ? `${icon('alert', 18)}<ul>${errors.map(e => `<li>${esc(e)}</li>`).join('')}</ul>` : '';
    if (errors.length) box.scrollIntoView({ block: 'nearest' });
  }

  function checkNative(form) {
    if (form.checkValidity()) return true;
    $$('.input', form).forEach(i => i.closest('.field')?.classList.toggle('bad', !i.checkValidity()));
    const bad = $$(':invalid', form).find(x => x.matches('input, select, textarea'));
    bad && bad.focus();
    return false;
  }

  function bindFieldHelpers(form, col) {
    form.addEventListener('input', e => {
      e.target.closest('.field')?.classList.remove('bad');
      if (e.target.type === 'range') {
        const out = e.target.nextElementSibling;
        out.value = e.target.value;
        out.style.setProperty('--h', e.target.value);
      }
    });
    $$('[data-imgfield]', form).forEach(box => {
      const hid = $('input[type=hidden]', box), img = $('img', box), none = $('.imgfield-none', box), badge = $('[data-badge]', box);
      const state = $('[data-state]', box), pick = $('[data-pick]', box), label = $('[data-pick-label]', box);
      const reset = $('[data-reset]', box), file = $('[data-file]', box), drop = $('[data-drop]', box);
      const idOf = () => (form.elements.id?.value || SC.slugify(form.elements.name?.value || '')).trim();
      const showImg = (src, tag) => {
        img.onerror = () => { img.hidden = true; none.hidden = false; badge.hidden = true; state.textContent = 'No image yet. The emblem artwork is shown on the site until you upload one.'; };
        img.onload = () => { img.hidden = false; none.hidden = true; badge.hidden = !tag; badge.textContent = tag || ''; };
        // Saved paths are relative to the site root; this page lives in /admin/.
        img.src = /^(https?:|\/|blob:|data:)/.test(src) ? src : '../' + src;
      };
      const clearImg = () => { img.removeAttribute('src'); img.hidden = true; none.hidden = false; badge.hidden = true; };
      const refresh = () => {
        const custom = hid.value, def = idOf() ? box.dataset.defaultDir + idOf() + '.jpg' : '';
        reset.hidden = !custom;
        label.textContent = custom ? 'Replace image' : 'Upload image';
        if (custom) { state.textContent = 'Your uploaded image is used on the site.'; showImg(custom, 'Uploaded'); }
        else if (def) { state.textContent = 'Using the default image. Upload one to replace it.'; showImg(def, 'Default'); }
        else { state.textContent = 'No image yet. Upload one, or the emblem artwork is shown.'; clearImg(); }
      };
      const handle = async f => {
        if (!f) return;
        // Show the chosen picture straight away, then swap to the saved copy once it is uploaded.
        const local = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.onerror = () => r(''); fr.readAsDataURL(f); });
        if (local) {
          img.onload = () => { img.hidden = false; none.hidden = true; badge.hidden = false; badge.textContent = 'Uploading…'; };
          img.onerror = null; img.src = local;
        }
        pick.disabled = true; state.textContent = 'Uploading…';
        try {
          hid.value = await uploadImage(f);
          form.dispatchEvent(new Event('input', { bubbles: true }));
          showImg(hid.value, 'Uploaded');
          state.textContent = 'Uploaded. It goes live when you save.';
          reset.hidden = false; label.textContent = 'Replace image';
        } catch (e) { report(e); refresh(); }
        pick.disabled = false;
      };
      pick.addEventListener('click', () => file.click());
      drop.addEventListener('click', () => file.click());
      drop.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); file.click(); } });
      file.addEventListener('change', () => { const f = file.files[0]; file.value = ''; handle(f); });
      ['dragenter', 'dragover'].forEach(n => drop.addEventListener(n, e => { e.preventDefault(); drop.classList.add('over'); }));
      ['dragleave', 'drop'].forEach(n => drop.addEventListener(n, e => { e.preventDefault(); drop.classList.remove('over'); }));
      drop.addEventListener('drop', e => handle(e.dataTransfer.files[0]));
      reset.addEventListener('click', () => { hid.value = ''; form.dispatchEvent(new Event('input', { bubbles: true })); refresh(); });
      form.elements.id?.addEventListener('input', () => !hid.value && refresh());
      form.elements.name?.addEventListener('input', () => !hid.value && refresh());
      refresh();
    });
    // Suggest the page id from the name as it's typed.
    $$('[data-rules-ed]', form).forEach(box => {
      const ta = $('textarea', box);
      box.addEventListener('click', e => {
        const b = e.target.closest('[data-rule]'); if (!b) return;
        const v = ta.value, a = ta.selectionStart, z = ta.selectionEnd;
        const ls = v.lastIndexOf('\n', a - 1) + 1;
        let le = v.indexOf('\n', z); if (le < 0) le = v.length;
        const act = b.dataset.rule;
        if (act === 'rule' || act === 'sub') {
          const cur = v.slice(ls, le), ind = (cur.match(/^ */) || [''])[0];
          const add = act === 'rule' ? '' : (/^\s*[-•*▪]/.test(cur) ? ind : '') + '- ';
          const ins = (v.length && !v.endsWith('\n') ? '\n' : '') + add;
          ta.value = v + ins; ta.selectionStart = ta.selectionEnd = ta.value.length;
        } else {
          const block = v.slice(ls, le).split('\n').map(l => !l.trim() ? l : act === 'indent' ? '  ' + l : l.replace(/^ {1,2}/, '')).join('\n');
          ta.value = v.slice(0, ls) + block + v.slice(le);
          ta.selectionStart = ls; ta.selectionEnd = ls + block.length;
        }
        ta.focus(); ta.dispatchEvent(new Event('input', { bubbles: true }));
      });
      ta.addEventListener('keydown', e => {
        if (e.key !== 'Tab') return; e.preventDefault();
        box.querySelector(`[data-rule="${e.shiftKey ? 'outdent' : 'indent'}"]`).click();
      });
    });
    const slug = $('[data-slug]', form), nameEl = form.elements.name;
    if (slug && nameEl) {
      const sync = () => { slug.placeholder = SC.slugify(nameEl.value) || 'created-from-the-name'; };
      nameEl.addEventListener('input', sync);
      sync();
    }
  }

  /* ------------------------------------------------------------- editor */
  function openEditor(name, item = null, copy = false) {
    const col = SC.collections[name];
    const isNew = !item || copy;
    const fest = S.content.settings.fest;
    const data = item ? JSON.parse(JSON.stringify(item)) : Object.fromEntries(col.fields.map(f => [f.key,
      f.default != null ? f.default : f.type === 'list' || f.type === 'rules' || f.type === 'people' ? [] : f.type === 'bool' ? false : '']));
    if (!item && 'day' in data) data.day = fest.start.slice(0, 10);
    if (copy) {
      data.id = '';
      if (typeof col.title === 'string') data[col.title] = `${data[col.title]} (copy)`;
    }
    const heading = isNew && !copy ? `New ${col.singular.toLowerCase()}` : SC.itemTitle(col, data);

    const d = document.createElement('dialog');
    d.className = 'drawer';
    d.setAttribute('aria-labelledby', 'drawer-h');
    d.innerHTML = `<form class="drawer-in" novalidate>
      <header class="drawer-head">
        <div><p class="kicker">${isNew ? (copy ? 'Duplicate' : 'Create') : 'Edit'} · ${esc(col.singular)}</p><h2 id="drawer-h">${esc(heading)}</h2></div>
        <button type="button" class="icon-btn" data-x aria-label="Close">${icon('close')}</button>
      </header>
      <div class="drawer-body">
        <div class="form-errors" role="alert" hidden></div>
        <div class="form-grid">${col.fields.map(f => fieldHTML(f, data[f.key])).join('')}</div>
        ${datalists(name)}
      </div>
      <footer class="drawer-foot">
        ${isNew ? '' : `<button type="button" class="btn sm ghost danger" data-del>${icon('trash', 16)} Delete</button>`}
        <span class="grow"></span>
        <button type="button" class="btn sm ghost" data-x>Cancel</button>
        <button type="submit" class="btn sm">${isNew ? 'Create' : 'Save changes'}</button>
      </footer>
    </form>`;
    document.body.appendChild(d);
    d.showModal();
    const form = $('form', d);
    let dirty = false;
    form.addEventListener('input', () => { dirty = true; });
    bindFieldHelpers(form, col);
    setTimeout(() => form.elements[col.fields[0].key]?.focus(), 30);

    const close = async force => {
      if (!force && dirty && !(await confirmBox('Discard your changes?', 'This form has edits that are not saved yet.', 'Discard'))) return;
      d.close();
      d.remove();
      if (routeParts().length > 2) history.replaceState(null, '', `#/c/${name}`);
    };
    d.addEventListener('cancel', e => { e.preventDefault(); close(); });
    d.addEventListener('click', e => { if (e.target === d || e.target.closest('[data-x]')) close(); });
    $('[data-del]', d)?.addEventListener('click', async () => {
      if (!(await confirmBox(`Delete "${SC.itemTitle(col, item)}"?`, 'It disappears from the site straight away and can\'t be restored.', 'Delete'))) return;
      try {
        await call('DELETE', `admin/${name}/${encodeURIComponent(item.id)}`);
        S.content.collections[name] = S.content.collections[name].filter(x => x.id !== item.id);
        await close(true);
        route();
        toast('Deleted.', 'ok');
      } catch (e) { report(e); }
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      showErrors(form, []);
      if (!checkNative(form)) return;
      const btn = $('button[type=submit]', form);
      btn.disabled = true;
      try {
        const body = readForm(col.fields, form);
        const res = isNew
          ? await call('POST', `admin/${name}`, body)
          : await call('PUT', `admin/${name}/${encodeURIComponent(item.id)}`, body);
        const list = S.content.collections[name];
        if (isNew) list.push(res.item);
        else list[list.findIndex(x => x.id === item.id)] = res.item;
        await close(true);
        route();
        toast(isNew ? `${col.singular} created.` : 'Changes saved. They are live on the site.', 'ok');
      } catch (err) {
        if (!err.quiet) showErrors(form, err.errors.length ? err.errors : [err.message]);
        btn.disabled = false;
      }
    });
  }

  /* ------------------------------------------------------ registrations */
  const personOf = s => s.data.name || s.data.email || (s.data.question ? `"${s.data.question.slice(0, 60)}${s.data.question.length > 60 ? '…' : ''}"` : 'Anonymous');
  function refLabel(ref) {
    const [kind, id] = String(ref || '').split(':');
    const C = S.content.collections;
    if (kind === 'competition') { const c = C.competitions.find(x => x.id === id); return `Event · ${c ? c.name : id}`; }
    const NAMED = { 'team-registration': 'Team registration', 'fest-pass': 'Fest pass', ambassador: 'Campus Ambassador', sponsorship: 'Sponsorship', volunteer: 'Volunteer', expo: 'Project Expo stall', accommodation: 'Accommodation help', contact: 'Contact form' };
    return NAMED[ref] || ref || '';
  }
  const LABELS = { students: 'Students', faculty: 'Faculty Coordinator', facultyPhone: 'Faculty phone', leader: 'Team Leader', participants: 'Participants', name: 'Name', email: 'Email', phone: 'Phone', gender: 'Gender', college: 'College', city: 'City', team: 'Team name', ref: 'Referral', year: 'Year', interest: 'Interested in', topic: 'Topic', msg: 'Message', question: 'Question', company: 'Company', role: 'Role', teamPref: 'Team preference', why: 'Why join', project: 'Project', about: 'About the project', people: 'People' };

  function viewSubs() {
    const forms = {};
    S.subs.forEach(s => { forms[s.form] = (forms[s.form] || 0) + 1; });
    head('Inbox', 'Registrations', `
      <button class="btn sm ghost" data-refresh>${icon('refresh', 16)} Refresh</button>
      <a class="btn sm ghost" href="/api/admin/submissions/export.csv" download>${icon('download', 16)} Export CSV</a>`);
    $('#view').innerHTML = `
      <div class="adm-tools">
        <select class="input sel" aria-label="Filter by form" data-form>
          <option value="">All forms (${S.subs.length})</option>
          ${Object.entries(forms).sort((a, b) => b[1] - a[1]).map(([f, n]) => `<option value="${esc(f)}">${esc(f)} (${n})</option>`).join('')}
        </select>
        <label class="search">${icon('search', 18)}<input type="search" placeholder="Search names, emails, colleges" aria-label="Search registrations" data-q></label>
        <span class="mono muted small" data-count></span>
      </div>
      <div class="subs"></div>
      <p class="empty" hidden></p>`;
    const box = $('.subs'), empty = $('#view .empty');
    let form = '', q = '';
    const LIMIT = 200;
    const draw = () => {
      const list = S.subs.filter(s => (!form || s.form === form) && (!q || JSON.stringify(s).toLowerCase().includes(q)));
      box.innerHTML = list.slice(0, LIMIT).map(s => `
        <details class="sub hud" data-id="${esc(s.id)}">
          <summary>
            <span class="sub-who"><b>${esc(personOf(s))}</b><span class="muted">${esc(s.data.email || s.data.phone || '')}</span></span>
            <span class="sub-form">${esc(s.form)}</span>
            <time class="mono muted" datetime="${esc(s.at)}" title="${esc(fullTime(s.at))}">${esc(ago(s.at))}</time>
            ${icon('chevron', 16)}
          </summary>
          <div class="sub-body">
            <dl>${Object.entries(s.data).map(([k, v]) => `<div><dt>${esc(LABELS[k] || k)}</dt><dd>${k === 'email' ? `<a href="mailto:${esc(v)}">${esc(v)}</a>` : k === 'phone' ? `<a href="tel:${esc(v.replace(/[^0-9+]/g, ''))}">${esc(v)}</a>` : esc(v) || '—'}</dd></div>`).join('')}</dl>
            <div class="sub-foot"><span class="mono muted small">${esc(refLabel(s.ref))}${s.ref ? ' · ' : ''}${esc(fullTime(s.at))}</span>
              <button class="btn sm ghost danger" data-del>${icon('trash', 16)} Delete</button></div>
          </div>
        </details>`).join('');
      $('[data-count]').textContent = list.length > LIMIT ? `Showing ${LIMIT} of ${list.length}. Search or export CSV for the rest.` : `${list.length} shown`;
      empty.hidden = list.length > 0;
      empty.textContent = S.subs.length ? 'Nothing matches those filters.' : 'No registrations yet. Every form on the site sends its entries here while backend.js is running.';
    };
    $('[data-form]').addEventListener('change', e => { form = e.target.value; draw(); });
    $('[data-q]').addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); draw(); });
    $('[data-refresh]').addEventListener('click', async () => {
      try { await loadSubs(); drawNav(); viewSubs(); toast('Inbox refreshed.', 'ok'); } catch (e) { report(e); }
    });
    box.addEventListener('click', async e => {
      const b = e.target.closest('[data-del]');
      if (!b) return;
      const el = b.closest('.sub'), s = S.subs.find(x => x.id === el.dataset.id);
      if (!s || !(await confirmBox(`Delete the entry from ${personOf(s)}?`, 'It is removed from the inbox and future CSV exports.', 'Delete'))) return;
      try {
        await call('DELETE', `admin/submissions/${encodeURIComponent(s.id)}`);
        S.subs = S.subs.filter(x => x.id !== s.id);
        draw(); drawNav();
        toast('Entry deleted.', 'ok');
      } catch (err) { report(err); }
    });
    draw();
  }

  /* ----------------------------------------------------------- settings */
  function viewSettings() {
    head('Configuration', 'Settings');
    const seeded = S.content.seededAt ? fmtDay(new Date(S.content.seededAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })) : '';
    $('#view').innerHTML = Object.entries(SC.settings).map(([key, g]) => `
      <form class="panel hud set-card" data-group="${key}" novalidate>
        <div class="panel-top"><h2>${esc(g.label)}</h2>${key === 'protocols' ? '<p class="muted small">Shown as "The sealed codex" on the home page.</p>' : ''}</div>
        <div class="form-errors" role="alert" hidden></div>
        <div class="form-grid">${g.fields.map(f => fieldHTML(f, S.content.settings[key][f.key])).join('')}</div>
        <div class="set-foot"><button class="btn sm" type="submit">Save ${esc(g.label.toLowerCase())}</button></div>
      </form>`).join('') + `
      <section class="panel hud set-card">
        <div class="panel-top"><h2>Publishing</h2></div>
        <p class="muted">Changes are stored in <code>storage/db.json</code> and go live as soon as you save, for as long as <code>backend.js</code> is running.
          To host the site somewhere without the server (GitHub Pages, Netlify), export a <code>data.js</code> and use it to replace <code>assets/js/data.js</code>, and copy the <code>assets/uploads/</code> folder along with it (uploaded images live there).</p>
        <div class="set-foot"><a class="btn sm ghost" href="/api/admin/export/data.js" download>${icon('download', 16)} Export data.js</a></div>
        ${seeded ? `<p class="mono muted small">Content first imported from data.js on ${esc(seeded)}.</p>` : ''}
      </section>`;
    $$('form[data-group]').forEach(form => {
      const key = form.dataset.group, g = SC.settings[key];
      bindFieldHelpers(form, g);
      form.addEventListener('submit', async e => {
        e.preventDefault();
        showErrors(form, []);
        if (!checkNative(form)) return;
        const btn = $('button[type=submit]', form);
        btn.disabled = true;
        try {
          const res = await call('PUT', `admin/settings/${key}`, readForm(g.fields, form));
          S.content.settings[key] = res.value;
          $('[data-fest-name]').textContent = S.content.settings.fest.name;
          toast(`${g.label} saved. The site is updated.`, 'ok');
        } catch (err) {
          if (!err.quiet) showErrors(form, err.errors.length ? err.errors : [err.message]);
        }
        btn.disabled = false;
      });
    });
  }

  start();
})();
