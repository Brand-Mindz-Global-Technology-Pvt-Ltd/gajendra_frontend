import { MenuRenderer } from '../renderers/menuRenderer.js';
import { HeaderRenderer } from '../renderers/headerRenderer.js';
import { FooterRenderer } from '../renderers/footerRenderer.js';
import AuthService from '../services/authService.js';
import { Toast } from '../utils/toast.js';
import cartStateManager from './cartStateManager.js';
import wishlistStateManager from './wishlistStateManager.js';
import headerBadgeManager from './headerBadgeManager.js';

/**
 * Global Header Initializer
 * Unifies menu rendering and auth logic across all pages.
 */
export const HeaderInitializer = {
    async init() {
        // 1. Setup Global UI Handlers immediately (Toggles, Click Outside)
        this.setupGlobalHandlers();

        // 2. Initialize Footer (Static content)
        try {
            await this.initFooter();
        } catch (error) {
            console.error("Footer initialization failed:", error);
        }

        // 3. Define Logout Globally
        window.logout = async function () {
            try {
                await AuthService.logout();
                Toast.success("Logged out successfully");
                setTimeout(() => window.location.reload(), 1000);
            } catch (error) {
                console.error("Logout failed", error);
                localStorage.removeItem("authToken");
                window.location.reload();
            }
        };

        // 3. Render Menu (Desktop & Mobile)
        try {
            await MenuRenderer.render('main-nav');
        } catch (error) {
            console.error("Menu rendering failed:", error);
        }

        // 4. Check Auth & Render Profile Dropdown
        await this.initProfile();

        // 5. Initialize Badges (Syncs with backend state)
        try {
            await cartStateManager.init();
            await wishlistStateManager.init();
            await headerBadgeManager.init();
        } catch (error) {
            console.error("Badge initialization failed:", error);
        }
    },

    async initProfile() {
        const token = localStorage.getItem("authToken");
        const userDropdown = document.getElementById("user-dropdown");

        if (token) {
            try {
                const response = await AuthService.getUserProfile();
                if ((response.success || response.status === 'success') && userDropdown) {
                    const user = response.data;
                    userDropdown.innerHTML = HeaderRenderer.renderUserDropdown(user);
                } else if (response.status === 'unauthorized' || response.message?.includes('expired')) {
                    localStorage.removeItem("authToken");
                }
            } catch (error) {
                console.error("Profile check failed", error);
            }
        }
    },

    setupGlobalHandlers() {
        console.log("HeaderInitializer: Setting up global handlers...");

        // Toggle User Menu Dropdown
        window.toggleUserMenu = function (e) {
            if (e) e.stopPropagation();
            const dropdown = document.getElementById("user-dropdown");
            console.log("HeaderInitializer: Toggling user menu...", dropdown);
            if (dropdown) {
                dropdown.classList.toggle("hidden");
            }
        };

        // Toggle Mobile Menu
        window.toggleMobileMenu = function (e) {
            if (e) e.stopPropagation();
            const menu = document.getElementById('mobile-menu');
            console.log("HeaderInitializer: Toggling mobile menu...", menu);
            if (menu) {
                menu.classList.toggle('hidden');
            }
        };

        // Click Outside to close dropdowns
        document.addEventListener('click', (e) => {
            // Close User Dropdown
            const userDropdown = document.getElementById("user-dropdown");
            const userBtn = document.getElementById("user-menu-btn");
            if (userDropdown && !userDropdown.contains(e.target) && userBtn && !userBtn.contains(e.target)) {
                userDropdown.classList.add("hidden");
            }

            // Close Mobile Menu if clicking outside header
            const mobileMenu = document.getElementById('mobile-menu');
            const mobileBtn = document.getElementById('mobile-menu-btn');
            const header = document.querySelector('header');
            if (mobileMenu && !header.contains(e.target) && !mobileMenu.classList.contains('hidden')) {
                // mobileMenu.classList.add('hidden'); // Optional: usually mobile menus occupy full width or have specific overlay
            }
        });
    },

    async initFooter() {
        const footer = document.querySelector('footer');
        if (footer) {
            try {
                footer.innerHTML = await FooterRenderer.render();
            } catch (error) {
                console.error("HeaderInitializer: Footer render error:", error);
            }
        }
    }
};
