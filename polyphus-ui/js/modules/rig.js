/* ==========================================================================
   rig.js — the one moving part in the crew tile.

   The BUILD stage's bar fills and its percentage counts with it. Bar and
   number are written from the same value on the same frame, so they can
   never disagree — which is the usual bug when a CSS animation drives the
   bar and a timer drives the label.

   It is an illustration, not telemetry. Nothing here is measuring anything.
   ========================================================================== */

(function (WL) {
  'use strict';

  var CYCLE = 11000;   // ms for 0 -> 100
  var HOLD  = 1400;    // ms sitting at 100 before it starts over

  WL.initRig = function () {
    var bar = document.querySelector('[data-rig-bar]');
    var pct = document.querySelector('[data-rig-pct]');
    if (!bar) return;

    var fill = bar.firstElementChild;
    if (!fill) return;

    // Reduced motion gets the resting frame the markup already ships with.
    if (WL.reducedMotion) return;

    var startedAt = null;
    var last = -1;

    function frame(now) {
      if (startedAt === null) startedAt = now;

      var t = (now - startedAt) % (CYCLE + HOLD);
      var value = t >= CYCLE ? 100 : (t / CYCLE) * 100;
      var rounded = Math.round(value);

      // Only touch the DOM when the rendered value actually changes.
      if (rounded !== last) {
        last = rounded;
        fill.style.setProperty('--fill', rounded + '%');
        if (pct) pct.textContent = rounded;
      }

      raf = requestAnimationFrame(frame);
    }

    var raf = requestAnimationFrame(frame);

    // The tile is a long way down the page; there is no reason to animate it
    // while nobody can see it.
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !raf) {
            startedAt = null;
            raf = requestAnimationFrame(frame);
          } else if (!e.isIntersecting && raf) {
            cancelAnimationFrame(raf);
            raf = 0;
          }
        });
      }, { rootMargin: '200px' });
      io.observe(bar);
    }
  };
})(window.WL = window.WL || {});
