const USER_ID = 1;
const API_BASE = "https://gajendhrademo.brandmindz.com/routes/auth/shop";

async function loadWishlist() {
    const grid = document.getElementById("wishlistGrid");
    grid.innerHTML = "";

    try {
        const res = await fetch(`${API_BASE}/wishlist.php?action=list&user_id=${USER_ID}`);
        const data = await res.json();

        if (!data.success || data.data.products.length === 0) {
            grid.innerHTML = `<p class="text-gray-500">No wishlist items</p>`;
            return;
        }

        data.data.products.forEach(p => {
            grid.innerHTML += `
            <div class="border rounded-xl p-4 relative">

                <!-- REMOVE -->
                <button onclick="removeWishlist(${p.product_id})"
                        class="absolute top-3 right-3 text-red-600 text-xl">
                    ♥
                </button>

                <img src="${p.images[0] || 'https://placehold.co/120x120'}"
                     class="mx-auto mb-3 w-28 h-28 object-contain" />

                <h4 class="font-medium">${p.name}</h4>

                <div class="text-sm mt-1">
                    <span class="font-semibold">Rs : ${p.price}</span>
                </div>

                <!-- QTY (STATIC FOR NOW) -->
                <div class="flex items-center gap-2 mt-3">
                    <button class="px-2 py-1 bg-gray-200 rounded">−</button>
                    <span class="w-6 text-center">1</span>
                    <button class="px-2 py-1 bg-black text-white rounded">+</button>
                </div>

                <div class="flex gap-2 mt-4">
                    <button class="flex-1 border border-orange-700 text-orange-700 py-2 rounded-lg text-sm">
                        Add to cart
                    </button>
                    <button class="flex-1 bg-orange-700 text-white py-2 rounded-lg text-sm">
                        Buy Now
                    </button>
                </div>
            </div>`;
        });

    } catch (err) {
        console.error("Wishlist load error", err);
    }
}
