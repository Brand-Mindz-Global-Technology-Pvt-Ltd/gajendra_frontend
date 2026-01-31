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

        // Looping logic to ensure the scrolling track is always filled
        // We repeat the products until we have enough for a seamless loop
        let productsToRender = [...products];
        while (productsToRender.length < 15) {
            productsToRender = [...productsToRender, ...products];
        }

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
                     
                    <button onclick="window.location.href='/Shop/Singleproduct.html?product_id=${product.id}'"
                        class="relative font-poppins bg-gradient-to-br rounded-[10px] from-[#B06D36] via-[#C4703C] to-[#B06D36] hover:from-[#9a5e2e] hover:via-[#B06D36] hover:to-[#9a5e2e] text-white font-semibold text-sm md:text-base py-2.5 md:py-3 px-5 md:px-7 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 overflow-hidden group">

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
