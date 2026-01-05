<?php
// ===============================
// ERROR HANDLING
// ===============================
error_reporting(0);
ini_set('display_errors', 0);

// ===============================
// CORS FIX (🔥 IMPORTANT PART)
// ===============================
$allowed_origins = [
    'http://localhost:5500',
    'http://127.0.0.1:5504',
    'https://gajendhrademo.brandmindz.com'
];

if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
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
$shop_id = isset($_GET['shop_id']) ? intval($_GET['shop_id']) : 0;

// ===============================
// BASE URLS
// ===============================
$PRODUCT_IMAGE_URL = "https://gajendhrademo.brandmindz.com/uploads/products/";
$TASTE_ICON_URL    = "https://gajendhrademo.brandmindz.com/uploads/taste_segments/";

// ===============================
// FETCH PRODUCTS
// ===============================
try {
    if ($shop_id > 0) {
        $stmt = $conn->prepare("
            SELECT p.id, p.name, p.slug, p.description, p.product_description, p.benefits, p.how_to_use, 
                   p.price, p.variations, p.stock, p.status, 
                   p.is_new_arrival, p.is_best_seller, p.is_fourth_section, 
                   p.category_id, p.subcategory_id,
                   c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.shop_id = ?
            ORDER BY p.created_at DESC
        ");
        $stmt->bind_param("i", $shop_id);
    } else {
        $stmt = $conn->prepare("
            SELECT p.id, p.name, p.slug, p.description, p.product_description, p.benefits, p.how_to_use, 
                   p.price, p.variations, p.stock, p.status, 
                   p.is_new_arrival, p.is_best_seller, p.is_fourth_section, 
                   p.category_id, p.subcategory_id,
                   c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.created_at DESC
        ");
    }

    if (!$stmt || !$stmt->execute()) {
        echo json_encode(["success" => false, "message" => "Query failed"]);
        exit;
    }

    $result = $stmt->get_result();
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
    exit;
}

// ===============================
// PROCESS PRODUCTS
// ===============================
$products = [];

while ($row = $result->fetch_assoc()) {
    $product_id = $row['id'];

    // Parse variations JSON
    if (!empty($row['variations'])) {
        $decoded = json_decode($row['variations'], true);
        $row['variations'] = (json_last_error() === JSON_ERROR_NONE) ? $decoded : [];
    } else {
        $row['variations'] = [];
    }

    // Taste segments
    $ts_stmt = $conn->prepare("SELECT id, title, description, icon FROM taste_segment WHERE product_id = ?");
    $ts_stmt->bind_param("i", $product_id);
    $ts_stmt->execute();
    $ts_result = $ts_stmt->get_result();

    $taste_segments = [];
    while ($ts = $ts_result->fetch_assoc()) {
        $ts['icon_url'] = $ts['icon'] ? $TASTE_ICON_URL . $ts['icon'] : "";
        $taste_segments[] = $ts;
    }
    $ts_stmt->close();

    $row['taste_segments'] = $taste_segments;

    // Product images
    $img_stmt = $conn->prepare("SELECT image_path FROM product_images WHERE product_id = ?");
    $images = [];
    $images_full = [];

    if ($img_stmt) {
        $img_stmt->bind_param("i", $product_id);
        if ($img_stmt->execute()) {
            $img_result = $img_stmt->get_result();
            while ($img_row = $img_result->fetch_assoc()) {
                $images[] = $img_row['image_path'];
                $images_full[] = $PRODUCT_IMAGE_URL . $img_row['image_path'];
            }
        }
        $img_stmt->close();
    }

    $row['images'] = $images;
    $row['images_full'] = $images_full;

    $products[] = $row;
}

// ===============================
// RESPONSE
// ===============================
if (count($products) > 0) {
    echo json_encode(["success" => true, "products" => $products]);
} else {
    echo json_encode(["success" => false, "message" => "No products found"]);
}

$stmt->close();
$conn->close();
