/**
 * Product Module Edit Functions
 */

/**
 * Edit product
 */
async function editProduct(productId) {
    console.log("🔍 Edit button clicked for ID:", productId);
    
    // Scroll first for immediate feedback
    document.getElementById("productFormCard").scrollIntoView({ behavior: "smooth" });
  
    // Show loading state
    showLoading('products');
    
    try {
        // STEP 1: Fetch fresh product data from server
        // This ensures we have all details including variations and segments
        console.log(`📡 Fetching full details for product ${productId}...`);
        const response = await fetch(`${API_BASE}/get_product.php?product_id=${productId}&shop_id=${currentShop.id}`);
        const data = await response.json();
        
        if (!data.success) {
            showToast("❌ " + (data.message || "Product not found"), "error");
            hideLoading('products');
            return;
        }
        
        const product = data.product;
        console.log("✅ Received product data:", product);
  
        // STEP 2: Load categories (async)
        const categoriesLoaded = await loadCategoriesForDropdown();
        if (!categoriesLoaded) {
            showToast("❌ Failed to load categories", "error");
            hideLoading('products');
            return;
        }
  
        // STEP 3: Fill basic fields
        document.getElementById("prodId").value = product.id;
        document.getElementById("prodName").value = product.name;
        document.getElementById("prodSlug").value = product.slug;
        document.getElementById("prodDesc").value = product.description || "";
        document.getElementById("prodProductDesc").value = product.product_description || "";
        document.getElementById("prodBenefits").value = product.benefits || "";
        document.getElementById("prodHowToUse").value = product.how_to_use || "";
        
        // Set price and stock
        const priceField = document.getElementById("prodPrice");
        if (priceField) {
            priceField.value = product.price || 0;
        }
        
        const stockField = document.getElementById("prodStock");
        if (stockField) {
            stockField.value = product.stock || 0;
        }
  
        // Detect correct category ID
        let categoryId =
            product.category_id ||
            product.categoryId ||
            product.cat_id ||
            product.catId ||
            null;
  
        console.log("📦 Product category ID:", categoryId);
  
        // STEP 4: Set CATEGORY DROPDOWN
        if (categoryId) {
            const categorySelect = document.getElementById("prodCategory");
            const targetValue = String(categoryId);
  
            console.log("🔍 Waiting for category option:", targetValue);
            await waitForOption(categorySelect, targetValue);
  
            categorySelect.value = targetValue;
            console.log("✅ Category selected:", targetValue);
  
            // STEP 5: Load subcategories for selected category
            await loadSubcategoriesForProduct(categoryId);
  
            // STEP 6: Set SUBCATEGORY DROPDOWN
            const subcategoryId = product.subcategory_id || product.sub_category_id;
            if (subcategoryId) {
                const subcatSelect = document.getElementById("prodSubcategory");
                const subVal = String(subcategoryId);
  
                console.log("🔍 Waiting for subcategory option:", subVal);
                await waitForOption(subcatSelect, subVal);
  
                subcatSelect.value = subVal;
                console.log("✅ Subcategory selected:", subVal);
            }
        }
  
        // STEP 7: Status, New Arrival, Best Seller & 4th Section
        document.getElementById("prodStatus").value = product.status || "active";
        
        document.getElementById("prodNew").checked = 
            product.is_new_arrival == 1 || product.is_new_arrival == "1" || product.isNewArrival == 1;
        
        document.getElementById("prodBestSeller").checked = 
            product.is_best_seller == 1 || product.is_best_seller == "1" || product.isBestSeller == 1;
        
        document.getElementById("prodFourthSection").checked = 
            product.is_fourth_section == 1 || product.is_fourth_section == "1" || product.isFourthSection == 1;
  
        // STEP 8: Price variations
        if (typeof loadPriceVariations === 'function') {
            loadPriceVariations(product.variations || []);
        }
  
        // STEP 9: Load images into upload slots
        if (product.images && product.images.length > 0) {
            if (typeof loadImagesForEdit === 'function') {
                loadImagesForEdit(product.images);
            }
        } else {
            if (typeof initializeImageUploadSlots === 'function') {
                initializeImageUploadSlots();
            }
        }
  
        // STEP 10: Load Taste Segments
        window.deletedTasteSegments = new Set();
        if (typeof loadTasteSegments === 'function') {
            loadTasteSegments(product.taste_segments || []);
        }
  
        // STEP 11: Clear file inputs
        document.querySelectorAll(".image-upload-slot").forEach((slot) => {
            const input = slot.querySelector(".image-input");
            if (input) input.value = "";
        });
  
        // STEP 12: Switch UI to Edit Mode
        if (typeof switchToEditMode === 'function') {
            switchToEditMode("product");
        }
  
        showToast("📝 Product data loaded for editing", "info");
        
    } catch (error) {
        console.error("❌ Error in editProduct:", error);
        showToast("❌ Error loading product details: " + error.message, "error");
    } finally {
        hideLoading('products');
        // Final scroll to ensure we are at the form
        document.getElementById("products").scrollIntoView({ behavior: "smooth" });
    }
}


/**
 * Handle product save (edit mode)
 */
/**
 * Handle product save (edit mode)
 */
