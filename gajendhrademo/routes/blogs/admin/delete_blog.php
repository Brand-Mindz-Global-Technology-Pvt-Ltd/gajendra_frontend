<?php
// delete_blog.php

error_reporting(0);
ini_set('display_errors', 0);

require_once '../../../config/db.php';

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

$blog_id = isset($_POST['blog_id']) ? (int)$_POST['blog_id'] : 0;

if (!$blog_id) {
    echo json_encode(["status" => "error", "message" => "Blog ID is required"]);
    exit;
}

// ==================== Check if exists ==================== //
$sql = "SELECT image FROM blogs WHERE id = ? LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $blog_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Blog not found"]);
    exit;
}

$row = $result->fetch_assoc();
$imageUrl = $row['image'];
$stmt->close();

// ==================== Delete blog ==================== //
$deleteSql = "DELETE FROM blogs WHERE id = ? LIMIT 1";
$stmt = $conn->prepare($deleteSql);
$stmt->bind_param("i", $blog_id);
$ok = $stmt->execute();
$stmt->close();

if (!$ok) {
    echo json_encode(["status" => "error", "message" => "Failed to delete blog"]);
    exit;
}

// ==================== Delete image file (optional) ==================== //
if ($imageUrl && strpos($imageUrl, '/uploads/blogs/') !== false) {
    $uploadDir = __DIR__ . "/../../../uploads/blogs/";
    $fileName  = basename($imageUrl);
    $filePath  = $uploadDir . $fileName;

    if (file_exists($filePath)) {
        @unlink($filePath);
    }
}

echo json_encode([
    "status" => "success",
    "message" => "Blog deleted successfully"
]);
exit;
