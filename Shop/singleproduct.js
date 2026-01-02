let currentProduct = null;
const API_BASE = "https://gajendhrademo.brandmindz.com/routes/auth/shop";

/* =========================
   GET PRODUCT ID FROM URL
========================= */
const params = new URLSearchParams(window.location.search);
const productId = params.get("product_id");

if (!productId) {
    alert("Product not found");
}

/* =========================
   FETCH PRODUCT DATA
========================= */
async function loadProduct() {
    try {
        const res = await fetch(`${API_BASE}/get_product.php?product_id=${productId}`);
        const data = await res.json();

        if (!data.success) {
            alert("Product not found");
            return;
        }

        const p = data.product;
        currentProduct = p;

        /* ===== BASIC INFO ===== */
        document.getElementById("productTitle").innerText = p.name;
        document.getElementById("productPrice").innerText = `Rs : ${p.price}`;
        document.getElementById("productDescription").innerText = p.description;


        /* ===== MAIN IMAGE ===== */
        const mainImg = document.getElementById("mainProductImage");
        if (p.images_full.length) {
            mainImg.src = p.images_full[0];
        }

        /* ===== THUMBNAILS ===== */
        const thumbContainer = document.getElementById("thumbnailContainer");
        thumbContainer.innerHTML = "";

        p.images_full.forEach((img, i) => {
            thumbContainer.innerHTML += `
                <button onclick="changeMainImage('${img}')"
                    class="bg-white rounded-xl p-2 border ${i === 0 ? 'border-[#B06D36]' : 'border-transparent'} w-1/5 aspect-square">
                    <img src="${img}" class="w-full h-full object-contain">
                </button>
            `;
        });

        /* ===== VARIATIONS (WEIGHT) ===== */
        if (p.variations.length) {
            const weightWrap = document.querySelector("h3.opacity-80 + button").parentElement;
            weightWrap.innerHTML = `<h3 class="text-[#3E1C00] font-medium text-lg mb-3 opacity-80">Weight</h3>`;

            p.variations.forEach(v => {
                weightWrap.innerHTML += `
                    <button class="bg-[#A0522D] text-white px-6 py-2 rounded text-sm mr-2 mb-2">
                        ${v.label} - Rs ${v.amount}
                    </button>
                `;
            });
        }

        /* ===== TASTE SEGMENTS ===== */
        const featureGrid = document.getElementById("tasteGrid");
        featureGrid.innerHTML = "";

        p.taste_segments.forEach(t => {
            featureGrid.innerHTML += `
                <div class="flex items-start gap-4">
                    <img src="${t.icon_url}" class="w-8 h-8 object-contain">
                    <div>
                        <h4 class="font-bold text-[#3E1C00] text-lg">${t.title}</h4>
                        <p class="text-[#3E1C00] text-sm opacity-80">${t.description}</p>
                    </div>
                </div>
            `;
        });

    } catch (err) {
        console.error(err);
    }
}

/* =========================
   IMAGE SWITCH
========================= */
function changeMainImage(src) {
    document.querySelector(".lg\\:h-\\[500px\\]").src = src;
}


/* =========================
   CHECKOUT POPUP INTEGRATION
========================= */
function updateAndOpenCheckout() {
    if (!currentProduct) return;

    // Get current quantity from the counter on the page
    // Note: The UI has a counter but it's not hooked up to a variable yet in the original script.
    // Finding the quantity element in the DOM based on its position in Singleproduct.html
    const qtyElement = document.querySelector(".w-12.h-10.bg-white.border-y.border-\\[#D6D6D6\\]");
    const qty = qtyElement ? parseInt(qtyElement.innerText) : 1;

    // Populate Checkout Popup
    const checkoutImage = document.getElementById("checkoutProductImage");
    const checkoutTitle = document.getElementById("checkoutProductTitle");
    const checkoutQtyHeader = document.getElementById("checkoutProductQtyHeader");
    const checkoutPrice = document.getElementById("checkoutProductPrice");
    const checkoutQty = document.getElementById("checkoutProductQty");
    const checkoutSummaryTotal = document.getElementById("checkoutSummaryTotal");
    const checkoutSummaryOrder = document.getElementById("checkoutSummaryOrder");

    if (checkoutImage && currentProduct.images_full.length) {
        checkoutImage.src = currentProduct.images_full[0];
    }
    if (checkoutTitle) checkoutTitle.innerText = currentProduct.name;
    if (checkoutQtyHeader) checkoutQtyHeader.innerText = `Qty: ${qty}`;
    if (checkoutQty) checkoutQty.innerText = qty;

    if (checkoutPrice) checkoutPrice.innerText = `Rs : ${currentProduct.price}`;

    const totalPrice = (parseFloat(currentProduct.price) * qty).toFixed(2);
    if (checkoutSummaryTotal) checkoutSummaryTotal.innerText = `Rs: ${totalPrice}`;
    if (checkoutSummaryOrder) checkoutSummaryOrder.innerText = `Rs: ${totalPrice}`;

    // Open the checkout popup (function defined in popups.js)
    if (typeof openCheckout === "function") {
        openCheckout();
    } else {
        console.error("openCheckout function not found. Make sure popups.js is loaded.");
    }
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", loadProduct);
