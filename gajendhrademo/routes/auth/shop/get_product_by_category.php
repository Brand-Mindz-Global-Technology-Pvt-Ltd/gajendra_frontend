<?php
require_once '../../../config/db.php';

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
    exit;
}

// Check for category_id
if (!isset($_GET['category_id'])) {
    echo json_encode(["success" => false, "message" => "category_id is required"]);
    exit;
}

$category_id = intval($_GET['category_id']);

// Fetch all active products for the category
$query = "
    SELECT p.id, p.name, p.description, p.price, p.variations, p.stock,
           p.is_new_arrival, p.status, p.shop_id, p.category_id,
           c.name AS category_name
    FROM products p
    INNER JOIN categories c ON p.category_id = c.id
    WHERE p.status = 'active' AND p.category_id = ?
    ORDER BY p.created_at DESC
";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $category_id);
$stmt->execute();
$result = $stmt->get_result();

$products = [];
$imageBaseURL = "https://narpavihoney.brandmindz.com/routes/uploads/products/";

while ($row = $result->fetch_assoc()) {
    $product_id = $row['id'];

    // Decode variations JSON
    $row['variations'] = !empty($row['variations']) ? json_decode($row['variations'], true) : [];

    // Fetch images
    $img_stmt = $conn->prepare("SELECT image_path FROM product_images WHERE product_id = ? ORDER BY id ASC");
    $img_stmt->bind_param("i", $product_id);
    $img_stmt->execute();
    $img_result = $img_stmt->get_result();

    $images = [];
    while ($img_row = $img_result->fetch_assoc()) {
        if (!empty($img_row['image_path'])) {
            $images[] = $img_row['image_path'];
        }
    }
    $row['images'] = $images;
    $img_stmt->close();

    $products[] = $row;
}

$stmt->close();
$conn->close();

if (count($products) > 0) {
    echo json_encode(["success" => true, "products" => $products]);
} else {
    echo json_encode(["success" => false, "message" => "No products found for this category"]);
}
?>
