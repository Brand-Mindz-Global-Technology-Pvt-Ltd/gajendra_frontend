/**
 * Home Page Script Entry Point
 */
import HomeProductService from '../services/home/homeProductService.js';
import HomeProductRenderer from '../renderers/home/homeProductRenderer.js';
import { MenuRenderer } from '../renderers/menuRenderer.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Render Menu
    MenuRenderer.render('main-nav');

    // 2. Fetch and Render Home Products
    console.log('Home: Initializing product list...');
    const products = await HomeProductService.getHomeProducts();
    console.log(`Home: Fetched ${products.length} products.`);
    HomeProductRenderer.render(products);
});
