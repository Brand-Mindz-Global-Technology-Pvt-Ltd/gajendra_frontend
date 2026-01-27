import wishlistStateManager from "./wishlistStateManager.js";
import cartStateManager from "./cartStateManager.js";
import { Toast } from "./toast.js";
import ShopService from "../services/shop/shopService.js";
import { ensureCurrentUserId } from "./userUtils.js";
import CONFIG from "../config.js";

/**
 * WishlistPopupManager - Manages wishlist popup using state manager
 */

/**
 * Load and render wishlist from state manager
 */
async function loadWishlistFromStateManager() {
    const grid = document.getElementById("wishlistGrid");
    if (!grid) return;

    grid.innerHTML = "";

    // Wait for state managers to be ready
    await wishlistStateManager.waitForInit();
    await cartStateManager.waitForInit();

    const userId = await ensureCurrentUserId();
    if (!userId) {
        grid.innerHTML = `<p class="text-gray-500 text-center col-span-full py-10">Please login to view wishlist</p>`;
        return;
    }

    try {
        const response = await ShopService.getWishlist({ userId });

        if (!response || (!response.success && response.status !== 'success')) {
            grid.innerHTML = `<p class="text-gray-500 text-center col-span-full py-10">No wishlist items</p>`;
            return;
        }

        const products = response.data?.products || response.products || [];

        if (products.length === 0) {
            grid.innerHTML = `<p class="text-gray-500 text-center col-span-full py-10">No wishlist items</p>`;
            return;
        }

        products.forEach(p => {
            const productId = p.product_id || p.id;
            const productName = p.name || p.product_name || 'Product';
            const productPrice = parseFloat(p.price || p.product_price || 0).toFixed(2);

            // Image handling
            let productImage = p.thumbnail || null;
            if (!productImage) {
                let images = p.images;
                if (typeof images === 'string') {
                    try { images = JSON.parse(images); } catch (e) { images = images.split(',').map(img => img.trim()); }
                }
                if (!Array.isArray(images) && images) {
                    images = [images];
                }
                if (Array.isArray(images) && images.length > 0) {
                    const validImages = images.filter(img => {
                        if (!img) return false;
                        const imgStr = String(img);
                        return imgStr !== '__EMPTY__' && !imgStr.endsWith('/__EMPTY__') && imgStr !== 'null' && imgStr !== 'undefined';
                    });
                    productImage = validImages.length > 0 ? validImages[0] : null;
                }
            }

            let imageUrl = productImage
                ? (productImage.startsWith('http') ? productImage : CONFIG.UPLOADS_URL + '/' + productImage)
                : 'https://placehold.co/300x300/FDF5ED/DAA520?text=' + encodeURIComponent(productName);

            if (imageUrl.includes('narpavihoney.brandmindz.com')) {
                imageUrl = imageUrl.replace('narpavihoney.brandmindz.com', 'gajendhrademo.brandmindz.com');
            }

            const fallbackUrl = imageUrl.includes('gajendhrademo.brandmindz.com')
                ? imageUrl.replace('gajendhrademo.brandmindz.com', 'narpavihoney.brandmindz.com')
                : imageUrl;

            // Check if product is in cart
            const isInCart = cartStateManager.isInCart(productId);

            // Generate Add to Cart button based on status
            let addToCartBtn;
            if (isInCart) {
                addToCartBtn = `
                    <button class="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm cursor-not-allowed opacity-90" disabled>
                        Added
                    </button>
                `;
            } else {
                addToCartBtn = `
                    <button onclick="addWishlistToCart(${productId})" class="flex-1 border border-[#B06D36] text-[#B06D36] py-2 rounded-lg text-sm hover:bg-[#FFF8F0] transition-colors">
                        Add to cart
                    </button>
                `;
            }

            grid.innerHTML += `
                <div class="border rounded-xl p-4 relative">
                    <!-- REMOVE -->
                    <button onclick="removeWishlistItem(${productId})"
                            class="absolute top-3 right-3 text-red-600 text-xl hover:text-red-800 transition-colors">
                        ♥
                    </button>

                    <img src="${imageUrl}"
                         class="mx-auto mb-3 w-28 h-28 object-contain" 
                         alt="${productName}"
                         onerror="if(this.src !== '${fallbackUrl}') { this.src = '${fallbackUrl}'; } else { this.src = 'https://placehold.co/300x300/FDF5ED/DAA520?text=${encodeURIComponent(productName)}'; }" />

                    <h4 class="font-medium text-[#3E1C00]">${productName}</h4>

                    <div class="text-sm mt-1">
                        <span class="font-semibold text-[#B06D36]">Rs : ${productPrice}</span>
                    </div>

                    <div class="flex gap-2 mt-4">
                        ${addToCartBtn}
                        <button onclick="window.location.href='../Shop/Singleproduct.html?product_id=${productId}'" class="flex-1 bg-[#B06D36] text-white py-2 rounded-lg text-sm hover:bg-[#8B4513] transition-colors">
                            Buy Now
                        </button>
                    </div>
                </div>`;
        });

        const headerCount = document.querySelector("#wishlistOverlay p.text-sm");
        if (headerCount) {
            headerCount.innerText = `You have ${products.length} item${products.length !== 1 ? 's' : ''} in your wishlist`;
        }

    } catch (err) {
        console.error("Wishlist load error", err);
        grid.innerHTML = `<p class="text-red-500 text-center col-span-full py-10">Error loading wishlist</p>`;
    }
}

/**
 * Remove wishlist item
 */
window.removeWishlistItem = async function (productId) {
    try {
        const response = await wishlistStateManager.toggleWishlist(productId);
        if (response && response.success) {
            Toast.success("Removed from wishlist");
            await loadWishlistFromStateManager();
        } else {
            Toast.error(response?.message || "Failed to remove from wishlist");
        }
    } catch (error) {
        console.error("Remove wishlist error:", error);
        Toast.error("Failed to remove from wishlist");
    }
};

/**
 * Add wishlist item to cart
 */
window.addWishlistToCart = async function (productId) {
    const userId = await ensureCurrentUserId();
    if (!userId) {
        Toast.error("Please login");
        return;
    }

    try {
        const response = await cartStateManager.addToCart(productId, 1);
        if (response && response.success) {
            Toast.success("Added to cart");
            // Reload wishlist to update button state
            await loadWishlistFromStateManager();
        } else {
            Toast.error(response?.message || "Failed to add to cart");
        }
    } catch (error) {
        console.error("Add to cart error:", error);
        Toast.error("Failed to add to cart");
    }
};

/**
 * Open wishlist popup (updated to use state manager)
 */
window.openWishlist = async function () {
    const overlay = document.getElementById("wishlistOverlay");
    if (overlay) {
        await loadWishlistFromStateManager();
        overlay.classList.remove("hidden");
    } else {
        console.error("Wishlist overlay not found!");
    }
};

export { loadWishlistFromStateManager };
