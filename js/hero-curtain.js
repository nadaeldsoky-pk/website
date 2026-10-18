/* Hero "curtain": the hero is pinned and the section right after it rises over it as a second layer.
   Markup: <div class="hero-stage"> <section class="hero-curtain">…</section> <section>next</section> </div>
   While the next section covers the hero, a dark veil fades in (the hero never shrinks). */
(function(){
  var hero = document.querySelector('.hero-curtain');
  if (!hero) return;
  var next = hero.nextElementSibling;
  while (next && next.hasAttribute('hidden')) next = next.nextElementSibling;
  if (!next) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dim = document.createElement('div');
  dim.className = 'hero-dim'; dim.setAttribute('aria-hidden', 'true');
  hero.appendChild(dim);
  var ticking = false;
  function pin(){
    /* Pin so the hero's BOTTOM edge stays glued to the viewport bottom — the next section then rises over it */
    var vh = window.innerHeight, h = hero.offsetHeight;
    hero.style.setProperty('--hero-top', (vh - h) + 'px');
  }
  function paint(){
    ticking = false;
    if (reduce) return;
    var vh = window.innerHeight;
    var p = Math.max(0, Math.min(1, (vh - next.getBoundingClientRect().top) / vh));
    var e = p * p * (3 - 2 * p); /* smoothstep */
    dim.style.opacity = (0.62 * e).toFixed(3);
  }
  function req(){ if (!ticking) { ticking = true; requestAnimationFrame(paint); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', function(){ pin(); req(); });
  window.addEventListener('load', function(){ pin(); req(); });
  pin(); paint();
})();
