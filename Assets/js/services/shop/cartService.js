import CONFIG from "../../config.js";
import { apiCall } from "../../utils/api.js";

const CartService = {
  /**
   * Add product to cart (server-side).
   * Backend: POST /add_to_cart.php (accepts JSON or form-data)
   */
  async addToCart({ userId, productId, quantity = 1 }) {
    return await apiCall(`${CONFIG.SHOP_API_URL}/add_to_cart.php`, "POST", {
      user_id: userId,
      product_id: productId,
      quantity,
    });
  },

  /**
   * Get cart items for user.
   * Backend: GET /get_cart.php?user_id=...
   * Response: { success: true, cart: [...], total_amount: number } OR { success: false, message: "Cart is empty" }
   */
  async getCart({ userId }) {
    return await apiCall(`${CONFIG.SHOP_API_URL}/get_cart.php?user_id=${userId}`);
  },

  /**
   * Deletes cart item by cart row id.
   * Backend: POST(JSON) /delete_cart.php expects { id, user_id }
   */
  async deleteCartItem({ userId, cartItemId }) {
    return await apiCall(`${CONFIG.SHOP_API_URL}/delete_cart.php`, "POST", {
      id: cartItemId,
      user_id: userId,
    });
  },
};

export default CartService;


