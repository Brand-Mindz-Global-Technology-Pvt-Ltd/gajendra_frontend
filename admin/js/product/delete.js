/**
 * Product Module Delete Functions
 */

/**
 * Delete product with robust confirmation and error handling
 */
async function deleteProduct(productId) {
  if (!productId) {
    showToast("Error: No product ID provided.", "error");
    return;
  }

  showConfirm(
    "Delete Product",
    "Are you sure you want to delete this product? This action cannot be undone.",
    async () => {
      try {
        const formData = new FormData();
        formData.append("product_id", productId);

        const response = await fetch(`${API_BASE}/delete_product.php`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const data = await response.json();
        if (data.success) {
          showToast("✅ Product deleted successfully!", "success");

          // Update UI: Remove card or reload
          const elementToRemove = document.querySelector(`button[onclick*="deleteProduct(${productId})"]`)?.closest('.product-card, .product-row, tr');
          if (elementToRemove) {
            elementToRemove.remove();
          } else if (typeof loadProducts === 'function') {
            loadProducts();
          } else {
            location.reload();
          }
        } else {
          showToast("Failed to delete: " + (data.message || "Unknown error"), "error");
        }
      } catch (error) {
        console.error("❌ Delete Exception:", error);
        showToast("System Error: " + error.message, "error");
      }
    }
  );
}

// Export functions to global scope
window.deleteProduct = deleteProduct;
