/**
 * Admin Category Management Logic
 */

/**
 * Load categories
 */
async function loadCategories() {
    try {
        if (typeof showLoading === 'function') showLoading("categories");

        const response = await fetch(`${API_BASE}/get_categories.php`);
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

        if (!list) return;
        list.innerHTML = "";

        if (data.success && data.categories.length > 0) {
            // SAVE to global
            window.categories = data.categories;

            // UPDATE COUNT
            if (countBadge) countBadge.textContent = `${window.categories.length} categories`;

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
              <button class="btn btn-sm btn-outline-primary" onclick="editCategory(${cat.id})">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory(${cat.id})">
                <i class="fas fa-trash"></i>
              </button>
              <button class="btn btn-sm btn-outline-primary" onclick="openSubcategoryModal(${cat.id}, '${cat.name.replace(/'/g, "\\'")}')">
                <i class="fas fa-sitemap"></i>
              </button>
            </div>
          </div>
        `;
            });
        } else {
            if (countBadge) countBadge.textContent = `0 categories`;
            list.innerHTML = `
        <div class="text-center p-4">
            <i class="fas fa-folder fa-3x text-muted mb-3"></i>
            <h5>No categories yet</h5>
            <p class="text-muted">Add your first category to get started!</p>
        </div>
      `;
        }

        if (typeof hideLoading === 'function') hideLoading("categories");
    } catch (error) {
        console.error("❌ Failed to load categories:", error);
        if (typeof hideLoading === 'function') hideLoading("categories");
        if (typeof showToast === 'function') showToast("❌ Failed to load categories", "error");
    }
}

/**
 * Handle category form submission
 */
async function handleCategorySubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append("shop_id", currentShop.id);

    try {
        if (typeof showLoading === 'function') showLoading("categories");
        if (typeof setButtonLoading === 'function') setButtonLoading("categorySubmitBtn", true, "Adding...");

        const response = await fetch(`${API_BASE}/add_category.php`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        if (typeof hideLoading === 'function') hideLoading("categories");
        if (typeof setButtonLoading === 'function') setButtonLoading("categorySubmitBtn", false);

        if (data.success) {
            if (typeof showToast === 'function') showToast("✅ Category added successfully!", "success");
            e.target.reset();
            const previewContainer = document.getElementById("catImagePreviewContainer");
            if (previewContainer) previewContainer.style.display = "none";
            loadCategories();
        } else {
            if (typeof showToast === 'function') showToast("❌ " + data.message, "error");
        }
    } catch (error) {
        console.error("❌ Failed to add category:", error);
        if (typeof hideLoading === 'function') hideLoading("categories");
        if (typeof setButtonLoading === 'function') setButtonLoading("categorySubmitBtn", false);
        if (typeof showToast === 'function') showToast("❌ Failed to add category", "error");
    }
}

/**
 * Edit category
 */
function editCategory(categoryId) {
    const category = (window.categories || []).find((c) => c.id == categoryId);
    if (!category) {
        if (typeof showToast === 'function') showToast("❌ Category not found", "error");
        return;
    }

    document.getElementById("catId").value = category.id;
    document.getElementById("catName").value = category.name;
    document.getElementById("catSlug").value = category.slug;

    if (document.getElementById("catImage")) document.getElementById("catImage").value = "";

    const preview = document.getElementById("catImagePreview");
    const previewContainer = document.getElementById("catImagePreviewContainer");
    if (category.image) {
        if (preview) preview.src = `https://gajendhrademo.brandmindz.com/uploads/categories/${category.image}`;
        if (previewContainer) previewContainer.style.display = "block";
    } else {
        if (previewContainer) previewContainer.style.display = "none";
    }

    const showInMenu = category.show_in_menu == 1 ? "menuYes" : "menuNo";
    const showInFilter = category.show_in_filter == 1 ? "filterYes" : "filterNo";
    if (document.getElementById(showInMenu)) document.getElementById(showInMenu).checked = true;
    if (document.getElementById(showInFilter)) document.getElementById(showInFilter).checked = true;

    if (typeof switchToEditMode === 'function') switchToEditMode("category");
    document.getElementById("categories").scrollIntoView({ behavior: "smooth" });
}

/**
 * Save Category Edit
 */
