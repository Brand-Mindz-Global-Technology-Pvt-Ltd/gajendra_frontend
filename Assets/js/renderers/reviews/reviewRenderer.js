export const ReviewRenderer = {
    /**
     * Render the star rating breakdown (5 star, 4 star etc bars)
     */
    renderRatingBreakdown(breakup, totalReviews) {
        if (!breakup) return '';

        const stars = [5, 4, 3, 2, 1];
        return stars.map(star => {
            const count = breakup[star] || 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

            // Adjust icon based on star level (optional visual flair)
            const iconClass = star >= 1 ? 'fas fa-star' : 'far fa-star';

            return `
                <div class="flex items-center gap-4 text-sm">
                    <div class="flex text-[#FBBF24] w-24">
                        ${this.renderStars(star)}
                    </div>
                    <div class="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div class="h-full bg-[#8B4513] transition-all duration-500" style="width: ${percentage}%"></div>
                    </div>
                    <span class="text-[#3E1C00] w-8 text-right">${Math.round(percentage)}%</span>
                </div>
            `;
        }).join('');
    },

    /**
     * Render a single review item
     */
    /**
     * Render a single review item
     */
    renderReviewItem(review, currentUserId = null, productName = "Product", productImage = "") {
        // Date formatting
        const date = new Date(review.created_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        // Photo HTML
        const photoHtml = review.photo
            ? `<div class="mt-3"><img src="${review.photo}" alt="Review Image" class="w-20 h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90" onclick="window.open('${review.photo}', '_blank')"></div>`
            : '';

        // Verified Purchase Badge
        const verifiedBadge = review.is_verified_purchase
            ? `<span class="ml-2 text-green-600 text-xs bg-green-50 px-2 py-0.5 rounded-full border border-green-100 flex items-center gap-1"><i class="fas fa-check-circle"></i> Verified Purchase</span>`
            : '';

        // Action Buttons (Edit/Delete)
        let actionButtons = '';
        // Ensure type safety (API might return strings)
        if (currentUserId && review.user_id == currentUserId) {
            // Escape special chars in text for onclick
            const safeText = (review.review_text || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
            const safePhoto = (review.photo || '').replace(/'/g, "\\'");
            const safeProductName = String(productName).replace(/'/g, "\\'");
            
            actionButtons = `
                <div class="flex gap-3 mt-4 text-sm font-medium">
                    <button onclick="ReviewPopupManager.openEdit(${review.id}, ${review.product_id}, ${review.rating}, '${safeText}', '${safePhoto}', '${safeProductName}', '${productImage}')" 
                        class="text-[#3E1C00] hover:underline flex items-center gap-1">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="if(confirm('Are you sure you want to delete this review?')) ReviewPopupManager.deleteReview(${review.id}, ${review.product_id})" 
                        class="text-red-600 hover:underline flex items-center gap-1">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
        }

        return `
            <div class="mb-8 border-b border-[#D4B896]/30 pb-8 last:border-0 last:mb-0 last:pb-0 group">
                <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-full bg-[#3E1C00] text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
                        ${review.user_name ? review.user_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div class="flex-1">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                            <div>
                                <h4 class="font-bold text-[#3E1C00] flex items-center">
                                    ${review.user_name || 'Anonymous'}
                                    ${verifiedBadge}
                                </h4>
                                <div class="flex text-[#FBBF24] text-xs my-1">
                                    ${this.renderStars(review.rating)}
                                </div>
                            </div>
                            <span class="text-xs text-gray-500">${date}</span>
                        </div>
                        <p class="text-[#3E1C00] leading-relaxed opacity-90">${review.review_text || ''}</p>
                        ${photoHtml}
                        ${actionButtons}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render star icons HTML
     */
    renderStars(rating) {
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                starsHtml += '<i class="fas fa-star"></i>';
            } else if (i - 0.5 === rating) {
                starsHtml += '<i class="fas fa-star-half-alt"></i>';
            } else {
                starsHtml += '<i class="far fa-star"></i>'; // Empty star
            }
        }
        return starsHtml;
    },

    /**
     * Render the "Write Review" button or status for Profile Order List
     */
    renderOrderReviewButton(orderItem) {
        if (orderItem.already_reviewed) {
            const safeText = (orderItem.review_text || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
            const safePhoto = (orderItem.review_photo || '').replace(/'/g, "\\'");

            // Show stars if already reviewed
            return `
                <div class="flex flex-col items-center gap-2">
                    <div class="flex flex-col items-end gap-1">
                        <span class="text-xs text-green-600 font-medium">Reviewed</span>
                        <div class="flex text-[#FBBF24] text-xs">
                            ${this.renderStars(orderItem.review_rating)}
                        </div>
                    </div>
                    
                    <div class="flex gap-2">
                         <button onclick="ReviewPopupManager.openEdit(${orderItem.review_id}, ${orderItem.product_id}, ${orderItem.review_rating}, '${safeText}', '${safePhoto}', '${(orderItem.product_name || 'Product').replace(/'/g, "\\'")}', '${orderItem.product_image || ''}')" 
                            class="text-xs text-[#3E1C00] border border-[#3E1C00] rounded px-2 py-1 hover:bg-[#3E1C00] hover:text-white transition-colors">
                            Edit
                        </button>
                        <button onclick="if(confirm('Delete this review?')) ReviewPopupManager.deleteReview(${orderItem.review_id}, ${orderItem.product_id})" 
                            class="text-xs text-red-600 border border-red-600 rounded px-2 py-1 hover:bg-red-600 hover:text-white transition-colors">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        } else if (orderItem.can_review) {
            // Show button
            return `
                <button 
                    onclick="openReviewPopup(
                        ${orderItem.product_id}, 
                        ${orderItem.order_item_id}, 
                        '${orderItem.product_name.replace(/'/g, "\\'")}', 
                        '${orderItem.product_image || ''}' 
                    )"
                    class="px-4 py-2 bg-white border border-[#3E1C00] text-[#3E1C00] text-sm rounded hover:bg-[#3E1C00] hover:text-white transition-colors shadow-sm">
                    Write Review
                </button>
            `;
        } else {
            // Cannot review yet (e.g. not delivered)
            return `<span class="text-xs text-gray-400 italic">Review available after delivery</span>`;
        }
    }
};
