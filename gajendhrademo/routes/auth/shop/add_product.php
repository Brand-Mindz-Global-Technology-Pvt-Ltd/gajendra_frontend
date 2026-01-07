<?php
require_once '../../../config/db.php';

// =======================================================
// CORS CONFIG (FULL + SAFE)
// =======================================================
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

$allowed_origins = [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://127.0.0.1:5504',
    'http://localhost:5504',
    'http://127.0.0.1:8080',
    'http://localhost:8080',
    'https://gajendhrademo.brandmindz.com'
];

// Allow file:// testing
if ($origin === 'null') {
    header("Access-Control-Allow-Origin: *");
} elseif (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}

// Always required headers
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 86400");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// =======================================================
// ONLY POST ALLOWED
// =======================================================
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
    exit;
}

// =======================================================
// INPUTS
// =======================================================
$shop_id       = intval($_POST['shop_id'] ?? 0);
$category_id   = intval($_POST['category_id'] ?? 0);
$name          = trim($_POST['name'] ?? '');
$slug          = trim($_POST['slug'] ?? '');
$description   = trim($_POST['description'] ?? '');
$product_description = trim($_POST['product_description'] ?? '');
$benefits      = trim($_POST['benefits'] ?? '');
$how_to_use    = trim($_POST['how_to_use'] ?? '');
$variations    = $_POST['variations'] ?? '';
$stock         = intval($_POST['stock'] ?? 0);

$is_new_arrival    = isset($_POST['is_new_arrival']) ? 1 : 0;
$is_best_seller    = isset($_POST['is_best_seller']) ? 1 : 0;
$is_fourth_section = isset($_POST['is_fourth_section']) ? 1 : 0;

$status = $_POST['status'] ?? 'active';

// =======================================================
// VALIDATE VARIATIONS JSON
// =======================================================
if (!empty($variations)) {
    $decoded_variations = json_decode($variations, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode(["success" => false, "message" => "Invalid variations JSON"]);
        exit;
    }
    $variations = json_encode($decoded_variations);
} else {
    $variations = '[]';
}

// =======================================================
// VALIDATE PRODUCT
// =======================================================
if ($shop_id === 0 || $category_id === 0 || $name === '' || $slug === '') {
    echo json_encode(["success" => false, "message" => "Missing product details"]);
    exit;
}

// =======================================================
// INSERT PRODUCT (PRICE REMOVED)
// =======================================================
$stmt = $conn->prepare("
    INSERT INTO products 
    (shop_id, category_id, name, slug, description, product_description, benefits, how_to_use, variations, stock, is_new_arrival, is_best_seller, is_fourth_section, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
");

$stmt->bind_param(
    "iisssssssiiiis",
    $shop_id,
    $category_id,
    $name,
    $slug,
    $description,
    $product_description,
    $benefits,
    $how_to_use,
    $variations,
    $stock,
    $is_new_arrival,
    $is_best_seller,
    $is_fourth_section,
    $status
);

if (!$stmt->execute()) {
    echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
    exit;
}

$product_id = $stmt->insert_id;
$stmt->close();

// =======================================================
// ⭐ TASTE SEGMENT INSERT WITH ICON UPLOAD
// =======================================================
$taste_upload_dir = __DIR__ . "/../../uploads/taste_segments/";
if (!is_dir($taste_upload_dir)) {
    mkdir($taste_upload_dir, 0755, true);
}

if (isset($_POST['taste_segments']) && is_array($_POST['taste_segments'])) {

    foreach ($_POST['taste_segments'] as $index => $seg) {

        $ts_title = trim($seg['title'] ?? '');
        $ts_desc  = trim($seg['description'] ?? '');

        $icon_field = "taste_icon_" . $index;
        $uploaded_icon = "";

        if (
            isset($_FILES[$icon_field]) &&
            $_FILES[$icon_field]['error'] === UPLOAD_ERR_OK &&
            $_FILES[$icon_field]['name'] !== ''
        ) {
            $file_name = time() . "_" . mt_rand(1000, 9999) . "_" . basename($_FILES[$icon_field]['name']);
            $target_path = $taste_upload_dir . $file_name;

            if (move_uploaded_file($_FILES[$icon_field]['tmp_name'], $target_path)) {
                $uploaded_icon = $file_name;
            }
        }

        if ($ts_title !== '' || $ts_desc !== '' || $uploaded_icon !== '') {
            $ts = $conn->prepare("
                INSERT INTO taste_segment (title, description, icon, product_id) 
                VALUES (?, ?, ?, ?)
            ");
            $ts->bind_param("sssi", $ts_title, $ts_desc, $uploaded_icon, $product_id);
            $ts->execute();
            $ts->close();
        }
    }
}

// =======================================================
// ⭐ PRODUCT IMAGES
// =======================================================
if (!empty($_FILES['images']['name'][0])) {

    $upload_dir = __DIR__ . "/../../uploads/products/";
    if (!is_dir($upload_dir)) mkdir($upload_dir, 0755, true);

    for ($i = 0; $i < count($_FILES['images']['name']) && $i < 4; $i++) {

        if ($_FILES['images']['error'][$i] === UPLOAD_ERR_OK) {

            $image_name  = time() . "_" . mt_rand(1000, 9999) . "_" . $_FILES['images']['name'][$i];
            $target_path = $upload_dir . $image_name;

            if (move_uploaded_file($_FILES['images']['tmp_name'][$i], $target_path)) {

                $img = $conn->prepare("
                    INSERT INTO product_images (product_id, image_path) 
                    VALUES (?, ?)
                ");
                $img->bind_param("is", $product_id, $image_name);
                $img->execute();
                $img->close();
            }
        }
    }
}

// =======================================================
// RESPONSE
// =======================================================
echo json_encode([
    "success" => true,
    "message" => "Product added successfully",
    "product_id" => $product_id
]);

$conn->close();
