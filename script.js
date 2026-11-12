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

  /* ---------- Hero name: per-character reveal ---------- */
  const heroName = $('#hero-name');
  if (heroName && !prefersReducedMotion) {
    const words = heroName.textContent.trim().split(/\s+/);
    let i = 0;
    heroName.textContent = '';
    words.forEach((word, wi) => {
      const wordEl = document.createElement('span');
      wordEl.className = 'hero-word';
      for (const ch of word) {
        const charEl = document.createElement('span');
        charEl.className = 'hero-char';
        charEl.style.setProperty('--i', String(i++));
        charEl.textContent = ch;
        wordEl.appendChild(charEl);
      }
      heroName.appendChild(wordEl);
      if (wi < words.length - 1) {
        heroName.appendChild(document.createTextNode(' '));
        i++;
      }
    });
  }

  /* ---------- Certification rows ---------- */
  /* Transforms on table cells are unreliable across engines, so each cell's
     content is wrapped in a span that can be animated on its own. */
  $$('.certs-table tbody tr').forEach((row, index) => {
    row.style.setProperty('--row-i', String(index));
    $$('td', row).forEach((cell) => {
      const wrap = document.createElement('span');
      wrap.className = 'cert-cell';
      while (cell.firstChild) wrap.appendChild(cell.firstChild);
      cell.appendChild(wrap);
    });
  });

  /* ---------- Scroll reveal ---------- */
  const revealTargets = $$(
    '.section-title, .section-sub, .about-lead, .about-text p, .detail-card, .skill-card, ' +
    '.timeline-item, .project-tab, .brief-tab, .edu-row, .achievement-card, ' +
    '.contact-item, .contact-form, .stat-item, .certs-table tbody tr'
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

  /* ---------- Scroll-linked motion (GSAP ScrollTrigger) ---------- */
  const hasGsap = typeof gsap !== 'undefined';
  const hasScrollTrigger = hasGsap && typeof ScrollTrigger !== 'undefined';
  if (hasScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* The hero photo drifts against the page instead of scrolling flat with it. */
  if (hasScrollTrigger && !prefersReducedMotion) {
    gsap.to('.hero-visual', {
      y: -46,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  /* The experience timeline grows a crimson spine as it scrolls past. */
  const timeline = $('.timeline');
  if (timeline) {
    const timelineItems = $$('.timeline-item', timeline);
    if (hasScrollTrigger && !prefersReducedMotion) {
      const spine = { p: 0 };
      gsap.to(spine, {
        p: 1,
        ease: 'none',
        scrollTrigger: { trigger: timeline, start: 'top 72%', end: 'bottom 72%', scrub: 0.4 },
        onUpdate: () => timeline.style.setProperty('--spine', spine.p.toFixed(4)),
      });
      timelineItems.forEach((item) => {
        ScrollTrigger.create({
          trigger: item,
          start: 'top 72%',
          onEnter: () => item.classList.add('is-reached'),
          onLeaveBack: () => item.classList.remove('is-reached'),
        });
      });
    } else {
      timeline.style.setProperty('--spine', '1');
      timelineItems.forEach((item) => item.classList.add('is-reached'));
    }
  }

  /* ---------- Timeline sub-entry (collapsible) ---------- */
  $$('.timeline-sub-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
    });
  });

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

  /* ---------- Key-metric count-up ---------- */
  /* Only a number that actually reads as a figure is counted: it has to start
     the string (or follow a '<', '~' …) and be followed by a unit or the end
     of the string. That keeps "Improved F1-score" and "BLEU-4: 0.32" intact. */
  function countUpMetric(panel) {
    if (!panel || prefersReducedMotion) return;
    const metric = $$('.project-meta-item', panel).find(
      (item) => item.querySelector('dt')?.textContent.trim() === 'Key Metric'
    );
    const value = metric?.querySelector('dd');
    if (!value) return;

    const text = value.textContent;
    const match = text.match(/(^|[^A-Za-z0-9-])(\d+(?:\.\d+)?)(%|ms\b|sec\b|s\b|$)/);
    if (!match) return;

    const start = match.index + match[1].length;
    const target = parseFloat(match[2]);
    const decimals = (match[2].split('.')[1] || '').length;
    if (!isFinite(target)) return;

    const prefix = text.slice(0, start);
    const suffix = text.slice(start + match[2].length);
    const duration = 900;
    const t0 = performance.now();

    const step = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const n = target * eased;
      value.textContent = prefix + (decimals ? n.toFixed(decimals) : Math.round(n)) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else value.textContent = text;
    };
    requestAnimationFrame(step);
  }

  /* ---------- Master–detail (research projects + deep dives) ---------- */
  function createMasterDetail(rootSel, tabSel) {
    const root = $(rootSel);
    const tabs = root ? $$(tabSel, root) : [];
    const detail = root ? root.querySelector('.projects-detail, .briefs-detail') : null;
    let openTab = null;

    /* ----- Title box → card flow -----
       The band that flows out of the open title box has to reach its card
       exactly, and the gap between the two changes while the grid animates.
       So measure it every frame and hand the width to CSS. */
    const NECK_MAX = 64; // widest gap we will draw a band across
    let neckRaf = 0;
    let neckUntil = 0;

    function measureNeck() {
      if (!openTab) return;
      const panel = document.getElementById(openTab.dataset.panel);
      if (!panel || panel.hidden) return;

      const t = openTab.getBoundingClientRect();
      const p = panel.getBoundingClientRect();
      // The card sits either to the right or to the left of the title box.
      const gap = Math.max(p.left - t.right, t.left - p.right);
      openTab.style.setProperty('--neck-w', `${Math.max(0, Math.min(gap, NECK_MAX))}px`);
      // Only show the band once the card is close enough to read as connected.
      openTab.style.setProperty('--neck-on', gap > 0 && gap <= NECK_MAX ? '1' : '0');
    }

    function neckTick() {
      measureNeck();
      if (performance.now() < neckUntil) {
        neckRaf = requestAnimationFrame(neckTick);
      } else {
        neckRaf = 0;
      }
    }

    // Re-measure for a while: the grid columns and list slide animate.
    function startNeck(ms = 900) {
      neckUntil = performance.now() + ms;
      if (!neckRaf) neckRaf = requestAnimationFrame(neckTick);
    }

    function clearNeck() {
      tabs.forEach((t) => {
        t.style.removeProperty('--neck-w');
        t.style.removeProperty('--neck-on');
      });
    }

    // Direction of travel between two tabs: 'down' when the incoming title
    // sits below the outgoing one, 'up' when it sits above.
    function travelDirection(fromTab, toTab) {
      const a = fromTab.getBoundingClientRect();
      const b = toTab.getBoundingClientRect();
      if (Math.abs(b.top - a.top) > 8) return b.top > a.top ? 'down' : 'up';
      return tabs.indexOf(toTab) > tabs.indexOf(fromTab) ? 'down' : 'up';
    }

    let swapping = false;
    let queuedTab = null;

    // Page turn: the outgoing card slides out and the incoming one slides
    // in from the opposite edge, following the direction of travel.
    function swapTo(tab, panel) {
      if (swapping) { queuedTab = tab; return; }
      swapping = true;

      const from = openTab;
      const old = document.getElementById(from.dataset.panel);
      const down = travelDirection(from, tab) === 'down';
      const shift = 56;

      tabs.forEach((t) => t.setAttribute('aria-expanded', String(t === tab)));
      openTab = tab;

      panel.hidden = false;
      clearNeck();
      startNeck(900);
      countUpMetric(panel);

      if (typeof gsap === 'undefined') {
        old.hidden = true;
        swapping = false;
        return;
      }

      const oldH = old.offsetHeight;
      const newH = panel.offsetHeight;

      // Float both cards over each other so they overlap during the turn.
      gsap.set([old, panel], { position: 'absolute', top: 0, left: 0, width: '100%' });
      gsap.set(detail, { height: oldH });

      gsap.timeline({
        onComplete() {
          gsap.set([old, panel], { clearProps: 'all' });
          gsap.set(detail, { height: 'auto' });
          old.hidden = true;
          swapping = false;

          if (queuedTab && queuedTab !== openTab) {
            const next = queuedTab;
            queuedTab = null;
            swapTo(next, document.getElementById(next.dataset.panel));
          }
        },
      })
        .to(old, { opacity: 0, y: down ? -shift : shift, duration: 0.42, ease: 'power2.inOut' }, 0)
        .fromTo(
          panel,
          { opacity: 0, y: down ? shift : -shift },
          { opacity: 1, y: 0, duration: 0.42, ease: 'power2.out' },
          0.08
        )
        .to(detail, { height: newH, duration: 0.45, ease: 'power2.inOut' }, 0);
    }

    function setOpen(tab) {
      const panel = tab ? document.getElementById(tab.dataset.panel) : null;
      const wasOpen = !!tab && tab.getAttribute('aria-expanded') === 'true';

      if (!panel || wasOpen) {
        tabs.forEach((t) => t.setAttribute('aria-expanded', 'false'));
        tabs.forEach((t) => {
          const p = document.getElementById(t.dataset.panel);
          if (p) p.hidden = true;
        });
        root?.classList.remove('is-open');
        openTab = null;
        clearNeck();
        return;
      }

      // A card is already showing — tumble to the new one instead of swapping.
      if (openTab && openTab !== tab && detail && !prefersReducedMotion) {
        swapTo(tab, panel);
        return;
      }

      tabs.forEach((t) => t.setAttribute('aria-expanded', 'false'));
      tabs.forEach((t) => {
        const p = document.getElementById(t.dataset.panel);
        if (p) p.hidden = true;
      });

      panel.hidden = false;
      tab.setAttribute('aria-expanded', 'true');
      root?.classList.add('is-open');
      openTab = tab;
      startNeck(900);
      countUpMetric(panel);

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

    window.addEventListener('resize', () => {
      if (openTab) startNeck(200);
    });

    return { setOpen, close: () => setOpen(openTab) };
  }

  const masterDetails = [
    createMasterDetail('#projects', '.project-tab'),
    createMasterDetail('#briefs', '.brief-tab'),
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
    formStatus.className = 'form-status';
    void formStatus.offsetHeight; // let the fade-out land before the fade-in
    formStatus.className = `form-status ${type} show`;
  }

  function markInvalid(input) {
    const group = input?.closest('.form-group');
    if (!group) return;
    group.classList.add('is-invalid');
    input.setAttribute('aria-invalid', 'true');
    input.focus();
    setTimeout(() => {
      group.classList.remove('is-invalid');
      input.removeAttribute('aria-invalid');
    }, 900);
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
        if (!name) markInvalid($('#from_name'));
        else if (!email) markInvalid($('#reply_to'));
        else markInvalid($('#message'));
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showStatus('error', 'Please enter a valid email address.');
        markInvalid($('#reply_to'));
        return;
      }

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const label = submitBtn?.querySelector('.btn-text');
      if (label) label.textContent = 'Sending…';
      submitBtn?.setAttribute('disabled', '');
      submitBtn?.classList.add('is-sending');

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
        submitBtn?.classList.remove('is-sending');
      }
    });
  }
})();
