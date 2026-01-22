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
    
    // Final screen elements
    const finalScreen = document.getElementById('finalScreen');
    const finalButton = document.getElementById('finalButton');
    const modalFinal = document.getElementById('modalFinal');
    const finalTextContainer = document.getElementById('finalTextContainer');
    const finalWords = [
        document.getElementById('word1'),
        document.getElementById('word2'),
        document.getElementById('word3')
    ];
    const finalGiftReveal = document.getElementById('finalGiftReveal');
    const variantCards = document.getElementById('variantCards');

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
     * Tickets: Run away from cursor across the entire screen
     */
    function initTicketsBehavior() {
        let isRunning = false;
        let currentX = 0;  // Current absolute X position
        let currentY = 0;  // Current absolute Y position
        let baseX = 0;     // Initial X position in flow
        let baseY = 0;     // Initial Y position in flow
        const elementSize = 90;
        const padding = 10;
        const triggerDistance = 150;  // Реагирует с большего расстояния
        const moveSpeed = 120;        // Быстрее убегает
        
        function startRunning() {
            if (isRunning) return;
            
            // Get current visual position
            const rect = giftTickets.getBoundingClientRect();
            baseX = rect.left;
            baseY = rect.top;
            currentX = rect.left;
            currentY = rect.top;
            
            giftTickets.classList.add('running');
            isRunning = true;
        }
        
        function moveTickets(mouseX, mouseY) {
            // Calculate center of element
            const centerX = currentX + elementSize / 2;
            const centerY = currentY + elementSize / 2;
            
            // Distance from cursor to element center
            const dx = centerX - mouseX;
            const dy = centerY - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 1 || dist > triggerDistance) return;
            
            // Move away from cursor
            const strength = (triggerDistance - dist) / triggerDistance;
            const moveX = (dx / dist) * moveSpeed * strength;
            const moveY = (dy / dist) * moveSpeed * strength;
            
            let newX = currentX + moveX;
            let newY = currentY + moveY;
            
            // Screen bounds
            const minX = padding;
            const maxX = window.innerWidth - elementSize - padding;
            const minY = padding;
            const maxY = window.innerHeight - elementSize - padding;
            
            // Clamp to bounds
            newX = Math.max(minX, Math.min(maxX, newX));
            newY = Math.max(minY, Math.min(maxY, newY));
            
            currentX = newX;
            currentY = newY;
            
            // Apply as transform offset from base position
            const offsetX = currentX - baseX;
            const offsetY = currentY - baseY;
            giftTickets.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        }
        
        // Track mouse movement on the entire document
        document.addEventListener('mousemove', (e) => {
            if (!giftTickets.classList.contains('visible')) return;
            
            // Start running on first close approach
            if (!isRunning) {
                const rect = giftTickets.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const dist = Math.sqrt(
                    Math.pow(e.clientX - centerX, 2) + 
                    Math.pow(e.clientY - centerY, 2)
                );
                if (dist < triggerDistance) {
                    startRunning();
                }
            }
            
            if (isRunning) {
                moveTickets(e.clientX, e.clientY);
            }
        });
        
        // Touch support
        giftTickets.addEventListener('touchstart', (e) => {
            if (!giftTickets.classList.contains('visible')) return;
            e.preventDefault();
            
            if (!isRunning) startRunning();
            
            const touch = e.touches[0];
            // Move in random direction on touch
            const angle = Math.random() * Math.PI * 2;
            const fakeMouseX = currentX + elementSize / 2 - Math.cos(angle) * 50;
            const fakeMouseY = currentY + elementSize / 2 - Math.sin(angle) * 50;
            moveTickets(fakeMouseX, fakeMouseY);
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

    // ===== Final Sequence (Other Gift) =====
    
    let finalSequenceTriggered = false;
    
    /**
     * Trigger the spiral animation and transition to final screen
     */
    function triggerFinalSequence() {
        if (finalSequenceTriggered) return;
        finalSequenceTriggered = true;
        
        // Close the gifts modal first
        closeGiftsModal();
        
        // Create wrapper for spiral animation if not exists
        let pageWrapper = document.querySelector('.page-wrapper');
        if (!pageWrapper) {
            pageWrapper = document.createElement('div');
            pageWrapper.className = 'page-wrapper';
            
            // Move all body children except final-screen and modals into wrapper
            const children = Array.from(document.body.children);
            children.forEach(child => {
                if (!child.classList.contains('final-screen') && 
                    !child.classList.contains('modal-overlay') &&
                    child.tagName !== 'SCRIPT') {
                    pageWrapper.appendChild(child);
                }
            });
            document.body.insertBefore(pageWrapper, document.body.firstChild);
        }
        
        // Lock interactions during animation
        document.body.style.overflow = 'hidden';
        document.body.style.pointerEvents = 'none';
        
        // Start spiral animation
        setTimeout(() => {
            pageWrapper.classList.add('spiral-out');
            
            // Show final screen after spiral animation completes
            const animDuration = prefersReducedMotion() ? 600 : 4800;
            setTimeout(() => {
                pageWrapper.style.display = 'none';
                showFinalScreen();
            }, animDuration);
        }, 100);
    }
    
    /**
     * Show the white final screen
     */
    function showFinalScreen() {
        document.body.style.overflow = '';
        document.body.style.pointerEvents = '';
        
        finalScreen.classList.add('active');
        finalButton.focus();
    }
    
    /**
     * Open the final modal with word-by-word reveal
     */
    function openFinalModal() {
        // Reset all words to hidden state
        finalWords.forEach(word => word.classList.remove('visible'));
        finalGiftReveal.classList.remove('visible');
        variantCards.classList.remove('visible');
        
        modalFinal.classList.add('active');
        lockScroll();
        
        // Start word-by-word reveal
        revealFinalText();
    }
    
    /**
     * Close the final modal
     */
    function closeFinalModal() {
        modalFinal.classList.remove('active');
        unlockScroll();
    }
    
    /**
     * Reveal text word by word with delays
     */
    function revealFinalText() {
        const wordDelay = 1000;
        
        // "твой" - immediately
        setTimeout(() => {
            finalWords[0].classList.add('visible');
        }, 300);
        
        // "подарок" - after 1000ms
        setTimeout(() => {
            finalWords[1].classList.add('visible');
        }, 300 + wordDelay);
        
        // "это" - after 2000ms
        setTimeout(() => {
            finalWords[2].classList.add('visible');
        }, 300 + wordDelay * 2);
        
        // "КОНДИТЕРСКИЙ МАСТЕР-КЛАСС" - after 3000ms
        setTimeout(() => {
            finalGiftReveal.classList.add('visible');
        }, 300 + wordDelay * 3);
        
        // Variant cards - 2 seconds after gift reveal (5000ms total)
        setTimeout(() => {
            variantCards.classList.add('visible');
        }, 300 + wordDelay * 3 + 2000);
    }
    
    /**
     * Other gift: Trigger final sequence on click
     */
    function initOtherBehavior() {
        giftOther.addEventListener('click', () => {
            triggerFinalSequence();
        });
        
        giftOther.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                triggerFinalSequence();
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
                if (modalFinal.classList.contains('active')) {
                    closeFinalModal();
                } else if (modalYarn.classList.contains('active')) {
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
        initOtherBehavior();
        
        // Final button click
        finalButton.addEventListener('click', openFinalModal);
        
        // Close final modal on overlay click
        modalFinal.addEventListener('click', (e) => {
            if (e.target === modalFinal) {
                closeFinalModal();
            }
        });
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
