<?php
// delete_review.php

error_reporting(0);
ini_set('display_errors', 0);

require_once '../../config/db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
    exit;
}

if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit;
}

$user_id   = isset($_POST['user_id']) ? (int) $_POST['user_id'] : 0;
$review_id = isset($_POST['review_id']) ? (int) $_POST['review_id'] : 0;

if (!$user_id || !$review_id) {
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit;
}

// ✅ 1. Get review & photo (ensure ownership)
$checkSql = "SELECT photo FROM reviews WHERE id = ? AND user_id = ? LIMIT 1";
$stmt = $conn->prepare($checkSql);
$stmt->bind_param("ii", $review_id, $user_id);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    $stmt->close();
    echo json_encode(["status" => "error", "message" => "Review not found"]);
    exit;
}
$row = $result->fetch_assoc();
$photo = $row['photo'];
$stmt->close();

// ✅ 2. Delete review row
$deleteSql = "DELETE FROM reviews WHERE id = ? AND user_id = ? LIMIT 1";
$stmt = $conn->prepare($deleteSql);
$stmt->bind_param("ii", $review_id, $user_id);
$ok = $stmt->execute();
$stmt->close();

if (!$ok) {
    echo json_encode(["status" => "error", "message" => "Failed to delete review"]);
    exit;
}

// Optional: delete photo file
if ($photo && strpos($photo, '/uploads/reviews/') !== false) {
    $uploadDir = __DIR__ . '/../../../uploads/reviews/';
    $fileName  = basename($photo);
    $filePath  = $uploadDir . $fileName;
    if (file_exists($filePath)) {
        @unlink($filePath);
    }
}

echo json_encode([
    "status"  => "success",
    "message" => "Review deleted successfully"
]);
exit;
