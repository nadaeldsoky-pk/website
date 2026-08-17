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

  /* ---------------- Modules data & icons ---------------- */
  var MICONS = {
    framework:    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 21h18M6 21V10M18 21V10M12 21V4M3 10l9-7 9 7" stroke="#6E3894" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    document:     '<svg width="20" height="24" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#6E3894" stroke-width="1.6" stroke-linejoin="round"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#6E3894" stroke-width="1.6" stroke-linecap="round"/></svg>',
    exception:    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#6E3894" stroke-width="1.6"/><path d="M9 9l6 6M15 9l-6 6" stroke="#6E3894" stroke-width="1.6" stroke-linecap="round"/></svg>',
    risk:         '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="#6E3894" stroke-width="1.6"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="#6E3894" stroke-width="1.6"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="#6E3894" stroke-width="1.6"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="#6E3894" stroke-width="1.6"/></svg>',
    assessment:   '<svg width="22" height="24" viewBox="0 0 24 24" fill="none"><rect x="8" y="2" width="8" height="4" rx="1" stroke="#6E3894" stroke-width="1.6"/><rect x="4" y="4" width="16" height="18" rx="2" stroke="#6E3894" stroke-width="1.6"/><path d="M8.5 12.3l2.2 2.2 4.3-4.6" stroke="#6E3894" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    incident_m:   '<svg width="22" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 3L2 21h20L12 3z" stroke="#6E3894" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 9v5" stroke="#6E3894" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="17.5" r="1" fill="#6E3894"/></svg>',
    asset:        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="14" rx="2" stroke="#6E3894" stroke-width="1.6"/><path d="M8 21h8M12 17v4" stroke="#6E3894" stroke-width="1.6" stroke-linecap="round"/></svg>',
    vuln:         '<svg width="20" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2L4 5v6c0 5.25 3.5 9.5 8 11 4.5-1.5 8-5.75 8-11V5l-8-3z" stroke="#6E3894" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 12l2 2 4-4" stroke="#6E3894" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    vendor_m:     '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="2" stroke="#6E3894" stroke-width="1.5"/><circle cx="5" cy="19" r="2" stroke="#6E3894" stroke-width="1.5"/><circle cx="19" cy="19" r="2" stroke="#6E3894" stroke-width="1.5"/><path d="M12 7v4M12 11l-5 6M12 11l5 6" stroke="#6E3894" stroke-width="1.5" stroke-linecap="round"/></svg>',
    compliance_m: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#6E3894" stroke-width="1.6"/><path d="M8.5 12.3l2.2 2.2 4.3-4.6" stroke="#6E3894" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    policy_m:     '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="18" rx="2" stroke="#6E3894" stroke-width="1.6"/><path d="M8 8h8M8 12h5" stroke="#6E3894" stroke-width="1.6" stroke-linecap="round"/><path d="M8 16l2 2 4-4" stroke="#6E3894" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    awareness_m:  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="#6E3894" stroke-width="1.6"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="#6E3894" stroke-width="1.6" stroke-linecap="round"/></svg>',
    workflow_m:   '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="5" cy="6" r="2" stroke="#6E3894" stroke-width="1.5"/><circle cx="19" cy="6" r="2" stroke="#6E3894" stroke-width="1.5"/><circle cx="12" cy="18" r="2" stroke="#6E3894" stroke-width="1.5"/><path d="M5 8v2a2 2 0 0 0 2 2h3M19 8v2a2 2 0 0 1-2 2h-3M12 10v6" stroke="#6E3894" stroke-width="1.5" stroke-linecap="round"/></svg>',
    dashboard_m:  '<svg width="20" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 20V10M10 20V4M16 20v-7M22 20V13" stroke="#6E3894" stroke-width="1.6" stroke-linecap="round"/></svg>',
    chart:        '<svg width="20" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 20V10M10 20V4M16 20v-7M22 20V13" stroke="#6E3894" stroke-width="1.6" stroke-linecap="round"/></svg>',
    search:       '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#6E3894" stroke-width="1.6"/><path d="M20 20l-3.5-3.5" stroke="#6E3894" stroke-width="1.6" stroke-linecap="round"/></svg>',
    threat:       '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" stroke="#6E3894" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    contract:     '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#6E3894" stroke-width="1.6" stroke-linejoin="round"/><path d="M14 2v6h6M8 12h8M8 16h5" stroke="#6E3894" stroke-width="1.6" stroke-linecap="round"/></svg>',
    playbook:     '<svg width="22" height="24" viewBox="0 0 24 24" fill="none"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-7-7z" stroke="#6E3894" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 12l2 2 4-4" stroke="#6E3894" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  var MODULES_DATA = {
    cyber: { title:'CyberMode Modules & Processes', subtitle:'A fully integrated platform covering every dimension of cybersecurity governance, delivering institutional-grade reliability.', modules:[
      {icon:'framework',   name:'Regulators & Frameworks Management', desc:'Supports NCA, ISO 27001, and SAMA frameworks with automated mapping.',                              tags:['NCA','ISO 27001','SAMA']},
      {icon:'document',    name:'Documentation Center',               desc:'Manages policies, standards, and procedures throughout their lifecycle.',                              tags:['Lifecycle','Approvals']},
      {icon:'exception',   name:'Exception Management',               desc:'Handles policy and control exceptions with multi-level approval workflows.',                          tags:['Deviations','Audit Trail']},
      {icon:'risk',        name:'Risk Register Management',           desc:'Classifies, assesses, and mitigates risks with interactive heatmaps.',                               tags:['Risk Scoring','Alerts']},
      {icon:'assessment',  name:'Assessment Module',                  desc:'Manages security assessments, readiness reviews, and dynamic templates.',                            tags:['Templates','Analysis']},
      {icon:'incident_m',  name:'Incident Management',                desc:'SANS-based incident lifecycle with integrated automated playbooks.',                                  tags:['SANS','Playbooks']},
      {icon:'asset',       name:'Asset Management',                   desc:'Tracks digital and physical assets with criticality scoring.',                                        tags:['Digital','Physical']},
      {icon:'vuln',        name:'Vulnerability Management',           desc:'Integrates with scanners for streamlined remediation and tracking.',                                  tags:['Integrations','Remediation']},
      {icon:'vendor_m',    name:'Third-Party Management',             desc:'End-to-end third-party risk scoring and vendor portal management.',                                   tags:['Profiles','Risk Scoring']},
      {icon:'compliance_m',name:'Framework Compliance',               desc:'Manages audits, evidence collection, and gap analysis across frameworks.',                           tags:['Audits','Evidence']},
      {icon:'policy_m',    name:'Policy/Standard Compliance',         desc:'Clause and department-level measurement with visual progress tracking.',                             tags:['Clause Level','Reporting']},
      {icon:'awareness_m', name:'Awareness Management',               desc:'Comprehensive training, phishing simulations, and employee surveys.',                                 tags:['LMS','Phishing','Surveys']},
      {icon:'workflow_m',  name:'Work Flow Module',                   desc:'Role-based data control and governed cross-module workflows.',                                        tags:['Role-Based','Cross-Module']},
      {icon:'dashboard_m', name:'Dashboards & Reporting',             desc:'Real-time customizable dashboards and institutional-grade reports.',                                  tags:['Real-Time','Custom','Insights']}
    ]},
    governance: { title:'GovernanceMode Modules & Processes', subtitle:'A unified GRC platform connecting policies, controls, and regulatory obligations in one automated workflow.', modules:[
      {icon:'policy_m',    name:'Policy Management',       desc:'Create, version-control, and publish policies with multi-level approval workflows.',              tags:['Lifecycle','Version Control']},
      {icon:'framework',   name:'Control Framework',       desc:'Map controls to NCA, ISO 27001, and NDMO requirements automatically.',                           tags:['NCA','ISO 27001','NDMO']},
      {icon:'risk',        name:'Risk Register',           desc:'Maintain a live risk register with scoring, treatment plans, and escalation rules.',             tags:['Risk Scoring','Treatment']},
      {icon:'chart',       name:'Committee Management',    desc:'Run governance committees with automated agendas, minutes, and action tracking.',                tags:['Agendas','Minutes']},
      {icon:'compliance_m',name:'Regulatory Tracking',     desc:'Monitor regulatory changes and auto-flag affected policies and controls.',                       tags:['Alerts','Mapping']},
      {icon:'dashboard_m', name:'Compliance Dashboard',    desc:'Real-time compliance posture across all active frameworks in one view.',                         tags:['Real-Time','KPIs']},
      {icon:'assessment',  name:'Audit Management',        desc:'Plan, execute, and track audit findings through to remediation closure.',                        tags:['Planning','Findings']},
      {icon:'document',    name:'Reporting Engine',        desc:'Generate board-ready GRC reports with one-click executive summaries.',                           tags:['Board Reports','Insights']}
    ]},
    intel: { title:'IntelMode Modules & Processes', subtitle:'A comprehensive intelligence platform that transforms raw threat data into prioritized, actionable security decisions.', modules:[
      {icon:'threat',      name:'Threat Feed Integration',     desc:'Aggregate and normalize feeds from MISP, STIX/TAXII, and commercial sources.',              tags:['MISP','STIX','TAXII']},
      {icon:'search',      name:'Indicator Management',        desc:'Manage, deduplicate, and score threat indicators across campaigns and actors.',              tags:['IOCs','Scoring']},
      {icon:'vuln',        name:'Threat Actor Profiling',      desc:'Build and maintain actor profiles with TTPs and targeting patterns.',                       tags:['TTPs','MITRE']},
      {icon:'incident_m',  name:'Alert Correlation',           desc:'Cross-correlate alerts from SIEM and endpoint tools with intelligence context.',            tags:['SIEM','Enrichment']},
      {icon:'compliance_m',name:'Vulnerability Intelligence',  desc:'Prioritize CVEs based on active exploitation and asset criticality.',                      tags:['CVE','Prioritization']},
      {icon:'playbook',    name:'Threat Hunting Workflows',    desc:'Structure and track proactive hunting campaigns with guided playbooks.',                    tags:['Hunting','Playbooks']},
      {icon:'risk',        name:'Incident Intelligence',       desc:'Enrich incident data with real-time threat context and attribution.',                       tags:['Attribution','Context']},
      {icon:'dashboard_m', name:'Intelligence Reporting',      desc:'Produce strategic, tactical, and operational threat reports for stakeholders.',             tags:['Strategic','Tactical']}
    ]},
    risk: { title:'RiskMode Modules & Processes', subtitle:'A quantitative risk platform turning ambiguous exposure data into board-ready, data-driven risk intelligence.', modules:[
      {icon:'search',      name:'Risk Identification',    desc:'Systematically identify and categorize risks across all business units and domains.',            tags:['Discovery','Taxonomy']},
      {icon:'assessment',  name:'Risk Assessment',        desc:'Score risks using quantitative and qualitative methodologies aligned to industry standards.',    tags:['Quantitative','Qualitative']},
      {icon:'playbook',    name:'Risk Treatment Plans',   desc:'Define, assign, and track remediation and mitigation plans with owners and due dates.',         tags:['Mitigation','Tracking']},
      {icon:'compliance_m',name:'Control Testing',        desc:'Test control effectiveness with automated sampling and evidence collection.',                    tags:['Testing','Evidence']},
      {icon:'risk',        name:'Risk Heatmaps',          desc:'Visualize risk exposure with interactive, filterable heatmaps by domain and severity.',         tags:['Visual','Filterable']},
      {icon:'incident_m',  name:'KRI Monitoring',         desc:'Track key risk indicators with threshold alerts and trend analysis dashboards.',                tags:['KRIs','Alerts']},
      {icon:'document',    name:'Risk Appetite Framework',desc:'Define and monitor risk appetite statements and tolerance thresholds by domain.',               tags:['Appetite','Tolerance']},
      {icon:'dashboard_m', name:'Executive Reporting',    desc:'Board-level risk dashboards with drill-down capability and automated distribution.',            tags:['Board','Drill-Down']}
    ]},
    audit: { title:'AuditMode Modules & Processes', subtitle:'A complete audit lifecycle platform that eliminates manual effort and delivers continuous, evidence-backed assurance.', modules:[
      {icon:'framework',   name:'Audit Planning',          desc:'Annual planning with risk-based prioritization, resource allocation, and calendar management.', tags:['Risk-Based','Planning']},
      {icon:'playbook',    name:'Work Program Management', desc:'Build and assign audit work programs from pre-built and customizable templates.',               tags:['Templates','Assignment']},
      {icon:'document',    name:'Evidence Collection',     desc:'Request, upload, and automatically link evidence to audit findings and controls.',              tags:['Requests','Auto-Link']},
      {icon:'incident_m',  name:'Findings Management',     desc:'Track findings from identification through remediation to full closure.',                       tags:['Findings','Tracking']},
      {icon:'assessment',  name:'Audit Reporting',         desc:'Generate draft audit reports with auto-populated findings summaries and ratings.',              tags:['Auto-Generated','Reports']},
      {icon:'compliance_m',name:'Remediation Tracking',    desc:'Monitor corrective action plans with owner assignment, due dates, and escalation rules.',      tags:['CAPs','Escalation']},
      {icon:'chart',       name:'Continuous Auditing',     desc:'Automate data analytics and control testing for continuous assurance and monitoring.',          tags:['Automated','Continuous']},
      {icon:'dashboard_m', name:'Audit Universe',          desc:'Maintain and update the complete audit universe registry with risk ratings.',                   tags:['Universe','Ratings']}
    ]},
    vendor: { title:'VendorMode Modules & Processes', subtitle:'An end-to-end third-party risk platform giving you full visibility and control over your entire vendor ecosystem.', modules:[
      {icon:'workflow_m',  name:'Vendor Onboarding',              desc:'Streamline vendor registration, due diligence, and contract intake workflows.',          tags:['Onboarding','Due Diligence']},
      {icon:'assessment',  name:'Risk Assessment Questionnaires', desc:'Send automated questionnaires with tiered scoring, weighting, and evidence requests.',  tags:['Automated','Scoring']},
      {icon:'risk',        name:'Vendor Risk Scoring',            desc:'Aggregate scores across security, financial, and operational risk dimensions.',          tags:['Aggregate','Multi-Dimension']},
      {icon:'contract',    name:'Contract Management',            desc:'Track vendor contracts, SLAs, and renewal dates with automated alerts.',                 tags:['SLAs','Renewals']},
      {icon:'search',      name:'Continuous Monitoring',          desc:'Monitor vendor news, breach disclosures, and security rating changes in real time.',     tags:['Real-Time','Ratings']},
      {icon:'vendor_m',    name:'Fourth-Party Management',        desc:'Map and assess sub-processors and sub-contractors for complete supply chain risk.',      tags:['Sub-Processors','Supply Chain']},
      {icon:'compliance_m',name:'Remediation Workflow',           desc:'Assign and track vendor remediation tasks with escalation rules and SLAs.',              tags:['Remediation','SLAs']},
      {icon:'dashboard_m', name:'Vendor Reporting',               desc:'Generate vendor risk reports for board, regulators, and internal stakeholders.',         tags:['Board','Regulators']}
    ]},
    incident: { title:'IncidentMode Modules & Processes', subtitle:'A structured incident response platform enabling faster containment, accurate reporting, and systematic improvement.', modules:[
      {icon:'incident_m',  name:'Incident Detection & Intake', desc:'Structured intake forms with auto-classification, severity scoring, and assignment.',      tags:['Auto-Classification','Severity']},
      {icon:'playbook',    name:'Response Playbooks',          desc:'SANS-aligned playbooks with step-by-step response procedures for each incident type.',     tags:['SANS','Playbooks']},
      {icon:'workflow_m',  name:'Task Assignment & Escalation',desc:'Assign response tasks with SLAs, automated escalation rules, and team notifications.',    tags:['SLAs','Escalation']},
      {icon:'chart',       name:'Communication Management',    desc:'Manage stakeholder notifications and crisis communication templates with audit trail.',    tags:['Notifications','Templates']},
      {icon:'document',    name:'Evidence Preservation',       desc:'Collect, chain-of-custody, and store digital evidence securely for legal needs.',          tags:['Chain of Custody','Legal']},
      {icon:'compliance_m',name:'Regulatory Notification',     desc:'Auto-generate NCA and SAMA breach notifications within mandated reporting deadlines.',    tags:['NCA','SAMA','Deadlines']},
      {icon:'assessment',  name:'Post-Incident Review',        desc:'Structured lessons learned and root cause analysis workflows for continuous improvement.', tags:['Root Cause','Lessons Learned']},
      {icon:'dashboard_m', name:'Metrics & Reporting',         desc:'Track MTTD, MTTR, and incident volume trends with executive dashboards and reports.',     tags:['MTTD','MTTR','Trends']}
    ]}
  };

  function renderModules(key) {
    var mTitle    = document.getElementById('modulesTitle');
    var mSubtitle = document.getElementById('modulesSubtitle');
    var mList     = document.getElementById('modulesList');
    if (!mTitle || !mList) return;

    var mData = MODULES_DATA[key];
    if (!mData) return;

    mTitle.textContent    = mData.title;
    mSubtitle.textContent = mData.subtitle;
    mList.innerHTML       = '';

    mData.modules.forEach(function(m, i){
      var row = document.createElement('div');
      row.className = 'module-row';
      var num = (i + 1) < 10 ? '0' + (i + 1) : '' + (i + 1);
      var tagsHtml = m.tags.map(function(t){ return '<span class="module-tag">' + t + '</span>'; }).join('');
      row.innerHTML =
        '<div class="module-left">' +
          '<span class="module-num">' + num + '</span>' +
          '<div class="module-icon-wrap">' + (MICONS[m.icon] || '') + '</div>' +
          '<div class="module-text">' +
            '<h3 class="module-name">' + m.name + '</h3>' +
            '<p class="module-desc">'  + m.desc + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="module-tags">' + tagsHtml + '</div>';
      mList.appendChild(row);
    });
  }

  /* ---------------- Product Suite carousel ---------------- */
  var icons = {
    cyber:      '<img src="assets/Container.png"        width="70" height="70" alt="CyberMode"      style="display:block;object-fit:contain;" />',
    governance: '<img src="assets/Vector.png"           width="70" height="70" alt="GovernanceMode" style="display:block;object-fit:contain;" />',
    intel:      '<img src="assets/intelmode.png"      width="70" height="70" alt="IntelMode"      style="display:block" />',
    risk:       '<img src="assets/datamode.png"       width="70" height="70" alt="RiskMode"       style="display:block" />',
    audit:      '<img src="assets/itmode.png"      width="70" height="70" alt="AuditMode"      style="display:block" />',
    vendor:     '<img src="assets/gavermode.png"     width="70" height="70" alt="VendorMode"     style="display:block" />',
    incident:   '<img src="assets/transmode.png"   width="70" height="70" alt="IncidentMode"   style="display:block" />'
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
  var panelIcon  = document.getElementById('panelIcon');
  var panelTitle = document.getElementById('panelTitle');
  var panelDesc  = document.getElementById('panelDesc');
  var panelLink  = document.getElementById('panelLink');
  var pagerLabel = document.getElementById('pagerLabel');
  var panelWatermarkText = document.getElementById('panelWatermarkText');

  function pad(n){ return n < 10 ? '0' + n : '' + n; }

  function buildTabs(){
    products.forEach(function(p, i){
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tab-icon flex h-[52px] w-[52px] sm:h-[68px] sm:w-[68px] items-center justify-center rounded-2xl border border-borderc2 bg-white shadow-[0_0_20px_rgba(62,33,118,0.15)] transition-shadow [&>img]:h-[28px] [&>img]:w-[28px] sm:[&>img]:h-[38px] sm:[&>img]:w-[38px]';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', i === current ? 'true' : 'false');
      btn.setAttribute('aria-label', p.name);
      btn.setAttribute('data-reveal', 'up-sm');
      btn.setAttribute('data-delay', 130 + i * 60);
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
    panelDesc.textContent  = p.desc;
    pagerLabel.textContent = pad(current + 1) + ' / ' + pad(products.length);
    if (panelWatermarkText) {
      panelWatermarkText.textContent = p.name;
      panelWatermarkText.style.animation = 'none';
      void panelWatermarkText.offsetWidth; /* restart shine + pop animation */
      panelWatermarkText.style.animation = '';
    }
    if (panelLink) panelLink.href = 'product.html?id=' + p.key;

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

  /* ---------------- Scroll reveal ---------------- */
  if ('IntersectionObserver' in window) {
    var revealEls = document.querySelectorAll('[data-reveal]');
    var revealObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        var el    = entry.target;
        var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
        setTimeout(function() { el.classList.add('revealed'); }, delay);
        revealObs.unobserve(el);
      });
    }, { threshold: 0.13, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function(el) { revealObs.observe(el); });
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
