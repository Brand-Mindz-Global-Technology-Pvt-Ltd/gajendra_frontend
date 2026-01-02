// Cart Start
document.addEventListener("DOMContentLoaded", () => {
    // Load Cart
    fetch("../components/cart.html")
        .then(res => res.text())
        .then(html => {
            document.body.insertAdjacentHTML("beforeend", html);
        });
});

function openCart() {
    document.getElementById("cartOverlay")?.classList.remove("hidden");
}

function closeCart() {
    document.getElementById("cartOverlay")?.classList.add("hidden");
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