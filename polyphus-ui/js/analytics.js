/* ==========================================================================
   analytics.js — Google Analytics 4.

   The measurement ID lives HERE and nowhere else. Google's copy-paste snippet
   wants to go inline in every page's <head>, which would put the ID in two
   files that have to be kept in step. One file is easier to get right.

   Loaded with `defer` from the head of index.html and start.html.

   WHAT IS SENT
   Page views, and a `sign_up` event when somebody joins the waitlist.
   Deliberately NOT sent: the email address, or anything else identifying a
   person. Google's terms forbid sending personal data to Analytics, and a
   waitlist address is exactly that. If you add events later, keep them to
   counts and categories.
   ========================================================================== */

(function (WL) {
  'use strict';

  var MEASUREMENT_ID = 'G-XH0DPDE6BP';

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', MEASUREMENT_ID);

  var tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
  document.head.appendChild(tag);

  /* Safe to call from anywhere, at any time. Queues into dataLayer whether or
     not gtag.js has finished loading, and does nothing at all if a blocker
     has removed it — an analytics call must never break the page it measures. */
  WL.track = function (event, params) {
    try {
      gtag('event', event, params || {});
    } catch (e) {
      /* blocked, offline, or gtag stripped — not worth a broken page */
    }
  };
})(window.WL = window.WL || {});
