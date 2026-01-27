/**
 * Menu Renderer
 * Responsible for generating dynamic mega menu HTML.
 */

import MenuService from '../services/navbar/menuService.js';

export const MenuRenderer = {
    /**
     * Render the navigation menu
     * @param {string} containerId - The ID of the nav container (usually where 'HOME' is)
     */
    async render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Menu container '${containerId}' not found.`);
            return;
        }

        try {
            // Render Skeleton Loader inside the container before fetching
            container.innerHTML = this.getSkeletonHTML();

            // Fetch menu data from service
            const data = await MenuService.getMegaMenu();

            if (!data.success) {
                console.error('Failed to fetch menu:', data.message);
                return;
            }

            // Keep "HOME" link (static)
            let html = `
                <a href="../Home/Home.html"
                    class="text-white text-sm lg:text-base font-medium hover:text-[#C4703C] transition-colors py-4">
                    HOME
                </a>
            `;

            // Generate dynamic category menus
            data.menu.forEach(category => {
                html += this.createCategoryItem(category);
            });

            // Add static "ABOUT US" and "CONTACT US"
            html += `
                <a href="../About/About.html"
                    class="text-white text-sm lg:text-base font-medium hover:text-[#C4703C] transition-colors">
                    ABOUT US
                </a>
                <a href="../Contact/Contact.html"
                    class="text-white text-sm lg:text-base font-medium hover:text-[#C4703C] transition-colors">
                    CONTACT US
                </a>
            `;

            container.innerHTML = html;

            // Also render Mobile Menu if it exists
            this.renderMobileMenu(data.menu);

        } catch (error) {
            console.error('Error rendering menu:', error);
        }
    },

    /**
     * Create HTML for a single category item (with mega menu)
     */
    createCategoryItem(category) {
        // If no subcategories, just a simple link
        if (!category.subcategories || category.subcategories.length === 0) {
            return `
                <a href="../Shop/Shop.html?category=${category.slug}"
                    class="text-white text-sm lg:text-base font-medium hover:text-[#C4703C] transition-colors py-4 flex items-center gap-1 cursor-pointer">
                    ${category.name.toUpperCase()}
                </a>
            `;
        }

        // Determine width and grid columns based on subcategory count
        const subCount = category.subcategories.length;
        let widthClass = 'w-[700px]'; // Default for 3+ items
        let gridClass = 'grid-cols-3';

        if (subCount === 1) {
            widthClass = 'w-[250px]';
            gridClass = 'grid-cols-1';
        } else if (subCount === 2) {
            widthClass = 'w-[500px]';
            gridClass = 'grid-cols-2';
        }

        // Mega Menu Structure
        return `
            <div class="relative group">
                <a href="../Shop/Shop.html?category=${category.slug}"
                    class="text-white text-sm lg:text-base font-medium hover:text-[#C4703C] transition-colors py-4 flex items-center gap-1 cursor-pointer">
                    ${category.name.toUpperCase()}
                    <svg xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 9l-7 7-7-7" />
                    </svg>
                </a>
                <!-- Mega Menu -->
                <div class="absolute top-full left-1/2 -translate-x-1/2 ${widthClass} bg-white rounded-lg shadow-xl p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 mt-0 border-t-4 border-[#C4703C]">
                    <div class="grid ${gridClass} gap-8 text-left">
                        ${category.subcategories.map(sub => this.createSubcategoryColumn(sub)).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Create HTML for a subcategory column
     */
    createSubcategoryColumn(sub) {
        // Generate product list items
        let productsHtml = '';
        if (sub.products && sub.products.length > 0) {
            productsHtml = `
                <ul class="space-y-2">
                    ${sub.products.map(prod => `
                        <li>
                            <a href="../Shop/Singleproduct.html?product_id=${prod.id}"
                               class="text-[#3E1C00] hover:text-[#C4703C] text-sm block transition-colors">
                               ${prod.name}
                            </a>
                        </li>
                    `).join('')}
                </ul>
            `;
        }

        return `
            <div>
                <h3 class="font-poppins font-bold text-[#3E1C00] text-sm uppercase mb-3 border-b border-[#E8D1BB] pb-2 tracking-wide">
                    ${sub.name}
                </h3>
                ${productsHtml}
            </div>
        `;
    },

    /**
     * Render Mobile Menu
     */
    renderMobileMenu(menuData) {
        const mobileContainer = document.getElementById('mobile-menu-items');
        if (!mobileContainer) return; // Silent fail if mobile container is structurally different or missing

        let html = `
            <a href="../Home/Home.html"
               class="text-white text-sm font-medium py-2 border-b-2 border-[#C4703C] inline-block w-fit">HOME</a>
        `;

        menuData.forEach(cat => {
            html += `
                <div>
                    <a href="../Shop/Shop.html?category=${cat.slug}"
                        class="text-white text-sm font-medium py-2 hover:text-[#C4703C] flex items-center justify-between group">
                        ${cat.name.toUpperCase()}
                    </a>
                </div>
            `;
        });

        html += `
            <a href="../About/About.html" class="text-white text-sm font-medium py-2 hover:text-[#C4703C]">ABOUT US</a>
            <a href="../Contact/Contact.html" class="text-white text-sm font-medium py-2 hover:text-[#C4703C]">CONTACT US</a>
        `;

        mobileContainer.innerHTML = html;
    },

    /**
     * Generate Skeleton HTML
     */
    getSkeletonHTML() {
        // A simple row of pulsing gray blocks to simulate menu items
        // You can adjust the number of items or specific styling as needed
        const skeletonItem = `
            <div class="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
        `;
        return `
            <div class="flex items-center gap-6 py-4">
                <div class="h-10 w-16 bg-gray-200 rounded animate-pulse"></div> <!-- Home -->
                ${skeletonItem.repeat(4)} <!-- Categories -->
                <div class="h-10 w-20 bg-gray-200 rounded animate-pulse"></div> <!-- About -->
                <div class="h-10 w-24 bg-gray-200 rounded animate-pulse"></div> <!-- Contact -->
            </div>
        `;
    }
};