async function saveCategoryEdit() {
    const id = document.getElementById("catId").value;
    const name = document.getElementById("catName").value.trim();
    const slug = document.getElementById("catSlug").value.trim();
    const imageInput = document.getElementById("catImage");
    const showInMenu = document.querySelector('input[name="show_in_menu"]:checked')?.value || '1';
    const showInFilter = document.querySelector('input[name="show_in_filter"]:checked')?.value || '1';

    if (!id || !name || !slug) {
        showToast("Please fill all required fields", "error");
        return;
    }

    if (!window.currentShop || !window.currentShop.id) {
        showToast("Shop context not found. Please refresh the page.", "error");
        return;
    }

    try {
        const formData = new FormData();
        formData.append("id", id);
        formData.append("edit", "1"); // Tell backend this is an UPDATE operation
        formData.append("shop_id", window.currentShop.id);
        formData.append("name", name);
        formData.append("slug", slug);
        formData.append("show_in_menu", showInMenu);
        formData.append("show_in_filter", showInFilter);

        if (imageInput && imageInput.files && imageInput.files[0]) {
            formData.append("image", imageInput.files[0]);
        }

        const response = await fetch(`${API_BASE}/add_category.php`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        if (data.success) {
            showToast("✅ Category updated successfully!", "success");
            if (typeof switchToAddMode === 'function') switchToAddMode("category");
            loadCategories();
        } else {
            showToast("❌ " + data.message, "error");
        }
    } catch (error) {
        console.error("❌ Failed to update category:", error);
        showToast("❌ Failed to update category", "error");
    }
}

/**
 * Delete category
 */
async function deleteCategory(categoryId) {
    showConfirm(
        "Delete Category",
        "Are you sure you want to delete this category? All subcategories will also be affected.",
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
 * Subcategory Modal & List
 */
function openSubcategoryModal(categoryId, categoryName) {
    document.getElementById("subcatCategoryId").value = categoryId;
    const titleEl = document.getElementById("subcatCategoryTitle");
    if (titleEl) titleEl.textContent = "Category: " + categoryName;

    document.getElementById("subcatName").value = "";
    document.getElementById("subcatSlug").value = "";

    if (document.getElementById("subMenuYes")) document.getElementById("subMenuYes").checked = true;
    if (document.getElementById("subFilterYes")) document.getElementById("subFilterYes").checked = true;

    loadSubcategoryList(categoryId);
    const modal = new bootstrap.Modal(document.getElementById("subcategoryModal"));
    modal.show();
}

async function loadSubcategoryList(categoryId) {
    const list = document.getElementById("subcatList");
    if (!list) return;

    list.innerHTML = `<div class="text-center p-3"><div class="spinner-border text-primary"></div><p class="mt-2">Loading...</p></div>`;

    try {
        const response = await fetch(`${API_BASE}/get_subcategories.php?category_id=${categoryId}`);
        const data = await response.json();

        if (!data.success || data.subcategories.length === 0) {
            list.innerHTML = `<div class="text-center p-3"><i class="fas fa-sitemap fa-2x text-muted mb-2"></i><p class="text-muted">No subcategories found</p></div>`;
            return;
        }

        let html = "";
        data.subcategories.forEach((sub) => {
            html += `
        <div class="d-flex justify-content-between align-items-center p-2 border-bottom">
          <div>
            <strong>${sub.name}</strong><br>
            <small class="text-muted">Slug: ${sub.slug}</small>
          </div>
          <div>
            <button class="btn btn-sm btn-outline-primary me-2" onclick='editSubcategory(${sub.id}, ${JSON.stringify(sub.name)}, ${JSON.stringify(sub.slug)}, ${categoryId}, ${sub.show_in_menu}, ${sub.show_in_filter})'>
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteSubcategory(${sub.id}, ${categoryId})">
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

/**
 * Handle Subcategory Add
 */
async function handleSubcategorySubmit() {
    const categoryId = document.getElementById("subcatCategoryId").value;
    const name = document.getElementById("subcatName").value.trim();
    const slug = document.getElementById("subcatSlug").value.trim();
    const showInMenu = document.querySelector('input[name="sub_show_in_menu"]:checked')?.value || '1';
    const showInFilter = document.querySelector('input[name="sub_show_in_filter"]:checked')?.value || '1';

    if (!name || !slug) {
        showToast("Please fill all required fields", "error");
        return;
    }

    if (!window.currentShop || !window.currentShop.id) {
        showToast("Shop context not found. Please refresh the page.", "error");
        return;
    }

    try {
        const formData = new FormData();
        formData.append("shop_id", window.currentShop.id);
        formData.append("category_id", categoryId);
        formData.append("name", name);
        formData.append("slug", slug);
        formData.append("sub_show_in_menu", showInMenu);
        formData.append("sub_show_in_filter", showInFilter);

        const response = await fetch(`${API_BASE}/add_subcategory.php`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        if (data.success) {
            showToast("✅ Subcategory added successfully!", "success");
            document.getElementById("subcatName").value = "";
            document.getElementById("subcatSlug").value = "";
            loadSubcategoryList(categoryId);
        } else {
            showToast("❌ " + data.message, "error");
        }
    } catch (error) {
        console.error("❌ Failed to add subcategory:", error);
        showToast("❌ Failed to add subcategory", "error");
    }
}

/**
 * Handle Subcategory Update
 */
async function saveSubcategoryEdit() {
    const id = document.getElementById("subcatId").value;
    const categoryId = document.getElementById("subcatCategoryId").value;
    const name = document.getElementById("subcatName").value.trim();
    const slug = document.getElementById("subcatSlug").value.trim();
    const showInMenu = document.querySelector('input[name="sub_show_in_menu"]:checked')?.value || '1';
    const showInFilter = document.querySelector('input[name="sub_show_in_filter"]:checked')?.value || '1';

    if (!id || !name || !slug) {
        showToast("Please fill all required fields", "error");
        return;
    }

    try {
        const formData = new FormData();
        formData.append("id", id);
        formData.append("category_id", categoryId);
        formData.append("name", name);
        formData.append("slug", slug);
        formData.append("sub_show_in_menu", showInMenu);
        formData.append("sub_show_in_filter", showInFilter);

        const response = await fetch(`${API_BASE}/update_subcategory.php`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        if (data.success) {
            showToast("✅ Subcategory updated successfully!", "success");
            resetSubcatEditMode();
            loadSubcategoryList(categoryId);
        } else {
            showToast("❌ " + data.message, "error");
        }
    } catch (error) {
        console.error("❌ Failed to update subcategory:", error);
        showToast("❌ Failed to update subcategory", "error");
    }
}

async function deleteSubcategory(id, categoryId) {
    showConfirm(
        "Delete Subcategory",
        "Are you sure you want to delete this subcategory?",
        async () => {
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
                    loadSubcategoryList(categoryId);
                } else {
                    showToast(data.message || "Cannot delete subcategory", "error");
                }
            } catch (error) {
                console.error("❌ Subcategory delete error:", error);
                showToast("Error deleting subcategory", "error");
            }
        }
    );
}

function editSubcategory(id, name, slug, categoryId, showInMenu = 1, showInFilter = 1) {
    document.getElementById("subcatId").value = id;
    document.getElementById("subcatName").value = name;
    document.getElementById("subcatSlug").value = slug;

    if (showInMenu == 1) document.getElementById("subMenuYes").checked = true;
    else document.getElementById("subMenuNo").checked = true;

    if (showInFilter == 1) document.getElementById("subFilterYes").checked = true;
    else document.getElementById("subFilterNo").checked = true;

    document.getElementById("subcatAddBtn").style.display = "none";
    document.getElementById("subcatEditControls").style.display = "flex";
    document.getElementById("subcatForm").scrollIntoView({ behavior: "smooth" });
}

function resetSubcatEditMode() {
    const subcatId = document.getElementById("subcatId");
    if (subcatId) subcatId.value = "";

    document.getElementById("subcatName").value = "";
    document.getElementById("subcatSlug").value = "";

    const addBtn = document.getElementById("subcatAddBtn");
    const editControls = document.getElementById("subcatEditControls");
    if (addBtn) addBtn.style.display = "block";
    if (editControls) editControls.style.display = "none";
}

// Attach to window
window.loadCategories = loadCategories;
window.handleCategorySubmit = handleCategorySubmit;
window.saveCategoryEdit = saveCategoryEdit;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
window.openSubcategoryModal = openSubcategoryModal;
window.handleSubcategorySubmit = handleSubcategorySubmit;
window.saveSubcategoryEdit = saveSubcategoryEdit;
window.editSubcategory = editSubcategory;
window.deleteSubcategory = deleteSubcategory;
window.resetSubcatEditMode = resetSubcatEditMode;
window.loadSubcategoryList = loadSubcategoryList;
