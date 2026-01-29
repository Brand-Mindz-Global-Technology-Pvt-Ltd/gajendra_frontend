/**
 * Admin Dashboard Logic
 * Handles dashboard statistics and overview
 */

/**
 * Load dashboard data
 */
async function loadDashboard() {
    try {
        // Check if progress indicator exists
        if (typeof showLoading === 'function') showLoading("dashboard");

        // Load all data in parallel
        const [productsRes, categoriesRes, ordersRes, blogsRes] = await Promise.all([
            fetch(`${API_BASE}/get_my_products.php?shop_id=${currentShop.id}`),
            fetch(`${API_BASE}/get_categories.php`),
            fetch(`${API_BASE}/get_orders.php?shop_id=${currentShop.id}`),
            fetch(`${API_BASE}/get_blogs.php`),
        ]);

        const [productsData, categoriesData, ordersData, blogsData] = await Promise.all([
            productsRes.text().then((text) => {
                try {
                    return JSON.parse(text);
                } catch (e) {
                    console.error("Failed to parse products response:", text);
                    return { success: false, message: "Invalid response format" };
                }
            }),
            categoriesRes.text().then((text) => {
                try {
                    return JSON.parse(text);
                } catch (e) {
                    console.error("Failed to parse categories response:", text);
                    return { success: false, message: "Invalid response format" };
                }
            }),
            ordersRes.text().then((text) => {
                try {
                    return JSON.parse(text);
                } catch (e) {
                    console.error("Failed to parse orders response:", text);
                    return { success: false, message: "Invalid response format" };
                }
            }),
            blogsRes.text().then((text) => {
                try {
                    return JSON.parse(text);
                } catch (e) {
                    console.error("Failed to parse blogs response:", text);
                    return { success: false, message: "Invalid response format" };
                }
            }),
        ]);

        // Update dashboard cards
        const cardProducts = document.getElementById("cardProducts");
        const cardCategories = document.getElementById("cardCategories");
        const cardOrders = document.getElementById("cardOrders");
        const cardBlogs = document.getElementById("cardBlogs");

        if (cardProducts) cardProducts.innerText = productsData.success ? productsData.products.length : 0;
        if (cardCategories) cardCategories.innerText = categoriesData.success ? categoriesData.categories.length : 0;
        if (cardOrders) cardOrders.innerText = ordersData.success ? ordersData.orders.length : 0;
        if (cardBlogs) cardBlogs.innerText = blogsData.success ? blogsData.blogs.length : 0;

        if (typeof hideLoading === 'function') hideLoading("dashboard");
    } catch (error) {
        console.error("❌ Failed to load dashboard:", error);
        if (typeof hideLoading === 'function') hideLoading("dashboard");
        if (typeof showToast === 'function') showToast("❌ Failed to load dashboard data", "error");
    }
}

// Attach to window
window.loadDashboard = loadDashboard;
