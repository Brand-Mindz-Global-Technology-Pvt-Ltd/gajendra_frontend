// Header start
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
}
// Header End

/**
 * Testimonial Carousel - Infinite/Circular Auto-scroll with progress bars
 * Uses Tailwind CSS classes instead of inline styles
 * Features:
 * - 5 cards with auto-scrolling
 * - Center card is active/popped up
 * - Only 2 side cards visible (half-displayed, blurred)
 * - Infinite loop (5→1, 1→5)
 * - Progress bar for each card
 * - Fully responsive
 */

document.addEventListener('DOMContentLoaded', function () {
    const carouselContainer = document.getElementById('testimonial-carousel');
    const originalCards = document.querySelectorAll('.testimonial-card');
    const progressBars = document.querySelectorAll('.progress-bar-item');

    if (!carouselContainer || originalCards.length === 0) return;

    const totalCards = originalCards.length;
    let currentIndex = 0;
    const autoScrollDuration = 4000; // 4 seconds per card
    const progressInterval = 50; // Update progress every 50ms
    let progressTimer = null;
    let scrollTimer = null;
    let currentProgress = 0;

    // Tailwind classes for different card positions
    const cardClasses = {
        center: {
            add: ['scale-100', 'opacity-100', 'blur-none', 'z-10'],
            remove: ['scale-[0.9]', 'opacity-60', 'blur-[3px]', 'z-[5]', 'translate-x-[70%]', '-translate-x-[70%]']
        },
        left: {
            add: ['scale-[0.9]', 'opacity-60', 'blur-[3px]', 'z-[5]', 'translate-x-[70%]'],
            remove: ['scale-100', 'opacity-100', 'blur-none', 'z-10', '-translate-x-[70%]']
        },
        right: {
            add: ['scale-[0.9]', 'opacity-60', 'blur-[3px]', 'z-[5]', '-translate-x-[70%]'],
            remove: ['scale-100', 'opacity-100', 'blur-none', 'z-10', 'translate-x-[70%]']
        }
    };

    // Get card index with wrapping (circular)
    function getWrappedIndex(index) {
        return ((index % totalCards) + totalCards) % totalCards;
    }

    // Update which cards are visible and their positions
    function updateVisibleCards() {
        carouselContainer.innerHTML = '';

        // We only show 3 cards: previous, current, next (with wrapping for infinite loop)
        const prevIndex = getWrappedIndex(currentIndex - 1);
        const nextIndex = getWrappedIndex(currentIndex + 1);

        // Create card elements
        const positions = [
            { index: prevIndex, position: 'left' },
            { index: currentIndex, position: 'center' },
            { index: nextIndex, position: 'right' }
        ];

        positions.forEach(({ index, position }) => {
            const cardClone = originalCards[index].cloneNode(true);
            cardClone.setAttribute('data-position', position);
            cardClone.setAttribute('data-original-index', index);

            // Remove all position classes first
            cardClone.classList.remove(
                'scale-100', 'scale-[0.9]',
                'opacity-100', 'opacity-60',
                'blur-none', 'blur-[3px]',
                'z-10', 'z-[5]',
                'translate-x-[70%]', '-translate-x-[70%]'
            );

            // Add base transition classes
            cardClone.classList.add('transition-all', 'duration-500', 'ease-out', 'flex-shrink-0');

            // Apply position-based Tailwind classes
            const classes = cardClasses[position];
            classes.add.forEach(cls => cardClone.classList.add(cls));

            carouselContainer.appendChild(cardClone);
        });

        // Update progress bar states
        updateProgressBars();
    }

    // Update progress bar indicators
    function updateProgressBars() {
        progressBars.forEach((bar, index) => {
            const fill = bar.querySelector('.progress-fill');
            if (index < currentIndex) {
                fill.style.width = '100%';
            } else if (index === currentIndex) {
                // Current - will be animated
                fill.style.width = '0%';
            } else {
                fill.style.width = '0%';
            }
        });
    }

    // Animate progress bar
    function animateProgress() {
        currentProgress = 0;
        const fill = progressBars[currentIndex].querySelector('.progress-fill');

        clearInterval(progressTimer);

        progressTimer = setInterval(() => {
            currentProgress += (progressInterval / autoScrollDuration) * 100;
            fill.style.width = `${Math.min(currentProgress, 100)}%`;

            if (currentProgress >= 100) {
                clearInterval(progressTimer);
            }
        }, progressInterval);
    }

    // Go to specific card
    function goToCard(index) {
        clearInterval(progressTimer);
        clearTimeout(scrollTimer);

        // Handle wrapping for infinite loop
        currentIndex = getWrappedIndex(index);

        // If we've completed a full loop, reset progress bars
        if (index >= totalCards) {
            progressBars.forEach(bar => {
                bar.querySelector('.progress-fill').style.width = '0%';
            });
        }

        updateVisibleCards();
        animateProgress();
        startAutoScroll();
    }

    // Next card
    function nextCard() {
        goToCard(currentIndex + 1);
    }

    // Previous card
    function prevCard() {
        goToCard(currentIndex - 1);
    }

    // Start auto-scroll
    function startAutoScroll() {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            nextCard();
        }, autoScrollDuration);
    }

    // Handle progress bar clicks
    progressBars.forEach((bar, index) => {
        bar.addEventListener('click', () => {
            goToCard(index);
        });
    });

    // Pause on hover
    carouselContainer.addEventListener('mouseenter', () => {
        clearInterval(progressTimer);
        clearTimeout(scrollTimer);
    });

    carouselContainer.addEventListener('mouseleave', () => {
        animateProgress();
        startAutoScroll();
    });

    // Touch support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    carouselContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        clearInterval(progressTimer);
        clearTimeout(scrollTimer);
    }, { passive: true });

    carouselContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next card
                nextCard();
            } else {
                // Swipe right - previous card
                prevCard();
            }
        } else {
            animateProgress();
            startAutoScroll();
        }
    }

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            updateVisibleCards();
        }, 100);
    });

    // Initialize
    updateVisibleCards();
    animateProgress();
    startAutoScroll();
});
