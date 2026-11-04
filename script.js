/* =============================================
   SAHIL DUWAL — PORTFOLIO
   Interactions: loader, theme, cursor, scroll,
   reveal, counters, GitHub stars, research
   master–detail, contact form.
   ============================================= */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Theme ---------- */
  const THEME_KEY = 'portfolio-theme';
  const root = document.documentElement;
  const themeToggle = $('#theme-toggle');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    themeToggle?.setAttribute('aria-pressed', String(theme === 'dark'));
  }

  const storedTheme = (() => {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  })();
  applyTheme(storedTheme || 'dark');

  themeToggle?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* private mode */ }
  });

  /* ---------- Loader ---------- */
  const loader = $('#site-loader');
  if (loader) {
    const hide = () => {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 700);
    };
    window.addEventListener('load', () => setTimeout(hide, 450));
    setTimeout(hide, 2200); // safety net if load never fires
  }

  /* ---------- Custom cursor ---------- */
  const cursor = $('#cursor');
  const cursorFollower = $('#cursor-follower');

  if (cursor && cursorFollower && !prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    let mx = -100, my = -100, fx = -100, fy = -100;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      cursor.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      document.body.classList.add('cursor-active');
    }, { passive: true });

    const tick = () => {
      fx += (mx - fx) * 0.14;
      fy += (my - fy) * 0.14;
      cursorFollower.style.transform = `translate(${fx}px, ${fy}px) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    $$('a, button, .project-tab, .cert-row, .brief-card, .skill-card, .timeline-item').forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  /* ---------- Scroll: progress rail, navbar, active link ---------- */
  const progressFill = $('#progress-fill');
  const navbar = $('#navbar');
  const navLinks = $$('.nav-link');
  const navTargets = navLinks
    .map((link) => ({ link, section: document.querySelector(link.getAttribute('href')) }))
    .filter((entry) => entry.section);

  function onScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (progressFill) {
      progressFill.style.width = docHeight > 0 ? `${(scrollTop / docHeight) * 100}%` : '0%';
    }
    navbar?.classList.toggle('scrolled', scrollTop > 24);

    // Active section
    const offset = scrollTop + window.innerHeight * 0.35;
    let active = null;
    navTargets.forEach(({ link, section }) => {
      if (section.offsetTop <= offset) active = link;
    });
    navLinks.forEach((link) => link.classList.toggle('active', link === active));
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScroll(); ticking = false; });
  }, { passive: true });
  onScroll();

  /* ---------- Smooth scroll ---------- */
  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      history.pushState(null, '', href);
      closeMobileMenu();
    });
  });

  /* ---------- Mobile menu ---------- */
  const hamMenu = $('#ham-menu');
  const mobileMenu = $('#mobile-menu');
  const mobileClose = $('#mobile-close');
  const mobileOverlay = $('#mobile-overlay');

  function openMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.hidden = false;
    void mobileMenu.offsetHeight; // reflow so the transition runs
    mobileMenu.classList.add('active');
    mobileOverlay?.classList.add('active');
    hamMenu?.classList.add('active');
    hamMenu?.setAttribute('aria-expanded', 'true');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('active');
    mobileOverlay?.classList.remove('active');
    hamMenu?.classList.remove('active');
    hamMenu?.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    setTimeout(() => { if (!mobileMenu.classList.contains('active')) mobileMenu.hidden = true; }, 380);
  }

  hamMenu?.addEventListener('click', () => {
    mobileMenu?.classList.contains('active') ? closeMobileMenu() : openMobileMenu();
  });
  mobileClose?.addEventListener('click', closeMobileMenu);
  mobileOverlay?.addEventListener('click', closeMobileMenu);
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeMobileMenu();
    masterDetails.forEach((md) => md.close());
  });

  /* ---------- Role slider ---------- */
  const roles = $$('.role');
  if (roles.length > 1) {
    let index = 0;
    setInterval(() => {
      roles[index].classList.remove('active');
      index = (index + 1) % roles.length;
      roles[index].classList.add('active');
    }, 3200);
  }

  /* ---------- Scroll reveal ---------- */
  const revealTargets = $$(
    '.section-title, .section-sub, .about-lead, .about-text p, .detail-card, .skill-card, ' +
    '.timeline-item, .project-tab, .brief-tab, .edu-row, .achievement-card, ' +
    '.contact-item, .contact-form, .stat-item'
  );

  if (prefersReducedMotion) {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const siblings = el.parentElement ? Array.from(el.parentElement.children) : [];
        const index = Math.max(0, siblings.indexOf(el));
        el.style.transitionDelay = `${Math.min(index * 60, 240)}ms`;
        el.classList.add('is-visible');
        revealObserver.unobserve(el);
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach((el) => {
      el.classList.add('reveal');
      revealObserver.observe(el);
    });
  }

  /* ---------- Stat counters ---------- */
  const counters = $$('.stat-number');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.textContent, 10);
      const suffix = el.textContent.replace(/[0-9]/g, '');
      if (prefersReducedMotion || isNaN(target)) {
        counterObserver.unobserve(el);
        return;
      }
      const duration = 1200;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = `${Math.round(target * eased)}${suffix}`;
        if (p < 1) requestAnimationFrame(step);
        else counterObserver.unobserve(el);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.4 });
  counters.forEach((el) => counterObserver.observe(el));

  /* ---------- Master–detail (research projects + deep dives) ---------- */
  function createMasterDetail(rootSel, tabSel, connectorSel) {
    const root = $(rootSel);
    const tabs = root ? $$(tabSel, root) : [];
    const path = $(connectorSel);
    let openTab = null;

    function draw() {
      if (!root || !path) return;
      if (!openTab) { path.setAttribute('d', ''); return; }
      const panel = document.getElementById(openTab.dataset.panel);
      if (!panel || !panel.offsetWidth) return;

      const base = root.getBoundingClientRect();
      const tab = openTab.getBoundingClientRect();
      const detail = panel.getBoundingClientRect();
      const title = panel.querySelector('.project-panel-title, .brief-title');
      const titleBox = title ? title.getBoundingClientRect() : detail;

      const tabOnLeft = tab.right <= detail.left;
      const x1 = (tabOnLeft ? tab.right : tab.left) - base.left;
      const y1 = tab.top + tab.height / 2 - base.top;
      const x2 = (tabOnLeft ? detail.left : detail.right) - base.left;
      const y2 = titleBox.top + titleBox.height / 2 - base.top;
      const dir = tabOnLeft ? 1 : -1;
      const elbow = 16;
      const bend = Math.max(20, Math.abs(x2 - x1) * 0.4);

      path.setAttribute('d',
        `M ${x1.toFixed(1)} ${y1.toFixed(1)} H ${(x1 + elbow * dir).toFixed(1)} ` +
        `C ${(x1 + elbow * dir + bend * dir).toFixed(1)} ${y1.toFixed(1)}, ` +
        `${(x2 - bend * dir).toFixed(1)} ${y2.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`);
    }

    function animate() {
      if (prefersReducedMotion) { draw(); return; }
      const start = performance.now();
      const step = (now) => {
        draw();
        if (now - start < 700) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    function setOpen(tab) {
      const panel = tab ? document.getElementById(tab.dataset.panel) : null;
      const wasOpen = !!tab && tab.getAttribute('aria-expanded') === 'true';

      tabs.forEach((t) => t.setAttribute('aria-expanded', 'false'));
      tabs.forEach((t) => {
        const p = document.getElementById(t.dataset.panel);
        if (p) p.hidden = true;
      });

      if (!panel || wasOpen) {
        root?.classList.remove('is-open');
        openTab = null;
        path?.setAttribute('d', '');
        return;
      }

      panel.hidden = false;
      tab.setAttribute('aria-expanded', 'true');
      root?.classList.add('is-open');
      openTab = tab;

      requestAnimationFrame(draw);
      animate();

      if (window.matchMedia('(max-width: 1199px)').matches) {
        panel.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      }
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => setOpen(tab));
      tab.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        e.preventDefault();
        const next = (index + (e.key === 'ArrowDown' ? 1 : -1) + tabs.length) % tabs.length;
        tabs[next].focus();
      });
    });

    window.addEventListener('resize', draw);
    return { setOpen, close: () => setOpen(openTab) };
  }

  const masterDetails = [
    createMasterDetail('#projects', '.project-tab', '#projects-connector-path'),
    createMasterDetail('#briefs', '.brief-tab', '#briefs-connector-path'),
  ];

  const projectPanels = $$('.project-panel');

  /* ---------- GitHub stars ---------- */
  projectPanels.forEach((panel) => {
    const link = panel.querySelector('.project-link-inline');
    const typeRow = panel.querySelector('.project-panel-type');
    if (!link || !typeRow) return;

    const stars = document.createElement('span');
    stars.className = 'project-stars skeleton';
    stars.textContent = '· · ·';
    typeRow.appendChild(stars);

    const match = (link.getAttribute('href') || '').match(/github\.com\/([^/]+\/[^/]+)/);
    const repo = match ? match[1].replace(/\.git$/, '') : '';
    if (!repo) { stars.remove(); return; }

    fetch(`https://api.github.com/repos/${repo}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('request failed'))))
      .then((data) => {
        stars.classList.remove('skeleton');
        stars.textContent = `★ ${data.stargazers_count ?? 0}`;
      })
      .catch(() => stars.remove());
  });

  /* ---------- Contact form (EmailJS) ---------- */
  const contactForm = $('#contact-form');
  const formStatus = $('#form-status');

  function showStatus(type, message) {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.className = `form-status ${type}`;
  }

  if (contactForm) {
    if (typeof emailjs !== 'undefined') {
      emailjs.init({ publicKey: 'W7TeFH4Ha4f7e5QZw' });
    }

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = $('#from_name').value.trim();
      const email = $('#reply_to').value.trim();
      const message = $('#message').value.trim();

      if (!name || !email || !message) {
        showStatus('error', 'Please fill in all fields.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showStatus('error', 'Please enter a valid email address.');
        return;
      }

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const label = submitBtn?.querySelector('.btn-text');
      if (label) label.textContent = 'Sending…';
      submitBtn?.setAttribute('disabled', '');

      try {
        if (typeof emailjs === 'undefined' || typeof emailjs.send !== 'function') {
          throw new Error('Email service unavailable');
        }
        await emailjs.send('service_1w3me34', 'template_9h7btvk', {
          from_name: name,
          reply_to: email,
          message
        });
        contactForm.reset();
        showStatus('success', "Message sent! I'll get back to you soon.");
      } catch (err) {
        showStatus('error', 'Something went wrong. Email me at sahilduwal@gmail.com');
      } finally {
        if (label) label.textContent = 'Send Message';
        submitBtn?.removeAttribute('disabled');
      }
    });
  }
})();
