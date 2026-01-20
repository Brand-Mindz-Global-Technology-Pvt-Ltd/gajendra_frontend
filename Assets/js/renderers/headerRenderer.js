/**
 * Header Renderer
 * Responsible for generating HTML strings for header/navbar components.
 * Shared across all pages.
 */

export const HeaderRenderer = {
    /**
     * Renders User Header Dropdown
     * @param {Object} user - User object containing name, email, etc.
     * @returns {string} HTML string for the dropdown menu
     */
    renderUserDropdown(user) {
        return `
            <div class="px-4 py-2 border-b border-gray-100">
                <p class="text-xs text-gray-500">Signed in as</p>
                <p class="text-sm font-semibold text-brown truncate">${user.name || user.email}</p>
            </div>
            <a href="./my-account.html" class="block px-4 py-2 text-sm text-[#3E1C00] hover:bg-[#FDF5ED] transition-colors">My Account</a>
            <button onclick="logout()" class="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">Logout</button>
        `;
    }
};
