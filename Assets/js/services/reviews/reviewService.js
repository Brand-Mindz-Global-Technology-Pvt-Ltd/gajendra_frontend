import CONFIG from "../../config.js";
import { apiCall } from "../../utils/api.js";

const ReviewService = {
    /**
     * Check if user is eligible to review a product
     * @param {number} userId 
     * @param {number} productId 
     * @returns {Promise<{eligible: boolean, order_item_id: number}>}
     */
    async checkEligibility(userId, productId) {
        const formData = new FormData();
        formData.append('user_id', userId);
        formData.append('product_id', productId);
        return await apiCall(`${CONFIG.REVIEWS_API_URL}/check_eligibility.php`, "POST", formData);
    },

    /**
     * Submit a new review
     * @param {FormData} formData 
     * @returns {Promise<{success: boolean, message: string}>}
     */
    async submitReview(formData) {
        return await apiCall(`${CONFIG.REVIEWS_API_URL}/add_review.php`, "POST", formData);
    },

    /**
     * Get reviews for a product
     * @param {number} productId 
     * @returns {Promise<{data: Array, average_rating: number, total_reviews: number, rating_breakup: Object}>}
     */
    async getProductReviews(productId) {
        return await apiCall(`${CONFIG.REVIEWS_API_URL}/get_reviews.php?product_id=${productId}`, "GET");
    },

    /**
     * Get orders with review status (for profile page)
     * @param {number} userId 
     * @returns {Promise<{data: Array}>}
     */
    async getOrdersWithReviewStatus(userId) {
        const formData = new FormData();
        formData.append('user_id', userId);
        return await apiCall(`${CONFIG.REVIEWS_API_URL}/get_my_orders_with_review_status.php`, "POST", formData);
    },

    /**
     * Edit an existing review
     */
    async editReview(formData) {
        return await apiCall(`${CONFIG.REVIEWS_API_URL}/edit_review.php`, "POST", formData);
    },

    /**
     * Delete a review
     */
    async deleteReview(reviewId, userId) {
        const formData = new FormData();
        formData.append('review_id', reviewId);
        formData.append('user_id', userId);
        return await apiCall(`${CONFIG.REVIEWS_API_URL}/delete_review.php`, "POST", formData);
    }
};

export default ReviewService;
