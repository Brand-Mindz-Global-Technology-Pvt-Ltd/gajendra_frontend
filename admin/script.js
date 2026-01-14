/**
 * Admin Dashboard Script - Complete Shop API Integration
 * Handles all admin operations: Products, Categories, Orders, Blogs
 */

const API_BASE = "https://gajendhrademo.brandmindz.com/routes/auth/shop";

// Global variables
let currentUser = null;
let currentShop = null;
let categories = [];
let products = [];
let orders = [];
let blogs = [];

// Initialize admin dashboard
document.addEventListener("DOMContentLoaded", () => {
  initializeAdmin();
});

/**
 * Initialize admin dashboard
 */
async function initializeAdmin() {
  try {
    // Get current user from session
    if (window.sessionManager) {
      currentUser = window.sessionManager.getCurrentUser();
      if (!currentUser) {
        window.location.href = "login.html";
        return;
      }
    } else {
      // Fallback to localStorage if session manager not available
      const userId = localStorage.getItem("user_id");
      const userName = localStorage.getItem("user_name");
      const userRole = localStorage.getItem("user_role");

      if (!userId) {
        window.location.href = "login.html";
        return;
      }

      currentUser = {
        user_id: userId,
        user_name: userName,
        role: userRole || "admin",
      };
    }

    // Get shop ID from localStorage
    const shopId = localStorage.getItem("shop_id");
    if (!shopId) {
      console.error("No shop ID found");
      showToast("❌ Shop ID not found. Please login again.", "error");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
      return;
    }
    currentShop = { id: shopId };

    console.log("✅ Current user:", currentUser);
    console.log("✅ Current shop:", currentShop);

    // Setup navigation
    console.log("🔧 Setting up navigation...");
    setupNavigation();

    // Load initial data
    console.log("📊 Loading dashboard...");
    await loadDashboard();

    // Setup forms
    console.log("📝 Setting up forms...");
    setupForms();

    // Initialize image upload slots
    console.log("🖼️ Setting up image upload slots...");
    initializeImageUploadSlots();

    console.log("✅ Admin dashboard initialized successfully");

    // Category Image Preview Listener
    const catImageInput = document.getElementById("catImage");
    if (catImageInput) {
      catImageInput.addEventListener("change", function () {
        if (this.files && this.files[0]) {
          const reader = new FileReader();
          reader.onload = function (e) {
            document.getElementById("catImagePreview").src = e.target.result;
            document.getElementById("catImagePreviewContainer").style.display = "block";
          };
          reader.readAsDataURL(this.files[0]);
        }
      });
    }
  } catch (error) {
    console.error("❌ Failed to initialize admin:", error);
  }
}

/**
 * Setup navigation
 */
function setupNavigation() {
  console.log("🔧 Setting up navigation...");

  // Desktop sidebar
  const sidebarLinks = document.querySelectorAll("#adminSidebar .nav-link");
  console.log("📋 Found sidebar links:", sidebarLinks.length);

  sidebarLinks.forEach((link, index) => {
    console.log(
      `🔗 Setting up link ${index + 1}:`,
      link.getAttribute("data-target")
    );
    link.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("🖱️ Link clicked:", this.getAttribute("data-target"));
      handleNavigation(this);
    });
  });

  // Mobile sidebar toggle
  const sidebarToggle = document.getElementById("sidebarToggle");
  if (sidebarToggle) {
    console.log("📱 Setting up mobile sidebar toggle");
    sidebarToggle.addEventListener("click", function () {
      document.getElementById("adminSidebar").classList.toggle("show");
    });
  } else {
    console.log("⚠️ Mobile sidebar toggle not found");
  }

  console.log("✅ Navigation setup complete");
}

/**
 * Handle navigation
 */
function handleNavigation(link) {
  console.log("🔄 Navigation clicked:", link);

  // Remove active class from all links
  document
    .querySelectorAll(".nav-link")
    .forEach((l) => l.classList.remove("active"));
  link.classList.add("active");

  // Hide all sections
  document.querySelectorAll(".section").forEach((s) => {
    s.classList.add("d-none");
    console.log("📦 Hiding section:", s.id);
  });

  // Show target section
  const targetId = link.getAttribute("data-target");
  console.log("🎯 Target section:", targetId);

  const targetSection = document.getElementById(targetId);
  if (targetSection) {
    targetSection.classList.remove("d-none");
    console.log("✅ Showing section:", targetId);
  } else {
    console.error("❌ Section not found:", targetId);
  }

  // Load section data
  switch (targetId) {
    case "dashboard":
      console.log("📊 Loading dashboard...");
      loadDashboard();
      break;
    case "categories":
      console.log("📁 Loading categories...");
      loadCategories();
      break;
    case "products":
      console.log("📦 Loading products...");
      loadProducts();
      break;
    case "orders":
      console.log("🛒 Loading orders...");
      loadOrders();
      break;
    case "blogs":
      console.log("📝 Loading blogs...");
      loadBlogs();
      break;
    default:
      console.log("❓ Unknown section:", targetId);
  }
}

/**
 * Load dashboard data
 */
