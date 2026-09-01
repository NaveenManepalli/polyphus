/* Polyphus — start.html workspace (mock)
   intro -> chat/projects workspace -> 4-agent build -> mockup site + marketing report + fake execute.
   Everything here is a simulation. Nothing is deployed. */

(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
  var cap = function (w) { return w ? w.charAt(0).toUpperCase() + w.slice(1) : ''; };
  var el = function (cls, html) { var d = document.createElement('div'); if (cls) d.className = cls; if (html != null) d.innerHTML = html; return d; };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  var PHASE_MS = reduce ? 260 : 7000;

  /* ---------------- seeded generators ---------------- */
  function hashStr(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function mulberry(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  var FILLERS = ('a an the for to of and or but that with without into onto from your my our you i we it this these those there here app apps platform tool tools website site web service services product startup company companies business businesses idea ideas project want wants need needs build builds make makes making create creates creating turn turns let lets help helps get gets put puts give gives take takes bring brings send sends find finds keep keeps run runs use uses show shows which is are be can will would should on in at by using based new better best simple easy fast just like so all any some more most every each').split(' ');

  function words(p) {
    return p.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)
      .filter(function (w) { return w.length > 2 && FILLERS.indexOf(w) < 0; });
  }

  var PALETTES = [
    { a: '#4f46e5', n: 'indigo' }, { a: '#0d9488', n: 'teal' }, { a: '#e11d48', n: 'rose' },
    { a: '#ea580c', n: 'sunset' }, { a: '#2563eb', n: 'cobalt' }, { a: '#7c3aed', n: 'violet' },
    { a: '#16a34a', n: 'forest' }, { a: '#db2777', n: 'magenta' }
  ];

  function deriveContext(prompt) {
    prompt = prompt.trim();
    var h = hashStr(prompt);
    var rng = mulberry(h);
    var w = words(prompt);
    var a = w[0], b = w[1];

    var name;
    if (!w.length) name = 'Northstar';
    else if (b && rng() < 0.55) name = cap(a) + cap(b);
    else name = cap(a) + ['ly', 'io', 'flow', 'base', 'kit', 'labs', 'wave', 'yard'][(rng() * 8) | 0];
    name = name.replace(/[^A-Za-z0-9]/g, '') || 'Northstar';

    var am = prompt.match(/\bfor ([a-z][a-z ]{2,30}?)(?:[,.]|$| who| that| to | with )/i);
    var audience = am ? am[1].trim() : null;
    if (audience && (/\b(any|link|links|message|messages|thing|things|it|them)\b/.test(audience) || audience.split(' ').length > 4)) audience = null;
    if (!audience) audience = ['early-stage founders', 'small teams', 'independent operators', 'busy professionals', 'growing agencies'][(rng() * 5) | 0];

    var subject = prompt.replace(/^\s*(a|an|the)\s+/i, '').replace(/[.?!]+$/, '').trim() || 'the thing you wish existed';
    var pal = PALETTES[h % PALETTES.length];

    var core = subject.length <= 46 ? subject : (w.slice(0, 5).join(' ') || subject);
    var headline = [
      cap(core) + '.',
      'Finally — ' + core + '.',
      cap(name) + ': ' + core + ', done right.',
      cap(core) + ', without the busywork.'
    ][h % 4];

    var subhead = [
      'Built for ' + audience + '. Live in a weekend, not a quarter.',
      'Everything you need to launch. Nothing you don\'t.',
      'Set up in minutes. No code. Cancel anytime.'
    ][(h >>> 3) % 3];

    var featPool = [
      { t: 'Set up in minutes', d: 'Answer a few questions and you\'re live. No onboarding calls.' },
      { t: 'Works everywhere', d: 'Fast on every device, offline-friendly, keyboard-first.' },
      { t: 'Priced for ' + audience.split(' ')[0], d: 'Start free. Upgrade when it\'s paying for itself.' },
      { t: 'Built-in analytics', d: 'See what\'s working the day you launch, not next quarter.' },
      { t: 'Bring your own data', d: 'Import in one click. Export any time. It\'s yours.' },
      { t: 'Automations included', d: 'The busywork runs itself while you do the real work.' }
    ];
    var feats = [];
    var used = {};
    while (feats.length < 3) { var i = (rng() * featPool.length) | 0; if (!used[i]) { used[i] = 1; feats.push(featPool[i]); } }

    var kw = [];
    var mods = [' software', ' app', ' tool', ' for teams', ' pricing', ' reviews', ' alternative', ' platform'];
    w.slice(0, 4).forEach(function (x) {
      kw.push('best ' + x, x + mods[(rng() * mods.length) | 0], x + mods[(rng() * mods.length) | 0]);
    });
    kw = kw.filter(function (v, i, s) { return s.indexOf(v) === i; }).slice(0, 18);
    while (kw.length < 12) kw.push(['launch checklist', 'growth playbook', 'no-code stack', 'founder tools'][kw.length % 4]);

    var budget = [800, 1200, 2000, 3500, 5000][(rng() * 5) | 0];
    var marketM = 40 + ((rng() * 860) | 0);
    var density = ['low', 'medium', 'high'][(rng() * 3) | 0];
    var cta = ['Get started', 'Try it free', 'Start now', 'Claim your spot'][(h >>> 5) % 4];

    return {
      prompt: prompt, name: name, audience: audience, subject: subject,
      palette: pal, headline: headline, subhead: subhead, feats: feats, cta: cta,
      keywords: kw, budget: budget, marketM: marketM, density: density,
      domain: name.toLowerCase() + '.polyphus.site',
      positioning: name + ' turns "' + subject + '" into something you can launch this week — no team, no runway, no waiting for permission.',
      plan: [
        'Week 1 — soft launch to ' + audience + '. Collect 50 conversations.',
        'Week 2 — publish 4 SEO pages targeting the top keywords. Turn on paid search.',
        'Week 3 — 3 partnership outreach batches. Ship the most-requested feature.',
        'Week 4 — public launch. Press, communities, and a referral loop.'
      ],
      proj: { visitors: (2 + (rng() * 9 | 0)) + 'k', signups: (120 + (rng() * 680 | 0)), cac: (6 + (rng() * 22 | 0)) }
    };
  }

  /* ---------------- phase definitions ---------------- */
  var PHASES = [
    {
      key: 'research', n: '01', title: 'RESEARCH ANALYST', role: 'sizes the market, finds the gap', viz: 'bars',
      lines: function (c) {
        return [
          'parsing brief: "' + c.prompt + '"',
          'defining the market…',
          'scanning 2,412 competitors',
          'competitor density: ' + c.density.toUpperCase(),
          'market size estimate: $' + c.marketM + 'M / year',
          'interviewing 40 synthetic users',
          'found 3 unmet needs',
          'primary segment: ' + c.audience,
          '✓ research complete'
        ];
      }
    },
    {
      key: 'design', n: '02', title: 'DESIGN AGENT', role: 'brand, system, every screen', viz: 'swatches',
      lines: function (c) {
        return [
          'reading research…',
          'generating brand name…',
          'name: ' + c.name,
          'palette: ' + c.palette.n,
          'type scale: 1.250 · major third',
          'wireframing hero / features / pricing / cta',
          'components drafted: 24',
          '8 screens laid out',
          '✓ design system ready'
        ];
      }
    },
    {
      key: 'dev', n: '03', title: 'DEVELOPER AGENT', role: 'builds it, ships it', viz: 'files',
      lines: function (c) {
        return [
          'scaffolding project',
          'stack: static + edge functions',
          '+ index.html',
          '+ styles.css',
          '+ app.js',
          '+ /assets  (12 files)',
          'build passed in 1.24s',
          'deploying to edge…',
          'live: ' + c.domain,
          '✓ shipped'
        ];
      }
    },
    {
      key: 'marketing', n: '04', title: 'MARKETING AGENT', role: 'keywords, SEO, growth budget', viz: 'budget',
      lines: function (c) {
        return [
          'analysing audience intent',
          'optimising keywords · 18 targets',
          'SEO: sitemap + schema + OG tags',
          'growth budget: $' + c.budget.toLocaleString() + ' / mo',
          '  ├─ paid search      42%',
          '  ├─ content          31%',
          '  └─ partnerships     27%',
          'drafting launch copy',
          '30-day plan generated',
          '✓ marketing ready'
        ];
      }
    }
  ];

  /* ---------------- dom refs ---------------- */
  var intro = $('#intro'), introTerm = $('#introTerm'), workspace = $('#workspace');
  if (!workspace) return;
  var wsProjects = $('#wsProjects'), wsMain = $('#wsMain');
  var stageEmpty = $('#stageEmpty'), stageRun = $('#stageRun'), runEl = $('#run');
  var composerDock = $('#composerDock');
  var report = $('#report'), reportBody = $('#reportBody');
  var execOverlay = $('#exec'), execBox = $('#execBox');

  /* ---------------- projects store ---------------- */
  var KEY = 'polyphus_projects';
  var projects = load();
  var activeId = null;
  var busy = false;

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
  }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(projects.slice(0, 24))); } catch (e) {}
  }
  if (!projects.length) {
    projects = [
      { id: 'seed2', name: 'PhotoDesk', prompt: 'a CRM built for freelance photographers', ts: Date.now() - 86400000 },
      { id: 'seed1', name: 'LinkGuard', prompt: 'a scam detector for any link, message or seller', ts: Date.now() - 172800000 }
    ];
    persist();
  }

  function renderProjects() {
    wsProjects.innerHTML = projects.map(function (p) {
      return '<li><button class="ws__proj' + (p.id === activeId ? ' is-active' : '') + '" data-id="' + p.id + '">' +
        '<span class="ws__pdot"></span><span class="ws__pname">' + esc(p.name) + '</span></button></li>';
    }).join('');
  }

  /* ---------------- intro ---------------- */
  function runIntro() {
    var lines = ['polyphus:~$ new company', 'context ................ ready', 'roster ................. standing by', '', 'opening workspace_'];
    if (reduce || !introTerm) {
      if (introTerm) introTerm.textContent = lines.join('\n');
      setTimeout(openWorkspace, reduce ? 400 : 1200);
      return;
    }
    var li = 0, ci = 0;
    var type = function () {
      if (li >= lines.length) { setTimeout(openWorkspace, 700); return; }
      var line = lines[li];
      introTerm.textContent = lines.slice(0, li).join('\n') + (li ? '\n' : '') + line.slice(0, ci);
      ci++;
      if (ci > line.length) { li++; ci = 0; setTimeout(type, 200); }
      else setTimeout(type, 20 + Math.random() * 34);
    };
    setTimeout(type, 500);
    setTimeout(openWorkspace, 4200); // hard cap
  }

  var opened = false;
  function openWorkspace() {
    if (opened) return;
    opened = true;
    document.body.classList.add('in-ws');
    if (intro) intro.classList.add('gone');
    setTimeout(function () {
      if (intro) intro.hidden = true;
      workspace.hidden = false;
      initWorkspace();
      setTimeout(function () { workspace.classList.add('show'); }, 20);
    }, reduce ? 0 : 480);
  }

  /* ---------------- workspace init ---------------- */
  function initWorkspace() {
    renderProjects();

    $$('.composer').forEach(function (form) {
      var ta = $('.composer__input', form);
      autosize(ta);
      ta.addEventListener('input', function () { autosize(ta); });
      ta.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); }
      });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var v = ta.value.trim();
        if (v && !busy) { ta.value = ''; autosize(ta); build(v); }
      });
    });

    $$('.chip').forEach(function (c) {
      c.addEventListener('click', function () {
        if (busy) return;
        build(c.textContent.trim());
      });
    });

    $('#wsNew').addEventListener('click', function () { if (!busy) resetToEmpty(); });

    wsProjects.addEventListener('click', function (e) {
      var b = e.target.closest('.ws__proj');
      if (!b || busy) return;
      var p = projects.filter(function (x) { return x.id === b.dataset.id; })[0];
      if (p) openProject(p);
    });

    var menu = $('#wsMenu');
    menu.addEventListener('click', function () { $('#wsSide').classList.toggle('open'); });
    wsMain.addEventListener('click', function () { $('#wsSide').classList.remove('open'); });

    $('#reportClose').addEventListener('click', closeReport);
    $('#reportScrim').addEventListener('click', closeReport);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeReport(); });
  }

  function autosize(ta) {
    ta.style.height = '44px';
    var h = ta.value ? ta.scrollHeight : 44;
    ta.style.height = Math.max(44, Math.min(h, 200)) + 'px';
    ta.style.overflowY = h > 200 ? 'auto' : 'hidden';
  }

  function resetToEmpty() {
    activeId = null;
    renderProjects();
    stageRun.hidden = true;
    composerDock.hidden = true;
    stageEmpty.hidden = false;
  }

  /* ---------------- build pipeline ---------------- */
  function build(prompt) {
    busy = true;
    var ctx = deriveContext(prompt);
    var proj = { id: 'p' + Date.now().toString(36), name: ctx.name, prompt: prompt, ts: Date.now() };
    projects.unshift(proj);
    persist();
    activeId = proj.id;
    renderProjects();

    stageEmpty.hidden = true;
    stageRun.hidden = false;
    composerDock.hidden = false;
    renderRunSkeleton(ctx);

    var cards = $$('.ph', runEl);
    var chain = Promise.resolve();
    cards.forEach(function (card, i) {
      chain = chain.then(function () { return runPhase(card, PHASES[i], ctx); });
    });
    chain.then(function () {
      $('#runStatus').innerHTML = '<span class="ok">✓ complete</span>';
      renderResult(ctx);
      busy = false;
      wsMain.scrollTo({ top: wsMain.scrollHeight, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  function renderRunSkeleton(ctx) {
    runEl.innerHTML = '';
    runEl.appendChild(el('run__head',
      '<span class="run__idea">&gt; ' + esc(ctx.prompt) + '</span>' +
      '<span class="run__status" id="runStatus"><span class="run__spin"></span> building</span>'));

    var pipe = el('run__pipe');
    pipe.innerHTML = PHASES.map(function (ph) {
      return '<article class="ph" data-key="' + ph.key + '">' +
        '<header class="ph__head">' +
          '<span class="ph__n">' + ph.n + '</span>' +
          '<span class="ph__title">' + ph.title + '</span>' +
          '<span class="ph__role">' + ph.role + '</span>' +
          '<span class="ph__state">queued</span>' +
        '</header>' +
        '<div class="ph__body">' +
          '<pre class="ph__log"></pre>' +
          '<div class="ph__viz"></div>' +
          '<div class="ph__bar"><span class="ph__fill"></span></div>' +
        '</div>' +
      '</article>';
    }).join('');
    runEl.appendChild(pipe);
  }

  function setState(card, s) {
    card.dataset.state = s;
    var t = { queued: 'queued', running: '● running', done: '✓ done' }[s];
    $('.ph__state', card).textContent = t;
  }

  function runPhase(card, phase, ctx) {
    return new Promise(function (resolve) {
      setState(card, 'running');
      card.scrollIntoView && card.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
      var lines = phase.lines(ctx);
      var logEl = $('.ph__log', card);
      var fill = $('.ph__fill', card);
      var vizEl = $('.ph__viz', card);
      vizEl.dataset.kind = phase.viz;

      if (reduce) {
        logEl.textContent = lines.map(function (l) { return '> ' + l; }).join('\n');
        fill.style.width = '100%';
        buildViz(vizEl, phase.viz, ctx, 1);
        setState(card, 'done');
        resolve();
        return;
      }

      var start = Date.now();
      var tickFill = function () {
        var p = Math.min((Date.now() - start) / PHASE_MS, 1);
        fill.style.width = (p * 100).toFixed(1) + '%';
        buildViz(vizEl, phase.viz, ctx, p);
        if (p < 1) setTimeout(tickFill, 55);
      };
      tickFill();

      var span = PHASE_MS * 0.8;
      lines.forEach(function (ln, i) {
        setTimeout(function () {
          logEl.textContent += (logEl.textContent ? '\n' : '') + '> ' + ln;
          logEl.scrollTop = logEl.scrollHeight;
        }, 220 + (i / lines.length) * span);
      });

      setTimeout(function () { setState(card, 'done'); resolve(); }, PHASE_MS);
    });
  }

  /* ---------------- phase mini-visuals ---------------- */
  function buildViz(box, kind, ctx, f) {
    var rng = mulberry(hashStr(ctx.prompt + kind));
    if (kind === 'bars') {
      if (!box._h) { box._h = [0.9, 0.55, 0.75, 0.4, 0.62].map(function (v) { return v * (0.7 + rng() * 0.3); }); box.className = 'ph__viz viz-bars'; }
      box.innerHTML = box._h.map(function (h) {
        return '<i style="height:' + Math.round(h * f * 100) + '%"></i>';
      }).join('') + '<span class="viz-cap">market segments</span>';
    } else if (kind === 'swatches') {
      box.className = 'ph__viz viz-sw';
      var cols = [ctx.palette.a, shade(ctx.palette.a, 0.2), shade(ctx.palette.a, -0.25), '#0f172a', '#f8fafc', '#64748b'];
      var show = Math.round(f * cols.length);
      box.innerHTML = cols.slice(0, show).map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') +
        '<span class="viz-cap">brand system</span>';
    } else if (kind === 'files') {
      box.className = 'ph__viz viz-files';
      var tree = ['project/', '├─ index.html', '├─ styles.css', '├─ app.js', '├─ assets/', '└─ polyphus.json'];
      var show2 = Math.round(f * tree.length);
      box.innerHTML = '<pre>' + tree.slice(0, show2).join('\n') + '</pre>';
    } else if (kind === 'budget') {
      box.className = 'ph__viz viz-budget';
      var rows = [['paid search', 42], ['content', 31], ['partnerships', 27]];
      box.innerHTML = rows.map(function (r) {
        return '<div class="viz-row"><span>' + r[0] + '</span><span class="viz-track"><i style="width:' + Math.round(r[1] * f) + '%"></i></span><b>' + Math.round(r[1] * f) + '%</b></div>';
      }).join('');
    }
  }
  function shade(hex, amt) {
    var n = parseInt(hex.slice(1), 16);
    var r = Math.max(0, Math.min(255, (n >> 16) + amt * 255));
    var g = Math.max(0, Math.min(255, (n >> 8 & 255) + amt * 255));
    var b = Math.max(0, Math.min(255, (n & 255) + amt * 255));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b | 0).toString(16).slice(1);
  }

  /* ---------------- result: mockup site + actions ---------------- */
  function renderResult(ctx) {
    var res = el('result');
    res.innerHTML =
      '<p class="result__done">// build complete — 4 agents, 0 humans, ' + (reduce ? '0s' : '28s') + '</p>' +
      '<div class="browser">' +
        '<div class="browser__bar"><i></i><i></i><i></i>' +
          '<span class="browser__url">https://' + esc(ctx.domain) + '</span><span class="browser__rl">&#8635;</span></div>' +
        '<div class="browser__view">' + mockSite(ctx) + '</div>' +
      '</div>' +
      '<div class="result__actions">' +
        '<button class="btn2" id="btnReport">&#9636; view marketing report</button>' +
        '<button class="btn2 btn2--go" id="btnExec">&#9654; execute</button>' +
      '</div>' +
      '<p class="result__mock">this is a simulation — nothing was actually built or deployed</p>';
    runEl.appendChild(res);

    $('#btnReport', res).addEventListener('click', function () { openReport(ctx); });
    $('#btnExec', res).addEventListener('click', function () { fakeExecute(ctx); });
  }

  function mockSite(c) {
    return '<div class="mock" style="--acc:' + c.palette.a + '">' +
      '<header class="mock__nav">' +
        '<span class="mock__logo">' + esc(c.name) + '</span>' +
        '<nav class="mock__links"><a>Product</a><a>Pricing</a><a>About</a></nav>' +
        '<button class="mock__btn">' + esc(c.cta) + '</button>' +
      '</header>' +
      '<section class="mock__hero">' +
        '<p class="mock__eyebrow">Introducing ' + esc(c.name) + '</p>' +
        '<h1>' + esc(c.headline) + '</h1>' +
        '<p class="mock__sub">' + esc(c.subhead) + '</p>' +
        '<div class="mock__row"><button class="mock__btn">' + esc(c.cta) + '</button>' +
        '<button class="mock__btn mock__btn--ghost">Watch demo</button></div>' +
        '<div class="mock__shot"></div>' +
      '</section>' +
      '<section class="mock__feats">' +
        c.feats.map(function (f, i) {
          return '<div class="mock__feat"><span class="mock__ico">0' + (i + 1) + '</span><h3>' + esc(f.t) + '</h3><p>' + esc(f.d) + '</p></div>';
        }).join('') +
      '</section>' +
      '<footer class="mock__foot">© 2026 ' + esc(c.name) + ' · shipped by Polyphus</footer>' +
    '</div>';
  }

  /* ---------------- marketing report ---------------- */
  function openReport(c) {
    reportBody.innerHTML =
      '<p class="report__k">&gt; marketing report</p>' +
      '<h2 class="report__co">' + esc(c.name) + '</h2>' +
      '<p class="report__brief">brief: ' + esc(c.prompt) + '</p>' +

      '<section class="report__sec"><h3>01 / Market</h3>' +
        '<ul><li>Category — ' + esc(words(c.subject)[0] || 'software') + '</li>' +
        '<li>Est. market size — $' + c.marketM + 'M / year</li>' +
        '<li>Competitor density — ' + c.density + '</li>' +
        '<li>Primary segment — ' + esc(c.audience) + '</li></ul></section>' +

      '<section class="report__sec"><h3>02 / Positioning</h3><blockquote>' + esc(c.positioning) + '</blockquote></section>' +

      '<section class="report__sec"><h3>03 / Keywords · 18 targets</h3><div class="report__tags">' +
        c.keywords.map(function (k) { return '<span>' + esc(k) + '</span>'; }).join('') + '</div></section>' +

      '<section class="report__sec"><h3>04 / Channel budget — $' + c.budget.toLocaleString() + ' / mo</h3>' +
        [['paid search', 42], ['content', 31], ['partnerships', 27]].map(function (r) {
          return '<div class="report__alloc"><span>' + r[0] + '</span><span class="report__track"><i style="width:' + r[1] + '%"></i></span><b>' + r[1] + '%</b></div>';
        }).join('') + '</section>' +

      '<section class="report__sec"><h3>05 / 30-day plan</h3><ol>' +
        c.plan.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ol></section>' +

      '<section class="report__sec"><h3>06 / Projections · 90 days</h3>' +
        '<table class="report__tbl"><tr><td>visitors / mo</td><td>' + c.proj.visitors + '</td></tr>' +
        '<tr><td>signups / mo</td><td>' + c.proj.signups + '</td></tr>' +
        '<tr><td>blended CAC</td><td>$' + c.proj.cac + '</td></tr></table></section>' +

      '<p class="report__foot">generated by the marketing agent · simulation only</p>';

    report.hidden = false;
    setTimeout(function () { report.classList.add('show'); }, 20);
  }
  function closeReport() {
    report.classList.remove('show');
    setTimeout(function () { report.hidden = true; }, 300);
  }

  /* ---------------- fake execute ---------------- */
  function fakeExecute(c) {
    execOverlay.hidden = false;
    setTimeout(function () { execOverlay.classList.add('show'); }, 20);
    var steps = ['> reserving ' + c.domain, '> provisioning infrastructure', '> pushing to production', '> pointing DNS', '> warming the cache'];
    execBox.innerHTML = '<pre id="execLog"></pre>';
    var logp = $('#execLog');
    var i = 0;
    var go = function () {
      if (i < steps.length) {
        logp.textContent += (logp.textContent ? '\n' : '') + steps[i];
        i++;
        setTimeout(go, reduce ? 40 : 520);
      } else {
        setTimeout(function () {
          execBox.innerHTML =
            '<p class="exec__big">' + esc(c.name) + ' is live.</p>' +
            '<p class="exec__small">…just kidding. this is a mock — nothing was deployed. ' +
            'but that\'s exactly how the real thing will feel.</p>' +
            '<button class="btn2" id="execDone">close</button>';
          $('#execDone').addEventListener('click', function () {
            execOverlay.classList.remove('show');
            setTimeout(function () { execOverlay.hidden = true; }, 300);
          });
        }, reduce ? 60 : 700);
      }
    };
    go();
  }

  /* ---------------- open an existing project (instant) ---------------- */
  function openProject(p) {
    activeId = p.id;
    renderProjects();
    var ctx = deriveContext(p.prompt);
    stageEmpty.hidden = true;
    stageRun.hidden = false;
    composerDock.hidden = false;

    renderRunSkeleton(ctx);
    $$('.ph', runEl).forEach(function (card, i) {
      var phase = PHASES[i];
      $('.ph__log', card).textContent = phase.lines(ctx).map(function (l) { return '> ' + l; }).join('\n');
      $('.ph__fill', card).style.width = '100%';
      var v = $('.ph__viz', card);
      buildViz(v, phase.viz, ctx, 1);
      setState(card, 'done');
    });
    $('#runStatus').innerHTML = '<span class="ok">✓ complete</span>';
    renderResult(ctx);
    wsMain.scrollTo({ top: 0 });
  }

  /* ---------------- go ---------------- */
  runIntro();
})();
