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
    // Normalize product data to ensure price and image are clean
    const price = parseFloat(product.price || product.amount || 0) || 0;
    const normalizedProduct = {
        id: product.id,
        name: product.name,
        price: price.toFixed(2),
        image: product.image || product.images?.[0] || 'https://placehold.co/300x300'
    };

    const existing = cart.find(item => item.id == normalizedProduct.id);
    if (existing) {
        existing.quantity += (product.quantity || 1);
    } else {
        cart.push({ ...normalizedProduct, quantity: (product.quantity || 1) });
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
            const itemPrice = parseFloat(item.price) || parseFloat(item.amount) || 0;
            subtotal += itemPrice * item.quantity;
            container.innerHTML += `
                <div class="flex items-center gap-4 p-4 border rounded-xl">
                    <img src="${item.image}" class="w-20 h-20 rounded object-cover" />

                    <div class="flex-1">
                        <h4 class="font-medium text-[#3E1C00]">${item.name}</h4>
                        <p class="text-sm text-gray-500">Rs : ${itemPrice.toFixed(2)}</p>
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
        if (typeof loadWishlist === 'function') loadWishlist();
    } else {
        console.error("Wishlist overlay not found!");
    }
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
async function fetchDefaultAddress() {
    const token = localStorage.getItem("authToken");
    if (!token) return null;

    try {
        const res = await fetch('https://gajendhrademo.brandmindz.com/routes/profile/get_all_addresses.php', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data) {
            return data.data.find(a => a.is_default == 1) || data.data[0];
        } else if (Array.isArray(data)) {
            return data.find(a => a.is_default == 1) || data[0];
        }
    } catch (e) {
        console.error("Error fetching address:", e);
    }
    return null;
}

async function openCheckout() {
    const overlay = document.getElementById("checkoutOverlay");
    if (!overlay) {
        console.error("Checkout overlay not found!");
        return;
    }

    renderCheckout();
    overlay.classList.remove("hidden");

    // Fetch and populate address
    const address = await fetchDefaultAddress();
    if (address) {
        // Populate form
        const fields = {
            'checkout_name': address.full_name,
            'checkout_phone': address.phone,
            'checkout_house': address.address_line1,
            'checkout_road': address.address_line2,
            'checkout_city': address.city,
            'checkout_state': address.state,
            'checkout_pincode': address.pincode
        };

        for (const [id, value] of Object.entries(fields)) {
            const el = document.getElementById(id);
            if (el) el.value = value || '';
        }

        // Populate summary
        const summaryName = document.getElementById('summary_name');
        const summaryAddr1 = document.getElementById('summary_address_1');
        const summaryAddr2 = document.getElementById('summary_address_2');
        const summaryPhone = document.getElementById('summary_phone');

        if (summaryName) summaryName.innerText = address.full_name || 'N/A';
        if (summaryAddr1) summaryAddr1.innerText = address.address_line1 || 'N/A';
        if (summaryAddr2) summaryAddr2.innerText = `${address.city || ''}, ${address.state || ''}, ${address.pincode || ''}`;
        if (summaryPhone) summaryPhone.innerText = address.phone || 'N/A';

        // Show summary
        const summaryBox = document.getElementById('checkoutAddressSummary');
        if (summaryBox) summaryBox.classList.remove('hidden');
    }
}

function renderCheckout() {
    const cartItems = JSON.parse(localStorage.getItem('gajendra_cart')) || [];
    const container = document.getElementById('checkoutItemsContainer');
    if (!container) return;

    container.innerHTML = '';
    let subtotal = 0;

    if (cartItems.length === 0) {
        container.innerHTML = `<div class="text-center p-10 text-gray-500">Your cart is empty</div>`;
    } else {
        cartItems.forEach((item, index) => {
            const itemPrice = parseFloat(item.price) || 0;
            const itemQty = parseInt(item.quantity) || 1;
            subtotal += itemPrice * itemQty;

            container.innerHTML += `
                <div class="border rounded-2xl p-4 shadow-sm flex items-start gap-4 bg-white">
                    <img src="${item.image}" class="w-20 h-20 rounded-md object-cover" />
                    <div class="flex-1">
                        <div class="flex justify-between items-start">
                            <h3 class="font-bold text-lg text-[#3E1C00]">${item.name}</h3>
                            <span class="text-xs text-slate-500 bg-gray-100 px-2 py-1 rounded">Qty: ${itemQty}</span>
                        </div>
                        <div class="text-yellow-500 text-sm my-1">★★★★★</div>
                        <div class="flex justify-between items-center mt-2">
                            <span class="font-bold text-[#3E1C00]">Rs : ${itemPrice.toFixed(2)}</span>
                            <div class="flex items-center gap-2">
                                <span class="text-xs text-gray-500">Quantity</span>
                                <div class="flex items-center border rounded overflow-hidden">
                                    <button onclick="updateQuantityCheckout(${index}, -1)" class="px-2 py-0.5 text-gray-500 hover:bg-gray-100">−</button>
                                    <span class="text-xs px-2 font-medium">${itemQty}</span>
                                    <button onclick="updateQuantityCheckout(${index}, 1)" class="px-2 py-0.5 text-white bg-[#5D3420] hover:bg-[#3E1C00]">+</button>
                                </div>
                                <button onclick="removeFromCartCheckout(${index})" class="text-red-500 ml-2 hover:text-red-700">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    // Update Summary
    const summaryCount = document.getElementById('checkoutSummaryCount');
    const summaryTotal = document.getElementById('checkoutSummaryTotal');
    const summaryOrder = document.getElementById('checkoutSummaryOrder');

    if (summaryCount) summaryCount.innerText = `Product Details (${cartItems.length} Items)`;
    if (summaryTotal) summaryTotal.innerText = `Rs: ${subtotal.toFixed(2)}`;
    if (summaryOrder) summaryOrder.innerText = `Rs: ${subtotal.toFixed(2)}`;
}

