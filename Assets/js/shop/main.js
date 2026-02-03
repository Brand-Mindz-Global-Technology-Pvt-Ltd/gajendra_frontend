import ShopService from "../services/shop/shopService.js";
import ShopRenderer from "../renderers/shop/shopRenderer.js";
import CartService from "../services/shop/cartService.js";
import { ensureCurrentUserId } from "../utils/userUtils.js";
import cartStateManager from "../utils/cartStateManager.js";
import wishlistStateManager from "../utils/wishlistStateManager.js";
import headerBadgeManager from "../utils/headerBadgeManager.js";
import { HeaderInitializer } from "../utils/headerInitializer.js";

class ShopController {
    constructor() {
        this.state = {
            category_id: [],
            subcategory_id: [],
            search: null,
            min_price: null,
            max_price: null,
            page: 1,
            limit: 9,
            total: 0
        };

        this.cartStatusMap = {}; // productId -> boolean
        this.wishlistStatusMap = {}; // productId -> boolean

        this.bestSellerState = {
            products: [],
            currentIndex: 0,
            interval: null
        };

        this.subcategoryMap = {}; // id -> name mapping for filter tags
        this.searchTimeout = null;

        window.shopController = this;
        this.init();
    }

    async init() {
        this.parseUrlParams();
        this.setupHeaderEventListeners();
        this.initPriceSlider();
        this.syncUI();

        // 1. Initialize Header (Menu, Auth, Dropdown, Logout)
        await HeaderInitializer.init();

        // Initialize state managers (singleton pattern - syncs with backend)
        await cartStateManager.init();
        await wishlistStateManager.init();

        // Initialize header badge manager (shows counts on cart/wishlist icons)
        await headerBadgeManager.init();

        // Subscribe to state changes for UI updates
        this.setupStateManagerListeners();

        await this.loadCategories();
        await this.loadProducts();
        await this.loadBestSellers();

        // 6. Auto-scroll if filters are present in URL
        this.autoScroll();
    }

    autoScroll() {
        const params = new URLSearchParams(window.location.search);
        if (params.has('category_id') || params.has('subcategory_id') || params.has('search')) {
            setTimeout(() => {
                const target = document.getElementById('shopResultsSection');

                if (target) {
                    const headerOffset = 100; // Account for sticky header
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }
            }, 500); // Small delay to allow rendering to complete
        }
    }

    setupStateManagerListeners() {
        // Listen to cart state changes
        cartStateManager.subscribe((productId, inCart) => {
            if (productId) {
                ShopRenderer.updateProductCardStatus(parseInt(productId), { inCart });
            } else {
                // Full sync - update all rendered products
                this.refreshAllProductStatuses();
            }
        });

        // Listen to wishlist state changes
        wishlistStateManager.subscribe((productId, inWishlist) => {
            if (productId) {
                ShopRenderer.updateProductCardStatus(parseInt(productId), { inWishlist });
            } else {
                // Full sync
                this.refreshAllProductStatuses();
            }
        });
    }

    refreshAllProductStatuses() {
        const grid = document.getElementById("productGrid");
        if (!grid) return;

        // Get all product cards
        const productIds = Array.from(grid.querySelectorAll('.add-to-cart-btn')).map(btn => btn.dataset.productId);

        productIds.forEach(pid => {
            const inCart = cartStateManager.isInCart(pid);
            const inWishlist = wishlistStateManager.isInWishlist(pid);
            ShopRenderer.updateProductCardStatus(parseInt(pid), { inCart, inWishlist });
        });
    }

