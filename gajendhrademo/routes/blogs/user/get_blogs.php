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

$page  = intval($_POST['page'] ?? 1);
$limit = intval($_POST['limit'] ?? 20);

if ($page < 1) $page = 1;
if ($limit < 1) $limit = 20;

$offset = ($page - 1) * $limit;

// Fetch all published blogs
$sql = "SELECT id, title, short_description, slug, category, image, created_at 
        FROM blogs 
        WHERE status = 'published'
        ORDER BY created_at DESC
        LIMIT ?, ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $offset, $limit);
$stmt->execute();
$res = $stmt->get_result();

$blogs = [];
while ($row = $res->fetch_assoc()) {
    $blogs[] = $row;
}

echo json_encode([
    "status" => "success",
    "data"   => $blogs,
    "count"  => count($blogs)
]);
exit;
