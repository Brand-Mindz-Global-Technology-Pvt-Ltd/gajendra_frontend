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
    loadBestSellers();
});

async function loadBestSellers() {
    const track = document.getElementById('bestseller-track');
    if (!track) return;

    try {
        const res = await fetch('https://gajendhrademo.brandmindz.com/routes/auth/shop/get_products.php?is_best_seller=1');
        const data = await res.json();

        if (!data.success || !data.products || data.products.length === 0) {
            track.innerHTML = '<p class="text-white text-center w-full">No best selling products at the moment.</p>';
            return;
        }

        renderBestSellers(data.products);
    } catch (err) {
        console.error("Error loading best sellers:", err);
    }
}

function renderBestSellers(products) {
    const track = document.getElementById('bestseller-track');
    track.innerHTML = products.map(p => `
        <div class="w-full sm:w-1/2 lg:w-1/3 flex-shrink-0 px-3 h-full">
            <div class="bg-transparent rounded-lg overflow-hidden h-full flex flex-col relative group">
                <!-- Best Seller Tag (Gradient) -->
                <div class="absolute top-4 left-0 bg-gradient-to-r from-[#eaa956] to-[#ad632a] text-white text-xs font-bold px-8 py-1.5 z-10 shadow-md font-poppins transform -rotate-45 origin-bottom-left"
                    style="clip-path: polygon(0 0, 100% 0, 85% 100%, 0% 100%); box-shadow: 2px 2px 5px rgba(0,0,0,0.3);">
                    <i class="fas fa-star mr-1"></i> Best Seller
                </div>

                <!-- Image -->
                <div class="relative h-56 overflow-hidden shadow-xl">
                    <img src="${p.images[0] || 'https://placehold.co/400x300'}" alt="${p.name}"
                        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110">
                </div>

                <!-- Content -->
                <div class="pt-5 flex-grow flex flex-col justify-between">
                    <div>
                        <h3 class="font-poppins font-semibold text-2xl text-white mb-1">${p.name}</h3>
                        <div class="flex text-[#F59E0B] text-base mb-2">
                            <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                        </div>
                        <p class="font-poppins text-white font-medium mb-4 text-lg">Rs : ${p.price}</p>
                    </div>
                    <button onclick="window.location.href='/shop/singleproduct.html?product_id=${p.id}'"
                        class="w-full bg-[#B06D36] hover:bg-[#8f5424] text-white font-poppins font-medium py-3 rounded transition-colors uppercase text-sm tracking-wider shadow-lg">Buy
                        Now</button>
                </div>
            </div>
        </div>
    `).join('');

    // Re-initialize carousel variables if needed
    initializeBestSellerCarousel();
}

let bestSellerIndex = 0;
function initializeBestSellerCarousel() {
    const track = document.getElementById('bestseller-track');
    if (!track) return;

    window.moveBestSellerX = function (direction) {
        const items = track.children;
        const totalItems = items.length;
        let itemsVisible = getItemsVisible();
        const maxIndex = Math.max(0, totalItems - itemsVisible);

        bestSellerIndex += direction;

        if (bestSellerIndex < 0) {
            bestSellerIndex = maxIndex;
        } else if (bestSellerIndex > maxIndex) {
            bestSellerIndex = 0;
        }

        updateBestSellerCarousel();
    }

    function updateBestSellerCarousel() {
        const itemWidthPercent = 100 / getItemsVisible();
        const translateX = -(bestSellerIndex * itemWidthPercent);
        track.style.transform = `translateX(${translateX}%)`;
    }

    function getItemsVisible() {
        if (window.innerWidth >= 1024) return 3;
        if (window.innerWidth >= 640) return 2;
        return 1;
    }

    // Reset on resize
    window.addEventListener('resize', () => {
        bestSellerIndex = 0;
        updateBestSellerCarousel();
    });
}

// Testimonial Carousel Logic - 3 Cards Display with Infinite Loop
// Testimonial Carousel - Infinite/Circular Auto-scroll with progress bars
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
            if (fill) fill.style.width = `${Math.min(currentProgress, 100)}%`;

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
                const fill = bar.querySelector('.progress-fill');
                if (fill) fill.style.width = '0%';
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
