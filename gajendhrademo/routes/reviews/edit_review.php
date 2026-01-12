<?php
// edit_review.php

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
$rating    = isset($_POST['rating']) ? (int) $_POST['rating'] : 0;
$review_text = isset($_POST['review_text']) ? trim($_POST['review_text']) : '';

if (!$user_id || !$review_id || !$rating) {
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit;
}

if ($rating < 1 || $rating > 5) {
    echo json_encode(["status" => "error", "message" => "Rating must be between 1 and 5"]);
    exit;
}

// ✅ 1. Check ownership
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
$oldPhoto = $row['photo'];
$stmt->close();

// ✅ 2. Handle optional new photo (replace old)
$newPhotoPath = $oldPhoto;
if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = __DIR__ . '/../../../uploads/reviews/';
    if (!is_dir($uploadDir)) {
        @mkdir($uploadDir, 0775, true);
    }

    $tmpName  = $_FILES['photo']['tmp_name'];
    $origName = basename($_FILES['photo']['name']);
    $ext      = strtolower(pathinfo($origName, PATHINFO_EXTENSION));

    $allowedExt = ['jpg', 'jpeg', 'png', 'webp'];
    if (!in_array($ext, $allowedExt)) {
        echo json_encode(["status" => "error", "message" => "Invalid image type"]);
        exit;
    }

    $newFileName = 'review_' . $user_id . '_' . time() . '_' . mt_rand(1000, 9999) . '.' . $ext;
    $destPath    = $uploadDir . $newFileName;

    if (move_uploaded_file($tmpName, $destPath)) {
        $newPhotoPath = 'https://narpavihoney.brandmindz.com/uploads/reviews/' . $newFileName;

        // Optional: delete old photo file from server
        if ($oldPhoto && strpos($oldPhoto, '/uploads/reviews/') !== false) {
            $oldFileName = basename($oldPhoto);
            $oldPath = $uploadDir . $oldFileName;
            if (file_exists($oldPath)) {
                @unlink($oldPath);
            }
        }
    }
}

// ✅ 3. Update review
$updateSql = "
    UPDATE reviews
    SET rating = ?, review_text = ?, photo = ?, status = 'approved'
    WHERE id = ? AND user_id = ?
    LIMIT 1
";

$stmt = $conn->prepare($updateSql);
$stmt->bind_param("issii", $rating, $review_text, $newPhotoPath, $review_id, $user_id);
$ok = $stmt->execute();
$stmt->close();

if (!$ok) {
    echo json_encode(["status" => "error", "message" => "Failed to update review"]);
    exit;
}

echo json_encode([
    "status"  => "success",
    "message" => "Review updated successfully",
    "photo"   => $newPhotoPath
]);
exit;
