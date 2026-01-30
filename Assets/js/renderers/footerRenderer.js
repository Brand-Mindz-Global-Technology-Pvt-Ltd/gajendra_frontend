/**
 * Footer Renderer
 * Responsible for generating HTML string for the footer.
 * Shared across all pages.
 */

export const FooterRenderer = {
    render() {
        return `
        <!-- TOP DECORATIVE BORDER -->
        <div style="background-image: url('../Assets/images/footer-design.png'); background-repeat: repeat-x; background-size: auto 100%; height: 22px; width: 100%;" aria-label="Footer Top Design"></div>

        <!-- MAIN FOOTER CONTENT -->
        <div class="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-12">
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10">
                <!-- Menus -->
                <div>
                    <h3 class="text-[#3E1C00] font-semibold text-lg mb-4">Menus</h3>
                    <ul class="space-y-2 text-[#3E1C00]/90 text-sm">
                        <li><a href="../Home/Home.html" class="hover:text-[#B06D36] transition-colors">Home</a></li>
                        <li><a href="../About/About.html" class="hover:text-[#B06D36] transition-colors">About us</a></li>
                        <li><a href="../Shop/Shop.html" class="hover:text-[#B06D36] transition-colors">Shop</a></li>
                        <li><a href="../Contact/Contact.html" class="hover:text-[#B06D36] transition-colors">Contact us</a></li>
                    </ul>
                </div>
                <!-- Savouries -->
                <div>
                    <h3 class="text-[#3E1C00] font-semibold text-lg mb-4">Savouries</h3>
                    <ul class="space-y-2 text-[#3E1C00]/90 text-sm">
                        <li>Sev</li>
                        <li>Murugu</li>
                        <li>Mixture</li>
                        <li>Masala Kaju Mathri</li>
                        <li>Chips</li>
                    </ul>
                </div>
                <!-- Sweets -->
                <div>
                    <h3 class="text-[#3E1C00] font-semibold text-lg mb-4">Sweets</h3>
                    <ul class="space-y-2 text-[#3E1C00]/90 text-sm">
                        <li>Soan papdi</li>
                        <li>Laddu</li>
                        <li>Kaaju Sweets</li>
                        <li>Jilabi</li>
                        <li>Halwa</li>
                        <li>General Sweets</li>
                        <li>Bengali Sweets</li>
                        <li>Barfi</li>
                        <li>Badusha</li>
                    </ul>
                </div>
                <!-- My Account -->
                <div>
                    <h3 class="text-[#3E1C00] font-semibold text-lg mb-4">My Account</h3>
                    <ul class="space-y-2 text-[#3E1C00]/90 text-sm">
                        <li><a href="../components/wishlist.html" class="hover:text-[#B06D36] transition-colors">Wishlist</a></li>
                        <li><a href="../Auth/my-account.html" class="hover:text-[#B06D36] transition-colors">My Order</a></li>
                        <li><a href="../Auth/my-account.html" class="hover:text-[#B06D36] transition-colors">Profile</a></li>
                    </ul>
                </div>
                <!-- Contact Us -->
                <div>
                    <h3 class="text-[#3E1C00] font-semibold text-lg mb-4">Contact Us</h3>
                    <div class="flex items-start space-x-3 mb-3">
                        <span class="text-[#B06D36] text-lg">📍</span>
                        <p class="text-[#3E1C00]/90 text-sm">
                            11/200 xxx, yy, Thirunelveli,<br>Tamilnadu
                        </p>
                    </div>
                    <div class="flex items-center space-x-3 mb-4">
                        <span class="text-[#B06D36] text-lg">📞</span>
                        <p class="text-[#3E1C00]/90 text-sm">1234567890</p>
                    </div>
                    <!-- Social Icons -->
                    <div class="flex items-center space-x-4 text-[#3E1C00] text-xl">
                        <a href="#"><i class="fa-brands fa-instagram text-pink-600"></i></a>
                        <a href="#"><i class="fa-brands fa-facebook text-blue-700"></i></a>
                        <a href="#"><i class="fa-brands fa-youtube text-red-600"></i></a>
                    </div>
                </div>
            </div>
            <!-- LINE DIVIDER -->
            <div class="w-full h-px bg-[#9a7a5a]/40 mt-10"></div>
            <!-- COPYRIGHT -->
            <p class="text-center text-[#3E1C00]/80 text-sm mt-4">
                Copyright © 2025 Gajendra vilas. All rights reserved.
            </p>
        </div>
        `;
    }
};
