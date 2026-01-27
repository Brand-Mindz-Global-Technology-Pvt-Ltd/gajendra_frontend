import CONFIG from '../../config.js';

/**
 * Menu Service
 * handle API operations for Menu
 */
const MenuService = {
  /**
   * Fetch mega menu hierarchy
   * @returns {Promise<Object>}
   */
  async getMegaMenu() {
    try {
      // Using CONFIG.SHOP_API_URL and removing shop_id as requested
      const response = await fetch(`${CONFIG.SHOP_API_URL}/get_mega_menu.php`);
      
      const data = await response.json();
      console.log("menu", data);
      return data;
    } catch (error) {
      console.error('MenuService: Fetch error:', error);
      return { success: false, message: error.message };
    }
  }
};

export default MenuService;
