import ShopService from '../services/shop/shopService.js';

/**
 * Footer Renderer
 * Responsible for generating HTML string for the footer.
 * Shared across all pages.
 */

export const FooterRenderer = {
    async render() {
        let categories = [];
        try {
            const response = await ShopService.getCategories();
            if (response.success && response.categories) {
                categories = response.categories;
            } else if (Array.isArray(response)) {
                categories = response;
            }
        } catch (error) {
            console.error("Failed to fetch categories for footer:", error);
        }

        return FooterRenderer.generateHTML(categories);
    },

    /**
     * MAIN FOOTER GENERATOR
     * Optimized for Mobile (1 col), Tablet (2-3 cols), and Desktop (5 cols)
     */
    generateHTML(categories) {
        return `
        <!-- TOP DECORATIVE BORDER -->
        <div style="background-image: url('../Assets/images/footer-design.png'); background-repeat: repeat-x; background-size: auto 100%; height: 22px; width: 100%;" aria-label="Footer Top Design"></div>

        <div class="bg-white">
            <div class="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-8 md:pt-12">
                <!-- MAIN GRID: 4 COLUMNS (ABOUT, MENUS, CATEGORIES, CONTACT) -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10">
                    
                    <!-- ABOUT (Spans 2) -->
                    <div class="lg:col-span-2">
                        ${this.getColumnAbout()}
                    </div>

                    <!-- MENUS (Spans 2) -->
                    <div class="lg:col-span-1">
                        ${this.getColumnMenus()}
                    </div>

                    <!-- CATEGORIES (Spans 2) -->
                    <div class="lg:col-span-1">
                        ${this.getColumnCategories(categories)}
                    </div>

                    <!-- CONTACT (Spans 2) -->
                    <div class="lg:col-span-2">
                        ${this.getColumnContact()}
                    </div>

                </div>
                
                <!-- BOTTOM DIVIDER -->
                <div class="w-full h-px bg-[#9a7a5a]/20 mt-12 mb-6"></div>
                
                <!-- BOTTOM ROW: COPYRIGHT & POLICIES -->
                <div class="flex flex-col md:flex-row justify-between items-center gap-6">
                    <!-- LEFT: COPYRIGHT -->
                    <p class="text-[#3E1C00]/80 text-sm order-2 md:order-1 text-center md:text-left">
                        Copyright © 2025 Gajendra vilas. All rights reserved.
                    </p>
                    
                    <!-- RIGHT: HORIZONTAL POLICIES -->
                    <ul class="flex flex-wrap justify-center md:justify-end gap-6 text-[#3E1C00]/90 text-sm order-1 md:order-2">
                        <li><a href="../PolicyPages/Privacy.html" class="hover:text-[#B06D36] transition-colors">Privacy Policy</a></li>
                        <li><a href="../PolicyPages/Cookie.html" class="hover:text-[#B06D36] transition-colors">Cookie Policy</a></li>
                        <li><a href="../PolicyPages/Refund.html" class="hover:text-[#B06D36] transition-colors">Return Policy</a></li>
                    </ul>
                </div>
            </div>
        </div>
        `;
    },

    /**
     * COLUMN 1: About & Identity
     */
    getColumnAbout() {
        return `
        <div class="flex flex-col space-y-4">
            <a href="../Home/Home.html" class="inline-block">
                <img src="../Assets/Home/Logo-Gajendhra.png" alt="Gajendra Vilas Logo" class="h-20 w-20 object-contain rounded-full border-2 border-[#5D3420]/10" />
            </a>
            <p class="text-[#3E1C00]/80 text-sm leading-relaxed max-w-xs">
                Pure heritage, authentic flavors. Since 1978, Gajendra Vilas has been bringing the joy of traditional sweets and savouries to every celebration.
            </p>
        </div>
        `;
    },

    /**
     * COLUMN 2: Navigation Links
     */
    getColumnMenus() {
        return `
        <div>
            <h3 class="text-[#3E1C00] font-semibold text-lg mb-4 text-nowrap">Menus</h3>
            <ul class="space-y-2 text-[#3E1C00]/90 text-sm">
                <li><a href="../Home/Home.html" class="hover:text-[#B06D36] transition-colors">Home</a></li>
                <li><a href="../About/About.html" class="hover:text-[#B06D36] transition-colors">About us</a></li>
                <li><a href="../Blog/blog.html" class="hover:text-[#B06D36] transition-colors">Blog</a></li>
                <li><a href="../Shop/Shop.html" class="hover:text-[#B06D36] transition-colors">Shop</a></li>
                <li><a href="../Contact/Contact.html" class="hover:text-[#B06D36] transition-colors">Contact us</a></li>
            </ul>
        </div>
        `;
    },

    /**
     * COLUMN 3: Dynamic Product Categories
     */
    getColumnCategories(categories) {
        const categoryLinks = categories.length > 0
            ? categories.map(cat => `
                <li><a href="../Shop/Shop.html?category_id=${cat.id}" class="hover:text-[#B06D36] transition-colors">${cat.name}</a></li>
            `).join('')
            : `<li class="text-[#3E1C00]/60 italic">Loading categories...</li>`;

        return `
        <div>
            <h3 class="text-[#3E1C00] font-semibold text-lg mb-4 text-nowrap">Categories</h3>
            <ul class="space-y-2 text-[#3E1C00]/90 text-sm lowercase capitalize">
                ${categoryLinks}
            </ul>
        </div>
        `;
    },

    /**
     * COLUMN 4: Contact Information & Social
     */
    getColumnContact() {
        return `
        <div class="lg:space-x-10">
            <h3 class="text-[#3E1C00] font-semibold text-lg mb-4 text-nowrap lg:pl-10">Contact Us</h3>
            <div class="flex items-start space-x-3 mb-3">
                <span class="text-[#B06D36] text-lg">📍</span>
                <p class="text-[#3E1C00]/90 text-sm max-w-[340px]">
                    40P, Keela Kadai St, Sivagami Puram, Virudhunagar, Tamil Nadu 626001
                </p>
            </div>
            <div class="flex items-center space-x-3 mb-3">
                <span class="text-[#B06D36] text-lg">📞</span>
                <p class="text-[#3E1C00]/90 text-sm">+91 9159025623</p>
            </div>
            <div class="flex items-center space-x-3 mb-4">
                <span class="text-[#B06D36] text-lg">📧</span>
                <p class="text-[#3E1C00]/90 text-sm lowercase">sales.gajendravilas@gmail.com</p>
            </div>
            <!-- Social Icons -->
            <div class="flex items-center space-x-4 text-[#3E1C00] text-xl">
                <a href="#" class="hover:opacity-80 transition-opacity"><i class="fa-brands fa-instagram text-pink-600"></i></a>
                <a href="#" class="hover:opacity-80 transition-opacity"><i class="fa-brands fa-facebook text-blue-700"></i></a>
                <a href="#" class="hover:opacity-80 transition-opacity"><i class="fa-brands fa-youtube text-red-600"></i></a>
            </div>
        </div>
        `;
    },
};
