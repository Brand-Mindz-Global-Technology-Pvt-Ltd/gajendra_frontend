import ProductDetailService from "../../services/shop/productDetailService.js";
import ProductDetailRenderer from "../../renderers/shop/productDetailRenderer.js";
import ShopService from "../../services/shop/shopService.js";
import { ensureCurrentUserId } from "../../utils/userUtils.js";
import cartStateManager from "../../utils/cartStateManager.js";
import wishlistStateManager from "../../utils/wishlistStateManager.js";
import { HeaderInitializer } from "../../utils/headerInitializer.js";
import SkeletonLoader from "../../utils/skeletonLoader.js";
import { Toast } from "../../utils/toast.js";
import ProductReviewController from "./productReviewController.js";

// Initialize Toast
Toast.init();

class ProductDetailController {
    constructor() {
        this.product = null;
        this.selectedVariationIndex = 0;
        this.quantity = 1;
        this.currentPrice = 0;

        // Get product ID from URL
        const params = new URLSearchParams(window.location.search);
        this.productId = params.get("product_id");

        if (!this.productId) {
            Toast.error("Product not found");
            return;
        }

        window.productDetailController = this;
        this.init();
    }

    async init() {
        // Hide all sections initially (will be shown by renderer if data exists)
        SkeletonLoader.hideAllSections();

        // 1. Initialize Header (Menu, Auth, Dropdown, Logout, Badges)
        await HeaderInitializer.init();

        // Initialize state managers (they are singletons, so this ensures they are ready for direct use)
        await cartStateManager.init();
        await wishlistStateManager.init();

        // Subscribe to state changes for real-time updates
        this.setupStateManagerListeners();

        // Setup event listeners
        this.setupEventListeners();

        // Load product data
        await this.loadProduct();

        // Initialize Reviews
        ProductReviewController.init(this.productId);
    }

