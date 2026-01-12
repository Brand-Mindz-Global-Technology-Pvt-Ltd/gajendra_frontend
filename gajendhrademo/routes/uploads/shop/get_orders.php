<?php
${basename(__FILE__, '.php')} = function () {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        echo json_encode(["success" => false, "message" => "Invalid request method"]);
        exit;
    }

    $conn = Database::getConnection();

$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
$shop_id = isset($_GET['shop_id']) ? intval($_GET['shop_id']) : 0;
$order_id_filter = isset($_GET['order_id']) ? intval($_GET['order_id']) : 0;

if ($user_id === 0 && $shop_id === 0) {
    echo json_encode(["success" => false, "message" => "user_id or shop_id is required"]);
    exit;
}

// Fetch orders - for user_id (customer view) or shop_id (admin view)
if ($user_id > 0) {
    // Customer view - get their orders
    if ($order_id_filter > 0) {
        $order_stmt = $conn->prepare("
            SELECT id AS order_id, order_number, total_amount, status, created_at,
                   payment_status, payment_method, shipping_address, billing_address, user_id
            FROM orders
            WHERE user_id = ? AND id = ?
            ORDER BY created_at DESC
        ");
        $order_stmt->bind_param("ii", $user_id, $order_id_filter);
    } else {
        $order_stmt = $conn->prepare("
            SELECT id AS order_id, order_number, total_amount, status, created_at,
                   payment_status, payment_method, shipping_address, billing_address, user_id
            FROM orders
            WHERE user_id = ?
            ORDER BY created_at DESC
        ");
        $order_stmt->bind_param("i", $user_id);
    }
} else {
    // Admin view - get all orders for this shop
    $order_stmt = $conn->prepare("
        SELECT o.id AS order_id, o.order_number, o.total_amount, o.status, o.created_at, 
               o.payment_status, o.payment_method, o.shipping_address, o.billing_address, o.user_id,
               u.name AS customer_name, u.email AS customer_email
        FROM orders o
        INNER JOIN order_items oi ON o.id = oi.order_id
        INNER JOIN products p ON oi.product_id = p.id
        INNER JOIN users u ON o.user_id = u.id
        WHERE p.shop_id = ?
        GROUP BY o.id
        ORDER BY o.created_at DESC
    ");
    $order_stmt->bind_param("i", $shop_id);
}
$order_stmt->execute();
$order_result = $order_stmt->get_result();

$orders = [];
while ($order = $order_result->fetch_assoc()) {
    $order_id = $order['order_id'];

    // Fetch items for this order with product images
    $items_stmt = $conn->prepare("
        SELECT oi.product_id, oi.quantity, oi.price, p.name AS product_name, p.slug
        FROM order_items oi
        INNER JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
    ");
    $items_stmt->bind_param("i", $order_id);
    $items_stmt->execute();
    $items_result = $items_stmt->get_result();

    $items = [];
    $items_count = 0;
    while ($item = $items_result->fetch_assoc()) {
        // Fetch product image for each item
        $img_stmt = $conn->prepare("SELECT image_path FROM product_images WHERE product_id = ? LIMIT 1");
        $img_stmt->bind_param("i", $item['product_id']);
        $img_stmt->execute();
        $img_result = $img_stmt->get_result();
        $img_row = $img_result->fetch_assoc();
        $item['product_image'] = $img_row ? $img_row['image_path'] : null;
        $img_stmt->close();
        
        $items[] = $item;
        $items_count += $item['quantity'];
    }
    $items_stmt->close();

    $order['items'] = $items;
    $order['items_count'] = $items_count;
    $orders[] = $order;
}

if (count($orders) > 0) {
    echo json_encode(["success" => true, "orders" => $orders]);
} else {
    echo json_encode(["success" => false, "message" => "No orders found"]);
}

$order_stmt->close();
$conn->close();
};
