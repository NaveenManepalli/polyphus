/* ==========================================================================
   signup.js — the waitlist form.

   IMPORTANT, BEFORE THIS PAGE GOES LIVE
   -------------------------------------
   The form needs somewhere to send the address. Put a URL in the form's
   `data-endpoint` attribute in start.html:

       <form class="signup__form" data-signup data-endpoint="https://...">

   Any service that accepts a JSON or form POST works — Formspree, Buttondown,
   ConvertKit, a Cloudflare Worker, your own API.

   With no endpoint set the page still confirms to the visitor, because that
   is the flow the page is built around — but the address only ever reaches
   this browser's localStorage. Nothing is emailed to you and nothing leaves
   the device. Set the endpoint, or you are collecting nothing.
   ========================================================================== */

(function () {
  'use strict';

  var STORE_KEY = 'polyphus:waitlist';

  // Deliberately permissive. The point is to catch a typo, not to adjudicate
  // what a valid address is — plenty of real ones look strange.
  function looksLikeEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  function remember(email) {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      var list = raw ? JSON.parse(raw) : [];
      if (list.indexOf(email) === -1) list.push(email);
      window.localStorage.setItem(STORE_KEY, JSON.stringify(list));
    } catch (e) {
      /* private window, blocked storage, quota — never block the flow on this */
    }
  }

  function send(endpoint, email) {
    if (!endpoint) {
      console.warn(
        '[polyphus] No data-endpoint on the waitlist form. The address was ' +
        'kept in localStorage under "' + STORE_KEY + '" and sent nowhere. ' +
        'Set data-endpoint in start.html before this page goes live.'
      );
      return Promise.resolve({ delivered: false });
    }
    return fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: email, source: 'polyphus-waitlist' })
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return { delivered: true };
    });
  }

  function init() {
    var form = document.querySelector('[data-signup]');
    if (!form) return;

    var root = document.querySelector('.signup');
    var field = form.querySelector('.signup__field');
    var submit = form.querySelector('.signup__submit');
    var note = document.querySelector('[data-signup-note]');
    var mail = document.querySelector('[data-signup-mail]');

    function fail(message) {
      form.classList.add('is-invalid');
      if (note) note.textContent = message;
      field.focus();
    }

    field.addEventListener('input', function () {
      form.classList.remove('is-invalid');
      if (note) note.textContent = '';
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var email = (field.value || '').trim();
      if (!email) return fail('enter an email address');
      if (!looksLikeEmail(email)) return fail('that does not look like an email address');

      var label = submit.textContent;
      submit.disabled = true;
      submit.textContent = 'adding you…';

      remember(email);   // keep it locally first, so a failed POST loses nothing

      send(form.getAttribute('data-endpoint'), email)
        .catch(function (err) {
          // The address is already stored locally; tell the developer, and
          // still confirm to the visitor rather than blaming them for our
          // outage. Retrying is our problem, not theirs.
          console.warn('[polyphus] waitlist POST failed:', err.message);
        })
        .then(function () {
          if (mail) mail.textContent = email;
          if (root) root.classList.add('is-done');
          var title = document.querySelector('.signup__done-title');
          if (title) title.focus();
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
})();
