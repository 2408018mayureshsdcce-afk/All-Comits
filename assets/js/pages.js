/* ==========================================================================
   Pages: each route exports render() → HTML and an optional mount() that
   wires page-specific behaviour. core.js picks one by <body data-page>.
   ========================================================================== */
(() => {
  'use strict';

  const TN = window.TN, X = window.TNX;
  const { $, $$, esc, inr, fmtDate, festRange, fill, earlyOn, icon, emblem, astrolabe, mascot, rng, hashStr, clamp, reduce } = X;
  const params = new URLSearchParams(location.search);
  let aid = 0;

  /* ------------------------------------------------------------ helpers */
  const kicker = (t, d = 0) => `<p class="kicker" data-reveal style="--d:${d}ms">${t}</p>`;
  const secHead = (k, t, lead = '', cls = '') =>
    `<div class="sec-head ${cls}">${kicker(k)}<h2 class="title" data-reveal style="--d:80ms">${t}</h2>${lead ? `<p class="lead" data-reveal style="--d:160ms">${lead}</p>` : ''}</div>`;
  const stagger = (i, step = 80, mod = 3) => `--d:${(i % mod) * step}ms`;
  const statusLabel = s => ({ open: 'Registrations open', closed: 'Closed', soldout: 'Sold out' }[s] || s);
  const comps = () => TN.competitions || [];

  // Rules (and judging criteria, and the general rules on the home page) are
  // stored as plain lines. A plain line is a numbered rule or round; a line
  // starting with "- " is a dotted sub-point of the rule above it, and the same
  // marker indented by two or more spaces is a point under that sub-point. A
  // hand-typed "1." or "2)" at the start of a rule is dropped, since the list
  // numbers itself.
  const parseRules = lines => {
    const items = [];
    (lines || []).forEach(raw => {
      const line = String(raw).replace(/\t/g, '  ');
      const m = line.match(/^( *)[-•*▪–]\s+(.*\S)\s*$/);
      if (m && items.length) {
        const rule = items[items.length - 1];
        if (m[1].length >= 2 && rule.subs.length) rule.subs[rule.subs.length - 1].subs.push(m[2]);
        else rule.subs.push({ t: m[2], subs: [] });
      } else {
        const t = (m ? m[2] : line.trim()).replace(/^\d+\s*[.)]\s*/, '');
        if (t) items.push({ t, subs: [] });
      }
    });
    return items;
  };
  // Sub-point list: <ul class="sub"> (and "sub sub2" one level down). `wrap` lets
  // the codex put its text in a <p>.
  const subList = (subs, cls, wrap = esc) => subs.length
    ? `<ul class="${cls}">${subs.map(x => `<li>${wrap(x.t || x)}${x.subs && x.subs.length ? subList(x.subs, 'sub sub2', wrap) : ''}</li>`).join('')}</ul>` : '';
  const rulesHTML = (lines, tail = '') =>
    `<ol class="rules">${parseRules(lines).map(r => `<li><div class="r-body"><span class="r-t">${esc(r.t)}</span>${subList(r.subs, 'sub')}</div></li>`).join('')}</ol>${tail}`;
  const judgeHTML = lines =>
    `<ul class="judge">${parseRules(lines).map(r => `<li><div class="r-body"><span class="r-t">${esc(r.t)}</span>${subList(r.subs, 'sub')}</div></li>`).join('')}</ul>`;
  const poolOf = list => list.reduce((s, c) => s + (Number(c.prize) || 0), 0);
  // Prize amounts are shown only for events that have one (none do in the 2027 brochure).
  const hasPrize = c => (Number(c.prize) || 0) > 0;
  const lakhs = n => Math.floor(n / 1000) / 100;   // 875000 → 8.75 (never rounded up)

  function pageHead({ kicker: k, title, sub = '', art = '', extra = '', cls = '' }) {
    return `<section class="phead ${cls}" id="top">
      <div class="phead-art" aria-hidden="true"><div data-parallax="-0.12">${art}</div></div>
      <div class="wrap phead-in">
        <p class="kicker" data-reveal>${k}</p>
        <h1 class="ptitle" data-split>${title}</h1>
        ${sub ? `<p class="lead" data-reveal style="--d:350ms">${sub}</p>` : ''}
        ${extra}
      </div>
      <div class="corners" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    </section>`;
  }

  const notFound = (msg, href, label) => `<section class="nf" id="top">
      <div class="nf-art" aria-hidden="true">${mascot('faq')}</div>
      <p class="kicker" data-reveal>Lost in the aether</p>
      <h1 class="ptitle nf-title" data-reveal style="--d:100ms">${msg}</h1>
      <a class="btn" href="${href}" data-reveal style="--d:200ms">${icon('back', 18)} ${label}</a>
    </section>`;

  const faqList = list => `<div class="acc" data-acc="single">${list.map((q, i) => `
      <div class="acc-item" data-reveal style="--d:${i * 50}ms">
        <button class="acc-q" aria-expanded="false"><span>${esc(q.q)}</span><i class="acc-plus" aria-hidden="true"></i></button>
        <div class="acc-a"><div><p>${esc(fill(q.a))}</p></div></div>
      </div>`).join('')}</div>`;

  const ticks = items => `<ul class="ticks">${items.map(t => `<li>${icon('check', 16)}<span>${esc(t)}</span></li>`).join('')}</ul>`;

  // A sealed event shows its name and teaser; everything else waits for revealAt.
  const isSealed = c => !!c.sealed && (!c.revealAt || Date.now() < new Date(c.revealAt).getTime());
  const istClock = iso => new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' });
  const unsealText = c => c.revealAt ? `${fmtDate(c.revealAt, true)}, ${istClock(c.revealAt)} IST` : 'at the event';
  const feeLabel = n => (Number(n) > 0 ? inr(n) : 'Included');
  const longDay = d => { const x = new Date(d + 'T12:00:00'); return `${x.toLocaleDateString('en-GB', { weekday: 'short' })}, ${fmtDate(d + 'T12:00:00', true)} ${x.getFullYear()}`; };
  const redact = n => `<span class="redact" aria-hidden="true">${Array.from({ length: n }, (_, i) => `<i style="width:${[94, 81, 66, 88, 72][i % 5]}%"></i>`).join('')}</span>`;
  // Items with a registerUrl (a Google Form, say) link out; the rest use the built-in form.
  const regBtn = (item, label, cls = 'btn') => item.registerUrl
    ? `<a class="${cls}" href="${esc(item.registerUrl)}" target="_blank" rel="noopener" data-magnetic>${label} ${icon('external', 18)}</a>`
    : `<button class="${cls}" data-register data-magnetic>${label} ${icon('arrow', 18)}</button>`;
  const initials = name => String(name || '').replace(/^(Prof|Dr|Mr|Ms|Mrs)\.?\s+/i, '').split(/\s+/).filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();

  // Event image: the "Event image" field in the dashboard, or by default assets/events/<event id>.jpg.
  // If the file doesn't exist the image hides itself and the emblem artwork shows instead.
  const evImg = (c, cls = '') => {
    const src = c.image || `assets/events/${encodeURIComponent(c.id)}.jpg`;
    return `<img class="ev-img ${cls}" src="${esc(src)}" alt="${esc(c.name)}" loading="lazy" onerror="this.remove()">`;
  };

  function compCard(c, i = 0) {
    const sealed = isSealed(c);
    return `<a class="ccard hud${sealed ? ' sealed' : ''}" href="event.html?id=${encodeURIComponent(c.id)}" data-tilt data-reveal style="${stagger(i, 90)};--h:${Number(c.hue) || 210}">
      <span class="glare"></span>
      <div class="ccard-art">${emblem(sealed ? 'seal' : c.kind, c.hue)}${sealed ? '' : evImg(c)}<span class="ccard-cat mono">${esc(c.cat)}</span>${Number(c.fee) > 0 ? `<span class="free-tag mono">${inr(c.fee)}</span>` : ''}</div>
      <div class="ccard-body">
        <span class="status ${esc(c.status)}">${statusLabel(c.status)}</span>
        <h3>${esc(c.name)}</h3>
        <p>${esc(c.tagline)}</p>
        ${sealed ? `<p class="seal-note mono">${icon('lock', 14)} Unseals ${unsealText(c)}</p>` : ''}
      </div>
      <div class="ccard-meta">${hasPrize(c) ? `<span>${icon('trophy', 16)} ${inr(c.prize)}</span>` : ''}<span>${icon('users', 16)} ${esc(c.team)}</span></div>
      <span class="ccard-cta mono">${sealed ? 'Break the seal' : 'Explore'} ${icon('arrow', 16)}</span>
    </a>`;
  }

  // Procedural "photograph": gradient field, orbits, beams, stars and a glyph.
  function art(seed, kind, hue, w = 400, h = 300) {
    const r = rng(seed), id = 'ar' + (++aid);
    const cx = w * (0.3 + r() * 0.4), cy = h * (0.3 + r() * 0.4);
    let s = '';
    for (let i = 0; i < 3; i++) {
      const x = r() * w;
      s += `<path d="M${x.toFixed(0)} ${h}L${(x + (r() - 0.5) * w).toFixed(0)} 0" stroke="hsl(${hue + 40} 90% 70%)" stroke-opacity=".1" stroke-width="${(2 + r() * 14).toFixed(1)}"/>`;
    }
    for (let i = 0; i < 4; i++) {
      const rx = 40 + r() * w * 0.5, ry = rx * (0.25 + r() * 0.5), rot = r() * 180;
      s += `<ellipse cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" rx="${rx.toFixed(0)}" ry="${ry.toFixed(0)}" transform="rotate(${rot.toFixed(0)} ${cx.toFixed(0)} ${cy.toFixed(0)})" fill="none" stroke="hsl(${hue} 90% 75%)" stroke-opacity="${(0.12 + r() * 0.25).toFixed(2)}"/>`;
    }
    for (let i = 0; i < 36; i++) s += `<circle cx="${(r() * w).toFixed(0)}" cy="${(r() * h).toFixed(0)}" r="${(r() * 1.6 + 0.3).toFixed(1)}" fill="#fff" fill-opacity="${(r() * 0.7 + 0.1).toFixed(2)}"/>`;
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" class="art" aria-hidden="true">
      <defs>
        <linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue} 70% 15%)"/><stop offset="1" stop-color="hsl(${hue + 50} 70% 5%)"/></linearGradient>
        <radialGradient id="${id}g" cx="${(cx / w).toFixed(2)}" cy="${(cy / h).toFixed(2)}" r=".6"><stop offset="0" stop-color="hsl(${hue} 95% 65%)" stop-opacity=".55"/><stop offset="1" stop-color="hsl(${hue} 95% 65%)" stop-opacity="0"/></radialGradient>
        <pattern id="${id}p" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#fff" stroke-opacity=".05"/></pattern>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#${id}b)"/><rect width="${w}" height="${h}" fill="url(#${id}p)"/><rect width="${w}" height="${h}" fill="url(#${id}g)"/>
      ${s}
      <g transform="translate(${cx.toFixed(0)} ${cy.toFixed(0)}) scale(${(Math.min(w, h) / 260).toFixed(2)})" fill="none" stroke="hsl(${hue} 90% 82%)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" color="hsl(${hue} 90% 82%)" opacity=".85">${X.GLYPHS[kind] || X.GLYPHS.spark}</g>
    </svg>`;
  }

  // Parchment letter used for the recognition carousel.
  function letter(seed) {
    const r = rng(seed), n = ++aid;
    let lines = '';
    for (let k = 0; k < 9; k++) lines += `<rect x="40" y="${156 + k * 22}" width="${(170 + r() * 110).toFixed(0)}" height="7" rx="3.5" fill="#1b2330" fill-opacity=".2"/>`;
    return `<svg viewBox="0 0 360 480" class="letter-svg" aria-hidden="true">
      <defs><linearGradient id="lp${n}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1e9d8"/><stop offset="1" stop-color="#d8c9a8"/></linearGradient></defs>
      <rect width="360" height="480" rx="6" fill="url(#lp${n})"/>
      <rect x="16" y="16" width="328" height="448" rx="3" fill="none" stroke="#a88a4a" stroke-opacity=".55"/>
      <circle cx="180" cy="72" r="28" fill="none" stroke="#a88a4a" stroke-width="2"/>
      <path d="M180 52l5 14h15l-12 9 5 14-13-9-13 9 5-14-12-9h15z" fill="#a88a4a" fill-opacity=".8"/>
      <rect x="110" y="118" width="140" height="9" rx="4.5" fill="#1b2330" fill-opacity=".45"/>
      ${lines}
      <path d="M210 408c14-26 30 16 46-8s22 12 34-4 18 2 26-6" fill="none" stroke="#1b2a55" stroke-width="2" stroke-linecap="round"/>
      <circle cx="92" cy="408" r="26" fill="#9c2f28"/><circle cx="92" cy="408" r="19" fill="none" stroke="#e8b3a8" stroke-opacity=".6"/>
      <path d="M92 396l3.5 8h8.5l-7 5 3 8-8-5-8 5 3-8-7-5h8.5z" fill="#f3d7cf" fill-opacity=".8"/>
    </svg>`;
  }

  function defaultRounds(c) {
    const f = TN.fest, where = f.venueShort || f.venue;
    const reg = { name: 'Registration closes', date: fmtDate(c.deadline, true), detail: 'Last day to register your team' };
    const day = c.date ? fmtDate(c.date + 'T12:00:00', true) : fmtDate(f.start, true);
    if (String(c.mode).startsWith('Zonals')) return [reg, { name: 'City qualifiers', date: 'Early November', detail: 'Qualify in the city nearest you' }, { name: 'Grand finale', date: day, detail: `On campus at ${where}` }];
    if (c.mode === 'Online') return [reg, { name: 'Submission window', date: 'After registration', detail: 'Upload your entry online' }, { name: 'Results', date: day, detail: `Winners announced at ${f.name}` }];
    if (c.mode === 'Online + Onsite') return [reg, { name: 'Online round', date: 'Before the fest', detail: 'Remote round open to every registered team' }, { name: 'Onsite final', date: day, detail: `Top teams compete at ${where}` }];
    return [reg, { name: 'Check-in', date: day, detail: 'Report 30 minutes early with your college ID' }, { name: 'Finals & results', date: fmtDate(f.end, true), detail: 'Winners announced on stage' }];
  }

  // Event entry from a registered college team (only college teams take part).
  const regFields = [
    { name: 'college', label: 'College / Institution' },
    { name: 'participants', label: 'Participant name(s) for this event' },
    { name: 'leader', label: 'Student Team Leader name', half: true },
    { name: 'phone', label: 'Team Leader phone', type: 'tel', pattern: '[0-9+ ]{8,15}', auto: 'tel', half: true },
    { name: 'email', label: 'Email for official communication', type: 'email', auto: 'email' },
  ];

  /* --------------------------------------------------------- canvas FX */
  function whenVisible(el, start, stop) {
    if (!('IntersectionObserver' in window)) return start();
    new IntersectionObserver(([en]) => (en.isIntersecting ? start() : stop())).observe(el);
  }

  function particles(canvas) {
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, pts = [], raf = 0;
    const mouse = { x: -1e4, y: -1e4 };
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const nw = canvas.clientWidth, nh = canvas.clientHeight;
      // Mobile browsers resize the viewport when the address bar hides; keep the field when only height changes.
      const reseed = nw !== w || !pts.length;
      if (!reseed && h) pts.forEach(p => { p.y *= nh / h; });
      w = nw; h = nh;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!reseed) return;
      const n = w < 700 ? 45 : 95;
      pts = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.25, vy: -Math.random() * 0.3 - 0.05, r: Math.random() * 1.6 + 0.4, a: Math.random() * 0.6 + 0.2 }));
    };
    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 14000) { const f = (14000 - d2) / 14000 * 0.6; p.x += dx / Math.sqrt(d2 + 1) * f; p.y += dy / Math.sqrt(d2 + 1) * f; }
        p.x += p.vx; p.y += p.vy;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fillStyle = `rgba(190,225,255,${p.a})`; ctx.fill();
      }
      ctx.lineWidth = 0.6;
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
        if (d2 > 11000) continue;
        const near = Math.hypot(a.x - mouse.x, a.y - mouse.y) < 180;
        ctx.strokeStyle = `rgba(111,196,242,${(1 - d2 / 11000) * (near ? 0.5 : 0.14)})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      raf = requestAnimationFrame(frame);
    };
    resize();
    addEventListener('resize', resize);
    canvas.parentElement.addEventListener('pointermove', e => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    canvas.parentElement.addEventListener('pointerleave', () => { mouse.x = mouse.y = -1e4; });
    if (reduce) { frame(); cancelAnimationFrame(raf); return; }
    whenVisible(canvas, () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); }, () => cancelAnimationFrame(raf));
  }

  function globe(canvas, places, tip) {
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, R = 0, raf = 0, dash = 0;
    const home = places.find(p => p.home) || places[0];
    let rotLon = -(home.lon * Math.PI) / 180, tilt = 0.32, drag = null, hover = null;
    const rad = d => (d * Math.PI) / 180;
    const sph = (lat, lon) => [Math.cos(rad(lat)) * Math.sin(rad(lon)), Math.sin(rad(lat)), Math.cos(rad(lat)) * Math.cos(rad(lon))];
    const rot = ([x, y, z]) => {
      const c = Math.cos(rotLon), s = Math.sin(rotLon);
      const x1 = x * c + z * s, z1 = -x * s + z * c;
      const ct = Math.cos(tilt), st = Math.sin(tilt);
      return [x1, y * ct - z1 * st, y * st + z1 * ct];
    };
    const proj = v => [W / 2 + v[0] * R, H / 2 - v[1] * R, v[2]];
    const dots = Array.from({ length: 900 }, (_, i) => {
      const y = 1 - (i / 899) * 2, r = Math.sqrt(1 - y * y), th = i * 2.39996;
      return [Math.cos(th) * r, y, Math.sin(th) * r];
    });
    const slerp = (a, b, t) => {
      const d = clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1), om = Math.acos(d);
      if (om < 1e-4) return a;
      const s = Math.sin(om), k1 = Math.sin((1 - t) * om) / s, k2 = Math.sin(t * om) / s;
      return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2];
    };
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight; R = Math.min(W, H) * 0.42;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const polyline = (pts, front, back) => {
      let prev = null;
      for (const p of pts) {
        const q = proj(rot(p));
        if (prev) {
          ctx.strokeStyle = q[2] > 0 && prev[2] > 0 ? front : back;
          ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
        }
        prev = q;
      }
    };
    const frame = now => {
      ctx.clearRect(0, 0, W, H);
      const halo = ctx.createRadialGradient(W / 2, H / 2, R * 0.8, W / 2, H / 2, R * 1.35);
      halo.addColorStop(0, 'rgba(79,172,254,.22)'); halo.addColorStop(1, 'rgba(79,172,254,0)');
      ctx.fillStyle = halo; ctx.fillRect(0, 0, W, H);
      const body = ctx.createRadialGradient(W / 2 - R * 0.35, H / 2 - R * 0.35, R * 0.1, W / 2, H / 2, R);
      body.addColorStop(0, '#12254d'); body.addColorStop(1, '#060a14');
      ctx.fillStyle = body; ctx.beginPath(); ctx.arc(W / 2, H / 2, R, 0, 6.283); ctx.fill();
      ctx.strokeStyle = 'rgba(111,196,242,.45)'; ctx.lineWidth = 1; ctx.stroke();

      for (const d of dots) {
        const q = proj(rot(d));
        if (q[2] <= 0) continue;
        ctx.fillStyle = `rgba(136,192,208,${(0.1 + q[2] * 0.45).toFixed(3)})`;
        ctx.fillRect(q[0] - 0.7, q[1] - 0.7, 1.4, 1.4);
      }
      ctx.lineWidth = 0.8;
      for (let lat = -60; lat <= 60; lat += 30) polyline(Array.from({ length: 91 }, (_, i) => sph(lat, i * 4)), 'rgba(111,196,242,.16)', 'rgba(111,196,242,.03)');
      for (let lon = 0; lon < 360; lon += 30) polyline(Array.from({ length: 46 }, (_, i) => sph(-90 + i * 4, lon)), 'rgba(111,196,242,.12)', 'rgba(111,196,242,.02)');

      const a = sph(home.lat, home.lon);
      ctx.setLineDash([5, 7]); ctx.lineDashOffset = -dash; ctx.lineWidth = 1.2;
      places.forEach(p => {
        if (p === home) return;
        const b = sph(p.lat, p.lon);
        const pts = Array.from({ length: 33 }, (_, i) => { const t = i / 32, v = slerp(a, b, t), lift = 1 + 0.16 * Math.sin(Math.PI * t); return [v[0] * lift, v[1] * lift, v[2] * lift]; });
        polyline(pts, 'rgba(217,180,108,.75)', 'rgba(217,180,108,0)');
      });
      ctx.setLineDash([]);

      const pulse = (now / 1000) % 1.6 / 1.6;
      places.forEach(p => {
        const q = proj(rot(sph(p.lat, p.lon)));
        p._s = q;
        if (q[2] <= 0) return;
        const col = p.home ? '255,170,90' : '120,200,255';
        ctx.beginPath(); ctx.arc(q[0], q[1], (p.home ? 4.5 : 3) + (hover === p ? 2 : 0), 0, 6.283);
        ctx.fillStyle = `rgb(${col})`; ctx.fill();
        ctx.beginPath(); ctx.arc(q[0], q[1], 4 + pulse * 14, 0, 6.283);
        ctx.strokeStyle = `rgba(${col},${(1 - pulse) * 0.6})`; ctx.stroke();
      });

      if (!drag && !reduce) rotLon += 0.0022;
      dash += 0.5;
      raf = requestAnimationFrame(frame);
    };
    resize();
    addEventListener('resize', resize);
    canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); canvas.classList.add('grabbing'); });
    canvas.addEventListener('pointerup', () => { drag = null; canvas.classList.remove('grabbing'); });
    canvas.addEventListener('pointermove', e => {
      const r = canvas.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
      if (drag) {
        rotLon += (e.clientX - drag.x) * 0.006;
        tilt = clamp(tilt + (e.clientY - drag.y) * 0.004, -1.1, 1.1);
        drag = { x: e.clientX, y: e.clientY };
      }
      hover = places.find(p => p._s && p._s[2] > 0 && Math.hypot(p._s[0] - mx, p._s[1] - my) < 12) || null;
      if (hover) { tip.textContent = hover.name + (hover.home ? ' · Home of the fest' : ''); tip.style.transform = `translate(${mx + 14}px, ${my - 10}px)`; tip.classList.add('on'); }
      else tip.classList.remove('on');
    });
    canvas.addEventListener('pointerleave', () => { tip.classList.remove('on'); hover = null; });
    whenVisible(canvas, () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); }, () => cancelAnimationFrame(raf));
  }

  // Buttons that step a native scroll-snap row.
  function carousel(root) {
    const row = $('.car-row', root);
    $$('[data-car]', root).forEach(b => b.addEventListener('click', () => {
      const card = row.firstElementChild;
      const step = card ? card.getBoundingClientRect().width + 20 : 300;
      row.scrollBy({ left: step * Number(b.dataset.car), behavior: reduce ? 'auto' : 'smooth' });
    }));
  }

  function mapArt() {
    let roads = '';
    const r = rng(42);
    for (let i = 0; i < 14; i++) roads += `<path d="M${(r() * 600).toFixed(0)} ${(r() * 400).toFixed(0)}Q${(r() * 600).toFixed(0)} ${(r() * 400).toFixed(0)} ${(r() * 600).toFixed(0)} ${(r() * 400).toFixed(0)}" stroke="#6fc4f2" stroke-opacity="${(0.08 + r() * 0.15).toFixed(2)}" stroke-width="${(1 + r() * 3).toFixed(1)}" fill="none"/>`;
    return `<svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><pattern id="mg" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="#fff" stroke-opacity=".05"/></pattern>
      <radialGradient id="mglow"><stop offset="0" stop-color="#4facfe" stop-opacity=".5"/><stop offset="1" stop-color="#4facfe" stop-opacity="0"/></radialGradient></defs>
      <rect width="600" height="400" fill="#07101f"/><rect width="600" height="400" fill="url(#mg)"/>
      <path d="M380 0C360 80 420 140 400 220S430 340 470 400H600V0Z" fill="#0c2a4f" opacity=".7"/>
      ${roads}
      <circle cx="300" cy="200" r="90" fill="url(#mglow)"/>
      <circle cx="300" cy="200" r="30" fill="none" stroke="#4facfe" class="map-pulse"/>
      <path d="M300 214s-18-16-18-30a18 18 0 0 1 36 0c0 14-18 30-18 30z" fill="#4facfe"/><circle cx="300" cy="184" r="6" fill="#06070a"/>
      <text x="300" y="250" text-anchor="middle" class="map-label">${esc(String(TN.fest.venueShort || TN.fest.name).toUpperCase())}</text>
    </svg>`;
  }

  /* ================================================================ PAGES */
  const PAGES = {};

  /* ------------------------------------------------------------- home */
  PAGES.home = {
    render() {
      const f = TN.fest, early = earlyOn();
      // Marquee: the event names, taken from the events list.
      const mqItems = (TN.competitions || []).map(c => c.name).filter(Boolean);
      const mqRow = mqItems.map((t, i) => `<span class="mq-item${i % 2 ? ' o' : ''}">${esc(t)}<i>✦</i></span>`).join('');
      let acc = false;
      const words = String(TN.about || '').split(/\s+/).map(w => {
        let a = acc;
        if (w.startsWith('*')) { a = true; acc = true; w = w.slice(1); }
        if (/\*[^\w]*$/.test(w)) { w = w.replace(/\*([^\w]*)$/, '$1'); acc = false; }
        return `<span class="w${a ? ' hi' : ''}">${esc(w)}</span>`;
      }).join(' ');
      const list = comps();
      // Flagship events: the ids in TN.featured (data.js), else the biggest prize pools.
      const picked = (TN.featured || []).map(id => list.find(c => c.id === id)).filter(c => c && !isSealed(c));
      const featured = picked.length ? picked : list.filter(c => c.status === 'open' && !isSealed(c)).sort((a, b) => b.prize - a.prize).slice(0, 3);
      const stats = [...(TN.stats || []),
        { n: list.length, suffix: '', label: 'Events & competitions' },
        ...(poolOf(list) > 0 ? [{ n: lakhs(poolOf(list)), prefix: '₹', suffix: 'L', label: 'Total prize pool' }] : [])];
      const P = TN.protocols || { general: [], dayOf: [] };
      const codexRules = items => `<ol class="codex-list">${parseRules(items).map((r, i) => `<li style="--i:${i}"><span class="mono">§ ${String(i + 1).padStart(2, '0')}</span><div class="c-body"><p>${esc(r.t)}</p>${subList(r.subs, 'c-sub', t => `<p>${esc(t)}</p>`)}</div></li>`).join('')}</ol>`;
      const codexList = items => `<ol class="codex-list">${items.map((t, i) => `<li style="--i:${i}"><span class="mono">§ ${String(i + 1).padStart(2, '0')}</span><p>${esc(t)}</p></li>`).join('')}</ol>`;
      const V = TN.verticals || [], n = V.length;

      return `
      <section class="hero" id="top">
        <canvas class="hero-particles" aria-hidden="true"></canvas>
        <div class="hero-hud mono" aria-hidden="true">
          <span class="hh tl">${esc(f.coords || '')}</span>
          <span class="hh tr">Edition ${esc(f.edition)}</span>
          <span class="hh bl" data-clock>IST --:--:--</span>
          <span class="hh br">Signal <i class="sig"><b></b><b></b><b></b><b></b><b></b></i></span>
        </div>
        <div class="hero-in">
          <p class="kicker center" data-reveal>Edition ${esc(f.edition)} · ${esc(f.host)}</p>
          <h1 class="hero-title" data-split>${esc(f.name.toUpperCase())}</h1>
          <p class="hero-theme" data-reveal style="--d:750ms"><span class="shimmer">${esc(f.theme)}</span></p>
          <p class="hero-date mono" data-reveal style="--d:900ms">${festRange()} · ${esc(f.venueShort)}</p>
          <div class="cd" data-countdown="${esc(f.start)}" data-reveal style="--d:1050ms"></div>
          <div class="hero-cta" data-reveal style="--d:1200ms">
            <a class="btn ghost" href="events.html" data-magnetic>Explore events <span class="early-bird-badge inline blink">Registrations open</span></a>
            ${X.brochureBtn()}
          </div>
        </div>
        <a class="scroll-hint" href="#about" aria-label="Scroll to explore"><span class="mouse"><i></i></span><span class="mono">Scroll</span></a>
      </section>

      <div class="marquee-wrap" aria-hidden="true"><div class="marquee">
        <div class="mq-track">${mqRow}${mqRow}</div>
      </div></div>

      <section class="sec about" id="about">
        <div class="wrap about-grid">
          <div class="about-l">
            ${secHead(`01 — About ${esc(f.name)}`, 'Where innovation<br>meets the nation')}
          </div>
          <p class="hl-text" data-hl>${words}</p>
        </div>
        <div class="wrap"><div class="stats">${stats.map((s, i) => `
          <div class="stat hud" data-reveal style="--d:${i * 90}ms"><b class="stat-n" data-count="${s.n}" data-prefix="${esc(s.prefix || '')}" data-suffix="${esc(s.suffix || '')}">${esc(s.prefix || '')}0</b><span class="stat-l">${esc(s.label)}</span></div>`).join('')}
        </div></div>
      </section>

      ${n ? `<section class="hs" data-hs>
        <div class="hs-sticky">
          <div class="wrap hs-head">
            ${secHead('02 — The Fest', `${n} ways to experience it`)}
            <div class="hs-progress" aria-hidden="true"><i></i></div>
          </div>
          <div class="hs-track">${V.map((v, i) => `
            <a class="vcard hud" href="${esc(v.href)}" data-tilt="6" style="--h:${v.hue}">
              <span class="glare"></span>
              <div class="vcard-top mono"><span>${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}</span>${icon('arrow', 20)}</div>
              <div class="vcard-em">${emblem(v.kind, v.hue)}</div>
              <div class="vcard-b"><h3>${esc(v.title)}</h3><p>${esc(v.text)}</p></div>
            </a>`).join('')}
          </div>
        </div>
      </section>` : ''}

      <section class="sec">
        <div class="wrap">
          <div class="row-head">
            ${secHead('03 — Compete', 'Flagship events')}
            <a class="link-arrow" href="events.html" data-reveal>All events ${icon('arrow', 18)}</a>
          </div>
          <div class="cgrid">${featured.map(compCard).join('')}</div>
        </div>
      </section>

      <section class="sec eb">
        <div class="wrap">
          <div class="eb-card hud" data-reveal>
            <div class="eb-l">
              <p class="kicker"><span class="early-bird-badge inline blink">Registrations open</span> ${esc(f.name)} ${new Date(f.start).getFullYear()}</p>
              <h2 class="title sm">Two days. ${comps().length} events.<br>One overall champion.</h2>
              ${ticks([
                'One team of 10–12 students per college',
                `${inr(f.teamFee || 3000)} per team covers every event`,
                `Confirm participation by ${fmtDate(f.earlyBirdEnds)}`,
              ])}
              <a class="btn" href="events.html" data-magnetic>Explore events ${icon('arrow', 18)}</a>
            </div>
            <div class="eb-r">
              <div class="eb-mascot" aria-hidden="true">${mascot('schedule')}</div>
              <p class="mono muted">${esc(f.name)} begins in</p>
              <div class="cd" data-countdown="${esc(f.start)}"></div>
              <p class="mono muted small">${festRange()} · from ${new Date(f.start).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' }).toUpperCase()} IST</p>
            </div>
          </div>
        </div>
      </section>

      <section class="sec tight">
        <div class="wrap">
          <div class="reg-band hud" data-reveal>
            <div class="reg-art"><img src="assets/register-now.jpg" alt="The TechNation robot resting on the words Register Now" width="1200" height="699" loading="lazy" decoding="async"></div>
            <div class="reg-in">
              <p class="kicker">04 — Registrations open</p>
              <h2 class="title sm">Claim your spot at ${esc(f.name)} ${new Date(f.start).getFullYear()}</h2>
              <p class="lead">One team of 10–12 students per college competes across all ${comps().length} events for the Overall Winner trophy.</p>
              <div class="hero-cta">
                <a class="btn ghost" href="schedule.html" data-magnetic>See the schedule</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      ${P.general.length || P.dayOf.length ? `<section class="sec codex-sec">
        <div class="wrap">
          <div class="row-head">
            ${secHead('05 — Protocols', 'The sealed codex', 'Read this before you arrive. Every participant and visitor is bound by it.')}
            <a class="link-arrow" href="schedule.html" data-reveal>Full schedule ${icon('arrow', 18)}</a>
          </div>
          <div class="codex hud" data-reveal>
            <div class="codex-top mono"><span>${icon('lock', 14)} Classified · Participants only</span><span>File ${esc(f.edition)} / TN</span></div>
            <div class="codex-seal" aria-hidden="true">${X.logo()}</div>
            <div class="codex-cols">
              ${P.general.length ? `<div><h3>General protocols</h3>${codexRules(P.general)}</div>` : ''}
              ${P.dayOf.length ? `<div><h3>On the day</h3>${codexList(P.dayOf)}</div>` : ''}
            </div>
            <p class="codex-foot mono">Unsure about anything? <a href="about.html#contact">Ask the team</a></p>
          </div>
        </div>
      </section>` : ''}

      ${(TN.faqs || []).length ? `<section class="sec faq" id="faq">
        <div class="wrap faq-grid">
          <div>
            ${secHead('06 — Questions', 'Frequently asked', `Can't find what you need? Write to ${esc(f.email)}.`)}
            <div class="faq-mascot" data-reveal aria-hidden="true">${mascot('faq')}</div>
          </div>
          ${faqList(TN.faqs)}
        </div>
      </section>` : ''}`;
    },
    mount() {
      particles($('.hero-particles'));
      const heroIn = $('.hero-in');
      X.onScroll(() => {
        const p = clamp(scrollY / innerHeight, 0, 1);
        heroIn.style.transform = `translate3d(0,${(p * 140).toFixed(1)}px,0)`;
        heroIn.style.opacity = (1 - p * 1.3).toFixed(3);
      });
      const clock = $('[data-clock]');
      const tick = () => { clock.textContent = 'IST ' + new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata' }); };
      tick(); setInterval(tick, 1000);
    },
  };

  /* ------------------------------------------------------------ events */
  PAGES.events = {
    title: 'Events',
    render() {
      const list = comps();
      const cats = ['All', ...new Set(list.map(c => c.cat))];
      const Z = TN.zonals || [];
      return pageHead({
        kicker: 'Compete · Conquer · Create',
        title: 'Events',
        sub: `${comps().length} on-stage, off-stage, lab and gaming events on our campus in Margao. Your college team picks who plays where; every result counts towards the Overall Winner trophy.`,
        art: emblem('robot', 210),
      }) + `
      <section class="sec tight">
        <div class="wrap">
          ${(() => {
            const ms = [
              poolOf(list) > 0 && `<b data-count="${poolOf(list)}" data-prefix="₹">₹0</b><span class="mono">Total prize pool</span>`,
              `<b data-count="${list.length}">0</b><span class="mono">Events</span>`,
              `<b data-count="${new Set(list.map(c => c.cat)).size}">0</b><span class="mono">Categories</span>`,
              Z.length > 0 && `<b data-count="${Z.length}">0</b><span class="mono">Qualifier cities</span>`,
            ].filter(Boolean);
            return `<div class="mini-stats" style="--n:${ms.length}">${ms.map((m, i) => `<div class="ms hud" data-reveal style="--d:${i * 90}ms">${m}</div>`).join('')}</div>`;
          })()}
          <div class="toolbar" data-reveal>
            <div class="chips" role="group" aria-label="Filter by category">${cats.map((c, i) => `<button class="chip" aria-pressed="${i === 0}" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div>
            <div class="tool-r">
              <div class="seg" role="group" aria-label="Filter by status">
                <button aria-pressed="true" data-status="all">All</button><button aria-pressed="false" data-status="open">Open</button><button aria-pressed="false" data-status="closed">Closed</button>
              </div>
              <label class="search">${icon('search', 18)}<input type="search" placeholder="Search events" aria-label="Search events"></label>
            </div>
          </div>
          <h2 class="sr">All events</h2>
          <div class="cgrid" id="cgrid" aria-live="polite"></div>
          <p class="empty" hidden>No events match those filters.</p>
        </div>
      </section>
      ${Z.length ? `<section class="sec zonals">
        <div class="wrap">
          ${secHead('City qualifiers', 'Coming to a city near you', 'Events marked "Zonals + Finale" hold qualifier rounds across India. Win your city and go straight to the finale on campus.')}
          <div class="zgrid">${Z.map((z, i) => `
            <div class="zcard hud" data-reveal style="${stagger(i, 70, 7)}">
              <span class="zpin">${icon('pin', 18)}</span>
              <span class="mono muted">City</span><h3>${esc(z.city)}</h3>
              <span class="mono muted">Date</span><p>${fmtDate(z.date)}</p>
            </div>`).join('')}
          </div>
        </div>
      </section>` : ''}`;
    },
    mount() {
      const list = comps();
      // events.html#robotics preselects that category.
      const want = decodeURIComponent(location.hash.slice(1)).toLowerCase();
      let cat = [...new Set(list.map(c => c.cat))].find(c => c.toLowerCase() === want) || 'All', status = 'all', q = '';
      const grid = $('#cgrid'), empty = $('.empty');
      const draw = () => {
        const shown = list.filter(c =>
          (cat === 'All' || c.cat === cat) && (status === 'all' || c.status === status) &&
          (!q || `${c.name} ${c.tagline} ${c.cat} ${c.subtitle || ''}`.toLowerCase().includes(q)));
        grid.innerHTML = shown.map(compCard).join('');
        empty.hidden = shown.length > 0;
        X.init(grid);
      };
      const setCat = c => { cat = c; $$('[data-cat]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.cat === c))); draw(); };
      $$('[data-cat]').forEach(b => b.addEventListener('click', () => setCat(b.dataset.cat)));
      $$('[data-status]').forEach(b => b.addEventListener('click', () => {
        status = b.dataset.status;
        $$('[data-status]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        draw();
      }));
      $('.search input').addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); draw(); });
      addEventListener('hashchange', () => {
        const h = decodeURIComponent(location.hash.slice(1)).toLowerCase();
        const c = [...new Set(list.map(x => x.cat))].find(x => x.toLowerCase() === h);
        if (c) setCat(c);
      });
      setCat(cat);
    },
  };

  /* ------------------------------------------------------- event detail */
  const SCHED_HUES = { Registration: 160, Surprise: 322, Ceremony: 42, Competition: 205, Workshop: 170, Talk: 228, Expo: 190, Show: 272, Break: 215 };
  const clock12 = hm => { const [h, m] = String(hm).split(':').map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; };
  const comp = () => comps().find(c => c.id === params.get('id'));
  PAGES.event = {
    get title() { const c = comp(); return c ? c.name : 'Event not found'; },
    render() {
      const c = comp();
      if (!c) return notFound('Event not found.', 'events.html', 'Back to events');
      const timeline = c.timeline || defaultRounds(c);
      const split = [0.5, 0.3, 0.2].map(p => Math.round((c.prize * p) / 1000) * 1000);
      const all = comps();
      const more = all.filter(x => x.id !== c.id && x.cat === c.cat).concat(all.filter(x => x.cat !== c.cat)).slice(0, 3);
      const sealed = isSealed(c);
      const people = (c.coordinators || []).filter(p => p && p.name);
      const judging = c.judging || [];
      // Date, time and venue fall back to the first schedule session that links here.
      const slot = (TN.schedule || []).filter(s => s.link === `event.html?id=${c.id}`)
        .sort((x, y) => (x.day + x.start).localeCompare(y.day + y.start))[0] || {};
      const day = c.date || slot.day, time = c.time || slot.start, venue = c.venue || slot.venue;
      const tba = '<span class="tba">To be announced</span>';
      const locked = `<span class="tba">${icon('lock', 14)} Sealed</span>`;
      const tiles = [
        ['Participants', 'users', 205, c.team ? esc(c.team) : tba],
        ['Rounds', 'layers', 265, sealed ? locked : c.rounds ? esc(c.rounds) : tba],
        ['Theme', 'spark', 322, sealed ? locked : c.theme ? esc(c.theme) : tba],
        ['Date', 'calendar', 152, day ? esc(longDay(day)) : tba],
        ['Time', 'clock', 38, time ? `${clock12(time)} IST` : tba],
        ['Venue', 'pin', 350, venue ? esc(venue) : tba],
      ];
      return `
      <section class="dhead" id="top" style="--h:${Number(c.hue) || 210}">
        <div class="wrap dhead-in">
          <div class="dhead-l">
            <a class="back mono" href="events.html">${icon('back', 16)} All events</a>
            <p class="kicker" data-reveal>${esc(c.cat)} · ${esc(c.mode)}</p>
            <h1 class="ptitle" data-split>${esc(c.name)}</h1>
            ${c.subtitle ? `<p class="ev-sub" data-reveal style="--d:250ms">${esc(c.subtitle)}</p>` : ''}
            <p class="lead" data-reveal style="--d:320ms">${esc(c.tagline)}</p>
            <div class="meta-row" data-reveal style="--d:400ms">
              ${hasPrize(c) ? `<span class="meta hud">${icon('trophy', 18)}<b>${inr(c.prize)}</b><small>Prize pool</small></span>` : ''}
              ${c.fee != null ? `<span class="meta hud">${icon('ticket', 18)}<b>${feeLabel(c.fee)}</b><small>${Number(c.fee) > 0 ? 'Entry fee' : 'In the team fee'}</small></span>` : ''}
              <span class="meta hud">${icon('calendar', 18)}<b>${fmtDate(c.deadline, true)}</b><small>Register by</small></span>
            </div>
            <div class="hero-cta" data-reveal style="--d:500ms">
              ${c.status === 'open' ? regBtn(c, 'Register now') : '<span class="btn disabled" aria-disabled="true">Registration closed</span>'}
              ${sealed ? `<span class="seal-note mono">${icon('lock', 14)} Brief unseals ${unsealText(c)}</span>` : '<a class="btn ghost" href="#rules">Rules & judging</a>'}
            </div>
          </div>
          <div class="dhead-r" data-reveal="scale" style="--d:200ms"><div class="big-em">${emblem(sealed ? 'seal' : c.kind, c.hue)}${sealed ? '' : evImg(c, 'ev-img-lg')}</div></div>
        </div>
      </section>

      <section class="sec tight" id="details">
        <div class="wrap ev-stack">
          ${sealed ? `<div class="sealed-panel hud" data-reveal>
            <p class="kicker">Sealed event</p>
            <h2 class="panel-h">The brief is under seal</h2>
            <p class="big-p">The description, rules and judging criteria stay hidden until ${unsealText(c)}. Register your team now and be ready when the seal breaks.</p>
            ${c.revealAt ? `<p class="mono muted small">The seal breaks in</p><div class="cd sm" data-countdown="${esc(c.revealAt)}"></div>` : ''}
            <div class="sealed-lines">${redact(5)}</div>
          </div>` : `<div class="ev-desc hud" data-reveal>
            <p class="kicker">About the event</p>
            ${c.overview ? `<p class="big-p">${esc(c.overview)}</p>` : ''}
            ${c.statement ? `<div class="ev-challenge"><p class="mono">The challenge</p><p>${esc(c.statement)}</p></div>` : ''}
          </div>`}

          <div class="ev-tiles">${tiles.map(([label, ic, h, value], i) => `
            <div class="ev-tile hud" data-reveal style="--h:${h};--d:${(i % 3) * 70}ms">
              <span class="ev-tile-l mono">${icon(ic, 16)} ${label}</span><b>${value}</b>
            </div>`).join('')}
          </div>

          ${sealed ? '' : `<div class="ev-cols" id="rules">
            <div class="ev-panel hud" data-reveal>
              <h2 class="panel-h">Rules & Regulations</h2>
              ${rulesHTML(c.rules, `<p class="rules-note">Organisers' decisions on scoring and disputes are final.</p>`)}
            </div>
            <div class="ev-panel hud" data-reveal style="--d:90ms">
              <h2 class="panel-h">Judging Criteria</h2>
              ${judging.length ? judgeHTML(judging) : '<p class="muted">Judging criteria are announced with the rulebook.</p>'}
            </div>
          </div>`}

          ${people.length ? `<div class="ev-coords hud" data-reveal>
            <h2 class="panel-h">${esc(c.name)} Coordinators</h2>
            <div class="ev-people">${people.map(p => `
              <div class="ev-person" style="--h:${/faculty/i.test(p.role || '') ? 265 : 205}">
                <span class="coord-av">${icon('user', 22)}</span>
                <p class="ev-role mono">${esc(p.role || 'Coordinator')}</p>
                <b>${esc(p.name)}</b>
                ${p.phone ? `<a href="tel:${esc(String(p.phone).replace(/[^0-9+]/g, ''))}" aria-label="Call ${esc(p.name)}">${icon('phone', 14)} ${esc(p.phone)}</a>` : ''}
                ${p.email ? `<a href="mailto:${esc(p.email)}" aria-label="Email ${esc(p.name)}">${icon('mail', 14)} ${esc(p.email)}</a>` : ''}
              </div>`).join('')}
            </div>
          </div>` : ''}
        </div>
      </section>

      <section class="sec tight">
        <div class="wrap ev-extra${hasPrize(c) ? '' : ' no-prize'}">
          ${hasPrize(c) ? `<div class="prize hud" data-reveal>
            <p class="mono muted">Prize pool</p>
            <b class="prize-n" data-count="${Number(c.prize) || 0}" data-prefix="₹">₹0</b>
            <ul>${['Winner', 'First runner-up', 'Second runner-up'].map((l, i) => `<li><span>${l}</span><b>${inr(split[i])}</b></li>`).join('')}</ul>
          </div>` : ''}
          <div class="ev-panel hud" data-reveal style="--d:80ms">
            <h2 class="panel-h">Timeline</h2>
            <ol class="steps">${timeline.map((r, i) => `<li><span class="step-n mono">${String(i + 1).padStart(2, '0')}</span><div><b>${esc(r.name)}</b><span class="mono muted">${esc(r.date)}</span><p>${esc(r.detail)}</p></div></li>`).join('')}</ol>
          </div>
          <div class="doubts hud" data-reveal style="--d:160ms">
            <p class="mono muted">Doubts?</p>
            <h3>Ask your queries</h3>
            <form data-doubt><textarea class="input" rows="3" placeholder="Type your question" aria-label="Your question" required></textarea>
            <button class="btn full sm" type="submit">Send ${icon('send', 16)}</button></form>
          </div>
        </div>
      </section>

      <section class="sec">
        <div class="wrap">
          ${secHead('Keep exploring', 'More events')}
          <div class="cgrid">${more.map(compCard).join('')}</div>
        </div>
      </section>`;
    },
    mount() {
      const c = comp();
      if (!c) return;
      const reg = $('[data-register]');
      reg && reg.addEventListener('click', () => X.formModal({
        title: `Register · ${esc(c.name)}`,
        sub: 'The team leader fills this in. We\'ll email the next steps and payment details if there is an entry fee.',
        fields: regFields,
        submit: 'Complete registration',
        ref: 'competition:' + c.id,
        done: `You're registered for ${esc(c.name)}. The coordinators will email you the next steps.`,
      }));
      bindDoubt('competition:' + c.id);
    },
  };

  function bindDoubt(ref) {
    const f = $('[data-doubt]');
    f && f.addEventListener('submit', async e => {
      e.preventDefault();
      const t = $('textarea', f);
      if (!t.value.trim()) { t.focus(); return; }
      if (!(await X.send('Question', ref, { question: t.value.trim() }))) { X.toast('Could not send right now. Please try again.'); return; }
      t.value = '';
      X.toast(X.live() ? 'Question sent. The coordinators will get back to you.' : `Your email app opened with the question for ${esc(TN.fest.email)}. Press Send there.`, 'ok');
    });
  }

  /* --------------------------------------------------------- schedule */
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  const istMs = (day, hm) => new Date(`${day}T${hm}:00+05:30`).getTime();

  function schedEvent(s) {
    const tag = s.link ? 'a' : 'div';
    return `<${tag} class="sev hud${s.cat === 'Break' ? ' brk' : ''}"${s.link ? ` href="${esc(s.link)}"` : ''} data-scat="${esc(s.cat)}" data-from="${istMs(s.day, s.start)}" data-to="${istMs(s.day, s.end)}" style="--h:${hueOf(s)}">
      <span class="sev-top"><span class="sev-cat mono">${esc(s.cat)}</span><span class="sev-live mono">Live now</span></span>
      <b>${esc(s.title)}</b>
      <span class="sev-meta">${icon('clock', 14)} ${clock12(s.start)} – ${clock12(s.end)}</span>
      ${s.venue ? `<span class="sev-meta">${icon('pin', 14)} ${esc(s.venue)}</span>` : ''}
      ${s.note ? `<span class="sev-note mono">${esc(s.note)}</span>` : ''}
      <span class="sev-bar" aria-hidden="true"></span>
      ${s.link ? `<span class="sev-go">${icon('arrow', 16)}</span>` : ''}
    </${tag}>`;
  }

  // Sessions that start together share a slot and sit side by side.
  function schedDay(list) {
    const slots = [];
    list.forEach(s => {
      const last = slots[slots.length - 1];
      if (last && last.start === s.start) last.items.push(s); else slots.push({ start: s.start, items: [s] });
    });
    return `<ol class="slots">${slots.map((sl, i) => `
      <li class="slot" data-reveal style="--d:${Math.min(i, 6) * 50}ms">
        <time class="slot-t mono">${clock12(sl.start)}</time>
        <div class="slot-evs n${Math.min(sl.items.length, 3)}">${sl.items.map(schedEvent).join('')}</div>
      </li>`).join('')}</ol>`;
  }


  /* Timetable grid: venues down the side, time across the top.
     One CSS grid holds labels, cards and the lunch block. Early quarter-hours
     get extra width so the morning slots are not squeezed. */
  const toMin = hm => { const [h, m] = String(hm).split(':').map(Number); return h * 60 + m; };
  const short = hm => { const [h, m] = String(hm).split(':').map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')}`; };
  const ROOMS = ['Hall 1', 'Hall 2', 'F401', 'F403', 'F404', 'Quadrangle / OTS', 'F405 / F406', 'Training Room (Skill Development Center)', 'Lab 1', 'Lab 2', 'Lab 4'];
  const venueParts = v => {
    if (/F405/.test(v || '')) return ['Main Building', 'F405 / F406'];
    const p = String(v || '').split(' · ');
    return p.length > 1 ? [p[0], p.slice(1).join(' · ')] : ['Main Building', v || 'To be announced'];
  };
  const isLunch = s => s.cat === 'Break' && /lunch/i.test(s.title);
  const isRefresh = s => s.cat === 'Break' && /refresh|tea\b|snack|coffee/i.test(s.title);
  const kindOf = s => isLunch(s) ? 'lunch' : isRefresh(s) ? 'refresh' : '';
  // Muted hues that sit with the site's blues and gold; breaks are sage.
  const GRID_HUES = { Competition: 208, Surprise: 268, Ceremony: 42, Registration: 345, Break: 150 };
  const hueOf = s => GRID_HUES[s.cat] ?? SCHED_HUES[s.cat] ?? 210;
  const seriesHead = s => s.title.split(' · ')[0];

  // Shorten a narrow card's title when a neighbour in the same venue shares part of the name.
  function compactTitle(s, row) {
    const others = row.items.filter(o => o !== s);
    const [head, ...rest] = s.title.split(' · ');
    if (rest.length && others.some(o => o.title.split(' · ')[0] === head)) return rest.join(' · ');
    const w = s.title.split(' ');
    if (w.length > 1 && others.some(o => o.title !== s.title && o.title.split(' ').pop() === w[w.length - 1])) return w.slice(0, -1).join(' ');
    return s.title;
  }

  function schedGrid(list) {
    if (!list.length) return '';
    const U = 15, EARLY = 10 * 60, W_EARLY = 2;
    const start = Math.floor(Math.min(...list.map(s => toMin(s.start))) / U) * U;
    const end = Math.ceil(Math.max(...list.map(s => toMin(s.end))) / U) * U;
    const n = (end - start) / U;
    // Every 15 minutes gets the same width, except an odd opening slot (8:45) that gets a touch more
    // so its time label fits.
    const firstHour = Math.ceil(start / 60) * 60;
    const wts = Array.from({ length: n }, (_, i) => (start % 60 && start + i * U < firstHour ? 1.6 : 1));
    const cum = [0]; wts.forEach(w => cum.push(cum[cum.length - 1] + w));
    const gA = t => Math.max(0, Math.floor((t - start) / U)) + 2;
    const gZ = t => Math.min(n, Math.ceil((t - start) / U)) + 2;
    const wid = (a, z) => cum[gZ(z) - 2] - cum[gA(a) - 2];
    const hm = t => `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
    const hours = [];
    for (let t = Math.ceil(start / 60) * 60; t < end; t += 60) hours.push(t);

    // Lunch is one block across every venue.
    const lunches = [], seen = new Set();
    list.filter(isLunch).forEach(s => {
      const k = s.start + '|' + s.end;
      if (!seen.has(k)) { seen.add(k); lunches.push({ a: toMin(s.start), z: toMin(s.end), s }); }
    });
    const rows = new Map();
    list.filter(s => !isLunch(s)).forEach(s => {
      const [b, r] = venueParts(s.venue);
      const k = b + '|' + r;
      if (!rows.has(k)) rows.set(k, { b, r, items: [], refresh: false });
      const row = rows.get(k);
      row.items.push(s);
      if (isRefresh(s)) row.refresh = true;
    });
    const ordered = [...rows.values()].sort((a, c) => {
      const bi = +(a.b !== 'Main Building') - +(c.b !== 'Main Building');
      if (bi) return bi;
      if (a.refresh !== c.refresh) return a.refresh ? -1 : 1;
      const ai = ROOMS.indexOf(a.r), ci = ROOMS.indexOf(c.r);
      return (ai < 0 ? 99 : ai) - (ci < 0 ? 99 : ci) || a.r.localeCompare(c.r);
    });

    const tpl = [];
    let gr = 1, lastB = '', i = 0, rowNo = 0;
    const parts = [];
    ordered.forEach(row => {
      if (row.b !== lastB) {
        parts.push(`<div class="tg-bld mono" data-tg style="grid-row:${gr}"><span>${esc(row.b)}</span></div>`);
        tpl.push('auto'); gr++; lastB = row.b;
      }
      row.items.sort((a, c) => toMin(a.start) - toMin(c.start));

      // Blocks: a multi-phase event ("Code-a-thon · Briefing / Task / Evaluation") becomes one
      // block before lunch and one after, instead of one card per phase.
      const blocks = [], used = new Set();
      row.items.forEach(s => {
        const a = toMin(s.start), z = toMin(s.end);
        const reg = s.cat === 'Registration';
        const key = reg ? 'registration' : seriesHead(s) + '|' + (s.link || '');
        const grp = reg ? [] : s.title.includes(' · ') ? row.items.filter(o => o.title.includes(' · ') && seriesHead(o) + '|' + (o.link || '') === key) : [];
        if (grp.length < 2) {
          // Anything shorter than an hour gets a one-hour-wide card (never past lunch or the day's end),
          // so its text is not squeezed; overlapping neighbours stack into taller rows.
          let ez = z;
          if (z - a < 60) {
            ez = Math.min(a + 60, end);
            lunches.forEach(L => { if (a < L.a && ez > L.a) ez = Math.max(z, L.a); });
          }
          blocks.push({ s, a, z, ez, vis: [[a, ez]], single: true });
          return;
        }
        if (used.has(key)) return;
        used.add(key);
        const ga = Math.min(...grp.map(o => toMin(o.start))), gz = Math.max(...grp.map(o => toMin(o.end)));
        const L = lunches.find(l => ga < l.a && gz > l.z);
        const phase = o => ({ name: reg ? o.title : o.title.split(' · ').slice(1).join(' · '), time: `${short(o.start)} – ${short(o.end)}` });
        const head = { s: grp[0], title: reg ? '' : seriesHead(grp[0]), a: ga, z: gz };
        if (L) {
          const A = grp.filter(o => toMin(o.start) < L.a), B = grp.filter(o => toMin(o.start) >= L.a);
          blocks.push({ ...head, vis: [[ga, L.a]], phases: A.map(phase), from: ga, to: Math.max(...A.map(o => toMin(o.end))) });
          if (B.length) blocks.push({ ...head, vis: [[L.z, gz]], phases: B.map(phase), from: Math.min(...B.map(o => toMin(o.start))), to: gz, noLane: true });
        } else blocks.push({ ...head, vis: [[ga, gz]], phases: grp.map(phase), from: ga, to: gz });
      });

      const lanes = [], cells = [];
      let lastLane = 0;
      blocks.forEach(bk => {
        if (bk.noLane) { var lane = lastLane; } else {
          let l = lanes.findIndex(e => e <= bk.a);
          if (l < 0) { l = lanes.length; lanes.push(0); }
          lanes[l] = bk.ez ?? bk.z; lane = l; lastLane = l;
        }
        // Singles that cross lunch are cut where the lunch block starts and resume after it.
        let vis = bk.vis;
        if (bk.single) {
          lunches.forEach(L => {
            if (bk.a < L.z && bk.z > L.a && !(bk.a >= L.a && bk.z <= L.z)) {
              vis = [];
              if (bk.a < L.a) vis.push([bk.a, L.a]);
              if (bk.z > L.z) vis.push([L.z, bk.z]);
            }
          });
        }
        const inside = bk.single && lunches.some(L => bk.a >= L.a && bk.z <= L.z);
        vis.forEach(([va, vz]) => {
          const w = wid(va, vz);
          const size = bk.single ? (w < 1.5 ? ' xs' : '') : '';
          const s = bk.s, kind = bk.single ? kindOf(s) : '';
          const tag = s.link ? 'a' : 'div';
          const title = bk.single ? (size && !kind && s.cat !== 'Registration' ? compactTitle(s, row) : s.title) : bk.title;
          const full = bk.single ? `${s.title} · ${clock12(s.start)} – ${clock12(s.end)}${s.note ? ' · ' + s.note : ''}` : `${bk.title ? bk.title + ' · ' : ''}${bk.phases.map(p => `${p.name} ${p.time}`).join(' · ')}`;
          const from = bk.single ? toMin(s.start) : bk.from, to = bk.single ? toMin(s.end) : bk.to;
          const body = bk.single
            ? `<span class="mono">${short(s.start)} – ${short(s.end)}</span>${s.note ? `<em>${esc(s.note)}</em>` : ''}`
            : bk.phases.map(p => `<span class="ph"><i>${esc(p.name)}</i><span class="mono">${p.time}</span></span>`).join('');
          cells.push(`<${tag} class="gc${size}${kind ? ' k-brk' : ''}${inside ? ' over' : ''}${bk.single ? '' : ' multi'}"${s.link ? ` href="${esc(s.link)}"` : ''} title="${esc(full)}" aria-label="${esc(full)}" data-tg data-scat="${esc(s.cat)}" data-from="${istMs(s.day, hm(from))}" data-to="${istMs(s.day, hm(to))}" style="grid-column:${gA(va)} / ${gZ(vz)};grid-row:${gr + lane};--h:${hueOf(s)};--i:${i++}">${title ? `<b>${esc(title)}</b>` : ''}${body}</${tag}>`);
        });
      });
      const L = Math.max(lanes.length, 1);
      const alt = (rowNo++ % 2) ? ' alt' : '';
      parts.push(`<div class="tg-rowbg${alt}" data-tg style="grid-row:${gr} / span ${L}"></div>`);
      parts.push(`<div class="tg-label${alt}" data-tg style="grid-row:${gr} / span ${L}"><span>${esc(row.r)}</span></div>`);
      parts.push(...cells);
      for (let k = 0; k < L; k++) tpl.push('minmax(var(--rh), auto)');
      gr += L;
    });

    const vlines = [];
    for (let t = Math.ceil(start / 60) * 60; t < end; t += 60) vlines.push(`<i class="tg-vl" aria-hidden="true" style="grid-column:${gA(t)}"></i>`);
    const bands = lunches.map(L => `<div class="tg-lunch" data-tg data-scat="Break" role="note" aria-label="${esc(L.s.title)}, ${clock12(L.s.start)} to ${clock12(L.s.end)}${L.s.venue ? ', ' + esc(L.s.venue) : ''}" style="grid-column:${gA(L.a)} / ${gZ(L.z)};grid-row:1 / -1"><div class="tgl-in"><b>${esc(L.s.title)}</b><span class="mono">${short(L.s.start)} – ${short(L.s.end)}</span>${L.s.venue ? `<em>${esc(L.s.venue.replace(/,\s*Main Building$/, ''))}</em>` : ''}</div></div>`).join('');

    const cols = `var(--lw) ${wts.map(w => `minmax(0, ${w}fr)`).join(' ')}`;
    const head = [];
    if (start % 60) head.push(`<span class="tg-hr mono edge" style="grid-column:2 / ${gA(Math.ceil(start / 60) * 60)}">${short(hm(start))}</span>`);
    hours.forEach(t => {
      const to = Math.min(gA(t) + 4, n + 2);
      head.push(`<span class="tg-hr mono" data-tg style="grid-column:${gA(t)} / ${to}">${to - gA(t) < 4 ? short(hm(t)) : clock12(hm(t))}</span>`);
    });

    return `<div class="tgrid" style="--cols:${cols};--min:calc(var(--lw) + ${n} * var(--unit))">
      <p class="tg-hint mono">Scroll or drag sideways to see the whole day</p>
      <div class="tg-scroll" tabindex="0" role="region" aria-label="Timetable grid. On small screens it scrolls sideways.">
        <div class="tg-in">
          <div class="tg-head"><div class="tg-corner mono">Venue / Time</div>${head.join('')}</div>
          <div class="tg-body" style="grid-template-rows:${tpl.join(' ')}">${vlines.join('')}${parts.join('')}${bands}</div>
        </div>
      </div>
    </div>`;
  }

  PAGES.schedule = {
    title: 'Schedule',
    render() {
      const items = (TN.schedule || []).slice().sort((a, b) => (a.day + a.start + a.end).localeCompare(b.day + b.start + b.end));
      const days = [...new Set(items.map(s => s.day))];
      const cats = ['All', ...new Set(items.map(s => s.cat))];
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      const first = days.includes(today) ? today : days[0];
      const venues = new Set(items.map(s => s.venue).filter(Boolean)).size;
      return pageHead({
        kicker: 'Hour by hour',
        title: 'Schedule',
        sub: 'Every event, ceremony and result announcement across both days of the fest. Sessions that run at the same time sit side by side, so you can plan your route.',
        art: emblem('night', 225),
        extra: items.length ? `<div class="sched-sum mono" data-reveal style="--d:450ms"><span><b>${days.length}</b> days</span><span><b>${items.length}</b> sessions</span><span><b>${venues}</b> venues</span></div>` : '',
      }) + `
      <section class="sec tight" id="timetable">
        <div class="wrap">
          ${items.length ? `
          <div class="toolbar" data-reveal>
            <div class="chips" role="group" aria-label="Filter by type">${cats.map((c, i) => `<button class="chip" aria-pressed="${i === 0}" data-sfilter="${esc(c)}">${esc(c)}</button>`).join('')}</div>
            <div class="view-sw" role="group" aria-label="Layout"><button class="chip" aria-pressed="true" data-view="grid">Timetable</button><button class="chip" aria-pressed="false" data-view="list">List</button></div>
            <p class="mono muted small">All times IST</p>
          </div>
          <div class="tabs sched-tabs" data-tabs data-view="grid">
            <div class="tab-list" role="tablist" aria-label="Festival days">${days.map((d, i) => `<button role="tab" id="tb-d${i}" aria-controls="t-d${i}" aria-selected="${d === first}"><span class="mono">Day ${i + 1}</span> ${fmtDate(d + 'T12:00:00', true)}</button>`).join('')}<span class="tab-ink" aria-hidden="true"></span></div>
            ${days.map((d, i) => `<div class="tab-panel" role="tabpanel" id="t-d${i}" aria-labelledby="tb-d${i}"${d === first ? '' : ' hidden'}>${schedGrid(items.filter(s => s.day === d))}${schedDay(items.filter(s => s.day === d))}</div>`).join('')}
          </div>
          <p class="empty" hidden>Nothing of that type on this day.</p>` : '<p class="empty">The schedule will be published soon.</p>'}
        </div>
      </section>`;
    },
    mount() {
      let cat = 'All';
      const empty = $('#timetable .empty');
      const apply = () => {
        $$('.slot').forEach(sl => {
          let any = false;
          $$('.sev', sl).forEach(ev => { const on = cat === 'All' || ev.dataset.scat === cat; ev.hidden = !on; any = any || on; });
          sl.hidden = !any;
        });
        $$('.gc, .tg-lunch').forEach(g => g.classList.toggle('dim', cat !== 'All' && g.dataset.scat !== cat));
        const panel = $('.sched-tabs [role=tabpanel]:not([hidden])');
        if (empty && panel) empty.hidden = $$('.slot:not([hidden])', panel).length > 0;
      };
      $$('[data-sfilter]').forEach(b => b.addEventListener('click', () => {
        cat = b.dataset.sfilter;
        $$('[data-sfilter]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        apply();
      }));
      $$('[data-view]').forEach(b => { if (b.tagName !== 'BUTTON') return; b.addEventListener('click', () => {
        $('.sched-tabs').dataset.view = b.dataset.view;
        $$('button[data-view]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      }); });
      $$('.sched-tabs [role=tab]').forEach(t => t.addEventListener('click', () => requestAnimationFrame(apply)));

      // Drag the timetable sideways with the mouse (touch and trackpads already scroll natively).
      $$('.tg-scroll').forEach(sc => {
        let x0 = 0, l0 = 0, down = false, moved = false;
        sc.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || e.button) return; down = true; moved = false; x0 = e.clientX; l0 = sc.scrollLeft; });
        window.addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - x0; if (Math.abs(dx) > 5) { moved = true; sc.classList.add('drag'); } if (moved) sc.scrollLeft = l0 - dx; });
        window.addEventListener('pointerup', () => { down = false; sc.classList.remove('drag'); });
        sc.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
      });

      // Scroll-in animation for the timetable: rows, cards and the lunch band
      // appear as they enter the viewport and replay when a day tab is opened.
      const grids = $$('.tgrid');
      if (grids.length && 'IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        grids.forEach(g => g.classList.add('anim'));
        const reveal = (batch) => {
          // Row by row, top to bottom; cards within a row follow left to right.
          const rowOf = el => parseInt(el.style.gridRow, 10) || 0;
          const rows = [...new Set(batch.map(rowOf))].sort((x, y) => x - y);
          const seen = {};
          batch.sort((x, y) => rowOf(x) - rowOf(y) || (x.compareDocumentPosition(y) & 4 ? -1 : 1)).forEach(el => {
            const lunch = el.classList.contains('tg-lunch');
            const r = rowOf(el), c = seen[r] = (seen[r] ?? -1) + 1;
            const d = lunch ? 200 : Math.min(rows.indexOf(r) * 110 + c * 60, 900);
            el.style.setProperty('--td', d + 'ms');
            el.classList.add('in');
            setTimeout(() => el.classList.add('settled'), d + 1400);
          });
        };
        const io = new IntersectionObserver(entries => {
          const hit = entries.filter(e => e.isIntersecting).map(e => e.target);
          hit.forEach(el => io.unobserve(el));
          if (hit.length) reveal(hit);
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
        const arm = panel => $$('[data-tg]', panel).forEach(el => { el.classList.remove('in', 'settled'); el.style.removeProperty('--td'); io.observe(el); });
        $$('.sched-tabs [role=tabpanel]').forEach(arm);
        $$('.sched-tabs [role=tab]').forEach(t => t.addEventListener('click', () => {
          const panel = document.getElementById(t.getAttribute('aria-controls'));
          if (panel && !panel.querySelector('.tgrid [data-tg].in')) return;   // never shown yet: already armed
          requestAnimationFrame(() => arm(panel));
        }));
      }

      // Highlight whatever is running right now.
      const live = () => {
        const now = Date.now();
        $$('.sev, .gc').forEach(ev => {
          const from = +ev.dataset.from, to = +ev.dataset.to, on = now >= from && now < to;
          ev.classList.toggle('live', on);
          if (on) ev.style.setProperty('--p', Math.round(((now - from) / (to - from)) * 100));
        });
      };
      live();
      setInterval(live, 30000);
    },
  };

  /* ---------------------------------------------------------- gallery */
  const HUES = { Competitions: 168, 'Lab events': 195, Gaming: 280, Ceremony: 42 };
  const KINDS = { Competitions: 'code', 'Lab events': 'science', Gaming: 'gaming', Ceremony: 'spark' };
  const galleryItems = () => (TN.gallery || []).map((g, i) => ({ ...g, i, h: [300, 420, 360, 480, 320][i % 5], hue: (HUES[g.cat] ?? 210) + ((i * 17) % 30) - 15, kind: KINDS[g.cat] || 'spark' }));
  const photo = (g, w, h, big) => g.src
    ? `<img class="art" src="${esc(g.src)}" alt="${esc(g.caption)}" width="${w}" height="${h}" loading="${big ? 'eager' : 'lazy'}" decoding="async">`
    : art(g.i * 97 + 13, g.kind, g.hue, w, h);

  PAGES.gallery = {
    title: 'Gallery',
    render() {
      const cats = ['All', ...new Set((TN.gallery || []).map(g => g.cat))];
      return pageHead({
        kicker: 'Moments',
        title: 'Gallery',
        sub: 'Code-a-thons, lab challenges, on-stage showcases and gaming finals: moments from TechNation, compressed into frames.',
        art: emblem('design', 200),
      }) + `
      <section class="sec tight">
        <div class="wrap">
          <div class="toolbar" data-reveal><div class="chips" role="group" aria-label="Filter gallery">${cats.map((c, i) => `<button class="chip" aria-pressed="${i === 0}" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div></div>
          <div class="masonry" id="mas"></div>
          <p class="empty" hidden>Photos from this edition will appear here after the fest.</p>
        </div>
      </section>
      <section class="sec tight">
        <div class="wrap">
          <div class="ca-card hud" data-reveal>
            <div class="ca-art" aria-hidden="true">${mascot('gallery')}</div>
            <div class="ca-in">
              <p class="kicker">Were you there?</p>
              <h2 class="title sm">Share your shots</h2>
              <p class="lead">Send your best photos from past editions to <a class="text-link" href="mailto:${esc(TN.fest.email)}">${esc(TN.fest.email)}</a> or tag us on Instagram. The best ones make it to this wall.</p>
            </div>
          </div>
        </div>
      </section>`;
    },
    mount() {
      const items = galleryItems(), mas = $('#mas'), empty = $('#mas + .empty');
      let shown = items;
      const draw = cat => {
        shown = items.filter(g => cat === 'All' || g.cat === cat);
        mas.innerHTML = shown.map((g, k) => `
          <button class="gtile${g.src ? ' photo' : ''}" data-reveal style="--d:${(k % 4) * 60}ms;--gh:${g.h}" data-g="${k}" aria-label="Open ${esc(g.caption)}">
            ${photo(g, 400, g.h)}
            <span class="gcap"><span class="mono">${esc(g.cat)}${g.year ? ` · ${esc(g.year)}` : ''}</span><b>${esc(g.caption)}</b></span>
          </button>`).join('');
        empty.hidden = shown.length > 0;
        X.init(mas);
      };
      $$('[data-cat]').forEach(b => b.addEventListener('click', () => {
        $$('[data-cat]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        draw(b.dataset.cat);
      }));
      mas.addEventListener('click', e => {
        const t = e.target.closest('[data-g]');
        if (!t) return;
        let k = Number(t.dataset.g);
        const view = () => { const g = shown[k]; return `<div class="lb-art${g.src ? ' photo' : ''}">${photo(g, 1200, g.src ? 800 : 760, true)}</div><div class="lb-cap"><span class="mono muted">${esc(g.cat)} · ${k + 1} / ${shown.length}</span><b>${esc(g.caption)}</b></div>`; };
        const m = X.openModal(`<div class="lb">${view()}</div><button class="lb-nav prev" data-lb="-1" aria-label="Previous">${icon('back', 22)}</button><button class="lb-nav next" data-lb="1" aria-label="Next">${icon('arrow', 22)}</button>`, { cls: 'lightbox', label: 'Gallery' });
        const go = d => { k = (k + d + shown.length) % shown.length; $('.lb', m.el).innerHTML = view(); };
        m.el.addEventListener('click', ev => { const b = ev.target.closest('[data-lb]'); if (b) go(Number(b.dataset.lb)); });
        let sx = null;
        m.el.addEventListener('touchstart', ev => { sx = ev.touches[0].clientX; }, { passive: true });
        m.el.addEventListener('touchend', ev => { if (sx === null) return; const dx = ev.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); sx = null; });
        const key = ev => { if (!document.body.contains(m.el)) return removeEventListener('keydown', key); if (ev.key === 'ArrowRight') go(1); if (ev.key === 'ArrowLeft') go(-1); };
        addEventListener('keydown', key);
      });
      draw('All');
    },
  };

  /* ---------------------------------------------------------- sponsors */
  const TIER_HUES = [42, 205, 38, 210, 190];
  // Monogram plate for partners without a logo file.
  function plate(name, hue) {
    const n = ++aid, hex = Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * Math.PI * 2 - Math.PI / 2; return `${(Math.cos(a) * 32).toFixed(1)} ${(Math.sin(a) * 32).toFixed(1)}`; });
    return `<svg class="splate" viewBox="-50 -50 100 100" aria-hidden="true">
      <defs><radialGradient id="pl${n}"><stop offset="0" stop-color="hsl(${hue} 85% 55%)" stop-opacity=".35"/><stop offset="1" stop-color="hsl(${hue} 85% 55%)" stop-opacity="0"/></radialGradient></defs>
      <circle r="46" fill="url(#pl${n})"/>
      <g class="em-r2"><circle r="44" fill="none" stroke="hsl(${hue} 90% 72%)" stroke-opacity=".45" stroke-dasharray="1 6" stroke-width="2"/></g>
      <path d="M${hex.join('L')}Z" fill="rgba(6,7,10,.5)" stroke="hsl(${hue} 90% 72%)" stroke-width="1.6"/>
      <text text-anchor="middle" dominant-baseline="central" class="splate-t" fill="hsl(${hue} 90% 85%)">${esc(initials(name) || '?')}</text>
    </svg>`;
  }
  function sponsorCard(s, i, hue) {
    const tag = s.url ? 'a' : 'div';
    return `<${tag} class="scard hud" data-tilt data-reveal style="${stagger(i, 70, 4)};--h:${hue}"${s.url ? ` href="${esc(s.url)}" target="_blank" rel="noopener"` : ''}>
      <span class="glare"></span>
      <div class="slogo">${s.logo ? `<img src="${esc(s.logo)}" alt="${esc(s.name)} logo" loading="lazy">` : plate(s.name, hue)}</div>
      <b>${esc(s.name)}</b>
      ${s.tag ? `<span class="mono muted">${esc(s.tag)}</span>` : ''}
    </${tag}>`;
  }

  PAGES.sponsors = {
    title: 'Sponsors',
    render() {
      const S = TN.sponsors || [];
      const order = TN.sponsorTiers || [...new Set(S.map(s => s.tier))];
      const tiers = order.concat([...new Set(S.map(s => s.tier))].filter(t => !order.includes(t)))
        .map((t, i) => ({ t, i, items: S.filter(s => s.tier === t) })).filter(x => x.items.length);
      const steps = TN.partnerSteps || [];
      return pageHead({
        kicker: 'Powering the next frontier',
        title: 'Sponsors',
        sub: `${esc(TN.fest.name)} is made possible by organisations that believe in student builders. Thank you for powering the next generation of engineers and founders.`,
        art: emblem('business', 42),
        cls: 'gold',
        extra: `<div class="hero-cta" data-reveal style="--d:450ms"><a class="btn gold" href="#partner" data-magnetic>Become a partner ${icon('arrow', 18)}</a>${X.brochureBtn()}</div>`,
      }) + `
      <section class="sec tight">
        <div class="wrap">${tiers.length ? tiers.map(({ t, i, items }) => `
          <div class="tier${i === 0 ? ' tier-top' : ''}">
            <p class="tier-h mono" data-reveal style="--h:${TIER_HUES[i % TIER_HUES.length]}"><span>${esc(t)}</span></p>
            <div class="sgrid${i === 0 ? ' lead-tier' : ''}">${items.map((s, k) => sponsorCard(s, k, TIER_HUES[i % TIER_HUES.length])).join('')}</div>
          </div>`).join('') : '<p class="empty">Our partners for this edition will be announced soon.</p>'}
        </div>
      </section>
      <section class="sec tight">
        <div class="wrap">
          ${secHead('Why partner', 'Put your brand where builders are', 'Packages for every budget, from title sponsorship to a single event.')}
          <div class="bgrid">${(TN.partnerBenefits || []).map((b, i) => `
            <div class="bcard hud" data-reveal style="${stagger(i)}"><span class="bicon">${icon(b.icon, 26)}</span><h3>${esc(b.title)}</h3><p>${esc(b.text)}</p></div>`).join('')}
          </div>
        </div>
      </section>
      ${steps.length ? `<section class="sec">
        <div class="wrap">
          ${secHead('Process', 'From first call to fest day')}
          <ol class="hsteps" style="--n:${steps.length}">${steps.map((s, i) => `<li data-reveal style="--d:${i * 90}ms"><span class="hs-n mono">${String(i + 1).padStart(2, '0')}</span><b>${esc(s)}</b></li>`).join('')}</ol>
        </div>
      </section>` : ''}
      <section class="sec tight" id="partner">
        <div class="wrap">
          <div class="eb-card hud gold-card" data-reveal>
            <div class="eb-l">
              <p class="kicker">Let's talk</p>
              <h2 class="title sm">Ready to power ${esc(TN.fest.name)} ${new Date(TN.fest.start).getFullYear()}?</h2>
              <p class="lead">Tell us what you'd like to achieve and our sponsorship team will put together a package that fits.</p>
              <div class="hero-cta">
                <button class="btn gold" data-sponsor data-magnetic>Enquire about sponsorship ${icon('arrow', 18)}</button>
                ${X.brochureBtn() || `<a class="btn ghost" href="mailto:${esc(TN.fest.email)}?subject=${encodeURIComponent('Sponsorship — ' + TN.fest.name)}">Email us</a>`}
              </div>
            </div>
            <div class="eb-r"><div class="eb-mascot" aria-hidden="true">${mascot('sponsors')}</div></div>
          </div>
        </div>
      </section>`;
    },
    mount() {
      $('[data-sponsor]').addEventListener('click', () => X.formModal({
        title: 'Sponsorship enquiry',
        sub: 'We usually reply within two working days.',
        art: mascot('sponsors'),
        fields: [
          { name: 'company', label: 'Company / Organisation' },
          { name: 'name', label: 'Your name', auto: 'name', half: true },
          { name: 'role', label: 'Your role', half: true, required: false },
          { name: 'email', label: 'Work email', type: 'email', auto: 'email', half: true },
          { name: 'phone', label: 'Phone number', type: 'tel', pattern: '[0-9+ ]{8,15}', half: true },
          { name: 'interest', label: 'Interested in', type: 'select', options: (TN.sponsorTiers || []).concat(['Sponsored challenge', 'Event sponsorship', 'Not sure yet']) },
          { name: 'msg', label: 'Anything else?', type: 'textarea', required: false },
        ],
        submit: 'Send enquiry',
        ref: 'sponsorship',
        done: 'Thanks! Our sponsorship team will be in touch shortly.',
      }));
    },
  };

  /* -------------------------------------------------------------- team */
  // "Faculty Coordinator · +91 98221 67259" -> role, then the number on its own line (never split).
  function roleLine(role) {
    const parts = String(role || '').split(/\s+·\s+/);
    const last = parts[parts.length - 1];
    const phone = parts.length > 1 && /^\+?[\d\s()-]{7,}$/.test(last) ? parts.pop() : '';
    return `<span class="mono muted">${esc(parts.join(' · '))}${phone ? `<span class="tphone">${esc(phone)}</span>` : ''}</span>`;
  }

  function teamCard(t, i) {
    return `<div class="tcard hud" data-tilt data-reveal style="${stagger(i, 70, 4)}"><span class="glare"></span>
      <div class="tav">${t.photo ? `<img src="${esc(t.photo)}" alt="" loading="lazy">` : `<span class="tav-ic">${icon('user', 30)}</span>`}<svg viewBox="-50 -50 100 100" aria-hidden="true"><circle r="46" fill="none" stroke="#6fc4f2" stroke-opacity=".4" stroke-dasharray="2 5"/><circle cx="46" r="2.5" fill="#ff9a3c"/></svg></div>
      ${roleLine(t.role)}<h3>${esc(t.name)}</h3>
      ${t.dept ? `<p class="muted small">${esc(t.dept)}</p>` : ''}
      <div class="tlinks">
        ${t.email ? `<a class="tmail mono" href="mailto:${esc(t.email)}" aria-label="Email ${esc(t.name)}">${icon('mail', 14)} Email</a>` : ''}
        ${t.linkedin ? `<a class="tmail mono" href="${esc(t.linkedin)}" target="_blank" rel="noopener" aria-label="${esc(t.name)} on LinkedIn">${icon('linkedin', 14)} LinkedIn</a>` : ''}
      </div></div>`;
  }

  PAGES.team = {
    title: 'Team',
    render() {
      const T = TN.team || [];
      const order = TN.teamGroups || [];
      const groups = order.concat([...new Set(T.map(t => t.group))].filter(g => !order.includes(g)))
        .map(g => ({ g, items: T.filter(t => t.group === g) })).filter(x => x.items.length);
      return pageHead({
        kicker: 'The people behind it',
        title: 'Team',
        sub: `${esc(TN.fest.name)} is built by students and faculty who spend a whole year preparing two days of competition on our campus.`,
        art: emblem('globe', 205),
      }) + groups.map(({ g, items }, gi) => `
      <section class="sec tight">
        <div class="wrap">
          ${secHead(String(gi + 1).padStart(2, '0'), esc(g))}
          <div class="team">${items.map(teamCard).join('')}</div>
        </div>
      </section>`).join('');
    },
  };

  /* ------------------------------------------------------------- about */
  PAGES.about = {
    title: 'About Us',
    render() {
      const f = TN.fest, list = comps();
      const stats = [...(TN.stats || []),
        { n: list.length, suffix: '', label: 'Events & competitions' }];
      const places = TN.places || [];
      const R = TN.recognition || [];
      const stay = TN.stay || { details: [], perks: [] };
      const first = (TN.history || [])[0];
      return pageHead({
        kicker: first ? `Since ${esc(first.year)}` : 'Our story',
        title: 'About Us',
        sub: `Hosted by the ${esc(f.department || 'Department of Computer Science')}, ${esc(f.college || f.venueShort)}. Teams from invited colleges across India come to our campus in Margao to compete.`,
        art: mascot('team'),
      }) + `
      <section class="sec tight">
        <div class="wrap split-2">
          <div>
            ${secHead('Our story', 'From Spectra<br>to TechNation')}
            <div class="story-mascot" data-reveal aria-hidden="true">${mascot('home')}</div>
          </div>
          <div class="story" data-reveal style="--d:120ms">
            ${(TN.story || []).map(p => `<p class="big-p">${esc(p)}</p>`).join('')}

          </div>
        </div>
        <div class="wrap"><div class="stats">${stats.map((s, i) => `
          <div class="stat hud" data-reveal style="--d:${i * 90}ms"><b class="stat-n" data-count="${s.n}" data-suffix="${esc(s.suffix || '')}">0</b><span class="stat-l">${esc(s.label)}</span></div>`).join('')}
        </div></div>
      </section>

      <section class="sec tight">
        <div class="wrap">
          ${secHead('What drives us', 'Vision, mission & community')}
          <div class="bgrid">${(TN.pillars || []).map((b, i) => `<div class="bcard hud" data-reveal style="${stagger(i)}"><span class="bnum mono">0${i + 1}</span><span class="bicon">${icon(b.icon, 24)}</span><h3>${esc(b.title)}</h3><p>${esc(b.text)}</p></div>`).join('')}</div>
        </div>
      </section>

      ${(TN.history || []).length ? `<section class="sec">
        <div class="wrap">
          ${secHead('The journey', 'From Spectra to a national stage')}
          <div class="tl-v" data-tl>
            <div class="tl-line" aria-hidden="true"><i></i></div>
            ${TN.history.map((h, i) => `
              <div class="tl-item ${i % 2 ? 'r' : 'l'}" data-reveal>
                <span class="tl-dot" aria-hidden="true"></span>
                <div class="tl-card hud"><span class="tl-year">${esc(h.year)}</span><h3>${esc(h.title)}</h3><p>${esc(h.text)}</p></div>
              </div>`).join('')}
          </div>
        </div>
      </section>` : ''}

      ${places.length ? `<section class="sec tight">
        <div class="wrap globe-row">
          <div class="globe-wrap" data-reveal="scale">
            <canvas class="globe" aria-label="Interactive globe of the cities our participants travel from"></canvas>
            <span class="globe-tip mono" aria-hidden="true"></span>
            <p class="mono muted globe-hint">Drag to rotate · hover the markers</p>
          </div>
          <div class="globe-b">
            ${secHead('Reach', 'One fest, the whole nation', 'Participants travel in from every corner of India, and a few from beyond its borders.')}
            <ul class="places" data-reveal style="--d:200ms">${places.map(p => `<li class="${p.home ? 'home' : ''}">${esc(p.name)}</li>`).join('')}</ul>
          </div>
        </div>
      </section>` : ''}

      ${R.length ? `<section class="sec tight">
        <div class="wrap car" data-carousel>
          <div class="row-head">${secHead('Milestones', 'The College through the years')}
            <div class="car-btns" data-reveal><button class="icon-btn hud" data-car="-1" aria-label="Previous">${icon('back', 18)}</button><button class="icon-btn hud" data-car="1" aria-label="Next">${icon('arrow', 18)}</button></div>
          </div>
          <div class="car-row" tabindex="0" role="region" aria-label="College milestones">${R.map((p, i) => `
            <figure class="letter" data-reveal style="${stagger(i, 70, 6)}">
              <div class="letter-paper">${letter(Number(p.year) * 31 + i)}</div>
              <figcaption><span class="mono gold-t">${esc(p.year)} · ${esc(p.from)}</span><p>${esc(p.text)}</p></figcaption>
            </figure>`).join('')}
          </div>
        </div>
      </section>` : ''}

      <section class="sec tight" id="venue">
        <div class="wrap map-row">
          <div class="map hud" data-reveal>${mapArt()}</div>
          <div class="map-b" data-reveal style="--d:120ms">
            <p class="kicker">Venue</p>
            <h2 class="title sm">See you at ${esc(f.venueShort)}</h2>
            <p class="lead">${esc(f.venue)}. Every event is held offline on campus on ${festRange()}; participating teams travel here from their colleges.</p>
            <a class="btn ghost" href="${esc(f.mapUrl)}" target="_blank" rel="noopener">Open in maps ${icon('external', 16)}</a>
          </div>
        </div>
      </section>

      <section class="sec tight" id="stay">
        <div class="wrap">
          <div class="row-head">
            ${secHead(esc(stay.kicker || 'Accommodation & travel'), esc(stay.title || 'Coming from outside Goa?'), esc(stay.lead || ''))}
            <button class="btn" data-stay data-reveal data-magnetic>Request accommodation help ${icon('arrow', 18)}</button>
          </div>
          <div class="dgrid4">${stay.details.map((d, i) => `
            <div class="detail hud" data-reveal style="${stagger(i, 80, 4)}"><span class="bicon">${icon(d.icon, 22)}</span><span class="mono muted">${esc(d.label)}</span><b>${esc(d.value)}</b><p class="muted">${esc(d.text)}</p></div>`).join('')}
          </div>
          <div class="bgrid four stay-perks">${stay.perks.map((p, i) => `<div class="bcard hud" data-reveal style="${stagger(i, 80, 4)}"><span class="bicon">${icon(p.icon, 24)}</span><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div>`).join('')}</div>
        </div>
      </section>

      <section class="sec" id="contact">
        <div class="wrap">
          ${secHead('Get in touch', 'Contact us', 'Questions about events, team registration, accommodation or sponsorship? Write to us or call the faculty coordinators.')}
          <div class="contact-grid">
            <div class="contact-info">
              <a class="info hud" href="mailto:${esc(f.email)}" data-reveal>${icon('mail', 22)}<div><b>${esc(f.email)}</b><span class="muted">Email</span></div></a>
              <a class="info hud" href="tel:${esc(String(f.phone).replace(/[^0-9+]/g, ''))}" data-reveal style="--d:80ms">${icon('phone', 22)}<div><b>${esc(f.phone)}</b><span class="muted">Phone</span></div></a>
              <a class="info hud" href="${esc(f.mapUrl)}" target="_blank" rel="noopener" data-reveal style="--d:160ms">${icon('pin', 22)}<div><b>${esc(f.venue)}</b><span class="muted">Address</span></div></a>
              <div class="socials big" data-reveal style="--d:240ms">${f.socials.map(s => `<a class="soc" href="${esc(s.href)}" aria-label="${esc(s.name)}" data-magnetic>${icon(s.icon, 20)}</a>`).join('')}</div>
            </div>
            <form class="contact-form hud" data-contact data-reveal style="--d:120ms" novalidate>
              <h2 class="panel-h">Send a message</h2>
              <div class="form-grid">
                <div class="field half"><label for="c-name">Name</label><input class="input" id="c-name" name="name" required autocomplete="name"></div>
                <div class="field half"><label for="c-email">Email</label><input class="input" id="c-email" name="email" type="email" required autocomplete="email"></div>
                <div class="field"><label for="c-topic">Topic</label><select class="input" id="c-topic" name="topic" required><option value="">Select</option><option>Events</option><option>Team registration</option><option>Accommodation</option><option>Sponsorship</option><option>Media & press</option><option>Something else</option></select></div>
                <div class="field"><label for="c-msg">Message</label><textarea class="input" id="c-msg" name="msg" rows="5" required></textarea></div>
              </div>
              <button class="btn full" type="submit">Send message ${icon('send', 18)}</button>
              <p class="form-note mono">${X.formNote()}</p>
            </form>
          </div>
        </div>
      </section>`;
    },
    mount() {
      const tl = $('[data-tl]');
      if (tl) {
        const line = $('.tl-line i', tl);
        X.onScroll(() => {
          const r = tl.getBoundingClientRect();
          line.style.transform = `scaleY(${clamp((innerHeight * 0.6 - r.top) / r.height, 0, 1).toFixed(3)})`;
        });
      }
      const g = $('.globe');
      if (g) globe(g, TN.places, $('.globe-tip'));
      const car = $('[data-carousel]');
      if (car) carousel(car);
      $('[data-stay]').addEventListener('click', () => X.formModal({
        title: 'Accommodation assistance',
        sub: 'Accommodation is arranged by your team. Tell us what you need and the organising committee will help where it can.',
        art: mascot('venue'),
        fields: [
          { name: 'name', label: 'Name', auto: 'name' },
          { name: 'email', label: 'Email', type: 'email', auto: 'email' },
          { name: 'phone', label: 'Phone number', type: 'tel', pattern: '[0-9+ ]{8,15}', half: true },
          { name: 'people', label: 'Number of people (students + faculty)', type: 'number', half: true },
          { name: 'gender', label: 'Group', type: 'select', options: ['Female', 'Male', 'Mixed group', 'Prefer not to say'] },
          { name: 'college', label: 'College' },
        ],
        submit: 'Submit request',
        ref: 'accommodation',
        done: 'Request received. The faculty coordinators will get back to you with guidance.',
      }));
      const form = $('[data-contact]');
      form.addEventListener('submit', async e => {
        e.preventDefault();
        if (!form.checkValidity()) {
          $$('.input', form).forEach(i => i.closest('.field').classList.toggle('bad', !i.checkValidity()));
          const bad = $(':invalid', form); bad && bad.focus();
          return;
        }
        const btn = $('button[type=submit]', form);
        btn.disabled = true;
        if (!(await X.send('Contact message', 'contact', Object.fromEntries(new FormData(form))))) {
          btn.disabled = false;
          X.toast('Could not send right now. Please try again.');
          return;
        }
        form.innerHTML = `<div class="form-done"><div class="done-ring">${icon('check', 34)}</div><p>${X.live() ? 'Thanks for writing in. The coordinators will get back to you.' : X.mailDone()}</p></div>`;
      });
      form.addEventListener('input', e => e.target.closest('.field')?.classList.remove('bad'));
    },
  };

  /* ----------------------------------------------------------- legals */
  PAGES.legals = {
    title: 'Legals',
    render() {
      const L = TN.legal || { terms: [], privacy: [] };
      const block = list => list.map((s, i) => `<section class="legal-s"><h3><span class="mono">${String(i + 1).padStart(2, '0')}</span>${esc(s.h)}</h3><p>${esc(s.p)}</p></section>`).join('');
      return pageHead({ kicker: 'The fine print', title: 'Legals', sub: 'Terms of participation and how registration data is handled.', art: emblem('seal', 210) }) + `
      <section class="sec tight">
        <div class="wrap narrow">
          <h2 class="sr">Terms and privacy</h2>
          <div class="tabs" data-tabs>
            <div class="tab-list" role="tablist" aria-label="Legal documents">
              <button role="tab" id="tb-terms" aria-controls="t-terms" aria-selected="true">Terms and Conditions</button>
              <button role="tab" id="tb-priv" aria-controls="t-priv" aria-selected="false">Privacy Policy</button>
              <span class="tab-ink" aria-hidden="true"></span>
            </div>
            <div class="tab-panel legal" role="tabpanel" id="t-terms" aria-labelledby="tb-terms">${block(L.terms)}</div>
            <div class="tab-panel legal" role="tabpanel" id="t-priv" aria-labelledby="tb-priv" hidden>${block(L.privacy)}</div>
          </div>
        </div>
      </section>`;
    },
  };

  /* -------------------------------------------------------------- 404 */
  PAGES.notfound = {
    title: 'Not found',
    render: () => notFound('This page drifted out of orbit.', 'index.html', 'Back home'),
  };

  window.PAGES = PAGES;
})();
