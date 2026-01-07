<?php
error_reporting(0);
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

require_once '../../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => "error", "message" => "Invalid request"]);
    exit;
}

$slug = trim($_POST['slug'] ?? '');
$id   = intval($_POST['id'] ?? 0);

if ($slug !== '') {
    $sql = "SELECT * FROM blogs WHERE slug = ? AND status='published' LIMIT 1";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $slug);

} elseif ($id > 0) {
    $sql = "SELECT * FROM blogs WHERE id = ? AND status='published' LIMIT 1";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);

} else {
    echo json_encode(["status" => "error", "message" => "Slug or ID required"]);
    exit;
}

$stmt->execute();
$result = $stmt->get_result();
$blog = $result->fetch_assoc();

if (!$blog) {
    echo json_encode(["status" => "error", "message" => "Blog not found"]);
    exit;
}

echo json_encode([
    "status" => "success",
    "data" => $blog
]);
exit;