async function loadDashboard() {
  try {
    showLoading("dashboard");

    // Load all data in parallel
    const [productsRes, categoriesRes, ordersRes, blogsRes] = await Promise.all(
      [
        fetch(`${API_BASE}/get_my_products.php?shop_id=${currentShop.id}`),
        fetch(`${API_BASE}/get_categories.php?shop_id=${currentShop.id}`),
        fetch(`${API_BASE}/get_orders.php?shop_id=${currentShop.id}`), // Use shop_id for admin orders
        fetch(`${API_BASE}/get_blogs.php`),
      ]
    );

    const [productsData, categoriesData, ordersData, blogsData] =
      await Promise.all([
        productsRes.text().then(text => {
          try {
            return JSON.parse(text);
          } catch (e) {
            console.error("Failed to parse products response:", text);
            return { success: false, message: "Invalid response format" };
          }
        }),
        categoriesRes.text().then(text => {
          try {
            return JSON.parse(text);
          } catch (e) {
            console.error("Failed to parse categories response:", text);
            return { success: false, message: "Invalid response format" };
          }
        }),
        ordersRes.text().then(text => {
          try {
            return JSON.parse(text);
          } catch (e) {
            console.error("Failed to parse orders response:", text);
            return { success: false, message: "Invalid response format" };
          }
        }),
        blogsRes.text().then(text => {
          try {
            return JSON.parse(text);
          } catch (e) {
            console.error("Failed to parse blogs response:", text);
            return { success: false, message: "Invalid response format" };
          }
        }),
      ]);

    // Update dashboard cards
    document.getElementById("cardProducts").innerText = productsData.success
      ? productsData.products.length
      : 0;
    document.getElementById("cardCategories").innerText = categoriesData.success
      ? categoriesData.categories.length
      : 0;
    document.getElementById("cardOrders").innerText = ordersData.success
      ? ordersData.orders.length
      : 0;
    document.getElementById("cardBlogs").innerText = blogsData.success
      ? blogsData.blogs.length
      : 0;

    hideLoading("dashboard");
  } catch (error) {
    console.error("❌ Failed to load dashboard:", error);
    hideLoading("dashboard");
    showToast("❌ Failed to load dashboard data", "error");
  }
}

/**
 * Load categories
 */
async function loadCategories() {
  try {
    showLoading("categories");

    const response = await fetch(
      `${API_BASE}/get_categories.php?shop_id=${currentShop.id}`
    );

    const responseText = await response.text();
    let data;

    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse categories response:", responseText);
      data = { success: false, categories: [] };
    }

    const list = document.getElementById("categoryList");
    const countBadge = document.getElementById("categoryCount");

    list.innerHTML = "";

    if (data.success && data.categories.length > 0) {

      // SAVE to global
      categories = data.categories;

      // UPDATE COUNT
      countBadge.textContent = `${categories.length} categories`;

      // SHOW LIST
      data.categories.forEach((cat) => {
        const imgPath = cat.image
          ? `https://gajendhrademo.brandmindz.com/uploads/categories/${cat.image}`
          : null;

        list.innerHTML += `
          <div class="d-flex justify-content-between align-items-center p-3 border-bottom">
            
            <div class="d-flex align-items-center">
              ${imgPath
            ? `<img src="${imgPath}" class="img-thumbnail me-3" style="width: 50px; height: 50px; object-fit: cover;">`
            : `<div class="bg-light me-3 d-flex align-items-center justify-content-center" style="width: 50px; height: 50px; border: 1px solid #ddd;"><i class="fas fa-image text-muted"></i></div>`
          }
              <div>
                <h6 class="mb-1">${cat.name}</h6>
                <small class="text-muted">Slug: ${cat.slug}</small>
              </div>
            </div>

            <div class="btn-group">

              <!-- EDIT -->
              <button class="btn btn-sm btn-outline-primary"
                  onclick="editCategory(${cat.id})">
                <i class="fas fa-edit"></i>
              </button>

              <!-- DELETE -->
              <button class="btn btn-sm btn-outline-danger"
                  onclick="deleteCategory(${cat.id})">
                <i class="fas fa-trash"></i>
              </button>

              <!-- SUBCATEGORIES -->
              <button class="btn btn-sm btn-outline-danger"
                  onclick="openSubcategoryModal(${cat.id}, '${cat.name}')">
                <i class="fas fa-sitemap"></i>
              </button>

            </div>

          </div>
        `;
      });

    } else {
      // EMPTY STATE
      countBadge.textContent = `0 categories`;
      list.innerHTML = `
        <div class="text-center p-4">
            <i class="fas fa-folder fa-3x text-muted mb-3"></i>
            <h5>No categories yet</h5>
            <p class="text-muted">Add your first category to get started!</p>
        </div>
      `;
    }

    hideLoading("categories");

  } catch (error) {
    console.error("❌ Failed to load categories:", error);
    hideLoading("categories");
    showToast("❌ Failed to load categories", "error");

    // Show error in list
    const list = document.getElementById("categoryList");
    if (list) {
      list.innerHTML = `
            <div class="text-center p-4">
                <i class="fas fa-exclamation-circle fa-3x text-danger mb-3"></i>
                <h5>Failed to load categories</h5>
                <p class="text-danger">${error.message || 'Unknown error occurred'}</p>
                <button class="btn btn-primary btn-sm mt-2" onclick="loadCategories()">
                    <i class="fas fa-sync me-2"></i> Retry
                </button>
            </div>
        `;
    }
  }
}