    setupHeaderEventListeners() {
        // Search
        const searchInput = document.getElementById('shopSearchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch(searchInput.value);
                }
            });

            searchInput.addEventListener('input', (e) => {
                this.handleLiveSearch(e.target.value);
            });

            // Re-open suggestions on focus if value exists
            searchInput.addEventListener('focus', () => {
                const query = searchInput.value;
                if (query && query.length >= 1) {
                    this.handleLiveSearch(query);
                }
            });

            const searchBtn = searchInput.parentElement.querySelector('button');
            if (searchBtn) {
                searchBtn.addEventListener('click', () => {
                    this.handleSearch(searchInput.value);
                });
            }
        }

        // Close suggestions on outside click
        document.addEventListener('click', (e) => {
            const container = document.getElementById('searchSuggestions');
            const searchInput = document.getElementById('shopSearchInput');
            if (container && !container.contains(e.target) && e.target !== searchInput) {
                this.hideSuggestions();
            }
        });

        // Apply Price Filter Button
        const applyPriceBtn = document.getElementById('applyPriceFilter');
        if (applyPriceBtn) {
            applyPriceBtn.addEventListener('click', () => this.handlePriceFiltering());
        }

        // Mobile Menu toggle (Refactor to use existing dropdown logic if any, but MenuRenderer handles mobile menu render)
        // The toggle visibility still needs to be handled
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.removeAttribute('onclick');
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }
    }

    parseUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const catParam = params.get('category_id');
        const subParam = params.get('subcategory_id');

        this.state.category_id = catParam ? catParam.split(',') : [];
        this.state.subcategory_id = subParam ? subParam.split(',') : [];
        this.state.search = params.get('search');
        this.state.min_price = params.get('min_price') ? parseInt(params.get('min_price')) : null;
        this.state.max_price = params.get('max_price') ? parseInt(params.get('max_price')) : 5000;
        this.state.page = params.get('page') ? parseInt(params.get('page')) : 1;
    }

    syncUI() {
        // Reserved for future UI synchronization
    }

    updateUrl() {
        const params = new URLSearchParams();
        if (this.state.category_id.length > 0) params.set('category_id', this.state.category_id.join(','));
        if (this.state.subcategory_id.length > 0) params.set('subcategory_id', this.state.subcategory_id.join(','));
        if (this.state.search) params.set('search', this.state.search);
        if (this.state.min_price !== null) params.set('min_price', this.state.min_price);
        if (this.state.max_price !== null) params.set('max_price', this.state.max_price);
        if (this.state.page > 1) params.set('page', this.state.page);

        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
    }

    async loadCategories() {
        const response = await ShopService.getCategories();
        if (response.success) {
            ShopRenderer.renderCategorySidebar(
                response.categories,
                this.state,
                this.handleCategoryToggle.bind(this),
                this.handleSubcategoryClick.bind(this)
            );

            // Load subcategories for all active categories to populate maps and UI
            if (this.state.category_id.length > 0) {
                await Promise.all(this.state.category_id.map(id => this.loadSubcategories(id)));
            }

            this.updateActiveFiltersUI();
        }
    }

    async loadSubcategories(categoryId) {
        const response = await ShopService.getSubcategories(categoryId);
        if (response.success) {
            // Update mapping
            response.subcategories.forEach(sub => {
                this.subcategoryMap[sub.id] = sub.name;
            });

            ShopRenderer.renderSubcategories(
                categoryId,
                response.subcategories,
                this.state.subcategory_id,
                this.handleSubcategoryClick.bind(this)
            );
        }
    }

    updateActiveFiltersUI() {
        const selectedSubs = this.state.subcategory_id.map(id => ({
            id: id,
            name: this.subcategoryMap[id] || `Sub-${id}`
        }));

        ShopRenderer.renderActiveFilters(
            selectedSubs,
            this.handleRemoveFilter.bind(this),
            this.handleClearAllFilters.bind(this)
        );
    }

    async loadBestSellers() {
        const response = await ShopService.getProducts({ is_best_seller: 1, limit: 5 });
        if (response.status && response.products) {
            this.bestSellerState.products = response.products;
            ShopRenderer.renderBestSellerSlider(
                response.products,
                this.handleAddToCart.bind(this),
                this.handleGoToProduct.bind(this)
            );
            this.setupBestSellerControls();
            this.startBestSellerSlider();
        }
    }

    setupBestSellerControls() {
        const prevBtn = document.getElementById('bestSellerPrev');
        const nextBtn = document.getElementById('bestSellerNext');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.stopBestSellerSlider();
                this.navigateBestSeller(-1);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.stopBestSellerSlider();
                this.navigateBestSeller(1);
            });
        }
    }

    startBestSellerSlider() {
        if (this.bestSellerState.products.length <= 1) return;
        this.bestSellerState.interval = setInterval(() => {
            this.navigateBestSeller(1);
        }, 5000);
    }

    stopBestSellerSlider() {
        if (this.bestSellerState.interval) {
            clearInterval(this.bestSellerState.interval);
        }
    }

    navigateBestSeller(direction) {
        const slides = document.querySelectorAll('.best-seller-slide');
        if (slides.length === 0) return;

        slides[this.bestSellerState.currentIndex].classList.add('hidden');

        this.bestSellerState.currentIndex = (this.bestSellerState.currentIndex + direction + slides.length) % slides.length;

        slides[this.bestSellerState.currentIndex].classList.remove('hidden');
    }

    async loadProducts() {
        ShopRenderer.toggleLoading(true);

        // Build params for API: 
        // 1. If subcategories are selected, filter ONLY by those subcategories.
        // 2. If no subcategories are selected, show ALL products (ignore categories).
        // This aligns with: "category only don't show" and "deselect all = show all".
        const params = {
            ...this.state,
            category_id: null, // Always ignore category-level filtering for product grid
            subcategory_id: this.state.subcategory_id.length > 0 ? this.state.subcategory_id : null
        };

        const response = await ShopService.getProducts(params);
        this.updateActiveFiltersUI();

        if (response.status && response.products) {
            this.state.total = response.total;

            // Build cart/wishlist maps for current page products (best practice: compute once per render)
            await this.loadCartWishlistStatusMaps(response.products);

            ShopRenderer.renderProductGrid(
                response.products,
                this.handleAddToCart.bind(this),
                this.handleGoToProduct.bind(this),
                this.handleToggleWishlist.bind(this),
                this.cartStatusMap,
                this.wishlistStatusMap
            );

            const start = ((this.state.page - 1) * this.state.limit) + 1;
            const end = Math.min(start + response.products.length - 1, response.total);
            ShopRenderer.updateResultCount(start, end, response.total);

            ShopRenderer.renderPagination(
                response.total,
                this.state.page,
                this.state.limit,
                this.handlePageChange.bind(this)
            );
        } else {
            ShopRenderer.renderProductGrid([], 0);
            ShopRenderer.updateResultCount(0, 0, 0);
        }
    }

    async loadCartWishlistStatusMaps(products) {
        // Ensure state managers are fully initialized before using them
        await cartStateManager.waitForInit();
        await wishlistStateManager.waitForInit();

        // Use state managers instead of direct API calls
        // State managers already have the data cached from init()
        this.cartStatusMap = {};
        this.wishlistStatusMap = {};

        if (!products || products.length === 0) return;

        // Build status maps from state managers (instant, no API calls)
        products.forEach(p => {
            const pid = String(p.id);
            this.cartStatusMap[pid] = cartStateManager.isInCart(pid);
            this.wishlistStatusMap[pid] = wishlistStateManager.isInWishlist(pid);
        });
    }

    async handleCategoryToggle(categoryId) {
        categoryId = String(categoryId);
        const index = this.state.category_id.indexOf(categoryId);

        if (index > -1) {
            // Collapse Category: Remove it and all its active subcategories
            this.state.category_id.splice(index, 1);

            // Cleanup subcategories: This is tricky because we don't know which sub belongs to which cat
            // without another API call or storing that mapping. 
            // For now, let's just refresh subcategories to be safe.
            // A better way is to fetch the subcategories for this category first.
            const subRes = await ShopService.getSubcategories(categoryId);
            if (subRes.success) {
                const subIdsToRemove = subRes.subcategories.map(s => String(s.id));
                this.state.subcategory_id = this.state.subcategory_id.filter(id => !subIdsToRemove.includes(id));
            }

            // If subcategories were removed, we need to refresh products
            await this.loadProducts();
        } else {
            // Expand Category
            this.state.category_id.push(categoryId);
            await this.loadSubcategories(categoryId);
            // No product refresh here as per "category only don't show" requirement
        }

        this.updateUrl();
        await this.loadCategories();
    }

    async handleSubcategoryClick(categoryId, subId) {
        subId = String(subId);
        const index = this.state.subcategory_id.indexOf(subId);

        if (index > -1) {
            this.state.subcategory_id.splice(index, 1);
        } else {
            this.state.subcategory_id.push(subId);
        }

        this.state.page = 1;
        this.updateUrl();

        // Re-render subcategories for THIS category to show active state
        await this.loadSubcategories(categoryId);

        // Fetch products and update tags
        await this.loadProducts();
    }

    async handleRemoveFilter(subId) {
        const index = this.state.subcategory_id.indexOf(String(subId));
        if (index > -1) {
            this.state.subcategory_id.splice(index, 1);
            this.state.page = 1;
            this.updateUrl();

            // Re-render categories/subs to update circles
            await this.loadCategories();
            await this.loadProducts();
        }
    }

    async handleClearAllFilters() {
        this.state.category_id = [];
        this.state.subcategory_id = [];
        this.state.page = 1;
        this.updateUrl();
        this.syncUI();

        await this.loadCategories();
        await this.loadProducts();
    }

    handlePageChange(page) {
        this.state.page = page;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.updateUrl();
        this.loadProducts();
    }

    handleSearch(query) {
        this.state.search = query;
        this.state.page = 1;
        this.updateUrl();
        this.loadProducts();
        this.hideSuggestions();
    }

    async handleLiveSearch(query) {
        if (this.searchTimeout) clearTimeout(this.searchTimeout);

        if (!query || query.length < 1) {
            this.hideSuggestions();
            return;
        }

        this.searchTimeout = setTimeout(async () => {
            console.log("Fetching suggestions for:", query);
            ShopRenderer.renderLoading(); // Show loading state
            try {
                const results = await ShopService.getSearchSuggestions(query);
                console.log("Search results:", results);
                if (results && results.success) {
                    ShopRenderer.renderSearchSuggestions(results);
                    this.attachSuggestionListeners();
                } else {
                    console.error("Search API failed or returned success:false", results);
                }
            } catch (err) {
                console.error("Error in handleLiveSearch:", err);
            }
        }, 300);
    }

    hideSuggestions() {
        const container = document.getElementById('searchSuggestions');
        if (container) container.classList.add('hidden');
    }

    attachSuggestionListeners() {
        const container = document.getElementById('searchSuggestions');
        if (!container) return;

        container.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                this.handleGoToProduct(id);
            });
        });
    }

    handlePriceFiltering() {
        const minVal = parseInt(document.getElementById('minPriceInput').value);
        const maxVal = parseInt(document.getElementById('maxPriceInput').value);

        this.state.min_price = minVal;
        this.state.max_price = maxVal;
        this.state.page = 1;
        this.updateUrl();
        this.loadProducts();
    }

    handlePriceFilter() {
        const min = parseInt(document.getElementById("slider-1").value);
        const max = parseInt(document.getElementById("slider-2").value);
        this.state.min_price = min;
        this.state.max_price = max;
        this.state.page = 1;
        this.updateUrl();
        this.loadProducts();
    }

    async handleAddToCart(product) {
        const userId = await ensureCurrentUserId();
        if (!userId) {
            if (window.showToast) window.showToast("Please login to add items to cart", "error");
            else alert("Please login to add items to cart");
            window.location.href = '../Auth/login.html';
            return;
        }

        const productId = product?.id;
        if (!productId) return;

        // Check if already in cart (shouldn't happen, but safety check)
        if (cartStateManager.isInCart(productId)) {
            if (window.showToast) window.showToast("Product already in cart", "info");
            return;
        }

        // Show loading state
        ShopRenderer.updateProductCardStatus(productId, { isLoading: true });

        try {
            const res = await cartStateManager.addToCart(productId, product.quantity || 1);

            if (res && res.success) {
                // State manager already updated the UI via listener, but we can also update popup cart
                if (window.addToCart) {
                    window.addToCart(product);
                }

                if (window.showToast) window.showToast(res.message || "Added to cart", "success");
            } else {
                // Error: State manager will rollback, but we need to clear loading state
                ShopRenderer.updateProductCardStatus(productId, { inCart: false, isLoading: false });
                if (window.showToast) window.showToast(res?.message || "Failed to add to cart", "error");
            }
        } catch (error) {
            // Error: Clear loading state
            ShopRenderer.updateProductCardStatus(productId, { inCart: false, isLoading: false });
            if (window.showToast) window.showToast("Failed to add to cart", "error");
            console.error("Add to cart error:", error);
        }
    }

    handleGoToProduct(productId) {
        window.location.href = `./Singleproduct.html?product_id=${productId}`;
    }

    async handleToggleWishlist(el, productId) {
        const userId = await ensureCurrentUserId();
        if (!userId) {
            if (window.showToast) window.showToast("Please login to use wishlist", "error");
            else alert("Please login to use wishlist");
             window.location.href = '../Auth/login.html';
            return;
        }

        try {
            const response = await wishlistStateManager.toggleWishlist(productId);

            if (response && response.success) {
                // State manager already updated the UI via listener
                if (window.showToast) {
                    window.showToast(response.message || (response.inWishlist ? "Added to wishlist" : "Removed from wishlist"), "success");
                }
            } else {
                if (window.showToast) window.showToast(response?.message || "Wishlist update failed", "error");
            }
        } catch (error) {
            if (window.showToast) window.showToast("Wishlist update failed", "error");
            console.error("Wishlist toggle error:", error);
        }
    }


    initPriceSlider() {
        const sliderOne = document.getElementById("slider-1");
        const sliderTwo = document.getElementById("slider-2");
        const sliderTrack = document.getElementById("sliderTrack");
        const minInput = document.getElementById("minPriceInput");
        const maxInput = document.getElementById("maxPriceInput");
        const maxVal = 5000;
        const minGap = 0;

        if (!sliderOne || !sliderTwo) return;

        const fillColor = () => {
            const percent1 = (sliderOne.value / maxVal) * 100;
            const percent2 = (sliderTwo.value / maxVal) * 100;
            sliderTrack.style.background = `linear-gradient(to right, #D4B896 ${percent1}% , #8B4513 ${percent1}% , #8B4513 ${percent2}%, #D4B896 ${percent2}%)`;
        };

        sliderOne.addEventListener('input', () => {
            if (parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap) {
                sliderOne.value = parseInt(sliderTwo.value) - minGap;
            }
            minInput.value = sliderOne.value;
            fillColor();
        });

        sliderTwo.addEventListener('input', () => {
            if (parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap) {
                sliderTwo.value = parseInt(sliderOne.value) + minGap;
            }
            maxInput.value = sliderTwo.value;
            fillColor();
        });

        minInput.addEventListener('change', () => {
            if (parseInt(minInput.value) >= 0 && parseInt(minInput.value) < parseInt(sliderTwo.value)) {
                sliderOne.value = minInput.value;
                fillColor();
            }
        });

        maxInput.addEventListener('change', () => {
            if (parseInt(maxInput.value) <= maxVal && parseInt(maxInput.value) > parseInt(sliderOne.value)) {
                sliderTwo.value = maxInput.value;
                fillColor();
            }
        });

        // Set initial values from state
        if (this.state.min_price !== null) {
            sliderOne.value = this.state.min_price;
            minInput.value = this.state.min_price;
        }
        if (this.state.max_price !== null) {
            sliderTwo.value = this.state.max_price;
            maxInput.value = this.state.max_price;
        }
        fillColor();
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    new ShopController();
});
