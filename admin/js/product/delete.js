/**
 * Product Module Delete Functions
 */

/**
 * Delete product
 */
async function deleteProduct(productId) {
  console.log("🗑️ Delete button clicked for ID:", productId);

  if (typeof showPopup !== 'function') {
    console.error("❌ showPopup function not found!");
    if (typeof showToast === 'function') showToast("❌ Error: Delete functionality unavailable", "error");
    return;
  }

  showPopup(
    "Delete Product",
    "Are you sure you want to delete this product? This action cannot be undone.",
    "warning",
    async () => {
      try {
        console.log(`🚀 Sending delete request for product ${productId}...`);
        const formData = new FormData();
        formData.append("product_id", productId);

        // Use fetch directly
        const response = await fetch(`${API_BASE}/delete_product.php`, {
          method: "POST",
          body: formData,
        });

        // Check response status
        if (!response.ok) {
          throw new Error(`Server returned ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("✅ Delete response:", data);

        if (data.success) {
          if (typeof showToast === 'function') showToast("✅ Product deleted successfully!", "success");
          if (typeof loadProducts === 'function') loadProducts();
        } else {
          if (typeof showToast === 'function') showToast("❌ " + data.message, "error");
        }
      } catch (error) {
        console.error("❌ Failed to delete product:", error);
        if (typeof showToast === 'function') showToast("❌ Failed to delete product: " + error.message, "error");
      }
    }
  );
}

// Export functions to global scope
window.deleteProduct = deleteProduct;
