<?php
// get_blog_admin.php

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

// ============ FETCH BLOG ============ //
$sql = "
    SELECT 
        id,
        title,
        short_description,
        slug,
        content,
        meta_title,
        meta_description,
        category,
        tags,
        image,
        status,
        author_id,
        views,
        created_at,
        updated_at
    FROM blogs
    WHERE id = ?
    LIMIT 1
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $blog_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Blog not found"]);
    exit;
}

$blog = $result->fetch_assoc();
$stmt->close();

// Convert numeric fields properly
$blog['id'] = (int)$blog['id'];
$blog['author_id'] = $blog['author_id'] !== null ? (int)$blog['author_id'] : null;
$blog['views'] = (int)$blog['views'];

echo json_encode([
    "status" => "success",
    "data" => $blog
]);
exit;
