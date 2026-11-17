/* ==========================================================================
   Core: layout shell, procedural graphics and the shared motion system.
   Exposes window.TNX for pages.js. Boots on DOMContentLoaded.
   ========================================================================== */
(() => {
  'use strict';

  const TN = window.TN || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const page = document.body.dataset.page || 'home';
  const session = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* storage blocked */ } },
  };

  /* ---------------------------------------------------------------- utils */
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const inr = n => '₹' + Number(n).toLocaleString('en-IN');
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const fmtDate = (iso, short) => {
    const d = new Date(iso);
    const m = MONTHS[d.getMonth()];
    return `${d.getDate()} ${short ? m.slice(0, 3) : m}${short ? '' : ' ' + d.getFullYear()}`;
  };
  const festRange = () => {
    const a = new Date(TN.fest.start), b = new Date(TN.fest.end);
    return a.getMonth() === b.getMonth()
      ? `${a.getDate()}–${b.getDate()} ${MONTHS[a.getMonth()]} ${a.getFullYear()}`
      : `${fmtDate(TN.fest.start)} – ${fmtDate(TN.fest.end)}`;
  };
  // Early-bird badges and prices switch off by themselves once the date passes.
  const earlyOn = () => Date.now() < new Date(TN.fest.earlyBirdEnds).getTime();
  // Fills {placeholders} in content strings from fest data.
  const fill = s => String(s)
    .replace('{dates}', festRange())
    .replace('{venue}', TN.fest.venue)
    .replace('{early}', fmtDate(TN.fest.earlyBirdEnds))
    .replace('{ncomp}', (TN.competitions || []).length);

  // Small seeded RNG so procedural art is stable between visits.
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const hashStr = s => { let h = 2166136261; for (const c of String(s)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };

  /* ---------------------------------------------------------------- icons */
  const ICONS = {
    home: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
    spark: 'M12 3l2.2 6.3L20.5 12l-6.3 2.2L12 21l-2.2-6.8L3.5 12l6.3-2.7z',
    trophy: 'M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8M10 17h4',
    cap: 'M2 9l10-5 10 5-10 5zM6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5M22 9v6',
    bed: 'M3 19V6M3 14h18v5M21 14v-2a3 3 0 0 0-3-3h-7v5M7 11.5v.01',
    mail: 'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM3 7l9 6 9-6',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
    users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2 20a7 7 0 0 1 14 0M16 4.5a3.5 3.5 0 0 1 0 6.5M18 13.5a6 6 0 0 1 4 6.5',
    globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z',
    chat: 'M4 5h16v11H9l-5 4z',
    close: 'M6 6l12 12M18 6L6 18',
    arrow: 'M5 12h14M13 6l6 6-6 6',
    back: 'M19 12H5M11 6l-6 6 6 6',
    menu: 'M4 7h16M4 12h16M4 17h10',
    calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
    pin: 'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
    clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
    search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
    send: 'M4 12l16-8-6 16-2.5-6.5z',
    rocket: 'M12 3c3 2 5 5.5 5 9.5L15 16H9l-2-3.5C7 8.5 9 5 12 3zM12 10.5v.01M9 16l-2 4 3-1.5M15 16l2 4-3-1.5',
    chevron: 'M9 6l6 6-6 6',
    down: 'M6 9l6 6 6-6',
    play: 'M8 5v14l11-7z',
    check: 'M5 12.5l4.5 4.5L19 7',
    plus: 'M12 5v14M5 12h14',
    shield: 'M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z',
    night: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z',
    logout: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
    phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z',
    external: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
    lock: 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3M12 15v2',
    download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
    ticket: 'M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4zM14 7v10',
    layers: 'M12 3l9 4.5-9 4.5-9-4.5zM3 12l9 4.5 9-4.5M3 16.5L12 21l9-4.5',
    instagram: 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM17.5 6.5v.01',
    x: 'M4 4h4.5L20 20h-4.5zM20 4l-6.6 7.2M4 20l6.6-7.2',
    linkedin: 'M4 9h4v11H4zM6 4.5v.01M11 20v-6.5a3.5 3.5 0 0 1 7 0V20M11 9v11',
    youtube: 'M3 8.5a3 3 0 0 1 2.6-3c4.2-.5 8.6-.5 12.8 0a3 3 0 0 1 2.6 3v7a3 3 0 0 1-2.6 3c-4.2.5-8.6.5-12.8 0a3 3 0 0 1-2.6-3zM10 9v6l5-3z',
    facebook: 'M14 21v-8h3l.5-3.5H14V7.5c0-1 .4-1.8 1.9-1.8H18V2.6c-.4 0-1.6-.1-3-.1-3 0-4.9 1.8-4.9 5v2.9H7V13h3.1v8',
    whatsapp: 'M4 20l1.3-4A8 8 0 1 1 8 18.7zM9 9c0 3 3 6 6 6l1.2-1.4-2-1-1 .8c-1-.5-1.9-1.4-2.4-2.4l.8-1-1-2z',
  };
  const icon = (n, s = 20) =>
    `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICONS[n] || ICONS.spark}"/></svg>`;

  /* -------------------------------------------------------------- emblems
     Line-art glyphs drawn inside a ±46 box, framed by rotating rings. */
  const gear = (r, teeth, depth) => {
    let d = '';
    for (let i = 0; i < teeth * 2; i++) {
      const a0 = (i / (teeth * 2)) * Math.PI * 2, a1 = ((i + 1) / (teeth * 2)) * Math.PI * 2;
      const rr = i % 2 ? r : r + depth;
      d += `${i ? 'L' : 'M'}${(Math.cos(a0) * rr).toFixed(1)} ${(Math.sin(a0) * rr).toFixed(1)}L${(Math.cos(a1) * rr).toFixed(1)} ${(Math.sin(a1) * rr).toFixed(1)}`;
    }
    return d + 'Z';
  };
  const GLYPHS = {
    robot: `<rect x="-28" y="-20" width="56" height="44" rx="10"/><circle cx="-11" cy="0" r="6"/><circle cx="11" cy="0" r="6"/><path d="M-10 14h20M0 -20v-12"/><circle cx="0" cy="-36" r="4"/><path d="M-28 -2h-8v12h8M28 -2h8v12h-8"/>`,
    rocket: `<path d="M0 -46C16 -30 18 -8 14 18H-14C-18 -8 -16 -30 0 -46Z"/><circle cx="0" cy="-14" r="7"/><path d="M-14 4L-27 24L-13 19M14 4L27 24L13 19M-7 22Q0 42 7 22"/>`,
    code: `<path d="M-18 -24L-40 0L-18 24M18 -24L40 0L18 24M8 -32L-8 32"/>`,
    design: `<path d="M0 -40L-24 36M0 -40L24 36M-15 8H15"/><circle cx="0" cy="-40" r="5"/><path d="M-36 36A44 44 0 0 1 36 36" stroke-dasharray="3 5"/>`,
    business: `<path d="M-36 32H36M-28 32V8M-10 32V-4M8 32V2M26 32V-18M-32 -2L-10 -18L6 -10L32 -34M22 -34H32V-24"/>`,
    gaming: `<path d="M-30 -14H30A14 14 0 0 1 44 -1L47 18A8 8 0 0 1 33 24L22 12H-22L-33 24A8 8 0 0 1 -47 18L-44 -1A14 14 0 0 1 -30 -14Z"/><path d="M-24 -4V8M-30 2H-18"/><circle cx="20" cy="-2" r="3"/><circle cx="28" cy="6" r="3"/>`,
    science: `<ellipse rx="44" ry="15"/><ellipse rx="44" ry="15" transform="rotate(60)"/><ellipse rx="44" ry="15" transform="rotate(120)"/><circle r="5" fill="currentColor"/>`,
    civil: `<path d="M-46 18H46M-40 18Q0 -46 40 18M-40 18V34M40 18V34M-24 18V-6M-12 18V-16M0 18V-19M12 18V-16M24 18V-6"/>`,
    bio: `<path d="M-14 -44C14 -30 14 -14 -14 0S-14 30 14 44M14 -44C-14 -30 -14 -14 14 0S14 30 -14 44M-10 -34H10M-12 -8H12M-12 8H12M-10 34H10"/>`,
    lecture: `<rect x="-11" y="-42" width="22" height="42" rx="11"/><path d="M-22 -10A22 22 0 0 0 22 -10M0 12V30M-16 30H16"/>`,
    exhibit: `<path d="M0 -42L44 32H-44Z"/><path d="M-18 8Q0 -8 18 8Q0 24 -18 8Z"/><circle cx="0" cy="8" r="5"/>`,
    night: `<path d="M0 -44V44M-44 0H44M-31 -31L31 31M31 -31L-31 31" stroke-dasharray="2 6"/><circle r="12"/><circle r="4" fill="currentColor"/>`,
    ignite: `<path d="M0 -44C18 -22 28 -4 20 16A20 20 0 0 1 -20 16C-28 -4 -8 -16 0 -44Z"/><path d="M0 -6C8 4 10 12 6 20A6 6 0 0 1 -6 20C-10 12 -4 6 0 -6Z"/>`,
    stay: `<path d="M16 -36A34 34 0 1 0 38 6A26 26 0 1 1 16 -36Z"/><path d="M-30 -30v.01M-38 -6v.01M22 30v.01"/>`,
    cap: `<path d="M-46 -10L0 -32L46 -10L0 12Z"/><path d="M-26 0V22C-26 30 26 30 26 22V0M46 -10V18"/>`,
    globe: `<circle r="40"/><ellipse rx="16" ry="40"/><path d="M-40 0H40M-34 -20H34M-34 20H34"/>`,
    spark: `<path d="M0 -44L10 -10L44 0L10 10L0 44L-10 10L-44 0L-10 -10Z"/><circle r="6"/>`,
    seal: `<circle r="44" stroke-dasharray="3 5"/><path d="M-13 -6V-16A13 13 0 0 1 13 -16V-6"/><rect x="-21" y="-6" width="42" height="32" rx="5"/><circle cx="0" cy="6" r="4"/><path d="M0 10V17"/>`,
  };
  let uid = 0;
  function emblem(kind, hue = 210) {
    const id = 'em' + (++uid);
    const c1 = `hsl(${hue} 90% 72%)`, c2 = `hsl(${hue} 85% 55%)`;
    let ticks = '';
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2, r0 = i % 4 ? 88 : 84;
      ticks += `M${(Math.cos(a) * r0).toFixed(1)} ${(Math.sin(a) * r0).toFixed(1)}L${(Math.cos(a) * 92).toFixed(1)} ${(Math.sin(a) * 92).toFixed(1)}`;
    }
    return `<svg class="emblem" viewBox="-100 -100 200 200" aria-hidden="true">
      <defs><radialGradient id="${id}"><stop offset="0" stop-color="${c2}" stop-opacity=".5"/><stop offset="1" stop-color="${c2}" stop-opacity="0"/></radialGradient></defs>
      <circle r="70" fill="url(#${id})"/>
      <g class="em-r1" stroke="${c1}" fill="none"><circle r="92" stroke-opacity=".25"/><path d="${ticks}" stroke-opacity=".5"/></g>
      <g class="em-r2" stroke="${c1}" fill="none"><circle r="76" stroke-opacity=".4" stroke-dasharray="1 7" stroke-width="2"/><circle cx="76" r="3" fill="${c1}"/></g>
      <g class="em-g" fill="none" stroke="${c1}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" color="${c1}">${GLYPHS[kind] || GLYPHS.spark}</g>
    </svg>`;
  }

  /* ------------------------------------------------------------ astrolabe
     The hero centrepiece: concentric rings that counter-rotate. */
  function astrolabe({ small = false } = {}) {
    const P = (a, r) => [(Math.cos(a) * r).toFixed(2), (Math.sin(a) * r).toFixed(2)];
    let ticks = '';
    for (let i = 0; i < 120; i++) {
      const a = (i / 120) * Math.PI * 2, long = i % 10 === 0, mid = i % 5 === 0;
      const [x0, y0] = P(a, long ? 222 : mid ? 229 : 233), [x1, y1] = P(a, 240);
      ticks += `M${x0} ${y0}L${x1} ${y1}`;
    }
    const numerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    let nodes = '';
    numerals.forEach((n, i) => {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const [x, y] = P(a, 170), [tx, ty] = P(a, 146);
      nodes += `<circle cx="${x}" cy="${y}" r="4" class="ast-node"/><text x="${tx}" y="${ty}" class="ast-num" text-anchor="middle" dominant-baseline="central">${n}</text>`;
    });
    const tri = r => { const p = [0, 1, 2].map(i => P((i / 3) * Math.PI * 2 - Math.PI / 2, r)); return `M${p[0]}L${p[1]}L${p[2]}Z`; };
    const tri2 = r => { const p = [0, 1, 2].map(i => P((i / 3) * Math.PI * 2 + Math.PI / 2, r)); return `M${p[0]}L${p[1]}L${p[2]}Z`; };
    const label = `${TN.fest.theme.toUpperCase()} ✦ ${TN.fest.name.toUpperCase()} ✦ EDITION ${String(TN.fest.edition).toUpperCase()} ✦ `;
    const pid = 'astp' + (++uid), gid = 'astg' + uid;
    return `<svg class="astrolabe${small ? ' small' : ''}" viewBox="-250 -250 500 500" aria-hidden="true">
      <defs>
        <path id="${pid}" d="M0 -212A212 212 0 1 1 -0.01 -212"/>
        <radialGradient id="${gid}"><stop offset="0" stop-color="#4facfe" stop-opacity=".35"/><stop offset=".6" stop-color="#2f6fed" stop-opacity=".06"/><stop offset="1" stop-color="#2f6fed" stop-opacity="0"/></radialGradient>
      </defs>
      <circle r="245" fill="url(#${gid})"/>
      <g class="ast-r1"><circle r="240" pathLength="1" class="ast-line"/><path d="${ticks}" class="ast-tick"/></g>
      <g class="ast-r2"><circle r="200" pathLength="1" class="ast-line"/><text class="ast-text"><textPath href="#${pid}">${label.repeat(2)}</textPath></text></g>
      <g class="ast-r3"><circle r="170" pathLength="1" class="ast-line dashed"/>${nodes}</g>
      <g class="ast-r4"><circle r="120" pathLength="1" class="ast-line"/><path d="${tri(120)}" pathLength="1" class="ast-line gold"/><path d="${tri2(120)}" pathLength="1" class="ast-line"/></g>
      <g class="ast-r5"><ellipse rx="92" ry="38" pathLength="1" class="ast-line faint"/><ellipse rx="92" ry="38" transform="rotate(60)" pathLength="1" class="ast-line faint"/><ellipse rx="92" ry="38" transform="rotate(120)" pathLength="1" class="ast-line faint"/></g>
      <g class="ast-orbit"><circle cx="200" r="5" class="ast-dot"/><circle cx="-120" r="3.5" class="ast-dot gold"/></g>
      <circle r="60" pathLength="1" class="ast-line"/>
      <circle r="7" class="ast-core"/>
    </svg>`;
  }

  // TechNation logo mark (assets/logo-mark.svg).
  const logo = () => `<img class="logo-mark" src="assets/logo-mark.svg" alt="" width="52" height="40" decoding="async">`;
  const yearOf = () => new Date(TN.fest.start).getFullYear();
  const brandSub = () => (String(TN.fest.edition) === String(yearOf()) ? `Edition ${yearOf()}` : `Edition ${TN.fest.edition} · ${yearOf()}`).toUpperCase();
  const mascot = (name, alt = '') => `<img class="mascot" src="assets/mascots/${name}.png" alt="${esc(alt)}" width="320" height="320" loading="lazy" decoding="async">`;

  /* ------------------------------------------------------------ navigation */
  const NAV = [
    { label: 'Home', href: 'index.html', icon: 'home' },
    { label: 'Events', icon: 'spark', items: [
      { label: 'All events', href: 'events.html', text: 'Competitions & challenges' },
      { label: 'Schedule', href: 'schedule.html', text: 'Day-by-day timetable' },
    ] },
    { label: 'Gallery', href: 'gallery.html', icon: 'layers' },
    { label: 'Sponsors', href: 'sponsors.html', icon: 'trophy' },
    { label: 'Team', href: 'team.html', icon: 'users' },
    { label: 'About Us', href: 'about.html', icon: 'globe' },
  ];
  const FOOTER = [
    { h: 'Participate', links: [['All events', 'events.html'], ['Schedule', 'schedule.html']] },
    { h: 'Experience', links: [['Gallery', 'gallery.html'], ['Sponsors', 'sponsors.html']] },
    { h: 'About', links: [['About us', 'about.html'], ['Team', 'team.html']] },
  ];
  const DETAIL_PARENT = { event: 'events.html' };
  const currentFile = (() => {
    const f = location.pathname.split('/').pop();
    return DETAIL_PARENT[page] || (f && f.endsWith('.html') ? f : 'index.html');
  })();
  const cur = href => (href === currentFile ? ' aria-current="page"' : '');

  function headerHTML() {
    const links = NAV.map(item => {
      if (item.items) {
        const active = item.items.some(i => i.href === currentFile);
        return `<li class="has-pop">
          <button class="nav-link" aria-expanded="false" aria-haspopup="true"${active ? ' data-active' : ''}>${item.label}${icon('down', 14)}</button>
          <div class="pop hud"><ul>${item.items.map(i => `<li><a href="${i.href}"${cur(i.href)}><b>${i.label}</b><small>${i.text}</small>${icon('arrow', 16)}</a></li>`).join('')}</ul></div>
        </li>`;
      }
      return `<li><a class="nav-link" href="${item.href}"${cur(item.href)}>${item.badge && earlyOn() ? `<span class="early-bird-badge">${item.badge}</span>` : ''}${item.label}</a></li>`;
    }).join('');
    return `<header class="nav" id="nav">
      <a class="brand" href="index.html" aria-label="${TN.fest.name} home">${logo()}<span class="brand-t"><b>${TN.fest.name.toUpperCase()}</b><small>${brandSub()}</small></span></a>
      <nav class="nav-hud hud" aria-label="Primary"><ul>${links}</ul></nav>
      <div class="nav-right">
        <a class="ces-btn" href="sponsors.html#partner"><span>Sponsor us</span></a>
        <button class="signin hud" data-register-fest>${icon('ticket', 16)}<span>Register team</span></button>
        <button class="burger" aria-label="Open menu" aria-expanded="false" data-burger><i></i><i></i><i></i></button>
      </div>
    </header>`;
  }

  function sidebarHTML() {
    let i = 0;
    const items = NAV.map(item => {
      if (item.items) {
        return `<div class="side-group" style="--i:${i++}"><p class="side-h mono">${item.label}</p>${item.items.map(s => `<a class="side-item sub" href="${s.href}"${cur(s.href)} style="--i:${i++}">${s.label}</a>`).join('')}</div>`;
      }
      return `<a class="side-item" href="${item.href}"${cur(item.href)} style="--i:${i++}">${icon(item.icon, 20)}<span>${item.label}</span>${item.badge && earlyOn() ? `<span class="early-bird-badge inline">${item.badge}</span>` : ''}</a>`;
    }).join('');
    return `<div class="side" id="side" aria-hidden="true" inert>
      <div class="side-bg" data-side-close></div>
      <aside class="side-panel" aria-label="Menu">
        <div class="side-top"><a class="brand" href="index.html">${logo()}<span class="brand-t"><b>${TN.fest.name.toUpperCase()}</b><small>${brandSub()}</small></span></a>
        <button class="icon-btn" data-side-close aria-label="Close menu">${icon('close')}</button></div>
        <nav class="side-nav">${items}
          <a class="side-item" href="sponsors.html#partner" style="--i:${i++}">${icon('rocket', 20)}<span>Sponsor us</span></a>
        </nav>
        <button class="btn full" data-register-fest>${icon('ticket', 18)} Register your college team</button>
        <div class="side-social">${TN.fest.socials.map(s => `<a href="${s.href}" aria-label="${s.name}">${icon(s.icon, 18)}</a>`).join('')}</div>
      </aside>
    </div>`;
  }

  function footerHTML() {
    const f = TN.fest;
    return `<footer class="foot">
      <div class="foot-cta wrap">
        <p class="kicker" data-reveal>Be part of it</p>
        <h2 class="foot-big" data-reveal style="--d:80ms"><span class="shimmer">Join the Nation</span></h2>
        <div class="foot-cta-row" data-reveal style="--d:160ms">
          <a class="btn ghost" href="events.html" data-magnetic>Browse events</a>
          ${brochureBtn()}
        </div>
      </div>
      <div class="foot-grid wrap">
        <div class="foot-brand">
          <a class="brand" href="index.html">${logo()}<span class="brand-t"><b>${f.name.toUpperCase()}</b><small>${brandSub()}</small></span></a>
          <p class="muted">${esc(f.theme)}  ${festRange()}</p>
          <p class="muted small">${esc(f.venue)}</p>
          <div class="socials">${f.socials.map(s => `<a class="soc" href="${esc(s.href)}" aria-label="${esc(s.name)}" data-magnetic>${icon(s.icon, 18)}</a>`).join('')}</div>
        </div>
        ${FOOTER.map(g => `<div class="foot-col"><p class="foot-h mono">${g.h}</p><ul>${g.links.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join('')}</ul></div>`).join('')}
        <div class="foot-col"><p class="foot-h mono">Contact</p><ul>
          <li><a href="about.html#contact">Contact us</a></li>
          <li><a href="mailto:${esc(f.email)}">${esc(f.email)}</a></li>
          <li><a href="${esc(f.mapUrl)}" target="_blank" rel="noopener">Open map ${icon('external', 14)}</a></li>
        </ul></div>
      </div>
      <div class="foot-word" aria-hidden="true">${f.name.toUpperCase()}</div>
      <div class="foot-bottom wrap mono">
        <span>© ${new Date().getFullYear()} ${esc(f.name)} · ${esc(f.host)}</span>
        <span>${esc(f.theme)} · Edition ${esc(f.edition)}</span>
        <a href="#top" data-top>Back to top ↑</a>
      </div>
    </footer>`;
  }

  // Shown only once a brochure link is set in data.js or the dashboard.
  const brochureBtn = (cls = 'btn ghost') => TN.fest.brochureUrl
    ? `<a class="${cls}" href="${esc(TN.fest.brochureUrl)}" target="_blank" rel="noopener" data-magnetic>${icon('download', 18)} Brochure</a>`
    : '';

  /* --------------------------------------------------------------- shell */
  function injectShell() {
    document.body.insertAdjacentHTML('afterbegin',
      `<a class="skip" href="#app">Skip to content</a>
       <canvas id="aether" aria-hidden="true"></canvas>
       <div class="grain" aria-hidden="true"></div>
       <div class="scroll-bar" aria-hidden="true"><i></i></div>
       ${headerHTML()}${sidebarHTML()}`);
    $('#app').insertAdjacentHTML('afterend', footerHTML());
    document.body.insertAdjacentHTML('beforeend',
      `<div class="pt cover instant" aria-hidden="true">${Array.from({ length: 5 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}<div class="pt-mark"><img src="assets/logo-transition.svg" alt="" width="715" height="275" decoding="async"></div></div>
       ${finePointer && !reduce ? '<div class="cur-ring" aria-hidden="true"></div>' : ''}
       <div class="toasts" aria-live="polite"></div>`);
    // The TechNation Assistant chatbot is hidden. Call bot() here to bring it back.
  }

  /* --------------------------------------------------------- nav behaviour */
  function bindNav() {
    const nav = $('#nav'), side = $('#side'), burger = $('[data-burger]');
    const openSide = open => {
      side.classList.toggle('open', open);
      side.setAttribute('aria-hidden', String(!open));
      side.inert = !open; // closed menu links must not be reachable with Tab
      burger.setAttribute('aria-expanded', String(open));
      document.documentElement.classList.toggle('lock', open);
    };
    burger.addEventListener('click', () => openSide(!side.classList.contains('open')));
    side.addEventListener('click', e => { if (e.target.closest('[data-side-close]')) openSide(false); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && side.classList.contains('open')) openSide(false); });

    // Events popout: hover on desktop, click/keyboard everywhere.
    $$('.has-pop').forEach(li => {
      const btn = $('button', li);
      btn.addEventListener('click', () => {
        const open = !li.classList.contains('open');
        li.classList.toggle('open', open);
        btn.setAttribute('aria-expanded', String(open));
      });
      li.addEventListener('mouseleave', () => { li.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); });
    });
    document.addEventListener('click', e => {
      $$('.has-pop.open').forEach(li => { if (!li.contains(e.target)) li.classList.remove('open'); });
    });

    document.addEventListener('click', e => {
      if (e.target.closest('[data-register-fest]')) { e.preventDefault(); openSide(false); registerFest(); }
      const top = e.target.closest('[data-top]');
      if (top) { e.preventDefault(); scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); }
    });

    // Hide nav on scroll down, show on scroll up.
    let last = scrollY;
    onScroll(() => {
      const y = scrollY;
      nav.classList.toggle('scrolled', y > 40);
      nav.classList.toggle('hide', y > last && y > 300 && !side.classList.contains('open'));
      last = y;
      const h = document.documentElement.scrollHeight - innerHeight;
      $('.scroll-bar i').style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    });
  }

  /* ------------------------------------------------------ page transitions */
  function transitions() {
    const pt = $('.pt');
    requestAnimationFrame(() => requestAnimationFrame(() => pt.classList.remove('instant', 'cover')));
    addEventListener('pageshow', e => { if (e.persisted) pt.classList.remove('cover'); });

    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if ((a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      const url = new URL(a.getAttribute('href'), location.href);
      if (url.protocol !== location.protocol || url.host !== location.host) return;
      const samePage = url.pathname === location.pathname && url.search === location.search;
      if (samePage && url.hash) {
        const target = url.hash.length > 1 && document.getElementById(url.hash.slice(1));
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }
        return;
      }
      if (!/\.html$/.test(url.pathname) && !url.pathname.endsWith('/')) return;
      e.preventDefault();
      if (reduce) { location.href = url.href; return; }
      pt.classList.add('cover');
      setTimeout(() => (location.href = url.href), 620);
    });
  }

  /* ------------------------------------------------------------- preloader */
  function preloader() {
    if (page !== 'home' || reduce || session.get('tn-pre')) return Promise.resolve(false);
    session.set('tn-pre', '1');
    const el = document.createElement('div');
    el.className = 'pre';
    el.innerHTML = `<div class="pre-in">
      <div class="pre-num"><b>0</b><span>%</span></div>
      <div class="pre-bar" aria-hidden="true"><i></i></div>
      <p class="pre-status mono">Warming up the engines</p>
    </div>
    <div class="pre-foot mono"><span>${esc(TN.fest.name)} · ${esc(TN.fest.host)}</span><span>${esc(TN.fest.theme)}</span></div>`;
    document.body.appendChild(el);
    const num = $('.pre-num b', el), status = $('.pre-status', el);
    const lines = ['Warming up the engines','Charging the aether', 'Mapping the next frontier', 'Opening the gates'];
    const dur = 2300, t0 = performance.now();
    return new Promise(resolve => {
      const step = now => {
        const p = clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 3);
        num.textContent = Math.round(e * 100);
        el.style.setProperty('--p', e.toFixed(3));
        status.textContent = lines[Math.min(lines.length - 1, Math.floor(p * lines.length))];
        if (p < 1) return requestAnimationFrame(step);
        el.classList.add('done');
        setTimeout(() => resolve(true), 450);
        setTimeout(() => el.remove(), 1400);
      };
      requestAnimationFrame(step);
    });
  }

  /* ---------------------------------------------------------- scroll loop */
  const scrollers = [];
  let ticking = false;
  function onScroll(fn) { scrollers.push(fn); fn(); }
  function runScroll() { ticking = false; scrollers.forEach(fn => fn()); }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(runScroll); } }, { passive: true });
  addEventListener('resize', () => requestAnimationFrame(runScroll));

  /* --------------------------------------------------------------- reveal */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add('in');
      io.unobserve(el);
      if (el.hasAttribute('data-count')) countUp(el);
      $$('[data-count]', el).forEach(countUp);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }) : null;

  function observe(el) {
    if (!io || reduce) {
      el.classList.add('in');
      // Counters nested inside a revealed card must run too (the observer path does the same).
      if (el.hasAttribute('data-count')) countUp(el);
      $$('[data-count]', el).forEach(countUp);
      return;
    }
    io.observe(el);
  }

  function splitText(el) {
    const text = el.textContent;
    let i = 0;
    el.setAttribute('aria-label', text);
    el.innerHTML = text.split(' ').map(word =>
      `<span class="wd" aria-hidden="true">${Array.from(word).map(ch => `<span class="ch" style="--i:${i++}">${esc(ch)}</span>`).join('')}</span>`
    ).join(' ');
    el.classList.add('split');
  }

  function countUp(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
    const target = parseFloat(el.dataset.count), suffix = el.dataset.suffix || '', prefix = el.dataset.prefix || '';
    // Keep the decimals the value was written with (8.75 stays 8.75, 30000 stays whole).
    const dec = (String(el.dataset.count).split('.')[1] || '').length;
    const fmt = v => prefix + v.toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suffix;
    if (reduce) { el.textContent = fmt(target); return; }
    const dur = 2000, t0 = performance.now();
    const step = now => {
      const p = clamp((now - t0) / dur, 0, 1), e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = fmt(dec ? target * e : Math.round(target * e));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function countdown(el) {
    const target = new Date(el.dataset.countdown).getTime();
    el.innerHTML = ['Days', 'Hours', 'Mins', 'Secs'].map(l =>
      `<div class="cd-u"><b class="cd-n">00</b><span class="cd-l">${l}</span></div>`).join('');
    const nums = $$('.cd-n', el);
    const tick = () => {
      const d = Math.max(0, target - Date.now());
      const v = [Math.floor(d / 864e5), Math.floor(d / 36e5) % 24, Math.floor(d / 6e4) % 60, Math.floor(d / 1e3) % 60];
      v.forEach((n, i) => {
        const s = String(n).padStart(2, '0');
        if (nums[i].textContent === s) return;
        nums[i].textContent = s;
        if (!reduce) { nums[i].classList.remove('tick'); void nums[i].offsetWidth; nums[i].classList.add('tick'); }
      });
    };
    tick();
    setInterval(tick, 1000);
  }

  function tilt(el) {
    if (!finePointer || reduce) return;
    const max = parseFloat(el.dataset.tilt) || 8;
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.classList.add('tilting');
      el.style.setProperty('--ty', ((x - 0.5) * max).toFixed(2) + 'deg');
      el.style.setProperty('--tx', ((0.5 - y) * max).toFixed(2) + 'deg');
      el.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
      el.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
    });
    el.addEventListener('pointerleave', () => {
      el.classList.remove('tilting');
      el.style.setProperty('--tx', '0deg');
      el.style.setProperty('--ty', '0deg');
    });
  }

  function magnetic(el) {
    if (!finePointer || reduce) return;
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
    });
    el.addEventListener('pointerleave', () => (el.style.transform = ''));
  }

  function highlightText(el) {
    const words = $$('.w', el);
    let lastN = -1;
    onScroll(() => {
      const r = el.getBoundingClientRect();
      const p = clamp((innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.3), 0, 1);
      const n = reduce ? words.length : Math.round(p * words.length);
      if (n === lastN) return;
      lastN = n;
      words.forEach((w, i) => w.classList.toggle('on', i < n));
    });
  }

  // Pinned section whose track slides sideways as you scroll down.
  function horizontal(sec) {
    const track = $('.hs-track', sec), bar = $('.hs-progress i', sec);
    let dist = 0;
    const narrow = () => innerWidth <= 800 || reduce;
    const measure = () => {
      if (narrow()) { sec.style.height = ''; track.style.transform = ''; return; }
      dist = Math.max(0, track.scrollWidth - innerWidth);
      sec.style.height = innerHeight + dist + 'px';
    };
    measure();
    addEventListener('resize', measure);
    addEventListener('load', measure);
    onScroll(() => {
      if (narrow()) return;
      const p = clamp(-sec.getBoundingClientRect().top / (dist || 1), 0, 1);
      track.style.transform = `translate3d(${(-p * dist).toFixed(1)}px,0,0)`;
      if (bar) bar.style.transform = `scaleX(${p})`;
    });
  }

  function parallax(el) {
    if (reduce) return;
    const s = parseFloat(el.dataset.parallax) || 0.15;
    onScroll(() => {
      const r = el.getBoundingClientRect();
      const c = r.top + r.height / 2 - innerHeight / 2;
      el.style.transform = `translate3d(0,${(c * -s).toFixed(1)}px,0)`;
    });
  }

  function accordion(root) {
    root.addEventListener('click', e => {
      const btn = e.target.closest('.acc-q');
      if (!btn || !root.contains(btn)) return;
      const item = btn.parentElement, open = !item.classList.contains('open');
      if (root.dataset.acc === 'single') $$('.acc-item.open', root).forEach(i => { i.classList.remove('open'); $('.acc-q', i).setAttribute('aria-expanded', 'false'); });
      item.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  }

  function tabs(root) {
    const btns = $$('[role=tab]', root), panels = $$('[role=tabpanel]', root);
    const ink = $('.tab-ink', root);
    const select = (btn, focus) => {
      btns.forEach(b => { const on = b === btn; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
      panels.forEach(p => { p.hidden = p.id !== btn.getAttribute('aria-controls'); if (!p.hidden) { p.classList.remove('in'); void p.offsetWidth; p.classList.add('in'); } });
      if (ink) { ink.style.width = btn.offsetWidth + 'px'; ink.style.transform = `translateX(${btn.offsetLeft}px)`; }
      if (focus) btn.focus();
    };
    btns.forEach((b, i) => {
      b.addEventListener('click', () => select(b));
      b.addEventListener('keydown', e => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (d) select(btns[(i + d + btns.length) % btns.length], true);
      });
    });
    const initial = btns.find(b => b.getAttribute('aria-selected') === 'true') || btns[0];
    if (initial) requestAnimationFrame(() => select(initial));
    addEventListener('resize', () => { const on = btns.find(b => b.getAttribute('aria-selected') === 'true'); if (on && ink) { ink.style.width = on.offsetWidth + 'px'; ink.style.transform = `translateX(${on.offsetLeft}px)`; } });
  }

  // Wire every behaviour found under root. Safe to call again after re-rendering.
  function init(root = document) {
    const once = (sel, key, fn) => $$(sel, root).forEach(el => { if (el.dataset[key]) return; el.dataset[key] = '1'; fn(el); });
    once('[data-split]', 'splitDone', el => { splitText(el); observe(el); });
    once('[data-reveal]', 'revealDone', observe);
    once('[data-count]', 'countObs', el => { if (!el.closest('[data-reveal]')) observe(el); });
    once('[data-countdown]', 'cdDone', countdown);
    once('[data-tilt]', 'tiltDone', tilt);
    once('[data-magnetic]', 'magDone', magnetic);
    once('[data-hl]', 'hlDone', highlightText);
    once('[data-hs]', 'hsDone', horizontal);
    once('[data-parallax]', 'pxDone', parallax);
    once('[data-acc]', 'accDone', accordion);
    once('[data-tabs]', 'tabsDone', tabs);
    runScroll();
  }

  /* --------------------------------------------------------------- cursor */
  function cursor() {
    const ring = $('.cur-ring');
    if (!ring) return;
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, shown = false;
    addEventListener('pointermove', e => {
      x = e.clientX; y = e.clientY;
      if (!shown) { shown = true; rx = x; ry = y; ring.classList.add('on'); }
    }, { passive: true });
    document.addEventListener('pointerleave', () => { shown = false; ring.classList.remove('on'); });
    document.addEventListener('pointerover', e => {
      ring.classList.toggle('hover', !!e.target.closest('a, button, [data-cursor], input, select, textarea, label'));
    });
    const loop = () => {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------------------------------------------------------- toast/modal */
  function toast(msg, type = '') {
    const box = $('.toasts');
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.innerHTML = `${icon(type === 'ok' ? 'check' : 'spark', 18)}<span>${msg}</span>`;
    box.appendChild(t);
    setTimeout(() => t.classList.add('out'), 3600);
    setTimeout(() => t.remove(), 4100);
  }

  function openModal(html, { cls = '', label = 'Dialog' } = {}) {
    const m = document.createElement('div');
    m.className = 'modal ' + cls;
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-modal', 'true');
    m.setAttribute('aria-label', label);
    m.innerHTML = `<div class="modal-bg" data-close></div><div class="modal-card">${html}<button class="modal-x" data-close aria-label="Close">${icon('close')}</button></div>`;
    document.body.appendChild(m);
    document.documentElement.classList.add('lock');
    const prev = document.activeElement;
    const onKey = e => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        const f = $$('a[href], button, input, select, textarea', m).filter(x => !x.disabled && x.offsetParent);
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    };
    function close() {
      if (m.classList.contains('closing')) return;
      m.classList.add('closing');
      document.removeEventListener('keydown', onKey);
      setTimeout(() => {
        m.remove();
        if (!$('.modal')) document.documentElement.classList.remove('lock');
        if (prev && prev.focus) prev.focus();
      }, 240);
    }
    m.addEventListener('click', e => { if (e.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', onKey);
    setTimeout(() => { const f = $('input, select, textarea, .modal-card button:not(.modal-x)', m) || $('.modal-x', m); f && f.focus(); }, 60);
    init(m);
    return { el: m, close };
  }

  /* Forms go to the organisers' inbox when the site runs on backend.js, which
     sets TN.api from api/data.js. On a static host (Vercel) there is no
     server, so a submission opens the visitor's email app with the details
     addressed to the fest email instead; they press Send to complete it. */
  const live = () => !!TN.api;
  const mailLink = (subject, body) => `mailto:${TN.fest.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const humanize = k => String(k).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, c => c.toUpperCase());
  const formNote = () => live() ? 'Your details go straight to the organisers' : `Sends by email to ${TN.fest.email} · your email app opens to finish`;
  const mailDone = () => `Your email app should now be open with these details addressed to <a href="mailto:${esc(TN.fest.email)}">${esc(TN.fest.email)}</a>. <b>Press Send there to complete.</b> If nothing opened, email us directly.`;
  async function send(form, ref, data) {
    if (!live()) {
      const body = Object.entries(data || {}).filter(([, v]) => String(v).trim()).map(([k, v]) => `${humanize(k)}: ${v}`).join('\n');
      const subject = `${TN.fest.name} ${new Date(TN.fest.start).getFullYear()}: ${form}${String(ref).includes(':') ? ` · ${String(ref).split(':').pop()}` : ''}`;
      location.href = mailLink(subject, body + `\n\nSent from ${location.href}`);
      return true;
    }
    try {
      const r = await fetch('api/submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ form, ref, data }) });
      return r.ok;
    } catch (e) { return false; }
  }

  function formModal({ title, sub = '', fields, submit = 'Submit', done = 'Thanks! Your details were received.', ref = '', art = '' }) {
    if (!live()) done = mailDone();
    const field = f => {
      const id = 'f-' + f.name + '-' + (++uid);
      const req = f.required === false ? '' : ' required';
      let input;
      if (f.type === 'select') input = `<select class="input" id="${id}" name="${f.name}"${req}><option value="">${f.placeholder || 'Select'}</option>${f.options.map(o => `<option>${esc(o)}</option>`).join('')}</select>`;
      else if (f.type === 'textarea') input = `<textarea class="input" id="${id}" name="${f.name}" rows="3"${req} placeholder="${esc(f.placeholder || '')}"></textarea>`;
      else if (f.type === 'checkbox') return `<label class="check"><input type="checkbox" name="${f.name}"${req}><span>${f.label}</span></label>`;
      else input = `<input class="input" id="${id}" name="${f.name}" type="${f.type || 'text'}"${req} placeholder="${esc(f.placeholder || '')}"${f.pattern ? ` pattern="${f.pattern}"` : ''} autocomplete="${f.auto || 'on'}">`;
      return `<div class="field${f.half ? ' half' : ''}"><label for="${id}">${f.label}${f.required === false ? ' <em>(optional)</em>' : ''}</label>${input}</div>`;
    };
    const m = openModal(`
      ${art ? `<div class="form-art" aria-hidden="true">${art}</div>` : ''}
      <div class="form-head"><p class="kicker">${esc(TN.fest.name)}</p><h3>${title}</h3>${sub ? `<p class="muted">${sub}</p>` : ''}</div>
      <form class="form" novalidate><div class="form-grid">${fields.map(field).join('')}</div>
      <button class="btn full" type="submit">${submit} ${icon('arrow', 18)}</button>
      <p class="form-note mono">${formNote()}</p></form>`, { cls: 'form-modal', label: title });
    const form = $('form', m.el);
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!form.checkValidity()) {
        $$('.input, input[type=checkbox]', form).forEach(i => i.closest('.field, .check')?.classList.toggle('bad', !i.checkValidity()));
        const bad = $$(':invalid', form).find(x => x.matches('input, select, textarea'));
        bad && bad.focus();
        return;
      }
      const btn = $('button[type=submit]', form);
      btn.disabled = true;
      const ok = await send(title, ref, Object.fromEntries(new FormData(form)));
      if (!ok) { btn.disabled = false; toast('Could not send right now. Please try again.'); return; }
      $('.modal-card', m.el).classList.add('success');
      $('.form', m.el).outerHTML = `<div class="form-done"><div class="done-ring">${icon('check', 34)}</div><p>${done}</p><button class="btn ghost" data-close>Close</button></div>`;
    });
    form.addEventListener('input', e => e.target.closest('.field, .check')?.classList.remove('bad'));
    return m;
  }

  // College team registration: one team of 10–12 students per college (no individual passes).
  const YEARS = ['1st year', '2nd year', '3rd year', '4th year', '5th year', 'Postgraduate', 'Other'];
  function registerFest() {
    const fee = TN.fest.teamFee ? `${inr(TN.fest.teamFee)} per team` : 'the team fee';
    return formModal({
      title: `Register your college team`,
      sub: `${esc(TN.fest.name)} ${new Date(TN.fest.start).getFullYear()} is held at ${esc(TN.fest.venueShort)} on ${festRange()}. One team of 10–12 students per college, ${fee}, covering every event.`,
      art: mascot('registration'),
      fields: [
        { name: 'college', label: 'College / Institution' },
        { name: 'city', label: 'City', half: true },
        { name: 'students', label: 'Number of students', type: 'select', options: ['10', '11', '12'], half: true },
        { name: 'faculty', label: 'Faculty Coordinator name', half: true },
        { name: 'facultyPhone', label: 'Faculty Coordinator phone', type: 'tel', pattern: '[0-9+ ]{8,15}', half: true },
        { name: 'leader', label: 'Student Team Leader name', half: true },
        { name: 'phone', label: 'Team Leader phone', type: 'tel', pattern: '[0-9+ ]{8,15}', auto: 'tel', half: true },
        { name: 'email', label: 'Email for official communication', type: 'email', auto: 'email' },
      ],
      submit: 'Register our team',
      ref: 'team-registration',
      done: `Thank you! Your team's registration for ${esc(TN.fest.name)} was received. Official updates go to the email you gave us; please confirm participation at least one week before the fest.`,
    });
  }

  /* ------------------------------------------------------------ assistant */
  function bot() {
    const A = TN.assistant;
    if (!A) return;
    document.body.insertAdjacentHTML('beforeend', `
      <button class="bot-fab" aria-label="Open ${TN.fest.name} Assistant" aria-expanded="false" data-bot>${icon('chat', 24)}<span class="bot-ping"></span></button>
      <section class="bot" aria-label="${TN.fest.name} Assistant" aria-hidden="true">
        <header class="bot-head">
          <div class="bot-av"><img src="assets/mascots/home.png" alt="" width="38" height="38"></div>
          <div><b>${TN.fest.name} Assistant</b><small><i class="live"></i> Online</small></div>
          <button class="icon-btn" data-bot aria-label="Close assistant">${icon('close', 18)}</button>
        </header>
        <div class="bot-log" role="log" aria-live="polite"></div>
        <div class="bot-chips">${A.suggest.map(s => `<button class="chip sm" data-ask="${esc(s)}">${esc(s)}</button>`).join('')}</div>
        <form class="bot-form"><input class="input" name="q" placeholder="Ask me anything about ${TN.fest.name}" autocomplete="off" aria-label="Your question"><button class="bot-send" aria-label="Send">${icon('send', 18)}</button></form>
      </section>`);
    const panel = $('.bot'), log = $('.bot-log'), fab = $('.bot-fab');
    let greeted = false;
    const add = (html, who) => {
      const d = document.createElement('div');
      d.className = 'msg ' + who;
      d.innerHTML = html;
      log.appendChild(d);
      log.scrollTop = log.scrollHeight;
      return d;
    };
    // Question words only break ties; topical keywords decide the intent.
    const WEAK = new Set(['when', 'where', 'day', 'date', 'how', 'what']);
    const answer = q => {
      const words = q.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(Boolean);
      let best = null, score = 0;
      A.intents.forEach(it => {
        const s = it.k.reduce((n, k) => n + (k.includes(' ') ? (q.toLowerCase().includes(k) ? 2 : 0) : (words.includes(k) ? (WEAK.has(k) ? 0.5 : 1) : 0)), 0);
        if (s > score) { score = s; best = it; }
      });
      return fill(best ? best.a : A.fallback);
    };
    const ask = q => {
      if (!q.trim()) return;
      add(esc(q), 'me');
      const typing = add('<span class="typing"><i></i><i></i><i></i></span>', 'ai');
      setTimeout(() => { typing.innerHTML = answer(q); log.scrollTop = log.scrollHeight; }, 500 + Math.random() * 500);
    };
    const toggle = open => {
      panel.classList.toggle('open', open);
      panel.setAttribute('aria-hidden', String(!open));
      fab.setAttribute('aria-expanded', String(open));
      fab.classList.toggle('open', open);
      if (open && !greeted) { greeted = true; add(`Hi! I'm the ${esc(TN.fest.name)} Assistant. Ask me about dates, events, rules, registration or where to stay.`, 'ai'); }
      if (open) setTimeout(() => $('.bot-form input').focus(), 250);
    };
    document.addEventListener('click', e => {
      if (e.target.closest('[data-bot]')) toggle(!panel.classList.contains('open'));
      const chip = e.target.closest('[data-ask]');
      if (chip) ask(chip.dataset.ask);
    });
    $('.bot-form').addEventListener('submit', e => {
      e.preventDefault();
      const input = e.target.q;
      ask(input.value);
      input.value = '';
    });
    addEventListener('keydown', e => { if (e.key === 'Escape' && panel.classList.contains('open') && !$('.modal')) toggle(false); });
  }

  /* ----------------------------------------------------------------- boot */
  window.TNX = { $, $$, esc, inr, fmtDate, festRange, fill, earlyOn, rng, hashStr, clamp, reduce, finePointer, icon, emblem, astrolabe, logo, mascot, GLYPHS, init, onScroll, openModal, formModal, toast, registerFest, send, live, formNote, mailDone, brochureBtn, YEARS };

  document.addEventListener('DOMContentLoaded', async () => {
    const app = $('#app');
    const P = (window.PAGES || {})[page];
    injectShell();
    if (P) app.innerHTML = P.render();
    document.title = (P && P.title ? P.title + ' · ' : '') + `${TN.fest.name} ${yearOf()}`;

    const canvas = $('#aether');
    window.TNX.aether = window.Aether ? window.Aether.mount(canvas, { intensity: page === 'home' ? 1 : 0.75 }) : null;

    bindNav();
    transitions();
    cursor();
    if (P && P.mount) P.mount();
    const hadPre = await preloader();
    document.body.classList.add('ready');
    if (hadPre) document.body.classList.add('after-pre');
    init(document);
  });
})();
