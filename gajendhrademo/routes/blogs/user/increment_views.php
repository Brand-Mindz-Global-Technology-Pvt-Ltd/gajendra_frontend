<?php
// increment_views.php

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
    echo json_encode(["status" => "error", "message" => "Invalid request"]);
    exit;
}

if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Database error"]);
    exit;
}

$blog_id = isset($_POST['blog_id']) ? (int)$_POST['blog_id'] : 0;

if (!$blog_id) {
    echo json_encode(["status" => "error", "message" => "Blog ID is required"]);
    exit;
}

// ============ UPDATE VIEWS ============ //
$updateSql = "UPDATE blogs SET views = views + 1 WHERE id = ?";
$stmt = $conn->prepare($updateSql);
$stmt->bind_param("i", $blog_id);
$stmt->execute();
$stmt->close();

// ============ GET NEW COUNT ============ //
$countSql = "SELECT views FROM blogs WHERE id = ? LIMIT 1";
$stmt = $conn->prepare($countSql);
$stmt->bind_param("i", $blog_id);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();
$stmt->close();

echo json_encode([
    "status" => "success",
    "blog_id" => $blog_id,
    "new_views" => (int)$row['views']
]);
exit;
