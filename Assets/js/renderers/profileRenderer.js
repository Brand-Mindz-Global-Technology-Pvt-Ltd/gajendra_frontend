import { ReviewRenderer } from "./reviews/reviewRenderer.js";

/**
 * Profile Renderer
 * Responsibile for generating all HTML strings and managing skeleton states for the My Account page.
 */

const SKELETONS = {
    // ... (unchanged)
    ADDRESS: `
        <div class="border rounded-xl p-4 space-y-3 animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-1/4"></div>
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div class="border rounded-xl p-4 space-y-3 animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-1/4"></div>
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>`,
    ORDER: `
        <div class="border rounded-xl p-5 animate-pulse flex justify-between space-x-4">
            <div class="space-y-2 w-full">
                <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                <div class="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div class="h-8 w-20 bg-gray-200 rounded"></div>
        </div>`,
    WISHLIST: `
        <div class="w-[220px] rounded-xl p-4 border animate-pulse">
            <div class="h-32 bg-gray-200 rounded-lg mb-3"></div>
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>`
};

export const ProfileRenderer = {
    // ... (unchanged methods)
    showSkeletons(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (containerId === 'addressList') container.innerHTML = SKELETONS.ADDRESS;
        else if (containerId === 'ordersList') container.innerHTML = SKELETONS.ORDER;
        else if (containerId === 'wishlistGrid' || containerId === 'profileWishlistGrid') container.innerHTML = SKELETONS.WISHLIST;
    },

    /**
     * Renders Address List HTML
     */
    renderAddressList(addresses) {
        if (!addresses || addresses.length === 0) {
            return `
                <div class="col-span-full py-12 text-center">
                    <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-map-marker-alt text-gray-300 text-2xl"></i>
                    </div>
                    <p class="text-gray-500">No addresses saved yet.</p>
                </div>
            `;
        }

        return addresses.map(addr => `
            <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative group transition hover:shadow-md">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded uppercase font-bold tracking-wider">${addr.address_type || 'HOME'}</span>
                        ${addr.is_default ? '<span class="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-bold">Default</span>' : ''}
                    </div>
                    <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="editAddress(${addr.id})" class="text-blue-500 hover:text-blue-700 p-1"><i class="fas fa-edit"></i></button>
                        <button onclick="deleteAddress(${addr.id})" class="text-red-500 hover:text-red-700 p-1"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <h4 class="font-semibold text-[#3E1C00] mb-1">${addr.full_name}</h4>
                <p class="text-sm text-gray-600 leading-relaxed max-w-xs">
                    ${addr.address_line1}${addr.address_line2 ? ', ' + addr.address_line2 : ''}<br>
                    ${addr.city}, ${addr.state} - ${addr.pincode}<br>
                    ${addr.country}
                </p>
                <p class="text-sm text-gray-600 mt-2"><i class="fas fa-phone-alt text-gray-400 mr-2"></i>${addr.phone}</p>
            </div>
        `).join('');
    },

    /**
     * Renders Order List HTML
     * Accepts a flat list of order items and groups them by order_id
     */
    renderOrderList(orderItems) {
        if (!orderItems || orderItems.length === 0) {
            return `
                <div class="text-center py-10 text-gray-400">
                     <i class="fa-solid fa-box-open text-4xl mb-3"></i>
                     <p>No orders placed yet.</p>
                     <a href="../Shop/Shop.html" class="text-brown hover:underline text-sm mt-2 block">Start Shopping</a>
                </div>`;
        }

        // Group by Order ID
        const orders = {};
        orderItems.forEach(item => {
            if (!orders[item.order_id]) {
                orders[item.order_id] = {
                    order_id: item.order_id,
                    status: item.order_status,
                    created_at: item.order_date,
                    items: []
                };
            }
            orders[item.order_id].items.push(item);
        });

        // Sort by ID desc
        const sortedOrderIds = Object.keys(orders).sort((a, b) => b - a);

        return sortedOrderIds.map(orderId => {
            const order = orders[orderId];
            return `
            <div class="bg-white p-5 rounded-xl shadow-md mb-6 border border-gray-100">
                <div class="flex justify-between items-center mb-4 border-b pb-3">
                    <div>
                        <span class="font-semibold text-brown text-lg">Order #${order.order_id}</span>
                        <p class="text-xs text-gray-400 mt-1">Ordered on: ${new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <span class="text-xs px-3 py-1 rounded-full ${order.status === 'completed' || order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'} font-medium uppercase tracking-wide">
                        ${order.status}
                    </span>
                </div>
                
                <div class="space-y-4">
                    ${order.items.map(item => `
                        <div class="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg">
                            <div class="flex items-center gap-3">
                                <div class="w-12 h-12 bg-white rounded border flex items-center justify-center">
                                    <img src="${item.product_image || 'https://placehold.co/50'}" class="w-10 h-10 object-contain" alt="">
                                </div>
                                <div>
                                    <h5 class="font-medium text-[#3E1C00] text-sm">${item.product_name}</h5>
                                    <p class="text-xs text-gray-500">Qty: ${item.quantity} | ₹${item.price}</p>
                                </div>
                            </div>
                            <div>
                                ${ReviewRenderer.renderOrderReviewButton(item)}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            `;
        }).join('');
    },

    /**
     * Renders Wishlist Grid HTML
     */
    renderWishlist(products, userId) {
        if (!products || products.length === 0) {
            return `
                <div class="w-full text-center py-10 text-gray-400">
                     <i class="fa-solid fa-heart-crack text-4xl mb-3"></i>
                     <p>Your wishlist is empty.</p>
                     <a href="../Shop/Shop.html" class="text-brown hover:underline text-sm mt-2 block">Browse Products</a>
                </div>`;
        }

        return products.map(product => `
            <div class="w-[220px] bg-white rounded-xl p-4 shadow-md text-center border border-gray-100">
                <img src="${product.images[0] || 'https://placehold.co/150x150/FDF5ED/DAA520?text=No+Image'}" class="w-32 h-32 mx-auto object-cover mb-3 rounded-lg">
                <h4 class="font-medium text-sm text-[#3E1C00] truncate">${product.name}</h4>
                <p class="font-semibold text-brown mb-3">₹${product.price}</p>
                <button onclick="window.location.href='../Shop/Shop.html?product_id=${product.product_id}'" class="w-full bg-brown text-white text-xs px-4 py-2 rounded hover:opacity-90 transition">
                    View Item
                </button>
                <button onclick="removeFromWishlist(${userId}, ${product.product_id})" class="mt-2 text-xs text-red-500 hover:underline">Remove</button>
            </div>
        `).join('');
    },



    /**
     * Updates Sidebar Personal Info
     */
    updateSidebar(user) {
        document.getElementById("profileName").innerText = user.name || "User";
        document.getElementById("profileEmail").innerText = user.email || "";
        if (user.profile_image) {
            document.getElementById("profileImg").src = user.profile_image;
        }
    },

    /**
     * Populates Personal Info Form
     */
    populatePersonalInfoForm(user) {
        const formName = document.querySelector("input[name='full_name']");
        const formEmail = document.querySelector("input[name='email']");
        const formPhone = document.querySelector("input[name='phone']");

        if (formName) formName.value = user.name || "";
        if (formEmail) formEmail.value = user.email || "";
        if (formName) formName.value = user.name || "";
        if (formEmail) formEmail.value = user.email || "";
        if (formPhone) formPhone.value = user.phone || "";

        const formDob = document.querySelector("input[name='dob']");
        if (formDob) formDob.value = user.dob || "";
    },

    /**
     * Managed Loading States
     */
    toggleLoading(sectionId, show) {
        const skeleton = document.getElementById(`${sectionId}Skeleton`);
        const content = document.getElementById(sectionId === 'personal' ? 'personalForm' : sectionId === 'sidebar' ? 'sidebarContent' : sectionId);

        if (show) {
            if (skeleton) skeleton.classList.remove("hidden");
            if (content) content.classList.add("hidden");
        } else {
            if (skeleton) skeleton.classList.add("hidden");
            if (content) content.classList.remove("hidden");
        }
    }
};