    setupEventListeners() {
        // Quantity controls
        // Quantity buttons
        const qtyMinusBtn = document.getElementById('qtyMinusBtn');
        const qtyPlusBtn = document.getElementById('qtyPlusBtn');

        if (qtyMinusBtn) {
            qtyMinusBtn.addEventListener('click', () => this.handleQuantityChange(-1));
        }
        if (qtyPlusBtn) {
            qtyPlusBtn.addEventListener('click', () => this.handleQuantityChange(1));
        }

        // Add to cart button
        const addToCartBtn = document.getElementById('mainAddToCartBtn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => this.handleAddToCart());
        }

        // Buy now button
        const buyNowBtn = document.getElementById('buyItNowBtn');
        if (buyNowBtn) {
            buyNowBtn.addEventListener('click', () => this.handleBuyNow());
        }

        // Share button
        const shareBtn = document.getElementById('shareProductBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.handleShareProduct());
        }

        // Wishlist button (if exists in recommended products)
        document.querySelectorAll('.fa-heart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productCard = e.target.closest('.bg-white.rounded-xl');
                if (productCard) {
                    const productId = productCard.dataset.productId;
                    if (productId) {
                        this.handleToggleWishlist(productId, e.target);
                    }
                }
            });
        });
    }

    setupStateManagerListeners() {
        // Listen to cart state changes
        cartStateManager.subscribe((productId, inCart) => {
            // 1. Update main product status
            if (!productId || String(productId) === String(this.product?.id)) {
                this.updateCartWishlistStatus();
            }
            // 2. Update recommended products status
            if (productId) {
                ProductDetailRenderer.updateRecommendedProductCardStatus(productId, { inCart });
            } else {
                // Full sync
                this.refreshRecommendedProductStatuses();
            }
        });

        // Listen to wishlist state changes
        wishlistStateManager.subscribe((productId, inWishlist) => {
            // 1. Update main product status
            if (productId && String(productId) === String(this.product?.id)) {
                // Currently main product doesn't have a heart icon, but we sync state anyway
                this.updateCartWishlistStatus();
            }
            // 2. Update recommended products status
            if (productId) {
                ProductDetailRenderer.updateRecommendedProductCardStatus(productId, { inWishlist });
            } else {
                // Full sync
                this.refreshRecommendedProductStatuses();
            }
        });
    }

    refreshRecommendedProductStatuses() {
        const grid = document.getElementById("recommendedProductsGrid");
        if (!grid) return;

        // Get all product cards
        const productIds = Array.from(grid.querySelectorAll('.add-to-cart-btn')).map(btn => btn.dataset.productId);

        productIds.forEach(pid => {
            const inCart = cartStateManager.isInCart(pid);
            const inWishlist = wishlistStateManager.isInWishlist(pid);
            ProductDetailRenderer.updateRecommendedProductCardStatus(pid, { inCart, inWishlist });
        });
    }

    handleShareProduct() {
        if (!this.productId) return;

        // Get current URL and add product_id parameter
        const currentUrl = window.location.href.split('?')[0]; // Remove existing query params
        const shareUrl = `${currentUrl}?product_id=${this.productId}`;

        // Copy to clipboard
        navigator.clipboard.writeText(shareUrl).then(() => {
            Toast.success("Link copied!");
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = shareUrl;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                Toast.success("Link copied!");
            } catch (err) {
                Toast.error("Failed to copy link");
            }
            document.body.removeChild(textArea);
        });
    }

    async loadProduct() {
        // Show skeleton loader
        SkeletonLoader.showProductDetailSkeleton();

        try {
            const response = await ProductDetailService.getProduct(this.productId);

            if (!response || !response.success || !response.product) {
                Toast.error(response?.message || "Product not found");
                SkeletonLoader.hideProductDetailSkeleton();
                return;
            }

            this.product = response.product;

            // Calculate initial price
            this.calculatePrice();

            // Hide skeleton
            SkeletonLoader.hideProductDetailSkeleton();

            // Render product details
            ProductDetailRenderer.renderProductDetails(this.product);
            ProductDetailRenderer.renderMainImage(this.product);
            ProductDetailRenderer.renderThumbnails(this.product);
            ProductDetailRenderer.renderVariations(this.product);
            ProductDetailRenderer.renderTasteSegments(this.product);

            // Update cart/wishlist status
            this.updateCartWishlistStatus();

            // Load recommended products (other products excluding current)
            await this.loadRecommendedProducts();

        } catch (error) {
            console.error("Error loading product:", error);
            Toast.error("Failed to load product details");
            SkeletonLoader.hideProductDetailSkeleton();
        }
    }

    async loadRecommendedProducts() {
        try {
            // Fetch other products (excluding current product)
            const response = await ShopService.getProducts({
                page: 1,
                limit: 4,
                // Exclude current product - we'll filter it out
            });

            if (response && response.status && response.products) {
                // Filter out current product
                const recommendedProducts = response.products.filter(p => String(p.id) !== String(this.productId));

                // Build cart/wishlist status maps
                const cartStatusMap = {};
                const wishlistStatusMap = {};

                recommendedProducts.forEach(p => {
                    const pid = String(p.id);
                    cartStatusMap[pid] = cartStateManager.isInCart(pid);
                    wishlistStatusMap[pid] = wishlistStateManager.isInWishlist(pid);
                });

                // Render recommended products
                ProductDetailRenderer.renderRecommendedProducts(
                    recommendedProducts,
                    cartStatusMap,
                    wishlistStatusMap,
                    this.handleAddToCart.bind(this),
                    this.handleGoToProduct.bind(this),
                    this.handleToggleWishlist.bind(this)
                );
            }
        } catch (error) {
            console.error("Error loading recommended products:", error);
            // Hide section if error
            const section = document.getElementById("recommendedProductsSection");
            if (section) section.style.display = "none";
        }
    }

    handleGoToProduct(productId) {
        window.location.href = `./Singleproduct.html?product_id=${productId}`;
    }

    calculatePrice() {
        if (!this.product) return;

        let variations = this.product.variations || [];
        if (typeof variations === 'string') {
            try { variations = JSON.parse(variations); } catch (e) { variations = []; }
        }

        if (variations && variations.length > 0) {
            const selectedVariation = variations[this.selectedVariationIndex];
            if (selectedVariation) {
                this.currentPrice = parseFloat(selectedVariation.price || selectedVariation.amount || 0);
            } else {
                this.currentPrice = parseFloat(this.product.price || 0);
            }
        } else {
            this.currentPrice = parseFloat(this.product.price || 0);
        }
    }

    updateCartWishlistStatus() {
        if (!this.product) return;

        const productId = String(this.product.id);
        const inCart = cartStateManager.isInCart(productId);
        const inWishlist = wishlistStateManager.isInWishlist(productId);

        // Update main add to cart button
        const addToCartBtn = document.getElementById('mainAddToCartBtn');
        if (addToCartBtn) {
            if (inCart) {
                addToCartBtn.textContent = 'Added to cart';
                addToCartBtn.disabled = true;
                addToCartBtn.classList.remove('border-[#B06D36]', 'text-[#B06D36]', 'hover:bg-[#FFF8F0]');
                addToCartBtn.classList.add('bg-green-600', 'text-white', 'cursor-not-allowed', 'opacity-90');
            } else {
                addToCartBtn.textContent = 'Add to cart';
                addToCartBtn.disabled = false;
                addToCartBtn.classList.remove('bg-green-600', 'text-white', 'cursor-not-allowed', 'opacity-90');
                addToCartBtn.classList.add('border', 'border-[#B06D36]', 'text-[#B06D36]', 'hover:bg-[#FFF8F0]');
            }
        }
    }

    handleQuantityChange(change) {
        this.quantity += change;
        if (this.quantity < 1) this.quantity = 1;
        ProductDetailRenderer.updateQuantity(this.quantity);
    }

    selectVariation(index, price) {
        this.selectedVariationIndex = index;
        this.currentPrice = price;
        ProductDetailRenderer.updateSelectedVariation(index);
        ProductDetailRenderer.renderPrice({
            ...this.product,
            variations: this.product.variations.map((v, i) => ({
                ...v,
                price: i === index ? price : (v.price || v.amount || 0)
            }))
        });
    }

    changeMainImage(imageUrl) {
        ProductDetailRenderer.updateMainImage(imageUrl);
    }

    async handleAddToCart(product = null) {
        // If product is passed (from recommended products), use it; otherwise use current product
        const productToAdd = product || this.product;
        if (!productToAdd) return;

        const userId = await ensureCurrentUserId();
        if (!userId) {
            Toast.error("Please login to add items to cart");
            return;
        }

        try {
            // Add product to cart with selected quantity (use 1 for recommended products)
            const qty = product ? 1 : this.quantity;
            const res = await cartStateManager.addToCart(productToAdd.id, qty);

            if (res && res.success) {
                Toast.success("Added to cart");
                // Update status for current product or refresh recommended products
                if (product) {
                    // Refresh recommended products to update cart status
                    await this.loadRecommendedProducts();
                } else {
                    this.updateCartWishlistStatus();
                }
            } else {
                Toast.error(res?.message || "Failed to add to cart");
            }
        } catch (error) {
            console.error("Add to cart error:", error);
            Toast.error(error.message || "Failed to add to cart");
        }
    }

    async handleToggleWishlist(btn, productId) {
        const userId = await ensureCurrentUserId();
        if (!userId) {
            Toast.error("Please login to use wishlist");
            return;
        }

        const pid = String(productId);
        const isCurrentlyInWishlist = wishlistStateManager.isInWishlist(pid);

        // Optimistic UI update for SVG-based wishlist button
        if (btn) {
            const svg = btn.querySelector('svg');
            if (svg) {
                if (isCurrentlyInWishlist) {
                    btn.classList.remove('text-red-600');
                    btn.classList.add('text-[#8B4513]');
                    svg.classList.remove('fill-current');
                } else {
                    btn.classList.remove('text-[#8B4513]');
                    btn.classList.add('text-red-600');
                    svg.classList.add('fill-current');
                }
            }
        }

        try {
            const res = await wishlistStateManager.toggleWishlist(pid);
            if (res && res.success) {
                Toast.success(isCurrentlyInWishlist ? "Removed from wishlist" : "Added to wishlist");
            } else {
                Toast.error(res?.message || "Wishlist update failed");
                // Rollback UI
                if (btn) {
                    const svg = btn.querySelector('svg');
                    if (svg) {
                        if (isCurrentlyInWishlist) {
                            btn.classList.remove('text-[#8B4513]');
                            btn.classList.add('text-red-600');
                            svg.classList.add('fill-current');
                        } else {
                            btn.classList.remove('text-red-600');
                            btn.classList.add('text-[#8B4513]');
                            svg.classList.remove('fill-current');
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Wishlist toggle error:", error);
            Toast.error(error.message || "Wishlist update failed");
            // Rollback UI
            if (btn) {
                const svg = btn.querySelector('svg');
                if (svg) {
                    if (isCurrentlyInWishlist) {
                        btn.classList.remove('text-[#8B4513]');
                        btn.classList.add('text-red-600');
                        svg.classList.add('fill-current');
                    } else {
                        btn.classList.remove('text-red-600');
                        btn.classList.add('text-[#8B4513]');
                        svg.classList.remove('fill-current');
                    }
                }
            }
        }
    }

    handleBuyNow() {
        // Redirect to checkout with product
        if (!this.product) return;

        const checkoutData = {
            productId: this.product.id,
            quantity: this.quantity,
            price: this.currentPrice
        };

        // Store in sessionStorage for checkout page
        sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
        window.location.href = '../Checkout/Checkout.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ProductDetailController();
});

