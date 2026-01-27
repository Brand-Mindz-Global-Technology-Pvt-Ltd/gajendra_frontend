const getPopupBasePath = () => {
    const script = document.querySelector('script[src*="popups.js"]');
    if (script) {
        return script.getAttribute('src').replace('popups.js', '');
    }
    return '../components/'; // Fallback
};

document.addEventListener("DOMContentLoaded", () => {
    const basePath = getPopupBasePath();

    // Load Cart
    fetch(basePath + "cart.html")
        .then(res => res.text())
        .then(html => {
            document.body.insertAdjacentHTML("beforeend", html);
        });

    // Load Wishlist
    fetch(basePath + "wishlist.html")
        .then(res => res.text())
        .then(html => {
            document.body.insertAdjacentHTML("beforeend", html);
        });

    // Load Checkout
    fetch(basePath + "checkout.html")
        .then(res => res.text())
        .then(html => {
            document.body.insertAdjacentHTML("beforeend", html);
        });

    // Load Order Confirmed
    fetch(basePath + "order-confirmed.html")
        .then(res => res.text())
        .then(html => {
            document.body.insertAdjacentHTML("beforeend", html);
        });
});

/**
 * Basic Modal Control functions
 * These are shared across managers if they don't override them.
 */
function closeCart() {
    document.getElementById("cartOverlay")?.classList.add("hidden");
}

function closeWishlist() {
    document.getElementById("wishlistOverlay")?.classList.add("hidden");
}

function closeCheckout() {
    document.getElementById("checkoutOverlay")?.classList.add("hidden");
}

function closeOrderConfirmed() {
    document.getElementById("orderConfirmedOverlay")?.classList.add("hidden");
}
