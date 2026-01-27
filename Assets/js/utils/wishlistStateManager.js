import ShopService from "../services/shop/shopService.js";
import { ensureCurrentUserId } from "./userUtils.js";

/**
 * WishlistStateManager - Singleton pattern
 * Maintains wishlist state in memory for instant status checks
 * Syncs with backend on initialization
 */
class WishlistStateManager {
    constructor() {
        this.wishlistItems = new Set(); // Set of product IDs in wishlist
        this.isInitialized = false;
        this.isLoading = false;
        this.listeners = new Set(); // Callbacks for state changes
    }

    /**
     * Initialize: Sync wishlist from backend
     */
    async init() {
        if (this.isInitialized || this.isLoading) return;

        this.isLoading = true;
        try {
            const userId = await ensureCurrentUserId();
            if (!userId) {
                this.isInitialized = true;
                this.isLoading = false;
                return;
            }

            const response = await ShopService.getWishlist({ userId });
            if (response && (response.success || response.status === 'success')) {
                this.wishlistItems.clear();

                const products = response.data?.products || response.products || [];
                products.forEach(item => {
                    const productId = String(item.product_id || item.id);
                    this.wishlistItems.add(productId);
                });
            }
            this.isInitialized = true;
            this.notifyListeners(); // Signal full sync
        } catch (error) {
            console.error("WishlistStateManager: Failed to initialize", error);
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Wait for initialization to complete
     */
    async waitForInit() {
        if (this.isInitialized) return;
        if (this.isLoading) {
            // Wait for current init to complete
            while (this.isLoading) {
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        } else {
            await this.init();
        }
    }

    /**
     * Check if product is in wishlist (instant, no API call)
     * Note: Ensure init() is called first, or use waitForInit()
     */
    isInWishlist(productId) {
        return this.wishlistItems.has(String(productId));
    }

    /**
     * Toggle wishlist status (updates cache + API)
     */
    async toggleWishlist(productId) {
        const userId = await ensureCurrentUserId();
        if (!userId) {
            throw new Error("User not logged in");
        }

        const pid = String(productId);
        const isCurrentlyInWishlist = this.isInWishlist(pid);
        const action = isCurrentlyInWishlist ? "remove" : "add";

        // Optimistic update: update cache immediately
        if (action === "add") {
            this.wishlistItems.add(pid);
        } else {
            this.wishlistItems.delete(pid);
        }
        this.notifyListeners(pid, action === "add");

        try {
            const response = await ShopService.toggleWishlist({ userId, productId, action });

            if (response && (response.success || response.status)) {
                return {
                    success: true,
                    inWishlist: action === "add",
                    message: action === "add" ? "Added to wishlist" : "Removed from wishlist"
                };
            } else {
                // Rollback on failure
                if (action === "add") {
                    this.wishlistItems.delete(pid);
                } else {
                    this.wishlistItems.add(pid);
                }
                this.notifyListeners(pid, !(action === "add"));
                return {
                    success: false,
                    message: response?.message || "Wishlist update failed"
                };
            }
        } catch (error) {
            // Rollback on error
            if (action === "add") {
                this.wishlistItems.delete(pid);
            } else {
                this.wishlistItems.add(pid);
            }
            this.notifyListeners(pid, !(action === "add"));
            throw error;
        }
    }

    /**
     * Sync wishlist from backend (refresh cache)
     */
    async sync() {
        this.isInitialized = false;
        await this.init();
    }

    /**
     * Subscribe to wishlist state changes
     */
    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback); // Return unsubscribe function
    }

    /**
     * Notify all listeners of state change
     */
    notifyListeners(productId, inWishlist) {
        this.listeners.forEach(callback => {
            try {
                callback(productId, inWishlist);
            } catch (error) {
                console.error("WishlistStateManager: Listener error", error);
            }
        });
    }

    /**
     * Get all wishlist product IDs
     */
    getAllProductIds() {
        return Array.from(this.wishlistItems);
    }

    /**
     * Get wishlist count
     */
    getCount() {
        return this.wishlistItems.size;
    }
}

// Export singleton instance
const wishlistStateManager = new WishlistStateManager();
export default wishlistStateManager;

