/* ==========================================================================
   carousel.js — the crew rail.

   The rail is a real horizontally scrollable element, so wheel, trackpad and
   touch already work. This adds three things on top:

     1  the arrows page by a whole view (3 cards on desktop), not one card
     2  pointer-dragging
     3  the fade — each card's opacity tracks how much of it is currently
        inside the rail, written every animation frame while the rail moves

   (3) is what makes cards fade as they slide to the next page. At rest the
   visible cards are fully inside, so they sit at opacity 1 and nothing looks
   dimmed; the fade only exists during the movement.
   ========================================================================== */

(function (WL) {
  'use strict';

  WL.initCarousel = function () {
    var rail = document.querySelector('[data-rail]');
    if (!rail) return;

    var prev = document.querySelector('[data-rail-prev]');
    var next = document.querySelector('[data-rail-next]');
    var cards = [].slice.call(rail.children);
    if (!cards.length) return;

    function gap() {
      return parseFloat(getComputedStyle(rail).columnGap) || 0;
    }

    /* One page = everything currently on screen, plus the gap that follows it,
       so the next page lands flush against the rail's left edge. */
    function page() {
      return rail.clientWidth + gap();
    }

    /* --- the fade ------------------------------------------------------- */

    // A card fully inside the rail is opaque. As it crosses either edge its
    // visible fraction falls and it fades out; the incoming card fades in on
    // the same curve. Tuned so a card stays solid until it is genuinely
    // leaving, rather than dimming the moment it touches the edge.
    function opacityFor(fraction) {
      var o = fraction * 1.35 - 0.12;
      return o < 0 ? 0 : o > 1 ? 1 : o;
    }

    function paint() {
      var r = rail.getBoundingClientRect();
      for (var i = 0; i < cards.length; i++) {
        var c = cards[i].getBoundingClientRect();
        if (!c.width) continue;
        var visible = Math.min(c.right, r.right) - Math.max(c.left, r.left);
        var o = opacityFor(Math.max(0, visible) / c.width);
        cards[i].style.opacity = o.toFixed(3);
      }
    }

    /* --- arrow state ---------------------------------------------------- */

    function sync() {
      var max = rail.scrollWidth - rail.clientWidth;
      if (prev) prev.disabled = rail.scrollLeft <= 1;
      if (next) next.disabled = rail.scrollLeft >= max - 1;
    }

    if (prev) prev.addEventListener('click', function () {
      rail.scrollBy({ left: -page(), behavior: 'smooth' });
    });

    if (next) next.addEventListener('click', function () {
      rail.scrollBy({ left: page(), behavior: 'smooth' });
    });

    /* One rAF-throttled handler drives both the arrows and the fade. */
    var queued = false;
    rail.addEventListener('scroll', function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        queued = false;
        paint();
        sync();
      });
    }, { passive: true });

    window.addEventListener('resize', function () { paint(); sync(); });

    /* --- drag to pan ---------------------------------------------------- */
    /* Pointer events cover mouse, pen and touch in one path. */

    var down = false, startX = 0, startLeft = 0, moved = 0;

    rail.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      down = true;
      moved = 0;
      startX = e.clientX;
      startLeft = rail.scrollLeft;
      rail.classList.add('is-dragging');
    });

    rail.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      moved = Math.abs(dx);
      if (moved > 3) {
        rail.scrollLeft = startLeft - dx;
        if (rail.hasPointerCapture && !rail.hasPointerCapture(e.pointerId)) {
          rail.setPointerCapture(e.pointerId);
        }
      }
    });

    function release() {
      if (!down) return;
      down = false;
      rail.classList.remove('is-dragging');
      paint();
      sync();
    }

    rail.addEventListener('pointerup', release);
    rail.addEventListener('pointercancel', release);
    rail.addEventListener('pointerleave', release);

    // Swallow the click that ends a drag so cards don't fire a navigation.
    rail.addEventListener('click', function (e) {
      if (moved > 5) { e.preventDefault(); e.stopPropagation(); }
    }, true);

    /* --- first paint ---------------------------------------------------- */

    if (WL.reducedMotion) {
      cards.forEach(function (c) { c.style.opacity = ''; });
    } else {
      paint();
    }
    sync();
  };
})(window.WL = window.WL || {});
