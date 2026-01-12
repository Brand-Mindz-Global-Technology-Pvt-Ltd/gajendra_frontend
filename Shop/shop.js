console.log("shop.js loaded");
const SHOP_ID = 1; // change if needed
const API_BASE = "https://gajendhrademo.brandmindz.com/routes/auth/shop";
const USER_ID = 1; // TEMP – replace with logged-in user id
const WISHLIST_API = `${API_BASE}/wishlist.php`;

let currentCategory = null;
let currentSubcategory = null;
let currentSearch = null;
let currentPage = 1;
const limit = 9;
let minPrice = null;
let maxPrice = null;

/* =========================
   FETCH CATEGORIES
========================= */
async function loadCategories() {
    try {
        const res = await fetch(`${API_BASE}/get_categories.php`);
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

            // Auto-expand if active from URL (by ID or Slug)
            const urlParams = new URLSearchParams(window.location.search);
            const catId = urlParams.get('category_id');
            const catSlug = urlParams.get('category');

            if ((catId && catId == cat.id) || (catSlug && catSlug === cat.slug)) {
                currentCategory = cat.id; // Ensure we have the ID for following filters
                const headerEl = catDiv.querySelector('.flex');
                toggleSubcategories(cat.id, headerEl, true);
            }
        });

    } catch (err) {
        console.error("Category load error:", err);
    }
}

