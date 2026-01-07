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

$user_id    = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;
$product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;
$rating     = isset($_POST['rating']) ? intval($_POST['rating']) : 0;
$review_text = isset($_POST['review_text']) ? trim($_POST['review_text']) : '';

if ($user_id === 0 || $product_id === 0 || $rating < 1 || $rating > 5) {
    echo json_encode(["success" => false, "message" => "Invalid input"]);
    exit;
}

// Handle optional photo upload
$photo_path = null;
if (!empty($_FILES['photo']['name'])) {
    $upload_dir = "../uploads/reviews/";
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }
    $photo_name = time() . "_" . basename($_FILES['photo']['name']);
    $target_path = $upload_dir . $photo_name;

    if (move_uploaded_file($_FILES['photo']['tmp_name'], $target_path)) {
        $photo_path = $photo_name;
    }
}

// Insert review
$stmt = $conn->prepare("INSERT INTO reviews (product_id, user_id, rating, review_text, photo) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("iiiss", $product_id, $user_id, $rating, $review_text, $photo_path);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Review added successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
};
