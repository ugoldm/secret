/**
 * Birthday Card - Animation Controller
 * Handles scroll-triggered animations using IntersectionObserver
 */

(function() {
    'use strict';

    // Flag to ensure animation runs only once
    let animationTriggered = false;

    // DOM Elements
    const surpriseSection = document.getElementById('surprise');
    const cake = document.getElementById('cake');
    const giftText = document.getElementById('giftText');
    const confettiContainer = document.querySelector('.confetti-container');
    const heartsBurst = document.querySelector('.hearts-burst');

    /**
     * Triggers all surprise animations
     */
    function triggerSurpriseAnimation() {
        if (animationTriggered) return;
        animationTriggered = true;

        // Add animation classes
        cake.classList.add('animate');
        giftText.classList.add('animate');
        
        // Trigger confetti and hearts with slight delay
        setTimeout(() => {
            confettiContainer.classList.add('animate');
            heartsBurst.classList.add('animate');
        }, 300);

        // Store in sessionStorage to remember animation was triggered
        try {
            sessionStorage.setItem('birthdayAnimationPlayed', 'true');
        } catch (e) {
            // SessionStorage not available, ignore
        }
    }

    /**
     * Check if user prefers reduced motion
     */
    function prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /**
     * Initialize IntersectionObserver for scroll-triggered animation
     */
    function initScrollObserver() {
        // Check if animation was already played in this session
        try {
            if (sessionStorage.getItem('birthdayAnimationPlayed') === 'true') {
                // Show elements without animation
                cake.style.transform = 'translateY(0)';
                cake.style.opacity = '1';
                giftText.style.opacity = '1';
                giftText.style.transform = 'translateY(0)';
                animationTriggered = true;
                return;
            }
        } catch (e) {
            // SessionStorage not available, continue normally
        }

        // Observer options - trigger when 60% of section is visible
        const observerOptions = {
            root: null, // viewport
            rootMargin: '0px',
            threshold: 0.4 // Trigger when 40% visible (top of section at ~60% viewport height)
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animationTriggered) {
                    // Small delay for better effect
                    setTimeout(() => {
                        triggerSurpriseAnimation();
                    }, 100);
                    
                    // Disconnect observer after triggering
                    observer.disconnect();
                }
            });
        }, observerOptions);

        // Start observing
        if (surpriseSection) {
            observer.observe(surpriseSection);
        }
    }

    /**
     * Handle reduced motion preference
     */
    function handleReducedMotion() {
        if (prefersReducedMotion()) {
            // For users who prefer reduced motion, show content immediately without animations
            cake.style.transform = 'translateY(0)';
            cake.style.opacity = '1';
            giftText.style.opacity = '1';
            giftText.style.transform = 'translateY(0)';
            animationTriggered = true;
        }
    }

    /**
     * Smooth scroll indicator click handler
     */
    function initScrollHint() {
        const scrollHint = document.querySelector('.scroll-hint');
        if (scrollHint) {
            scrollHint.style.cursor = 'pointer';
            scrollHint.addEventListener('click', () => {
                window.scrollBy({
                    top: window.innerHeight,
                    behavior: 'smooth'
                });
            });
        }
    }

    /**
     * Add subtle parallax effect to decorative sections
     */
    function initParallax() {
        if (prefersReducedMotion()) return;

        const decorativeSections = document.querySelectorAll('.decoration-pattern');
        
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            
            decorativeSections.forEach((section, index) => {
                const speed = 0.1 * (index + 1);
                const yPos = scrollY * speed;
                section.style.transform = `translateY(${yPos}px)`;
            });
        }, { passive: true });
    }

    /**
     * Initialize everything when DOM is ready
     */
    function init() {
        handleReducedMotion();
        initScrollObserver();
        initScrollHint();
        initParallax();
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Listen for changes in motion preference
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', handleReducedMotion);

})();
