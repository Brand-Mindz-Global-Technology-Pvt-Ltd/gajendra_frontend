/**
 * Admin Order Management Logic
 */

/**
 * Load orders
 */
async function loadOrders() {
    try {
        if (typeof showLoading === 'function') showLoading("orders");

        const response = await fetch(
            `${API_BASE}/get_orders.php?shop_id=${currentShop.id}`
        );
        const data = await response.json();

        const list = document.getElementById("orderList");
        if (!list) return;
        list.innerHTML = "";

        if (data.success && data.orders.length > 0) {
            window.orders = data.orders;
            const countBadge = document.getElementById("orderCount");
            if (countBadge) countBadge.textContent = `${window.orders.length} orders`;

            data.orders.forEach((order) => {
                const statusBadge = getOrderStatusBadge(order.status);
                list.innerHTML += `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-3">
                            <h6 class="mb-1">Order #${order.order_id}</h6>
                            <small class="text-muted">${new Date(order.created_at).toLocaleDateString()}</small>
                        </div>
                        <div class="col-md-3">
                            <p class="mb-1">Customer: ${order.customer_name || "N/A"}</p>
                            <small class="text-muted">${order.customer_email || "N/A"}</small>
                        </div>
                        <div class="col-md-2 text-center">
                            <h6 class="text-success mb-1">₹${order.total_amount}</h6>
                            <small class="text-muted">${order.items_count} items</small>
                        </div>
                        <div class="col-md-2 text-center">
                            <span class="badge bg-${statusBadge}">${order.status}</span>
                        </div>
                        <div class="col-md-2">
                            <button class="btn btn-sm btn-outline-primary w-100" onclick="viewOrder(${order.order_id})">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
            });
        } else {
            list.innerHTML = `
        <div class="text-center p-4">
            <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
            <h5>No orders yet</h5>
            <p class="text-muted">Orders will appear here when customers place them!</p>
        </div>
      `;
        }

        if (typeof hideLoading === 'function') hideLoading("orders");
    } catch (error) {
        console.error("❌ Failed to load orders:", error);
        if (typeof hideLoading === 'function') hideLoading("orders");
        if (typeof showToast === 'function') showToast("❌ Failed to load orders", "error");
    }
}

/**
 * View order details
 */
function viewOrder(orderId) {
    console.log("🔍 Viewing Order:", orderId);

    // Find order in global array
    const order = window.orders ? window.orders.find(o => o.order_id == orderId) : null;

    if (!order) {
        showToast("❌ Order details not found in cache", "error");
        return;
    }

    // Populate Modal Fields (Summary)
    document.getElementById("orderDetailId").textContent = order.order_number || `#${order.order_id}`;
    document.getElementById("orderDetailDate").textContent = new Date(order.created_at).toLocaleString();

    const statusEl = document.getElementById("orderDetailStatus");
    statusEl.textContent = order.status;
    statusEl.className = `badge bg-${getOrderStatusBadge(order.status)}`;

    document.getElementById("orderDetailPaymentMethod").textContent = order.payment_method || "N/A";

    const payStatusEl = document.getElementById("orderDetailPaymentStatus");
    payStatusEl.textContent = order.payment_status || "Pending";
    payStatusEl.className = `badge bg-${order.payment_status === 'paid' ? 'success' : 'warning'}`;

    // Customer
    document.getElementById("orderDetailCustomerName").textContent = order.customer_name || "Guest";
    document.getElementById("orderDetailCustomerEmail").textContent = order.customer_email || "N/A";

    // Addresses
    document.getElementById("orderDetailShippingAddress").textContent = order.shipping_address || "No shipping address provided";
    document.getElementById("orderDetailBillingAddress").textContent = order.billing_address || "Same as shipping";

    // Items Breakdown
    const itemsTbody = document.getElementById("orderDetailItems");
    itemsTbody.innerHTML = "";

    if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>
                    <div class="d-flex align-items-center">
                        <div class="bg-light rounded me-2" style="width: 40px; height: 40px; overflow: hidden;">
                             <img src="${item.product_image ? 'https://gajendhrademo.brandmindz.com/routes/uploads/shop/' + item.product_image : 'https://placehold.co/100x100?text=No+Image'}" 
                                  onerror="this.src='https://placehold.co/100x100?text=No+Image'"
                                  style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div>
                            <div class="fw-semibold small">${item.product_name}</div>
                            <div class="text-muted ms-small" style="font-size: 0.7rem;">SKU: ${item.slug || 'N/A'}</div>
                        </div>
                    </div>
                </td>
                <td class="text-center small">₹${item.price}</td>
                <td class="text-center small">${item.quantity}</td>
                <td class="text-end fw-semibold small">₹${(item.price * item.quantity).toFixed(2)}</td>
            `;
            itemsTbody.appendChild(row);
        });
    } else {
        itemsTbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-3">No individual items found for this order</td></tr>`;
    }

    // Total
    document.getElementById("orderDetailGrandTotal").textContent = `₹${parseFloat(order.total_amount).toFixed(2)}`;

    // Show Modal
    const orderModal = new bootstrap.Modal(document.getElementById('orderViewModal'));
    orderModal.show();
}

/**
 * Get order status badge color
 */
function getOrderStatusBadge(status) {
    if (!status) return "secondary";
    switch (status.toLowerCase()) {
        case "pending":
            return "warning";
        case "processing":
        case "confirmed":
            return "info";
        case "shipped":
            return "primary";
        case "completed":
        case "delivered":
            return "success";
        case "cancelled":
            return "danger";
        default:
            return "secondary";
    }
}

// Attach to window
window.loadOrders = loadOrders;
window.viewOrder = viewOrder;
window.getOrderStatusBadge = getOrderStatusBadge;
