/**
 * SkeletonLoader - Utility for showing skeleton/loading states
 * Provides reusable skeleton components for lazy loading UI
 */

const SkeletonLoader = {
    /**
     * Shows skeleton for product detail page
     * Hides all static content and shows skeleton placeholders
     */
    showProductDetailSkeleton() {
        // Hide all sections that will be populated by API
        this.hideAllSections();

        // Main image skeleton - plain skeleton without product name
        const mainImg = document.getElementById("mainProductImage");
        if (mainImg) {
            mainImg.style.display = "block";
            mainImg.classList.add('animate-pulse', 'bg-gray-300');
            mainImg.style.minHeight = '500px';
            mainImg.src = '';
            mainImg.alt = '';
            mainImg.removeAttribute('onerror');
        }

        // Title skeleton
        const titleEl = document.getElementById("productTitle");
        if (titleEl) {
            titleEl.style.display = "block";
            titleEl.innerHTML = '<div class="h-8 bg-gray-300 rounded animate-pulse w-3/4"></div>';
        }

        // Description skeleton
        const descEl = document.getElementById("productDescription");
        if (descEl) {
            descEl.style.display = "block";
            descEl.innerHTML = `
                <div class="space-y-2">
                    <div class="h-4 bg-gray-300 rounded animate-pulse"></div>
                    <div class="h-4 bg-gray-300 rounded animate-pulse w-5/6"></div>
                    <div class="h-4 bg-gray-300 rounded animate-pulse w-4/6"></div>
                </div>
            `;
        }

        // Price skeleton
        const priceSection = document.getElementById("priceSection");
        if (priceSection) {
            priceSection.style.display = "flex";
            const priceEl = document.getElementById("productPrice");
            if (priceEl) {
                priceEl.innerHTML = '<div class="h-8 bg-gray-300 rounded animate-pulse w-32"></div>';
            }
        }

        // Thumbnails skeleton
        const thumbContainer = document.getElementById("thumbnailContainer");
        if (thumbContainer) {
            thumbContainer.style.display = "flex";
            thumbContainer.innerHTML = '';
            for (let i = 0; i < 5; i++) {
                thumbContainer.innerHTML += `
                    <div class="bg-gray-300 rounded-xl animate-pulse w-1/5 aspect-square"></div>
                `;
            }
        }

        // Variations skeleton
        const weightSection = document.getElementById("weightSection");
        if (weightSection) {
            weightSection.style.display = "block";
            const weightButtons = document.getElementById("weightButtons");
            if (weightButtons) {
                weightButtons.innerHTML = '<div class="h-10 bg-gray-300 rounded animate-pulse w-32 inline-block"></div>';
            }
        }

        // Taste grid skeleton (will be hidden if no data)
        const tasteGrid = document.getElementById("tasteGrid");
        if (tasteGrid) {
            tasteGrid.style.display = "grid";
            tasteGrid.innerHTML = '';
            for (let i = 0; i < 4; i++) {
                tasteGrid.innerHTML += `
                    <div class="flex items-start gap-4">
                        <div class="w-8 h-8 bg-gray-300 rounded animate-pulse"></div>
                        <div class="flex-1">
                            <div class="h-5 bg-gray-300 rounded animate-pulse w-24 mb-2"></div>
                            <div class="h-4 bg-gray-300 rounded animate-pulse w-32"></div>
                        </div>
                    </div>
                `;
            }
        }
    },

    /**
     * Hides all sections that will be populated by API
     */
    hideAllSections() {
        // Hide ratings
        const ratingsSection = document.getElementById("ratingsSection");
        if (ratingsSection) ratingsSection.style.display = "none";

        // Hide description
        const descEl = document.getElementById("productDescription");
        if (descEl) descEl.style.display = "none";

        // Hide price
        const priceSection = document.getElementById("priceSection");
        if (priceSection) priceSection.style.display = "none";

        // Hide weight section
        const weightSection = document.getElementById("weightSection");
        if (weightSection) weightSection.style.display = "none";

        // Hide thumbnails
        const thumbContainer = document.getElementById("thumbnailContainer");
        if (thumbContainer) thumbContainer.style.display = "none";

        // Hide taste grid
        const tasteGrid = document.getElementById("tasteGrid");
        if (tasteGrid) tasteGrid.style.display = "none";

        // Hide product description section
        const productDescSection = document.getElementById("productDescriptionSection");
        if (productDescSection) productDescSection.style.display = "none";
    },

    /**
     * Hides skeleton and shows actual content
     */
    hideProductDetailSkeleton() {
        // Remove skeleton from main image
        const mainImg = document.getElementById("mainProductImage");
        if (mainImg) {
            mainImg.classList.remove('animate-pulse', 'bg-gray-300');
            mainImg.style.minHeight = '';
        }

        // Other elements will be replaced by actual content
    },

    /**
     * Shows skeleton for product cards (recommended products)
     */
    showProductCardSkeleton(container, count = 4) {
        if (!container) return;

        container.innerHTML = '';
        for (let i = 0; i < count; i++) {
            container.innerHTML += `
                <div class="bg-white rounded-xl overflow-hidden">
                    <div class="relative bg-[#F4F4F4] h-64 flex items-center justify-center">
                        <div class="w-full h-full bg-gray-300 animate-pulse"></div>
                    </div>
                    <div class="p-4 space-y-3">
                        <div class="h-5 bg-gray-300 rounded animate-pulse w-3/4"></div>
                        <div class="h-4 bg-gray-300 rounded animate-pulse w-1/2"></div>
                        <div class="h-4 bg-gray-300 rounded animate-pulse w-1/3"></div>
                        <div class="flex gap-2">
                            <div class="h-9 bg-gray-300 rounded animate-pulse flex-1"></div>
                            <div class="h-9 bg-gray-300 rounded animate-pulse flex-1"></div>
                        </div>
                    </div>
                </div>
            `;
        }
    },

    /**
     * Shows skeleton for reviews section
     */
    showReviewsSkeleton() {
        const reviewsSection = document.querySelector('section:has(.border.border-\\[\\#D4B896\\])');
        if (reviewsSection) {
            const reviewContainer = reviewsSection.querySelector('.border.border-\\[\\#D4B896\\]');
            if (reviewContainer) {
                reviewContainer.innerHTML = `
                    <div class="space-y-6">
                        <div class="h-6 bg-gray-300 rounded animate-pulse w-48"></div>
                        <div class="space-y-4">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 bg-gray-300 rounded-full animate-pulse"></div>
                                <div class="flex-1 space-y-2">
                                    <div class="h-4 bg-gray-300 rounded animate-pulse w-24"></div>
                                    <div class="h-3 bg-gray-300 rounded animate-pulse w-32"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
    }
};

export default SkeletonLoader;

