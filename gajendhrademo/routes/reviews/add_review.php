<?php
// add_review.php

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

$user_id      = isset($_POST['user_id']) ? (int) $_POST['user_id'] : 0;
$product_id   = isset($_POST['product_id']) ? (int) $_POST['product_id'] : 0;
$order_item_id= isset($_POST['order_item_id']) ? (int) $_POST['order_item_id'] : 0;
$rating       = isset($_POST['rating']) ? (int) $_POST['rating'] : 0;
$review_text  = isset($_POST['review_text']) ? trim($_POST['review_text']) : '';

if (!$user_id || !$product_id || !$order_item_id || !$rating) {
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit;
}

if ($rating < 1 || $rating > 5) {
    echo json_encode(["status" => "error", "message" => "Rating must be between 1 and 5"]);
    exit;
}

// ✅ 1. Verify that this order_item belongs to this user, product, and is completed
$checkSql = "
    SELECT oi.id 
    FROM order_items oi
    INNER JOIN orders o ON oi.order_id = o.id
    WHERE oi.id = ? 
      AND oi.product_id = ? 
      AND o.user_id = ? 
      AND o.status = 'completed'
    LIMIT 1
";

$stmt = $conn->prepare($checkSql);
$stmt->bind_param("iii", $order_item_id, $product_id, $user_id);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 0) {
    $stmt->close();
    echo json_encode([
        "status"  => "error",
        "message" => "You are not eligible to review this product. (Order not found or not completed)"
    ]);
    exit;
}
$stmt->close();

// ✅ 2. Check if review already exists for this order_item_id + user_id
$checkReviewSql = "SELECT id FROM reviews WHERE user_id = ? AND order_item_id = ? LIMIT 1";
$stmt = $conn->prepare($checkReviewSql);
$stmt->bind_param("ii", $user_id, $order_item_id);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    $stmt->close();
    echo json_encode([
        "status"  => "error",
        "message" => "Review already exists for this order item. Please edit your review instead."
    ]);
    exit;
}
$stmt->close();

// ✅ 3. Optional: handle photo upload
$photoPath = null;

if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = __DIR__ . '/../../../uploads/reviews/';
    if (!is_dir($uploadDir)) {
        @mkdir($uploadDir, 0775, true);
    }

    $tmpName  = $_FILES['photo']['tmp_name'];
    $origName = basename($_FILES['photo']['name']);
    $ext      = pathinfo($origName, PATHINFO_EXTENSION);
    $ext      = strtolower($ext);

    // Basic extension check
    $allowedExt = ['jpg', 'jpeg', 'png', 'webp'];
    if (!in_array($ext, $allowedExt)) {
        echo json_encode(["status" => "error", "message" => "Invalid image type"]);
        exit;
    }

    $newFileName = 'review_' . $user_id . '_' . time() . '_' . mt_rand(1000, 9999) . '.' . $ext;
    $destPath    = $uploadDir . $newFileName;

    if (move_uploaded_file($tmpName, $destPath)) {
        // Adjust base URL to your real domain
        $photoPath = 'https://narpavihoney.brandmindz.com/uploads/reviews/' . $newFileName;
    }
}

// ✅ 4. Insert review (verified_purchase = 1 since we checked order)
$insertSql = "
    INSERT INTO reviews (product_id, user_id, order_item_id, rating, review_text, photo, is_verified_purchase, status)
    VALUES (?, ?, ?, ?, ?, ?, 1, 'approved')
";

$stmt = $conn->prepare($insertSql);
$stmt->bind_param("iiiiss", $product_id, $user_id, $order_item_id, $rating, $review_text, $photoPath);
$ok = $stmt->execute();
$review_id = $stmt->insert_id;
$stmt->close();

if (!$ok) {
    echo json_encode(["status" => "error", "message" => "Failed to save review"]);
    exit;
}

echo json_encode([
    "status"             => "success",
    "message"            => "Review added successfully",
    "review_id"          => $review_id,
    "is_verified_purchase" => 1,
    "photo"              => $photoPath
]);
exit;
