import CONFIG from "../../config.js";
import { apiCall } from "../../utils/api.js";

const ShopService = {
    /**
     * Fetch all product categories
     */
    async getCategories() {
        return await apiCall(`${CONFIG.SHOP_API_URL}/get_categories.php`);
    },

    /**
     * Fetch subcategories for a specific category
     */
    async getSubcategories(categoryId) {
        return await apiCall(`${CONFIG.SHOP_API_URL}/get_subcategories.php?category_id=${categoryId}`);
    },

    /**
     * Fetch products with filters
     */
    async getProducts(params = {}) {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.category_id) {
            const catIds = Array.isArray(params.category_id) ? params.category_id.join(',') : params.category_id;
            if (catIds) queryParams.append('category_id', catIds);
        }
        if (params.subcategory_id) {
            const subIds = Array.isArray(params.subcategory_id) ? params.subcategory_id.join(',') : params.subcategory_id;
            if (subIds) queryParams.append('subcategory_id', subIds);
        }
        if (params.search) queryParams.append('search', params.search);
        if (params.is_best_seller !== null && params.is_best_seller !== undefined) queryParams.append('is_best_seller', params.is_best_seller);
        if (params.min_price !== null && params.min_price !== undefined) queryParams.append('min_price', params.min_price);
        if (params.max_price !== null && params.max_price !== undefined) queryParams.append('max_price', params.max_price);

        return await apiCall(`${CONFIG.SHOP_API_URL}/get_products.php?${queryParams.toString()}`);
    },

    /**
     * Get search suggestions
     */
    async getSearchSuggestions(query) {
        return await apiCall(`${CONFIG.SHOP_API_URL}/search_suggestions.php?q=${encodeURIComponent(query)}`);
    },

    /**
     * Toggle item in wishlist
     */
    async toggleWishlist({ userId, productId, action }) {
        // According to shop.js: body: new URLSearchParams({ user_id: USER_ID, product_id: productId })
        // apiCall handles JSON or FormData. Here it seems backend expects x-www-form-urlencoded based on shop.js
        // But apiCall stringifies object to JSON. Let's see if we need to adjust apiCall or just send FormData.
        if (!userId) {
            return { success: false, message: "Please login" };
        }

        const formData = new FormData();
        formData.append('user_id', userId);
        formData.append('product_id', productId);

        return await apiCall(`${CONFIG.SHOP_API_URL}/wishlist.php?action=${action}`, "POST", formData);
    },

    /**
     * Get wishlist products for a user.
     * Backend: GET /wishlist.php?action=list&user_id=...
     * Response: { success: true, data: { products: [...] } }
     */
    async getWishlist({ userId }) {
        return await apiCall(`${CONFIG.SHOP_API_URL}/wishlist.php?action=list&user_id=${userId}`);
    }
};

export default ShopService;
