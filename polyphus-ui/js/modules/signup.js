/* ==========================================================================
   signup.js — the waitlist form.

   SETUP (one time)
   ----------------
   1. Run supabase/waitlist.sql in the Supabase SQL editor.
   2. Dashboard → Project Settings → API, copy the Project URL and the
      `anon` `public` key.
   3. Put them on the form in start.html:

        <form class="signup__form" data-signup
              data-supabase-url="https://xxxxx.supabase.co"
              data-supabase-key="eyJhbGciOi...">

   The anon key is meant to be public — it ships in the page and anyone can
   read it. It is safe only because the SQL file turns on row level security
   and gives anon INSERT and nothing else. Do not disable RLS on that table.

   A plain `data-endpoint="https://..."` still works if you ever move to your
   own API; it gets a JSON POST of { email, source, referrer }.

   WITH NOTHING CONFIGURED the address is kept in this browser's localStorage
   and reaches you nowhere. The visitor still sees the confirmation, so the
   only signal is a console warning. Do not ship it that way.
   ========================================================================== */

(function (WL) {
  'use strict';

  var STORE_KEY   = 'polyphus:waitlist';
  var PENDING_KEY = 'polyphus:waitlist:pending';

  /* Deliberately permissive. The point is to catch a typo, not to adjudicate
     what a valid address is — plenty of real ones look strange, and every
     provider and TLD is welcome. The rule that actually holds is the WITH
     CHECK clause in supabase/waitlist.sql; this one just runs first. */
  function looksLikeEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  /* One shape for the whole pipeline, so "was this person already added" is a
     string comparison and not a judgement call. */
  function normalise(value) {
    return String(value || '').trim().toLowerCase();
  }

  /* --- local copies -------------------------------------------------------
     Two lists. `STORE_KEY` is every address this browser has submitted;
     `PENDING_KEY` is the ones that never made it to the server, retried on
     the next visit so a dropped connection does not silently lose a signup. */

  function readList(key) {
    try {
      var raw = window.localStorage.getItem(key);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];   // private window, blocked storage, corrupt value
    }
  }

  function writeList(key, list) {
    try {
      window.localStorage.setItem(key, JSON.stringify(list));
    } catch (e) {
      /* quota or blocked storage — never block the flow on this */
    }
  }

  function addTo(key, email) {
    var list = readList(key);
    if (list.indexOf(email) === -1) {
      list.push(email);
      writeList(key, list);
    }
  }

  function removeFrom(key, email) {
    writeList(key, readList(key).filter(function (e) { return e !== email; }));
  }

  /* --- delivery ----------------------------------------------------------- */

  function config(form) {
    return {
      url:      form.getAttribute('data-supabase-url'),
      key:      form.getAttribute('data-supabase-key'),
      table:    form.getAttribute('data-supabase-table') || 'waitlist',
      endpoint: form.getAttribute('data-endpoint')
    };
  }

  function send(cfg, payload) {
    if (cfg.url && cfg.key) {
      var endpoint = cfg.url.replace(/\/+$/, '') +
                     '/rest/v1/' + encodeURIComponent(cfg.table);
      return fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: cfg.key,
          Authorization: 'Bearer ' + cfg.key,
          Prefer: 'return=minimal'
        },
        body: JSON.stringify(payload)
      }).then(function (res) {
        /* 409 is the unique constraint firing: this address is already on the
           list. That is a success from the visitor's point of view, and it is
           how we dedupe without granting anon the SELECT privilege that
           `ON CONFLICT` would require. See supabase/waitlist.sql. */
        if (res.status === 409) return 'existing';
        if (!res.ok) {
          return res.text().then(function (body) {
            throw new Error('Supabase ' + res.status + ' ' + body.slice(0, 200));
          });
        }
        return true;
      });
    }

    if (cfg.endpoint) {
      return fetch(cfg.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return true;
      });
    }

    console.warn(
      '[polyphus] The waitlist form has no backend configured, so "' +
      payload.email + '" was kept in localStorage ("' + STORE_KEY + '") and ' +
      'sent nowhere. Set data-supabase-url and data-supabase-key in ' +
      'start.html — see js/modules/signup.js and supabase/waitlist.sql.'
    );
    return Promise.reject(new Error('not configured'));
  }

  /* Anything that failed to reach the server last time, tried again quietly. */
  function flushPending(cfg) {
    if (!(cfg.url && cfg.key) && !cfg.endpoint) return;
    readList(PENDING_KEY).forEach(function (email) {
      send(cfg, { email: email, source: 'polyphus-waitlist', referrer: null })
        .then(function () { removeFrom(PENDING_KEY, email); })
        .catch(function () { /* still down; it stays queued */ });
    });
  }

  /* --- wiring ------------------------------------------------------------- */

  function init() {
    var form = document.querySelector('[data-signup]');
    if (!form) return;

    var root   = document.querySelector('.signup');
    var field  = form.querySelector('.signup__field');
    var submit = form.querySelector('.signup__submit');
    var trap   = form.querySelector('[data-signup-trap]');
    var note   = document.querySelector('[data-signup-note]');
    var mail   = document.querySelector('[data-signup-mail]');
    var cfg    = config(form);

    flushPending(cfg);

    function fail(message) {
      form.classList.add('is-invalid');
      if (note) note.textContent = message;
      field.focus();
    }

    function done(email) {
      if (mail) mail.textContent = email;
      if (root) root.classList.add('is-done');
      var title = document.querySelector('.signup__done-title');
      if (title) title.focus();
    }

    /* GA4's own recommended event name, so it lands in the standard reports
       rather than needing a custom definition. `outcome` separates a genuine
       new address from someone signing up twice and from a signup we failed
       to deliver — without those, a wave of repeat visits looks like growth.

       No email address here, ever. Sending one to Analytics would be personal
       data, which Google's terms forbid. Counts and categories only. */
    function trackSignup(outcome) {
      if (WL.track) WL.track('sign_up', { method: 'waitlist', outcome: outcome });
    }

    field.addEventListener('input', function () {
      form.classList.remove('is-invalid');
      if (note) note.textContent = '';
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var email = normalise(field.value);
      if (!email) return fail('enter an email address');
      if (email.length > 254) return fail('that address is too long');
      if (!looksLikeEmail(email)) return fail('that does not look like an email address');

      /* The honeypot is hidden from people and invisible to assistive tech,
         so anything in it is a bot filling every field it can see. Show the
         same confirmation and send nothing — telling it that it failed only
         teaches it how to pass. */
      if (trap && trap.value) return done(email);   // no tracking: not a person

      var label = submit.textContent;
      submit.disabled = true;
      submit.textContent = 'adding you…';

      addTo(STORE_KEY, email);

      var payload = {
        email: email,
        source: 'polyphus-waitlist',
        referrer: document.referrer ? document.referrer.slice(0, 512) : null
      };

      var outcome = 'new';

      send(cfg, payload)
        .then(function (result) {
          if (result === 'existing') outcome = 'existing';
        })
        .catch(function (err) {
          /* Queue it and tell the developer. The visitor still gets the
             confirmation — a failure on our side is not their problem, and
             flushPending will try again next time they open the page. */
          outcome = 'undelivered';
          addTo(PENDING_KEY, email);
          console.warn('[polyphus] waitlist signup not delivered:', err.message);
        })
        .then(function () {
          done(email);
          trackSignup(outcome);
          submit.disabled = false;
          submit.textContent = label;
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window.WL = window.WL || {});
