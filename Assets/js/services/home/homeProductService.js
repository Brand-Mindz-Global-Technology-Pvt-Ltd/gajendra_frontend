import CONFIG from '../../config.js';

const HomeProductService = {
    /**
     * Fetch products and sort them by descending ID (newest first)
     */
    async getHomeProducts() {
        try {
            const limit = 10;
            const response = await fetch(`${CONFIG.SHOP_API_URL}/get_products.php?limit=${limit}`);
            const data = await response.json();

            if (!data.status || !data.products) {
                return [];
            }

            const sortedProducts = data.products.sort((a, b) => b.id - a.id);
            return sortedProducts;
        } catch (error) {
            console.error('HomeProductService: Error fetching products:', error);
            return [];
        }
    },

    /**
     * Fetch best selling products
     */
    async getBestSellers() {
        try {
            const response = await fetch(`${CONFIG.SHOP_API_URL}/get_products.php?is_best_seller=1`);
            const data = await response.json();

            if (!data.status || !data.products) {
                return [];
            }

            return data.products;
        } catch (error) {
            console.error('HomeProductService: Error fetching best sellers:', error);
            return [];
        }
    }
};

export default HomeProductService;
