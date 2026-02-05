import CONFIG from "../../config.js";
import { getProductImageUrl } from "../../utils/imageUtils.js";
import { calculateProductPrice } from "../../utils/priceUtils.js";

const ShopRenderer = {
    /**
     * Renders the category sidebar with subcategories
     */
    renderCategorySidebar(categories, currentFilters, onCatToggle, onSubClick) {
        const sidebar = document.getElementById("categorySidebar");
        if (!sidebar) return;

        const activeCatIds = Array.isArray(currentFilters.category_id) ? currentFilters.category_id : [];

        sidebar.innerHTML = categories.map(cat => {
            const isActive = activeCatIds.includes(String(cat.id));
            const fontBold = isActive ? 'font-bold' : '';
            return `
                <div class="group mb-3 md:mb-4">
                    <div class="flex items-center gap-2 md:gap-3 cursor-pointer mb-1.5 md:mb-2" data-cat-id="${cat.id}">
                        <div class="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 rounded-full border-2 border-[#8B4513] ${isActive ? 'bg-[#8B4513]' : ''} transition-colors"></div>
                        <span class="text-sm md:text-base lg:text-lg font-semibold text-[#3E1C00] ${fontBold}">${cat.name}</span>
                    </div>

                    <div class="pl-6 md:pl-7 lg:pl-9 space-y-2 md:space-y-3 relative ${isActive ? '' : 'hidden'}" id="subcat-${cat.id}">
                        ${isActive ? '<p class="text-xs md:text-sm text-gray-400">Loading...</p>' : ''}
                    </div>
                </div>
            `;
        }).join("");

        // Add event listeners
        sidebar.querySelectorAll('[data-cat-id]').forEach(el => {
            el.addEventListener('click', () => onCatToggle(el.dataset.catId));
        });
    },

    /**
     * Renders subcategories into the expanded category container
     */
    renderSubcategories(categoryId, subcategories, activeSubIds, onSubClick) {
        const subContainer = document.getElementById(`subcat-${categoryId}`);
        if (!subContainer) return;

        if (!subcategories || subcategories.length === 0) {
            subContainer.innerHTML = `<p class="text-xs md:text-sm text-gray-400">No subcategories</p>`;
            return;
        }

        const activeIds = Array.isArray(activeSubIds) ? activeSubIds : [];

        subContainer.innerHTML = subcategories.map(sub => {
            const isActive = activeIds.includes(String(sub.id));
            const fontClass = isActive ? "font-bold text-[#3E1C00]" : "text-[#5D3420]";

            return `
                <label class="flex items-center gap-2 md:gap-3 cursor-pointer ${fontClass}" data-sub-id="${sub.id}">
                    <div class="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 rounded-full border-2 border-[#5D3420] ${isActive ? 'bg-[#5D3420]' : ''} transition-colors"></div>
                    <span class="text-xs md:text-sm">${sub.name}</span>
                </label>
            `;
        }).join("");

        subContainer.querySelectorAll('[data-sub-id]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                onSubClick(categoryId, el.dataset.subId);
            });
        });
    },

    /**
     * Renders active filter chips
     */
    renderActiveFilters(selectedSubcategories, onRemove, onClearAll) {
        const container = document.getElementById('activeFiltersContainer');
        const clearBtn = document.getElementById('clearAllFilters');
        if (!container) return;

        if (selectedSubcategories.length === 0) {
            container.innerHTML = '';
            if (clearBtn) clearBtn.classList.add('hidden');
            return;
        }

        container.innerHTML = selectedSubcategories.map(sub => `
            <div class="flex items-center gap-2 bg-[#FDF5ED] border border-[#B06D36] text-[#B06D36] px-3 py-1 rounded-full text-sm font-medium transition-all hover:bg-[#FFF8F0]">
                <span>${sub.name}</span>
                <button class="remove-filter-btn hover:text-[#8B4513] transition-colors" data-sub-id="${sub.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        `).join('');

        if (clearBtn) {
            clearBtn.classList.remove('hidden');
            clearBtn.onclick = onClearAll;
        }

        container.querySelectorAll('.remove-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => onRemove(btn.dataset.subId));
        });
    },

    /**
     * Renders the product grid
     */
    renderProductGrid(products, onAddToCart, onGoToProduct, onWishlistToggle, cartStatusMap = {}, wishlistStatusMap = {}) {
        const grid = document.getElementById("productGrid");
        if (!grid) return;

        if (!products || products.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-10">
                    <p class="text-[#3E1C00] text-lg font-medium">No products found</p>
                    <p class="text-gray-500 text-sm mt-2">Try adjusting your filters or search criteria</p>
                </div>`;
            return;
        }

        grid.innerHTML = products.map(p => {
            const inCart = !!cartStatusMap[String(p.id)];
            const inWishlist = !!wishlistStatusMap[String(p.id)];
            return this.createProductCardHTML(p, { inCart, inWishlist });
        }).join("");

        // Add event listeners for buttons
        grid.querySelectorAll('.shop-now-btn').forEach(btn => {
            btn.addEventListener('click', () => onGoToProduct(btn.dataset.id));
        });

        grid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.hasAttribute('disabled')) return;
                const product = JSON.parse(btn.dataset.product);
                onAddToCart(product);
            });
        });

        grid.querySelectorAll('.wishlist-toggle').forEach(el => {
            el.addEventListener('click', () => onWishlistToggle(el, el.dataset.id));
        });
    },

    /**
     * Creates HTML for a single product card
     */
    createProductCardHTML(p, { inCart = false, inWishlist = false } = {}) {
        // Use centralized image utility
        const imageUrl = getProductImageUrl(p);

        // Use centralized price utility
        const { displayPrice } = calculateProductPrice(p);

        const productData = JSON.stringify({
            id: p.id,
            name: p.name,
            price: displayPrice,
            image: imageUrl
        }).replace(/"/g, '&quot;');

        const wishlistColorClass = inWishlist ? 'text-red-600' : 'text-[#8B4513]';
        const wishlistFillClass = inWishlist ? 'fill-current' : '';

        const addToCartLabel = inCart ? 'Added to cart' : 'Add to cart';
        const addToCartDisabled = inCart ? 'disabled' : '';
        const addToCartClass = inCart
            ? 'bg-green-600 text-white cursor-not-allowed opacity-90'
            : 'border border-[#B06D36] text-[#B06D36] hover:bg-[#FFF8F0]';

        return `
            <div class="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow group hover:-translate-y-2 transition-all duration-300 flex flex-col h-full">
                <div class="relative h-64 w-full mb-4 bg-[#F9F9F9] rounded-lg overflow-hidden flex items-center justify-center p-4">
                    <div class="wishlist-toggle absolute top-3 right-3 z-10 w-8 h-8 md:w-9 md:h-9 bg-white rounded-full flex items-center justify-center shadow-md cursor-pointer hover:bg-gray-50 ${wishlistColorClass} transition-colors" data-id="${p.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ${wishlistFillClass}" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364 4.318 12.682a4.5 4.5 0 010-6.364z" />
                        </svg>
                    </div>
                    <img src="${imageUrl}" 
                         loading="lazy"
                         alt="${p.name}" class="h-full w-full object-contain group-hover:scale-105 transition-transform duration-500" 
                         onerror="this.src='https://placehold.co/300x300/FDF5ED/DAA520?text=${encodeURIComponent(p.name)}'">
                </div>
                <div class="space-y-2 flex-grow flex flex-col">
                    <h3 class="text-xl font-bold text-[#3E1C00] line-clamp-1">${p.name}</h3>
                    <div class="flex items-center gap-2">
                        <span class="text-[#B06D36] font-bold text-lg">Rs. ${displayPrice}</span>
                    </div>
                    <div class="flex text-yellow-500 text-sm">
                        <span>★</span><span>★</span><span>★</span><span>★</span><span class="text-gray-300">★</span>
                    </div>
                    <div class="flex gap-3 pt-2 mt-auto">
                        <button class="shop-now-btn flex-1 bg-[#B06D36] text-white py-2 rounded font-medium text-sm hover:bg-[#8B4513] transition-colors" data-id="${p.id}">Shop Now</button>
                        <button class="add-to-cart-btn flex-1 py-2 rounded font-medium text-sm transition-colors ${addToCartClass}" ${addToCartDisabled} data-product="${productData}" data-product-id="${p.id}">${addToCartLabel}</button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Update a single product card button/icon state (without re-rendering grid).
     * Supports loading state for "Adding..." during API calls.
     */
    updateProductCardStatus(productId, { inCart = null, inWishlist = null, isLoading = false } = {}) {
        const grid = document.getElementById("productGrid");
        if (!grid) return;

        const pid = String(productId);

        const cartBtn = grid.querySelector(`.add-to-cart-btn[data-product-id="${CSS.escape(pid)}"]`);
        if (cartBtn) {
            if (isLoading) {
                // Loading state: Show "Adding..." and disable button
                cartBtn.textContent = 'Adding...';
                cartBtn.setAttribute('disabled', 'disabled');
                cartBtn.classList.remove('border', 'border-[#B06D36]', 'text-[#B06D36]', 'hover:bg-[#FFF8F0]', 'bg-green-600', 'text-white', 'cursor-not-allowed', 'opacity-90');
                cartBtn.classList.add('bg-gray-400', 'text-white', 'cursor-not-allowed', 'opacity-75');
            } else if (inCart !== null) {
                if (inCart) {
                    // In cart: Show "Added to cart" (persists until removed)
                    cartBtn.textContent = 'Added to cart';
                    cartBtn.setAttribute('disabled', 'disabled');
                    cartBtn.classList.remove('border', 'border-[#B06D36]', 'text-[#B06D36]', 'hover:bg-[#FFF8F0]', 'bg-gray-400', 'opacity-75');
                    cartBtn.classList.add('bg-green-600', 'text-white', 'cursor-not-allowed', 'opacity-90');
                } else {
                    // Not in cart: Show "Add to cart"
                    cartBtn.textContent = 'Add to cart';
                    cartBtn.removeAttribute('disabled');
                    cartBtn.classList.remove('bg-green-600', 'bg-gray-400', 'text-white', 'cursor-not-allowed', 'opacity-90', 'opacity-75');
                    cartBtn.classList.add('border', 'border-[#B06D36]', 'text-[#B06D36]', 'hover:bg-[#FFF8F0]');
                }
            }
        }

        const heart = grid.querySelector(`.wishlist-toggle[data-id="${CSS.escape(pid)}"]`);
        if (heart && inWishlist !== null) {
            const svg = heart.querySelector('svg');
            if (inWishlist) {
                heart.classList.add('text-red-600');
                heart.classList.remove('text-[#8B4513]');
                if (svg) svg.classList.add('fill-current');
            } else {
                heart.classList.remove('text-red-600');
                heart.classList.add('text-[#8B4513]');
                if (svg) svg.classList.remove('fill-current');
            }
        }
    },

    /**
     * Renders pagination
     */
    renderPagination(total, currentPage, limit, onPageClick) {
        // Try to find existing pagination container, or create one if needed
        let container = document.getElementById('paginationContainer');

        // If no container exists, don't render (will be handled by HTML structure)
        if (!container) return;

        const totalPages = Math.ceil(total / limit);

        // Hide pagination if 6 or fewer products (1 page or less)
        if (total <= 6 || totalPages <= 1) {
            container.innerHTML = "";
            container.classList.add('hidden');
            return;
        }

        // Show pagination container
        container.classList.remove('hidden');

        let html = `
            <button class="prev-page text-[#3E1C00] hover:text-[#B06D36] p-1.5 md:p-2" ${currentPage === 1 ? 'disabled opacity-50' : ''}>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <div class="flex items-center gap-2 md:gap-4">
        `;

        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                html += `<button class="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#8B4513] text-white flex items-center justify-center text-sm md:text-base font-medium shadow-md">${i}</button>`;
            } else {
                html += `<button class="page-num w-8 h-8 md:w-10 md:h-10 rounded-full text-[#3E1C00] hover:bg-[#FDF5ED] flex items-center justify-center text-sm md:text-base font-medium transition-colors" data-page="${i}">${i}</button>`;
            }
        }

        html += `
            </div>
            <button class="next-page text-[#3E1C00] hover:text-[#B06D36] p-1.5 md:p-2" ${currentPage === totalPages ? 'disabled opacity-50' : ''}>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        `;

        container.innerHTML = html;

        container.querySelectorAll('.page-num').forEach(btn => {
            btn.addEventListener('click', () => onPageClick(parseInt(btn.dataset.page)));
        });

        const prev = container.querySelector('.prev-page');
        if (prev && currentPage > 1) {
            prev.addEventListener('click', () => onPageClick(currentPage - 1));
        }

        const next = container.querySelector('.next-page');
        if (next && currentPage < totalPages) {
            next.addEventListener('click', () => onPageClick(currentPage + 1));
        }
    },

    /**
     * Updates the status text (Showing X-Y of Z)
     */
    updateResultCount(start, end, total) {
        const el = document.querySelector('main p.text-sm');
        if (el) {
            el.innerText = `Showing ${start}-${end} of ${total} results`;
        }
    },

    /**
     * Toggles the loading spinner
     */
    toggleLoading(isLoading) {
        const grid = document.getElementById("productGrid");
        if (!grid) return;

        if (isLoading) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-20">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#B06D36]"></div>
                    <p class="mt-4 text-[#3E1C00] font-medium">Loading products...</p>
                </div>`;
        }
    },

    /**
     * Renders the Best Seller slider in the sidebar
     */
    renderBestSellerSlider(products, onAddToCart, onGoToProduct) {
        const container = document.getElementById("bestSellerSliderContainer");
        if (!container) return;

        if (!products || products.length === 0) {
            container.innerHTML = '<p class="text-sm text-gray-500">No best sellers available.</p>';
            return;
        }

        const slidesHTML = products.map((p, index) => {
            // First check for thumbnail field (from get_products.php response)
            let productImage = p.thumbnail || null;

            if (!productImage) {
                // Process images array
                let images = p.images;
                if (typeof images === 'string') {
                    try { images = JSON.parse(images); } catch (e) { images = images.split(',').map(img => img.trim()); }
                }
                // Handle case where images might be a single string (not array)
                if (!Array.isArray(images) && images) {
                    images = [images];
                }

                // Filter out __EMPTY__ images (check if image is '__EMPTY__' or ends with '/__EMPTY__')
                if (Array.isArray(images) && images.length > 0) {
                    const validImages = images.filter(img => {
                        if (!img) return false;
                        const imgStr = String(img);
                        return imgStr !== '__EMPTY__' && !imgStr.endsWith('/__EMPTY__') && imgStr !== 'null' && imgStr !== 'undefined';
                    });
                    productImage = validImages.length > 0 ? validImages[0] : null;
                }
            }

            const imageUrl = productImage
                ? (productImage.startsWith('http') ? productImage : CONFIG.UPLOADS_URL + '/' + productImage)
                : 'https://placehold.co/300x300/FDF5ED/DAA520?text=' + encodeURIComponent(p.name);

            let displayPrice = "0.00";
            let variations = p.variations || [];
            if (typeof variations === 'string') {
                try { variations = JSON.parse(variations); } catch (e) { variations = []; }
            }

            if (variations && variations.length > 0) {
                const normalizedVariations = variations.map(v => ({ price: v.price || v.amount || 0 }));
                normalizedVariations.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
                displayPrice = parseFloat(normalizedVariations[0].price).toFixed(2);
            } else {
                displayPrice = parseFloat(p.price || p.amount || 0).toFixed(2);
            }

            const productData = JSON.stringify({
                id: p.id,
                name: p.name,
                price: displayPrice,
                image: imageUrl
            }).replace(/"/g, '&quot;');

            return `
                <div class="best-seller-slide ${index === 0 ? '' : 'hidden'} transition-all duration-500" data-index="${index}">
                    <div class="bg-white rounded-[20px] p-6 text-center shadow-sm relative">
                        <!-- Product Image -->
                        <div class="mb-4 flex justify-center cursor-pointer" onclick="window.shopController.handleGoToProduct(${p.id})">
                            <img src="${imageUrl}"
                                loading="lazy"
                                onerror="this.src='https://placehold.co/200x200/White/DAA520?text=${encodeURIComponent(p.name)}'"
                                alt="${p.name}" class="w-40 h-40 object-contain drop-shadow-sm hover:scale-105 transition-transform">
                        </div>

                        <!-- Divider Line -->
                        <div class="w-full h-px bg-[#7D7D7D] mb-4"></div>

                        <!-- Product Details -->
                        <h4 class="text-[#3E1C00] font-normal text-lg mb-2 font-poppins line-clamp-1">${p.name}</h4>
                        <p class="text-xl font-bold text-[#3E1C00] mb-5 font-poppins">Rs. ${displayPrice}</p>

                        <!-- Add to Cart Button -->
                        <button
                            class="best-seller-add-to-cart w-full border-2 border-[#B06D36] text-[#B06D36] font-bold text-base py-2.5 rounded-full hover:bg-[#B06D36] hover:text-white transition-colors font-poppins"
                            data-product="${productData}">
                            Add to cart
                        </button>
                    </div>
                </div>
            `;
        }).join("");

        container.innerHTML = `
            <div class="relative overflow-hidden">
                ${slidesHTML}
            </div>
            <!-- Navigation Arrows -->
            <div class="flex justify-center gap-4 mt-8">
                <button id="bestSellerPrev"
                    class="w-11 h-11 border border-[#B06D36] text-[#B06D36] flex items-center justify-center hover:bg-[#B06D36] hover:text-white transition-colors bg-[#FDF5ED] shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <button id="bestSellerNext"
                    class="w-11 h-11 border border-[#B06D36]  text-[#B06D36] flex items-center justify-center hover:bg-[#B06D36] hover:text-white transition-colors  bg-[#FDF5ED] shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        `;

        // Event listeners for Best Seller slide buttons
        container.querySelectorAll('.best-seller-add-to-cart').forEach(btn => {
            btn.addEventListener('click', () => {
                const product = JSON.parse(btn.dataset.product);
                onAddToCart(product);
            });
        });
    },

    /**
     * Renders the search suggestions dropdown
     */
    renderLoading() {
        const container = document.getElementById('searchSuggestions');
        if (!container) return;

        container.innerHTML = `
            <div class="flex items-center justify-center py-6">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-[#642E13]"></div>
            </div>
        `;
        container.classList.remove('hidden');
    },

    renderSearchSuggestions(results) {
        console.log("Rendering search suggestions:", results);
        const container = document.getElementById('searchSuggestions');
        if (!container) {
            console.error("Search suggestions container not found!");
            return;
        }

        if ((!results.exact || results.exact.length === 0) && (!results.related || results.related.length === 0)) {
            container.innerHTML = `
                <div class="px-6 py-8 text-center">
                    <p class="text-gray-500 text-sm font-medium">No matches found</p>
                </div>
            `;
            container.classList.remove('hidden');
            return;
        }

        let html = '';

        // EXACT MATCHES
        if (results.exact && results.exact.length > 0) {
            html += `
                <div class="bg-[#FDF5ED]/50 px-5 py-3 border-b border-[#642E13]/5">
                    <span class="text-[11px] tracking-wider font-bold text-[#642E13]/40 uppercase font-poppins">Exact Matches</span>
                </div>
                <div class="divide-y divide-[#642E13]/5">
                    ${results.exact.map(p => this.createSuggestionItemHTML(p)).join('')}
                </div>
            `;
        }

        // RELATED PRODUCTS
        if (results.related && results.related.length > 0) {
            html += `
                <div class="bg-[#FDF5ED]/50 px-5 py-3 border-y border-[#642E13]/5 mt-2">
                    <span class="text-[11px] tracking-wider font-bold text-[#642E13]/40 uppercase font-poppins">Related Products</span>
                </div>
                <div class="divide-y divide-[#642E13]/5">
                    ${results.related.map(p => this.createSuggestionItemHTML(p)).join('')}
                </div>
            `;
        }

        container.innerHTML = html;
        container.classList.remove('hidden');
    },

    createSuggestionItemHTML(p) {
        return `
            <div class="suggestion-item flex items-center gap-3 p-3 hover:bg-amber-50 cursor-pointer transition-colors border-b border-gray-50 last:border-none" data-id="${p.id}">
                <img src="${p.image}" alt="${p.name}" class="w-12 h-12 object-cover rounded-md" onerror="this.onerror=null;this.src='../Assets/Home/Logo-Gajendhra.png'">
                <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-semibold text-gray-800 truncate">${p.name}</h4>
                    <p class="text-xs text-[#8B4513] font-bold">${p.display_price}</p>
                </div>
            </div>
        `;
    }
};

export default ShopRenderer;
