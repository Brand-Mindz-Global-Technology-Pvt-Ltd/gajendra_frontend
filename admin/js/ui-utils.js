/**
 * Admin UI Utilities
 * Shared functions for UI interaction, notifications, and loading states
 */

// API Configuration
const API_BASE = "https://gajendhrademo.brandmindz.com/routes/auth/shop";

// Global state
let currentUser = null;
let currentShop = null;

// Functional data - pointers to data loaded by modules
let categoriesBuffer = [];
let productsBuffer = [];
let ordersBuffer = [];
let blogsBuffer = [];

// Export to window immediately
window.API_BASE = API_BASE;
window.currentUser = currentUser;
window.currentShop = currentShop;

/**
 * Update Header UI based on authentication state
 */
function updateHeaderUI() {
    const profileLink = document.getElementById("profileLink");
    const profileName = document.getElementById("profileName");
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    const user = window.currentUser || currentUser;

    if (user) {
        if (profileLink) profileLink.classList.remove("d-none");
        if (profileName) profileName.textContent = user.user_name || "Admin";
        if (loginBtn) loginBtn.classList.add("d-none");
        if (logoutBtn) logoutBtn.classList.remove("d-none");
    } else {
        if (profileLink) profileLink.classList.add("d-none");
        if (loginBtn) loginBtn.classList.remove("d-none");
        if (logoutBtn) logoutBtn.classList.add("d-none");
    }
}
window.updateHeaderUI = updateHeaderUI;

/**
 * Show toast notification
 */
function showToast(message, type = "info") {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById("toastContainer");
    if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.id = "toastContainer";
        toastContainer.className = "toast-container position-fixed top-0 end-0 p-3";
        toastContainer.style.zIndex = "12000";
        document.body.appendChild(toastContainer);
    } else {
        toastContainer.style.zIndex = "12000";
    }

    // Create toast
    const toastId = "toast-" + Date.now();
    const toast = document.createElement("div");
    toast.id = toastId;
    toast.className = `toast align-items-center text-white bg-${type === "error"
        ? "danger"
        : type === "success"
            ? "success"
            : type === "warning"
                ? "warning"
                : "info"
        } border-0 shadow-lg`;
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.setAttribute("aria-atomic", "true");

    toast.innerHTML = `
      <div class="d-flex">
          <div class="toast-body">
              ${message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
  `;

    toastContainer.appendChild(toast);

    // Show toast
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();

    // Remove toast after hidden
    toast.addEventListener("hidden.bs.toast", () => {
        toast.remove();
    });
}

/**
 * Show popup modal (standardized replacement for alert/confirm)
 */
function showPopup(title, message, type = "info", callback = null) {
    const modal = document.getElementById("popupModal");
    if (!modal) {
        console.warn("Popup modal element not found in DOM");
        return;
    }

    const titleEl = document.getElementById("popupTitle");
    const messageEl = document.getElementById("popupMessage");
    const iconEl = document.getElementById("popupIcon");
    const okBtn = document.getElementById("popupOk");
    const closeBtn = document.getElementById("popupClose");

    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;

    const iconMap = {
        success: "fas fa-check-circle",
        error: "fas fa-exclamation-circle",
        warning: "fas fa-exclamation-triangle",
        info: "fas fa-info-circle",
    };

    if (iconEl) {
        iconEl.className = `popup-icon ${type}`;
        iconEl.innerHTML = `<i class="${iconMap[type] || iconMap.info}"></i>`;
    }

    modal.classList.add("show");

    // REMOVE old handlers
    if (okBtn) {
        okBtn.onclick = null;
        okBtn.onclick = () => {
            modal.classList.remove("show");
            if (callback) callback();
        };
    }

    const closeOnly = () => {
        modal.classList.remove("show");
    };

    if (closeBtn) {
        closeBtn.onclick = null;
        closeBtn.onclick = closeOnly;
    }

    modal.onclick = (e) => {
        if (e.target === modal) closeOnly();
    };

    const handleEscape = (e) => {
        if (e.key === "Escape") {
            closeOnly();
            document.removeEventListener("keydown", handleEscape);
        }
    };
    document.addEventListener("keydown", handleEscape);
}

/**
 * Set button loading state
 */
function setButtonLoading(btn, isLoading, loadingText = "Loading...") {
    const button = typeof btn === 'string' ? document.getElementById(btn) : btn;
    if (!button) return;

    if (isLoading) {
        if (!button.dataset.originalText) {
            button.dataset.originalText = button.innerHTML;
        }
        button.disabled = true;
        button.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>${loadingText}`;
    } else {
        button.disabled = false;
        if (button.dataset.originalText) {
            button.innerHTML = button.dataset.originalText;
        }
    }
}

/**
 * Show loading indicator for a specific container
 */
function showLoading(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    // Find list container within section if it exists
    const listId = sectionId === 'dashboard' ? 'dashboard' : sectionId.slice(0, -1) + 'List';
    const list = document.getElementById(listId) || section;

    // If it's a specific list, we might want to preserve header but show spinner in body
    // For now, keep it simple as in existing script.js
}

// Attach to window for global access
window.showToast = showToast;
window.showPopup = showPopup;
window.setButtonLoading = setButtonLoading;
