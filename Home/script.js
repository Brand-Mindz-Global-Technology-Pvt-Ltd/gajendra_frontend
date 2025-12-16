// Header start
function toggleMobileMenu() {
            const menu = document.getElementById('mobile-menu');
            menu.classList.toggle('hidden');
        }
// Header End

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('category-container');
    const items = container.children;
    const totalItems = items.length;
    let currentIndex = 0;

    window.moveCarousel = function (direction) {
        // Only run on mobile
        if (window.innerWidth >= 768) return;

        currentIndex += direction;

        if (currentIndex < 0) {
            currentIndex = totalItems - 1;
        } else if (currentIndex >= totalItems) {
            currentIndex = 0;
        }

        updateCarousel();
    }

    function updateCarousel() {
        // Slide by 100% of the container width per item
        const translateX = -(currentIndex * 100);

        // Apply transform to each item to move them
        // iterating through HTMLCollection
        Array.from(items).forEach(item => {
            item.style.transform = `translateX(${translateX}%)`;
        });
    }

    // Optional: Reset carousel on resize to avoid stuck states
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
            // Reset transforms for grid view
            Array.from(items).forEach(item => {
                item.style.transform = 'none';
            });
            currentIndex = 0;
        } else {
            updateCarousel();
        }
    });
});

// Best Seller Carousel Logic
document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('bestseller-track');
    // Ensure track exists to avoid errors on other pages if script is shared
    if (!track) return;

    const items = track.children;
    const totalItems = items.length;
    let currentIndex = 0;

    window.moveBestSellerX = function (direction) {
        // Determine items visible based on screen size
        let itemsVisible = 1;
        if (window.innerWidth >= 1024) { // lg
            itemsVisible = 3;
        } else if (window.innerWidth >= 640) { // sm
            itemsVisible = 2;
        }

        const maxIndex = totalItems - itemsVisible;

        currentIndex += direction;

        // Loop logic or Bound logic?
        // User said "manual scrolling". Usually infinite loop or stop at end.
        // Let's implement infinite loop behavior for better UX.

        if (currentIndex < 0) {
            currentIndex = maxIndex;
        } else if (currentIndex > maxIndex) {
            currentIndex = 0;
        }

        updateBestSellerCarousel();
    }

    function updateBestSellerCarousel() {
        const itemWidthPercent = 100 / getItemsVisible();
        const translateX = -(currentIndex * itemWidthPercent);
        track.style.transform = `translateX(${translateX}%)`;
    }

    function getItemsVisible() {
        if (window.innerWidth >= 1024) return 3; // 3 items on Desktop
        if (window.innerWidth >= 640) return 2; // 2 items on Tablet
        return 1; // 1 item on Mobile
    }

    // Reset on resize
    window.addEventListener('resize', () => {
        currentIndex = 0;
        updateBestSellerCarousel();
    });
});

// Testimonial Carousel Logic - 3 Cards Display with Infinite Loop
document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('testimonial-track');
    const container = document.getElementById('testimonial-container');
    const originalCards = Array.from(document.querySelectorAll('.testimonial-card'));
    const progressBars = document.querySelectorAll('.testimonial-progress');

    if (!track || !container || originalCards.length === 0) return;

    const totalOriginalCards = originalCards.length;
    let currentIndex = 0;
    let autoScrollInterval;
    let isTransitioning = false;

    // Clone first 3 cards and append to end for seamless infinite loop
    originalCards.slice(0, 3).forEach(card => {
        const clone = card.cloneNode(true);
        clone.classList.add('testimonial-clone');
        track.appendChild(clone);
    });

    const allCards = Array.from(document.querySelectorAll('.testimonial-card'));

    function getCardsPerView() {
        // Mobile: 1 card, Tablet: 2 cards, Desktop: 3 cards
        if (window.innerWidth >= 1024) return 3;
        if (window.innerWidth >= 768) return 3;
        return 1;
    }

    function updateCarousel(instant = false) {
        const cardsPerView = getCardsPerView();
        const cardWidth = 100 / cardsPerView; // Percentage width per card

        // Calculate translation
        const translatePercent = -(currentIndex * cardWidth);

        if (instant) {
            track.style.transition = 'none';
        } else {
            track.style.transition = 'transform 700ms ease-in-out';
        }

        track.style.transform = `translateX(${translatePercent}%)`;

        // Update card styles - center card(s) prominent, others faded
        allCards.forEach((card, index) => {
            const isVisible = index >= currentIndex && index < currentIndex + cardsPerView;
            const isCenterCard = cardsPerView === 3 ? index === currentIndex + 1 : index === currentIndex;

            if (isCenterCard) {
                // Center/active card
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
                card.style.filter = 'none';
            } else if (isVisible) {
                // Side visible cards
                card.style.opacity = '0.6';
                card.style.transform = 'scale(0.95)';
                card.style.filter = 'blur(1px)';
            } else {
                // Hidden cards
                card.style.opacity = '0.3';
                card.style.transform = 'scale(0.9)';
                card.style.filter = 'blur(2px)';
            }
        });

        // Update progress bars
        const progressIndex = currentIndex % totalOriginalCards;

        progressBars.forEach((bar, index) => {
            bar.style.transition = 'none';
            if (index < progressIndex) {
                bar.style.width = '100%';
            } else if (index > progressIndex) {
                bar.style.width = '0%';
            } else {
                bar.style.width = '0%';
            }
        });

        // Start progress animation for current card
        setTimeout(() => {
            const currentBar = progressBars[progressIndex];
            if (currentBar) {
                currentBar.style.transition = 'width 5000ms linear';
                currentBar.style.width = '100%';
            }
        }, 50);
    }

    function nextSlide() {
        if (isTransitioning) return;
        isTransitioning = true;

        currentIndex++;

        updateCarousel(false);

        // Check if we've reached the cloned cards
        if (currentIndex >= totalOriginalCards) {
            // Wait for transition to complete, then reset to start
            setTimeout(() => {
                currentIndex = 0;
                updateCarousel(true); // Instant jump back to start
                isTransitioning = false;
            }, 700);
        } else {
            setTimeout(() => {
                isTransitioning = false;
            }, 700);
        }
    }

    // Initialize
    setTimeout(() => {
        updateCarousel(true);
    }, 100);

    // Auto-scroll every 5 seconds
    autoScrollInterval = setInterval(nextSlide, 5000);

    // Handle window resize
    window.addEventListener('resize', () => {
        updateCarousel(true);
    });

    // Pause on hover
    container.addEventListener('mouseenter', () => {
        clearInterval(autoScrollInterval);
    });

    container.addEventListener('mouseleave', () => {
        autoScrollInterval = setInterval(nextSlide, 5000);
    });
});
