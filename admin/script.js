/**
 * Admin Dashboard - Main Orchestrator
 * Handles core initialization, session management, and navigation.
 * All functional logic is moved to modular files in /js directory.
 */

// --- FRAGMENT LOADING ---
const FRAGMENTS = [
  { id: 'dashboard', path: 'sections/dashboard.html' },
  { id: 'categories', path: 'sections/categories.html' },
  { id: 'products', path: 'sections/products.html' },
  { id: 'orders', path: 'sections/orders.html' },
  { id: 'blogs', path: 'sections/blogs.html' },
  { id: 'enquiries', path: 'sections/enquiries.html' }
];

async function loadFragments() {
  console.log("🧩 Loading HTML fragments...");
  const mainContent = document.getElementById("mainContent");
  const modalPlaceholder = document.getElementById("modalPlaceholder");

  try {
    // Load Modals first
    const modalRes = await fetch('sections/modals.html');
    if (modalRes.ok) {
      modalPlaceholder.innerHTML = await modalRes.text();
    }

    // Load Section Fragments
    for (const frag of FRAGMENTS) {
      const res = await fetch(frag.path);
      if (res.ok) {
        const html = await res.text();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const section = tempDiv.querySelector('section');
        if (section) {
          mainContent.appendChild(section);
        }
      }
    }

    // Remove loader
    document.getElementById("fragmentLoader")?.remove();
    return true;
  } catch (err) {
    console.error("❌ Error loading fragments:", err);
    return false;
  }
}

/**
 * Initialize admin dashboard
 */
document.addEventListener("DOMContentLoaded", async () => {
  const success = await loadFragments();
  if (success) {
    initializeAdmin();
  } else {
    console.error("❌ Essential UI fragments failed to load.");
  }
});

async function initializeAdmin() {
  try {
    // 1. Session & Auth Check
    if (window.sessionManager) {
      currentUser = window.sessionManager.getCurrentUser();
    } else {
      // Fallback
      const userId = localStorage.getItem("user_id");
      if (userId) {
        currentUser = {
          user_id: userId,
          user_name: localStorage.getItem("user_name"),
          role: localStorage.getItem("user_role") || "admin"
        };
      }
    }

    if (!currentUser) {
      window.location.href = "login.html";
      return;
    }

    // 2. Shop Context
    const shopId = localStorage.getItem("shop_id");
    if (!shopId) {
      showToast("❌ Shop ID not found. Please login again.", "error");
      setTimeout(() => (window.location.href = "login.html"), 2000);
      return;
    }
    currentShop = { id: shopId };
    window.currentShop = currentShop; // Make globally available for modules

    console.log("🚀 Admin Dashboard Initialized:", { currentUser, currentShop });

    // Update Header UI
    updateHeaderUI();

    // 3. UI Setup
    setupNavigation();

    // Setup forms (delegated to modules)
    setupCoreEventListeners();

    // Initialize specific modules that need DOM elements from fragments
    if (typeof initBlogModule === 'function') initBlogModule();
    if (typeof initEnquiryModule === 'function') initEnquiryModule();
    if (typeof initTasteSegmentModule === 'function') initTasteSegmentModule();
    if (typeof initializePriceVariations === 'function') initializePriceVariations();
    if (typeof initializeImageUploadSlots === 'function') initializeImageUploadSlots();

    // Default load from Hash or Dashboard
    const hash = window.location.hash.replace("#", "") || "dashboard";
    const navLink = document.querySelector(`.nav-link[data-target="${hash}"]`);

    if (navLink) {
      handleNavigation(navLink);
    } else {
      await loadDashboard();
    }

  } catch (error) {
    console.error("❌ App initialization failed:", error);
  }
}

/**
 * Navigation Management
 */
function setupNavigation() {
  const sidebarLinks = document.querySelectorAll("#adminSidebar .nav-link");
  sidebarLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      handleNavigation(link);
    });
  });

  const sidebarToggle = document.getElementById("sidebarToggle");
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      document.getElementById("adminSidebar").classList.toggle("show");
    });
  }
}

function handleNavigation(link) {
  const targetId = link.getAttribute("data-target");

  // Sync URL Hash for persistence on refresh
  window.location.hash = targetId;

  // UI state update
  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
  link.classList.add("active");

  document.querySelectorAll(".section").forEach(s => s.classList.add("d-none"));
  const targetSection = document.getElementById(targetId);
  if (targetSection) targetSection.classList.remove("d-none");

  // Module-specific data loading
  switch (targetId) {
    case "dashboard":
      if (typeof loadDashboard === 'function') loadDashboard();
      break;
    case "categories":
      if (typeof loadCategories === 'function') loadCategories();
      break;
    case "products":
      if (typeof loadProducts === 'function') loadProducts();
      break;
    case "orders":
      if (typeof loadOrders === 'function') loadOrders();
      break;
    case "blogs":
      // Check if standard blog module or old one is loaded
      if (typeof loadBlogs === 'function') loadBlogs();
      break;
    case "enquiries":
      if (typeof loadEnquiries === 'function') loadEnquiries();
      break;
  }
}

/**
 * Core event listeners (delegation point)
 */
function setupCoreEventListeners() {
  // Category Management
  const categoryForm = document.getElementById("categoryForm");
  if (categoryForm && typeof handleCategorySubmit === 'function') {
    categoryForm.addEventListener("submit", handleCategorySubmit);
  }

  const categorySaveBtn = document.getElementById("categorySaveBtn");
  if (categorySaveBtn) {
    categorySaveBtn.addEventListener("click", () => {
      if (typeof saveEdit === 'function') saveEdit("category");
    });
  }

  const categoryCancelBtn = document.getElementById("categoryCancelBtn");
  if (categoryCancelBtn) {
    categoryCancelBtn.addEventListener("click", () => {
      if (typeof switchToAddMode === 'function') switchToAddMode("category");
    });
  }

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (typeof showToast === 'function') {
        showToast("Logging out... Please wait.", "success");
      }

      if (window.sessionManager) {
        window.sessionManager.clearSession();
      } else {
        localStorage.clear();
      }

      // Clear any other possible items and redirect with a delay to show toast
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);
    });
  }

  // Product Management - Handled by modules in index.html (add.js, edit.js etc)
}

/**
 * Shared Loading State
 * (Kept here as it's a core UI orchestration function)
 */
function showLoading(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  // Prevent duplicate loaders
  if (document.getElementById(`${sectionId}-loading`)) return;

  const loadingDiv = document.createElement("div");
  loadingDiv.id = `${sectionId}-loading`;
  loadingDiv.className = "text-center p-4";
  loadingDiv.innerHTML = `
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2 text-muted">Synchronizing data...</p>
    `;
  section.appendChild(loadingDiv);
}

function hideLoading(sectionId) {
  const loadingDiv = document.getElementById(`${sectionId}-loading`);
  if (loadingDiv) loadingDiv.remove();
}

// Global exposure for legacy compatibility
window.showLoading = showLoading;
window.hideLoading = hideLoading;
