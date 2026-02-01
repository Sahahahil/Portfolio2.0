/**
 * Advanced Portfolio Animations
 * Implements: Magnetic Interactions, Fluid Card Reveal, Reactive Typography,
 * Scroll-Triggered Parallax, and Sensory Feedback
 */

// ============================================
// 1. MAGNETIC INTERACTIONS
// ============================================

class MagneticButton {
    constructor(element) {
        this.element = element;
        this.magneticStrength = 0.3;
        this.ease = 0.3;
        this.currentX = 0;
        this.currentY = 0;
        this.targetX = 0;
        this.targetY = 0;

        this.init();
    }

    init() {
        // Store original position
        this.element.style.position = 'relative';
        this.element.style.cursor = 'pointer';

        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.element.addEventListener('mouseleave', () => this.onMouseLeave());
        
        // Animate the magnetic effect
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

        const magneticRadius = 100; // pixels

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
        this.currentX += (this.targetX - this.currentX) * this.ease;
        this.currentY += (this.targetY - this.currentY) * this.ease;

        gsap.set(this.element, {
            x: this.currentX,
            y: this.currentY,
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize magnetic buttons
function initMagneticInteractions() {
    const magneticElements = document.querySelectorAll('.btn, .portfolio-box, .cert-box, .skill-box');
    magneticElements.forEach((el) => {
        if (!el.classList.contains('magnetic-init')) {
            new MagneticButton(el);
            el.classList.add('magnetic-init');
        }
    });
}

// ============================================
// 2. FLUID CARD REVEAL (Clip-Path Animation)
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

        const rect = this.card.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        // Store original clip-path if any
        const originalClipPath = this.card.style.clipPath || 'none';

        this.isAnimating = true;

        // Animate clip-path from click point
        gsap.fromTo(
            this.card,
            {
                clipPath: `circle(0% at ${clickX}px ${clickY}px)`,
            },
            {
                clipPath: `circle(150% at ${clickX}px ${clickY}px)`,
                duration: 0.8,
                ease: 'power2.out',
                onComplete: () => {
                    this.card.style.clipPath = originalClipPath;
                    this.isAnimating = false;
                },
            }
        );

        // Add scale and brightness pulse
        gsap.fromTo(
            this.card,
            { scale: 0.95 },
            {
                scale: 1,
                duration: 0.8,
                ease: 'power2.out',
            }
        );

        // Trigger ripple effect
        this.createRipple(event);
    }

    createRipple(event) {
        const rect = this.card.getBoundingClientRect();
        const ripple = document.createElement('span');
        
        ripple.style.position = 'absolute';
        ripple.style.left = (event.clientX - rect.left) + 'px';
        ripple.style.top = (event.clientY - rect.top) + 'px';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.background = 'radial-gradient(circle, rgba(0, 217, 255, 0.8) 0%, rgba(0, 217, 255, 0) 70%)';
        ripple.style.borderRadius = '50%';
        ripple.style.pointerEvents = 'none';
        ripple.style.transform = 'translate(-50%, -50%)';

        if (this.card.style.position !== 'absolute' && this.card.style.position !== 'relative') {
            this.card.style.position = 'relative';
        }

        this.card.appendChild(ripple);

        gsap.to(ripple, {
            width: 200,
            height: 200,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => ripple.remove(),
        });
    }
}

// Initialize fluid card reveal
function initFluidCardReveal() {
    const cards = document.querySelectorAll('.portfolio-box, .cert-box, .skill-box, .about-box');
    cards.forEach((card) => {
        if (!card.classList.contains('fluid-init')) {
            new FluidCardReveal(card);
            card.classList.add('fluid-init');
        }
    });
}

// ============================================
// 3. REACTIVE TYPOGRAPHY (Stagger Animation)
// ============================================

class ReactiveTypography {
    constructor(element) {
        this.element = element;
        this.originalHTML = element.innerHTML;
        this.init();
    }

    init() {
        // Split text into characters
        const text = this.element.textContent;
        const chars = text.split('');
        
        // Clear element
        this.element.textContent = '';

        // Wrap each character
        chars.forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char;
            span.style.display = 'inline-block';
            span.style.transition = 'all 0.3s ease';
            span.dataset.index = index;
            span.classList.add('reactive-char');
            this.element.appendChild(span);
        });

        // Add hover effect
        this.element.addEventListener('mouseenter', () => this.stagger());
    }

