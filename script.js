/* ============================================================
   SAHIL DUWAL — PORTFOLIO SCRIPT
   ============================================================ */

(function () {
    'use strict';

    /* ---- Home Loader (every refresh/visit) ---- */
    const siteLoader = document.getElementById('site-loader');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const loaderDisplayMs = 1200;

    const dismissLoader = (animate = true) => {
        if (!siteLoader || siteLoader.hasAttribute('hidden')) return;
        if (!animate) {
            siteLoader.setAttribute('hidden', 'hidden');
            document.body.classList.remove('is-loading');
            return;
        }

        siteLoader.classList.add('is-exiting');
        const finalize = () => {
            siteLoader.setAttribute('hidden', 'hidden');
            siteLoader.classList.remove('is-exiting');
            document.body.classList.remove('is-loading');
        };

        siteLoader.addEventListener('animationend', finalize, { once: true });
        window.setTimeout(finalize, 800);
    };

    if (siteLoader) {
        document.body.classList.add('is-loading');
        const runIntro = () => {
            window.setTimeout(() => {
                dismissLoader(!prefersReducedMotion);
            }, loaderDisplayMs);
        };

        if (document.readyState === 'complete') {
            runIntro();
        } else {
            window.addEventListener('load', runIntro, { once: true });
        }
    }

    /* ---- Theme Management ---- */
    const htmlEl = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');
    const stored = localStorage.getItem('portfolio-theme');

    function syncThemeToggle(theme) {
        if (!themeToggle) return;
        themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
        themeToggle.setAttribute('title', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }

    htmlEl.setAttribute('data-theme', stored || 'dark');
    syncThemeToggle(htmlEl.getAttribute('data-theme') || 'dark');

    themeToggle?.addEventListener('click', () => {
        const next = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        htmlEl.setAttribute('data-theme', next);
        localStorage.setItem('portfolio-theme', next);
        syncThemeToggle(next);
    });

    /* ---- Icon animation ---- */
    const animatedIconSelectors = [
        '.theme-icon',
        '.social-link svg',
        '.contact-item-icon svg',
        '.detail-icon',
        '.badge-icon',
        '.project-link-icon',
        '.contact-arrow',
        '.mobile-close',
        '.logo-initials'
    ];

    document.querySelectorAll(animatedIconSelectors.join(', ')).forEach((icon, index) => {
        icon.classList.add('icon-animated');
        icon.style.setProperty('--icon-order', String(index % 14));
    });

    /* ---- Cursor: hidden by default ---- */
    document.getElementById('cursor')?.setAttribute('hidden', '');
    document.getElementById('cursor-follower')?.setAttribute('hidden', '');

    /* ---- Scroll tracking ---- */
    const progressFill = document.getElementById('progress-fill');

    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const enableHeavyFx = !prefersReducedMotion && !isCoarsePointer && window.matchMedia('(max-width: 1024px)').matches;

    let mouseX = 0, mouseY = 0;
    let mxRaf = null;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!enableHeavyFx) return;
        if (mxRaf !== null) return;
        mxRaf = requestAnimationFrame(() => {
            document.body.style.setProperty('--mx', mouseX + 'px');
            document.body.style.setProperty('--my', mouseY + 'px');
            mxRaf = null;
        });
    });

    /* ---- Magnetic buttons ---- */
    if (enableHeavyFx) {
        document.querySelectorAll('.btn-primary, .btn-secondary, .nav-cta').forEach((btn) => {
            btn.classList.add('btn-magnetic');
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const dx = e.clientX - (rect.left + rect.width / 2);
                const dy = e.clientY - (rect.top + rect.height / 2);
                btn.style.transform = `translate(${dx * 0.06}px, ${dy * 0.06}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }

    /* ---- Navbar scroll ---- */
    const navbar = document.getElementById('navbar');
    const scrollThreshold = 60;
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const heroGlow = document.querySelector('.hero-glow');
    let scrollRaf = null;

    function highlightActiveSection() {
        let current = '';
        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 200) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });
    }

    function handleScroll() {
        navbar?.classList.toggle('scrolled', window.scrollY > scrollThreshold);
        highlightActiveSection();

        const maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1);
        if (progressFill) {
            progressFill.style.height = (window.scrollY / maxScroll * 100) + '%';
        }

        if (enableHeavyFx && heroGlow) {
            heroGlow.style.transform = `translateY(${window.scrollY * 0.12}px)`;
        }
    }

    window.addEventListener('scroll', () => {
        if (scrollRaf !== null) return;
        scrollRaf = requestAnimationFrame(() => {
            handleScroll();
            scrollRaf = null;
        });
    }, { passive: true });

    handleScroll();

    /* ---- Smooth scroll for all anchor links ---- */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const id = a.getAttribute('href').slice(1);
            const target = document.getElementById(id);
            if (target) {
                e.preventDefault();
                const top = target.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
                closeMobileMenu();
            }
        });
    });

    /* ---- Mobile Menu ---- */
    const hamMenu = document.getElementById('ham-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileClose = document.getElementById('mobile-close');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const projectExpandOverlay = document.getElementById('project-expand-overlay');

    function openMobileMenu() {
        mobileMenu?.classList.add('active');
        mobileOverlay?.classList.add('active');
        hamMenu?.classList.add('active');
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        mobileMenu?.classList.remove('active');
        mobileOverlay?.classList.remove('active');
        hamMenu?.classList.remove('active');
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
    }

    closeMobileMenu();
    projectExpandOverlay?.classList.remove('active');

    hamMenu?.addEventListener('click', () => {
        mobileMenu?.classList.contains('active') ? closeMobileMenu() : openMobileMenu();
    });
    mobileClose?.addEventListener('click', closeMobileMenu);
    mobileOverlay?.addEventListener('click', closeMobileMenu);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMobileMenu(); });

    /* ---- Scroll Reveal — Directional Awareness ---- */
    const autoPopSelectors = [
        'section .section-label', 'section .section-title', 'section .section-sub',
        '.about .detail-card', '.experience .timeline-item', '.education .edu-row',
        '.achievements .achievement-card', '.certifications .cert-row',
        '.contact .contact-item', '.contact .form-group',
        '.contact .contact-form .btn-primary', '.footer .footer-left', '.footer .footer-right'
    ].join(', ');

    document.querySelectorAll(autoPopSelectors).forEach(el => {
        if (!el.closest('.projects-grid.bento-grid .project-card') &&
            !el.classList.contains('reveal-up') && !el.classList.contains('reveal-left') &&
            !el.classList.contains('reveal-right') && !el.classList.contains('scroll-reveal')) {
            el.classList.add('auto-pop');
        }
    });

    const revealElements = Array.from(document.querySelectorAll(
        '.reveal-up, .reveal-left, .reveal-right, .auto-pop'
    ));

    // Assign initial animation direction class
    revealElements.forEach((el) => {
        el.classList.add('scroll-reveal');
        if (el.classList.contains('reveal-right')) {
            el.classList.add('from-right');
        } else if (el.classList.contains('reveal-up')) {
            el.classList.add('from-bottom');
        } else {
            el.classList.add('from-left'); // default for .auto-pop
        }
    });

    // Track scroll direction (debounced)
    let lastScrollY = 0;
    let scrollDir = 'down';
    let rafPending = false;

    function updateScrollDir() {
        scrollDir = window.scrollY > lastScrollY ? 'down' : 'up';
        lastScrollY = window.scrollY;
        rafPending = false;
    }

    window.addEventListener('scroll', () => {
        if (!rafPending) {
            rafPending = true;
            requestAnimationFrame(updateScrollDir);
        }
    }, { passive: true });

    if (!prefersReducedMotion) {
        // Fire immediately for elements already visible on page load — no animation
        // since they're already in view. Mark them visible immediately.
        revealElements.forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.top < window.innerHeight && r.bottom > 0) {
                el.classList.add('is-visible');
            }
        });

        // Observer: direction is set when element FIRST enters viewport
        // Down scroll → animate from left. Up scroll → animate from right.
        // Once direction is set it stays (no re-triggering per scroll direction).
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const el = entry.target;
                if (entry.isIntersecting) {
                    el.classList.remove('from-left', 'from-right', 'from-bottom');
                    el.classList.add(scrollDir === 'down' ? 'from-left' : 'from-right');
                    el.classList.add('is-visible');
                } else {
                    el.classList.remove('is-visible');
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealElements.forEach(el => observer.observe(el));
    } else {
        // Reduced motion: show all immediately, no animation
        revealElements.forEach(el => {
            el.classList.add('is-visible');
            el.classList.add('from-left');
        });
    }

    /* ---- Stagger delays for grid containers ---- */
    const staggerContainers = document.querySelectorAll([
        '.skills-grid', '.projects-grid.bento-grid', '.achievements-grid',
        '.education-list', '.certs-grid', '.timeline',
        '.about-details', '.contact-info', '.contact-form'
    ].join(', '));

    staggerContainers.forEach(container => {
        container.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .auto-pop').forEach((child, i) => {
            child.style.setProperty('--reveal-delay', (i * 0.08) + 's');
        });
    });

    /* ---- Skill card edge glow ---- */
    document.querySelectorAll('.skill-card').forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            if (!enableHeavyFx) return;
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--sx', ((e.clientX - rect.left) / rect.width * 100) + '%');
            card.style.setProperty('--sy', ((e.clientY - rect.top) / rect.height * 100) + '%');
        });
    });

    /* ---- GitHub stars + CTA row ---- */
    const projectCards = document.querySelectorAll('.project-card');
    const repoStarsCache = new Map();

    projectCards.forEach((card) => {
        const header = card.querySelector('.project-header');
        const link = card.querySelector('.project-link-icon[href*="github.com"]');
        if (!header || !link) return;

        const starsEl = document.createElement('span');
        starsEl.className = 'project-stars skeleton';
        starsEl.textContent = '...';
        header.insertBefore(starsEl, link);

        let repoPath;
        try {
            const [owner, repo] = new URL(link.href).pathname.split('/').filter(Boolean);
            repoPath = owner && repo ? `${owner}/${repo.replace(/\.git$/, '')}` : null;
        } catch { repoPath = null; }

        if (!repoPath) { starsEl.classList.remove('skeleton'); starsEl.textContent = 'n/a'; return; }

        const renderStars = (count) => {
            starsEl.classList.remove('skeleton');
            starsEl.textContent = `★ ${count}`;
        };

        if (repoStarsCache.has(repoPath)) { renderStars(repoStarsCache.get(repoPath)); return; }

        if (prefersReducedMotion) {
            starsEl.classList.remove('skeleton'); starsEl.textContent = '★ --';
        } else {
            fetch(`https://api.github.com/repos/${repoPath}`)
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (typeof data?.stargazers_count === 'number') {
                        repoStarsCache.set(repoPath, data.stargazers_count);
                        renderStars(data.stargazers_count);
                    } else { starsEl.classList.remove('skeleton'); starsEl.textContent = '★ --'; }
                })
                .catch(() => { starsEl.classList.remove('skeleton'); starsEl.textContent = '★ --'; });
        }

        if (!card.querySelector('.project-cta-row')) {
            const ctaRow = document.createElement('div');
            ctaRow.className = 'project-cta-row';
            ctaRow.innerHTML = `
                <span class="project-cta-chip">Project Snapshot</span>
                <a class="project-cta-link" href="${link.href}" target="_blank" rel="noopener">View Repository</a>`;
            card.appendChild(ctaRow);
        }
    });

    /* ---- Project expand panel (GSAP) ---- */
    const expandOverlay = document.getElementById('project-expand-overlay');
    const expandBackdrop = document.getElementById('project-expand-backdrop');
    const expandPanel = document.getElementById('project-expand-panel');

    const closeExpandPanel = () => {
        if (!expandOverlay || !expandBackdrop || !expandPanel) return;
        gsap.to([expandPanel, expandBackdrop], {
            opacity: 0, duration: 0.25,
            onComplete: () => {
                expandOverlay.classList.remove('active');
                expandPanel.innerHTML = '';
                expandPanel.style.removeProperty('opacity');
                expandBackdrop.style.removeProperty('opacity');
            }
        });
    };

    projectCards.forEach((card) => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('a, button')) return;
            if (!expandOverlay || !expandBackdrop || !expandPanel || typeof gsap === 'undefined' || prefersReducedMotion) return;

            const rect = card.getBoundingClientRect();
            const title = card.querySelector('h3')?.textContent || 'Project';
            const type = card.querySelector('.project-type')?.textContent || '';
            const desc = card.querySelector('p')?.textContent || '';
            const tags = Array.from(card.querySelectorAll('.tag')).map(t => `<span class="tag">${t.textContent}</span>`).join('');
            const repo = card.querySelector('.project-link-icon')?.getAttribute('href') || '#';

            expandPanel.innerHTML = `
                <button class="project-expand-close" aria-label="Close">×</button>
                <div class="project-type">${type}</div>
                <h3>${title}</h3>
                <p>${desc}</p>
                <div class="tags">${tags}</div>
                <p style="margin-top:1.2rem;"><a class="btn-secondary" href="${repo}" target="_blank" rel="noopener">Open Repository</a></p>`;

            expandOverlay.classList.add('active');
            const panelRect = expandPanel.getBoundingClientRect();
            gsap.set(expandBackdrop, { opacity: 0 });
            gsap.set(expandPanel, {
                transformOrigin: 'top left',
                x: rect.left - panelRect.left, y: rect.top - panelRect.top,
                scaleX: rect.width / panelRect.width, scaleY: rect.height / panelRect.height,
                opacity: 0.5
            });
            gsap.to(expandBackdrop, { opacity: 1, duration: 0.3 });
            gsap.to(expandPanel, {
                x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1,
                duration: 0.55, ease: 'power3.out'
            });

            expandPanel.querySelector('.project-expand-close')?.addEventListener('click', closeExpandPanel, { once: true });
        });
    });

    expandBackdrop?.addEventListener('click', closeExpandPanel);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeExpandPanel(); });

    /* ---- Contact Form (EmailJS) ---- */
    const form = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (typeof emailjs !== 'undefined') {
        emailjs.init({ publicKey: 'W7TeFH4Ha4f7e5QZw' });
    }

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = form.querySelector('input[name="from_name"]')?.value.trim();
        const email = form.querySelector('input[name="reply_to"]')?.value.trim();
        const message = form.querySelector('textarea[name="message"]')?.value.trim();

        if (!name || !email || !message) { showStatus('error', 'Please fill in all fields.'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showStatus('error', 'Please enter a valid email address.'); return; }

        const btn = form.querySelector('button[type="submit"]');
        const btnText = btn?.querySelector('.btn-text');
        const original = btnText?.textContent;
        if (btn) btn.disabled = true;
        if (btnText) btnText.textContent = 'Sending…';

        try {
            if (typeof emailjs?.send === 'function') {
                await emailjs.send('service_1w3me34', 'template_9h7btvk', {
                    name, email, from_name: name, reply_to: email, message
                });
                showStatus('success', "Message sent! I'll get back to you soon.");
                form.reset();
            } else {
                showStatus('error', 'Email service unavailable. Reach me at sahilduwal@gmail.com');
            }
        } catch {
            showStatus('error', 'Something went wrong. Email me at sahilduwal@gmail.com');
        } finally {
            if (btn) btn.disabled = false;
            if (btnText) btnText.textContent = original || 'Send Message';
        }
    });

    function showStatus(type, message) {
        if (!formStatus) return;
        formStatus.textContent = message;
        formStatus.className = 'form-status ' + type;
        setTimeout(() => { formStatus.className = 'form-status'; }, 5000);
    }

    /* ---- Number counter animation ---- */
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = parseInt(el.textContent);
            const suffix = el.textContent.replace(/[0-9]/g, '');
            let start = 0;
            const increment = target / (1500 / 16);
            const timer = setInterval(() => {
                start += increment;
                el.textContent = Math.floor(start >= target ? target : start) + suffix;
                if (start >= target) { clearInterval(timer); counterObserver.unobserve(el); }
            }, 16);
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-number').forEach(el => counterObserver.observe(el));

    /* ---- View More: Research & Development ---- */
    const viewMoreBtn = document.getElementById('view-more-btn');
    const projectsGrid = document.querySelector('.projects-grid.bento-grid');

    viewMoreBtn?.addEventListener('click', () => {
        const expanded = projectsGrid?.classList.toggle('expanded');
        viewMoreBtn.classList.toggle('expanded', expanded);
        const btnText = viewMoreBtn.querySelector('.btn-text');
        if (btnText) btnText.textContent = expanded ? 'Show Less' : 'View More';
    });

})();
