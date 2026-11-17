/* ==========================================================================
   Aether: full-screen WebGL nebula behind every page.
   Domain-warped fractal noise in deep blues with faint gold filaments,
   twinkling stars, a soft glow that follows the pointer, and drift on scroll.
   Falls back to the CSS gradient on body::before when WebGL is unavailable.
   ========================================================================== */
window.Aether = (() => {
  'use strict';

  const VERT = `
    attribute vec2 p;
    void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

  const FRAG = `
    precision mediump float;
    uniform vec2 uRes;
    uniform float uTime;
    uniform vec2 uMouse;
    uniform float uScroll;
    uniform float uInt;

    float hash(vec2 p){
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }
    float noise(vec2 p){
      vec2 i = floor(p), f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
    }
    float fbm(vec2 p){
      float v = 0.0, a = 0.5;
      mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
      for (int i = 0; i < 5; i++){ v += a * noise(p); p = m * p; a *= 0.5; }
      return v;
    }

    void main(){
      vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
      vec2 m = uMouse - 0.5;
      float t = uTime * 0.045;

      vec2 p = uv * 1.45 + vec2(0.0, uScroll * 0.28) + m * 0.12;
      vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t * 0.8));
      vec2 r = vec2(fbm(p + 3.5 * q + vec2(1.7, 9.2) + t * 0.6),
                    fbm(p + 3.5 * q + vec2(8.3, 2.8) - t * 0.5));
      float f = fbm(p + 3.0 * r);

      vec3 col = vec3(0.010, 0.013, 0.026);
      col = mix(col, vec3(0.035, 0.10, 0.28), smoothstep(0.25, 0.95, f));
      col = mix(col, vec3(0.18, 0.43, 0.93), smoothstep(0.55, 1.15, length(q)) * 0.5);
      col = mix(col, vec3(0.43, 0.77, 0.95), smoothstep(0.55, 0.95, r.x) * 0.3 * f);
      col += vec3(0.85, 0.68, 0.36) * pow(smoothstep(0.62, 0.95, f), 2.0) * 0.28;

      float d = length(uv - m * vec2(uRes.x / uRes.y, 1.0));
      col += vec3(0.18, 0.44, 0.93) * 0.10 * exp(-d * 3.0);

      vec2 g = gl_FragCoord.xy + vec2(0.0, uScroll * uRes.y * 0.04);
      float s = hash(floor(g));
      float tw = 0.55 + 0.45 * sin(uTime * 1.6 + s * 90.0);
      col += vec3(0.8, 0.9, 1.0) * step(0.9978, s) * tw;

      col *= smoothstep(1.45, 0.2, length(uv * vec2(0.85, 1.0)));
      col *= uInt;
      col += (hash(gl_FragCoord.xy + uTime) - 0.5) / 255.0;
      gl_FragColor = vec4(col, 1.0);
    }`;

  function compile(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('Aether shader:', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  function mount(canvas, opts = {}) {
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, powerPreference: 'low-power' });
    if (!gl) return null;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return null;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);

    // One oversized triangle covers the viewport.
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const U = {};
    ['uRes', 'uTime', 'uMouse', 'uScroll', 'uInt'].forEach(n => (U[n] = gl.getUniformLocation(prog, n)));

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const state = {
      intensity: opts.intensity ?? 1,
      mouse: [0.5, 0.5], mouseT: [0.5, 0.5],
      scroll: 0, scrollT: 0,
      t0: performance.now(), raf: 0, running: false,
    };

    function resize() {
      // Render below native resolution; the noise is soft so upscaling is invisible.
      const scale = innerWidth > 1600 ? 0.4 : 0.55;
      const w = Math.max(1, Math.round(innerWidth * scale));
      const h = Math.max(1, Math.round(innerHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }

    function draw(now) {
      const k = 0.06;
      state.mouse[0] += (state.mouseT[0] - state.mouse[0]) * k;
      state.mouse[1] += (state.mouseT[1] - state.mouse[1]) * k;
      state.scroll += (state.scrollT - state.scroll) * 0.08;
      gl.uniform2f(U.uRes, canvas.width, canvas.height);
      gl.uniform1f(U.uTime, reduce ? 12 : (now - state.t0) / 1000);
      gl.uniform2f(U.uMouse, state.mouse[0], state.mouse[1]);
      gl.uniform1f(U.uScroll, state.scroll);
      gl.uniform1f(U.uInt, state.intensity);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function loop(now) {
      draw(now);
      state.raf = requestAnimationFrame(loop);
    }
    function start() {
      if (state.running || reduce) return;
      state.running = true;
      state.raf = requestAnimationFrame(loop);
    }
    function stop() {
      state.running = false;
      cancelAnimationFrame(state.raf);
    }

    addEventListener('resize', () => { resize(); if (reduce) draw(performance.now()); });
    addEventListener('pointermove', e => {
      state.mouseT[0] = e.clientX / innerWidth;
      state.mouseT[1] = 1 - e.clientY / innerHeight;
    }, { passive: true });
    addEventListener('scroll', () => { state.scrollT = scrollY / innerHeight; }, { passive: true });
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

    resize();
    draw(performance.now());
    canvas.classList.add('on');
    start();

    return {
      setIntensity(v) { state.intensity = v; if (reduce) draw(performance.now()); },
      stop, start,
    };
  }

  return { mount };
})();
