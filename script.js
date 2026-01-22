/**
 * Birthday Card - Animation Controller
 * Handles scroll-triggered animations, gift selection, and modal interactions
 */

(function() {
    'use strict';

    // ===== State Flags =====
    let animationTriggered = false;
    let cakeLanded = false;
    let giftButtonShown = false;
    let giftsRevealed = false;

    // ===== DOM Elements =====
    const surpriseSection = document.getElementById('surprise');
    const cake = document.getElementById('cake');
    const giftText = document.getElementById('giftText');
    const confettiContainer = document.querySelector('.confetti-container');
    const heartsBurst = document.querySelector('.hearts-burst');
    const giftButton = document.getElementById('giftButton');
    
    // Modal elements
    const modalGifts = document.getElementById('modalGifts');
    const closeModalGifts = document.getElementById('closeModalGifts');
    const giftsContainer = document.getElementById('giftsContainer');
    const giftItems = document.querySelectorAll('.gift-item');
    
    const modalYarn = document.getElementById('modalYarn');
    const btnYarnYes = document.getElementById('btnYarnYes');
    const btnYarnNo = document.getElementById('btnYarnNo');
    
    // Individual gift elements
    const giftIphone = document.getElementById('giftIphone');
    const giftTickets = document.getElementById('giftTickets');
    const giftYarn = document.getElementById('giftYarn');
    const giftOther = document.getElementById('giftOther');

    // ===== Utility Functions =====
    
    /**
     * Check if user prefers reduced motion
     */
    function prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /**
     * Lock body scroll
     */
    function lockScroll() {
        document.body.classList.add('modal-open');
    }

    /**
     * Unlock body scroll
     */
    function unlockScroll() {
        document.body.classList.remove('modal-open');
    }

    // ===== Cake Animation =====
    
    /**
     * Handle cake landing event
     */
    function onCakeLanded() {
        if (cakeLanded) return;
        cakeLanded = true;
        
        // Show gift button after 3 seconds
        setTimeout(() => {
            showGiftButton();
        }, 3000);
    }

    /**
     * Show the gift selection button
     */
    function showGiftButton() {
        if (giftButtonShown) return;
        giftButtonShown = true;
        giftButton.classList.add('visible');
    }

    /**
     * Triggers all surprise animations
     */
    function triggerSurpriseAnimation() {
        if (animationTriggered) return;
        animationTriggered = true;

        // Add animation classes
        cake.classList.add('animate');
        giftText.classList.add('animate');
        
        // Listen for cake animation end
        cake.addEventListener('animationend', onCakeLanded, { once: true });
        
        // Fallback timeout in case animationend doesn't fire (e.g., reduced motion)
        setTimeout(() => {
            onCakeLanded();
        }, 1500);
        
        // Trigger confetti and hearts with slight delay
        setTimeout(() => {
            confettiContainer.classList.add('animate');
            heartsBurst.classList.add('animate');
        }, 300);

        // Store in sessionStorage
        try {
            sessionStorage.setItem('birthdayAnimationPlayed', 'true');
        } catch (e) {
            // SessionStorage not available, ignore
        }
    }

    // ===== Modal Functions =====
    
    /**
     * Open gifts modal
     */
    function openGiftsModal() {
        modalGifts.classList.add('active');
        lockScroll();
        modalGifts.focus();
        
        // Reveal gifts sequentially
        if (!giftsRevealed) {
            revealGiftsSequentially();
            giftsRevealed = true;
        }
    }

    /**
     * Close gifts modal
     */
    function closeGiftsModal() {
        modalGifts.classList.remove('active');
        
        // Only unlock scroll if yarn modal is not open
        if (!modalYarn.classList.contains('active')) {
            unlockScroll();
        }
        
        giftButton.focus();
    }

    /**
     * Open yarn confirmation modal
     */
    function openYarnModal() {
        modalYarn.classList.add('active');
        modalYarn.focus();
    }

    /**
     * Close yarn modal
     */
    function closeYarnModal() {
        modalYarn.classList.remove('active');
        
        // Keep scroll locked if gifts modal is still open
        if (!modalGifts.classList.contains('active')) {
            unlockScroll();
        }
    }

    /**
     * Reveal gifts one by one with delay
     */
    function revealGiftsSequentially() {
        const gifts = [giftIphone, giftTickets, giftYarn, giftOther];
        const delay = prefersReducedMotion() ? 100 : 400;
        
        gifts.forEach((gift, index) => {
            setTimeout(() => {
                gift.classList.add('visible');
                gift.setAttribute('tabindex', '0');
            }, delay * (index + 1));
        });
    }

    // ===== Gift Behaviors =====
    
    /**
     * iPhone: Hide on hover, show on leave
     */
    function initIphoneBehavior() {
        giftIphone.addEventListener('mouseenter', () => {
            giftIphone.classList.add('hidden');
        });
        
        giftIphone.addEventListener('mouseleave', () => {
            giftIphone.classList.remove('hidden');
        });
        
        // Touch support: toggle on tap
        let iphoneTouched = false;
        giftIphone.addEventListener('touchstart', (e) => {
            if (!iphoneTouched) {
                e.preventDefault();
                giftIphone.classList.add('hidden');
                iphoneTouched = true;
                
                // Reset after a short delay
                setTimeout(() => {
                    giftIphone.classList.remove('hidden');
                    iphoneTouched = false;
                }, 1500);
            }
        }, { passive: false });
    }

    /**
     * Tickets: Run away from cursor across the entire screen with edge bouncing
     */
    function initTicketsBehavior() {
        let ticketPosX = 0;  // Absolute screen position
        let ticketPosY = 0;
        let isRunning = false;
        let initialRect = null;
        const elementWidth = 90;   // Fixed width when running
        const elementHeight = 90;  // Fixed height when running
        const padding = 10;  // Padding from screen edges
        
        function startRunning() {
            if (isRunning) return;
            
            // Get initial position before switching to fixed
            initialRect = giftTickets.getBoundingClientRect();
            ticketPosX = initialRect.left;
            ticketPosY = initialRect.top;
            
            // Switch to fixed positioning
            giftTickets.classList.add('running');
            giftTickets.style.left = ticketPosX + 'px';
            giftTickets.style.top = ticketPosY + 'px';
            
            isRunning = true;
        }
        
        function runAwayFromCursor(e) {
            startRunning();
            
            // Get element center
            const centerX = ticketPosX + elementWidth / 2;
            const centerY = ticketPosY + elementHeight / 2;
            
            // Direction from cursor to element center
            let dirX = centerX - e.clientX;
            let dirY = centerY - e.clientY;
            
            // Normalize and apply movement
            const distance = Math.sqrt(dirX * dirX + dirY * dirY);
            if (distance < 1) return;
            
            const moveDistance = 80;
            let moveX = (dirX / distance) * moveDistance;
            let moveY = (dirY / distance) * moveDistance;
            
            // Calculate new position
            let newX = ticketPosX + moveX;
            let newY = ticketPosY + moveY;
            
            // Screen bounds
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            const minX = padding;
            const maxX = screenWidth - elementWidth - padding;
            const minY = padding;
            const maxY = screenHeight - elementHeight - padding;
            
            // Bounce off edges
            if (newX < minX) {
                newX = minX + (minX - newX); // Bounce back
                if (newX > maxX) newX = maxX;
            } else if (newX > maxX) {
                newX = maxX - (newX - maxX); // Bounce back
                if (newX < minX) newX = minX;
            }
            
            if (newY < minY) {
                newY = minY + (minY - newY); // Bounce back
                if (newY > maxY) newY = maxY;
            } else if (newY > maxY) {
                newY = maxY - (newY - maxY); // Bounce back
                if (newY < minY) newY = minY;
            }
            
            ticketPosX = newX;
            ticketPosY = newY;
            
            giftTickets.style.left = ticketPosX + 'px';
            giftTickets.style.top = ticketPosY + 'px';
        }
        
        giftTickets.addEventListener('mouseenter', (e) => {
            runAwayFromCursor(e);
        });
        
        giftTickets.addEventListener('mousemove', (e) => {
            if (isRunning) {
                runAwayFromCursor(e);
            }
        });
        
        // Also track mouse movement on the entire document when running
        document.addEventListener('mousemove', (e) => {
            if (!isRunning) return;
            
            // Check if mouse is close to the tickets
            const centerX = ticketPosX + elementWidth / 2;
            const centerY = ticketPosY + elementHeight / 2;
            const distanceToMouse = Math.sqrt(
                Math.pow(e.clientX - centerX, 2) + 
                Math.pow(e.clientY - centerY, 2)
            );
            
            // Run away if mouse is within 150px
            if (distanceToMouse < 150) {
                runAwayFromCursor(e);
            }
        });
        
        // Touch support
        giftTickets.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startRunning();
            
            const touch = e.touches[0];
            
            // Calculate direction away from touch
            const centerX = ticketPosX + elementWidth / 2;
            const centerY = ticketPosY + elementHeight / 2;
            let dirX = centerX - touch.clientX;
            let dirY = centerY - touch.clientY;
            
            const distance = Math.sqrt(dirX * dirX + dirY * dirY);
            if (distance < 1) {
                // Random direction if touch is at center
                const angle = Math.random() * Math.PI * 2;
                dirX = Math.cos(angle);
                dirY = Math.sin(angle);
            } else {
                dirX /= distance;
                dirY /= distance;
            }
            
            const moveDistance = 100;
            let newX = ticketPosX + dirX * moveDistance;
            let newY = ticketPosY + dirY * moveDistance;
            
            // Screen bounds
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            const minX = padding;
            const maxX = screenWidth - elementWidth - padding;
            const minY = padding;
            const maxY = screenHeight - elementHeight - padding;
            
            // Bounce off edges
            if (newX < minX) newX = minX + (minX - newX);
            if (newX > maxX) newX = maxX - (newX - maxX);
            if (newY < minY) newY = minY + (minY - newY);
            if (newY > maxY) newY = maxY - (newY - maxY);
            
            // Clamp to bounds
            newX = Math.max(minX, Math.min(maxX, newX));
            newY = Math.max(minY, Math.min(maxY, newY));
            
            ticketPosX = newX;
            ticketPosY = newY;
            
            giftTickets.style.left = ticketPosX + 'px';
            giftTickets.style.top = ticketPosY + 'px';
        }, { passive: false });
    }

    /**
     * Yarn: Open second modal on click
     */
    function initYarnBehavior() {
        giftYarn.addEventListener('click', () => {
            openYarnModal();
        });
        
        giftYarn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openYarnModal();
            }
        });
    }

    // ===== Event Listeners =====
    
    /**
     * Initialize all event listeners
     */
    function initEventListeners() {
        // Gift button click
        giftButton.addEventListener('click', openGiftsModal);
        
        // Close gifts modal
        closeModalGifts.addEventListener('click', closeGiftsModal);
        
        // Close modal on overlay click
        modalGifts.addEventListener('click', (e) => {
            if (e.target === modalGifts) {
                closeGiftsModal();
            }
        });
        
        modalYarn.addEventListener('click', (e) => {
            if (e.target === modalYarn) {
                closeYarnModal();
            }
        });
        
        // Yarn modal buttons
        btnYarnYes.addEventListener('click', closeYarnModal);
        btnYarnNo.addEventListener('click', closeYarnModal);
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (modalYarn.classList.contains('active')) {
                    closeYarnModal();
                } else if (modalGifts.classList.contains('active')) {
                    closeGiftsModal();
                }
            }
        });
        
        // Initialize gift behaviors
        initIphoneBehavior();
        initTicketsBehavior();
        initYarnBehavior();
    }

    // ===== Scroll Observer =====
    
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
                cakeLanded = true;
                
                // Show gift button immediately (since animation already played)
                setTimeout(() => {
                    showGiftButton();
                }, 500);
                return;
            }
        } catch (e) {
            // SessionStorage not available, continue normally
        }

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.4
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animationTriggered) {
                    setTimeout(() => {
                        triggerSurpriseAnimation();
                    }, 100);
                    
                    observer.disconnect();
                }
            });
        }, observerOptions);

        if (surpriseSection) {
            observer.observe(surpriseSection);
        }
    }

    /**
     * Handle reduced motion preference
     */
    function handleReducedMotion() {
        if (prefersReducedMotion()) {
            cake.style.transform = 'translateY(0)';
            cake.style.opacity = '1';
            giftText.style.opacity = '1';
            giftText.style.transform = 'translateY(0)';
            animationTriggered = true;
            cakeLanded = true;
            
            // Show button with minimal delay
            setTimeout(showGiftButton, 1000);
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

    // ===== Initialization =====
    
    /**
     * Initialize everything when DOM is ready
     */
    function init() {
        handleReducedMotion();
        initScrollObserver();
        initScrollHint();
        initParallax();
        initEventListeners();
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
