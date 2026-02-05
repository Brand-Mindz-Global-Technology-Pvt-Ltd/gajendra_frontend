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

            // Helper to check if a link is active
            const currentPath = window.location.pathname.toLowerCase();
            const params = new URLSearchParams(window.location.search);

            const isActive = (path, categoryId = null) => {
                if (categoryId) {
                    return params.get('category_id') === String(categoryId);
                }

                const normalizedPath = path.replace(/^\.\.\//, '').toLowerCase();

                // If checking for a shop page but no category is active
                if (normalizedPath.includes('shop/shop.html') && !params.get('category_id')) {
                    return currentPath.includes('shop/shop.html') || currentPath.includes('shop/singleproduct.html');
                }

                return currentPath.includes(normalizedPath);
            };

            // Helper to generate the link HTML with stable alignment
            const createLinkHTML = (href, label, path, categoryId = null, extraClasses = '') => {
                const active = isActive(path, categoryId);
                const activeBar = active ? '<span class="absolute bottom-3 left-2 right-2 h-0.5 bg-white"></span>' : '';
                return `
                    <a href="${href}"
                        class="text-white text-sm lg:text-[15px] font-medium tracking-wider transition-all py-4 px-4 relative group ${extraClasses} ${active ? '' : 'hover:opacity-80'}">
                        ${label}
                        ${activeBar}
                    </a>
                `;
            };

            // Generate HOME link
            let html = createLinkHTML('../Home/Home.html', 'HOME', 'Home/Home.html');

            // Generate dynamic category menus
            data.menu.forEach(category => {
                html += this.createCategoryItem(category, createLinkHTML);
            });

            // Add static "ABOUT US" and "CONTACT US"
            html += createLinkHTML('../About/About.html', 'ABOUT US', 'About/About.html');
            html += createLinkHTML('../Contact/Contact.html', 'CONTACT US', 'Contact/Contact.html');

            container.innerHTML = html;

            // Also render Mobile Menu if it exists
            this.renderMobileMenu(data.menu, isActive);

        } catch (error) {
            console.error('Error rendering menu:', error);
        }
    },

    /**
     * Create HTML for a single category item (with mega menu)
     */
    createCategoryItem(category, createLinkHTML) {
        // If no subcategories, just a simple link
        if (!category.subcategories || category.subcategories.length === 0) {
            return createLinkHTML(`../Shop/Shop.html?category_id=${category.id}`, category.name.toUpperCase(), `Shop/Shop.html`, category.id);
        }

        // Mega Menu Structure
        const labelWithIcon = `
            ${category.name.toUpperCase()}
            <svg xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 9l-7 7-7-7" />
            </svg>
        `;

        const activeItem = createLinkHTML(`../Shop/Shop.html?category_id=${category.id}`, labelWithIcon, `Shop/Shop.html`, category.id, 'flex items-center gap-1 cursor-pointer');

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

        return `
            <div class="relative group">
                ${activeItem}
                <!-- Mega Menu -->
                <div class="absolute top-full left-1/2 -translate-x-1/2 ${widthClass} bg-white rounded-lg shadow-xl p-6 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 ease-out z-50 mt-0 border-t-4 border-[#C4703C]">
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
    renderMobileMenu(menuData, isActive) {
        const mobileContainer = document.getElementById('mobile-menu-items');
        if (!mobileContainer) return;

        const activeHome = isActive('Home/Home.html');
        const activeAbout = isActive('About/About.html');
        const activeContact = isActive('Contact/Contact.html');

        let html = `
            <a href="../Home/Home.html"
               class="text-white text-sm font-medium py-2 ${activeHome ? 'border-b-2 border-[#C4703C]' : ''} inline-block w-fit">HOME</a>
        `;

        menuData.forEach(cat => {
            const hasSubs = cat.subcategories && cat.subcategories.length > 0;
            const active = isActive('Shop/Shop.html', cat.id);

            if (hasSubs) {
                html += `
                    <div class="flex flex-col">
                        <button onclick="
                            const content = this.nextElementSibling;
                            const isHidden = content.classList.contains('max-h-0');
                            if (isHidden) {
                                content.classList.remove('max-h-0', 'opacity-0', 'pointer-events-none');
                                content.classList.add('max-h-[800px]', 'opacity-100');
                                this.querySelector('svg').classList.add('rotate-180');
                            } else {
                                content.classList.add('max-h-0', 'opacity-0', 'pointer-events-none');
                                content.classList.remove('max-h-[800px]', 'opacity-100');
                                this.querySelector('svg').classList.remove('rotate-180');
                            }
                        "
                            class="text-white text-sm font-medium py-2 flex items-center justify-between group ${active ? 'text-[#C4703C] font-bold' : ''}">
                            ${cat.name.toUpperCase()}
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div class="max-h-0 opacity-0 pointer-events-none overflow-hidden transition-all duration-500 ease-in-out flex flex-col pl-4 gap-2 border-l border-white/10 mt-1 mb-2">
                             <a href="../Shop/Shop.html?category_id=${cat.id}" class="text-white/80 text-xs py-1 hover:text-white">View All ${cat.name}</a>
                            ${cat.subcategories.map(sub => `
                                <div class="flex flex-col gap-1">
                                    <span class="text-[#C4703C] text-[10px] font-bold uppercase tracking-wider mt-2">${sub.name}</span>
                                    ${(sub.products || []).slice(0, 5).map(prod => `
                                        <a href="../Shop/Singleproduct.html?product_id=${prod.id}" class="text-white/70 text-xs py-1 hover:text-white truncate">
                                            ${prod.name}
                                        </a>
                                    `).join('')}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <a href="../Shop/Shop.html?category_id=${cat.id}"
                        class="text-white text-sm font-medium py-2 ${active ? 'text-[#C4703C] font-bold' : 'hover:text-[#C4703C]'} block">
                        ${cat.name.toUpperCase()}
                    </a>
                `;
            }
        });

        html += `
            <a href="../About/About.html" class="text-white text-sm font-medium py-2 ${activeAbout ? 'border-b-2 border-[#C4703C]' : ''} inline-block w-fit">ABOUT US</a>
            <a href="../Contact/Contact.html" class="text-white text-sm font-medium py-2 ${activeContact ? 'border-b-2 border-[#C4703C]' : ''} inline-block w-fit">CONTACT US</a>
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
