<?php
require_once '../../../config/db.php';

// CORS headers
header('Access-Control-Allow-Origin: http://127.0.0.1:5504');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
    exit;
}

$product_id = isset($_GET['product_id']) ? intval($_GET['product_id']) : 0;

if ($product_id === 0) {
    echo json_encode(["success" => false, "message" => "product_id is required"]);
    exit;
}

// Base URL Paths
$PRODUCT_IMAGE_URL = "https://narpavihoney.brandmindz.com/uploads/products/";
$TASTE_ICON_URL    = "https://narpavihoney.brandmindz.com/uploads/taste_segments/";

// =============== FETCH PRODUCT ===================
$stmt = $conn->prepare("
    SELECT p.id, p.name, p.slug, p.description, p.product_description, 
           p.benefits, p.how_to_use, p.price, p.variations, p.stock, 
           p.is_new_arrival, p.status, p.category_id, 
           c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
");

$stmt->bind_param("i", $product_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Product not found"]);
    exit;
}

$product = $result->fetch_assoc();
$stmt->close();

// =============== FIX VARIATIONS JSON ===================
if (!empty($product['variations'])) {
    
    $decoded = json_decode($product['variations'], true);

    if ($decoded === null && json_last_error() !== JSON_ERROR_NONE) {
        $decoded = json_decode(stripslashes($product['variations']), true);
    }

    $product['variations'] = $decoded ?? [];

} else {
    $product['variations'] = [];
}


// =============== FETCH IMAGES ===================
$img_stmt = $conn->prepare("SELECT image_path FROM product_images WHERE product_id = ?");
$img_stmt->bind_param("i", $product_id);
$img_stmt->execute();
$img_result = $img_stmt->get_result();

$images = [];
$images_full = [];

while ($row = $img_result->fetch_assoc()) {
    $images[] = $row['image_path'];
    $images_full[] = $PRODUCT_IMAGE_URL . $row['image_path'];
}

$img_stmt->close();

$product['images'] = $images;
$product['images_full'] = $images_full;


// =============== ⭐ FETCH TASTE SEGMENTS ===================
$taste_stmt = $conn->prepare("
    SELECT id, title, description, icon 
    FROM taste_segment 
    WHERE product_id = ?
");
$taste_stmt->bind_param("i", $product_id);
$taste_stmt->execute();
$taste_res = $taste_stmt->get_result();

$taste_segments = [];

while ($ts = $taste_res->fetch_assoc()) {
    $ts['icon_url'] = $ts['icon'] ? $TASTE_ICON_URL . $ts['icon'] : "";
    $taste_segments[] = $ts;
}

$taste_stmt->close();

$product['taste_segments'] = $taste_segments;


// =============== FETCH REVIEWS ===================
$reviews = [];

try {
    $rev_stmt = $conn->prepare("
        SELECT r.rating, r.comment AS review_text, r.created_at, 
               u.name AS user_name
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.product_id = ?
        ORDER BY r.created_at DESC
    ");
    $rev_stmt->bind_param("i", $product_id);
    $rev_stmt->execute();

    $rev_result = $rev_stmt->get_result();
    while ($row = $rev_result->fetch_assoc()) {
        $reviews[] = $row;
    }

    $rev_stmt->close();
} 
catch (Exception $e) {
    $reviews = [];
}

$product['reviews'] = $reviews;


// =============== FINAL OUTPUT ===================
echo json_encode([
    "success" => true,
    "product" => $product
]);

$conn->close();
