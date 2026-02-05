import { HeaderInitializer } from '../Assets/js/utils/headerInitializer.js';

document.addEventListener('DOMContentLoaded', () => {
    HeaderInitializer.init();
});

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
    const autoScrollDuration = 4000;
    const progressInterval = 50;
    let progressTimer = null;
    let scrollTimer = null;
    let currentProgress = 0;

    const cardClasses = {
        center: {
            add: ['scale-100', 'opacity-100', 'z-10'],
            remove: ['scale-90', 'opacity-70', 'z-[5]', 'translate-x-[35%]', '-translate-x-[35%]']
        },
        left: {
            add: ['scale-90', 'opacity-70', 'z-[5]', 'translate-x-[35%]'],
            remove: ['scale-100', 'opacity-100', 'z-10', '-translate-x-[35%]']
        },
        right: {
            add: ['scale-90', 'opacity-70', 'z-[5]', '-translate-x-[35%]'],
            remove: ['scale-100', 'opacity-100', 'z-10', 'translate-x-[35%]']
        }
    };

    // Get card index with wrapping (circular)
    function getWrappedIndex(index) {
        return ((index % totalCards) + totalCards) % totalCards;
    }

    function updateVisibleCards() {
        carouselContainer.innerHTML = '';

        const isMobile = window.innerWidth < 640;

        if (isMobile) {
            // ✅ MOBILE: show only ONE card
            const cardClone = originalCards[currentIndex].cloneNode(true);

            cardClone.className = originalCards[currentIndex].className;
            cardClone.classList.add('scale-100', 'opacity-100', 'z-10');

            cardClone.addEventListener('click', () => {
                goToCard(currentIndex);
            });

            carouselContainer.appendChild(cardClone);
            updateProgressBars();
            return;
        }

        // ✅ DESKTOP: show 3 cards
        const prevIndex = getWrappedIndex(currentIndex - 1);
        const nextIndex = getWrappedIndex(currentIndex + 1);

        const positions = [
            { index: prevIndex, position: 'left' },
            { index: currentIndex, position: 'center' },
            { index: nextIndex, position: 'right' }
        ];

        positions.forEach(({ index, position }) => {
            const cardClone = originalCards[index].cloneNode(true);

            cardClone.className = originalCards[index].className;
            cardClone.setAttribute('data-original-index', index);

            cardClone.classList.remove(
                ...cardClasses.center.add, ...cardClasses.left.add, ...cardClasses.right.add,
                ...cardClasses.center.remove, ...cardClasses.left.remove, ...cardClasses.right.remove
            );

            const classes = cardClasses[position];
            classes.add.forEach(cls => cardClone.classList.add(cls));

            cardClone.addEventListener('mouseenter', () => {
                clearInterval(progressTimer);
                clearTimeout(scrollTimer);
            });

            cardClone.addEventListener('mouseleave', () => {
                animateProgress();
                startAutoScroll();
            });

            // click → make center
            cardClone.addEventListener('click', () => {
                goToCard(index);
            });

            carouselContainer.appendChild(cardClone);
        });

        updateProgressBars();
    }

    // Update progress bar indicators
    function updateProgressBars() {
        progressBars.forEach((bar, index) => {
            const fill = bar.querySelector('.progress-fill');
            if (index < currentIndex) {
                fill.style.width = '100%';
            } else if (index === currentIndex) {
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
            if (fill) fill.style.width = `${Math.min(currentProgress, 100)}%`;
            if (currentProgress >= 100) clearInterval(progressTimer);
        }, progressInterval);
    }

    // Go to specific card
    function goToCard(index) {
        clearInterval(progressTimer);
        clearTimeout(scrollTimer);
        currentIndex = getWrappedIndex(index);
        if (index >= totalCards) {
            progressBars.forEach(bar => {
                const fill = bar.querySelector('.progress-fill');
                if (fill) fill.style.width = '0%';
            });
        }
        updateVisibleCards();
        animateProgress();
        startAutoScroll();
    }

    // Next card
    function nextCard() { goToCard(currentIndex + 1); }

    // Previous card
    function prevCard() { goToCard(currentIndex - 1); }

    // Start auto-scroll
    function startAutoScroll() {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => { nextCard(); }, autoScrollDuration);
    }

    // Handle progress bar clicks
    progressBars.forEach((bar, index) => { bar.addEventListener('click', () => { goToCard(index); }); });

    // Pause on hover
    carouselContainer.addEventListener('mouseenter', () => { clearInterval(progressTimer); clearTimeout(scrollTimer); });
    carouselContainer.addEventListener('mouseleave', () => { animateProgress(); startAutoScroll(); });

    // Touch support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    carouselContainer.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; clearInterval(progressTimer); clearTimeout(scrollTimer); }, { passive: true });
    carouselContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) nextCard(); else prevCard();
        } else {
            animateProgress(); startAutoScroll();
        }
    }, { passive: true });

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { updateVisibleCards(); }, 100); });

    // Initialize
    updateVisibleCards();
    animateProgress();
    startAutoScroll();
});
