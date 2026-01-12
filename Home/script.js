// Header start
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
}
// Header End

console.log("✅ Home script loaded and running");

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('category-container');
    if (container) {
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
    }
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
                    <img src="${p.images && p.images[0] ? p.images[0] : 'https://placehold.co/400x300'}" alt="${p.name}"
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
        const itemsVisible = getItemsVisible();
        const itemWidthPercent = 100 / itemsVisible;
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

// Testimonial Carousel Logic
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

    function getWrappedIndex(index) {
        return ((index % totalCards) + totalCards) % totalCards;
    }

    function updateVisibleCards() {
        carouselContainer.innerHTML = '';
        const prevIndex = getWrappedIndex(currentIndex - 1);
        const nextIndex = getWrappedIndex(currentIndex + 1);

        const positions = [
            { index: prevIndex, position: 'left' },
            { index: currentIndex, position: 'center' },
            { index: nextIndex, position: 'right' }
        ];

        positions.forEach(({ index, position }) => {
            const cardClone = originalCards[index].cloneNode(true);
            cardClone.setAttribute('data-position', position);
            cardClone.setAttribute('data-original-index', index);
            cardClone.classList.remove(...cardClasses.center.remove, ...cardClasses.left.remove, ...cardClasses.right.remove);
            cardClone.classList.add('transition-all', 'duration-500', 'ease-out', 'flex-shrink-0');
            const classes = cardClasses[position];
            classes.add.forEach(cls => cardClone.classList.add(cls));
            carouselContainer.appendChild(cardClone);
        });
        updateProgressBars();
    }

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

    function nextCard() { goToCard(currentIndex + 1); }
    function prevCard() { goToCard(currentIndex - 1); }

    function startAutoScroll() {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => { nextCard(); }, autoScrollDuration);
    }

    progressBars.forEach((bar, index) => { bar.addEventListener('click', () => { goToCard(index); }); });

    carouselContainer.addEventListener('mouseenter', () => { clearInterval(progressTimer); clearTimeout(scrollTimer); });
    carouselContainer.addEventListener('mouseleave', () => { animateProgress(); startAutoScroll(); });

    // Touch Logic
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

    let resizeTimer;
    window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { updateVisibleCards(); }, 100); });

    updateVisibleCards();
    animateProgress();
    startAutoScroll();
});

// Savouries Section Logic
document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 DOMContentLoaded: Initializing Savouries Section");
    loadSavouriesSection();
});

async function loadSavouriesSection() {
    console.log("🚀 loadSavouriesSection called");
    const grid = document.getElementById('savouries-grid');
    const viewAllBtn = document.getElementById('savouries-view-all');
    if (!grid) {
        console.error("❌ savouries-grid not found in DOM");
        return;
    }

    try {
        // 1. Fetch Categories to find "Savouries" ID
        console.log("📡 Fetching categories...");
        const catRes = await fetch('https://gajendhrademo.brandmindz.com/routes/auth/shop/get_categories.php');
        const catData = await catRes.json();
        console.log("✅ Categories fetched:", catData);

        let localCategories = [];
        if (catData.success && catData.categories) {
            localCategories = catData.categories;
        } else if (Array.isArray(catData)) {
            localCategories = catData;
        }

        // Find "Savouries" (case insensitive)
        const savouriesCat = localCategories.find(c => c.name.toLowerCase().trim() === 'savouries');

        if (!savouriesCat) {
            console.warn("⚠️ 'Savouries' category not found in:", localCategories.map(c => c.name));
            grid.innerHTML = '<p class="col-span-full text-center text-gray-500">Savouries category not found.</p>';
            return;
        }
        console.log("✅ Found Savouries Category:", savouriesCat);

        // Update View All Link
        if (viewAllBtn) {
            viewAllBtn.onclick = () => {
                window.location.href = `/shop/shop.html?category=${savouriesCat.id}`;
            };
        }

        // 2. Fetch Products for this Category
        console.log(`📡 Fetching products for category ${savouriesCat.id}...`);
        const prodRes = await fetch(`https://gajendhrademo.brandmindz.com/routes/auth/shop/get_products.php?category_id=${savouriesCat.id}&limit=4`);
        const prodData = await prodRes.json();
        console.log("✅ Products fetched:", prodData);

        let products = [];
        if (prodData.status && prodData.products) {
            products = prodData.products;
        } else if (prodData.success && prodData.products) {
            products = prodData.products;
        }

        if (products.length === 0) {
            grid.innerHTML = '<p class="col-span-full text-center text-gray-500">No savouries available at the moment.</p>';
            return;
        }

        // 3. Render Products
        renderSavouries(products, grid);

    } catch (error) {
        console.error("❌ Error loading savouries:", error);
        grid.innerHTML = `<p class="col-span-full text-center text-red-500">Failed to load products. ${error.message}</p>`;
    }
}

