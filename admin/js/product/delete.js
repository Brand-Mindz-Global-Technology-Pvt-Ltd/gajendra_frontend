/**
 * Product Module Delete Functions
 */

/**
 * Delete product with robust confirmation and error handling
 */
async function deleteProduct(productId) {
  console.log("🗑️ Delete button clicked for ID:", productId);

  if (!productId) {
    alert("Error: No product ID provided.");
    return;
  }

  // 1. Native Confirmation (Most Robust)
  const isConfirmed = confirm("Are you sure you want to delete this product?\n\nThis action cannot be undone.");

  if (!isConfirmed) {
    console.log("❌ Deletion cancelled by user.");
    return;
  }

  // 2. Perform Deletion
  try {
    // Debug API usage
    if (typeof API_BASE === 'undefined') {
      alert("Configuration Error: API_BASE is missing. Please check config.js");
      return;
    }
    console.log(`🚀 Sending DELETE to: ${API_BASE}/delete_product.php`);

    const formData = new FormData();
    formData.append("product_id", productId);

    const response = await fetch(`${API_BASE}/delete_product.php`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Server Response:", data);

    // 3. Handle Success/Failure
    if (data.success) {
      // Try showing toast, fall back to simple alert
      if (typeof showToast === 'function') {
        showToast("✅ Product deleted successfully!", "success");
      } else {
        console.log("✅ Product deleted successfully!"); // Silent success if UI removes it
      }

      // 4. Update UI
      // Option A: Remove the card/row directly (Fastest)
      const elementToRemove = document.querySelector(`button[onclick*="deleteProduct(${productId})"]`)?.closest('.product-card, .product-row, tr');
      if (elementToRemove) {
        elementToRemove.remove();
      } else {
        // Option B: Reload list
        if (typeof loadProducts === 'function') {
          loadProducts();
        } else {
          location.reload();
        }
      }
    } else {
      alert("Failed to delete: " + (data.message || "Unknown error"));
    }

  } catch (error) {
    console.error("❌ Delete Exception:", error);
    alert("System Error: " + error.message);
  }
}

// Export functions to global scope
window.deleteProduct = deleteProduct;