    stagger() {
        const chars = this.element.querySelectorAll('.reactive-char');
        chars.forEach((char, index) => {
            gsap.to(char, {
                y: -8,
                fontWeight: 700,
                color: 'var(--accent-primary)',
                duration: 0.4,
                delay: index * 0.05,
                ease: 'elastic.out(1.2, 0.4)',
                overwrite: 'auto',
            });

            // Reset after animation
            gsap.to(
                char,
                {
                    y: 0,
                    fontWeight: 400,
                    color: 'inherit',
                    duration: 0.4,
                    delay: index * 0.05 + 0.8,
                    ease: 'cubic.inOut',
                    overwrite: 'auto',
                },
                index * 0.05
            );
        });
    }
}

// Initialize reactive typography
function initReactiveTypography() {
    const headings = document.querySelectorAll('section > h2, .portfolio-box h3, .skill-box h3');
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
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Parallax for background elements
    gsap.utils.toArray('.parallax-slow').forEach((element) => {
        gsap.to(element, {
            y: -100,
            scrollTrigger: {
                trigger: element,
                start: 'top center',
                end: 'bottom center',
                scrub: 0.5,
                markers: false,
            },
        });
    });

    gsap.utils.toArray('.parallax-fast').forEach((element) => {
        gsap.to(element, {
            y: -200,
            scrollTrigger: {
                trigger: element,
                start: 'top center',
                end: 'bottom center',
                scrub: 0.5,
                markers: false,
            },
        });
    });

    // Parallax scale for images
    gsap.utils.toArray('img').forEach((img) => {
        if (img.parentElement && img.parentElement.classList.contains('parallax-image')) {
            gsap.to(img, {
                scale: 1.1,
                scrollTrigger: {
                    trigger: img,
                    start: 'top 80%',
                    end: 'top 20%',
                    scrub: 1,
                    markers: false,
                },
            });
        }
    });

    // Scroll-triggered fade-in for sections
    gsap.utils.toArray('section').forEach((section) => {
        gsap.from(section, {
            opacity: 0,
            y: 50,
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                end: 'top 50%',
                scrub: false,
                markers: false,
            },
        });
    });
}

// ============================================
// 5. SENSORY FEEDBACK (Ripple + Glow)
// ============================================

class RippleEffect {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('click', (e) => this.createRipple(e));
    }

    createRipple(event) {
        // Only create ripple on buttons and interactive elements
        if (!event.target.closest('.btn, .portfolio-box, .skill-box, .cert-box, a, button')) {
            return;
        }

        const element = event.target.closest('.btn, .portfolio-box, .skill-box, .cert-box, a, button');
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        const ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.background = 'radial-gradient(circle, rgba(0, 217, 255, 0.8) 0%, rgba(0, 217, 255, 0) 70%)';
        ripple.style.borderRadius = '50%';
        ripple.style.pointerEvents = 'none';
        ripple.style.zIndex = '9999';

        if (element.style.position !== 'relative' && element.style.position !== 'absolute') {
            element.style.position = 'relative';
            element.style.overflow = 'hidden';
        }

        element.appendChild(ripple);

        gsap.to(ripple, {
            scale: 2,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => ripple.remove(),
        });
    }
}

// Success glow effect
class SuccessGlow {
    static trigger(element) {
        const glow = document.createElement('div');
        glow.style.position = 'absolute';
        glow.style.inset = '0';
        glow.style.background = 'radial-gradient(circle, rgba(0, 217, 255, 0.4) 0%, transparent 70%)';
        glow.style.borderRadius = 'inherit';
        glow.style.pointerEvents = 'none';
        glow.style.opacity = '0';

        if (element.style.position !== 'relative' && element.style.position !== 'absolute') {
            element.style.position = 'relative';
        }

        element.appendChild(glow);

        gsap.to(glow, {
            opacity: 1,
            duration: 0.3,
            ease: 'power2.out',
        });

        gsap.to(glow, {
            opacity: 0,
            duration: 0.5,
            delay: 0.5,
            ease: 'power2.out',
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
    // Wait for GSAP to be available
    if (typeof gsap === 'undefined') {
        console.warn('GSAP not loaded yet, retrying...');
        setTimeout(initAllAnimations, 100);
        return;
    }

    console.log('🎬 Initializing advanced animations...');

    initMagneticInteractions();
    initFluidCardReveal();
    initReactiveTypography();
    initScrollParallax();
    initRippleEffect();

    console.log('✨ All animations initialized!');
}

// Run animations on DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllAnimations);
} else {
    initAllAnimations();
}

// Re-initialize for dynamically added elements
const observer = new MutationObserver(() => {
    setTimeout(() => {
        initMagneticInteractions();
        initFluidCardReveal();
        initReactiveTypography();
    }, 100);
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
