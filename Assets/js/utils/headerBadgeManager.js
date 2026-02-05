import cartStateManager from "./cartStateManager.js";
import wishlistStateManager from "./wishlistStateManager.js";

/**
 * HeaderBadgeManager - Manages cart and wishlist count badges in header
 * Uses singleton state managers for real-time updates
 */
class HeaderBadgeManager {
    constructor() {
        this.cartBadgeSelector = '[data-cart-badge]';
        this.wishlistBadgeSelector = '[data-wishlist-badge]';
        this.isInitialized = false;
    }

    /**
     * Initialize: Set up badges and subscribe to state changes
     */
    async init() {
        if (this.isInitialized) return;

        // Wait for state managers to initialize
        await cartStateManager.waitForInit();
        await wishlistStateManager.waitForInit();

        // Initial badge update
        this.updateCartBadge();
        this.updateWishlistBadge();

        // Subscribe to state changes for real-time updates
        cartStateManager.subscribe(() => {
            this.updateCartBadge();
        });

        wishlistStateManager.subscribe(() => {
            this.updateWishlistBadge();
        });

        this.isInitialized = true;
    }

    /**
     * Update cart badge count in header
     */
    updateCartBadge() {
        const count = cartStateManager.getCount();
        const badges = document.querySelectorAll(this.cartBadgeSelector);

        badges.forEach(badge => {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        });
    }

    /**
     * Update wishlist badge count in header
     */
    updateWishlistBadge() {
        const count = wishlistStateManager.getCount();
        const badges = document.querySelectorAll(this.wishlistBadgeSelector);

        badges.forEach(badge => {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        });
    }

    /**
     * Get cart count
     */
    getCartCount() {
        return cartStateManager.getCount();
    }

    /**
     * Get wishlist count
     */
    getWishlistCount() {
        return wishlistStateManager.getCount();
    }
}

// Export singleton instance
const headerBadgeManager = new HeaderBadgeManager();
export default headerBadgeManager;