function editCategory(categoryId) {
  const category = categories.find((c) => c.id == categoryId);
  if (!category) {
    showToast("❌ Category not found", "error");
    return;
  }

  // Fill form
  document.getElementById("catId").value = category.id;
  document.getElementById("catName").value = category.name;
  document.getElementById("catSlug").value = category.slug;

  // Clear file input
  if (document.getElementById("catImage")) document.getElementById("catImage").value = "";

  // Show image preview if exists
  const preview = document.getElementById("catImagePreview");
  const previewContainer = document.getElementById("catImagePreviewContainer");
  if (category.image) {
    preview.src = `https://gajendhrademo.brandmindz.com/uploads/categories/${category.image}`;
    previewContainer.style.display = "block";
  } else {
    previewContainer.style.display = "none";
  }

  // Set visibility radios
  const showInMenu = category.show_in_menu == 1 ? "menuYes" : "menuNo";
  const showInFilter = category.show_in_filter == 1 ? "filterYes" : "filterNo";
  if (document.getElementById(showInMenu)) document.getElementById(showInMenu).checked = true;
  if (document.getElementById(showInFilter)) document.getElementById(showInFilter).checked = true;

  // Switch UI to edit mode
  switchToEditMode("category");

  // Scroll into view
  document.getElementById("categories").scrollIntoView({ behavior: "smooth" });

  showToast("📝 Category data loaded for editing", "info");
}




function openSubcategoryModal(categoryId, categoryName) {
  // Set category details
  document.getElementById("subcatCategoryId").value = categoryId;
  document.getElementById("subcatCategoryTitle").textContent =
    "Category: " + categoryName;

  // Clear previous input
  document.getElementById("subcatName").value = "";
  document.getElementById("subcatSlug").value = "";

  // Reset visibility radios
  if (document.getElementById("subMenuYes")) document.getElementById("subMenuYes").checked = true;
  if (document.getElementById("subFilterYes")) document.getElementById("subFilterYes").checked = true;

  // Load list
  loadSubcategoryList(categoryId);

  // Open modal
  const modal = new bootstrap.Modal(document.getElementById("subcategoryModal"));
  modal.show();
}

async function loadSubcategoryList(categoryId) {
  const list = document.getElementById("subcatList");

  // Show loader
  list.innerHTML = `
      <div class="text-center p-3">
          <div class="spinner-border text-primary"></div>
          <p class="mt-2">Loading...</p>
      </div>
  `;

  try {
    const response = await fetch(
      `${API_BASE}/get_subcategories.php?shop_id=${currentShop.id}&category_id=${categoryId}`
    );

    const data = await response.json();

    if (!data.success || data.subcategories.length === 0) {
      list.innerHTML = `
              <div class="text-center p-3">
                  <i class="fas fa-sitemap fa-2x text-muted mb-2"></i>
                  <p class="text-muted">No subcategories found</p>
              </div>
          `;
      return;
    }

    // Show list
    let html = "";
    data.subcategories.forEach((sub) => {
      html += `
              <div class="d-flex justify-content-between align-items-center p-2 border-bottom">
                  <div>
                      <strong>${sub.name}</strong>
                      <br>
                      <small class="text-muted">Slug: ${sub.slug}</small>
                  </div>

                  <div>
                      <button class="btn btn-sm btn-outline-primary me-2"
                         onclick='editSubcategory(${sub.id}, ${JSON.stringify(sub.name)}, ${JSON.stringify(sub.slug)}, ${categoryId})'>
                          <i class="fas fa-edit"></i>
                      </button>

                      <button class="btn btn-sm btn-outline-danger"
                          onclick="deleteSubcategory(${sub.id}, ${categoryId})">
                          <i class="fas fa-trash"></i>
                      </button>
                  </div>
              </div>
          `;
    });

    list.innerHTML = html;

  } catch (error) {
    console.error("❌ Failed to load subcategories:", error);
    list.innerHTML = `<p class="text-center text-danger">Failed to load</p>`;
  }
}

