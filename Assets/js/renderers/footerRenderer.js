/**
 * Footer Renderer
 * Responsible for generating HTML string for the footer.
 * Shared across all pages.
 */

export const FooterRenderer = {
    render() {
        return `
        <!-- TOP DECORATIVE BORDER -->
        <img src="https://placehold.co/1600x40" alt="Footer Top Design" class="w-full object-cover" />

        <!-- MAIN FOOTER CONTENT -->
        <div class="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-12">
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10">
                <!-- Menus -->
                <div>
                    <h3 class="text-[#3E1C00] font-semibold text-lg mb-4">Menus</h3>
                    <ul class="space-y-2 text-[#3E1C00]/90 text-sm">
                        <li><a href="../Home/Home.html" class="hover:text-[#B06D36] transition-colors">Home</a></li>
                        <li><a href="../About/About.html" class="hover:text-[#B06D36] transition-colors">About us</a></li>
                        <li><a href="../Blog/blog.html" class="hover:text-[#B06D36] transition-colors">Blog</a></li>
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
                    <h3 class="text-[#3E1C00] font-semibold text-lg mb-4">Policies</h3>
                    <ul class="space-y-2 text-[#3E1C00]/90 text-sm">
                        <li><a href="../PolicyPages/privacy.html" class="hover:text-[#B06D36] transition-colors">Privacy Policy</a></li>
                        <li><a href="../PolicyPages/Cookie.html" class="hover:text-[#B06D36] transition-colors">Cookie Policy</a></li>
                        <li><a href="../PolicyPages/Refund.html" class="hover:text-[#B06D36] transition-colors">Return Policy</a></li>
                    </ul>
                </div>
                <!-- Contact Us -->
                <div>
                    <h3 class="text-[#3E1C00] font-semibold text-lg mb-4">Contact Us</h3>
                    <div class="flex items-start space-x-3 mb-3">
                        <span class="text-[#B06D36] text-lg">📍</span>
                        <p class="text-[#3E1C00]/90 text-sm">
                            40P, Keela Kadai St, Sivagami Puram, Virudhunagar, Tamil Nadu 626001
                        </p>
                    </div>
                    <div class="flex items-center space-x-3 mb-4">
                        <span class="text-[#B06D36] text-lg">📞</span>
                        <p class="text-[#3E1C00]/90 text-sm">+91 9159025623</p>
                    </div>
                    <div class="flex items-center space-x-3 mb-4">
                        <span class="text-[#B06D36] text-lg">📧</span>
                        <p class="text-[#3E1C00]/90 text-sm">sales.gajendravilas@gmail.com</p>
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
