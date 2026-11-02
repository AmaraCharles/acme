/* Landing page scroll effects.
   Must load BEFORE AOS.init so the data-aos attributes added here are picked up. */
(function () {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Reveal-on-scroll: tag section content that has no animation yet ----
  // Headings/text slide up, media zooms in, list items stagger.
  function tagForAos() {
    var root = document.querySelector('.page-main');
    if (!root || reduceMotion) return;

    var skip = '[data-aos], [data-aos] *, script, style, iframe, .tradingview-widget-container *';

    root.querySelectorAll('.p-home__section').forEach(function (section) {
      section.querySelectorAll('h1, h2, h3, h4, p, .com-c-button').forEach(function (el) {
        if (el.matches(skip)) return;
        el.setAttribute('data-aos', 'fade-up');
      });

      section.querySelectorAll('img, video').forEach(function (el) {
        if (el.matches(skip)) return;
        el.setAttribute('data-aos', 'zoom-in');
      });

      // Stagger items in lists/grids so they cascade in
      section.querySelectorAll('ul, ol').forEach(function (list) {
        var i = 0;
        Array.prototype.forEach.call(list.children, function (li) {
          if (li.tagName !== 'LI') return;
          if (!li.hasAttribute('data-aos') && !li.matches(skip)) li.setAttribute('data-aos', 'fade-up');
          if (li.getAttribute('data-aos') && !li.hasAttribute('data-aos-delay')) {
            li.setAttribute('data-aos-delay', String(Math.min(i, 5) * 100));
          }
          i++;
        });
      });
    });
  }

  // ---- Scroll progress bar, header shadow, back-to-top ----
  function setupScrollUi() {
    var bar = document.createElement('div');
    bar.className = 'fx-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    var top = document.createElement('button');
    top.type = 'button';
    top.className = 'fx-to-top';
    top.setAttribute('aria-label', 'Back to top');
    top.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>';
    top.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    document.body.appendChild(top);

    var header = document.querySelector('.page__header');
    var ticking = false;

    function update() {
      ticking = false;
      var y = window.scrollY || document.documentElement.scrollTop;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
      if (header) header.classList.toggle('fx-scrolled', y > 10);
      top.classList.toggle('fx-show', y > window.innerHeight * 0.8);
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  // Make the cards reachable by keyboard so their focus effect can show
  function setupCardFocus() {
    document.querySelectorAll('.p-home-m-seo-numbers-item').forEach(function (el) {
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
    });
  }

  // This script sits at the end of <body>, so the page content is already
  // parsed: tag it right away, before AOS.init collects its elements.
  tagForAos();
  setupCardFocus();

  if (document.body) setupScrollUi();
  else document.addEventListener('DOMContentLoaded', setupScrollUi);
})();
