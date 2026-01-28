import ReviewService from "../../services/reviews/reviewService.js";
import { Toast } from "../toast.js";
import { ensureCurrentUserId } from "../userUtils.js";

const ReviewPopupManager = {
    init() {
        if (!document.getElementById("review-popup-container")) {
            const popupHTML = `
                <style>
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .no-scrollbar {
                        -ms-overflow-style: none;  /* IE and Edge */
                        scrollbar-width: none;  /* Firefox */
                    }
                </style>
                <div id="review-popup-container" class="fixed inset-0 z-[60] hidden flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-poppins">
                    <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all scale-95 opacity-0 duration-300 flex flex-col max-h-[90vh]" id="review-modal">
                        
                        <!-- Header -->
                        <div class="bg-[#3E1C00] px-6 py-4 flex justify-between items-center text-white shrink-0">
                            <h3 class="text-lg font-semibold">Write a Review</h3>
                            <button onclick="ReviewPopupManager.close()" class="text-white/70 hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <!-- Body -->
                        <div class="p-6 overflow-y-auto no-scrollbar min-h-0">
                            <div class="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                                <img id="review-product-image" src="" class="w-16 h-16 object-cover rounded-lg bg-gray-100 border border-gray-200">
                                <div>
                                    <h4 id="review-product-name" class="font-bold text-[#3E1C00] text-lg line-clamp-1">Product Name</h4>
                                    <p class="text-xs text-gray-500">Share your experience with this product</p>
                                </div>
                            </div>

                            <form id="review-form" class="space-y-5">
                                <input type="hidden" name="review_id" id="review-id"> <!-- Added for edit -->
                                <input type="hidden" name="product_id" id="review-product-id">
                                <input type="hidden" name="order_item_id" id="review-order-item-id">
                                <input type="hidden" name="user_id" id="review-user-id">

                                <!-- Rating -->
                                <div class="flex flex-col items-center justify-center py-2">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Your Rating *</label>
                                    <div class="flex gap-2" id="star-rating-input">
                                        <button type="button" data-value="1" class="text-3xl text-gray-300 hover:scale-110 transition-transform focus:outline-none"><i class="fas fa-star"></i></button>
                                        <button type="button" data-value="2" class="text-3xl text-gray-300 hover:scale-110 transition-transform focus:outline-none"><i class="fas fa-star"></i></button>
                                        <button type="button" data-value="3" class="text-3xl text-gray-300 hover:scale-110 transition-transform focus:outline-none"><i class="fas fa-star"></i></button>
                                        <button type="button" data-value="4" class="text-3xl text-gray-300 hover:scale-110 transition-transform focus:outline-none"><i class="fas fa-star"></i></button>
                                        <button type="button" data-value="5" class="text-3xl text-gray-300 hover:scale-110 transition-transform focus:outline-none"><i class="fas fa-star"></i></button>
                                    </div>
                                    <input type="hidden" name="rating" id="review-rating-value" required>
                                    <p class="text-xs text-red-500 mt-1 hidden" id="rating-error">Please select a rating</p>
                                </div>

                                <!-- Review Text -->
                                <div>
                                    <label class="block text-sm font-medium text-[#3E1C00] mb-1">Review (Optional)</label>
                                    <textarea name="review_text" id="review-text" rows="4" 
                                        class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#3E1C00] focus:ring-1 focus:ring-[#3E1C00] outline-none transition-shadow resize-none placeholder-gray-400"
                                        placeholder="What did you like or dislike?"></textarea>
                                </div>

                                <!-- Photo Upload -->
                                <div>
                                    <label class="block text-sm font-medium text-[#3E1C00] mb-1">Add Photo (Optional)</label>
                                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative" onclick="document.getElementById('review-photo-input').click()">
                                        <input type="file" name="photo" id="review-photo-input" class="hidden" accept="image/*" onchange="ReviewPopupManager.handlePhotoPreview(this)">
                                        <div id="photo-preview-container" class="hidden">
                                            <img id="photo-preview" src="" class="h-24 mx-auto object-contain rounded mb-2">
                                            <span class="text-xs text-red-500 block hover:underline" onclick="event.stopPropagation(); ReviewPopupManager.removePhoto()">Remove</span>
                                        </div>
                                        <div id="photo-upload-placeholder">
                                            <i class="fas fa-camera text-2xl text-gray-400 mb-2"></i>
                                            <p class="text-xs text-gray-500">Click to upload image</p>
                                        </div>
                                    </div>
                                </div>

                                <!-- Submit Button -->
                                <button type="submit" id="submit-review-btn" class="w-full bg-[#3E1C00] text-white font-bold py-3.5 rounded-lg hover:bg-[#5D3420] transition-all shadow-md active:scale-[0.98]">
                                    Submit Review
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML("beforeend", popupHTML);
            this.setupListeners();
        }
    },

    setupListeners() {
        // Star Interaction
        const stars = document.querySelectorAll("#star-rating-input button");
        stars.forEach(btn => {
            btn.addEventListener("click", (e) => {
                const value = parseInt(btn.dataset.value);
                document.getElementById("review-rating-value").value = value;
                this.updateStars(value);
                document.getElementById("rating-error").classList.add("hidden");
            });

            // Hover effect
            btn.addEventListener("mouseenter", () => {
                const value = parseInt(btn.dataset.value);
                this.highlightStars(value);
            });

            btn.addEventListener("mouseleave", () => {
                const currentVal = parseInt(document.getElementById("review-rating-value").value) || 0;
                this.updateStars(currentVal);
            });
        });

        // Form Submit
        const form = document.getElementById("review-form");
        if (form) {
            form.addEventListener("submit", async (e) => {
                e.preventDefault();
                await this.handleSubmit(new FormData(form));
            });
        }
    },

    updateStars(value) {
        const stars = document.querySelectorAll("#star-rating-input button");
        stars.forEach(btn => {
            const starVal = parseInt(btn.dataset.value);
            if (starVal <= value) {
                btn.classList.remove("text-gray-300");
                btn.classList.add("text-[#FBBF24]");
            } else {
                btn.classList.add("text-gray-300");
                btn.classList.remove("text-[#FBBF24]");
            }
        });
    },

    highlightStars(value) {
        const stars = document.querySelectorAll("#star-rating-input button");
        stars.forEach(btn => {
            const starVal = parseInt(btn.dataset.value);
            if (starVal <= value) {
                btn.classList.remove("text-gray-300");
                btn.classList.add("text-[#FBBF24]/60"); // Lighter color for hover
            } else {
                btn.classList.add("text-gray-300");
                btn.classList.remove("text-[#FBBF24]/60");
            }
        });
    },

    handlePhotoPreview(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById("photo-preview").src = e.target.result;
                document.getElementById("photo-preview-container").classList.remove("hidden");
                document.getElementById("photo-upload-placeholder").classList.add("hidden");
            }
            reader.readAsDataURL(input.files[0]);
        }
    },

    removePhoto() {
        document.getElementById("review-photo-input").value = "";
        document.getElementById("photo-preview-container").classList.add("hidden");
        document.getElementById("photo-upload-placeholder").classList.remove("hidden");
    },

    async open(productId, orderItemId = null, productName = "Product", productImage = "") {
        const userId = await ensureCurrentUserId();
        if (!userId) {
            Toast.error("Please login to review products");
            return;
        }

        // If orderItemId is missing (Product Page flow), fetch it via eligibility check
        if (!orderItemId) {
            // Toast.info("checking eligibility...");
            try {
                const res = await ReviewService.checkEligibility(userId, productId);
                if (res && res.eligible && res.order_item_id) {
                    orderItemId = res.order_item_id;
                } else {
                    Toast.error(res?.message || "You are not eligible to review this product.");
                    return;
                }
            } catch (e) {
                Toast.error("Error checking eligibility");
                return;
            }
        }

        // Populate fields
        document.getElementById("review-product-id").value = productId;
        document.getElementById("review-order-item-id").value = orderItemId;
        document.getElementById("review-user-id").value = userId;
        document.getElementById("review-id").value = ""; // Clear Review ID (Add Mode)

        document.getElementById("review-product-name").innerText = productName;

        const imgEl = document.getElementById("review-product-image");
        if (productImage) {
            imgEl.src = productImage;
            imgEl.style.display = 'block';
        } else {
            imgEl.style.display = 'none';
        }

        // Reset form
        document.getElementById("review-form").reset();
        document.getElementById("review-text").value = "";
        this.updateStars(0);
        this.removePhoto();
        document.getElementById("submit-review-btn").innerText = "Submit Review";

        // Show Modal
        this.showModal();
    },

    // Open Modal in Edit Mode
    async openEdit(reviewId, productId, rating, text, photoPath, productName = "Product", productImage = "") {
        const userId = await ensureCurrentUserId();
        if (!userId) {
            Toast.error("Please login");
            return;
        }

        document.getElementById("review-product-id").value = productId;
        document.getElementById("review-user-id").value = userId;
        document.getElementById("review-id").value = reviewId;

        // Set Product Info
        document.getElementById("review-product-name").innerText = productName;
        const imgEl = document.getElementById("review-product-image");
        if (productImage) {
            imgEl.src = productImage;
            imgEl.style.display = 'block';
        } else {
            imgEl.style.display = 'none';
        }

        document.getElementById("review-form").reset();

        // Pre-fill data
        document.getElementById("review-rating-value").value = rating;
        this.updateStars(rating);
        document.getElementById("review-text").value = text;

        if (photoPath) {
            document.getElementById("photo-preview").src = photoPath;
            document.getElementById("photo-preview-container").classList.remove("hidden");
            document.getElementById("photo-upload-placeholder").classList.add("hidden");
        } else {
            this.removePhoto();
        }

        document.getElementById("submit-review-btn").innerText = "Update Review";
        this.showModal();
    },

    async deleteReview(reviewId, productId) {
        const userId = await ensureCurrentUserId();
        if (!userId) return;

        try {
            const res = await ReviewService.deleteReview(reviewId, userId);
            if (res && res.status === 'success') {
                Toast.success("Review deleted successfully");
                // Reload with correct productId
                window.dispatchEvent(new CustomEvent('reviewSubmitted', { detail: { productId: productId } }));
            } else {
                Toast.error(res?.message || "Failed to delete review");
            }
        } catch (e) {
            Toast.error("Error deleting review");
        }
    },

    showModal() {
        const container = document.getElementById("review-popup-container");
        const modal = document.getElementById("review-modal");
        container.classList.remove("hidden");
        setTimeout(() => {
            modal.classList.remove("scale-95", "opacity-0");
            modal.classList.add("scale-100", "opacity-100");
        }, 10);
    },

    close() {
        const container = document.getElementById("review-popup-container");
        const modal = document.getElementById("review-modal");

        modal.classList.remove("scale-100", "opacity-100");
        modal.classList.add("scale-95", "opacity-0");

        setTimeout(() => {
            container.classList.add("hidden");
        }, 300); // Wait for transition
    },

    async handleSubmit(formData) {
        const rating = formData.get("rating");
        if (!rating) {
            document.getElementById("rating-error").classList.remove("hidden");
            return;
        }

        const btn = document.getElementById("submit-review-btn");
        const originalText = btn.innerText;
        btn.disabled = true;
        btn.innerText = "Submitting...";

        const isEdit = !!formData.get("review_id");

        try {
            let res;
            if (isEdit) {
                res = await ReviewService.editReview(formData);
            } else {
                res = await ReviewService.submitReview(formData);
            }

            if (res && (res.success || res.status === 'success')) {
                Toast.success(isEdit ? "Review updated successfully!" : "Review submitted successfully!");
                this.close();
                // Dispatch event so parent can listen and refresh
                window.dispatchEvent(new CustomEvent('reviewSubmitted', {
                    detail: {
                        productId: formData.get("product_id")
                    }
                }));
            } else {
                Toast.error(res?.message || "Failed to submit review");
            }
        } catch (e) {
            console.error(e);
            Toast.error("Error submitting review");
        } finally {
            btn.disabled = false;
            btn.innerText = originalText;
        }
    }
};

// Expose global methods
window.ReviewPopupManager = ReviewPopupManager;
window.openReviewPopup = (productId, orderItemId, productName, productImage) => {
    ReviewPopupManager.open(productId, orderItemId, productName, productImage);
};

// Initialize on load
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => ReviewPopupManager.init());
} else {
    ReviewPopupManager.init();
}

export default ReviewPopupManager;
