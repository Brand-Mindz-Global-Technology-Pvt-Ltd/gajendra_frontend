import CartService from "../services/shop/cartService.js";
import { ensureCurrentUserId } from "./userUtils.js";

/**
 * CartStateManager - Singleton pattern
 * Maintains cart state in memory for instant status checks
 * Syncs with backend on initialization
 */
class CartStateManager {
    constructor() {
        this.cartItems = new Set(); // Set of product IDs in cart
        this.cartItemsWithDetails = new Map(); // productId -> { cartId, quantity, ... }
        this.isInitialized = false;
        this.isLoading = false;
        this.listeners = new Set(); // Callbacks for state changes
    }

    /**
     * Initialize: Sync cart from backend
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

            const response = await CartService.getCart({ userId });

            // Always clear cache first
            this.cartItems.clear();
            this.cartItemsWithDetails.clear();

            // If cart has items, populate cache
            if (response && response.success && Array.isArray(response.cart) && response.cart.length > 0) {
                response.cart.forEach(item => {
                    const productId = String(item.product_id);
                    if (productId && productId !== 'undefined' && productId !== 'null') {
                        this.cartItems.add(productId);
                        this.cartItemsWithDetails.set(productId, {
                            cartId: item.cart_id,
                            productId: item.product_id,
                            quantity: item.quantity,
                            ...item
                        });
                    }
                });
            }
            // If cart is empty (success: false or empty array), cache is already cleared above

            this.isInitialized = true;
            this.notifyListeners(); // Signal full sync
        } catch (error) {
            console.error("CartStateManager: Failed to initialize", error);
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
     * Check if product is in cart (instant, no API call)
     * Note: Ensure init() is called first, or use waitForInit()
     */
    isInCart(productId) {
        return this.cartItems.has(String(productId));
    }

    /**
     * Get cart item details
     */
    getCartItem(productId) {
        return this.cartItemsWithDetails.get(String(productId)) || null;
    }

    /**
     * Add product to cart (updates cache + API)
     */
    async addToCart(productId, quantity = 1) {
        const userId = await ensureCurrentUserId();
        if (!userId) {
            throw new Error("User not logged in");
        }

        const pid = String(productId);

        // Optimistic update: add to cache immediately
        this.cartItems.add(pid);
        this.notifyListeners(pid, true);

        try {
            const response = await CartService.addToCart({ userId, productId, quantity });

            if (response && response.success) {
                // Update cache with details if available from response
                // Note: Backend doesn't return cart_id in add response, but that's OK
                // We'll get it on next sync/init
                if (!this.cartItemsWithDetails.has(pid)) {
                    this.cartItemsWithDetails.set(pid, {
                        productId: parseInt(pid),
                        quantity: response.quantity || quantity
                    });
                }

                return { success: true, message: response.message || "Added to cart" };
            } else {
                // Rollback on failure
                this.cartItems.delete(pid);
                this.cartItemsWithDetails.delete(pid);
                this.notifyListeners(pid, false);
                return { success: false, message: response?.message || "Failed to add to cart" };
            }
        } catch (error) {
            // Rollback on error
            this.cartItems.delete(pid);
            this.cartItemsWithDetails.delete(pid);
            this.notifyListeners(pid, false);
            throw error;
        }
    }

    /**
     * Remove product from cart (updates cache + API)
     */
    async removeFromCart(productId) {
        const userId = await ensureCurrentUserId();
        if (!userId) {
            throw new Error("User not logged in");
        }

        const pid = String(productId);
        const cartItem = this.getCartItem(pid);

        if (!cartItem) {
            return { success: false, message: "Product not in cart" };
        }

        // Optimistic update: remove from cache immediately
        this.cartItems.delete(pid);
        this.cartItemsWithDetails.delete(pid);
        this.notifyListeners(pid, false);

        try {
            const response = await CartService.deleteCartItem({
                userId,
                cartItemId: cartItem.cartId
            });

            if (response && response.success) {
                return { success: true, message: response.message || "Removed from cart" };
            } else {
                // Rollback: re-add to cache
                this.cartItems.add(pid);
                this.cartItemsWithDetails.set(pid, cartItem);
                this.notifyListeners(pid, true);
                return { success: false, message: response?.message || "Failed to remove from cart" };
            }
        } catch (error) {
            // Rollback on error
            this.cartItems.add(pid);
            this.cartItemsWithDetails.set(pid, cartItem);
            this.notifyListeners(pid, true);
            throw error;
        }
    }

    /**
     * Sync cart from backend (refresh cache)
     */
    async sync() {
        this.isInitialized = false;
        await this.init();
    }

    /**
     * Subscribe to cart state changes
     */
    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback); // Return unsubscribe function
    }

    /**
     * Notify all listeners of state change
     */
    notifyListeners(productId, inCart) {
        this.listeners.forEach(callback => {
            try {
                callback(productId, inCart);
            } catch (error) {
                console.error("CartStateManager: Listener error", error);
            }
        });
    }

    /**
     * Get all cart product IDs
     */
    getAllProductIds() {
        return Array.from(this.cartItems);
    }

    /**
     * Get cart count
     */
    getCount() {
        return this.cartItems.size;
    }
}

// Export singleton instance
const cartStateManager = new CartStateManager();
export default cartStateManager;

