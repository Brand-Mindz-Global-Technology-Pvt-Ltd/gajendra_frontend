import CONFIG from '../../config.js';

const HomeProductRenderer = {

    render(products) {
        const containerId = 'home-product-scroll-container';
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`HomeProductRenderer: Container '${containerId}' not found.`);
            return;
        }

        if (products.length === 0) {
            container.innerHTML = '<p class="text-white text-center w-full">No products found.</p>';
            return;
        }

        // Duplication for scroll effect (optional, but good for UI)
        const productsToRender = [...products, ...products];

        container.innerHTML = productsToRender.map(product => this.createProductCard(product)).join('');
    },

    createProductCard(product) {
        // Handle images safely
        let images = product.images;
        if (typeof images === 'string') {
            try {
                images = JSON.parse(images);
            } catch (e) {
                images = images.split(',').map(img => img.trim());
            }
        }

        const imageBaseURL = CONFIG.UPLOADS_URL || "https://gajendhrademo.brandmindz.com/routes/uploads/products/";

        // Handle image logic
        let productImage = `https://placehold.co/150?text=${encodeURIComponent(product.name)}`;

        if (images && images.length > 0 && images[0] !== '__EMPTY__') {
            const firstImg = images[0];
            if (firstImg.startsWith('http')) {
                productImage = firstImg;
            } else {
                // Ensure proper slash concatenation
                productImage = imageBaseURL.endsWith('/')
                    ? imageBaseURL + firstImg
                    : imageBaseURL + '/' + firstImg;
            }
        }

        const price = parseFloat(product.price || 0).toFixed(2);

        return `
            <div class="flex items-center gap-6 shrink-0">
                <img src="${productImage}" alt="${product.name}"
                    class="w-20 h-20 md:w-24 md:h-24 object-cover rounded-md shadow-lg"
                    onerror="this.src='https://placehold.co/150?text=Product'">
                <div class="flex flex-col items-start gap-4">
                    <h3 class="font-poppins text-white text-xl md:text-2xl font-medium line-clamp-1 max-w-[200px]">
                        ${product.name}
                    </h3>
                     <!-- Optional: Price display could be added here if desired -->
                     <!-- <p class="text-white/80">Rs. ${price}</p> -->
                     
                    <button onclick="window.location.href='../Shop/Shop.html?search=${encodeURIComponent(product.name)}'"
                        class="relative font-poppins bg-gradient-to-br from-[#B06D36] via-[#C4703C] to-[#B06D36] hover:from-[#9a5e2e] hover:via-[#B06D36] hover:to-[#9a5e2e] text-white font-semibold text-sm md:text-base py-2.5 md:py-3 px-5 md:px-7 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 overflow-hidden group">
                        
                        <!-- Traditional Ornate Border -->
                        <div class="absolute inset-0 border-[2px] border-white/40 rounded-lg" style="border-style: double;"></div>
                        <div class="absolute inset-[3px] border border-white/25 rounded-lg"></div>

                        <!-- Traditional Corner Decorations -->
                        <div class="absolute top-0 left-0 w-4 h-4 md:w-5 md:h-5">
                            <div class="absolute top-0 left-0 w-full h-full border-t-2 border-l-2 border-white/50 rounded-tl-lg"></div>
                            <div class="absolute top-0.5 left-0.5 w-1.5 h-1.5 border border-white/40 rounded-full"></div>
                        </div>
                        <div class="absolute top-0 right-0 w-4 h-4 md:w-5 md:h-5">
                            <div class="absolute top-0 right-0 w-full h-full border-t-2 border-r-2 border-white/50 rounded-tr-lg"></div>
                            <div class="absolute top-0.5 right-0.5 w-1.5 h-1.5 border border-white/40 rounded-full"></div>
                        </div>
                        <div class="absolute bottom-0 left-0 w-4 h-4 md:w-5 md:h-5">
                            <div class="absolute bottom-0 left-0 w-full h-full border-b-2 border-l-2 border-white/50 rounded-bl-lg"></div>
                            <div class="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 border border-white/40 rounded-full"></div>
                        </div>
                        <div class="absolute bottom-0 right-0 w-4 h-4 md:w-5 md:h-5">
                            <div class="absolute bottom-0 right-0 w-full h-full border-b-2 border-r-2 border-white/50 rounded-br-lg"></div>
                            <div class="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border border-white/40 rounded-full"></div>
                        </div>

                        <!-- Traditional Pattern Lines -->
                        <div class="absolute top-1.5 left-1/2 -translate-x-1/2 w-2/3 h-[1.5px] bg-white/30"></div>
                        <div class="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-2/3 h-[1.5px] bg-white/30"></div>

                        <!-- Decorative Dots -->
                        <div class="absolute top-1/2 left-2 w-1 h-1 bg-white/40 rounded-full"></div>
                        <div class="absolute top-1/2 right-2 w-1 h-1 bg-white/40 rounded-full"></div>

                        <!-- Shine Effect -->
                        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                        <!-- Button Text -->
                        <span class="relative z-10 tracking-wide">Shop Now</span>
                    </button>
                </div>
            </div>
        `;
    }
};

export default HomeProductRenderer;
