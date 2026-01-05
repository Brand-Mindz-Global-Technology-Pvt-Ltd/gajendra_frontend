<?php
require_once '../../../config/db.php';

// Set CORS headers
header('Access-Control-Allow-Origin: http://127.0.0.1:5504');
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

$product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;

if ($product_id === 0) {
    echo json_encode(["success" => false, "message" => "product_id is required"]);
    exit;
}


/* ========================================================
   ⭐ NEW: DELETE TASTE SEGMENT ICON FILES + DB ROWS
   ======================================================== */

$taste_query = $conn->prepare("SELECT icon FROM taste_segment WHERE product_id = ?");
$taste_query->bind_param("i", $product_id);
$taste_query->execute();
$taste_res = $taste_query->get_result();

$taste_upload_dir = __DIR__ . "/../../uploads/taste_segments/";

while ($row = $taste_res->fetch_assoc()) {
    if (!empty($row['icon'])) {
        $icon_file = $taste_upload_dir . $row['icon'];
        if (file_exists($icon_file)) {
            unlink($icon_file); // delete taste segment icon file
        }
    }
}
$taste_query->close();

// delete taste segment records
$conn->query("DELETE FROM taste_segment WHERE product_id = $product_id");



/* ========================================================
   ⭐ EXISTING CODE (UNTOUCHED): DELETE PRODUCT IMAGES
   ======================================================== */

$img_query = $conn->prepare("SELECT image_path FROM product_images WHERE product_id = ?");
$img_query->bind_param("i", $product_id);
$img_query->execute();
$result = $img_query->get_result();

$upload_dir = "../uploads/products/";
while ($row = $result->fetch_assoc()) {
    $file = $upload_dir . $row['image_path'];
    if (file_exists($file)) {
        unlink($file); // delete image file
    }
}
$img_query->close();

$conn->query("DELETE FROM product_images WHERE product_id = $product_id");


/* ========================================================
   ⭐ EXISTING CODE (UNTOUCHED): DELETE PRODUCT
   ======================================================== */

$stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
$stmt->bind_param("i", $product_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Product deleted successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