function updateQuantityCheckout(index, change) {
    const currentCart = JSON.parse(localStorage.getItem('gajendra_cart')) || [];
    if (currentCart[index]) {
        currentCart[index].quantity += change;
        if (currentCart[index].quantity < 1) currentCart[index].quantity = 1;
        localStorage.setItem('gajendra_cart', JSON.stringify(currentCart));
        // Sync with global cart variable if it exists
        if (typeof cart !== 'undefined') cart = currentCart;
        renderCheckout();
        renderCart();
    }
}

function removeFromCartCheckout(index) {
    const currentCart = JSON.parse(localStorage.getItem('gajendra_cart')) || [];
    currentCart.splice(index, 1);
    localStorage.setItem('gajendra_cart', JSON.stringify(currentCart));
    // Sync with global cart variable
    if (typeof cart !== 'undefined') cart = currentCart;
    renderCheckout();
    renderCart();
    updateCartBadge();
}

let selectedPayment = 'COD';
function selectPaymentMethod(method) {
    selectedPayment = method;
    const codOption = document.getElementById('codOption');
    const onlineOption = document.getElementById('onlineOption');
    const codCheck = document.getElementById('codCheck');
    const onlineCheck = document.getElementById('onlineCheck');
    const summaryPayment = document.getElementById('summary_payment_method');

    if (method === 'COD') {
        if (codOption) codOption.className = "flex items-center justify-between p-4 bg-[#3B82F6] text-white rounded-xl cursor-pointer shadow-md";
        if (onlineOption) onlineOption.className = "flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:bg-gray-50";
        if (codCheck) {
            codCheck.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>';
            codCheck.className = "bg-white text-blue-500 rounded-full p-0.5";
        }
        if (onlineCheck) {
            onlineCheck.innerHTML = '';
            onlineCheck.className = "w-6 h-6 border-2 border-gray-300 rounded-full";
        }
        if (summaryPayment) summaryPayment.innerText = 'Cash on Delivery';
    } else {
        if (onlineOption) onlineOption.className = "flex items-center justify-between p-4 bg-[#3B82F6] text-white rounded-xl cursor-pointer shadow-md";
        if (codOption) codOption.className = "flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:bg-gray-50";
        if (onlineCheck) {
            onlineCheck.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>';
            onlineCheck.className = "bg-white text-blue-500 rounded-full p-0.5";
        }
        if (codCheck) {
            codCheck.innerHTML = '';
            codCheck.className = "w-6 h-6 border-2 border-gray-300 rounded-full";
        }
        if (summaryPayment) summaryPayment.innerText = 'Online Payment';
    }
}

