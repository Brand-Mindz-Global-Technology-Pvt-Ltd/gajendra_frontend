import CONFIG from "../../config.js";
import { getProductImageUrl } from "../../utils/imageUtils.js";
import { calculateProductPrice } from "../../utils/priceUtils.js";

const ProductDetailRenderer = {
    /**
     * Renders the main product details
     * Only shows sections if data exists
     */
    renderProductDetails(product) {
        // Update page title
        const pageTitle = document.getElementById("pageTitle");
        if (pageTitle && product.name) {
            pageTitle.innerText = `${product.name} - Gajendhra Vilas`;
        }

        // Title - always show (required field)
        const titleEl = document.getElementById("productTitle");
        if (titleEl) {
            titleEl.innerText = product.name || "Product";
            titleEl.style.display = product.name ? "block" : "none";
        }

        // Description - only show if exists
        const descEl = document.getElementById("productDescription");
        if (descEl) {
            const description = product.description || product.product_description || "";
            if (description && description.trim()) {
                descEl.innerText = description;
                descEl.style.display = "block";
            } else {
                descEl.style.display = "none";
            }
        }

        // Price - only show if exists
        this.renderPrice(product);

        // Ratings - only show if exists
        this.renderRatings(product);

        // Product Description Section - only show if exists
        this.renderProductDescriptionSection(product);
    },

    /**
     * Renders product price (handles variations)
     * Only shows if price exists and is greater than 0
     */
    renderPrice(product) {
        const priceSection = document.getElementById("priceSection");
        const priceEl = document.getElementById("productPrice");
        const strikePriceEl = document.getElementById("strikePrice");

        if (!priceSection || !priceEl) return;

        let displayPrice = 0;
        let strikePrice = null;
        let variations = product.variations || [];

        if (typeof variations === 'string') {
            try { variations = JSON.parse(variations); } catch (e) { variations = []; }
        }

        if (variations && variations.length > 0) {
            // Sort by price ascending
            const normalizedVariations = variations.map(v => ({
                price: parseFloat(v.price || v.amount || 0),
                strikePrice: parseFloat(v.strike_amount || v.strike_price || 0),
                label: v.quantity || v.label || ""
            }));
            normalizedVariations.sort((a, b) => a.price - b.price);
            displayPrice = normalizedVariations[0].price;
            strikePrice = normalizedVariations[0].strikePrice > 0 ? normalizedVariations[0].strikePrice : null;
        } else {
            displayPrice = parseFloat(product.price || product.amount || 0);
            strikePrice = parseFloat(product.strike_price || product.strike_amount || 0) > 0
                ? parseFloat(product.strike_price || product.strike_amount || 0)
                : null;
        }

        // Only show price section if price exists and is greater than 0
        if (displayPrice > 0) {
            priceSection.style.display = "flex";
            priceEl.innerText = `Rs : ${displayPrice.toFixed(2)}`;

            if (strikePrice && strikePrice > 0 && strikePriceEl) {
                strikePriceEl.innerText = `Rs : ${strikePrice.toFixed(2)}`;
                strikePriceEl.style.display = "block";
            } else if (strikePriceEl) {
                strikePriceEl.style.display = "none";
            }
        } else {
            priceSection.style.display = "none";
        }
    },

    /**
     * Renders ratings section (only if ratings exist)
     */
    renderRatings(product) {
        const ratingsSection = document.getElementById("ratingsSection");
        const ratingsStars = document.getElementById("ratingsStars");
        const ratingsText = document.getElementById("ratingsText");

        if (!ratingsSection) return;

        const rating = parseFloat(product.rating || product.average_rating || 0);
        const reviewCount = parseInt(product.review_count || product.reviews_count || 0);

        if (rating > 0 || reviewCount > 0) {
            ratingsSection.style.display = "flex";

            if (ratingsStars) {
                const fullStars = Math.floor(rating);
                const hasHalfStar = rating % 1 >= 0.5;
                ratingsStars.innerHTML = "";

                for (let i = 0; i < 5; i++) {
                    if (i < fullStars) {
                        ratingsStars.innerHTML += '<i class="fas fa-star"></i>';
                    } else if (i === fullStars && hasHalfStar) {
                        ratingsStars.innerHTML += '<i class="fas fa-star-half-stroke"></i>';
                    } else {
                        ratingsStars.innerHTML += '<i class="far fa-star"></i>';
                    }
                }
            }

            if (ratingsText) {
                ratingsText.innerText = reviewCount > 0
                    ? `Reviews : ${reviewCount} review${reviewCount !== 1 ? 's' : ''}`
                    : `Rating : ${rating.toFixed(1)}`;
            }
        } else {
            ratingsSection.style.display = "none";
        }
    },

    /**
     * Renders product description section (only if description exists)
     * Formats product_description, benefits, and how_to_use with keypoints
     */
    renderProductDescriptionSection(product) {
        const section = document.getElementById("productDescriptionSection");
        const content = document.getElementById("productDescriptionContent");

        if (!section || !content) return;

        const productDescription = product.product_description || "";
        const benefits = product.benefits || "";
        const howToUse = product.how_to_use || "";

        if (productDescription || benefits || howToUse) {
            section.style.display = "block";
            content.innerHTML = "";

            // Combine all content and display as single list without headings
            const allContent = [];

            if (productDescription && productDescription.trim()) {
                const points = this.extractKeypoints(productDescription);
                allContent.push(...points);
            }

            if (benefits && benefits.trim()) {
                const points = this.extractKeypoints(benefits);
                allContent.push(...points);
            }

            if (howToUse && howToUse.trim()) {
                const points = this.extractKeypoints(howToUse);
                allContent.push(...points);
            }

            if (allContent.length > 0) {
                content.innerHTML = `
                    <ul class="list-disc pl-5 md:pl-10 space-y-3 text-[#3E1C00] text-sm md:text-base leading-relaxed max-w-5xl mx-auto">
                        ${allContent.map(point => `<li>${point}</li>`).join('')}
                    </ul>
                `;
            } else {
                section.style.display = "none";
            }
        } else {
            section.style.display = "none";
        }
    },

    /**
     * Extracts keypoints from text as array
     * Handles line breaks, commas, and existing bullet points
     * @returns {Array<String>} Array of keypoint strings
     */
    extractKeypoints(text) {
        if (!text || !text.trim()) return [];

        // Escape HTML to prevent XSS
        const escapeHtml = (str) => {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        };

        const originalText = text.trim();

        // Check if text already contains line breaks or bullet indicators
        if (originalText.includes('\n') || originalText.includes('•') || originalText.includes('-') || originalText.includes('*')) {
            // Split by newlines, bullets, dashes, or asterisks
            let points = originalText
                .split(/\n+|•+|\*+|-\s*/)
                .map(point => point.trim())
                .filter(point => point.length > 0)
                .map(point => escapeHtml(point));

            if (points.length > 1) {
                return points;
            }
        }

        // Check if text contains commas (might be comma-separated list)
        if (originalText.includes(',') && originalText.split(',').length > 2) {
            const points = originalText
                .split(',')
                .map(point => point.trim())
                .filter(point => point.length > 0)
                .map(point => escapeHtml(point));

            if (points.length > 1) {
                return points;
            }
        }

        // Single item - return as array with one element
        return [escapeHtml(originalText)];
    },

    /**
     * Renders main product image
     * Only shows if image exists
     */
    renderMainImage(product) {
        const mainImg = document.getElementById("mainProductImage");
        if (!mainImg) return;

        // Use thumbnail first, then images array
        let imageUrl = product.thumbnail || null;

        if (!imageUrl) {
            // Process images array
            let images = product.images || product.images_full || [];
            if (typeof images === 'string') {
                try { images = JSON.parse(images); } catch (e) {
                    images = images.split(',').map(img => img.trim());
                }
            }
            if (!Array.isArray(images) && images) {
                images = [images];
            }

            // Filter out __EMPTY__ images
            if (Array.isArray(images) && images.length > 0) {
                const validImages = images.filter(img => {
                    if (!img) return false;
                    const imgStr = String(img);
                    return imgStr !== '__EMPTY__' && !imgStr.endsWith('/__EMPTY__') && imgStr !== 'null' && imgStr !== 'undefined';
                });
                imageUrl = validImages.length > 0 ? validImages[0] : null;
            }
        }

        // Only show image if it exists
        if (imageUrl) {
            // Normalize URL (fix domain mismatch)
            if (imageUrl.includes('gajendhrademo.brandmindz.com')) {
                imageUrl = imageUrl.replace('gajendhrademo.brandmindz.com', 'gajendhrademo.brandmindz.com');
            }

            const finalUrl = imageUrl.startsWith('http')
                ? imageUrl
                : CONFIG.UPLOADS_URL + '/' + imageUrl;

            mainImg.src = finalUrl;
            mainImg.style.display = "block";
        } else {
            mainImg.style.display = "none";
        }
    },

    /**
     * Renders thumbnail gallery
     * Only shows if images exist
     */
    renderThumbnails(product) {
        const thumbContainer = document.getElementById("thumbnailContainer");
        if (!thumbContainer) return;

        thumbContainer.innerHTML = "";

        // Process images
        let images = product.images || product.images_full || [];
        if (typeof images === 'string') {
            try { images = JSON.parse(images); } catch (e) {
                images = images.split(',').map(img => img.trim());
            }
        }
        if (!Array.isArray(images) && images) {
            images = [images];
        }

        // Filter out __EMPTY__ images
        const validImages = images.filter(img => {
            if (!img) return false;
            const imgStr = String(img);
            return imgStr !== '__EMPTY__' && !imgStr.endsWith('/__EMPTY__') && imgStr !== 'null' && imgStr !== 'undefined';
        });

        // Only show thumbnail container if there are valid images
        if (validImages.length === 0) {
            thumbContainer.style.display = "none";
            return;
        }

        // Show container and render thumbnails
        thumbContainer.style.display = "flex";

        validImages.forEach((img, i) => {
            // Normalize URL
            let imageUrl = String(img);
            if (imageUrl.includes('gajendhrademo.brandmindz.com')) {
                imageUrl = imageUrl.replace('gajendhrademo.brandmindz.com', 'gajendhrademo.brandmindz.com');
            }
            if (!imageUrl.startsWith('http')) {
                imageUrl = CONFIG.UPLOADS_URL + '/' + imageUrl;
            }

            // Lazy load thumbnails
            thumbContainer.innerHTML += `
                <button onclick="window.productDetailController.changeMainImage('${imageUrl}')"
                    class="bg-white rounded-xl p-2 border ${i === 0 ? 'border-[#B06D36]' : 'border-transparent hover:border-[#B06D36]'} transition-colors shadow-sm w-1/5 aspect-square flex items-center justify-center">
                    <img src="${imageUrl}" 
                         loading="lazy"
                         class="w-full h-full object-contain" 
                         alt="Thumb ${i + 1}">
                </button>
            `;
        });
    },

    /**
     * Renders weight/variation selector
     * Only shows if variations exist
     */
    renderVariations(product) {
        const weightSection = document.getElementById("weightSection");
        const weightButtons = document.getElementById("weightButtons");

        if (!weightSection || !weightButtons) return;

        let variations = product.variations || [];
        if (typeof variations === 'string') {
            try { variations = JSON.parse(variations); } catch (e) { variations = []; }
        }

        if (!variations || variations.length === 0) {
            weightSection.style.display = "none";
            return;
        }

        // Show section and render buttons
        weightSection.style.display = "block";
        weightButtons.innerHTML = "";

        variations.forEach((v, index) => {
            const price = parseFloat(v.price || v.amount || 0);
            const label = v.quantity || v.label || `${price} Rs`;
            const isSelected = index === 0; // First variation selected by default
            const bgClass = isSelected ? 'bg-[#A0522D]' : 'bg-[#D6D6D6]';
            const textClass = isSelected ? 'text-white' : 'text-[#3E1C00]';

            weightButtons.innerHTML += `
                <button onclick="window.productDetailController.selectVariation(${index}, ${price})"
                    class="${bgClass} ${textClass} px-6 py-2 rounded text-sm mr-2 mb-2 hover:bg-[#8B4513] transition-colors">
                    ${label} - Rs ${price.toFixed(2)}
                </button>
            `;
        });
    },

    /**
     * Renders taste segments/features
     * If no taste segments, hides the entire grid section
     */
    renderTasteSegments(product) {
        const featureGrid = document.getElementById("tasteGrid");
        if (!featureGrid) return;

        const tasteSegments = product.taste_segments || [];

        // If no taste segments, hide the entire grid container and its parent section
        if (!tasteSegments || tasteSegments.length === 0) {
            // Hide the grid itself
            featureGrid.style.display = 'none';

            // Also hide the parent container if it exists
            const parentContainer = featureGrid.parentElement;
            if (parentContainer) {
                // Check if parent has the "Quality & Action Wrapper" class or similar
                const qualityWrapper = parentContainer.closest('.mb-10');
                if (qualityWrapper && qualityWrapper.querySelector('#tasteGrid')) {
                    // Only hide if this is the only content in the wrapper
                    const hasOtherContent = Array.from(qualityWrapper.children).some(
                        child => child.id !== 'tasteGrid' && child.style.display !== 'none'
                    );
                    if (!hasOtherContent) {
                        qualityWrapper.style.display = 'none';
                    }
                }
            }
            return;
        }

        // Show the grid if it was hidden
        featureGrid.style.display = 'grid';
        const parentContainer = featureGrid.parentElement;
        if (parentContainer) {
            const qualityWrapper = parentContainer.closest('.mb-10');
            if (qualityWrapper) {
                qualityWrapper.style.display = 'block';
            }
        }

        featureGrid.innerHTML = "";

        tasteSegments.forEach(segment => {
            const iconUrl = segment.icon_url || segment.icon || "";
            // Normalize icon URL
            const normalizedIconUrl = iconUrl.includes('gajendhrademo.brandmindz.com')
                ? iconUrl.replace('gajendhrademo.brandmindz.com', 'gajendhrademo.brandmindz.com')
                : iconUrl;

            featureGrid.innerHTML += `
                <div class="flex items-start gap-4">
                    ${iconUrl ? `<img src="${normalizedIconUrl}" class="w-8 h-8 object-contain" alt="${segment.title || ''}" onerror="this.style.display='none'">` : '<div class="w-8 h-8"></div>'}
                    <div>
                        <h4 class="font-bold text-[#3E1C00] text-lg">${segment.title || ""}</h4>
                        <p class="text-[#3E1C00] text-sm opacity-80 leading-tight">${segment.description || ""}</p>
                    </div>
                </div>
            `;
        });
    },

    /**
     * Updates main image when thumbnail is clicked
     */
    updateMainImage(imageUrl) {
        const mainImg = document.getElementById("mainProductImage");
        if (mainImg) {
            mainImg.src = imageUrl;
        }

        // Update active thumbnail border
        const thumbnails = document.querySelectorAll("#thumbnailContainer button");
        thumbnails.forEach((btn, index) => {
            const img = btn.querySelector('img');
            if (img && img.src === imageUrl) {
                btn.classList.remove('border-transparent');
                btn.classList.add('border-[#B06D36]');
            } else {
                btn.classList.remove('border-[#B06D36]');
                btn.classList.add('border-transparent');
            }
        });
    },

    /**
     * Updates quantity display
     */
    updateQuantity(quantity) {
        const qtyDiv = document.getElementById("qtyDisplay");
        if (qtyDiv) {
            qtyDiv.innerText = quantity;
        }
    },

    /**
     * Renders recommended products grid
     * Uses same product card format as shop page
     */
    renderRecommendedProducts(products, cartStatusMap = {}, wishlistStatusMap = {}, onAddToCart, onGoToProduct, onToggleWishlist) {
        const grid = document.getElementById("recommendedProductsGrid");
        const section = document.getElementById("recommendedProductsSection");

        if (!grid || !section) return;

        if (!products || products.length === 0) {
            section.style.display = "none";
            return;
        }

        section.style.display = "block";
        grid.innerHTML = "";

        products.forEach(product => {
            const productId = String(product.id);
            const inCart = cartStatusMap[productId] || false;
            const inWishlist = wishlistStatusMap[productId] || false;

            // Use same product card HTML from shopRenderer
            const cardHTML = this.createRecommendedProductCardHTML(product, { inCart, inWishlist });
            grid.innerHTML += cardHTML;
        });

        // Attach event listeners
        grid.querySelectorAll('.shop-now-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = parseInt(btn.dataset.id);
                if (onGoToProduct) onGoToProduct(productId);
            });
        });

        grid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const productData = btn.dataset.product;
                if (productData) {
                    try {
                        const product = JSON.parse(productData.replace(/&quot;/g, '"'));
                        if (onAddToCart) onAddToCart(product);
                    } catch (e) {
                        console.error("Failed to parse product data:", e);
                    }
                }
            });
        });

        grid.querySelectorAll('.wishlist-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = parseInt(btn.dataset.id);
                if (onToggleWishlist) onToggleWishlist(btn, productId);
            });
        });
    },

    /**
     * Creates HTML for recommended product card (similar to shop page)
     */
    createRecommendedProductCardHTML(p, { inCart = false, inWishlist = false } = {}) {
        // Use centralized image utility
        const imageUrl = getProductImageUrl(p);

        // Use centralized price utility
        const { displayPrice, strikePrice } = calculateProductPrice(p);

        const productData = JSON.stringify({
            id: p.id,
            name: p.name,
            price: displayPrice,
            image: imageUrl
        }).replace(/"/g, '&quot;');

        const wishlistColorClass = inWishlist ? 'text-red-600' : 'text-[#8B4513]';
        const wishlistFillClass = inWishlist ? 'fill-current' : '';

        const addToCartLabel = inCart ? 'Added to cart' : 'Add to cart';
        const addToCartDisabled = inCart ? 'disabled' : '';
        const addToCartClass = inCart
            ? 'bg-green-600 text-white cursor-not-allowed opacity-90'
            : 'border border-[#B06D36] text-[#B06D36] hover:bg-[#FFF8F0]';

        return `
            <div class="bg-white rounded-xl overflow-hidden group">
                <div class="relative bg-[#F4F4F4] h-64 flex items-center justify-center p-4">
                    <button class="wishlist-toggle absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md cursor-pointer hover:bg-gray-50 ${wishlistColorClass} transition-colors" data-id="${p.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ${wishlistFillClass}" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364 4.318 12.682a4.5 4.5 0 010-6.364z" />
                        </svg>
                    </button>
                    <img src="${imageUrl}" 
                         loading="lazy"
                         alt="${p.name || 'Product'}" 
                         class="h-48 object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
                         onerror="this.src='https://placehold.co/300x300/F4F4F4/DAA520?text=${encodeURIComponent(p.name || 'Product')}'">
                </div>
                <div class="p-4">
                    <h3 class="font-bold text-lg text-[#3E1C00] mb-1 line-clamp-1">${p.name || 'Product'}</h3>
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-[#B06D36] font-bold">Rs. ${displayPrice}</span>
                        ${strikePrice ? `<span class="text-gray-400 text-sm line-through">Rs. ${strikePrice}</span>` : ''}
                    </div>
                    <div class="flex text-[#FBBF24] text-sm mb-4">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="far fa-star"></i>
                    </div>
                    <div class="flex gap-2">
                        <button class="shop-now-btn flex-1 bg-[#B06D36] text-white py-2 rounded text-sm font-semibold hover:bg-[#8B4513] transition-colors" data-id="${p.id}">Shop Now</button>
                        <button class="add-to-cart-btn flex-1 border border-[#B06D36] text-[#B06D36] py-2 rounded text-sm font-semibold hover:bg-[#FFF8F0] transition-colors ${addToCartClass}" ${addToCartDisabled} data-product="${productData}" data-product-id="${p.id}">${addToCartLabel}</button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Update a single recommended product card button/icon state
     */
    updateRecommendedProductCardStatus(productId, { inCart = null, inWishlist = null }) {
        const grid = document.getElementById("recommendedProductsGrid");
        if (!grid) return;

        const pid = String(productId);

        const cartBtn = grid.querySelector(`.add-to-cart-btn[data-product-id="${CSS.escape(pid)}"]`);
        if (cartBtn && inCart !== null) {
            if (inCart) {
                cartBtn.textContent = 'Added to cart';
                cartBtn.setAttribute('disabled', 'disabled');
                cartBtn.classList.remove('border', 'border-[#B06D36]', 'text-[#B06D36]', 'hover:bg-[#FFF8F0]');
                cartBtn.classList.add('bg-green-600', 'text-white', 'cursor-not-allowed', 'opacity-90');
            } else {
                cartBtn.textContent = 'Add to cart';
                cartBtn.removeAttribute('disabled');
                cartBtn.classList.remove('bg-green-600', 'text-white', 'cursor-not-allowed', 'opacity-90');
                cartBtn.classList.add('border', 'border-[#B06D36]', 'text-[#B06D36]', 'hover:bg-[#FFF8F0]');
            }
        }

        const heart = grid.querySelector(`.wishlist-toggle[data-id="${CSS.escape(pid)}"]`);
        if (heart && inWishlist !== null) {
            const svg = heart.querySelector('svg');
            if (inWishlist) {
                heart.classList.add('text-red-600');
                heart.classList.remove('text-[#8B4513]');
                if (svg) svg.classList.add('fill-current');
            } else {
                heart.classList.remove('text-red-600');
                heart.classList.add('text-[#8B4513]');
                if (svg) svg.classList.remove('fill-current');
            }
        }
    }
};

export default ProductDetailRenderer;

