// Cart Start
let cart = JSON.parse(localStorage.getItem('gajendra_cart') || '[]');

document.addEventListener("DOMContentLoaded", () => {
    // Load Cart
    fetch("../components/cart.html")
        .then(res => res.text())
        .then(html => {
            document.body.insertAdjacentHTML("beforeend", html);
            updateCartBadge();
        });
});

function openCart() {
    const overlay = document.getElementById("cartOverlay");
    if (overlay) {
        renderCart();
        overlay.classList.remove("hidden");
    }
}

function closeCart() {
    document.getElementById("cartOverlay")?.classList.add("hidden");
}

function updateCartBadge() {
    // Placeholder for if there's a badge to update in the header in the future
    // For now, we just ensure data is saved
    localStorage.setItem('gajendra_cart', JSON.stringify(cart));
}

function addToCart(product) {
    const existing = cart.find(item => item.id == product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCartBadge();
    openCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartBadge();
    renderCart();
}

function updateQuantity(index, change) {
    if (cart[index]) {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        updateCartBadge();
        renderCart();
    }
}

function renderCart() {
    const container = document.querySelector("#cartOverlay .overflow-y-auto");
    const summaryContainer = document.querySelector("#cartOverlay .bg-white.w-full.md\\:w-80"); // Right side summary

    // Safety check if HTML isn't loaded yet
    if (!container) return;

    // Clear list (except the first child if it's not an item? No, innerHTML clears all)
    container.innerHTML = "";

    let subtotal = 0;

    if (cart.length === 0) {
        container.innerHTML = `<div class="text-center p-10 text-gray-500">Your cart is empty</div>`;
    } else {
        cart.forEach((item, index) => {
            subtotal += item.price * item.quantity;
            container.innerHTML += `
                <div class="flex items-center gap-4 p-4 border rounded-xl">
                    <img src="${item.image}" class="w-20 h-20 rounded object-cover" />

                    <div class="flex-1">
                        <h4 class="font-medium text-[#3E1C00]">${item.name}</h4>
                        <p class="text-sm text-gray-500">Rs : ${item.price}</p>
                    </div>

                    <div class="flex items-center gap-2">
                        <button onclick="updateQuantity(${index}, -1)" class="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">−</button>
                        <span class="w-6 text-center font-medium">${item.quantity}</span>
                        <button onclick="updateQuantity(${index}, 1)" class="px-2 py-1 bg-[#5D3420] text-white rounded hover:bg-[#3E1C00]">+</button>
                    </div>

                    <button onclick="removeFromCart(${index})" class="text-red-500 ml-2 hover:text-red-700">
                        🗑️
                    </button>
                </div>
            `;
        });
    }

    // Update Header Text to show count
    const headerTitle = document.querySelector("#cartOverlay h2");
    const headerCount = document.querySelector("#cartOverlay p.text-sm");
    if (headerCount) {
        headerCount.innerText = `You have ${cart.length} item${cart.length !== 1 ? 's' : ''} in your cart`;
    }

    // Update Summary
    // We need to find the specific elements within the summary container or rebuild it.
    // The existing HTML has specific structure. Let's try to target data inside it if possible, or easiest: rebuild the summary logic.
    // Looking at cart.html structure: 
    // Order Summary -> flex justify-between (Order) -> flex justify-between (Delivery) -> hr -> flex justify-between (Total)

    const summaryDivs = document.querySelectorAll("#cartOverlay .w-full.md\\:w-80 .flex.justify-between span:last-child");
    if (summaryDivs.length >= 3) {
        // 0: Order (Subtotal)
        // 1: Delivery
        // 2: Total
        const delivery = 60; // Hardcoded for now based on HTML
        const total = subtotal + (subtotal > 0 ? delivery : 0);

        summaryDivs[0].innerText = `Rs : ${subtotal.toFixed(2)}`;
        summaryDivs[1].innerText = `Rs : ${subtotal > 0 ? delivery : 0}`;
        summaryDivs[2].innerText = `Rs : ${total.toFixed(2)}`;
    }
}
// Cart End

// Wishlist Start
// Load Wishlist
fetch("../components/wishlist.html")
    .then(res => res.text())
    .then(html => {
        document.body.insertAdjacentHTML("beforeend", html);
    });

// Global Wishlist Functions
function openWishlist() {
    const overlay = document.getElementById("wishlistOverlay");
    if (overlay) {
        overlay.classList.remove("hidden");
    } else {
        console.error("Wishlist overlay not found!");
    }
}

function openWishlist() {
    document.getElementById("wishlistOverlay").classList.remove("hidden");
    loadWishlist();
}


function closeWishlist() {
    const overlay = document.getElementById("wishlistOverlay");
    if (overlay) {
        overlay.classList.add("hidden");
    }
}
// Wishlist End

// Checkout Start
// Load Checkout
fetch("../components/checkout.html")
    .then(res => res.text())
    .then(html => {
        document.body.insertAdjacentHTML("beforeend", html);
    });

// Global Checkout Functions
function openCheckout() {
    const overlay = document.getElementById("checkoutOverlay");
    if (overlay) {
        overlay.classList.remove("hidden");
    } else {
        console.error("Checkout overlay not found!");
    }
}

function closeCheckout() {
    const overlay = document.getElementById("checkoutOverlay");
    if (overlay) {
        overlay.classList.add("hidden");
    }
}
// Checkout End

// Order Confirmed Start
// Load Order Confirmed
fetch("../components/order-confirmed.html")
    .then(res => res.text())
    .then(html => {
        document.body.insertAdjacentHTML("beforeend", html);
    });

// Global Order Confirmed Functions
function openOrderConfirmed() {
    const overlay = document.getElementById("orderConfirmedOverlay");
    if (overlay) {
        overlay.classList.remove("hidden");
    } else {
        console.error("Order Confirmed overlay not found!");
    }
}

function closeOrderConfirmed() {
    const overlay = document.getElementById("orderConfirmedOverlay");
    if (overlay) {
        overlay.classList.add("hidden");
    }
}
// Order Confirmed End

// User Dropdown Start
function toggleUserMenu() {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function (event) {
    const userMenuBtn = document.getElementById('user-menu-btn');
    const dropdown = document.getElementById('user-dropdown');

    if (userMenuBtn && dropdown && !userMenuBtn.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.add('hidden');
    }
});
// User Dropdown End