/* Polyphus — dark terminal one-pager
   no letter-scramble. typewriter, boot reveals, live counters,
   ascii relay scene, parallel-agents grid, drifting ascii background. */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };

  /* ---------- year ---------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- background ascii field ---------- */
  var bg = $('#asciiBg');
  if (bg) {
    var pool = '   ...:::+++===---·°  01 /\\|_';
    var block = '';
    for (var r = 0; r < 70; r++) {
      var line = '';
      for (var c = 0; c < 90; c++) line += pool.charAt((Math.random() * pool.length) | 0);
      block += line + '\n';
    }
    bg.textContent = block + block;
  }

  /* ---------- nav stuck + scroll progress ---------- */
  var nav = $('#nav');
  var progress = $('#progress');
  var tickerPct = $('#tickerPct');
  var syncScroll = function () {
    var y = window.scrollY || 0;
    if (nav) nav.classList.toggle('is-stuck', y > 12);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(y / max, 1) : 0;
    if (progress) progress.style.width = (p * 100).toFixed(1) + '%';
    if (tickerPct) {
      var f = Math.round(p * 12);
      tickerPct.textContent = new Array(f + 1).join('█') + new Array(12 - f + 1).join('·') + ' ' + Math.round(p * 100) + '%';
    }
  };
  syncScroll();
  window.addEventListener('scroll', syncScroll, { passive: true });
  window.addEventListener('resize', syncScroll);

  /* ---------- reveals ---------- */
  var reveals = $$('.reveal');
  var applyIn = function (el) {
    el.classList.add('in');
    el.style.transition = 'none';
    el.style.opacity = '1';
    el.style.transform = 'none';
  };
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(applyIn);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
    setTimeout(function () { reveals.forEach(applyIn); }, 3000);
  }

  /* ---------- counters ---------- */
  function runCount(el) {
    var target = parseInt(el.getAttribute('data-to'), 10) || 0;
    var live = el.hasAttribute('data-live');
    var settle = function () {
      if (!live || reduceMotion) return;
      setInterval(function () {
        target += (Math.random() * 3 | 0) + 1;
        el.textContent = target.toLocaleString();
      }, 2500 + Math.random() * 2200);
    };
    if (reduceMotion) { el.textContent = target.toLocaleString(); settle(); return; }
    var start = null;
    var step = function (ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / 1600, 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * e).toLocaleString();
      if (p < 1) requestAnimationFrame(step); else settle();
    };
    requestAnimationFrame(step);
  }
  var counts = $$('.count');
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counts.forEach(function (el) { cio.observe(el); });
  } else { counts.forEach(runCount); }

  /* ---------- hero logo boot reveal ---------- */
  var logo = $('#logo');
  if (logo) {
    var lines = logo.textContent.replace(/\s+$/, '').split('\n');
    logo.innerHTML = lines.map(function (l) { return '<span class="row">' + esc(l || ' ') + '</span>'; }).join('');
    var rowsEls = $$('.row', logo);
    if (reduceMotion) {
      rowsEls.forEach(function (el) { el.style.opacity = '1'; });
    } else {
      rowsEls.forEach(function (el, i) {
        el.style.opacity = '0';
        setTimeout(function () { el.style.opacity = '1'; }, 140 + i * 110);
      });
    }
  }

  /* ---------- hero line typewriter ---------- */
  var heroLine = $('#heroLine');
  if (heroLine) {
    var raw = heroLine.getAttribute('data-text') || '';
    var m = raw.split('/');            // "plain /hot/ plain"
    var plainText = m.join('');
    var hotStart = m[0].length;
    var hotEnd = hotStart + (m[1] ? m[1].length : plainText.length);
    var paint = function (n) {
      var a = plainText.slice(0, Math.min(n, hotStart));
      var b = n > hotStart ? plainText.slice(hotStart, Math.min(n, hotEnd)) : '';
      var c = n > hotEnd ? plainText.slice(hotEnd, n) : '';
      heroLine.innerHTML = esc(a) +
        (n >= hotStart ? '<br>' : '') +
        (b ? '<span class="hot">' + esc(b) + '</span>' : '') +
        esc(c) + '<span class="tw-caret"></span>';
    };
    if (reduceMotion) { paint(plainText.length); }
    else {
      var n = 0;
      var twDone = false;
      var typeIt = function () {
        if (twDone) return;
        n++;
        paint(n);
        if (n < plainText.length) setTimeout(typeIt, 34 + Math.random() * 26);
        else twDone = true;
      };
      setTimeout(typeIt, 900);
      setTimeout(function () { if (!twDone) { twDone = true; paint(plainText.length); } }, 3200);
    }
  }

  /* ---------- live ticker ---------- */
  var tickerEl = $('#tickerText');
  var phrases = [
    'spinning up a company for a founder in lisbon',
    'research agent: 2,400 competitors scanned',
    'design agent: shipped 8 screens',
    'marketing agent: 30 posts scheduled',
    'engineering agent: deployed build #4471',
    'support agent: answered a ticket in 0.8s',
    'growth agent: conversion up 12% this week',
    'closing the books for a client, august done',
    'onboarding a business, 6 roles assigned',
    'a company just went live'
  ];
  if (tickerEl) {
    if (reduceMotion) { tickerEl.textContent = phrases[0]; }
    else {
      var pi = 0, ci = 0, del = false;
      var tk = function () {
        var full = phrases[pi];
        if (!del) {
          ci++; tickerEl.textContent = full.slice(0, ci);
          if (ci === full.length) { del = true; setTimeout(tk, 2400); return; }
          setTimeout(tk, 32 + Math.random() * 26);
        } else {
          ci--; tickerEl.textContent = full.slice(0, ci);
          if (ci === 0) { del = false; pi = (pi + 1) % phrases.length; setTimeout(tk, 300); return; }
          setTimeout(tk, 14);
        }
      };
      setTimeout(tk, 600);
    }
  }

  /* ---------- parallel agents ---------- */
  var agents = $$('#agents .agent');
  if (agents.length) {
    var BAR = 16;
    var models = agents.map(function (el) {
      var logs = (el.getAttribute('data-log') || '').split('|');
      el.innerHTML =
        '<div class="agent__head"><span>' + esc(el.getAttribute('data-name') || '') + '</span><span class="agent__dot"></span></div>' +
        '<div class="agent__log"></div>' +
        '<div class="agent__bar"></div>';
      return {
        logEl: $('.agent__log', el),
        barEl: $('.agent__bar', el),
        logs: logs,
        li: Math.random() * logs.length | 0,
        prog: Math.random(),
        speed: 0.045 + Math.random() * 0.07,
        nextLog: 0
      };
    });
    var drawAgents = function (t) {
      models.forEach(function (a) {
        a.prog += a.speed * 0.12;
        if (a.prog >= 1) { a.prog = 0; a.li = (a.li + 1) % a.logs.length; }
        if (t > a.nextLog) { a.nextLog = t + 2200 + Math.random() * 2600; a.li = (a.li + 1) % a.logs.length; }
        var fill = Math.round(a.prog * BAR);
        a.logEl.textContent = a.logs[a.li];
        a.barEl.innerHTML =
          '<span class="f">' + new Array(fill + 1).join('▓') + '</span>' +
          new Array(BAR - fill + 1).join('░') +
          ' <span class="agent__pct">' + Math.round(a.prog * 100) + '%</span>';
      });
    };
    drawAgents(1000);
    if (!reduceMotion) {
      var la = 0;
      var loopA = function (ts) {
        if (ts - la > 90) { la = ts; drawAgents(ts); }
        requestAnimationFrame(loopA);
      };
      requestAnimationFrame(loopA);
    }
  }

  /* ---------- start.html terminal ---------- */
  var startTerm = $('#startTerm');
  if (startTerm) {
    var blk = [
      'polyphus:~$ new company',
      'context ................ ready',
      'roster ................. standing by',
      '',
      'describe what you want to build_'
    ];
    if (reduceMotion) { startTerm.textContent = blk.join('\n'); }
    else {
      var bl = 0, bc = 0;
      var tb = function () {
        if (bl >= blk.length) {
          var on = startTerm.textContent.slice(-1) === '█';
          startTerm.textContent = blk.join('\n').replace(/_$/, on ? ' ' : '█');
          setTimeout(tb, 520); return;
        }
        var line = blk[bl];
        startTerm.textContent = blk.slice(0, bl).join('\n') + (bl ? '\n' : '') + line.slice(0, bc);
        bc++;
        if (bc > line.length) { bl++; bc = 0; setTimeout(tb, 240); }
        else setTimeout(tb, 20 + Math.random() * 34);
      };
      setTimeout(tb, 350);
    }
  }

  /* ---------- ascii agent-relay scene ---------- */
  var scene = $('#scene');
  if (scene) initScene(scene, reduceMotion);

  function initScene(host, still) {
    var W = 68, H = 12;
    var nodes = [
      { label: 'RESEARCH', cx: 12 },
      { label: 'DESIGN', cx: 28 },
      { label: 'BUILD', cx: 44 },
      { label: 'MARKET', cx: 60 }
    ];
    var IDS_Y = 1, RAIL_Y = 3, DROP_Y = 4, BOX_TOP = 5, LABEL_Y = 6, BAR_Y = 7, STAT_Y = 8, BOX_BOT = 9, BUS_Y = 11;
    var RAIL_START = 4, RAIL_END = 64;
    var spin = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧'];
    var ACCENT = '◆▶●✓▓║' + spin.join('');
    var DIM = '░.:+*·';
    var idPool = ['a7f3', 'b1c9', 'e4d2', '9fa0', 'c3e8', '77bd', 'd0a5', '2be1'];
    var ids = nodes.map(function () { return idPool[Math.random() * idPool.length | 0]; });
    var flick = [];

    var blank = function () { var g = []; for (var y = 0; y < H; y++) g.push(new Array(W).fill(' ')); return g; };
    var put = function (g, y, x, s) {
      if (y < 0 || y >= H) return;
      for (var i = 0; i < s.length; i++) { var cx = x + i; if (cx >= 0 && cx < W) g[y][cx] = s.charAt(i); }
    };
    var mid = function (s, len) {
      s = String(s); if (s.length >= len) return s.slice(0, len);
      var t = len - s.length, l = Math.floor(t / 2);
      return new Array(l + 1).join(' ') + s + new Array(t - l + 1).join(' ');
    };
    var rot = function (s, n) { n = ((n % s.length) + s.length) % s.length; return s.slice(n) + s.slice(0, n); };

    var draw = function (t) {
      var g = blank();
      var tpm = 39 + (Math.floor(t / 1100) % 6);
      var q = 1 + (Math.floor(t / 1700) % 4);
      put(g, 0, 2, 'agents 04    tasks/min ' + tpm + '    queue 0' + q + '    uptime 100%');

      for (var x = RAIL_START; x <= RAIL_END; x++) put(g, RAIL_Y, x, '─');
      put(g, RAIL_Y, RAIL_START - 1, '●');
      put(g, RAIL_Y, RAIL_END + 1, '▶');

      var cyc = 7200, local = t % cyc;
      var tok = RAIL_START + (local / cyc) * (RAIL_END - RAIL_START);

      nodes.forEach(function (node, i) {
        var left = node.cx - 5;
        var pr = Math.max(0, Math.min(1, (tok - node.cx) / 12));
        var st = pr <= 0 ? 'queued' : (pr >= 1 ? 'done' : 'work');
        put(g, IDS_Y, left + 1, 'id:' + ids[i]);
        put(g, RAIL_Y, node.cx, '┬');
        put(g, DROP_Y, node.cx, st === 'work' ? '║' : '│');
        put(g, BOX_TOP, left, '┌─────────┐');
        put(g, BOX_TOP, node.cx, '┴');
        put(g, LABEL_Y, left, '│' + mid(node.label, 9) + '│');
        put(g, BOX_BOT, left, '└─────────┘');
        var fill = Math.round(pr * 7);
        put(g, BAR_Y, left, '│ ' + new Array(fill + 1).join('▓') + new Array(7 - fill + 1).join('░') + ' │');
        var status = st === 'queued' ? 'queued' : st === 'done' ? 'done ✓'
          : Math.round(pr * 100) + '%  ' + spin[Math.floor(t / 90) % spin.length];
        put(g, STAT_Y, left, '│' + mid(status, 9) + '│');
      });
      put(g, RAIL_Y, Math.round(tok), '◆');

      var bv = ['3.9k', '4.0k', '4.1k', '4.2k', '4.4k'][Math.floor(t / 600) % 5];
      var base = '  ::  SHARED CONTEXT BUS  ::  ' + bv + ' tok/s  ::  42 msgs/s  ';
      put(g, BUS_Y, 0, rot(base + base, Math.floor(t / 60)).slice(0, W));

      if (Math.random() < 0.16) flick.push({ x: 2 + (Math.random() * (W - 4) | 0), y: [0, 2, 10][Math.random() * 3 | 0], ch: DIM.charAt(1 + (Math.random() * (DIM.length - 1) | 0)), until: t + 130 });
      flick = flick.filter(function (f) { return f.until > t; });
      flick.forEach(function (f) { put(g, f.y, f.x, f.ch); });
      return g;
    };

    var flush = function (txt, cls) {
      if (!txt) return '';
      txt = txt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return cls ? '<span class="' + cls + '">' + txt + '</span>' : txt;
    };
    var render = function (g) {
      var html = '';
      for (var y = 0; y < H; y++) {
        var row = g[y], cls = '', buf = '';
        for (var x = 0; x < W; x++) {
          var ch = row[x];
          var nx = ACCENT.indexOf(ch) > -1 ? 'a' : (DIM.indexOf(ch) > -1 ? 'd' : '');
          if (nx !== cls) { html += flush(buf, cls); buf = ''; cls = nx; }
          buf += ch;
        }
        html += flush(buf, cls);
        if (y < H - 1) html += '\n';
      }
      host.innerHTML = html;
    };

    render(draw(3100));
    if (still) return;
    var last = 0;
    var loop = function (ts) {
      if (ts - last > 45) { last = ts; render(draw(ts)); }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
})();
