import CONFIG from '../../config.js';
import SkeletonLoader from '../../utils/skeletonLoader.js';

const BestSellerRenderer = {
    render(products) {
        const track = document.getElementById('bestseller-track');
        if (!track) return;

        if (products.length === 0) {
            track.innerHTML = '<p class="text-white text-center w-full py-10 font-poppins">No best selling products at the moment.</p>';
            return;
        }

        const imageBaseURL = CONFIG.UPLOADS_URL || "https://gajendhrademo.brandmindz.com/routes/uploads/products/";

        track.innerHTML = products.map(p => {
            // Handle images
            let imageUrl = 'https://placehold.co/400x300?text=' + encodeURIComponent(p.name);
            if (p.images && p.images.length > 0) {
                const firstImg = p.images[0];
                if (firstImg.startsWith('http')) {
                    imageUrl = firstImg;
                } else {
                    imageUrl = imageBaseURL.endsWith('/') ? imageBaseURL + firstImg : imageBaseURL + '/' + firstImg;
                }
            }

            // Handle price
            let displayPrice = parseFloat(p.price || 0).toFixed(2);
            if (p.variations && p.variations.length > 0) {
                const sortedVars = [...p.variations].sort((a, b) => parseFloat(a.amount || a.price || 0) - parseFloat(b.amount || b.price || 0));
                displayPrice = parseFloat(sortedVars[0].amount || sortedVars[0].price || 0).toFixed(2);
            }

            return `
                <div class="w-full sm:w-1/2 lg:w-1/3 flex-shrink-0 px-3 h-full">
                    <div class="bg-transparent rounded-lg overflow-hidden h-full flex flex-col relative group">
                        
                        <!-- Best Seller Triangle Tag (Top Left) -->
                        <div class="absolute top-0 left-0 w-28 h-28 z-10 pointer-events-none" 
                             style="background: linear-gradient(135deg, #ffffff -20%, #DB7921 -10%, #754112 70%); clip-path: polygon(0 0, 100% 0, 0 100%);">
                            <!-- Star Image -->
                            <img src="../Assets/images/star.png" class="absolute top-2.5 left-3.5 w-6 h-6 object-contain filter brightness-0 invert" alt="star">
                            <!-- Diagonal Text -->
                            <div class="absolute w-[120px] text-center top-[30px] left-[-18px] transform -rotate-45">
                                <span class="text-white font-poppins text-[15px] font-medium tracking-tight">Best Seller</span>
                            </div>
                        </div>

                        <!-- Image -->
                        <div class="relative h-64 overflow-hidden rounded-lg shadow-xl" onclick="window.location.href='/Shop/Singleproduct.html?product_id=${p.id}'" style="cursor: pointer;">
                            <img src="${imageUrl}" alt="${p.name}"
                                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                onerror="this.src='https://placehold.co/400x300?text=Product'">
                        </div>

                        <!-- Content -->
                        <div class="pt-5 flex-grow flex flex-col">
                            <div class="mb-4">
                                <h3 class="font-poppins font-semibold text-2xl text-white mb-1 truncate">${p.name}</h3>
                                <div class="flex text-[#F59E0B] text-base mb-2">
                                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                                </div>
                                <p class="font-poppins text-white font-medium text-xl">Rs : ${displayPrice}</p>
                            </div>
                            
                            <button onclick="window.location.href='/Shop/Singleproduct.html?product_id=${p.id}'"
                                class="w-full bg-[#B96A29] hover:bg-[#a05a22] text-white font-poppins font-medium py-2 transition-colors uppercase text-lg tracking-wider shadow-lg mt-auto">
                                BUY NOW
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Re-initialize carousel variables if they exist in global scope
        if (typeof window.initializeBestSellerCarousel === 'function') {
            window.initializeBestSellerCarousel();
        }
    },

    showLoading() {
        const track = document.getElementById('bestseller-track');
        if (!track) return;

        track.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            track.innerHTML += `
                <div class="w-full sm:w-1/2 lg:w-1/3 flex-shrink-0 px-3 h-full">
                    <div class="bg-white/5 rounded-lg overflow-hidden h-full flex flex-col p-4 space-y-4 animate-pulse">
                        <div class="relative h-56 bg-white/10 rounded-lg shadow-xl w-full"></div>
                        <div class="pt-5 space-y-3">
                            <div class="h-8 bg-white/20 rounded w-3/4"></div>
                            <div class="h-4 bg-white/10 rounded w-1/4"></div>
                            <div class="h-6 bg-white/20 rounded w-1/2"></div>
                            <div class="h-12 bg-white/20 rounded w-full mt-4"></div>
                        </div>
                    </div>
                </div>
            `;
        }
    }
};

export default BestSellerRenderer;
