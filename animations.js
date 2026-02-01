/**
 * Advanced Portfolio Animations - Optimized for Performance
 * Implements: Magnetic Interactions, Fluid Card Reveal, Reactive Typography,
 * Scroll-Triggered Parallax, and Sensory Feedback
 */

// Check if device is mobile or low-performance
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isLowPerformance = prefersReducedMotion || (isMobile && navigator.hardwareConcurrency < 4);

// Configure GSAP for optimal performance
if (typeof gsap !== 'undefined') {
    gsap.config({
        force3D: true,
        nullTargetWarn: false,
    });
    gsap.defaults({
        ease: 'power2.out',
        duration: 0.6,
    });
}

// ============================================
// 1. MAGNETIC INTERACTIONS
// ============================================

class MagneticButton {
    constructor(element) {
        // Skip on low-performance devices
        if (isLowPerformance) return;

        this.element = element;
        this.magneticStrength = isMobile ? 0.15 : 0.25;
        this.ease = isMobile ? 0.15 : 0.2;
        this.currentX = 0;
        this.currentY = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.isActive = false;

        this.init();
    }

    init() {
        this.element.style.position = 'relative';
        this.element.style.cursor = 'pointer';
        this.element.style.willChange = 'transform';

        this.element.addEventListener('mouseenter', () => this.isActive = true);
        this.element.addEventListener('mouseleave', () => {
            this.isActive = false;
            this.onMouseLeave();
        });
        document.addEventListener('mousemove', (e) => {
            if (this.isActive) this.onMouseMove(e);
        }, { passive: true });
        
        this.animate();
    }

    onMouseMove(event) {
        const rect = this.element.getBoundingClientRect();
        const elementCenterX = rect.left + rect.width / 2;
        const elementCenterY = rect.top + rect.height / 2;

        const mouseX = event.clientX;
        const mouseY = event.clientY;

        const distance = Math.sqrt(
            Math.pow(mouseX - elementCenterX, 2) + 
            Math.pow(mouseY - elementCenterY, 2)
        );

        const magneticRadius = isMobile ? 60 : 90;

        if (distance < magneticRadius) {
            this.targetX = (mouseX - elementCenterX) * this.magneticStrength;
            this.targetY = (mouseY - elementCenterY) * this.magneticStrength;
        } else {
            this.targetX = 0;
            this.targetY = 0;
        }
    }

    onMouseLeave() {
        this.targetX = 0;
        this.targetY = 0;
    }

    animate() {
        const deltaX = this.targetX - this.currentX;
        const deltaY = this.targetY - this.currentY;
        
        this.currentX += deltaX * this.ease;
        this.currentY += deltaY * this.ease;

        // Use transform for GPU acceleration
        if (Math.abs(deltaX) > 0.01 || Math.abs(deltaY) > 0.01) {
            this.element.style.transform = `translate3d(${this.currentX}px, ${this.currentY}px, 0)`;
        }

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize magnetic buttons
function initMagneticInteractions() {
    if (isLowPerformance) return;

    const magneticElements = document.querySelectorAll('.btn');
    magneticElements.forEach((el) => {
        if (!el.classList.contains('magnetic-init')) {
            new MagneticButton(el);
            el.classList.add('magnetic-init');
        }
    });
}

// ============================================
// 2. FLUID CARD REVEAL
// ============================================

class FluidCardReveal {
    constructor(card) {
        this.card = card;
        this.isAnimating = false;
        this.init();
    }

    init() {
        this.card.addEventListener('click', (e) => this.reveal(e));
    }

    reveal(event) {
        if (this.isAnimating) return;

        this.createSimpleRipple(event);
        
        // Skip clip-path animation on low-performance devices
        if (isLowPerformance) return;

        const rect = this.card.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        this.isAnimating = true;

        // Smooth clip-path animation
        gsap.fromTo(
            this.card,
            {
                clipPath: `circle(0% at ${clickX}px ${clickY}px)`,
            },
            {
                clipPath: `circle(150% at ${clickX}px ${clickY}px)`,
                duration: 0.6,
                ease: 'expo.out',
                onComplete: () => {
                    this.card.style.clipPath = 'none';
                    this.isAnimating = false;
                },
            }
        );
    }

    createSimpleRipple(event) {
        const rect = this.card.getBoundingClientRect();
        const ripple = document.createElement('span');
        
        ripple.style.cssText = `
            position: absolute;
            left: ${event.clientX - rect.left}px;
            top: ${event.clientY - rect.top}px;
            width: 10px;
            height: 10px;
            background: radial-gradient(circle, rgba(0, 217, 255, 0.5) 0%, rgba(0, 217, 255, 0) 70%);
            border-radius: 50%;
            pointer-events: none;
            transform: translate(-50%, -50%);
            will-change: transform, opacity;
        `;

        if (this.card.style.position !== 'absolute' && this.card.style.position !== 'relative') {
            this.card.style.position = 'relative';
        }

        this.card.appendChild(ripple);

        gsap.to(ripple, {
            width: isMobile ? 80 : 120,
            height: isMobile ? 80 : 120,
            opacity: 0,
            duration: 0.5,
            ease: 'expo.out',
            onComplete: () => ripple.remove(),
        });
    }
}

// Initialize fluid card reveal
function initFluidCardReveal() {
    const cards = document.querySelectorAll('.portfolio-box, .cert-box');
    cards.forEach((card) => {
        if (!card.classList.contains('fluid-init')) {
            new FluidCardReveal(card);
            card.classList.add('fluid-init');
        }
    });
}

// ============================================
// 3. REACTIVE TYPOGRAPHY
// ============================================

class ReactiveTypography {
    constructor(element) {
        // Skip on mobile
        if (isLowPerformance) return;

        this.element = element;
        this.originalHTML = element.innerHTML;
        this.init();
    }

    init() {
        const text = this.element.textContent;
        const chars = text.split('');
        
        this.element.textContent = '';

        chars.forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char;
            span.style.display = 'inline-block';
            span.dataset.index = index;
            span.classList.add('reactive-char');
            this.element.appendChild(span);
        });

        this.element.addEventListener('mouseenter', () => this.stagger());
    }