async function toggleSubcategories(categoryId, el, skipFilter = false) {

    // Apply category filter immediately (only if not skipFilter)
    if (!skipFilter) {
        filterByCategory(categoryId);
    }

    const subContainer = document.getElementById(`subcat-${categoryId}`);

    // Toggle visibility
    subContainer.classList.toggle("hidden");

    // If already loaded, don’t fetch again
    if (subContainer.dataset.loaded === "true") return;

    try {
        const res = await fetch(
            `${API_BASE}/get_subcategories.php?category_id=${categoryId}`
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

        subContainer.innerHTML = data.subcategories.map(sub => {
            const isActive = currentSubcategory && currentSubcategory == sub.id;
            const circleClass = isActive ? "bg-[#5D3420]" : "";
            const fontClass = isActive ? "font-bold" : "";

            return `
            <label class="flex items-center gap-3 cursor-pointer ${fontClass}"
                   onclick="filterBySubcategory(${categoryId}, ${sub.id})">
                <div class="w-5 h-5 rounded-full border-2 border-[#5D3420] ${circleClass}"></div>
                <span class="text-[#5D3420] text-sm">${sub.name}</span>
            </label>
        `;
        }).join("");

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
    // Using get_products.php as it handles filtering by category and price correctly
    let url = `${API_BASE}/get_products.php?page=${currentPage}&limit=${limit}`;

    if (currentCategory) url += `&category_id=${currentCategory}`;
    if (currentSubcategory) url += `&subcategory_id=${currentSubcategory}`;
    if (currentSearch) url += `&search=${encodeURIComponent(currentSearch)}`;
    if (minPrice !== null) url += `&min_price=${minPrice}`;
    if (maxPrice !== null) url += `&max_price=${maxPrice}`;

    const params = new URLSearchParams();
    if (currentCategory) params.set('category_id', currentCategory);
    if (currentSubcategory) params.set('subcategory_id', currentSubcategory);
    if (currentSearch) params.set('search', currentSearch);
    if (minPrice !== null) params.set('min_price', minPrice);
    if (maxPrice !== null) params.set('max_price', maxPrice);

    const newUrl = window.location.pathname + '?' + params.toString();
    window.history.pushState({ path: newUrl }, '', newUrl);

    try {
        console.log(`📡 Fetching products: ${url}`);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        console.log("📦 API Response Data:", data);

        const grid = document.getElementById("productGrid");
        grid.innerHTML = "";

        if (!data.status || !data.products || data.products.length === 0) {
            grid.innerHTML = `<div class="col-span-full text-center py-10">
                <p class="text-[#3E1C00] text-lg font-medium">No products found</p>
                <p class="text-gray-500 text-sm mt-2">Try adjusting your filters or search criteria</p>
            </div>`;

            // Update results count
            const resultText = document.querySelector('main p.text-sm');
            if (resultText) resultText.innerText = "Showing 0 results";

            return;
        }

        // Update results count
        const start = ((currentPage - 1) * limit) + 1;
        const end = start + data.products.length - 1;
        const resultText = document.querySelector('main p.text-sm');
        if (resultText) {
            resultText.innerText = `Showing ${start}-${end} of ${data.total} results`;
        }

        data.products.forEach(p => {
            // Determine display price: base price (which is unset in get_products.php) OR first variation amount
            const variations = typeof p.variations === 'string' ? JSON.parse(p.variations) : p.variations;
            const displayPrice = (variations && variations.length > 0) ? variations[0].amount : 'N/A';

            // Handle images - check if images is a string or array
            let images = p.images;
            if (typeof images === 'string') {
                try {
                    images = JSON.parse(images);
                } catch (e) {
                    images = images.split(',').map(img => img.trim());
                }
            }

            const productImage = (images && images.length > 0 && images[0] !== '__EMPTY__') ? images[0] : null;

            // Construct absolute image URL
            const imageBaseURL = "https://gajendhrademo.brandmindz.com/routes/uploads/products/";
            const imageUrl = productImage
                ? (productImage.startsWith('http') ? productImage : imageBaseURL + productImage)
                : 'https://placehold.co/300x300/FDF5ED/DAA520?text=' + encodeURIComponent(p.name);

            grid.innerHTML += `
    <div
      class="bg-white rounded-lg p-4 shadow-sm hover:shadow-md
             transition-shadow group hover:-translate-y-2 
             transition-all duration-300 flex flex-col h-full">

      <!-- Image Container -->
      <div
        class="relative h-64 w-full mb-4 bg-[#F9F9F9] rounded-lg
               overflow-hidden flex items-center justify-center p-4">

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

        <img src="${imageUrl}"
             alt="${p.name}"
             class="h-full w-full object-contain group-hover:scale-105 transition-transform duration-500"
             onerror="this.src='https://placehold.co/300x300/FDF5ED/DAA520?text=${encodeURIComponent(p.name)}'">
      </div>

      <!-- Content -->
      <div class="space-y-2 flex-grow flex flex-col">
        <h3 class="text-xl font-bold text-[#3E1C00] line-clamp-1">${p.name}</h3>

        <div class="flex items-center gap-2">
          <span class="text-[#B06D36] font-bold text-lg">
            Rs. ${displayPrice}
          </span>
        </div>

        <!-- Stars -->
        <div class="flex text-yellow-500 text-sm">
          <span>★</span><span>★</span><span>★</span><span>★</span><span class="text-gray-300">★</span>
        </div>

        <!-- Buttons -->
        <div class="flex gap-3 pt-2 mt-auto">
          <button
            onclick="goToProduct(${p.id})"
            class="flex-1 bg-[#B06D36] text-white py-2
                   rounded font-medium text-sm
                   hover:bg-[#8B4513] transition-colors">
            Shop Now
          </button>

          <button
            onclick="addToCart({
                id: ${p.id},
                name: '${p.name.replace(/'/g, "\\'")}', 
                price: ${p.price},
                image: '${p.images[0] || 'https://placehold.co/300x300'}'
            })"
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

    // UI Highlighting for subcategories
    const allLabels = document.querySelectorAll(`[id^="subcat-"] label`);
    allLabels.forEach(label => {
        const circle = label.querySelector('div');
        if (circle) {
            circle.classList.remove('bg-[#5D3420]');
        }
        label.classList.remove('font-bold');
    });

    // Find the clicked label using the subId
    // Since we generate these dynamically, we'll look for labels with onclick containing subId
    const activeLabel = Array.from(allLabels).find(l => l.getAttribute('onclick')?.includes(`, ${subId})`));
    if (activeLabel) {
        const circle = activeLabel.querySelector('div');
        if (circle) circle.classList.add('bg-[#5D3420]');
        activeLabel.classList.add('font-bold');
    }

    currentPage = 1;
    loadProducts();
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const catId = urlParams.get('category_id');
    const catSlug = urlParams.get('category');
    const subId = urlParams.get('subcategory_id');
    const search = urlParams.get('search');
    const min = urlParams.get('min_price');
    const max = urlParams.get('max_price');

    // We'll set currentCategory later in loadCategories if it matches a slug
    if (catId) currentCategory = catId;

    if (subId) {
        currentSubcategory = subId;
        console.log("📍 Subcategory ID from URL:", subId);
    }
    if (search) {
        currentSearch = search;
        console.log("🔍 Search from URL:", search);
    }
    if (min && max) {
        minPrice = parseInt(min);
        maxPrice = parseInt(max);
        console.log(`💰 Price filter from URL: ${min} - ${max}`);
    }

    loadCategories();
    loadProducts();
});


/* =========================
   PRICE SLIDER LOGIC
========================= */
let sliderOne = null;
let sliderTwo = null;
let minGap = 0;
let sliderTrack = null;
let maxVal = 5000;

document.addEventListener("DOMContentLoaded", () => {
    sliderOne = document.getElementById("slider-1");
    sliderTwo = document.getElementById("slider-2");
    sliderTrack = document.getElementById("sliderTrack");
    if (sliderOne && sliderTwo) {
        fillColor();
    }
});

function slideOne() {
    if (parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap) {
        sliderOne.value = parseInt(sliderTwo.value) - minGap;
    }
    document.getElementById("minPriceInput").value = sliderOne.value;
    fillColor();
}

function slideTwo() {
    if (parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap) {
        sliderTwo.value = parseInt(sliderOne.value) + minGap;
    }
    document.getElementById("maxPriceInput").value = sliderTwo.value;
    fillColor();
}

function fillColor() {
    const percent1 = (sliderOne.value / maxVal) * 100;
    const percent2 = (sliderTwo.value / maxVal) * 100;
    sliderTrack.style.background = `linear-gradient(to right, #D4B896 ${percent1}% , #8B4513 ${percent1}% , #8B4513 ${percent2}%, #D4B896 ${percent2}%)`;
}

function updateSliderFromInputs() {
    const minVal = parseInt(document.getElementById("minPriceInput").value);
    const maxValInput = parseInt(document.getElementById("maxPriceInput").value);

    if (minVal >= 0 && maxValInput <= maxVal && minVal < maxValInput) {
        sliderOne.value = minVal;
        sliderTwo.value = maxValInput;
        fillColor();
    }
}

function applyManualPrice() {
    minPrice = parseInt(sliderOne.value);
    maxPrice = parseInt(sliderTwo.value);
    currentPage = 1;
    loadProducts();
}

// Re-using the initialized sliders if needed in other functions
function filterByPrice(min, max) {
    minPrice = min;
    maxPrice = max;

    if (sliderOne && sliderTwo) {
        sliderOne.value = min;
        sliderTwo.value = max;
        document.getElementById("minPriceInput").value = min;
        document.getElementById("maxPriceInput").value = max;
        fillColor();
    }

    currentPage = 1;
    loadProducts();
}



function filterBySearch(query) {
    currentSearch = query;
    currentPage = 1;
    loadProducts();
}


function goToProduct(productId) {
    window.location.href = `/shop/singleproduct.html?product_id=${productId}`;
}

