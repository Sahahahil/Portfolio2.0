/* ============================================================
   SAHIL DUWAL — PORTFOLIO SCRIPT
   ============================================================ */

(function () {
    'use strict';

    /* ---- Theme Management ---- */
    const htmlEl = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');
    const stored = localStorage.getItem('portfolio-theme');

    if (stored) {
        htmlEl.setAttribute('data-theme', stored);
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        htmlEl.setAttribute('data-theme', 'light');
    }

    themeToggle?.addEventListener('click', () => {
        const current = htmlEl.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        htmlEl.setAttribute('data-theme', next);
        localStorage.setItem('portfolio-theme', next);
    });

    /* ---- Custom Cursor ---- */
    const enableCustomCursor = true;
    const cursor = enableCustomCursor ? document.getElementById('cursor') : null;
    const follower = enableCustomCursor ? document.getElementById('cursor-follower') : null;
    if (!enableCustomCursor) {
        document.getElementById('cursor')?.setAttribute('hidden', 'hidden');
        document.getElementById('cursor-follower')?.setAttribute('hidden', 'hidden');
    }
    const progressFill = document.getElementById('progress-fill');
    const railDots = document.querySelectorAll('.rail-dot');
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;
    let mouseFrame = null;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const isSmallScreen = window.matchMedia('(max-width: 1024px)').matches;
    const enableHeavyFx = !prefersReducedMotion && !isCoarsePointer && !isSmallScreen;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!enableHeavyFx) return;
        if (mouseFrame === null) {
            mouseFrame = requestAnimationFrame(() => {
                document.body.style.setProperty('--mx', mouseX + 'px');
                document.body.style.setProperty('--my', mouseY + 'px');
                if (cursor) {
                    cursor.style.left = mouseX + 'px';
                    cursor.style.top = mouseY + 'px';
                }
                mouseFrame = null;
            });
        }
    });

    function animateCursor() {
        if (prefersReducedMotion || !follower) return;
        if (follower) {
            followerX += (mouseX - followerX) * 0.1;
            followerY += (mouseY - followerY) * 0.1;
            follower.style.left = followerX + 'px';
            follower.style.top = followerY + 'px';
        }
        requestAnimationFrame(animateCursor);
    }
    if (follower) {
        animateCursor();
    }

    if (enableCustomCursor) {
        document.querySelectorAll('a, button, [role="button"]').forEach(el => {
            el.addEventListener('mouseenter', () => {
                if (cursor) { cursor.style.width = '16px'; cursor.style.height = '16px'; }
                if (follower) { follower.style.width = '48px'; follower.style.height = '48px'; }
            });
            el.addEventListener('mouseleave', () => {
                if (cursor) { cursor.style.width = '8px'; cursor.style.height = '8px'; }
                if (follower) { follower.style.width = '32px'; follower.style.height = '32px'; }
            });
        });
    }

    /* ---- Magnetic buttons ---- */
    if (enableHeavyFx) {
        document.querySelectorAll('.btn-primary, .btn-secondary, .nav-cta').forEach((btn) => {
            btn.classList.add('btn-magnetic');
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const dx = e.clientX - (rect.left + rect.width / 2);
                const dy = e.clientY - (rect.top + rect.height / 2);
                btn.style.transform = `translate(${dx * 0.15}px, ${dy * 0.15}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }

    /* ---- Navbar scroll ---- */
    const navbar = document.getElementById('navbar');
    const scrollThreshold = 60;

    /* ---- Active nav link ---- */
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const heroGlow = document.querySelector('.hero-glow');
    let railRanges = [];
    let scrollRaf = null;

    function recomputeRailRanges() {
        railRanges = Array.from(railDots).map(dot => {
            const id = dot.getAttribute('data-rail-target');
            const section = id ? document.getElementById(id) : null;
            if (!section) return { dot, top: Infinity, bottom: -Infinity };
            const top = section.offsetTop - 140;
            const bottom = top + section.offsetHeight;
            return { dot, top, bottom };
        });
    }

    function highlightActiveSection() {
        let current = '';
        const offset = 200;
        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - offset) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }

    function handleScroll() {
        const scrollY = window.scrollY;
        if (window.scrollY > scrollThreshold) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }
        highlightActiveSection();

        const maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1);
        const progress = (scrollY / maxScroll) * 100;
        if (progressFill) {
            progressFill.style.height = Math.max(0, Math.min(100, progress)) + '%';
        }

        railRanges.forEach(({ dot, top, bottom }) => {
            dot.classList.toggle('active', scrollY >= top && scrollY < bottom);
        });

        if (enableHeavyFx && heroGlow) {
            heroGlow.style.transform = `translateY(${scrollY * 0.12}px)`;
        }
    }
    const onScroll = () => {
        if (scrollRaf !== null) return;
        scrollRaf = requestAnimationFrame(() => {
            handleScroll();
            scrollRaf = null;
        });
    };
    recomputeRailRanges();
    window.addEventListener('resize', recomputeRailRanges, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll();

    /* ---- Smooth scroll for all anchor links ---- */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const id = a.getAttribute('href').slice(1);
            const target = document.getElementById(id);
            if (target) {
                e.preventDefault();
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
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

    // Safety reset for refresh/back-forward cache restores.
    closeMobileMenu();
    projectExpandOverlay?.classList.remove('active');

    hamMenu?.addEventListener('click', () => {
        if (mobileMenu?.classList.contains('active')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });
    mobileClose?.addEventListener('click', closeMobileMenu);
    mobileOverlay?.addEventListener('click', closeMobileMenu);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMobileMenu();
    });

    /* ---- Scroll Reveal ---- */
    // Apply reveal effect to non-hero elements only so hero keeps CSS load-in animation.
    const heroSection = document.getElementById('home');
    const autoPopTargets = document.querySelectorAll([
        'section:not(#home) .section-label',
        'section:not(#home) .section-title',
        'section:not(#home) .section-sub',
        '.about .detail-card',
        '.experience .timeline-item',
        '.education .edu-row',
        '.achievements .achievement-card',
        '.certifications .cert-row',
        '.contact .contact-item',
        '.contact .form-group',
        '.contact .contact-form .btn-primary',
        '.footer .footer-left',
        '.footer .footer-right'
    ].join(', '));

    autoPopTargets.forEach((el) => {
        if (heroSection?.contains(el)) return;
        if (el.closest('.projects-grid.bento-grid .project-card')) return;
        if (
            el.classList.contains('reveal-up') ||
            el.classList.contains('reveal-left') ||
            el.classList.contains('reveal-right') ||
            el.classList.contains('scroll-reveal')
        ) {
            return;
        }
        el.classList.add('auto-pop');
    });

    const allRevealElements = document.querySelectorAll(
        '.reveal-up, .reveal-left, .reveal-right, .auto-pop'
    );
    const revealElements = Array.from(allRevealElements).filter(
        el => !heroSection?.contains(el) && !el.closest('.projects-grid.bento-grid')
    );

    revealElements.forEach((el) => {
        el.classList.add('scroll-reveal');
        const existingDelay = el.style.getPropertyValue('--delay');
        if (existingDelay && !el.style.getPropertyValue('--reveal-delay')) {
            el.style.setProperty('--reveal-delay', existingDelay);
        }

        const sectionId = el.closest('section')?.id;
        if (sectionId === 'education' || sectionId === 'certifications') {
            el.style.setProperty('--reveal-y', '26px');
            el.style.setProperty('--reveal-scale', '0.985');
            el.style.setProperty('--reveal-opacity-duration', '0.55s');
            el.style.setProperty('--reveal-transform-duration', '0.62s');
        } else if (sectionId === 'achievements' || sectionId === 'portfolio') {
            el.style.setProperty('--reveal-y', '50px');
            el.style.setProperty('--reveal-scale', '0.94');
            el.style.setProperty('--reveal-opacity-duration', '0.72s');
            el.style.setProperty('--reveal-transform-duration', '0.82s');
        } else if (sectionId === 'experience' || sectionId === 'skills') {
            el.style.setProperty('--reveal-y', '38px');
            el.style.setProperty('--reveal-scale', '0.965');
            el.style.setProperty('--reveal-opacity-duration', '0.62s');
            el.style.setProperty('--reveal-transform-duration', '0.72s');
        } else if (sectionId === 'about' || sectionId === 'contact') {
            el.style.setProperty('--reveal-y', '34px');
            el.style.setProperty('--reveal-scale', '0.97');
            el.style.setProperty('--reveal-opacity-duration', '0.6s');
            el.style.setProperty('--reveal-transform-duration', '0.7s');
        } else {
            el.style.setProperty('--reveal-y', '30px');
            el.style.setProperty('--reveal-scale', '0.975');
            el.style.setProperty('--reveal-opacity-duration', '0.58s');
            el.style.setProperty('--reveal-transform-duration', '0.68s');
        }
    });

    if (prefersReducedMotion) {
        revealElements.forEach(el => el.classList.add('active'));
    } else {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                } else {
                    entry.target.classList.remove('active');
                }
            });
        }, {
            root: null,
            rootMargin: '0px',
            threshold: 0.15
        });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    /* ---- Staggered reveal for grid children ---- */
    const staggerContainers = document.querySelectorAll([
        '.skills-grid',
        '.projects-grid:not(.bento-grid)',
        '.achievements-grid',
        '.education-list',
        '.certs-grid',
        '.timeline',
        '.about-details',
        '.contact-info',
        '.contact-form'
    ].join(', '));

    staggerContainers.forEach(container => {
        const children = container.querySelectorAll('.reveal-up, .auto-pop');
        children.forEach((child, i) => {
            if (!child.style.getPropertyValue('--delay') && !child.style.getPropertyValue('--reveal-delay')) {
                child.style.setProperty('--reveal-delay', (i * 0.12) + 's');
            }
        });
    });

    /* ---- Skill card edge glow tracking ---- */
    document.querySelectorAll('.skill-card').forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            if (!enableHeavyFx) return;
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--sx', x + '%');
            card.style.setProperty('--sy', y + '%');
        });
    });

    /* ---- Live stack status ticker ---- */
    const liveStackStatus = document.getElementById('live-stack-status');
    const liveStackText = document.getElementById('live-stack-text');
    if (liveStackStatus && !prefersReducedMotion) {
        let ticks = 0;
        setInterval(() => {
            ticks += 1;
            if (liveStackText) {
                liveStackText.textContent = ` synced ${ticks * 5}s ago`;
            }
        }, 5000);
    }

    /* ---- Skeleton + GitHub star fetch ---- */
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

        const repoPath = (() => {
            try {
                const url = new URL(link.href);
                const [owner, repo] = url.pathname.split('/').filter(Boolean);
                return owner && repo ? `${owner}/${repo.replace(/\.git$/, '')}` : null;
            } catch {
                return null;
            }
        })();

        if (!repoPath) {
            starsEl.classList.remove('skeleton');
            starsEl.textContent = 'n/a';
            return;
        }

        const renderStars = (count) => {
            starsEl.classList.remove('skeleton');
            starsEl.textContent = `★ ${count}`;
        };

        if (repoStarsCache.has(repoPath)) {
            renderStars(repoStarsCache.get(repoPath));
            return;
        }

        if (prefersReducedMotion) {
            starsEl.classList.remove('skeleton');
            starsEl.textContent = '★ --';
        } else {
            fetch(`https://api.github.com/repos/${repoPath}`)
                .then((res) => res.ok ? res.json() : null)
                .then((data) => {
                    const stars = data?.stargazers_count;
                    if (typeof stars === 'number') {
                        repoStarsCache.set(repoPath, stars);
                        renderStars(stars);
                    } else {
                        starsEl.classList.remove('skeleton');
                        starsEl.textContent = '★ --';
                    }
                })
                .catch(() => {
                    starsEl.classList.remove('skeleton');
                    starsEl.textContent = '★ --';
                });
        }
    });

    /* ---- Project card smooth morph panel ---- */
    const expandOverlay = document.getElementById('project-expand-overlay');
    const expandBackdrop = document.getElementById('project-expand-backdrop');
    const expandPanel = document.getElementById('project-expand-panel');

    const closeExpandPanel = () => {
        if (!expandOverlay || !expandBackdrop || !expandPanel) return;
        gsap.to([expandPanel, expandBackdrop], {
            opacity: 0,
            duration: 0.25,
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
            const tags = Array.from(card.querySelectorAll('.tag')).map(tag => `<span class="tag">${tag.textContent}</span>`).join('');
            const repo = card.querySelector('.project-link-icon')?.getAttribute('href') || '#';

            expandPanel.innerHTML = `
                <button class="project-expand-close" aria-label="Close">×</button>
                <div class="project-type">${type}</div>
                <h3>${title}</h3>
                <p>${desc}</p>
                <div class="tags">${tags}</div>
                <p style="margin-top:1.2rem;"><a class="btn-secondary" href="${repo}" target="_blank" rel="noopener">Open Repository</a></p>
            `;

            expandOverlay.classList.add('active');
            const panelRect = expandPanel.getBoundingClientRect();
            gsap.set(expandBackdrop, { opacity: 0 });
            gsap.set(expandPanel, {
                transformOrigin: 'top left',
                x: rect.left - panelRect.left,
                y: rect.top - panelRect.top,
                scaleX: rect.width / panelRect.width,
                scaleY: rect.height / panelRect.height,
                opacity: 0.5
            });
            gsap.to(expandBackdrop, { opacity: 1, duration: 0.3 });
            gsap.to(expandPanel, {
                x: 0,
                y: 0,
                scaleX: 1,
                scaleY: 1,
                opacity: 1,
                duration: 0.55,
                ease: 'power3.out'
            });

            expandPanel.querySelector('.project-expand-close')?.addEventListener('click', closeExpandPanel, { once: true });
        });
    });

    expandBackdrop?.addEventListener('click', closeExpandPanel);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeExpandPanel();
        }
    });

    /* ---- Bento Grid reveal (GSAP + ScrollTrigger) ---- */
    const bentoProjectCards = document.querySelectorAll('.projects-grid.bento-grid .project-card');
    if (bentoProjectCards.length) {
        if (prefersReducedMotion || !enableHeavyFx) {
            bentoProjectCards.forEach(card => {
                card.style.opacity = '1';
                card.style.transform = 'none';
            });
        } else if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);

            ScrollTrigger.batch(bentoProjectCards, {
                start: 'top 86%',
                end: 'bottom 20%',
                onEnter: (batch) => {
                    gsap.fromTo(batch, {
                        opacity: 0,
                        y: 48,
                        scale: 0.92,
                        rotateX: -8,
                        transformOrigin: '50% 100%'
                    }, {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        rotateX: 0,
                        duration: 0.85,
                        ease: 'back.out(1.45)',
                        stagger: 0.1,
                        overwrite: 'auto'
                    });
                },
                onEnterBack: (batch) => {
                    gsap.fromTo(batch, {
                        opacity: 0,
                        y: -36,
                        scale: 0.94,
                        rotateX: 6,
                        transformOrigin: '50% 100%'
                    }, {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        rotateX: 0,
                        duration: 0.85,
                        ease: 'back.out(1.45)',
                        stagger: 0.1,
                        overwrite: 'auto'
                    });
                },
                onLeave: (batch) => {
                    gsap.to(batch, {
                        opacity: 0,
                        y: -28,
                        scale: 0.95,
                        rotateX: 4,
                        duration: 0.35,
                        ease: 'power2.in',
                        stagger: 0.05,
                        overwrite: 'auto'
                    });
                },
                onLeaveBack: (batch) => {
                    gsap.to(batch, {
                        opacity: 0,
                        y: 36,
                        scale: 0.94,
                        rotateX: -6,
                        duration: 0.35,
                        ease: 'power2.in',
                        stagger: 0.05,
                        overwrite: 'auto'
                    });
                }
            });
        }
    }

    /* ---- Contact Form (EmailJS) ---- */
    const form = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    // EmailJS Configuration
    const EMAILJS_PUBLIC_KEY = 'W7TeFH4Ha4f7e5QZw'; // From EmailJS Account settings
    const EMAILJS_SERVICE_ID = 'service_1w3me34'; // Gmail service ID from EmailJS
    const EMAILJS_TEMPLATE_ID = 'template_9h7btvk'; // Template ID from EmailJS

    // Initialize EmailJS with public key (using object format for v4)
    (function initEmailJS() {
        if (typeof emailjs !== 'undefined') {
            try {
                emailjs.init({
                    publicKey: EMAILJS_PUBLIC_KEY
                });
                console.log('EmailJS initialized successfully with public key:', EMAILJS_PUBLIC_KEY);
            } catch (err) {
                console.error('EmailJS initialization error:', err);
            }
        } else {
            console.warn('EmailJS library not loaded yet');
        }
    })();

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameInput = form.querySelector('input[name="from_name"]');
        const emailInput = form.querySelector('input[name="reply_to"]');
        const messageInput = form.querySelector('textarea[name="message"]');

        const name = nameInput?.value.trim();
        const email = emailInput?.value.trim();
        const message = messageInput?.value.trim();

        // Validation
        if (!name || !email || !message) {
            showStatus('error', 'Please fill in all fields.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showStatus('error', 'Please enter a valid email address.');
            return;
        }

        const btn = form.querySelector('button[type="submit"]');
        const btnText = btn.querySelector('.btn-text');
        const original = btnText.textContent;

        btn.disabled = true;
        btnText.textContent = 'Sending…';

        try {
            if (typeof emailjs !== 'undefined' && typeof emailjs.send === 'function') {
                // Parameters must match EmailJS template variables exactly
                const templateParams = {
                    title: 'New Contact Form Message',  // for {{title}} in subject
                    name: name,                          // for {{name}} in From Name
                    email: email,                        // for {{email}} in Reply To
                    from_name: name,                     // for {{from_name}} in content
                    reply_to: email,                     // for {{reply_to}} in content
                    message: message                     // for {{message}} in content
                };
                console.log('Sending email with params:', templateParams);
                const response = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
                console.log('Email sent successfully!', response.status, response.text);
                showStatus('success', 'Message sent! I\'ll get back to you soon.');
                form.reset();
            } else {
                console.error('EmailJS library not available');
                showStatus('error', 'Email service unavailable. Please email me directly at sahilduwal@gmail.com');
            }
        } catch (err) {
            console.error('Failed to send email:', err);
            console.error('Error details:', JSON.stringify(err));
            showStatus('error', 'Oops — something went wrong. Try emailing me directly at sahilduwal@gmail.com');
        } finally {
            btn.disabled = false;
            btnText.textContent = original;
        }
    });

    function showStatus(type, message) {
        if (!formStatus) return;
        formStatus.textContent = message;
        formStatus.className = 'form-status ' + type;
        setTimeout(() => {
            formStatus.className = 'form-status';
        }, 5000);
    }

    /* ---- Hover tilt on project cards ---- */
    if (enableHeavyFx) {
        document.querySelectorAll('.project-card, .skill-card, .achievement-card').forEach(card => {
            let tiltFrame = null;
            let pendingX = 0;
            let pendingY = 0;

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                pendingX = e.clientX - rect.left;
                pendingY = e.clientY - rect.top;

                if (tiltFrame !== null) return;
                tiltFrame = requestAnimationFrame(() => {
                    const cx = rect.width / 2;
                    const cy = rect.height / 2;
                    const dx = (pendingX - cx) / cx;
                    const dy = (pendingY - cy) / cy;
                    card.style.transform = `translateY(-4px) perspective(800px) rotateX(${-dy * 2}deg) rotateY(${dx * 2}deg)`;
                    tiltFrame = null;
                });
            });

            card.addEventListener('mouseleave', () => {
                if (tiltFrame !== null) {
                    cancelAnimationFrame(tiltFrame);
                    tiltFrame = null;
                }
                card.style.transform = '';
            });
        });
    }

    /* ---- Number counter animation for stats ---- */
    const statNumbers = document.querySelectorAll('.stat-number');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.textContent);
                const suffix = el.textContent.replace(/[0-9]/g, '');
                let start = 0;
                const duration = 1500;
                const step = 16;
                const increment = target / (duration / step);

                const timer = setInterval(() => {
                    start += increment;
                    if (start >= target) {
                        start = target;
                        clearInterval(timer);
                    }
                    el.textContent = Math.floor(start) + suffix;
                }, step);

                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => counterObserver.observe(el));

    /* ---- Role text transition cleanup ---- */
    // CSS animation handles the role cycling — nothing needed here.

})();