    stagger() {
        const chars = this.element.querySelectorAll('.reactive-char');
        const timeline = gsap.timeline();
        
        chars.forEach((char, index) => {
            timeline.to(char, {
                y: -6,
                fontWeight: 600,
                color: 'var(--accent-primary)',
                duration: 0.4,
                ease: 'back.out(1.5)',
                overwrite: 'auto',
            }, index * 0.025);

            timeline.to(char, {
                y: 0,
                fontWeight: 400,
                color: 'inherit',
                duration: 0.4,
                ease: 'power2.inOut',
                overwrite: 'auto',
            }, index * 0.025 + 0.6);
        });
    }
}

// Initialize reactive typography
function initReactiveTypography() {
    if (isLowPerformance) return;

    const headings = document.querySelectorAll('section > h2');
    headings.forEach((heading) => {
        if (!heading.classList.contains('reactive-init')) {
            new ReactiveTypography(heading);
            heading.classList.add('reactive-init');
        }
    });
}

// ============================================
// 4. SCROLL-TRIGGERED PARALLAX
// ============================================

function initScrollParallax() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);
    
    // Configure ScrollTrigger for smoother performance
    ScrollTrigger.config({
        autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load',
        ignoreMobileResize: true,
    });

    // Smooth fade-in for all sections
    gsap.utils.toArray('section').forEach((section) => {
        gsap.from(section, {
            opacity: 0,
            y: isMobile ? 15 : 30,
            duration: isMobile ? 0.5 : 0.8,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: section,
                start: 'top 85%',
                end: 'top 60%',
                toggleActions: 'play none none reverse',
                once: false,
            },
        });
    });

    // Skip parallax on mobile for better performance
    if (isMobile) return;

    // Smooth parallax for desktop
    gsap.utils.toArray('.parallax-slow').forEach((element) => {
        gsap.to(element, {
            y: -40,
            ease: 'none',
            scrollTrigger: {
                trigger: element,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
            },
        });
    });

    gsap.utils.toArray('.parallax-fast').forEach((element) => {
        gsap.to(element, {
            y: -80,
            ease: 'none',
            scrollTrigger: {
                trigger: element,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
            },
        });
    });
}

// ============================================
// 5. SENSORY FEEDBACK
// ============================================

class RippleEffect {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('click', (e) => this.createRipple(e));
    }

    createRipple(event) {
        if (!event.target.closest('.btn, a, button')) {
            return;
        }

        const element = event.target.closest('.btn, a, button');
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: radial-gradient(circle, rgba(0, 217, 255, 0.4) 0%, rgba(0, 217, 255, 0) 70%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            will-change: transform, opacity;
        `;

        if (element.style.position !== 'relative' && element.style.position !== 'absolute') {
            element.style.position = 'relative';
            element.style.overflow = 'hidden';
        }

        element.appendChild(ripple);

        gsap.to(ripple, {
            scale: isMobile ? 1.8 : 2,
            opacity: 0,
            duration: isMobile ? 0.4 : 0.5,
            ease: 'expo.out',
            onComplete: () => ripple.remove(),
        });
    }
}

// Success glow effect
class SuccessGlow {
    static trigger(element) {
        const glow = document.createElement('div');
        glow.style.cssText = `
            position: absolute;
            inset: 0;
            background: radial-gradient(circle, rgba(0, 217, 255, 0.3) 0%, transparent 70%);
            border-radius: inherit;
            pointer-events: none;
            opacity: 0;
            will-change: opacity;
        `;

        if (element.style.position !== 'relative' && element.style.position !== 'absolute') {
            element.style.position = 'relative';
        }

        element.appendChild(glow);

        const timeline = gsap.timeline();
        timeline.to(glow, {
            opacity: 1,
            duration: 0.25,
            ease: 'power2.out',
        });

        timeline.to(glow, {
            opacity: 0,
            duration: 0.4,
            delay: 0.2,
            ease: 'power2.inOut',
            onComplete: () => glow.remove(),
        });
    }
}

// Initialize ripple effect
function initRippleEffect() {
    new RippleEffect();
}

// ============================================
// INITIALIZATION - Run when DOM is ready
// ============================================

function initAllAnimations() {
    if (typeof gsap === 'undefined') {
        console.warn('GSAP not loaded yet, retrying...');
        setTimeout(initAllAnimations, 100);
        return;
    }

    console.log('🎬 Initializing optimized animations...');
    console.log('Device type:', isLowPerformance ? 'Mobile/Low-performance' : 'Desktop');

    initMagneticInteractions();
    initFluidCardReveal();
    initReactiveTypography();
    initScrollParallax();
    initRippleEffect();

    console.log('✨ All animations initialized!');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllAnimations);
} else {
    initAllAnimations();
}

// Simplified mutation observer
let observerTimeout;
const observer = new MutationObserver(() => {
    clearTimeout(observerTimeout);
    observerTimeout = setTimeout(() => {
        initFluidCardReveal();
    }, 200);
});

observer.observe(document.body, { childList: true, subtree: true });

// Export for external use
window.PortfolioAnimations = {
    SuccessGlow,
    RippleEffect,
    MagneticButton,
    FluidCardReveal,
    ReactiveTypography,
};
