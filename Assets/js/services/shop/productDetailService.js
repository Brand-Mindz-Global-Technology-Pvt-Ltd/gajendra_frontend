import CONFIG from "../../config.js";
import { apiCall } from "../../utils/api.js";

const ProductDetailService = {
    /**
     * Fetch product details by ID
     * Backend: GET /get_product.php?product_id=...
     * Response: { success: true, product: {...} }
     */
    async getProduct(productId) {
        return await apiCall(`${CONFIG.SHOP_API_URL}/get_product.php?product_id=${productId}`);
    }
};

export default ProductDetailService;

