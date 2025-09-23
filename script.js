// Portfolio JavaScript - Final Version

document.addEventListener('DOMContentLoaded', function() {
    // Hamburger menu functionality
    const hamMenu = document.querySelector('.ham-menu');
    const offScreenMenu = document.querySelector('.off-screen-menu');
    const menuLinks = document.querySelectorAll('.off-screen-menu a');

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

    // Contact form handling
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nameInput = contactForm.querySelector('input[type="text"]');
            const emailInput = contactForm.querySelector('input[type="email"]');
            const messageInput = contactForm.querySelector('textarea');
            const submitBtn = contactForm.querySelector('.btn');
            
            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const message = messageInput.value.trim();
            
            if (!name || !email || !message) {
                alert('Please fill in all fields.');
                return;
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }
            
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                alert('Thank you for your message! I\'ll get back to you soon.');
                contactForm.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 1500);
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

    // Portfolio links tracking
    const portfolioLinks = document.querySelectorAll('.portfolio-links a');
    portfolioLinks.forEach(link => {
        link.addEventListener('click', function() {
            const projectName = this.closest('.portfolio-box').querySelector('h3').textContent;
            console.log(`Project link clicked: ${projectName} - ${this.textContent}`);
        });
    });

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
