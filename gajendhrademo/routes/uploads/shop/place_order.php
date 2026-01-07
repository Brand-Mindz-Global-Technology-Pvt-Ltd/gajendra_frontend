<?php
${basename(__FILE__, '.php')} = function () {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(["success" => false, "message" => "Invalid request method"]);
        exit;
    }

    $conn = Database::getConnection();

$user_id = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;

if ($user_id === 0) {
    echo json_encode(["success" => false, "message" => "user_id is required"]);
    exit;
}

// Fetch cart items
$cart_stmt = $conn->prepare("
    SELECT c.id AS cart_id, c.quantity, p.id AS product_id, p.price, p.stock
    FROM cart c
    INNER JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
");
$cart_stmt->bind_param("i", $user_id);
$cart_stmt->execute();
$cart_result = $cart_stmt->get_result();

if ($cart_result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Cart is empty"]);
    exit;
}

$total_amount = 0;
$cart_items = [];

while ($row = $cart_result->fetch_assoc()) {
    if ($row['quantity'] > $row['stock']) {
        echo json_encode(["success" => false, "message" => "Not enough stock for product ID " . $row['product_id']]);
        exit;
    }
    $subtotal = $row['price'] * $row['quantity'];
    $total_amount += $subtotal;
    $cart_items[] = $row;
}
$cart_stmt->close();

// Create order
$order_stmt = $conn->prepare("INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, 'pending')");
$order_stmt->bind_param("id", $user_id, $total_amount);

if ($order_stmt->execute()) {
    $order_id = $order_stmt->insert_id;

    // Insert order items & update stock
    foreach ($cart_items as $item) {
        $oi_stmt = $conn->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
        $oi_stmt->bind_param("iiid", $order_id, $item['product_id'], $item['quantity'], $item['price']);
        $oi_stmt->execute();
        $oi_stmt->close();

        // Decrease stock
        $new_stock = $item['stock'] - $item['quantity'];
        $update_stock_stmt = $conn->prepare("UPDATE products SET stock = ? WHERE id = ?");
        $update_stock_stmt->bind_param("ii", $new_stock, $item['product_id']);
        $update_stock_stmt->execute();
        $update_stock_stmt->close();
    }

    // Clear cart
    $conn->query("DELETE FROM cart WHERE user_id = $user_id");

    echo json_encode([
        "success" => true,
        "message" => "Order placed successfully",
        "order_id" => $order_id,
        "total_amount" => $total_amount
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Error creating order: " . $order_stmt->error]);
}

$order_stmt->close();
$conn->close();
};