async function handleProductSave() {
    console.log('💾 handleProductSave called');
    
    const productId = document.getElementById('prodId').value;
    console.log('Product ID:', productId);
    
    if (!productId) {
      showToast('❌ No product selected for editing', 'error');
      return;
    }
  
    try {
        const formData = new FormData();
        formData.append('id', productId);
        formData.append('name', document.getElementById('prodName')?.value || '');
        formData.append('slug', document.getElementById('prodSlug')?.value || '');
        formData.append('description', document.getElementById('prodDesc')?.value || '');
        formData.append('product_description', document.getElementById('prodProductDesc')?.value || '');
        formData.append('benefits', document.getElementById('prodBenefits')?.value || '');
        formData.append('how_to_use', document.getElementById('prodHowToUse')?.value || '');
        formData.append('price', document.getElementById('prodPrice')?.value || '0');
        formData.append('stock', document.getElementById('prodStock')?.value || '0');
        formData.append('category_id', document.getElementById('prodCategory')?.value || '');
        formData.append('subcategory_id', document.getElementById('prodSubcategory')?.value || '');
        formData.append('status', document.getElementById('prodStatus')?.value || 'active');
        formData.append('is_new_arrival', document.getElementById('prodNew')?.checked ? '1' : '0');
        formData.append('is_best_seller', document.getElementById('prodBestSeller')?.checked ? '1' : '0');
        formData.append('is_fourth_section', document.getElementById('prodFourthSection')?.checked ? '1' : '0');
      
        // Collect price variations
        const variations = collectPriceVariations();
        formData.append('variations', JSON.stringify(variations));
      
        // Image handling - preserve existing images
        // --- IMAGE HANDLING (Slot Based) ---
        const imageFiles = getImageFiles();
        imageFiles.forEach((file, index) => {
          if (file !== null) {
            // CHANGED: Use explicit keys to avoid server re-indexing
            formData.append(`image_${index}`, file);
          }
        });
      
        // Delete flags
        const deleteFlags = getDeleteFlags();
        deleteFlags.forEach((flag, index) => {
          // CHANGED: Use explicit keys
          formData.append(`delete_image_${index}`, flag);
        });
    
        // --- TASTE SEGMENTS HANDLING ---
        // 1. Collect current segments (updates & new inserts)
        document.querySelectorAll(".htu-segment").forEach((seg, index) => {
            const title = seg.querySelector(".htu-title").value.trim();
            const desc = seg.querySelector(".htu-description").value.trim();
            const imageInput = seg.querySelector(".htu-image");
            const id = seg.dataset.id || ""; // Empty for new
    
            if (title || desc) {
                formData.append(`taste_segments[${index}][id]`, id);
                formData.append(`taste_segments[${index}][title]`, title);
                formData.append(`taste_segments[${index}][description]`, desc);
                
                if (imageInput && imageInput.files && imageInput.files[0]) {
                    // Backend expects taste_icon_{index}
                    formData.append(`taste_icon_${index}`, imageInput.files[0]);
                    console.log(`Adding taste icon for segment ${index}`);
                }
            }
        });
    
        // 2. Send deleted segment IDs
        if (window.deletedTasteSegments && window.deletedTasteSegments.size > 0) {
            window.deletedTasteSegments.forEach((delId) => {
                formData.append("delete_taste_segments[]", delId);
            });
        }
      
        console.log('🚀 Sending edit request...');
        showLoading('products');
        if (typeof setButtonLoading === 'function') {
            setButtonLoading("productSaveBtn", true, "Saving...");
        }
    
        const response = await fetch(`${API_BASE}/edit_product.php`, {
            method: 'POST',
            body: formData,
        });
    
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        
        hideLoading('products');
        if (typeof setButtonLoading === 'function') {
            setButtonLoading("productSaveBtn", false);
        }
    
        if (data.success) {
            showToast('✅ Product updated successfully!', 'success');
            if (typeof switchToAddMode === 'function') {
                switchToAddMode('product');
            }
            resetPriceVariations();
            // Clear deleted set
            window.deletedTasteSegments = new Set();
            loadProducts();
        } else {
            showToast('❌ ' + data.message, 'error');
        }
    } catch (error) {
      console.error('❌ Failed to update product:', error);
      hideLoading('products');
      if (typeof setButtonLoading === 'function') {
        setButtonLoading("productSaveBtn", false);
      }
      showToast('❌ Failed to update product: ' + error.message, 'error');
    }
}

/**
 * Handle product cancel (edit mode)
 */
function handleProductCancel() {
    if (typeof switchToAddMode === 'function') {
        switchToAddMode('product');
    }
    resetPriceVariations();
    showToast('📝 Edit cancelled', 'info');
}

// Export functions to global scope
// Export functions to global scope
window.editProduct = editProduct;
window.handleProductSave = handleProductSave;
window.handleProductCancel = handleProductCancel;

// Initialize listeners
function initializeEditListeners() {
    const saveBtn = document.getElementById('productSaveBtn');
    if (saveBtn) {
        // Remove existing to prevent duplicates
        saveBtn.removeEventListener('click', handleProductSave);
        saveBtn.addEventListener('click', handleProductSave);
        console.log('✅ Product save button listener attached from edit.js');
    } else {
        console.error('❌ productSaveBtn not found in edit.js');
    }

    const cancelBtn = document.getElementById('productCancelBtn');
    if (cancelBtn) {
        cancelBtn.removeEventListener('click', handleProductCancel);
        cancelBtn.addEventListener('click', handleProductCancel);
        console.log('✅ Product cancel button listener attached from edit.js');
    }
}

// Run initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEditListeners);
} else {
    initializeEditListeners();
}
