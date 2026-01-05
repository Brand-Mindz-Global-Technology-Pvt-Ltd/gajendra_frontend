<?php
// get_my_orders_with_review_status.php

error_reporting(0);
ini_set('display_errors', 0);

require_once '../../config/db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
    exit;
}

if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit;
}

$user_id = isset($_POST['user_id']) ? (int) $_POST['user_id'] : 0;
if (!$user_id) {
    echo json_encode(["status" => "error", "message" => "User ID is required"]);
    exit;
}

$sql = "
    SELECT 
        o.id AS order_id,
        o.status AS order_status,
        o.created_at AS order_date,
        oi.id AS order_item_id,
        oi.product_id,
        oi.quantity,
        oi.price,
        p.name AS product_name,
        p.slug AS product_slug,
        r.id AS review_id,
        r.rating AS review_rating,
        r.is_verified_purchase
    FROM orders o
    INNER JOIN order_items oi ON oi.order_id = o.id
    INNER JOIN products p ON oi.product_id = p.id
    LEFT JOIN reviews r 
        ON r.order_item_id = oi.id
       AND r.user_id = o.user_id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC, o.id DESC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$items = [];
while ($row = $result->fetch_assoc()) {
    $can_review = ($row['order_status'] === 'completed');
    $already_reviewed = !empty($row['review_id']);

    $items[] = [
        "order_id"           => (int)$row['order_id'],
        "order_status"       => $row['order_status'],
        "order_date"         => $row['order_date'],
        "order_item_id"      => (int)$row['order_item_id'],
        "product_id"         => (int)$row['product_id'],
        "product_name"       => $row['product_name'],
        "product_slug"       => $row['product_slug'],
        "quantity"           => (int)$row['quantity'],
        "price"              => (float)$row['price'],
        "can_review"         => $can_review,
        "already_reviewed"   => $already_reviewed,
        "review_id"          => $already_reviewed ? (int)$row['review_id'] : null,
        "review_rating"      => $already_reviewed ? (int)$row['review_rating'] : null,
        "is_verified_purchase" => $already_reviewed ? (int)$row['is_verified_purchase'] : 0
    ];
}
$stmt->close();

echo json_encode([
    "status" => "success",
    "data"   => $items
]);
exit;
