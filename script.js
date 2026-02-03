// ===========================
// THEME MANAGEMENT
// ===========================

// Initialize theme from localStorage or default to light
const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
};

// Toggle theme function with smooth transition
const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
};

// Pull cord theme toggle
const pullCord = document.getElementById('pull-cord');
if (pullCord) {
    pullCord.addEventListener('click', toggleTheme);
    pullCord.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleTheme();
        }
    });
}

// ===========================
// MOBILE MENU MANAGEMENT
// ===========================

const hamMenu = document.querySelector('.ham-menu');
const offScreenMenu = document.querySelector('.off-screen-menu');
const menuClose = document.querySelector('.menu-close');
const menuLinks = document.querySelectorAll('.off-screen-menu a');

// Open menu
const openMenu = () => {
    hamMenu.classList.add('active');
    offScreenMenu.classList.add('active');
    document.body.classList.add('no-scroll');
};

// Close menu
const closeMenu = () => {
    hamMenu.classList.remove('active');
    offScreenMenu.classList.remove('active');
    document.body.classList.remove('no-scroll');
};

// Event listeners
if (hamMenu) {
    hamMenu.addEventListener('click', () => {
        if (offScreenMenu.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    });
}

if (menuClose) {
    menuClose.addEventListener('click', closeMenu);
}

// Close menu when clicking on a link
menuLinks.forEach(link => {
    link.addEventListener('click', () => {
        closeMenu();
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (offScreenMenu.classList.contains('active') && 
        !offScreenMenu.contains(e.target) && 
        !hamMenu.contains(e.target)) {
        closeMenu();
    }
});

// Close menu on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && offScreenMenu.classList.contains('active')) {
        closeMenu();
    }
});

// ===========================
// NAVBAR SCROLL EFFECT
// ===========================

const navbar = document.querySelector('.navbar');
let lastScroll = 0;

const handleScroll = () => {
    const currentScroll = window.pageYOffset;
    
    // Add/remove scrolled class
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
};

// Throttle scroll events for performance
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = window.requestAnimationFrame(() => {
        handleScroll();
    });
}, { passive: true });

// ===========================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ===========================

