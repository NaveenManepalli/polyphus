/* ==========================================================================
   parallax.js — the hero mountain rig.

   Four plates, one rate each. translateY = scrollY × rate:

     far   +0.40   drifts down, so the horizon opens up as you descend
     peak  +0.20
     mid    0.00   locked to the page — this is the plate you "stand on"
     near  -0.10   climbs, so the foreground ridge sweeps past fastest

   Those numbers were measured off the source, not chosen. They are declared
   in tokens.css as --rate-* and read from each element's data-rate so the
   markup stays the single source of truth.
   ========================================================================== */

(function (WL) {
  'use strict';

  WL.initParallax = function () {
    var hero = document.querySelector('[data-parallax]');
    if (!hero) return;

    var plates = [].slice.call(hero.querySelectorAll('[data-rate]')).map(function (el) {
      return { el: el, rate: parseFloat(el.getAttribute('data-rate')) || 0 };
    });

    if (!plates.length) return;

    // Reduced motion: hold the scene at its rest composition.
    if (WL.reducedMotion) return;

    var heroHeight = hero.offsetHeight;
    var ticking = false;
    var last = -1;

    function apply(y) {
      // Once the hero is fully off-screen there is nothing left to move.
      if (y > heroHeight + 200) return;
      for (var i = 0; i < plates.length; i++) {
        var p = plates[i];
        if (!p.rate) continue;
        p.el.style.transform = 'translate3d(0,' + (y * p.rate).toFixed(2) + 'px,0)';
      }
    }

    WL.onScroll(function (y) {
      last = y;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        apply(last);
      });
    });

    window.addEventListener('resize', function () {
      heroHeight = hero.offsetHeight;
      apply(last < 0 ? 0 : last);
    });
  };
})(window.WL = window.WL || {});
