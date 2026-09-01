/* ==========================================================================
   smooth-scroll.js — Lenis wiring.

   The source site uses Lenis; the weight and glide of the whole page comes
   from it, so it is vendored in js/vendor rather than approximated.
   Everything else on the page reads scroll position from here, which keeps
   the parallax locked to the smoothed value instead of the raw one.
   ========================================================================== */

(function (WL) {
  'use strict';

  var listeners = [];
  var scrollY = 0;

  WL.onScroll = function (fn) {
    listeners.push(fn);
    fn(scrollY);
  };

  WL.getScroll = function () { return scrollY; };

  function emit(y) {
    scrollY = y;
    for (var i = 0; i < listeners.length; i++) listeners[i](y);
  }

  WL.initSmoothScroll = function () {
    // Anyone who has asked the OS to calm motion down gets native scrolling.
    if (WL.reducedMotion || typeof window.Lenis !== 'function') {
      window.addEventListener('scroll', function () {
        emit(window.scrollY || window.pageYOffset || 0);
      }, { passive: true });
      emit(window.scrollY || 0);
      return null;
    }

    var lenis = new window.Lenis({
      duration: 1.1,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      touchMultiplier: 1.6
    });

    lenis.on('scroll', function (e) { emit(e.scroll); });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // In-page anchors go through Lenis so they glide rather than jump.
    document.addEventListener('click', function (ev) {
      var a = ev.target.closest && ev.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      ev.preventDefault();
      lenis.scrollTo(target, { offset: 0 });
    });

    return lenis;
  };
})(window.WL = window.WL || {});