function saveCheckoutAddress() {
    const name = document.getElementById('checkout_name').value;
    const phone = document.getElementById('checkout_phone').value;
    const house = document.getElementById('checkout_house').value;
    const road = document.getElementById('checkout_road').value;
    const city = document.getElementById('checkout_city').value;
    const state = document.getElementById('checkout_state').value;
    const pincode = document.getElementById('checkout_pincode').value;

    if (!name || !phone || !house || !road || !city || !state || !pincode) {
        alert('Please fill all address fields');
        return;
    }

    // Update Summary
    document.getElementById('summary_name').innerText = name;
    document.getElementById('summary_address_1').innerText = house;
    document.getElementById('summary_address_2').innerText = `${road}, ${city}, ${state}, ${pincode}`;
    document.getElementById('summary_phone').innerText = phone;

    // Show Summary
    const summaryBox = document.getElementById('checkoutAddressSummary');
    if (summaryBox) summaryBox.classList.remove('hidden');

    // Smooth scroll to payment
    const paymentArea = document.getElementById('paymentMethodsContainer');
    if (paymentArea) paymentArea.scrollIntoView({ behavior: 'smooth' });
}

function editCheckoutAddress() {
    // There are two h2 tags in the left column. The second one is 'Delivery Address'.
    const headers = document.querySelectorAll('#checkoutOverlay .md\\:w-\\[60\\%\\] h2');
    if (headers.length >= 2) {
        headers[1].scrollIntoView({ behavior: 'smooth' });
    }
}

function editPaymentMethod() {
    const paymentArea = document.getElementById('paymentMethodsContainer');
    if (paymentArea) paymentArea.scrollIntoView({ behavior: 'smooth' });
}

async function placeOrder() {
    const orderCart = JSON.parse(localStorage.getItem('gajendra_cart')) || [];
    if (orderCart.length === 0) {
        alert('Your cart is empty');
        return;
    }

    try {
        const response = await fetch('https://gajendhrademo.brandmindz.com/routes/auth/shop/place_order.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
                items: orderCart,
                total: document.getElementById('checkoutSummaryOrder').innerText.replace('Rs: ', ''),
                address: {
                    name: document.getElementById('summary_name').innerText,
                    address1: document.getElementById('summary_address_1').innerText,
                    address2: document.getElementById('summary_address_2').innerText,
                    phone: document.getElementById('summary_phone').innerText
                },
                payment_method: document.getElementById('summary_payment_method').innerText
            })
        });

        const data = await response.json();
        if (data.success) {
            localStorage.removeItem('gajendra_cart');
            if (typeof cart !== 'undefined') cart = [];
            updateCartBadge();
            closeCheckout();
            openOrderConfirmed();
        } else {
            alert(data.message || 'Failed to place order');
        }
    } catch (e) {
        console.error('Order error:', e);
        // Simulation for now
        localStorage.removeItem('gajendra_cart');
        if (typeof cart !== 'undefined') cart = [];
        updateCartBadge();
        closeCheckout();
        openOrderConfirmed();
    }
}

function closeCheckout() {
    const overlay = document.getElementById("checkoutOverlay");
    if (overlay) overlay.classList.add("hidden");
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