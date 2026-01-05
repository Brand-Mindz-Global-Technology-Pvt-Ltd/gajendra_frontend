<?php
require_once '../../../config/db.php';
// Set CORS headers
header('Access-Control-Allow-Origin: http://127.0.0.1:5500');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

${basename(__FILE__, '.php')} = function () {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        echo json_encode(["success" => false, "message" => "Invalid request method"]);
        exit;
    }

         // $conn = Database::getConnection();

$product_id = isset($_GET['product_id']) ? intval($_GET['product_id']) : 0;

if ($product_id === 0) {
    echo json_encode(["success" => false, "message" => "product_id is required"]);
    exit;
}

// Fetch reviews
$stmt = $conn->prepare("
    SELECT r.id, r.rating, r.review_text, r.photo, r.created_at, u.name AS user_name
    FROM reviews r
    LEFT JOIN users u ON r.user_id = u.id
    WHERE r.product_id = ?
    ORDER BY r.created_at DESC
");
$stmt->bind_param("i", $product_id);
$stmt->execute();
$result = $stmt->get_result();

$reviews = [];
while ($row = $result->fetch_assoc()) {
    $reviews[] = $row;
}

if (count($reviews) > 0) {
    echo json_encode(["success" => true, "reviews" => $reviews]);
} else {
    echo json_encode(["success" => false, "message" => "No reviews found"]);
}

$stmt->close();
$conn->close();
};