// Generic observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observeElements = (selector, className = 'visible') => {
    const elements = document.querySelectorAll(selector);
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger animations
                setTimeout(() => {
                    entry.target.classList.add(className);
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    elements.forEach(element => observer.observe(element));
};

// ===========================
// SMOOTH SCROLL
// ===========================

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Skip empty anchors
        if (href === '#' || href === '#home') {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            return;
        }
        
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const navbarHeight = navbar.offsetHeight;
            const targetPosition = target.offsetTop - navbarHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===========================
// ACTIVE SECTION HIGHLIGHTING
// ===========================

const sections = document.querySelectorAll('section[id]');

const highlightNavigation = () => {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.off-screen-menu a[href="#${sectionId}"]`);
        
        if (navLink) {
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLink.style.color = 'var(--accent-primary)';
            } else {
                navLink.style.color = '';
            }
        }
    });
};

window.addEventListener('scroll', highlightNavigation, { passive: true });

// ===========================
// FORM HANDLING
// ===========================

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

// ===========================
// TYPING EFFECT FOR HOME SECTION
// ===========================

const animateTyping = () => {
    const roles = document.querySelectorAll('.home-info h2 span');
    
    roles.forEach((role, index) => {
        const text = role.getAttribute('data-text');
        let charIndex = 0;
        
        const typeChar = () => {
            if (charIndex < text.length) {
                role.textContent = text.substring(0, charIndex + 1);
                charIndex++;
                setTimeout(typeChar, 100);
            }
        };
        
        // Start typing after delay based on animation
        setTimeout(() => {
            typeChar();
        }, index * 4000);
    });
};

// ===========================
// IMAGE LAZY LOADING
// ===========================

const lazyLoadImages = () => {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
};

// ===========================
// PERFORMANCE OPTIMIZATIONS
// ===========================

// Debounce function for resize events
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Handle window resize
const handleResize = debounce(() => {
    // Close mobile menu on desktop resize
    if (window.innerWidth > 968 && offScreenMenu.classList.contains('active')) {
        closeMenu();
    }
}, 250);

window.addEventListener('resize', handleResize);

// ===========================
// GSAP ANIMATIONS (if GSAP is loaded)
// ===========================

const initGSAPAnimations = () => {
    // Check if GSAP is available
    if (typeof gsap !== 'undefined') {
        // Home section animations
        gsap.from('.home-info h1', {
            duration: 1,
            y: 50,
            opacity: 0,
            ease: 'power3.out'
        });
        
        gsap.from('.home-info h3', {
            duration: 1,
            y: 30,
            opacity: 0,
            delay: 0.3,
            ease: 'power3.out'
        });
        
        gsap.from('.btn-sci', {
            duration: 1,
            y: 30,
            opacity: 0,
            delay: 0.5,
            ease: 'power3.out'
        });
        
        gsap.from('.home-img', {
            duration: 1.2,
            x: 100,
            opacity: 0,
            delay: 0.7,
            ease: 'power3.out'
        });
        
        // Scroll-triggered animations
        const scrollElements = gsap.utils.toArray('.skill-card, .exp-box, .portfolio-box, .edu-card, .cert-box');
        
        scrollElements.forEach((elem, index) => {
            gsap.from(elem, {
                scrollTrigger: {
                    trigger: elem,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                },
                duration: 0.8,
                y: 50,
                opacity: 0,
                delay: index * 0.1,
                ease: 'power2.out'
            });
        });
    }
};

// ===========================
// CURSOR TRAIL EFFECT (Optional)
// ===========================

const createCursorTrail = () => {
    // Only on desktop
    if (window.innerWidth > 968) {
        const trail = [];
        const trailLength = 10;
        
        for (let i = 0; i < trailLength; i++) {
            const dot = document.createElement('div');
            dot.style.position = 'fixed';
            dot.style.width = '5px';
            dot.style.height = '5px';
            dot.style.borderRadius = '50%';
            dot.style.background = 'var(--accent-primary)';
            dot.style.opacity = (trailLength - i) / trailLength;
            dot.style.pointerEvents = 'none';
            dot.style.zIndex = '9999';
            dot.style.transition = 'all 0.1s ease';
            document.body.appendChild(dot);
            trail.push(dot);
        }
        
        let mouseX = 0;
        let mouseY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        const animateTrail = () => {
            let x = mouseX;
            let y = mouseY;
            
            trail.forEach((dot, index) => {
                dot.style.left = x + 'px';
                dot.style.top = y + 'px';
                
                const nextDot = trail[index + 1] || trail[0];
                const rect = nextDot.getBoundingClientRect();
                x += (rect.left - x) * 0.3;
                y += (rect.top - y) * 0.3;
            });
            
            requestAnimationFrame(animateTrail);
        };
        
        animateTrail();
    }
};

// ===========================
// PARTICLE BACKGROUND (Optional)
// ===========================

const createParticleBackground = () => {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '-1';
    canvas.style.opacity = '0.3';
    document.body.prepend(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 50;
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }
        
        draw() {
            const theme = document.documentElement.getAttribute('data-theme');
            ctx.fillStyle = theme === 'dark' ? '#60a5fa' : '#3b82f6';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    const init = () => {
        particles.length = 0;
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    };
    
    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        requestAnimationFrame(animate);
    };
    
    init();
    animate();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        init();
    });
};

// ===========================
// SCROLL PROGRESS INDICATOR
// ===========================

const createScrollProgress = () => {
    const progressBar = document.createElement('div');
    progressBar.style.position = 'fixed';
    progressBar.style.top = '0';
    progressBar.style.left = '0';
    progressBar.style.width = '0%';
    progressBar.style.height = '3px';
    progressBar.style.background = 'var(--accent-gradient)';
    progressBar.style.zIndex = '10000';
    progressBar.style.transition = 'width 0.1s ease';
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.pageYOffset / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    }, { passive: true });
};

// ===========================
// INITIALIZE ON DOM LOAD
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    initializeTheme();
    
    // Initialize observers for animations
    observeElements('.skill-card');
    observeElements('.exp-box');
    observeElements('.portfolio-box');
    observeElements('.edu-card');
    observeElements('.cert-box');
    
    // Initialize lazy loading
    lazyLoadImages();
    
    // Add scroll progress indicator
    createScrollProgress();
    
    // Optional: Add particle background (comment out if not needed)
    // createParticleBackground();
    
    // Optional: Add cursor trail (comment out if not needed)
    // createCursorTrail();
    
    // Initialize GSAP animations if loaded
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        initGSAPAnimations();
    }
    
    // Highlight current section in navigation
    highlightNavigation();
});

// ===========================
// PAGE LOAD ANIMATION
// ===========================

window.addEventListener('load', () => {
    // Hide loading screen if you have one
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
    
    // Add loaded class to body
    document.body.classList.add('loaded');
});

// ===========================
// UTILITY FUNCTIONS
// ===========================

// Check if element is in viewport
const isInViewport = (element) => {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
};

// Smooth counter animation
const animateCounter = (element, target, duration = 2000) => {
    let start = 0;
    const increment = target / (duration / 16);
    
    const updateCounter = () => {
        start += increment;
        if (start < target) {
            element.textContent = Math.ceil(start);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    };
    
    updateCounter();
};

// Export functions if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        toggleTheme,
        animateCounter,
        isInViewport
    };
}
