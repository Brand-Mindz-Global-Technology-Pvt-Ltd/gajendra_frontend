import cartStateManager from "./cartStateManager.js";
import CartService from "../services/shop/cartService.js";
import { ensureCurrentUserId } from "./userUtils.js";
import CONFIG from "../config.js";

/**
 * CartPopupManager - Manages cart popup using state manager
 * Replaces localStorage-based cart with backend state manager
 */

/**
 * Render cart items from state manager
 */
async function renderCartFromStateManager() {
    const container = document.querySelector("#cartOverlay .overflow-y-auto");
    const summaryContainer = document.querySelector("#cartOverlay .w-full.md\\:w-80");
    
    if (!container) return;

    // Wait for state manager to be ready
    await cartStateManager.waitForInit();

    // Get cart items from state manager
    const userId = await ensureCurrentUserId();
    if (!userId) {
        container.innerHTML = `<div class="text-center p-10 text-gray-500">Please login to view cart</div>`;
        return;
    }

    const response = await CartService.getCart({ userId });
    let cartItems = [];
    let subtotal = 0;

    if (response && response.success && Array.isArray(response.cart)) {
        cartItems = response.cart;
    }

    container.innerHTML = "";

    if (cartItems.length === 0) {
        container.innerHTML = `<div class="text-center p-10 text-gray-500">Your cart is empty</div>`;
    } else {
        cartItems.forEach((item, index) => {
            const itemPrice = parseFloat(item.price || 0);
            const quantity = parseInt(item.quantity || 1);
            const itemSubtotal = itemPrice * quantity;
            subtotal += itemSubtotal;

            // Use same image fetching logic as shopRenderer.js with proper __EMPTY__ filtering
            // First check for thumbnail field (from get_products.php response)
            let productImage = item.thumbnail || null;
            
            if (!productImage) {
                // Process images array
                let images = item.images || item.image;
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

            let imageUrl = productImage
                ? (productImage.startsWith('http') ? productImage : CONFIG.UPLOADS_URL + '/' + productImage)
                : 'https://placehold.co/300x300/FDF5ED/DAA520?text=' + encodeURIComponent(item.name || 'Product');
            
            // Normalize URL to use CONFIG domain (fix domain mismatch between APIs)
            // Backend APIs return different domains, but images should be on CONFIG domain
            if (imageUrl.includes('gajendhrademo.brandmindz.com')) {
                imageUrl = imageUrl.replace('gajendhrademo.brandmindz.com', 'gajendhrademo.brandmindz.com');
            }
            
            // Create fallback URL (try alternative domain if current one fails)
            const fallbackUrl = imageUrl.includes('gajendhrademo.brandmindz.com')
                ? imageUrl.replace('gajendhrademo.brandmindz.com', 'gajendhrademo.brandmindz.com')
                : imageUrl;
            
            const productName = item.name || 'Product';

            container.innerHTML += `
                <div class="flex items-center gap-4 p-4 border rounded-xl">
                    <img src="${imageUrl}" 
                         class="w-20 h-20 rounded object-cover" 
                         alt="${productName}"
                         onerror="if(this.src !== '${fallbackUrl}') { this.src = '${fallbackUrl}'; } else { this.src = 'https://placehold.co/300x300/FDF5ED/DAA520?text=${encodeURIComponent(productName)}'; }" />

                    <div class="flex-1">
                        <h4 class="font-medium text-[#3E1C00]">${productName}</h4>
                        <p class="text-sm text-gray-500">Rs : ${itemPrice.toFixed(2)}</p>
                    </div>

                    <div class="flex items-center gap-2">
                        <button onclick="updateCartQuantity(${item.cart_id}, ${quantity - 1})" class="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">−</button>
                        <span class="w-6 text-center font-medium">${quantity}</span>
                        <button onclick="updateCartQuantity(${item.cart_id}, ${quantity + 1})" class="px-2 py-1 bg-[#5D3420] text-white rounded hover:bg-[#3E1C00]">+</button>
                    </div>

                    <button onclick="removeCartItem(${item.cart_id})" class="text-red-500 ml-2 hover:text-red-700">
                        🗑️
                    </button>
                </div>
            `;
        });
    }

    // Update header count
    const headerCount = document.querySelector("#cartOverlay p.text-sm");
    if (headerCount) {
        headerCount.innerText = `You have ${cartItems.length} item${cartItems.length !== 1 ? 's' : ''} in your cart`;
    }

    // Update summary
    const summaryDivs = document.querySelectorAll("#cartOverlay .w-full.md\\:w-80 .flex.justify-between span:last-child");
    if (summaryDivs.length >= 3) {
        const delivery = 60;
        const total = subtotal + (subtotal > 0 ? delivery : 0);

        summaryDivs[0].innerText = `Rs : ${subtotal.toFixed(2)}`;
        summaryDivs[1].innerText = `Rs : ${subtotal > 0 ? delivery : 0}`;
        summaryDivs[2].innerText = `Rs : ${total.toFixed(2)}`;
    }
}

/**
 * Update cart quantity
 * Note: Backend doesn't have update endpoint, so we delete and re-add
 */
window.updateCartQuantity = async function(cartId, newQuantity) {
    if (newQuantity < 1) {
        await window.removeCartItem(cartId);
        return;
    }

    const userId = await ensureCurrentUserId();
    if (!userId) {
        alert("Please login");
        return;
    }

    try {
        // Find the cart item to get product_id
        const response = await CartService.getCart({ userId });
        if (!response || !response.success || !Array.isArray(response.cart)) {
            alert("Failed to load cart");
            return;
        }

        const cartItem = response.cart.find(item => item.cart_id == cartId);
        if (!cartItem) {
            alert("Item not found");
            return;
        }

        // Remove old item
        await CartService.deleteCartItem({ userId, cartItemId: cartId });
        
        // Add with new quantity
        const addResponse = await cartStateManager.addToCart(cartItem.product_id, newQuantity);
        
        if (addResponse.success) {
            await renderCartFromStateManager();
        } else {
            alert(addResponse.message || "Failed to update quantity");
        }
    } catch (error) {
        console.error("Update quantity error:", error);
        alert("Failed to update quantity");
    }
};

/**
 * Remove cart item
 */
window.removeCartItem = async function(cartId) {
    const userId = await ensureCurrentUserId();
    if (!userId) {
        alert("Please login");
        return;
    }

    try {
        // Get cart to find product_id from cart_id
        const response = await CartService.getCart({ userId });
        if (!response || !response.success || !Array.isArray(response.cart)) {
            alert("Failed to load cart");
            return;
        }

        const cartItem = response.cart.find(item => item.cart_id == cartId);
        if (!cartItem) {
            alert("Item not found");
            return;
        }

        // Remove directly using CartService (since we have cart_id)
        const removeResponse = await CartService.deleteCartItem({ 
            userId, 
            cartItemId: cartId 
        });
        
        if (removeResponse && removeResponse.success) {
            // Sync state manager to reflect the change
            await cartStateManager.sync();
            await renderCartFromStateManager();
        } else {
            alert(removeResponse?.message || "Failed to remove item");
        }
    } catch (error) {
        console.error("Remove cart item error:", error);
        alert("Failed to remove item");
    }
};

/**
 * Open cart popup (updated to use state manager)
 */
window.openCart = async function() {
    const overlay = document.getElementById("cartOverlay");
    if (overlay) {
        await renderCartFromStateManager();
        overlay.classList.remove("hidden");
    }
};

export { renderCartFromStateManager };