function renderSavouries(products, container) {
    container.innerHTML = products.map(p => {
        let imageUrl = 'https://placehold.co/400x350';
        if (p.images && p.images.length > 0) {
            // Check if full URL or relative
            if (p.images[0].startsWith('http')) {
                imageUrl = p.images[0];
            } else {
                imageUrl = `https://gajendhrademo.brandmindz.com/routes/uploads/products/${p.images[0]}`;
            }
        }

        let displayPrice = "0.00";
        let variations = p.variations || [];

        if (typeof variations === 'string') {
            try { variations = JSON.parse(variations); } catch (e) { }
        }

        // Fix for API mismatch: API returns 'amount' and 'quantity', code expected 'price' and 'weight'
        // Normalize variations
        variations = variations.map(v => ({
            id: v.id || Math.random().toString(36).substr(2, 9), // Fallback ID if missing
            price: v.price || v.amount || 0,
            weight: v.weight || v.quantity || 'Standard'
        }));

        if (variations.length > 0) {
            variations.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            displayPrice = parseFloat(variations[0].price).toFixed(2);
        } else {
            displayPrice = parseFloat(p.price || p.amount || 0).toFixed(2);
        }

        let weightOptions = '';
        if (variations.length > 0) {
            weightOptions = variations.map((v) => `
                <option value="${v.id}" data-price="${v.price}">${v.weight} - Rs ${v.price}</option>
            `).join('');
        } else {
            weightOptions = '<option>Standard</option>';
        }

        return `
            <div class="border border-[#B06D36] rounded-[14px] p-2 relative group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div class="absolute top-4 right-4 z-20">
                    <button onclick="addToWishlist(${p.id})"
                        class="bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition w-9 h-9 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#3E1C00]" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364 4.318 12.682a4.5 4.5 0 010-6.364z" />
                        </svg>
                    </button>
                </div>

                <div class="w-full h-64 bg-gray-900 relative rounded-t-[12px] overflow-hidden cursor-pointer" 
                    onclick="window.location.href='/Product/product-details.html?id=${p.id}'">
                    <img src="${imageUrl}" alt="${p.name}"
                        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
                </div>

                <div class="bg-white border border-[#E8D1BB] rounded-[12px] p-4 relative -mt-4 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <div class="mb-3">
                        <h3 class="font-poppins font-bold text-lg text-[#3E1C00] leading-tight mb-1 truncate" title="${p.name}">${p.name}</h3>
                        <p class="font-poppins font-medium text-[#B06D36] text-sm product-price-display">Rs : ${displayPrice}</p>
                    </div>

                    <div class="mb-4">
                        <label class="block font-poppins text-xs text-gray-500 mb-1">Weight</label>
                        <div class="relative">
                            <select onchange="updateCardPrice(this)"
                                class="w-full appearance-none border border-[#E8D1BB] rounded-md px-3 py-2 font-poppins text-sm text-[#3E1C00] bg-transparent focus:outline-none focus:border-[#B06D36]">
                                ${weightOptions}
                            </select>
                            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#3E1C00]">
                                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center justify-between gap-3">
                        <div class="flex items-center bg-gray-50 rounded-md border border-[#E8D1BB] px-1 py-1">
                            <button onclick="changeCardQty(this, -1)"
                                class="w-7 h-7 bg-[#B06D36] text-white rounded-[4px] flex items-center justify-center hover:bg-[#8f5424] transition">
                                <span class="text-sm font-medium pt-0.5">-</span>
                            </button>
                            <span class="qty-display w-8 text-center font-poppins text-sm font-semibold text-[#3E1C00]">1</span>
                            <button onclick="changeCardQty(this, 1)"
                                class="w-7 h-7 bg-[#B06D36] text-white rounded-[4px] flex items-center justify-center hover:bg-[#8f5424] transition">
                                <span class="text-sm font-medium pt-0.5">+</span>
                            </button>
                        </div>
                        <button onclick="quickBuyNow(${p.id}, this)"
                            class="flex-1 bg-[#B06D36] hover:bg-[#8f5424] text-white font-poppins font-medium text-sm py-2 rounded-md transition shadow-md whitespace-nowrap">
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

window.updateCardPrice = function (selectElem) {
    const selectedOption = selectElem.options[selectElem.selectedIndex];
    const price = selectedOption.getAttribute('data-price');
    if (price) {
        const card = selectElem.closest('.bg-white');
        const priceDisplay = card.querySelector('.product-price-display');
        if (priceDisplay) {
            priceDisplay.textContent = `Rs : ${parseFloat(price).toFixed(2)}`;
        }
    }
}

window.changeCardQty = function (btn, change) {
    const container = btn.parentElement;
    const qtySpan = container.querySelector('.qty-display');
    let currentQty = parseInt(qtySpan.textContent);
    currentQty += change;
    if (currentQty < 1) currentQty = 1;
    qtySpan.textContent = currentQty;
}


window.quickBuyNow = function (productId, btn) {
    window.location.href = `/Product/product-details.html?id=${productId}`;
}

// Fallback for addToWishlist if not defined elsewhere
if (typeof window.addToWishlist === 'undefined') {
    window.addToWishlist = function (productId) {
        console.log(`Add to wishlist: ${productId}`);
        // Try to open wishlist if function exists
        if (typeof openWishlist === 'function') {
            openWishlist();
        } else {
            console.log('Wishlist/Popups not loaded fully');
        }
    };
}

// Sweet Section Logic
document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 DOMContentLoaded: Initializing Sweet Section");
    loadSweetsSection();
});

async function loadSweetsSection() {
    console.log("🚀 loadSweetsSection called");
    const grid = document.getElementById('sweets-grid');
    const viewAllBtn = document.getElementById('sweets-view-all');
    if (!grid) {
        console.error("❌ sweets-grid not found in DOM");
        return;
    }

    try {
        // 1. Fetch Categories to find "Sweet" ID
        console.log("📡 Fetching categories...");
        const catRes = await fetch('https://gajendhrademo.brandmindz.com/routes/auth/shop/get_categories.php');
        const catData = await catRes.json();
        // console.log("✅ Categories fetched:", catData); // Reduced logging

        let localCategories = [];
        if (catData.success && catData.categories) {
            localCategories = catData.categories;
        } else if (Array.isArray(catData)) {
            localCategories = catData;
        }

        // Find "Sweet" (case insensitive, partial match if needed, but strict is better usually)
        // Checking for "sweet" or "sweets"
        const sweetsCat = localCategories.find(c => {
            const name = c.name.toLowerCase().trim();
            return name === 'sweet' || name === 'sweets';
        });

        if (!sweetsCat) {
            console.warn("⚠️ 'Sweet' category not found in:", localCategories.map(c => c.name));
            grid.innerHTML = '<p class="col-span-full text-center text-white">Sweet category not found.</p>';
            return;
        }
        console.log("✅ Found Sweet Category:", sweetsCat);

        // Update View All Link
        if (viewAllBtn) {
            viewAllBtn.onclick = () => {
                window.location.href = `/shop/shop.html?category=${sweetsCat.id}`;
            };
        }

        // 2. Fetch Products for this Category
        console.log(`📡 Fetching products for category ${sweetsCat.id}...`);
        const prodRes = await fetch(`https://gajendhrademo.brandmindz.com/routes/auth/shop/get_products.php?category_id=${sweetsCat.id}&limit=4`);
        const prodData = await prodRes.json();
        console.log("✅ Products fetched:", prodData);

        let products = [];
        if (prodData.status && prodData.products) {
            products = prodData.products;
        } else if (prodData.success && prodData.products) {
            products = prodData.products;
        }

        if (products.length === 0) {
            grid.innerHTML = '<p class="col-span-full text-center text-white">No sweets available at the moment.</p>';
            return;
        }

        // 3. Render Products
        renderSweets(products, grid);

    } catch (error) {
        console.error("❌ Error loading sweets:", error);
        grid.innerHTML = `<p class="col-span-full text-center text-white">Failed to load products. ${error.message}</p>`;
    }
}

function renderSweets(products, container) {
    container.innerHTML = products.map(p => {
        let imageUrl = 'https://placehold.co/400x350';
        if (p.images && p.images.length > 0) {
            if (p.images[0].startsWith('http')) {
                imageUrl = p.images[0];
            } else {
                imageUrl = `https://gajendhrademo.brandmindz.com/routes/uploads/products/${p.images[0]}`;
            }
        }


        let displayPrice = "0.00";
        let variations = p.variations || [];

        if (typeof variations === 'string') {
            try { variations = JSON.parse(variations); } catch (e) { }
        }

        // Fix for API mismatch: API returns 'amount' and 'quantity'
        variations = variations.map(v => ({
            id: v.id || Math.random().toString(36).substr(2, 9),
            price: v.price || v.amount || 0,
            weight: v.weight || v.quantity || 'Standard'
        }));

        if (variations.length > 0) {
            variations.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            displayPrice = parseFloat(variations[0].price).toFixed(2);
        } else {
            displayPrice = parseFloat(p.price || p.amount || 0).toFixed(2);
        }

        let weightOptions = '';
        if (variations.length > 0) {
            weightOptions = variations.map((v) => `
                <option value="${v.id}" data-price="${v.price}">${v.weight} - Rs ${v.price}</option>
            `).join('');
        } else {
            weightOptions = '<option>Standard</option>';
        }

        return `
            <div class="border border-white rounded-[14px] p-2 relative group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <!-- Wishlist -->
                <div class="absolute top-4 right-4 z-20">
                    <button onclick="addToWishlist(${p.id})"
                        class="bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition w-9 h-9 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[#3E1C00]" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364 4.318 12.682a4.5 4.5 0 010-6.364z" />
                        </svg>
                    </button>
                </div>

                <div class="w-full h-64 bg-gray-900 relative rounded-t-[12px] overflow-hidden cursor-pointer"
                    onclick="window.location.href='/Product/product-details.html?id=${p.id}'">
                    <img src="${imageUrl}" alt="${p.name}"
                        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
                </div>

                <div class="bg-white border border-[#E8D1BB] rounded-[12px] p-4 relative -mt-4 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <div class="mb-3">
                        <h3 class="font-poppins font-bold text-lg text-[#3E1C00] leading-tight mb-1 truncate" title="${p.name}">${p.name}</h3>
                        <p class="font-poppins font-medium text-[#B06D36] text-sm product-price-display">Rs : ${displayPrice}</p>
                    </div>
                    <div class="mb-4">
                        <label class="block font-poppins text-xs text-gray-500 mb-1">Weight</label>
                        <div class="relative">
                            <select onchange="updateCardPrice(this)"
                                class="w-full appearance-none border border-[#E8D1BB] rounded-md px-3 py-2 font-poppins text-sm text-[#3E1C00] bg-transparent focus:outline-none focus:border-[#B06D36]">
                                ${weightOptions}
                            </select>
                            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#3E1C00]">
                                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center justify-between gap-3">
                        <div class="flex items-center bg-gray-50 rounded-md border border-[#E8D1BB] px-1 py-1">
                            <button onclick="changeCardQty(this, -1)"
                                class="w-7 h-7 bg-[#B06D36] text-white rounded-[4px] flex items-center justify-center hover:bg-[#8f5424] transition">
                                <span class="text-sm font-medium pt-0.5">-</span>
                            </button>
                            <span class="qty-display w-8 text-center font-poppins text-sm font-semibold text-[#3E1C00]">1</span>
                            <button onclick="changeCardQty(this, 1)"
                                class="w-7 h-7 bg-[#B06D36] text-white rounded-[4px] flex items-center justify-center hover:bg-[#8f5424] transition">
                                <span class="text-sm font-medium pt-0.5">+</span>
                            </button>
                        </div>
                        <button onclick="quickBuyNow(${p.id}, this)"
                            class="flex-1 bg-[#B06D36] hover:bg-[#8f5424] text-white font-poppins font-medium text-sm py-2 rounded-md transition shadow-md whitespace-nowrap">
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}
