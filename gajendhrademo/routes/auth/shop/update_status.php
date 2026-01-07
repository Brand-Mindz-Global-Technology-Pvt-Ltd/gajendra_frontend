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

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(["success" => false, "message" => "Invalid request method"]);
        exit;
    }

         // $conn = Database::getConnection();

$product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;
$status     = isset($_POST['status']) ? $_POST['status'] : '';

if ($product_id === 0 || ($status !== 'active' && $status !== 'inactive')) {
    echo json_encode(["success" => false, "message" => "Invalid input"]);
    exit;
}

$stmt = $conn->prepare("UPDATE products SET status = ? WHERE id = ?");
$stmt->bind_param("si", $status, $product_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Product status updated to $status"]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
};
