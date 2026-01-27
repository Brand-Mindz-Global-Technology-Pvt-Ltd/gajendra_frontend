import HomeProductService from '../services/home/homeProductService.js';
import HomeProductRenderer from '../renderers/home/homeProductRenderer.js';
import { HeaderInitializer } from '../utils/headerInitializer.js';
import "../utils/cartPopupManager.js";
import "../utils/wishlistPopupManager.js";

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize Header (Menu, Auth, Dropdown, Logout)
    await HeaderInitializer.init();

    // 2. Fetch and Render Home Products

    // 4. Fetch and Render Home Products
    console.log('Home: Initializing product list...');
    const products = await HomeProductService.getHomeProducts();
    console.log(`Home: Fetched ${products.length} products.`);
    HomeProductRenderer.render(products);
});
