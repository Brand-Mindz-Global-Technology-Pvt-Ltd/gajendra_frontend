/**
 * Product Module Delete Functions
 */

/**
 * Delete product
 */
async function deleteProduct(productId) {
    showPopup(
      "Delete Product",
      "Are you sure you want to delete this product? This action cannot be undone.",
      "warning",
      async () => {
        try {
          const formData = new FormData();
          formData.append("product_id", productId);
  
          const response = await fetch(`${API_BASE}/delete_product.php`, {
            method: "POST",
            body: formData,
          });
  
          const data = await response.json();
  
          if (data.success) {
            showToast("✅ Product deleted successfully!", "success");
            loadProducts();
          } else {
            showToast("❌ " + data.message, "error");
          }
        } catch (error) {
          console.error("❌ Failed to delete product:", error);
          showToast("❌ Failed to delete product", "error");
        }
      }
    );
}

// Export functions to global scope
window.deleteProduct = deleteProduct;
