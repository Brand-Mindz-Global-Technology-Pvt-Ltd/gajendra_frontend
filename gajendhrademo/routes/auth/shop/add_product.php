<?php
require_once '../../../config/db.php';

// CORS
header('Access-Control-Allow-Origin: http://127.0.0.1:5500');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
    exit;
}

// INPUTS
$shop_id       = intval($_POST['shop_id'] ?? 0);
$category_id   = intval($_POST['category_id'] ?? 0);
$name          = trim($_POST['name'] ?? '');
$slug          = trim($_POST['slug'] ?? '');
$description   = trim($_POST['description'] ?? '');
$product_description = trim($_POST['product_description'] ?? '');
$benefits      = trim($_POST['benefits'] ?? '');
$how_to_use    = trim($_POST['how_to_use'] ?? '');
$price         = floatval($_POST['price'] ?? 0);
$variations    = $_POST['variations'] ?? '';
$stock         = intval($_POST['stock'] ?? 0);

$is_new_arrival   = isset($_POST['is_new_arrival']) ? 1 : 0;
$is_best_seller   = isset($_POST['is_best_seller']) ? 1 : 0;
$is_fourth_section = isset($_POST['is_fourth_section']) ? 1 : 0;

$status = $_POST['status'] ?? 'active';

// Validate variation JSON
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

// Validate product
if ($shop_id === 0 || $category_id === 0 || $name === '' || $slug === '' || $price <= 0) {
    echo json_encode(["success" => false, "message" => "Missing product details"]);
    exit;
}

// INSERT PRODUCT
$stmt = $conn->prepare("INSERT INTO products 
    (shop_id, category_id, name, slug, description, product_description, benefits, how_to_use, price, variations, stock, is_new_arrival, is_best_seller, is_fourth_section, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

$stmt->bind_param(
    "iissssssdsiiiis",
    $shop_id, $category_id, $name, $slug, $description,
    $product_description, $benefits, $how_to_use, $price,
    $variations, $stock, $is_new_arrival, $is_best_seller,
    $is_fourth_section, $status
);

if (!$stmt->execute()) {
    echo json_encode(["success" => false, "message" => "Error: ".$stmt->error]);
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

        // Handle icon upload
        $icon_field = "taste_icon_" . $index;
        $uploaded_icon = "";

        if (isset($_FILES[$icon_field]) &&
            $_FILES[$icon_field]['error'] === UPLOAD_ERR_OK &&
            $_FILES[$icon_field]['name'] !== '') {

            $file_name = time() . "_" . mt_rand(1000, 9999) . "_" . basename($_FILES[$icon_field]['name']);
            $target_path = $taste_upload_dir . $file_name;

            if (move_uploaded_file($_FILES[$icon_field]['tmp_name'], $target_path)) {
                $uploaded_icon = $file_name;
            }
        }

        // Insert taste segment
        if ($ts_title !== '' || $ts_desc !== '' || $uploaded_icon !== '') {
            $ts = $conn->prepare(
                "INSERT INTO taste_segment (title, description, icon, product_id) 
                 VALUES (?, ?, ?, ?)"
            );
            $ts->bind_param("sssi", $ts_title, $ts_desc, $uploaded_icon, $product_id);
            $ts->execute();
            $ts->close();
        }
    }
}


// =======================================================
// ⭐ PRODUCT IMAGES (NO CHANGE)
// =======================================================

if (!empty($_FILES['images']['name'][0])) {

    $upload_dir = __DIR__ . "/../../uploads/products/";
    if (!is_dir($upload_dir)) mkdir($upload_dir, 0755, true);

    for ($i = 0; $i < count($_FILES['images']['name']) && $i < 4; $i++) {
        if ($_FILES['images']['error'][$i] === UPLOAD_ERR_OK) {

            $image_name  = time() . "_" . mt_rand(1000, 9999) . "_" . $_FILES['images']['name'][$i];
            $target_path = $upload_dir . $image_name;

            if (move_uploaded_file($_FILES['images']['tmp_name'][$i], $target_path)) {

                $img = $conn->prepare("INSERT INTO product_images (product_id, image_path) VALUES (?, ?)");
                $img->bind_param("is", $product_id, $image_name);
                $img->execute();
                $img->close();
            }
        }
    }
}

echo json_encode([
    "success" => true,
    "message" => "Product added successfully",
    "product_id" => $product_id
]);

$conn->close();
