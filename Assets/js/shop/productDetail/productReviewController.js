import ReviewService from "../../services/reviews/reviewService.js";
import { ReviewRenderer } from "../../renderers/reviews/reviewRenderer.js";
import "../../utils/reviews/reviewPopupManager.js"; // Ensures popup manager is initialized
import { ensureCurrentUserId } from "../../utils/userUtils.js";

const ProductReviewController = {
    async init(productId) {
        if (!productId) return;

        // 1. Setup Write Review Button
        const writeBtn = document.getElementById("write-review-btn");
        if (writeBtn) {
            writeBtn.addEventListener("click", () => {
                const productName = document.getElementById("productTitle")?.innerText || "Product";
                const productImage = document.getElementById("mainProductImage")?.src || "";
                // Pass null for orderItemId, the popup manager will check eligibility
                window.openReviewPopup(productId, null, productName, productImage);
            });
        }

        // 2. Fetch Reviews
        await this.loadReviews(productId);

        // 3. Listen for new reviews to reload
        window.addEventListener('reviewSubmitted', (e) => {
            if (e.detail && e.detail.productId == productId) {
                this.loadReviews(productId);
            }
        });
    },

    async loadReviews(productId) {
        try {
            const [res, userId] = await Promise.all([
                ReviewService.getProductReviews(productId),
                ensureCurrentUserId().catch(() => null)
            ]);

            if (res && res.status === 'success') {
                this.renderReviews(res, userId);
            }
        } catch (e) {
            console.error("Failed to load reviews", e);
        }
    },

    renderReviews(data, currentUserId) {
        const { average_rating, total_reviews, rating_breakup, data: reviews } = data;

        // 1. Update Summary Header
        const summaryText = document.getElementById("review-total-count");
        if (summaryText) summaryText.innerText = `Based on ${total_reviews} reviews`;

        const summaryStars = document.getElementById("review-avg-stars");
        if (summaryStars) summaryStars.innerHTML = ReviewRenderer.renderStars(average_rating);

        // 2. Update Breakdown
        const breakdownContainer = document.getElementById("review-breakdown");
        if (breakdownContainer) {
            breakdownContainer.innerHTML = ReviewRenderer.renderRatingBreakdown(rating_breakup, total_reviews);
        }

        // 3. Update Review List
        const listContainer = document.getElementById("reviews-list");
        if (listContainer) {
            if (reviews.length === 0) {
                listContainer.innerHTML = `<p class="text-center text-gray-500 py-8">No reviews yet. Be the first to review!</p>`;
            } else {
                const productName = document.getElementById("productTitle")?.innerText || "Product";
                const productImage = document.getElementById("mainProductImage")?.src || "";
                listContainer.innerHTML = reviews.map(r => ReviewRenderer.renderReviewItem(r, currentUserId, productName, productImage)).join('');
            }
        }
    }
};

export default ProductReviewController;
