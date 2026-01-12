<?php
// ===============================
// ERROR HANDLING
// ===============================
error_reporting(0);
ini_set('display_errors', 0);

// ===============================
// CORS FIX (🔥 IMPORTANT)
// ===============================
$allowed_origins = [
    'http://127.0.0.1:5504',
    'http://localhost:5500',
    'https://gajendhrademo.brandmindz.com'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (
    $origin === 'https://gajendhrademo.brandmindz.com' || 
    preg_match('/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/', $origin)
) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ===============================
// DB CONNECTION
// ===============================
require_once '../../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
    exit;
}

if (!$conn) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

// ===============================
// INPUT
// ===============================
$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
$shop_id = isset($_GET['shop_id']) ? intval($_GET['shop_id']) : 0;

if ($user_id === 0 && $shop_id === 0) {
    echo json_encode([
        "success" => false,
        "message" => "user_id or shop_id is required"
    ]);
    exit;
}

// ===============================
// FETCH ORDERS
// ===============================
try {
    if ($user_id > 0) {
        // Customer view
        $order_stmt = $conn->prepare("
            SELECT id AS order_id, total_amount, status, created_at
            FROM orders
            WHERE user_id = ?
            ORDER BY created_at DESC
        ");
        $order_stmt->bind_param("i", $user_id);
    } else {
        // Admin view
        $order_stmt = $conn->prepare("
            SELECT o.id AS order_id, o.total_amount, o.status, o.created_at,
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

    if (!$order_stmt->execute()) {
        echo json_encode([
            "success" => false,
            "message" => "Query execution failed"
        ]);
        exit;
    }

    $order_result = $order_stmt->get_result();

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
    exit;
}

// ===============================
// FETCH ORDER ITEMS
// ===============================
$orders = [];

while ($order = $order_result->fetch_assoc()) {
    $order_id = $order['order_id'];

    $items_stmt = $conn->prepare("
        SELECT oi.product_id, oi.quantity, oi.price, p.name, p.slug
        FROM order_items oi
        INNER JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
    ");

    if ($items_stmt) {
        $items_stmt->bind_param("i", $order_id);
        $items_stmt->execute();
        $items_result = $items_stmt->get_result();

        $items = [];
        $items_count = 0;

        while ($item = $items_result->fetch_assoc()) {
            $items[] = $item;
            $items_count += $item['quantity'];
        }

        $items_stmt->close();
    } else {
        $items = [];
        $items_count = 0;
    }

    $order['items'] = $items;
    $order['items_count'] = $items_count;
    $orders[] = $order;
}

// ===============================
// RESPONSE
// ===============================
if (!empty($orders)) {
    echo json_encode([
        "success" => true,
        "orders" => $orders
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "No orders found"
    ]);
}

$order_stmt->close();
$conn->close();
