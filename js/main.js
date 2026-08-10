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

  /* ---------------- Strategic Services carousel ---------------- */
  var serviceCheckIcon = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" class="shrink-0"><circle cx="12" cy="12" r="9" stroke="#6E3894" stroke-width="1.6"/><path d="M8.5 12.3l2.2 2.2 4.3-4.6" stroke="#6E3894" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var services = [
    {
      key: 'cyber',
      title: 'Cybersecurity Professional Services',
      image: 'assets/p3.jpg',
      items: [
        'Virtual CISO & security leadership on demand.',
        'Penetration testing & vulnerability assessments.',
        'Security awareness & training programs.'
      ],
      imageSide: 'left'
    },
    {
      key: 'grc',
      title: 'GRC Consultation Services',
      image: 'assets/p7.jpg',
      items: [
        'NCA/DGA Compliance Audits.',
        'Enterprise Architecture (NORA v2).',
        'Data Privacy (PDPL) Consultation.'
      ],
      imageSide: 'right'
    }
  ];

  var serviceCard = document.getElementById('serviceCard');
  if (serviceCard) {
    var serviceImage = document.getElementById('serviceImage');
    var serviceTitle = document.getElementById('serviceTitle');
    var serviceList = document.getElementById('serviceList');
    var serviceDots = document.getElementById('serviceDots');
    var serviceCurrent = 0;

    function buildServiceDots(){
      services.forEach(function(s, i){
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'rounded-full transition-all';
        dot.setAttribute('aria-label', 'Go to ' + s.title);
        dot.addEventListener('click', function(){ goToService(i); });
        serviceDots.appendChild(dot);
      });
    }

    function renderService(){
      var s = services[serviceCurrent];
      serviceImage.style.backgroundImage = 'url(' + s.image + ')';
      serviceTitle.textContent = s.title;

      serviceList.innerHTML = '';
      s.items.forEach(function(text){
        var li = document.createElement('li');
        li.className = 'flex items-center gap-3';
        li.innerHTML = serviceCheckIcon + '<span class="text-muted font-medium text-base sm:text-lg">' + text + '</span>';
        serviceList.appendChild(li);
      });

      serviceCard.classList.toggle('lg:flex-row-reverse', s.imageSide === 'right');

      Array.prototype.forEach.call(serviceDots.children, function(dot, i){
        var active = i === serviceCurrent;
        dot.className = 'rounded-full transition-all h-[10px] ' + (active ? 'w-[28px] bg-primary' : 'w-[10px] bg-primary/25 hover:bg-primary/50');
      });

      [serviceImage, serviceTitle, serviceList].forEach(function(el){
        el.classList.remove('fade-enter');
        void el.offsetWidth; /* restart animation */
        el.classList.add('fade-enter');
      });
    }

    function goToService(i){
      serviceCurrent = (i + services.length) % services.length;
      renderService();
    }

    document.getElementById('servicePrevBtn').addEventListener('click', function(){ goToService(serviceCurrent - 1); });
    document.getElementById('serviceNextBtn').addEventListener('click', function(){ goToService(serviceCurrent + 1); });

    buildServiceDots();
    renderService();
  }
})();
