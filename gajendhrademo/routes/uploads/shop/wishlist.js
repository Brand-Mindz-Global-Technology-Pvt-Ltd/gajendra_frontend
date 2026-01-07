/* ==========================================================
   Wishlist Frontend JS Integration – Narpavi Honey
   Works with: add_to_wishlist.php / get_wishlist.php / remove_wishlist.php
   ========================================================== */

// Change baseURL if your local path differs
const baseURL = "http://localhost/Narpavi_Honey/Narpavi_Honey_Backend/routes/shop";

/* ===============================
   Helper: Toast Notification
=============================== */
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  const bg = type === "success" ? "bg-green-500" : "bg-red-500";
  toast.className = `fixed bottom-4 right-4 ${bg} text-white text-sm px-4 py-2 rounded-xl shadow z-50`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

/* ===============================
   User Utilities
=============================== */
function getCurrentUserId() {
  const userData = localStorage.getItem("user");
  if (!userData) return null;
  try {
    const user = JSON.parse(userData);
    return user.id;
  } catch {
    return null;
  }
}

/* ===============================
   Add to Wishlist
=============================== */
async function addToWishlist(productId) {
  const userId = getCurrentUserId();
  if (!userId) {
    alert("Please login to add to wishlist");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("product_id", productId);

    const res = await fetch(`${baseURL}/add_to_wishlist.php`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.success) {
      showToast("Added to wishlist");
      updateWishlistCount();
    } else {
      showToast(data.message || "Error adding to wishlist", "error");
    }
  } catch (err) {
    console.error(err);
    showToast("Error updating wishlist", "error");
  }
}

/* ===============================
   Remove from Wishlist
=============================== */
async function removeFromWishlist(productId) {
  const userId = getCurrentUserId();
  if (!userId) return;

  try {
    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("product_id", productId);

    const res = await fetch(`${baseURL}/remove_wishlist.php`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.success) {
      showToast("Removed from wishlist");
      updateWishlistCount();
    } else {
      showToast(data.message || "Error removing item", "error");
    }
  } catch (err) {
    console.error(err);
    showToast("Error updating wishlist", "error");
  }
}

/* ===============================
   Get Wishlist
=============================== */
async function getWishlist() {
  const userId = getCurrentUserId();
  if (!userId) return [];

  try {
    const res = await fetch(`${baseURL}/get_wishlist.php?user_id=${userId}`, {
      method: "GET",
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.products)) {
      return data.products;
    } else if (data.success && data.data && Array.isArray(data.data.products)) {
      return data.data.products;
    } else {
      return [];
    }
  } catch (err) {
    console.error(err);
    return [];
  }
}

/* ===============================
   Update Wishlist Count
=============================== */
async function updateWishlistCount() {
  const list = await getWishlist();
  const count = list.length;

  const countElements = document.querySelectorAll(".icon-count");
  countElements.forEach((el) => {
    if (el.previousElementSibling?.querySelector(".fa-heart")) {
      el.textContent = count;
    }
  });
}

/* ===============================
   Toggle Product Wishlist Button
=============================== */
async function toggleProductWishlist(productId) {
  const userId = getCurrentUserId();
  if (!userId) {
    alert("Please login to use wishlist");
    return;
  }

  const list = await getWishlist();
  const isInWishlist = list.some((item) => item.product_id == productId);

  if (isInWishlist) {
    await removeFromWishlist(productId);
    updateWishlistHeart(false);
  } else {
    await addToWishlist(productId);
    updateWishlistHeart(true);
  }
}

/* ===============================
   UI Helper: Heart Icon
=============================== */
function updateWishlistHeart(isActive) {
  const btn = document.getElementById("product-wishlist-btn");
  if (!btn) return;
  const svg = btn.querySelector("svg");
  if (!svg) return;

  if (isActive) {
    svg.classList.remove("text-gray-400");
    svg.classList.add("text-red-500");
    svg.setAttribute("fill", "currentColor");
    btn.title = "Remove from wishlist";
  } else {
    svg.classList.add("text-gray-400");
    svg.classList.remove("text-red-500");
    svg.setAttribute("fill", "none");
    btn.title = "Add to wishlist";
  }
}

/* ===============================
   Init – auto update on page load
=============================== */
document.addEventListener("DOMContentLoaded", updateWishlistCount);
