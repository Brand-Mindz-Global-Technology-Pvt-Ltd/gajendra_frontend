<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once '../../../config/db.php';
header('Content-Type: application/json');

// Allow CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
    exit;
}

// Get user_id
$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
if ($user_id === 0) {
    echo json_encode(["success" => false, "message" => "user_id is required"]);
    exit;
}

// Database connection check
if (!isset($conn) || $conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

$imageBaseURL = "https://narpavihoney.brandmindz.com/routes/uploads/products/";

// Fetch cart items with product details
$stmt = $conn->prepare("
    SELECT c.id AS cart_id, c.quantity, 
           p.id AS product_id, p.name, p.price, p.stock, p.is_new_arrival, 
           (p.price * c.quantity) AS subtotal
    FROM cart c
    INNER JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$cart_items = [];
$total = 0;

while ($row = $result->fetch_assoc()) {
    $product_id = $row['product_id'];

    // Fetch ALL images for this product
    $img_stmt = $conn->prepare("
        SELECT image_path 
        FROM product_images 
        WHERE product_id = ? 
        ORDER BY id ASC
    ");
    $img_stmt->bind_param("i", $product_id);
    $img_stmt->execute();
    $img_result = $img_stmt->get_result();

    $images = [];
    while ($img_row = $img_result->fetch_assoc()) {
        if (!empty($img_row['image_path'])) {
            $images[] = $imageBaseURL . $img_row['image_path'];
        }
    }
    $img_stmt->close();

    $row['images'] = $images; // array of full image URLs
    $row['image'] = !empty($images) ? $images[0] : null; // first image for frontend

    $total += $row['subtotal'];
    $cart_items[] = $row;
}

$stmt->close();
$conn->close();

// Return response
if (count($cart_items) > 0) {
    echo json_encode([
        "success" => true,
        "cart" => $cart_items,
        "total_amount" => $total
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Cart is empty"]);
}
?>