document.getElementById("subcatAddBtn").addEventListener("click", async () => {
  const categoryId = document.getElementById("subcatCategoryId").value;
  const name = document.getElementById("subcatName").value.trim();
  const slug = document.getElementById("subcatSlug").value.trim();

  if (!name || !slug) {
    showToast("Please fill all fields", "error");
    return;
  }

  try {
    setButtonLoading("subcatAddBtn", true, "Adding...");
    const formData = new FormData();
    formData.append("shop_id", currentShop.id);
    formData.append("category_id", categoryId);
    formData.append("name", name);
    formData.append("slug", slug);

    const response = await fetch(`${API_BASE}/add_subcategory.php`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setButtonLoading("subcatAddBtn", false);

    if (data.success) {
      showToast("Subcategory added successfully", "success");

      // Clear input
      document.getElementById("subcatName").value = "";
      document.getElementById("subcatSlug").value = "";

      // Reload list
      loadSubcategoryList(categoryId);
    } else {
      showToast(data.message || "Failed to add subcategory", "error");
    }

  } catch (error) {
    console.error("❌ Subcategory add error:", error);
    setButtonLoading("subcatAddBtn", false);
    showToast("Error adding subcategory", "error");
  }
});

function resetSubcatEditMode() {
  document.getElementById("subcatId").value = "";
  document.getElementById("subcatName").value = "";
  document.getElementById("subcatSlug").value = "";

  document.getElementById("subcatAddBtn").style.display = "block";
  document.getElementById("subcatEditControls").style.display = "none";
}

function editSubcategory(id, name, slug, categoryId) {
  // Fill the form
  document.getElementById("subcatId").value = id;
  document.getElementById("subcatName").value = name;
  document.getElementById("subcatSlug").value = slug;

  // Set visibility radios (assuming they might be added to API later, or defaulting to Yes for now)
  // For now, satisfy the frontend UI
  if (document.getElementById("subMenuYes")) document.getElementById("subMenuYes").checked = true;
  if (document.getElementById("subFilterYes")) document.getElementById("subFilterYes").checked = true;

  // Change Add button to hidden
  document.getElementById("subcatAddBtn").style.display = "none";

  // Show edit controls (Save + Cancel)
  document.getElementById("subcatEditControls").style.display = "flex";

  // Scroll to form for better UX
  document.getElementById("subcatForm").scrollIntoView({ behavior: "smooth" });

  showToast("Editing subcategory", "info");
}

window.editSubcategory = editSubcategory;



document.getElementById("subcatCancelBtn").addEventListener("click", () => {
  resetSubcatEditMode();
});


document.getElementById("subcatSaveBtn").addEventListener("click", async () => {
  const id = document.getElementById("subcatId").value;
  const categoryId = document.getElementById("subcatCategoryId").value;
  const name = document.getElementById("subcatName").value.trim();
  const slug = document.getElementById("subcatSlug").value.trim();

  if (!name || !slug) {
    showToast("Please fill all fields", "error");
    return;
  }

  try {
    setButtonLoading("subcatSaveBtn", true, "Saving...");
    const formData = new FormData();

    // 🔥 REQUIRED FIX (was missing)
    formData.append("id", id);

    formData.append("category_id", categoryId);
    formData.append("name", name);
    formData.append("slug", slug);

    const response = await fetch(`${API_BASE}/update_subcategory.php`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setButtonLoading("subcatSaveBtn", false);

    if (data.success) {
      showToast("Subcategory updated successfully", "success");
      resetSubcatEditMode();
      loadSubcategoryList(categoryId);
    } else {
      showToast(data.message || "Failed to update subcategory", "error");
    }

  } catch (error) {
    console.error("❌ Subcategory update error:", error);
    setButtonLoading("subcatSaveBtn", false);
    showToast("Error updating subcategory", "error");
  }
});


document.getElementById("subcatCancelBtn").addEventListener("click", () => {
  resetSubcatEditMode();
});


function resetSubcatEditMode() {
  document.getElementById("subcatId").value = "";
  document.getElementById("subcatName").value = "";
  document.getElementById("subcatSlug").value = "";

  // Show Add button back
  document.getElementById("subcatAddBtn").style.display = "block";

  // Hide Edit controls
  document.getElementById("subcatEditControls").style.display = "none";
}

async function deleteSubcategory(id, categoryId) {
  if (!confirm("Are you sure you want to delete this subcategory?")) {
    return;
  }

  try {
    const formData = new FormData();
    formData.append("id", id);

    const response = await fetch(`${API_BASE}/delete_subcategory.php`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      showToast("Subcategory deleted", "success");

      // Reload list
      loadSubcategoryList(categoryId);

    } else {
      showToast(data.message || "Cannot delete subcategory", "error");
    }

  } catch (error) {
    console.error("❌ Subcategory delete error:", error);
    showToast("Error deleting subcategory", "error");
  }
}


// Product subcategory loading moved to admin/js/product/utils.js

// Product category change handler moved to admin-product.js

// NOTE: All product-related functions below are now in admin-product.js
// Keeping them here temporarily for backward compatibility
// TODO: Remove after confirming admin-product.js is loaded

/**
 * Load products
 * @deprecated - Moved to admin-product.js
 */
// Product loading functions moved to admin/js/product/list.js


/**
 * Load orders
 */
async function loadOrders() {
  try {
    showLoading("orders");

    const response = await fetch(
      `${API_BASE}/get_orders.php?shop_id=${currentShop.id}`
    );
    const data = await response.json();

    const list = document.getElementById("orderList");
    list.innerHTML = "";

    if (data.success && data.orders.length > 0) {
      orders = data.orders;
      data.orders.forEach((order) => {
        const statusBadge = getOrderStatusBadge(order.status);
        list.innerHTML += `
                    <div class="card mb-3">
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col-md-3">
                                    <h6 class="mb-1">Order #${order.order_id
          }</h6>
                                    <small class="text-muted">${new Date(
            order.created_at
          ).toLocaleDateString()}</small>
                                </div>
                                <div class="col-md-3">
                                    <p class="mb-1">Customer: ${order.customer_name || "N/A"
          }</p>
                                    <small class="text-muted">${order.customer_email || "N/A"
          }</small>
                                </div>
                                <div class="col-md-2 text-center">
                                    <h6 class="text-success mb-1">₹${order.total_amount
          }</h6>
                                    <small class="text-muted">${order.items_count
          } items</small>
                                </div>
                                <div class="col-md-2 text-center">
                                    <span class="badge bg-${statusBadge}">${order.status
          }</span>
                                </div>
                                <div class="col-md-2">
                                    <button class="btn btn-sm btn-outline-primary w-100" onclick="viewOrder(${order.order_id
          })">
                                        <i class="fas fa-eye"></i> View
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
      });
    } else {
      list.innerHTML = `
                <div class="text-center p-4">
                    <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                    <h5>No orders yet</h5>
                    <p class="text-muted">Orders will appear here when customers place them!</p>
                </div>
            `;
    }

    hideLoading("orders");
  } catch (error) {
    console.error("❌ Failed to load orders:", error);
    hideLoading("orders");
    showToast("❌ Failed to load orders", "error");
  }
}

/**
 * Load blogs
 */
async function loadBlogs() {
  try {
    showLoading("blogs");

    const response = await fetch(`${API_BASE}/get_blogs.php`);
    const data = await response.json();

    const list = document.getElementById("blogList");
    list.innerHTML = "";

    if (data.success && data.blogs.length > 0) {
      blogs = data.blogs;
      console.log("Blogs loaded:", blogs.length);
      if (blogs.length > 0) {
        console.log("Sample blog object:", blogs[0]);
        console.log("Blog keys:", Object.keys(blogs[0]));
      }
      data.blogs.forEach((blog) => {
        list.innerHTML += `
                    <div class="card mb-3">
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col-md-2">
                                    ${blog.image
            ? `<img src="https://gajendhrademo.brandmindz.com/routes/auth/uploads/blogs/${blog.image}" 
                                              class="img-fluid rounded" style="height: 80px; object-fit: cover;">`
            : `<div class="bg-light rounded d-flex align-items-center justify-content-center" style="height: 80px;">
                                            <i class="fas fa-image text-muted"></i>
                                        </div>`
          }
                                </div>
                                <div class="col-md-8">
                                    <h6 class="mb-1">${blog.title}</h6>
                                    <div class="text-muted mb-1" style="max-height: 60px; overflow: hidden;">
                                        ${blog.content && blog.content.trim()
            ? (() => {
              // Strip HTML tags and get plain text
              const plainText = blog.content.replace(/<[^>]*>/g, '');
              const truncated = plainText.substring(0, 150);
              return truncated + (plainText.length > 150 ? "..." : "");
            })()
            : "<em class='text-muted'>No content available</em>"
          }
                                    </div>
                                    <small class="text-muted">
                                        <strong>Slug:</strong> ${blog.slug} | 
                                        <strong>Created:</strong> ${new Date(blog.created_at || blog.createdAt || Date.now()).toLocaleDateString()}
                                    </small>
                                </div>
                                <div class="col-md-2">
                                    <div class="btn-group-vertical w-100">
                                        <button class="btn btn-sm btn-outline-primary" onclick="editBlog(${blog.id
          })">
                                            <i class="fas fa-edit"></i> Edit
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" onclick="deleteBlog(${blog.id
          })">
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
                    <i class="fas fa-blog fa-3x text-muted mb-3"></i>
                    <h5>No blogs yet</h5>
                    <p class="text-muted">Add your first blog post to get started!</p>
                </div>
            `;
    }

    hideLoading("blogs");
  } catch (error) {
    console.error("❌ Failed to load blogs:", error);
    hideLoading("blogs");
    showToast("❌ Failed to load blogs", "error");
  }
}

/**
 * Setup forms
 */
function setupForms() {
  // Category form
  const categoryForm = document.getElementById("categoryForm");
  if (categoryForm) {
    categoryForm.addEventListener("submit", handleCategorySubmit);
    // Additional prevention
    categoryForm.onsubmit = function (e) {
      e.preventDefault();
      return false;
    };
  }

  // 🔥 CATEGORY — Save button (important)
  const categorySaveBtn = document.getElementById("categorySaveBtn");
  if (categorySaveBtn) {
    categorySaveBtn.addEventListener("click", () => {
      saveEdit("category");
    });
  }

  // 🔥 CATEGORY — Cancel button
  const categoryCancelBtn = document.getElementById("categoryCancelBtn");
  if (categoryCancelBtn) {
    categoryCancelBtn.addEventListener("click", () => {
      switchToAddMode("category");
    });
  }

  // Product form
  const productForm = document.getElementById("productForm");
  if (productForm) {
    productForm.addEventListener("submit", handleProductSubmit);
    // Additional prevention
    productForm.onsubmit = function (e) {
      e.preventDefault();
      return false;
    };
  }

  // Initialize price variations
  initializePriceVariations();

  // Product save button
  const productSaveBtn = document.getElementById('productSaveBtn');
  if (productSaveBtn) {
    productSaveBtn.addEventListener('click', handleProductSave);
  }

  // Product cancel button
  const productCancelBtn = document.getElementById('productCancelBtn');
  if (productCancelBtn) {
    productCancelBtn.addEventListener('click', handleProductCancel);
  }

  // Blog form
  const blogForm = document.getElementById("blogForm");
  if (blogForm) {
    blogForm.addEventListener("submit", handleBlogSubmit);
    // Additional prevention
    blogForm.onsubmit = function (e) {
      e.preventDefault();
      return false;
    };
  }
}


/**
 * Handle category form submission
 */
async function handleCategorySubmit(e) {
  e.preventDefault();
  e.stopPropagation();

  console.log("Category form submitted, preventing default behavior");

  const formData = new FormData(e.target);
  formData.append("shop_id", currentShop.id);

  try {
    showLoading("categories");
    setButtonLoading("categorySubmitBtn", true, "Adding...");

    const response = await fetch(`${API_BASE}/add_category.php`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    hideLoading("categories");
    setButtonLoading("categorySubmitBtn", false);

    if (data.success) {
      showToast("✅ Category added successfully!", "success");
      e.target.reset();

      // Clear preview
      const previewContainer = document.getElementById("catImagePreviewContainer");
      if (previewContainer) previewContainer.style.display = "none";

      loadCategories();
    } else {
      showToast("❌ " + data.message, "error");
    }
  } catch (error) {
    console.error("❌ Failed to add category:", error);
    hideLoading("categories");
    setButtonLoading("categorySubmitBtn", false);
    showToast("❌ Failed to add category", "error");
  }

  return false; // Additional prevention
}

/**
 * Handle product form submission
 * @deprecated - Moved to admin-product.js
 */
// Product submit handler moved to admin/js/product/add.js

/**
 * Handle blog form submission
 */
async function handleBlogSubmit(e) {
  e.preventDefault();
  e.stopPropagation();

  console.log("Blog form submitted, preventing default behavior");

  const formData = new FormData(e.target);

  try {
    showLoading("blogs");

    const response = await fetch(`${API_BASE}/add_blog.php`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    hideLoading("blogs");

    if (data.success) {
      showToast("✅ Blog added successfully!", "success");
      e.target.reset();
      loadBlogs();
    } else {
      showToast("❌ " + data.message, "error");
    }
  } catch (error) {
    console.error("❌ Failed to add blog:", error);
    hideLoading("blogs");
    showToast("❌ Failed to add blog", "error");
  }

  return false; // Additional prevention
}

/**
 * Delete product
 * @deprecated - Moved to admin-product.js
 */
// Product delete handler moved to admin/js/product/delete.js

/**
 * Utility: Wait until a <select> contains an option with given value
 */
function waitForOption(selectEl, value) {
  return new Promise(resolve => {
    const check = () => {
      const found = Array.from(selectEl.options).some(opt => opt.value === value);
      if (found) resolve(true);
      else setTimeout(check, 25);
    };
    check();
  });
}

/**
 * Edit product
 */
// Product edit handler moved to admin/js/product/edit.js

/**
 * Edit blog
 */
function editBlog(blogId) {
  const blog = blogs.find((b) => b.id == blogId);
  if (!blog) {
    showToast("❌ Blog not found", "error");
    return;
  }

  // Fill form with blog data
  document.getElementById("blogId").value = blog.id;
  document.getElementById("blogTitle").value = blog.title;
  document.getElementById("blogSlug").value = blog.slug;
  document.getElementById("blogContent").value = blog.content || "";

  // Switch to edit mode
  switchToEditMode("blog");

  // Scroll to form
  document.getElementById("blogs").scrollIntoView({ behavior: "smooth" });

  showToast("📝 Blog data loaded for editing", "info");
}

/**
 * Switch to edit mode
 */
function switchToEditMode(type) {
  const formTitle = document.getElementById(`${type}FormTitle`);
  const submitBtn = document.getElementById(`${type}SubmitBtn`);
  const editControls = document.getElementById(`${type}EditControls`);

  // Update form title
  formTitle.innerHTML = `<i class="fas fa-edit text-warning me-2"></i>Edit ${type.charAt(0).toUpperCase() + type.slice(1)
    }`;

  // Hide submit button and show edit controls
  submitBtn.style.display = "none";
  editControls.style.display = "block";

  if (type === "category") {

    document.getElementById("categoryFormTitle").innerHTML =
      `<i class="fas fa-edit text-primary me-2"></i>Edit Category`;

    document.getElementById("categorySubmitBtn").style.display = "none";
    document.getElementById("categoryEditControls").style.display = "block";
  }

  // Add event listeners for save and cancel
  setupEditControls(type);
}
window.switchToEditMode = switchToEditMode;


/**
 * Switch back to add mode
 */
function switchToAddMode(type) {
  const formTitle = document.getElementById(`${type}FormTitle`);
  const submitBtn = document.getElementById(`${type}SubmitBtn`);
  const editControls = document.getElementById(`${type}EditControls`);

  // Handle different form ID for product
  const formId = type === 'product' ? 'addProductForm' : `${type}Form`;
  const form = document.getElementById(formId);

  // Update form title
  formTitle.innerHTML = `<i class="fas fa-plus-circle text-primary me-2"></i>Add New ${type.charAt(0).toUpperCase() + type.slice(1)
    }`;

  // Show submit button and hide edit controls
  submitBtn.style.display = "inline-block";
  editControls.style.display = "none";

  // Reset form
  form.reset();

  // Get the correct ID field name based on type
  let idFieldName;
  switch (type) {
    case "product":
      idFieldName = "prodId";
      break;
    case "category":
      idFieldName = "catId";
      break;
    case "blog":
      idFieldName = "blogId";
      break;
    default:
      idFieldName = `${type}Id`;
  }

  document.getElementById(idFieldName).value = "";

  // Reset category visibility radios if applicable
  if (type === "category") {
    if (document.getElementById("menuYes")) document.getElementById("menuYes").checked = true;
    if (document.getElementById("filterYes")) document.getElementById("filterYes").checked = true;

    // Hide image preview
    const previewContainer = document.getElementById("catImagePreviewContainer");
    if (previewContainer) previewContainer.style.display = "none";
  }
}

/**
 * Setup edit controls
 */
function setupEditControls(type) {
  const saveBtn = document.getElementById(`${type}SaveBtn`);
  const cancelBtn = document.getElementById(`${type}CancelBtn`);

  if (!saveBtn || !cancelBtn) {
    console.warn(`Edit controls not found for type: ${type}`);
    return;
  }

  // Remove existing event listeners by cloning
  const newSaveBtn = saveBtn.cloneNode(true);
  const newCancelBtn = cancelBtn.cloneNode(true);

  saveBtn.replaceWith(newSaveBtn);
  cancelBtn.replaceWith(newCancelBtn);

  // Add new event listeners
  if (type === 'product') {
    // Look for handlers in local scope or window
    const saveHandler = typeof handleProductSave === 'function' ? handleProductSave : window.handleProductSave;
    const cancelHandler = typeof handleProductCancel === 'function' ? handleProductCancel : window.handleProductCancel;

    if (typeof saveHandler === 'function') {
      newSaveBtn.addEventListener('click', saveHandler);
      console.log('✅ Attached handleProductSave to save button');
    } else {
      console.error('❌ handleProductSave not found in scope or window');
    }

    if (typeof cancelHandler === 'function') {
      newCancelBtn.addEventListener('click', cancelHandler);
      console.log('✅ Attached handleProductCancel to cancel button');
    } else {
      console.error('❌ handleProductCancel not found in scope or window');
    }
  } else {
    // Generic handler for others
    newSaveBtn.onclick = () => saveEdit(type);
    newCancelBtn.onclick = () => switchToAddMode(type);
  }
}

// Export functions to ensure global availability
window.setupEditControls = setupEditControls;
window.switchToEditMode = switchToEditMode;
window.switchToAddMode = switchToAddMode;

/**
 * Save edit
 */
async function saveEdit(type) {
  const form = document.getElementById(`${type}Form`);
  const formData = new FormData(form);

  // Get the correct ID field name based on type
  let idFieldName;
  switch (type) {
    case "product":
      idFieldName = "prodId";
      break;
    case "category":
      idFieldName = "catId";
      break;
    case "blog":
      idFieldName = "blogId";
      break;
    default:
      idFieldName = `${type}Id`;
  }

  const id = document.getElementById(idFieldName).value;

  console.log(`Saving edit for ${type}, ID: ${id}`);

  if (!id) {
    showToast("❌ No item selected for editing", "error");
    return;
  }

  try {
    showLoading(type);
    setButtonLoading(`${type}SaveBtn`, true, "Saving...");

    // Add edit flag to form data
    formData.append("edit", "1");
    formData.append("id", id);

    // Add shop_id for category and product
    if (type === "category" || type === "product") {
      formData.append("shop_id", currentShop.id);

    }

    // For products, collect price variations and images
    if (type === "product") {
      console.log('About to collect price variations...');
      formData.append("subcategory_id", document.getElementById("prodSubcategory").value);

      const variations = collectPriceVariations();
      console.log('Collected variations:', variations);
      const variationsJson = JSON.stringify(variations);
      console.log('Sending variations JSON:', variationsJson);
      formData.append('variations', variationsJson);

      // Collect image files from upload slots
      const imageFiles = getImageFiles();
      console.log('Collected image files:', imageFiles.length);
      imageFiles.forEach((file, index) => {
        formData.append(`images[${index}]`, file);
      });
    }

    let endpoint = "";
    switch (type) {
      case "category":
        endpoint = `${API_BASE}/add_category.php`;
        break;
      case "product":
        endpoint = `${API_BASE}/edit_product.php`;
        break;
      case "blog":
        endpoint = `${API_BASE}/add_blog.php`;
        break;
    }

    console.log(`Sending request to: ${endpoint}`);

    // Log form data after all fields are added
    console.log("Form data:", Object.fromEntries(formData));
    console.log("Form data entries:");
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value} (type: ${typeof value})`);
    }

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    const responseText = await response.text();

    let data;
    try {
      data = JSON.parse(responseText);
      console.log("Parsed response data:", data);
    } catch (e) {
      console.error("Failed to parse JSON response:", e);
      console.log("Response was not valid JSON. Raw response:", responseText);
      hideLoading(type);
      setButtonLoading(`${type}SaveBtn`, false);
      showToast("❌ Server returned invalid response", "error");
      return;
    }

    hideLoading(type);
    setButtonLoading(`${type}SaveBtn`, false);

    if (data.success) {
      showToast(
        `✅ ${type.charAt(0).toUpperCase() + type.slice(1)
        } updated successfully!`,
        "success"
      );
      switchToAddMode(type);

      // Reload the appropriate list
      switch (type) {
        case "category":
          loadCategories();
          break;
        case "product":
          loadProducts();
          break;
        case "blog":
          loadBlogs();
          break;
      }
    } else {
      showToast("❌ " + data.message, "error");
    }
  } catch (error) {
    console.error(`❌ Failed to update ${type}:`, error);
    hideLoading(type);
    setButtonLoading(`${type}SaveBtn`, false);
    showToast(`❌ Failed to update ${type}`, "error");
  }
}

/**
 * Delete category
 */
async function deleteCategory(categoryId) {
  showPopup(
    "Delete Category",
    "Are you sure you want to delete this category?",
    "warning",
    async () => {
      try {
        const formData = new FormData();
        formData.append("delete", "1");
        formData.append("id", categoryId);

        const response = await fetch(`${API_BASE}/add_category.php`, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          showToast("✅ Category deleted successfully!", "success");
          loadCategories();
        } else {
          showToast("❌ " + data.message, "error");
        }
      } catch (error) {
        console.error("❌ Failed to delete category:", error);
        showToast("❌ Failed to delete category", "error");
      }
    }
  );
}

/**
 * View order
 */
function viewOrder(orderId) {
  showToast("📋 Order details view not implemented yet", "info");
}

/**
 * Delete blog
 */
async function deleteBlog(blogId) {
  showPopup(
    "Delete Blog",
    "Are you sure you want to delete this blog post? This action cannot be undone.",
    "warning",
    async () => {
      try {
        const formData = new FormData();
        formData.append("delete", "1");
        formData.append("id", blogId);

        const response = await fetch(`${API_BASE}/add_blog.php`, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          showToast("✅ Blog deleted successfully!", "success");
          loadBlogs();
        } else {
          showToast("❌ " + data.message, "error");
        }
      } catch (error) {
        console.error("❌ Failed to delete blog:", error);
        showToast("❌ Failed to delete blog", "error");
      }
    }
  );
}

/**
 * Get order status badge color
 */
function getOrderStatusBadge(status) {
  switch (status.toLowerCase()) {
    case "pending":
      return "warning";
    case "confirmed":
      return "info";
    case "shipped":
      return "primary";
    case "delivered":
      return "success";
    case "cancelled":
      return "danger";
    default:
      return "secondary";
  }
}

/**
 * Show loading state
 */
function showLoading(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    const loadingDiv = document.createElement("div");
    loadingDiv.id = `${sectionId}-loading`;
    loadingDiv.className = "text-center p-4";
    loadingDiv.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading...</p>
        `;
    section.appendChild(loadingDiv);
  }
}

/**
 * Hide loading state
 */
function hideLoading(sectionId) {
  const loadingDiv = document.getElementById(`${sectionId}-loading`);
  if (loadingDiv) {
    loadingDiv.remove();
  }
}

// createProductGallery moved to admin/js/product/utils.js

/**
 * Open image modal
 */
function openImageModal(productId, startIndex = 0) {
  const product = products.find((p) => p.id == productId);
  if (!product || !product.images || product.images.length === 0) {
    showToast("❌ No images found for this product", "error");
    return;
  }

  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("imageModalImg");
  const modalCounter = document.getElementById("imageModalCounter");
  const prevBtn = document.getElementById("imageModalPrev");
  const nextBtn = document.getElementById("imageModalNext");

  let currentIndex = startIndex;
  const totalImages = product.images.length;

  function updateModal() {
    const imageUrl = `https://gajendhrademo.brandmindz.com/routes/uploads/products/${product.images[currentIndex]}`;
    modalImg.src = imageUrl;
    modalImg.alt = `Product Image ${currentIndex + 1}`;
    modalCounter.textContent = `${currentIndex + 1} / ${totalImages}`;

    // Show/hide navigation buttons
    prevBtn.style.display = totalImages > 1 ? "flex" : "none";
    nextBtn.style.display = totalImages > 1 ? "flex" : "none";
  }

  // Navigation functions
  function showPrev() {
    currentIndex = currentIndex > 0 ? currentIndex - 1 : totalImages - 1;
    updateModal();
  }

  function showNext() {
    currentIndex = currentIndex < totalImages - 1 ? currentIndex + 1 : 0;
    updateModal();
  }

  // Event listeners
  prevBtn.onclick = showPrev;
  nextBtn.onclick = showNext;

  // Keyboard navigation
  const handleKeydown = (e) => {
    if (e.key === "ArrowLeft") showPrev();
    if (e.key === "ArrowRight") showNext();
    if (e.key === "Escape") closeImageModal();
  };

  document.addEventListener("keydown", handleKeydown);

  // Close modal
  const closeModal = () => {
    modal.classList.remove("show");
    document.removeEventListener("keydown", handleKeydown);
  };

  document.getElementById("imageModalClose").onclick = closeModal;
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  // Initialize and show modal
  updateModal();
  modal.classList.add("show");
}

