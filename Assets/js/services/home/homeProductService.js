import CONFIG from '../../config.js';

const HomeProductService = {
    /**
     * Fetch products and sort them by descending ID (newest first)
     */
    async getHomeProducts() {
        try {
            // Fetch products using the global config
            // No limit param if API doesn't support it, but we add it just in case or to bust cache
            // We fetch a larger limit to ensure we have enough items to sort and display
            const limit = 20;
            const response = await fetch(`${CONFIG.SHOP_API_URL}/get_products.php?limit=${limit}`);
            const data = await response.json();

            if (!data.status || !data.products) {
                return [];
            }

            // REVERSE ORDER logic as requested
            // If the API returns default order (usually ID ASC or Created ASC),
            // we reverse it to get Newest First.
            // Using reverse() if we just want to flip the API result, or sort for strictness.
            // User asked for "reverse order", implies flipping the list.

            // Let's assume we want strictly newest first.
            const sortedProducts = data.products.sort((a, b) => b.id - a.id);

            return sortedProducts;
        } catch (error) {
            console.error('HomeProductService: Error fetching products:', error);
            return [];
        }
    }
};

export default HomeProductService;
