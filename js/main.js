/* ===================== PAGE LOADER ===================== */
(function(){
  var loader     = document.getElementById('pageLoader');
  var loaderMark = document.getElementById('loaderMark');
  var loaderRing = document.getElementById('loaderRing');
  var headerLogo = document.querySelector('#siteHeader .shrink-0 img');

  if (!loader || !loaderMark || !headerLogo) return;

  /* Hide the real logo until the loader icon lands on it */
  headerLogo.style.opacity = '0';
  headerLogo.style.transition = 'none';

  /* Add second inner ring and start breath animation */
  var ring2 = document.createElement('div');
  ring2.id = 'loaderRing2';
  document.getElementById('loaderInner').insertBefore(ring2, loaderMark);
  loaderMark.classList.add('ldr-breath');

  /* Intro: scale icon in */
  loaderMark.style.animation = 'ldrIntro .6s cubic-bezier(.34,1.56,.64,1) both, ldrBreath 2s ease-in-out .6s infinite';

  function flyToLogo() {
    /* Stop breathing & rings */
    loaderMark.style.animation = 'none';
    loaderRing.style.opacity = '0';
    ring2.style.opacity = '0';

    /* FLIP positions */
    var from = loaderMark.getBoundingClientRect();
    var to   = headerLogo.getBoundingClientRect();

    /* Land SVG icon center at the icon portion of the logo (left ~20% of img) */
    var targetX = to.left + to.width * 0.09;
    var targetY = to.top  + to.height * 0.5;
    var fromCX  = from.left + from.width  * 0.5;
    var fromCY  = from.top  + from.height * 0.5;

    var dx    = targetX - fromCX;
    var dy    = targetY - fromCY;
    var scale = (to.height / from.height) * 0.92;

    /* Fly with one spin and spring overshoot */
    loaderMark.style.transition = 'transform .75s cubic-bezier(.34,1.3,.64,1), opacity .25s ease .55s';
    loaderMark.style.transform  = 'translate(' + dx + 'px,' + dy + 'px) rotate(360deg) scale(' + scale + ')';
    loaderMark.style.opacity    = '0';

    setTimeout(function() {
      /* Reveal the real logo */
      headerLogo.style.transition = 'opacity .35s ease';
      headerLogo.style.opacity    = '1';

      /* Fade out the whole overlay */
      loader.style.opacity    = '0';
      loader.style.transition = 'opacity .45s ease';

      setTimeout(function() {
        if (loader.parentNode) loader.parentNode.removeChild(loader);
      }, 480);
    }, 680);
  }

  /* Show loader for 1.5s then fly */
  setTimeout(flyToLogo, 1500);
})();

