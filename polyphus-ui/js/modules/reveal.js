/* ==========================================================================
   reveal.js — entrance animations.

   Two kinds:
     [data-reveal]  the block fades up once, on first intersection
     [data-words]   the text is split into per-word spans that cascade in

   The word split is what gives the big headlines their staggered arrival on
   the source site — every word there is its own span for exactly this.
   Splitting happens in JS so the HTML stays readable and copy-pasteable.
   ========================================================================== */

(function (WL) {
  'use strict';

  /* Wrap each word of a text node in <span class="word">, preserving the
     spaces between them and leaving any existing markup (<strong>, <br>)
     intact. */
  function splitWords(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    var n;
    while ((n = walker.nextNode())) {
      if (n.nodeValue.trim()) nodes.push(n);
    }

    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(function (chunk) {
        if (!chunk) return;
        if (/^\s+$/.test(chunk)) {
          frag.appendChild(document.createTextNode(chunk));
        } else {
          var span = document.createElement('span');
          span.className = 'word';
          span.textContent = chunk;
          frag.appendChild(span);
        }
      });
      node.parentNode.replaceChild(frag, node);
    });

    // Index them so the CSS stagger has something to count with.
    [].slice.call(root.querySelectorAll('.word')).forEach(function (w, i) {
      w.style.setProperty('--i', i);
    });
  }

  WL.initReveal = function () {
    var wordBlocks = [].slice.call(document.querySelectorAll('[data-words]'));
    wordBlocks.forEach(function (el) {
      el.classList.add('words');
      splitWords(el);
    });

    var targets = [].slice.call(document.querySelectorAll('[data-reveal]'))
      .concat(wordBlocks);

    targets.forEach(function (el) {
      if (!el.hasAttribute('data-words')) el.classList.add('reveal');
      var delay = el.getAttribute('data-delay');
      if (delay) el.style.setProperty('--reveal-delay', delay);
    });

    if (WL.reducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        // Anything already above the viewport was scrolled past before we
        // could see it — a deep link, or a restored scroll position. Show it
        // rather than leaving a blank block on the page.
        var passed = entry.boundingClientRect.bottom < 0;
        if (!entry.isIntersecting && !passed) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);   // play once, never rewind
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });

    targets.forEach(function (el) { io.observe(el); });
  };
})(window.WL = window.WL || {});
