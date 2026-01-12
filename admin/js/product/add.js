/**
 * Product Module Add Functions
 */

// Simple function that will be called by event listener
function handleCategoryChange() {
    const categoryId = document.getElementById('prodCategory')?.value;
    console.log('🔄 Category changed to:', categoryId);
    
    if (!categoryId) {
      // Clear subcategory dropdown if no category selected
      const subcatSelect = document.getElementById("prodSubcategory");
      if (subcatSelect) {
        subcatSelect.innerHTML = '<option value="">Select Subcategory</option>';
        subcatSelect.removeAttribute('required');
      }
      return;
    }
    
    // Call the subcategory loading function
    try {
      console.log('📞 Calling loadSubcategoriesForProduct with categoryId:', categoryId);
      if (typeof loadSubcategoriesForProduct === 'function') {
        loadSubcategoriesForProduct(categoryId);
      } else {
        console.error('❌ loadSubcategoriesForProduct is not a function');
      }
    } catch (error) {
      console.error('❌ Error in handleCategoryChange:', error);
    }
}
  
// Initialize event listeners after DOM is ready
function initializeProductFormListeners() {
    // Category change listener
    const categorySelect = document.getElementById('prodCategory');
    if (categorySelect) {
      categorySelect.removeEventListener('change', handleCategoryChange);
      categorySelect.addEventListener('change', handleCategoryChange);
      console.log('✅ Category change listener attached');
    }

    // Product form submit listener
    const productForm = document.getElementById('addProductForm');
    if (productForm) {
        productForm.removeEventListener('submit', handleProductSubmit);
        productForm.addEventListener('submit', handleProductSubmit);
        console.log('✅ Product form submit listener attached to addProductForm');
    } else {
        console.error('❌ addProductForm not found');
    }
}

/**
 * Collect Taste Segments from the form
 */
function collectTasteSegments() {
    const segments = [];
    document.querySelectorAll(".htu-segment").forEach((seg) => {
        const title = seg.querySelector(".htu-title").value.trim();
        const desc = seg.querySelector(".htu-description").value.trim();
        const imageInput = seg.querySelector(".htu-image");
        
        // Only add if at least title or description is present
        if (title || desc) {
            const segment = { title, description: desc };
            if (imageInput && imageInput.files && imageInput.files[0]) {
                segment.image = imageInput.files[0];
            }
            segments.push(segment);
        }
    });
    return segments;
}

/**
 * Handle product form submission
 */
async function handleProductSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
  
    const formData = new FormData(e.target);
    formData.append("shop_id", currentShop.id);
  
    // Collect price variations
    const variations = collectPriceVariations();
    formData.append("variations", JSON.stringify(variations));
  
    formData.append("subcategory_id", document.getElementById("prodSubcategory")?.value || "");
  
    // Add bestseller and 4th section flags
    formData.append("is_best_seller", document.getElementById("prodBestSeller")?.checked ? "1" : "0");
    formData.append("is_fourth_section", document.getElementById("prodFourthSection")?.checked ? "1" : "0");
  
    // Collect image files from upload slots
    const imageFiles = getImageFiles();
    imageFiles.forEach((file, index) => {
      if (file !== null) {
        // CHANGED: Use array notation for multiple images
        formData.append(`images[]`, file);
      }
    });

    // Collect Taste Segments
    const segments = collectTasteSegments();
    segments.forEach((seg, index) => {
        formData.append(`taste_segments[${index}][title]`, seg.title);
        formData.append(`taste_segments[${index}][description]`, seg.description);
        
        if (seg.image) {
            // CHANGED: Backend expects taste_icon_{index}
            formData.append(`taste_icon_${index}`, seg.image);
        }
    });
  
    try {
      showLoading("products");
      if (typeof setButtonLoading === 'function') {
        setButtonLoading("productSubmitBtn", true, "Adding...");
      }
  
      const response = await fetch(`${API_BASE}/add_product.php`, {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();
      hideLoading("products");
      if (typeof setButtonLoading === 'function') {
        setButtonLoading("productSubmitBtn", false);
      }
  
      if (data.success) {
        showToast("✅ Product added successfully!", "success");
        e.target.reset();
        resetPriceVariations();
        if (typeof initializeImageUploadSlots === 'function') {
            initializeImageUploadSlots();
        }
        loadProducts();
      } else {
        showToast("❌ " + data.message, "error");
      }
    } catch (error) {
      console.error("❌ Failed to add product:", error);
      hideLoading("products");
      if (typeof setButtonLoading === 'function') {
        setButtonLoading("productSubmitBtn", false);
      }
      showToast("❌ Failed to add product", "error");
    }
  
    return false;
}

// Export functions to global scope
window.handleProductSubmit = handleProductSubmit;
window.initializeProductFormListeners = initializeProductFormListeners;
