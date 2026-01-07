<?php
error_reporting(0);
ini_set('display_errors', 0);

require_once '../../../config/db.php';

// CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
    exit;
}

// Check DB connection
if (!$conn) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

try {
    // Fetch ALL orders
    $order_stmt = $conn->prepare("
        SELECT id AS order_id, user_id, total_amount, status, created_at
        FROM orders
        ORDER BY created_at DESC
    ");

    if (!$order_stmt) {
        echo json_encode(["success" => false, "message" => "Database error: " . $conn->error]);
        exit;
    }

    $order_stmt->execute();
    $order_result = $order_stmt->get_result();

    $orders = [];

    while ($order = $order_result->fetch_assoc()) {
        $order_id = $order['order_id'];

        // Fetch items for each order
        $items_stmt = $conn->prepare("
            SELECT 
                oi.product_id,
                oi.quantity,
                oi.price,
                p.name,
                p.slug
            FROM order_items oi
            INNER JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        ");

        if (!$items_stmt) {
            $order['items'] = [];
            $orders[] = $order;
            continue;
        }

        $items_stmt->bind_param("i", $order_id);

        if (!$items_stmt->execute()) {
            $order['items'] = [];
            $orders[] = $order;
            continue;
        }

        $item_result = $items_stmt->get_result();
        $items = [];

        while ($item = $item_result->fetch_assoc()) {
            $items[] = $item;
        }

        $order['items'] = $items;
        $orders[] = $order;

        $items_stmt->close();
    }

    echo json_encode(["success" => true, "orders" => $orders]);
    $order_stmt->close();
    $conn->close();
    exit;

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
    exit;
}
?>
