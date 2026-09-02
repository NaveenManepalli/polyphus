/* ==========================================================================
   main.js — boot.
   Modules register themselves on window.WL; this file just starts them in
   the right order. Smooth scroll goes first because parallax reads from it.
   ========================================================================== */

(function (WL) {
  'use strict';

  WL.reducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function boot() {
    // Start whatever this page actually loaded — a page without a rail
    // simply doesn't ship carousel.js.
    ['initSmoothScroll', 'initParallax', 'initReveal', 'initRig']
      .forEach(function (fn) { if (typeof WL[fn] === 'function') WL[fn](); });

    document.documentElement.classList.add('is-ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window.WL = window.WL || {});
