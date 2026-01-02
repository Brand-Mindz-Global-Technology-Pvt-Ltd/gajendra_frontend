/**
 * Product Module List Functions
 */

/**
 * Load products
 */
async function loadProducts() {
    try {
      showLoading("products");
  
      // Load categories for dropdown
      await loadCategoriesForDropdown();
      
      // Initialize event listeners for category dropdown
      if (typeof initializeProductFormListeners === 'function') {
        initializeProductFormListeners();
      }
  
      // Load products
      const response = await fetch(
        `${API_BASE}/get_my_products.php?shop_id=${currentShop.id}`
      );
      const data = await response.json();
  
      const list = document.getElementById("productList");
      list.innerHTML = "";
  
      if (data.success && data.products.length > 0) {
        products = data.products; // Update global products array
        
        data.products.forEach((product) => {
          // Debug: Log product data to see what fields are available
          console.log('Product data:', {
            id: product.id,
            name: product.name,
            is_new_arrival: product.is_new_arrival,
            is_best_seller: product.is_best_seller,
            is_fourth_section: product.is_fourth_section,
            allKeys: Object.keys(product)
          });
  
          const statusBadge =
            product.status === "active" ? "success" : "secondary";
  
          // Build badges HTML
          let badgesHTML = `<span class="badge status-badge bg-${statusBadge}">${product.status}</span>`;
          
          // Check for new arrival (multiple possible field names)
          if (product.is_new_arrival == 1 || product.is_new_arrival == "1" || product.isNewArrival == 1) {
            badgesHTML += ' <span class="badge bg-warning text-dark"><i class="fas fa-star me-1"></i>New Arrival</span>';
          }
          
          // Check for best seller (multiple possible field names)
          if (product.is_best_seller == 1 || product.is_best_seller == "1" || product.isBestSeller == 1) {
            badgesHTML += ' <span class="badge bg-danger"><i class="fas fa-fire me-1"></i>Best Seller</span>';
          }
          
          // Check for 4th section (multiple possible field names)
          if (product.is_fourth_section == 1 || product.is_fourth_section == "1" || product.isFourthSection == 1) {
            badgesHTML += ' <span class="badge bg-primary"><i class="fas fa-th-large me-1"></i>4th Section</span>';
          }
          
          list.innerHTML += `
            <div class="product-card">
              <div class="product-card-content">
                <div class="row align-items-center">
                  <div class="col-md-2">
                    ${
                      product.images && product.images.length > 0
                        ? createProductGallery(product.images.filter(img => img !== '__EMPTY__'), product.id)
                        : `<div class="no-image-placeholder">
                            <i class="fas fa-image"></i>
                          </div>`
                    }
                  </div>
                  <div class="col-md-6">
                    <h6 class="product-name">${product.name}</h6>
                    <p class="product-description">${product.description || "No description"}</p>
                    <div class="product-badges mb-2">
                      ${badgesHTML}
                    </div>
                    <small class="product-category">Category: ${product.category_name || "Uncategorized"}</small>
                  </div>
                  <div class="col-md-2 text-center">
                    <h6 class="product-price">₹${product.price}</h6>
                    <small class="product-stock">Stock: ${product.stock}</small>
                  </div>
                  <div class="col-md-2">
                    <div class="product-actions">
                      <button class="btn btn-edit" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i> Edit
                      </button>
                      <button class="btn btn-delete" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
        });
      } else {
        list.innerHTML = `
          <div class="text-center p-4">
            <i class="fas fa-box fa-3x text-muted mb-3"></i>
            <h5>No products yet</h5>
            <p class="text-muted">Add your first product to get started!</p>
          </div>
        `;
      }
  
      hideLoading("products");
    } catch (error) {
      console.error("❌ Failed to load products:", error);
      hideLoading("products");
      showToast("❌ Failed to load products", "error");
    }
}

/**
 * Load categories for dropdown
 */
async function loadCategoriesForDropdown() {
    try {
      const response = await fetch(
        `${API_BASE}/get_categories.php?shop_id=${currentShop.id}`
      );
      const data = await response.json();
  
      const select = document.getElementById("prodCategory");
      select.innerHTML = '<option value="">Select Category</option>';
  
      if (data.success && data.categories.length > 0) {
        data.categories.forEach((cat) => {
          select.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
        });
      }
      
      return true;
    } catch (error) {
      console.error("❌ Failed to load categories for dropdown:", error);
      return false;
    }
}

// Export functions to global scope
window.loadProducts = loadProducts;
window.loadCategoriesForDropdown = loadCategoriesForDropdown;
