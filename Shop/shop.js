console.log("shop.js loaded");
const SHOP_ID = 1; // change if needed
const API_BASE = "https://gajendhrademo.brandmindz.com/routes/auth/shop";
const USER_ID = 1; // TEMP – replace with logged-in user id
const WISHLIST_API = `${API_BASE}/wishlist.php`;

let currentCategory = null;
let currentSubcategory = null;
let currentPage = 1;
const limit = 9;

/* =========================
   FETCH CATEGORIES
========================= */
async function loadCategories() {
    try {
        const res = await fetch(`${API_BASE}/get_categories.php?shop_id=${SHOP_ID}`);
        const data = await res.json();

        if (!data.success) return;

        const sidebar = document.getElementById("categorySidebar");
        sidebar.innerHTML = "";

        data.categories.forEach(cat => {
            const catDiv = document.createElement("div");
            catDiv.className = "group";

            catDiv.innerHTML = `
                <div class="flex items-center gap-3 cursor-pointer mb-2"
                     onclick="toggleSubcategories(${cat.id}, this)">
                    <span class="w-6 h-6 rounded-full bg-[#8B4513] block"></span>
                    <span class="text-lg font-semibold text-[#3E1C00]">${cat.name}</span>
                </div>

                <div class="pl-9 space-y-3 relative hidden" id="subcat-${cat.id}">
                    <p class="text-sm text-gray-400">Loading...</p>
                </div>
            `;

            sidebar.appendChild(catDiv);
        });

    } catch (err) {
        console.error("Category load error:", err);
    }
}

async function toggleSubcategories(categoryId, el) {

    // Apply category filter immediately
    filterByCategory(categoryId);

    const subContainer = document.getElementById(`subcat-${categoryId}`);

    // Toggle visibility
    subContainer.classList.toggle("hidden");

    // If already loaded, don’t fetch again
    if (subContainer.dataset.loaded === "true") return;

    try {
        const res = await fetch(
            `${API_BASE}/get_subcategories.php?shop_id=${SHOP_ID}&category_id=${categoryId}`
        );
        const data = await res.json();

        if (!data.success) {
            subContainer.innerHTML = `<p class="text-sm text-red-500">No subcategories</p>`;
            return;
        }

        if (data.subcategories.length === 0) {
            subContainer.innerHTML = `<p class="text-sm text-gray-400">No subcategories</p>`;
            return;
        }

        subContainer.innerHTML = data.subcategories.map(sub => `
            <label class="flex items-center gap-3 cursor-pointer"
                   onclick="filterBySubcategory(${categoryId}, ${sub.id})">
                <div class="w-5 h-5 rounded-full border-2 border-[#5D3420]"></div>
                <span class="text-[#5D3420] text-sm">${sub.name}</span>
            </label>
        `).join("");

        subContainer.dataset.loaded = "true";

    } catch (err) {
        console.error("Subcategory load error:", err);
        subContainer.innerHTML = `<p class="text-sm text-red-500">Error loading</p>`;
    }
}


/* =========================
   FETCH PRODUCTS
========================= */
async function loadProducts() {
    let url = `${API_BASE}/get_products.php?page=${currentPage}&limit=${limit}`;

    if (currentCategory) url += `&category_id=${currentCategory}`;
    if (currentSubcategory) url += `&subcategory_id=${currentSubcategory}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        const grid = document.getElementById("productGrid");
        grid.innerHTML = "";

        if (!data.success || data.products.length === 0) {
            grid.innerHTML = `<p class="text-center col-span-3 text-[#3E1C00]">No products found</p>`;
            return;
        }

        data.products.forEach(p => {
            grid.innerHTML += `
    <div
      class="bg-white rounded-lg p-4 shadow-sm hover:shadow-md
             transition-shadow group hover:-translate-y-2 
             transition-all duration-300">

      <!-- Image Container -->
      <div
        class="relative h-64 w-full mb-4 bg-[#F9F9F9] rounded-lg
               overflow-hidden flex items-center justify-center">

        <!-- Wishlist Heart -->
        <div
          onclick="toggleWishlist(this, ${p.id})"
          class="absolute top-3 right-3 z-10 w-8 h-8 md:w-9 md:h-9
                 bg-white rounded-full flex items-center justify-center
                 shadow-md cursor-pointer hover:bg-gray-50
                 text-[#8B4513] transition-colors">

          <svg xmlns="http://www.w3.org/2000/svg"
               class="h-5 w-5"
               fill="none"
               viewBox="0 0 24 24"
               stroke="currentColor"
               stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636
                 l1.318-1.318a4.5 4.5 0 116.364 6.364
                 L12 21.364 4.318 12.682a4.5 4.5 0
                 010-6.364z" />
          </svg>
        </div>

        <img src="${p.images[0] || 'https://placehold.co/300x300'}"
             alt="${p.name}"
             class="h-full object-contain">
      </div>

      <!-- Content -->
      <div class="space-y-2">
        <h3 class="text-xl font-bold text-[#3E1C00]">${p.name}</h3>

        <div class="flex items-center gap-2">
          <span class="text-[#B06D36] font-bold text-lg">
            Rs. ${p.price}
          </span>
        </div>

        <!-- Stars -->
        <div class="flex text-yellow-400 text-sm">
          <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
        </div>

        <!-- Buttons -->
        <div class="flex gap-3 pt-2">
          <button
            onclick="goToProduct(${p.id})"
            class="flex-1 bg-[#B06D36] text-white py-2
                   rounded font-medium text-sm
                   hover:bg-[#8B4513] transition-colors">
            Shop Now
          </button>

          <button
            class="flex-1 border border-[#B06D36]
                   text-[#B06D36] py-2 rounded
                   font-medium text-sm
                   hover:bg-[#FFF8F0] transition-colors">
            Add to cart
          </button>
        </div>
      </div>
    </div>
    `;
        });


    } catch (err) {
        console.error("Product load error:", err);
    }
}

async function toggleWishlist(el, productId) {
    const isActive = el.classList.contains("text-red-600");

    el.classList.toggle("text-red-600");
    el.classList.toggle("text-[#8B4513]");

    const action = isActive ? "remove" : "add";

    try {
        const res = await fetch(`${WISHLIST_API}?action=${action}`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                user_id: USER_ID,
                product_id: productId
            })
        });

        const data = await res.json();
        console.log("Wishlist:", data.message);

    } catch (err) {
        console.error("Wishlist error", err);
    }
}

async function removeWishlist(productId) {
    await fetch(`${API_BASE}/wishlist.php?action=remove`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            user_id: USER_ID,
            product_id: productId
        })
    });

    loadWishlist(); // refresh UI
}


/* =========================
   FILTER HANDLERS
========================= */
function filterByCategory(catId) {
    currentCategory = catId;
    currentSubcategory = null;
    currentPage = 1;
    loadProducts();
}

function filterBySubcategory(catId, subId) {
    currentCategory = catId;
    currentSubcategory = subId;
    currentPage = 1;
    loadProducts();
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
    loadCategories();
    loadProducts();
});



function goToProduct(productId) {
    window.location.href = `/shop/singleproduct.html?product_id=${productId}`;
}

