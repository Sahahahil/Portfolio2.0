// Portfolio JavaScript - Final Version

document.addEventListener('DOMContentLoaded', function() {
    // Hamburger menu functionality
    const hamMenu = document.querySelector('.ham-menu');
    const offScreenMenu = document.querySelector('.off-screen-menu');
    const menuLinks = document.querySelectorAll('.off-screen-menu a');

    // Theme toggle: persist and respect system preference
    const themeToggleBtn = document.getElementById('theme-toggle');
    const rootEl = document.documentElement;

    function applyTheme(theme) {
        if (theme === 'light') {
            rootEl.setAttribute('data-theme', 'light');
            if (themeToggleBtn) themeToggleBtn.textContent = '☀️';
            if (themeToggleBtn) themeToggleBtn.setAttribute('aria-pressed', 'true');
        } else {
            rootEl.removeAttribute('data-theme');
            if (themeToggleBtn) themeToggleBtn.textContent = '🌙';
            if (themeToggleBtn) themeToggleBtn.setAttribute('aria-pressed', 'false');
        }
    }

    // Resolve initial theme: localStorage -> prefers-color-scheme -> dark (default)
    (function initTheme() {
        try {
            const saved = localStorage.getItem('site-theme');
            if (saved) {
                applyTheme(saved);
                return;
            }

            const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
            if (prefersLight) {
                applyTheme('light');
            } else {
                applyTheme('dark');
            }
        } catch (e) {
            applyTheme('dark');
        }
    })();

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            const isLight = rootEl.getAttribute('data-theme') === 'light';
            const newTheme = isLight ? 'dark' : 'light';
            applyTheme(newTheme);
            try { localStorage.setItem('site-theme', newTheme); } catch (e) { /* ignore */ }
        });
    }

    // Pull-cord interaction: click or drag to toggle theme
    const pullCord = document.getElementById('pull-cord');
    if (pullCord) {
        let pointerDown = false;
        let startY = 0;
        let moved = false;
        const threshold = 18; // px to consider as a pull

        function toggleFromPull() {
            const isLight = rootEl.getAttribute('data-theme') === 'light';
            const newTheme = isLight ? 'dark' : 'light';
            applyTheme(newTheme);
            try { localStorage.setItem('site-theme', newTheme); } catch (e) {}
            // briefly show pulled state
            pullCord.classList.add('pulled');
            setTimeout(() => pullCord.classList.remove('pulled'), 420);
        }

        // click/tap toggles as well
        pullCord.addEventListener('click', function(e) {
            // avoid double-handling when drag used
            if (!moved) toggleFromPull();
            moved = false;
        });

        // Pointer drag support for a tactile pull
        pullCord.addEventListener('pointerdown', function(e) {
            pointerDown = true;
            startY = e.clientY;
            pullCord.setPointerCapture(e.pointerId);
        });

        pullCord.addEventListener('pointermove', function(e) {
            if (!pointerDown) return;
            const delta = e.clientY - startY;
            if (delta > 4) {
                moved = true;
            }
            // visual feedback while dragging
            const knob = pullCord.querySelector('.cord-knob');
            const line = pullCord.querySelector('.cord-line');
            const translate = Math.min(Math.max(delta, 0), 28);
            if (knob) knob.style.transform = `translateY(${translate}px)`;
            if (line) line.style.height = `${28 + translate}px`;
        });

        pullCord.addEventListener('pointerup', function(e) {
            pointerDown = false;
            try { pullCord.releasePointerCapture(e.pointerId); } catch (err) {}
            const delta = e.clientY - startY;
            // reset visuals
            const knob = pullCord.querySelector('.cord-knob');
            const line = pullCord.querySelector('.cord-line');
            if (knob) knob.style.transform = '';
            if (line) line.style.height = '';

            if (delta >= threshold) {
                toggleFromPull();
            } else {
                // small nudge animation for click feedback
                pullCord.classList.add('pulled');
                setTimeout(() => pullCord.classList.remove('pulled'), 260);
            }
        });

        // keyboard accessibility: Enter/Space toggles
        pullCord.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleFromPull();
            }
        });
    }

    // Toggle mobile menu
    if (hamMenu && offScreenMenu) {
        hamMenu.addEventListener('click', function() {
            hamMenu.classList.toggle('active');
            offScreenMenu.classList.toggle('active');
            document.body.style.overflow = offScreenMenu.classList.contains('active') ? 'hidden' : 'auto';
        });

        // Close menu when clicking on links
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamMenu.classList.remove('active');
                offScreenMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        });

        // Close button inside off-screen menu
        const menuCloseBtn = document.querySelector('.off-screen-menu .menu-close');
        if (menuCloseBtn) {
            menuCloseBtn.addEventListener('click', function() {
                hamMenu.classList.remove('active');
                offScreenMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        }

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamMenu.contains(e.target) && !offScreenMenu.contains(e.target)) {
                hamMenu.classList.remove('active');
                offScreenMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active navigation highlighting
    const allSections = document.querySelectorAll('section[id]');
    const mobileNavItems = document.querySelectorAll('.off-screen-menu a');

    function updateActiveNav() {
        let current = 'home'; // Default to home
        
        allSections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        // Update mobile nav active states
        mobileNavItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });
    }

    // Initial call and scroll listener
    updateActiveNav();
    window.addEventListener('scroll', debounce(updateActiveNav, 10));

    // Typing animation for home section
    const typingTexts = document.querySelectorAll('.typing-text');
    let currentTextIndex = 0;

    function showTypingText() {
        typingTexts.forEach(text => text.classList.remove('active'));
        if (typingTexts[currentTextIndex]) {
            typingTexts[currentTextIndex].classList.add('active');
        }
        currentTextIndex = (currentTextIndex + 1) % typingTexts.length;
    }

    if (typingTexts.length > 0) {
        showTypingText(); 
        setInterval(showTypingText, 4000);
    }

    // Scroll animations using Intersection Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);

    // Observe elements for scroll animations (including Certifications)
    const animateElements = document.querySelectorAll('.about-box, .portfolio-box, .skill-box, .cert-box');
    animateElements.forEach(element => {
        observer.observe(element);
    });

    // Contact form handling - EmailJS integration with Gmail
    // SETUP INSTRUCTIONS:
    // 1. Go to https://www.emailjs.com/ and create a free account
    // 2. Add Gmail as your email service (connect your Gmail account)
    // 3. Create an email template with variables: {{from_name}}, {{reply_to}}, {{message}}
    // 4. Copy your Public Key (User ID), Service ID, and Template ID
    // 5. Replace the values below with your actual EmailJS credentials
    
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        // EmailJS Configuration - Your actual credentials
        const EMAILJS_PUBLIC_KEY = 'W7TeFH4Ha4f7e5QZw'; // From EmailJS Account settings
        const EMAILJS_SERVICE_ID = 'service_1w3me34'; // Gmail service ID from EmailJS
        const EMAILJS_TEMPLATE_ID = 'template_9h7btvk'; // Template ID from EmailJS

        // Initialize EmailJS with your public key
        (function initEmailJS() {
            if (typeof emailjs !== 'undefined') {
                try { 
                    emailjs.init(EMAILJS_PUBLIC_KEY);
                    console.log('EmailJS initialized successfully');
                } catch (err) { 
                    console.error('EmailJS initialization error:', err);
                }
            } else {
                console.warn('EmailJS library not loaded yet');
            }
        })();

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const nameInput = contactForm.querySelector('input[name="from_name"]');
            const emailInput = contactForm.querySelector('input[name="reply_to"]');
            const messageInput = contactForm.querySelector('textarea[name="message"]');
            const submitBtn = contactForm.querySelector('.btn');

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const message = messageInput.value.trim();

            // Validation
            if (!name || !email || !message) {
                alert('Please fill in all fields.');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }

            // Update button state
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            // Send email directly via Gmail through EmailJS
            if (typeof emailjs !== 'undefined' && typeof emailjs.sendForm === 'function') {
                emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, '#contact-form')
                    .then(function(response) {
                        console.log('Email sent successfully!', response.status, response.text);
                        alert('✅ Thank you for your message! I\'ll get back to you soon via Gmail.');
                        contactForm.reset();
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                    })
                    .catch(function(error) {
                        console.error('Failed to send email:', error);
                        alert('❌ Failed to send message. Please try again or email me directly at sahilduwal@gmail.com');
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                    });
            } else {
                // EmailJS not loaded properly
                console.error('EmailJS library not available');
                alert('❌ Email service is currently unavailable. Please email me directly at sahilduwal@gmail.com');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Enhanced button hover effects
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.05)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Profile image pointer parallax (subtle 3D tilt + translate)
    (function profileParallax() {
        const imgBox = document.querySelector('.home-img .img-box');
        const img = document.querySelector('.home-img .img-box .img-item img');

        // Respect user preferences and small screens
        const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
        const largeScreen = window.innerWidth >= 768;

        if (!imgBox || !img || prefersReduced || !finePointer || !largeScreen) return;

        let raf = null;
        let lastEvent = null;

        function onPointerMove(e) {
            lastEvent = e;
            if (raf) return;
            raf = requestAnimationFrame(() => {
                const rect = imgBox.getBoundingClientRect();
                const x = (lastEvent.clientX - rect.left) / rect.width; // 0..1
                const y = (lastEvent.clientY - rect.top) / rect.height;

                // small ranges for subtle effect
                const rotateY = (x - 0.5) * 6; // deg
                const rotateX = (0.5 - y) * 6; // deg
                const translateX = (x - 0.5) * 8; // px
                const translateY = (y - 0.5) * 8; // px

                // Compose transform: include the floating baseline translateY from CSS by reducing magnitude
                img.style.transform = `translateY(${ -8 + translateY }px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateX(${translateX}px) scale(1.02)`;
                raf = null;
            });
        }

        function resetTransform() {
            if (raf) cancelAnimationFrame(raf);
            raf = null;
            img.style.transform = ''; // let CSS hover/animation take over
        }

        imgBox.addEventListener('pointermove', onPointerMove);
        imgBox.addEventListener('pointerleave', resetTransform);
        window.addEventListener('resize', function() {
            // If screen becomes small, remove listeners
            if (window.innerWidth < 768) {
                imgBox.removeEventListener('pointermove', onPointerMove);
                imgBox.removeEventListener('pointerleave', resetTransform);
            }
        });
    })();

    // Portfolio links tracking
    const portfolioLinks = document.querySelectorAll('.portfolio-links a');
    portfolioLinks.forEach(link => {
        link.addEventListener('click', function() {
            const projectName = this.closest('.portfolio-box').querySelector('h3').textContent;
            console.log(`Project link clicked: ${projectName} - ${this.textContent}`);
        });
    });

    // Transform portfolio boxes: make the title a toggle button and hide details until clicked
    (function transformPortfolioBoxes() {
        const boxes = document.querySelectorAll('.portfolio-box');
        boxes.forEach((box, idx) => {
            const titleEl = box.querySelector('h3');
            if (!titleEl) return;

            // Create a button to replace the h3
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'project-toggle';
            btn.setAttribute('aria-expanded', 'false');
            const detailsId = `project-details-${idx}`;
            btn.setAttribute('aria-controls', detailsId);
            btn.textContent = titleEl.textContent;

            // Replace h3 with button
            box.replaceChild(btn, titleEl);

            // Create details wrapper and move remaining children into it
            const details = document.createElement('div');
            details.className = 'project-details';
            details.id = detailsId;
            details.hidden = true;
            details.setAttribute('aria-hidden', 'true');

            // Move all remaining children of box into details
            while (btn.nextSibling) {
                details.appendChild(btn.nextSibling);
            }

            box.appendChild(details);

            // Toggle behavior
            btn.addEventListener('click', function() {
                const isOpen = btn.getAttribute('aria-expanded') === 'true';
                const body = document.body;

                // Close other portfolio boxes (accordion behavior) so only one opens at a time
                boxes.forEach(otherBox => {
                    if (otherBox === box) return;
                    const otherBtn = otherBox.querySelector('.project-toggle');
                    const otherDetails = otherBox.querySelector('.project-details');
                    if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                    if (otherDetails) {
                        otherDetails.hidden = true;
                        otherDetails.setAttribute('aria-hidden', 'true');
                    }
                    otherBox.classList.remove('open');
                });

                // Toggle this box
                btn.setAttribute('aria-expanded', String(!isOpen));
                if (isOpen) {
                    details.hidden = true;
                    details.setAttribute('aria-hidden', 'true');
                    box.classList.remove('open');
                    body.classList.remove('card-expanded');
                } else {
                    details.hidden = false;
                    details.setAttribute('aria-hidden', 'false');
                    box.classList.add('open');
                    body.classList.add('card-expanded');
                }
            });
        });
    })();

    // Transform certification boxes similarly: title becomes a toggle and details hidden until clicked
    (function transformCertBoxes() {
        const boxes = document.querySelectorAll('.cert-box');
        boxes.forEach((box, idx) => {
            const titleEl = box.querySelector('h3');
            if (!titleEl) return;

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'cert-toggle';
            btn.setAttribute('aria-expanded', 'false');
            const detailsId = `cert-details-${idx}`;
            btn.setAttribute('aria-controls', detailsId);
            btn.textContent = titleEl.textContent;

            box.replaceChild(btn, titleEl);

            const details = document.createElement('div');
            details.className = 'cert-details';
            details.id = detailsId;
            details.hidden = true;
            details.setAttribute('aria-hidden', 'true');

            // Move remaining children (span, p, etc.) into details
            while (btn.nextSibling) {
                details.appendChild(btn.nextSibling);
            }

            box.appendChild(details);

            btn.addEventListener('click', function() {
                const isOpen = btn.getAttribute('aria-expanded') === 'true';

                // Close other certification boxes (accordion behavior)
                boxes.forEach(otherBox => {
                    if (otherBox === box) return;
                    const otherBtn = otherBox.querySelector('.cert-toggle');
                    const otherDetails = otherBox.querySelector('.cert-details');
                    if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                    if (otherDetails) {
                        otherDetails.hidden = true;
                        otherDetails.setAttribute('aria-hidden', 'true');
                    }
                    otherBox.classList.remove('open');
                });

                btn.setAttribute('aria-expanded', String(!isOpen));
                if (isOpen) {
                    details.hidden = true;
                    details.setAttribute('aria-hidden', 'true');
                    box.classList.remove('open');
                } else {
                    details.hidden = false;
                    details.setAttribute('aria-hidden', 'false');
                    box.classList.add('open');
                }
            });
        });
    })();

    // Smooth reveal animations on scroll
    function handleScroll() {
        const elements = document.querySelectorAll('.about-box, .portfolio-box, .skill-box, .cert-box');
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('fade-in-up');
            }
        });
    }

    handleScroll();
    window.addEventListener('scroll', debounce(handleScroll, 10));

    // Logo click to scroll to top
    const logo = document.querySelector('.navbar .logo');
    if (logo) {
        logo.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Keyboard navigation support
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && offScreenMenu && offScreenMenu.classList.contains('active')) {
            hamMenu.classList.remove('active');
            offScreenMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // Preload sections for smoothness
    const pageSections = document.querySelectorAll('section');
    pageSections.forEach(section => {
        section.style.willChange = 'transform';
    });

    // Add animation delays to mobile menu items
    const mobileMenuItems = document.querySelectorAll('.off-screen-menu ul li');
    mobileMenuItems.forEach((item, index) => {
        item.style.setProperty('--i', index + 1);
    });

    // Console welcome message
    console.log('%c🚀 Welcome to Sahil\'s Portfolio!', 'color: #5F9EA0; font-size: 16px; font-weight: bold;');
    console.log('%cFully responsive design with smooth animations', 'color: #666; font-size: 12px;');
    console.log('%cMobile menu navigation active', 'color: #666; font-size: 12px;');

    // Scroll to section if hash exists
    if (window.location.hash) {
        setTimeout(() => {
            const target = document.querySelector(window.location.hash);
            if (target) {
                const offsetTop = target.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }, 100);
    }

    // Backdrop overlay click to close expanded cards
    document.addEventListener('click', function(e) {
        const body = document.body;
        // Check if body has the card-expanded class and click is on the backdrop overlay
        if (body.classList.contains('card-expanded') && e.target === body) {
            // Close all open portfolio boxes
            const boxes = document.querySelectorAll('.portfolio-box.open');
            boxes.forEach(box => {
                const btn = box.querySelector('.project-toggle');
                if (btn) {
                    btn.setAttribute('aria-expanded', 'false');
                    const details = box.querySelector('.project-details');
                    if (details) {
                        details.hidden = true;
                        details.setAttribute('aria-hidden', 'true');
                    }
                }
                box.classList.remove('open');
            });
            body.classList.remove('card-expanded');
        }
    });

    // Tilt effect for cards (parallax 3D)
    const tiltTargets = document.querySelectorAll(
        '.portfolio-box, .skill-card, .about-box, .exp-card, .edu-card, .cert-box, .skill-box, .contact .info-item'
    );
    const maxTilt = 6;

    tiltTargets.forEach(el => {
        el.classList.add('tilt-card');
        let frame;

        const handleMove = (e) => {
            if (el.classList.contains('open')) return;
            const rect = el.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            const tiltX = (y * -maxTilt).toFixed(2);
            const tiltY = (x * maxTilt).toFixed(2);

            if (frame) cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                el.style.setProperty('--tilt-x', `${tiltX}deg`);
                el.style.setProperty('--tilt-y', `${tiltY}deg`);
            });
        };

        const resetTilt = () => {
            el.style.setProperty('--tilt-x', '0deg');
            el.style.setProperty('--tilt-y', '0deg');
        };

        el.addEventListener('mousemove', handleMove);
        el.addEventListener('mouseleave', resetTilt);
    });

    // Magnetic cursor effect for primary interactive elements
    const magneticTargets = document.querySelectorAll('.btn, .project-toggle, .portfolio-links a');
    const magnetStrength = 0.35;
    const magnetRadius = 120;

    magneticTargets.forEach(el => {
        el.classList.add('magnetic');
        let frame;

        const handleMove = (e) => {
            const rect = el.getBoundingClientRect();
            const dx = e.clientX - rect.left - rect.width / 2;
            const dy = e.clientY - rect.top - rect.height / 2;
            const distance = Math.hypot(dx, dy);

            if (distance < magnetRadius) {
                const mx = (dx * magnetStrength).toFixed(2);
                const my = (dy * magnetStrength).toFixed(2);

                if (frame) cancelAnimationFrame(frame);
                frame = requestAnimationFrame(() => {
                    el.style.setProperty('--mx', `${mx}px`);
                    el.style.setProperty('--my', `${my}px`);
                });
            }
        };

        const resetMagnet = () => {
            el.style.setProperty('--mx', '0px');
            el.style.setProperty('--my', '0px');
        };

        el.addEventListener('mousemove', handleMove);
        el.addEventListener('mouseleave', resetMagnet);
    });
});

// Utility debounce
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

// Utility: in viewport check
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Page transitions
window.addEventListener('beforeunload', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
});

// Page load
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    const loadingElements = document.querySelectorAll('[data-loading]');
    loadingElements.forEach(element => {
        element.removeAttribute('data-loading');
    });
});

// External link tracking
document.addEventListener('click', function(e) {
    if (e.target.matches('a[target="_blank"]')) {
        setTimeout(() => {
            console.log('External link clicked:', e.target.href);
        }, 100);
    }
});

// Page visibility tracking
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('Page hidden');
    } else {
        console.log('Page visible');
    }
});

// Touch swipe logging
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', function(e) {
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', function(e) {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeDistance = touchStartY - touchEndY;
    const minSwipeDistance = 50;
    
    if (Math.abs(swipeDistance) > minSwipeDistance) {
        console.log(swipeDistance > 0 ? 'Swiped up' : 'Swiped down');
    }
}

// Dynamic year update
const currentYear = new Date().getFullYear();
const yearElements = document.querySelectorAll('.current-year');
yearElements.forEach(element => {
    element.textContent = currentYear;
});

// Final init
console.log('Portfolio website fully loaded and interactive! 🎉');
