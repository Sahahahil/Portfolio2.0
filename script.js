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
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (cursor) {
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
        }
    });

    function animateCursor() {
        if (follower) {
            followerX += (mouseX - followerX) * 0.1;
            followerY += (mouseY - followerY) * 0.1;
            follower.style.left = followerX + 'px';
            follower.style.top = followerY + 'px';
        }
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

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

    /* ---- Navbar scroll ---- */
    const navbar = document.getElementById('navbar');
    const scrollThreshold = 60;

    /* ---- Active nav link ---- */
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

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
        if (window.scrollY > scrollThreshold) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }
        highlightActiveSection();
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
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
                window.scrollTo({ top, behavior: 'smooth' });
                closeMobileMenu();
            }
        });
    });

    /* ---- Mobile Menu ---- */
    const hamMenu = document.getElementById('ham-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileClose = document.getElementById('mobile-close');
    const mobileOverlay = document.getElementById('mobile-overlay');

    function openMobileMenu() {
        mobileMenu?.classList.add('active');
        mobileOverlay?.classList.add('active');
        hamMenu?.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        mobileMenu?.classList.remove('active');
        mobileOverlay?.classList.remove('active');
        hamMenu?.classList.remove('active');
        document.body.style.overflow = '';
    }

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
    // Get all reveal elements except those inside the hero (hero uses CSS animations)
    const allRevealElements = document.querySelectorAll(
        '.reveal-up, .reveal-left, .reveal-right'
    );
    const heroSection = document.getElementById('home');
    const revealElements = Array.from(allRevealElements).filter(
        el => !heroSection?.contains(el)
    );

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
    });

    // Observe all non-hero reveal elements
    revealElements.forEach(el => revealObserver.observe(el));

    /* ---- Staggered reveal for grid children ---- */
    const staggerContainers = document.querySelectorAll(
        '.skills-grid, .projects-grid, .achievements-grid'
    );

    staggerContainers.forEach(container => {
        const children = container.querySelectorAll('.reveal-up');
        children.forEach((child, i) => {
            if (!child.style.getPropertyValue('--delay')) {
                child.style.setProperty('--delay', (i * 0.08) + 's');
            }
        });
    });

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

    /* ---- Subtle parallax on hero glow ---- */
    const heroGlow = document.querySelector('.hero-glow');
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                if (heroGlow) {
                    heroGlow.style.transform = `translateY(${window.scrollY * 0.15}px)`;
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    /* ---- Hover tilt on project cards ---- */
    document.querySelectorAll('.project-card, .skill-card, .achievement-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            const dx = (x - cx) / cx;
            const dy = (y - cy) / cy;

            card.style.transform = `translateY(-6px) perspective(800px) rotateX(${-dy * 2.5}deg) rotateY(${dx * 2.5}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

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