/**
 * Close image modal
 */
function closeImageModal() {
  const modal = document.getElementById("imageModal");
  modal.classList.remove("show");
}

/**
 * Show popup modal
 */
function showPopup(title, message, type = "info", callback = null) {
  const modal = document.getElementById("popupModal");
  const titleEl = document.getElementById("popupTitle");
  const messageEl = document.getElementById("popupMessage");
  const iconEl = document.getElementById("popupIcon");
  const okBtn = document.getElementById("popupOk");
  const closeBtn = document.getElementById("popupClose");

  titleEl.textContent = title;
  messageEl.textContent = message;

  const iconMap = {
    success: "fas fa-check-circle",
    error: "fas fa-exclamation-circle",
    warning: "fas fa-exclamation-triangle",
    info: "fas fa-info-circle",
  };

  iconEl.className = `popup-icon ${type}`;
  iconEl.innerHTML = `<i class="${iconMap[type] || iconMap.info}"></i>`;

  modal.classList.add("show");

  // REMOVE old handlers (IMPORTANT FIX)
  okBtn.onclick = null;
  closeBtn.onclick = null;
  modal.onclick = null;

  // OK → run callback
  okBtn.onclick = () => {
    modal.classList.remove("show");
    if (callback) callback();
  };

  // CLOSE → just close, not callback
  const closeOnly = () => {
    modal.classList.remove("show");
  };

  closeBtn.onclick = closeOnly;

  // Backdrop click
  modal.onclick = (e) => {
    if (e.target === modal) closeOnly();
  };

  // Escape key
  const handleEscape = (e) => {
    if (e.key === "Escape") {
      closeOnly();
      document.removeEventListener("keydown", handleEscape);
    }
  };
  document.addEventListener("keydown", handleEscape);
}


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
    // Always ensure correct z-index
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



// handleProductSave and handleProductCancel moved to admin/js/product/edit.js


// Price variation functions moved to admin/js/product/utils.js

// Image upload functions moved to admin/js/product/utils.js


// loadPriceVariations moved to admin/js/product/utils.js





// enquiry

/**
 * Setup forms (Restored)
 */
// Duplicate setupForms removed


/**
 * Set button loading state
 * @param {string|HTMLElement} btn - Button ID or element
 * @param {boolean} isLoading - Loading state
 * @param {string} loadingText - Text to show while loading (default: "Loading...")
 */
function setButtonLoading(btn, isLoading, loadingText = "Loading...") {
  const button = typeof btn === 'string' ? document.getElementById(btn) : btn;
  if (!button) return;

  if (isLoading) {
    // Store original text if not already stored
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
window.setButtonLoading = setButtonLoading;