/* ===================================================== */
(function(){
  "use strict";

  /* Mobile menu */
  var menuBtn = document.getElementById('menuBtn');
  var mobileMenu = document.getElementById('mobileMenu');
  var iconOpen = document.getElementById('iconOpen');
  var iconClose = document.getElementById('iconClose');

  menuBtn.addEventListener('click', function(){
    var isOpen = mobileMenu.classList.contains('hidden') === false;
    mobileMenu.classList.toggle('hidden');
    iconOpen.classList.toggle('hidden');
    iconClose.classList.toggle('hidden');
    menuBtn.setAttribute('aria-expanded', String(!isOpen));
    menuBtn.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
  });

  /* Footer year */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------------- Desktop nav sliding underline ---------------- */
  var navList = document.getElementById('navList');
  var navUnderline = document.getElementById('navUnderline');

  if (navList && navUnderline) {
    var navLinks = Array.prototype.slice.call(navList.querySelectorAll('.nav-link'));

    var moveUnderline = function(link){
      navUnderline.style.left = link.offsetLeft + 'px';
      navUnderline.style.width = link.offsetWidth + 'px';
    };

    var setActiveLink = function(link){
      navLinks.forEach(function(a){
        var isActive = a === link;
        a.classList.toggle('text-primary', isActive);
        a.classList.toggle('font-semibold', isActive);
        a.classList.toggle('text-muted', !isActive);
        if (isActive) {
          a.setAttribute('aria-current', 'page');
        } else {
          a.removeAttribute('aria-current');
        }
      });
      moveUnderline(link);
    };

    navLinks.forEach(function(link){
      link.addEventListener('click', function(){ setActiveLink(link); });
    });

    window.addEventListener('resize', function(){
      var current = navList.querySelector('.nav-link[aria-current="page"]') || navLinks[0];
      moveUnderline(current);
    });

    /* Position instantly on load, without animating in from the left */
    navUnderline.style.transition = 'none';
    moveUnderline(navLinks[0]);
    requestAnimationFrame(function(){ navUnderline.style.transition = ''; });
  }

  /* ---------------- Product Suite carousel ---------------- */
  var icons = {
    cyber: '<svg width="52" height="52" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2 4 5v6c0 5.25 3.5 9.5 8 11 4.5-1.5 8-5.75 8-11V5l-8-3z" stroke="#44225A" stroke-width="1.6"/><path d="M9 12l2 2 4-4" stroke="#44225A" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    governance: '<svg width="52" height="52" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 10h16M6 10v8h12v-8M9 18v-4M15 18v-4" stroke="#093BAA" stroke-width="1.6" stroke-linecap="round"/><path d="M12 3 3 8h18l-9-5z" stroke="#093BAA" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    intel: '<svg width="52" height="52" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="#186166" stroke-width="1.6"/><path d="M20 20l-4.35-4.35" stroke="#186166" stroke-width="1.6" stroke-linecap="round"/></svg>',
    risk: '<svg width="52" height="52" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20V13" stroke="#153D56" stroke-width="1.6" stroke-linecap="round"/></svg>',
    audit: '<svg width="52" height="52" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2" stroke="#1CA2A5" stroke-width="1.6"/><path d="M8 8h8M8 12h8M8 16h5" stroke="#1CA2A5" stroke-width="1.6" stroke-linecap="round"/></svg>',
    vendor: '<svg width="52" height="52" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 9l2-5h14l2 5" stroke="#6E3894" stroke-width="1.6" stroke-linejoin="round"/><path d="M4 9h16v10H4z" stroke="#6E3894" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 13h6" stroke="#6E3894" stroke-width="1.6" stroke-linecap="round"/></svg>',
    incident: '<svg width="52" height="52" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3 2 21h20L12 3z" stroke="#44225A" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 10v4" stroke="#44225A" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="17" r="1" fill="#44225A"/></svg>'
  };

  var products = [
    { key:'cyber', name:'CyberMode', desc:'Automate compliance, strategy, and committee management.' },
    { key:'governance', name:'GovernanceMode', desc:'Centralize policies, audits, and regulatory mapping in one place.' },
    { key:'intel', name:'IntelMode', desc:'Real-time threat intelligence and risk scoring for your organization.' },
    { key:'risk', name:'RiskMode', desc:'Quantify, prioritize, and track enterprise risk exposure over time.' },
    { key:'audit', name:'AuditMode', desc:'Streamline internal and external audit cycles from planning to sign-off.' },
    { key:'vendor', name:'VendorMode', desc:'Manage third-party and vendor risk assessments end to end.' },
    { key:'incident', name:'IncidentMode', desc:'Coordinate incident response, escalation, and regulatory reporting.' }
  ];

  var current = 0;
  var tabList = document.getElementById('tabList');
  var dots = document.getElementById('dots');
  var panelIcon = document.getElementById('panelIcon');
  var panelTitle = document.getElementById('panelTitle');
  var panelDesc = document.getElementById('panelDesc');
  var pagerLabel = document.getElementById('pagerLabel');

  function pad(n){ return n < 10 ? '0' + n : '' + n; }

  function buildTabs(){
    products.forEach(function(p, i){
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tab-icon flex h-[70px] w-[70px] sm:h-[90px] sm:w-[90px] items-center justify-center rounded-2xl border border-borderc2 bg-white shadow-[0_0_20px_rgba(62,33,118,0.15)] transition-shadow';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', i === current ? 'true' : 'false');
      btn.setAttribute('aria-label', p.name);
      btn.innerHTML = icons[p.key];
      btn.addEventListener('click', function(){ goTo(i); });
      tabList.appendChild(btn);

      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'h-[10px] rounded-full transition-all';
      dot.setAttribute('aria-label', 'Go to ' + p.name);
      dot.addEventListener('click', function(){ goTo(i); });
      dots.appendChild(dot);
    });
  }

  function render(){
    var p = products[current];
    panelIcon.innerHTML = icons[p.key];
    panelTitle.textContent = p.name;
    panelDesc.textContent = p.desc;
    pagerLabel.textContent = pad(current + 1) + ' / ' + pad(products.length);

    Array.prototype.forEach.call(tabList.children, function(btn, i){
      btn.setAttribute('aria-selected', i === current ? 'true' : 'false');
    });
    Array.prototype.forEach.call(dots.children, function(dot, i){
      var active = i === current;
      dot.className = 'rounded-full transition-all h-[10px] ' + (active ? 'w-[36px] bg-white' : 'w-[10px] bg-white/40 hover:bg-white/70');
    });

    [panelIcon, panelTitle, panelDesc].forEach(function(el){
      el.classList.remove('fade-enter');
      void el.offsetWidth; /* restart animation */
      el.classList.add('fade-enter');
    });
  }

  function goTo(i){
    current = (i + products.length) % products.length;
    render();
  }

  document.getElementById('prevBtn').addEventListener('click', function(){ goTo(current - 1); });
  document.getElementById('nextBtn').addEventListener('click', function(){ goTo(current + 1); });

  buildTabs();
  render();

  /* ---------------- Strategic Services stacked scroll effect ---------------- */
  var serviceStack = document.getElementById('serviceStack');
  if (serviceStack) {
    var stackCards = serviceStack.querySelectorAll('.stack-card');
    if (stackCards.length === 2 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var frontCard = stackCards[0];
      var coverCard = stackCards[1];
      /* gap between the two cards' sticky top offsets (top-63 - top-28 = 252px - 112px) — keep in sync with index.html */
      var PEEK_PX = 140;
      var stackTicking = false;

      frontCard.style.transformOrigin = 'center top';

      var updateStack = function(){
        var frontRect = frontCard.getBoundingClientRect();
        var coverRect = coverCard.getBoundingClientRect();
        var travel = frontRect.height - PEEK_PX;
        var progress = travel > 0 ? (frontRect.bottom - coverRect.top) / travel : 0;
        progress = Math.max(0, Math.min(1, progress));

        frontCard.style.transform = 'scale(' + (1 - progress * 0.14) + ')';
        frontCard.style.opacity = String(1 - progress * 0.25);
        stackTicking = false;
      };

      var onStackScroll = function(){
        if (!stackTicking) {
          requestAnimationFrame(updateStack);
          stackTicking = true;
        }
      };

      window.addEventListener('scroll', onStackScroll, { passive: true });
      window.addEventListener('resize', onStackScroll);
      updateStack();
    }
  }

  /* ---------------- Header hide / show on scroll ---------------- */
  var siteHeader = document.getElementById('siteHeader');
  var heroSection = document.getElementById('top');

  if (siteHeader && heroSection) {
    siteHeader.style.transition = 'transform 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.45s cubic-bezier(0.4,0,0.2,1)';

    var lastScrollY = window.scrollY;
    var headerVisible = true;
    var headerTicking = false;

    var updateHeader = function(){
      var currentY   = window.scrollY;
      var heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
      var scrollingDown = currentY > lastScrollY;

      if (currentY <= heroBottom) {
        /* still inside / above hero — always show */
        if (!headerVisible) {
          siteHeader.style.transform = 'translateY(0)';
          siteHeader.style.opacity  = '1';
          siteHeader.style.pointerEvents = '';
          headerVisible = true;
        }
      } else {
        if (scrollingDown && headerVisible) {
          /* past hero, scrolling down → hide */
          siteHeader.style.transform = 'translateY(-100%)';
          siteHeader.style.opacity  = '0';
          siteHeader.style.pointerEvents = 'none';
          headerVisible = false;
        } else if (!scrollingDown && !headerVisible) {
          /* past hero, scrolling up → show */
          siteHeader.style.transform = 'translateY(0)';
          siteHeader.style.opacity  = '1';
          siteHeader.style.pointerEvents = '';
          headerVisible = true;
        }
      }

      lastScrollY = currentY;
      headerTicking = false;
    };

    window.addEventListener('scroll', function(){
      if (!headerTicking) {
        requestAnimationFrame(updateHeader);
        headerTicking = true;
      }
    }, { passive: true });
  }

  /* ---------------- Scroll to top button ---------------- */
  var scrollTopBtn = document.getElementById('scrollTopBtn');
  var heroForBtn   = document.getElementById('top');

  if (scrollTopBtn && heroForBtn) {
    var btnTicking = false;

    var updateScrollBtn = function(){
      var threshold = heroForBtn.offsetTop + heroForBtn.offsetHeight;
      var shouldShow = window.scrollY > threshold;
      var isVisible  = scrollTopBtn.classList.contains('is-visible');

      if (shouldShow && !isVisible) {
        scrollTopBtn.classList.remove('is-hiding');
        void scrollTopBtn.offsetWidth; /* reset animation */
        scrollTopBtn.classList.add('is-visible');
      } else if (!shouldShow && isVisible) {
        scrollTopBtn.classList.remove('is-visible');
        scrollTopBtn.classList.add('is-hiding');
        setTimeout(function(){ scrollTopBtn.classList.remove('is-hiding'); }, 400);
      }
      btnTicking = false;
    };

    window.addEventListener('scroll', function(){
      if (!btnTicking) {
        requestAnimationFrame(updateScrollBtn);
        btnTicking = true;
      }
    }, { passive: true });

    scrollTopBtn.addEventListener('click', function(){
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------------- Impact stat counters ---------------- */
  var statsRow = document.querySelector('.stats-row');
  if (statsRow) {
    var statBlocks = statsRow.querySelectorAll('.stat-block');
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var animateCount = function(el){
      var target = parseInt(el.getAttribute('data-target'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      var duration = 1900;
      var start = null;

      function step(timestamp){
        if (!start) start = timestamp;
        var progress = Math.min((timestamp - start) / duration, 1);
        /* ease-out-expo: fast start, long gentle settle — reads as more deliberate/premium */
        var eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target + suffix;
          el.style.transform = 'scale(1.12)';
          setTimeout(function(){ el.style.transform = 'scale(1)'; }, 30);
        }
      }
      requestAnimationFrame(step);
    };

    var revealStats = function(){
      statBlocks.forEach(function(block, i){
        setTimeout(function(){
          block.style.opacity = '1';
          block.style.transform = 'translateY(0)';
          var numberEl = block.querySelector('.stat-number');
          if (numberEl) animateCount(numberEl);
        }, i * 180);
      });
    };

    if (prefersReducedMotion) {
      statBlocks.forEach(function(block){
        var numberEl = block.querySelector('.stat-number');
        if (numberEl) numberEl.textContent = numberEl.getAttribute('data-target') + (numberEl.getAttribute('data-suffix') || '');
      });
    } else {
      statBlocks.forEach(function(block){
        block.style.opacity = '0';
        block.style.transform = 'translateY(14px)';
        block.style.transition = 'opacity 700ms ease-out, transform 700ms ease-out';
      });

      var statObserver = new IntersectionObserver(function(entries, observer){
        entries.forEach(function(entry){
          if (!entry.isIntersecting) return;
          revealStats();
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.3 });

      statObserver.observe(statsRow);
    }
  }
})();
