import CONFIG from "../config.js";
import { apiCall } from "../utils/api.js";

const ProfileService = {
    // === Profile Info ===
    async updateProfile(formData) {
        return await apiCall(`${CONFIG.PROFILE_API_URL}/update_profile.php`, "POST", formData);
    },

    async uploadProfileImage(formData) {
        return await apiCall(`${CONFIG.PROFILE_API_URL}/upload_profile_image.php`, "POST", formData);
    },

    // === Addresses ===
    async getAllAddresses() {
        return await apiCall(`${CONFIG.PROFILE_API_URL}/get_all_addresses.php`, "GET");
    },

    async saveAddress(formData) {
        return await apiCall(`${CONFIG.PROFILE_API_URL}/save_address.php`, "POST", formData);
    },

    async deleteAddress(addressId) {
        const formData = new FormData();
        formData.append("address_id", addressId);
        return await apiCall(`${CONFIG.PROFILE_API_URL}/delete_address.php`, "POST", formData);
    },

    // === Shop Data ===
    async getOrders(userId) {
        return await apiCall(`${CONFIG.SHOP_API_URL}/get_orders.php?user_id=${userId}`, "GET");
    },

    async getWishlist(userId) {
        return await apiCall(`${CONFIG.SHOP_API_URL}/wishlist.php?action=list&user_id=${userId}`, "GET");
    },
    
    async removeFromWishlist(userId, productId) {
         // Assuming wishlist endpoint handles removal via POST or similar logic as per original file
         // Original code: removeFromWishlist(${userId}, ${product.product_id}) logic was inline in HTML onclick
         // We should expose a method for it.
         // Original used: fetch(`${CONFIG.SHOP_API_URL}/wishlist.php?action=remove...`... ??? NO wait.
         // Let's check original profile.js... it had onclick="removeFromWishlist(...)".
         // But where was that defined? It wasn't in module scope! It must have been global.
         // Wait, the original profile.js didn't export removeFromWishlist to window. 
         // Ah, I missed moving that logic into the module. It might have been broken in the previous refactor or I missed it.
         // Actually, let's look at `wishlist.php`: it accepts `removeFromWishlist` logic.
         // We will implement `removeFromWishlist` call here.
         const formData = new FormData();
         formData.append("user_id", userId);
         formData.append("product_id", productId);
         formData.append("action", "remove"); 
         // Double check backend wishlist.php... 
         // Function removeFromWishlist($user_id, $product_id) exists in backend.
         // Route seems to handle actions.
         return await apiCall(`${CONFIG.SHOP_API_URL}/wishlist.php?action=remove&user_id=${userId}&product_id=${productId}`, "POST");
    }
};

export default ProfileService;
