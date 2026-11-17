/* ==========================================================================
   TechNation motion layer (pairs with assets/css/motion.css)
   Adds: cursor spotlight on panels, letter-wave headings, hero parallax,
   floating orbs and shooting stars, button ripples, scroll-reactive marquee,
   cursor dot + click burst + sparkle trail, bouncy mascots, scroll-to-top
   ring, section rule draw-ins and confetti on successful sign-ups.
   Everything is skipped for visitors who prefer reduced motion.
   ========================================================================== */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const raf = fn => { let q = false; return (...a) => { if (q) return; q = true; requestAnimationFrame(() => { q = false; fn(...a); }); }; };
  document.documentElement.classList.add('mo');

  /* ---------------------------------------------------- spotlight on panels */
  if (fine) {
    let hudEl = null, mx = 0, my = 0;
    const paint = raf(() => {
      if (!hudEl) return;
      const r = hudEl.getBoundingClientRect();
      hudEl.style.setProperty('--mx', (mx - r.left).toFixed(0) + 'px');
      hudEl.style.setProperty('--my', (my - r.top).toFixed(0) + 'px');
    });
    document.addEventListener('pointermove', e => {
      hudEl = e.target.closest ? e.target.closest('.ccard, .scard') : null;
      if (hudEl) { mx = e.clientX; my = e.clientY; paint(); }
    }, { passive: true });
  }

  /* --------------------------------------------- headings react to cursor */
  if (fine) {
    let active = null, chars = [], px = 0, py = 0;
    const reset = el => { $$('.ch', el).forEach(c => { c.style.removeProperty('--ly'); c.style.removeProperty('--sc'); c.style.removeProperty('--k'); }); };
    const wave = raf(() => {
      if (!active) return;
      chars.forEach(c => {
        const r = c.getBoundingClientRect();
        const d = Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height / 2));
        const k = clamp(1 - d / (r.height * 1.7), 0, 1);
        c.style.setProperty('--ly', (-k * r.height * 0.14).toFixed(1) + 'px');
        c.style.setProperty('--sc', (1 + k * 0.1).toFixed(3));
        c.style.setProperty('--k', (k * 0.85).toFixed(2));
      });
    });
    document.addEventListener('pointermove', e => {
      const s = e.target.closest && e.target.closest('.split.settled');
      if (s !== active) { if (active) reset(active); active = s; chars = s ? $$('.ch', s) : []; }
      if (s) { px = e.clientX; py = e.clientY; wave(); }
    }, { passive: true });
  }

  /* --------------------------------- hero / page-head depth + mouse parallax */
  const heroes = new Set();
  function ambient(h) {
    if (h.dataset.mo) return;
    h.dataset.mo = '1';
    const orbs = document.createElement('div');
    orbs.className = 'mo-orbs';
    orbs.setAttribute('aria-hidden', 'true');
    const gold = h.classList.contains('gold');
    orbs.innerHTML = `
      <span class="mo-orb" style="--x:-6%;--y:12%;--sz:46vmin;--depth:30;--dur:19s"></span>
      <span class="mo-orb ${gold ? 'gold' : 'pink'}" style="--x:68%;--y:48%;--sz:38vmin;--depth:-24;--dur:23s"></span>
      <span class="mo-orb gold" style="--x:38%;--y:-12%;--sz:28vmin;--depth:18;--dur:17s"></span>`
      + (h.classList.contains('hero') ? Array.from({ length: 5 }, (_, i) =>
        `<i class="mo-star" style="--x:${8 + i * 19}%;--y:${6 + (i * 13) % 34}%;--a:${24 + (i * 7) % 18}deg;--dl:${i * 2.3 + 1}s;--dur:${6 + (i % 3) * 2}s"></i>`).join('') : '');
    h.insertBefore(orbs, h.firstChild);
    heroes.add(h);
  }
  if (fine) {
    const move = raf(e => {
      heroes.forEach(h => {
        const r = h.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const x = clamp((e.clientX - r.left) / r.width * 2 - 1, -1, 1), y = clamp((e.clientY - r.top) / r.height * 2 - 1, -1, 1);
        h.style.setProperty('--px', x.toFixed(3));
        h.style.setProperty('--py', y.toFixed(3));
        const a = $('.hero-astro .astrolabe', h);
        if (a) { a.style.setProperty('--ry', (x * 7).toFixed(2) + 'deg'); a.style.setProperty('--rx', (-y * 6).toFixed(2) + 'deg'); }
      });
    });
    document.addEventListener('pointermove', move, { passive: true });
  }

  /* ---------------------------------------- scroll-reactive marquee speed */
  let mqAnim = null, mqRate = 1, mqHover = false, lastY = scrollY, vel = 0;
  document.addEventListener('pointerover', e => { mqHover = !!(e.target.closest && e.target.closest('.marquee')); }, { passive: true });
  addEventListener('scroll', () => { const y = scrollY; vel = y - lastY; lastY = y; }, { passive: true });
  (function mqLoop() {
    if (!mqAnim || mqAnim.playState === 'idle') {
      const t = $('.mq-track');
      mqAnim = t && t.getAnimations ? (t.getAnimations()[0] || null) : null;
    }
    if (mqAnim) {
      const target = (mqHover ? 0.3 : 1) + clamp(vel * 0.14, -7, 9);
      mqRate += (target - mqRate) * 0.09;
      if (Math.abs(mqRate) < 0.05) mqRate = mqRate < 0 ? -0.05 : 0.05;
      try { mqAnim.updatePlaybackRate(mqRate); } catch (_) { mqAnim.playbackRate = mqRate; }
    }
    vel *= 0.86;
    requestAnimationFrame(mqLoop);
  })();

  /* ------------------------------------------------------------ mascots */
  const lines = ['Beep boop!', 'Hi there!', 'See you on 8 Jan!', 'Register your team!', 'Wheee!', 'Connect. Learn. Transform.'];
  let li = 0;
  document.addEventListener('click', e => {
    const m = e.target.closest && e.target.closest('.mascot');
    if (!m || m.classList.contains('boing')) return;
    m.classList.add('boing');
    m.addEventListener('animationend', function f(ev) { if (ev.animationName === 'boing') { m.classList.remove('boing'); m.removeEventListener('animationend', f); } });
    const r = m.getBoundingClientRect();
    const h = document.createElement('div');
    h.className = 'mascot-hint';
    h.textContent = lines[li++ % lines.length];
    h.style.left = (r.left + r.width / 2) + 'px';
    h.style.top = Math.max(60, r.top + 10) + 'px';
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 1700);
  });
  if (fine) {
    const look = raf(e => {
      $$('.mascot').forEach(m => {
        const r = m.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const dx = (e.clientX - (r.left + r.width / 2)) / innerWidth;
        m.style.rotate = clamp(dx * 14, -7, 7).toFixed(2) + 'deg';
      });
    });
    document.addEventListener('pointermove', look, { passive: true });
  }

  /* --------------------------------------------------- scroll-to-top ring */
  (function toTop() {
    const b = document.createElement('button');
    b.className = 'to-top';
    b.setAttribute('aria-label', 'Back to top');
    b.innerHTML = `<svg viewBox="0 0 52 52" aria-hidden="true"><circle class="bg" cx="26" cy="26" r="24"/><circle class="fg" cx="26" cy="26" r="24"/></svg><svg class="ic" style="position:relative;inset:auto;width:18px;height:18px;transform:none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>`;
    document.body.appendChild(b);
    b.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
    const upd = raf(() => {
      const h = document.documentElement.scrollHeight - innerHeight;
      b.style.setProperty('--p', h > 0 ? clamp(scrollY / h, 0, 1).toFixed(3) : 0);
      b.classList.toggle('show', scrollY > 700);
    });
    addEventListener('scroll', upd, { passive: true });
    upd();
  })();

  /* ------------------------------------------------------------ confetti */
  function confetti(x, y) {
    const c = document.createElement('canvas');
    c.className = 'mo-confetti';
    c.setAttribute('aria-hidden', 'true');
    const dpr = Math.min(devicePixelRatio || 1, 2);
    c.width = innerWidth * dpr; c.height = innerHeight * dpr;
    document.body.appendChild(c);
    const g = c.getContext('2d'); g.scale(dpr, dpr);
    const cols = ['#4facfe', '#6fc4f2', '#f3dca4', '#d9b46c', '#ff9a3c', '#ff4d6d', '#ffffff'];
    const ps = Array.from({ length: 110 }, () => {
      const a = -Math.PI / 2 + (Math.random() - .5) * 1.9, v = 7 + Math.random() * 10;
      return { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, w: 6 + Math.random() * 6, h: 3 + Math.random() * 4, r: Math.random() * 6, vr: (Math.random() - .5) * .45, c: cols[(Math.random() * cols.length) | 0], life: 1 };
    });
    (function f() {
      g.clearRect(0, 0, innerWidth, innerHeight);
      let alive = 0;
      for (const p of ps) {
        p.vy += .33; p.vx *= .992; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        if (p.y > innerHeight + 30) continue;
        alive++;
        g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c;
        g.globalAlpha = clamp((innerHeight - p.y) / 160 + .2, 0, 1);
        g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2) + .2)); g.restore();
      }
      alive ? requestAnimationFrame(f) : c.remove();
    })();
  }
  window.TNMotion = { confetti };

  /* --------------------------------------- DOM watcher: enhance new nodes */
  const kio = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add('k-on');
    const k = $('.kicker', en.target); k && k.classList.add('k-on');
    kio.unobserve(en.target);
  }), { threshold: 0.4 }) : null;

  function enhance() {
    $$('.hero, .phead').forEach(ambient);
    $$('.sec-head:not([data-ko]), .kicker:not([data-ko])').forEach(el => {
      el.dataset.ko = '1';
      if (el.classList.contains('kicker') && el.closest('.sec-head')) return;
      kio ? kio.observe(el) : el.classList.add('k-on');
    });
    $$('.hero-cta .btn:not(.ghost), .btn.gold, .foot-cta-row .btn:not(.ghost), .eb-card .btn').forEach(b => b.classList.add('cta-pulse'));
    $$('.split.in:not([data-st])').forEach(s => {
      s.dataset.st = '1';
      const n = $$('.ch', s).length;
      setTimeout(() => s.classList.add('settled'), 900 + n * 40 + 1200);
    });
    // Counters: pop once the count finishes.
    $$('[data-counted]:not([data-pop])').forEach(el => {
      el.dataset.pop = '1';
      setTimeout(() => { el.classList.add('done'); }, 2050);
    });
    // Sign-up success → confetti.
    const done = $('.form-done:not([data-cf])');
    if (done) {
      done.dataset.cf = '1';
      const r = (done.querySelector('.done-ring') || done).getBoundingClientRect();
      confetti(r.left + r.width / 2, r.top + r.height / 2);
    }
  }
  const run = raf(enhance);
  new MutationObserver(run).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  addEventListener('DOMContentLoaded', run);
  run();
})();
