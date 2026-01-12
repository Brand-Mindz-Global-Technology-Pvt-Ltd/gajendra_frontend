<?php
// update_blog.php

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

// ============= INPUTS ============= //
$blog_id           = isset($_POST['blog_id']) ? (int)$_POST['blog_id'] : 0;
$title             = trim($_POST['title'] ?? '');
$short_description = trim($_POST['short_description'] ?? '');
$slug              = trim($_POST['slug'] ?? '');
$content           = $_POST['content'] ?? '';
$meta_title        = trim($_POST['meta_title'] ?? '');
$meta_description  = trim($_POST['meta_description'] ?? '');
$category          = trim($_POST['category'] ?? '');
$tags              = trim($_POST['tags'] ?? '');
$status            = trim($_POST['status'] ?? 'published');
$image             = trim($_POST['image'] ?? '');

// Validation
if (!$blog_id || $title === '' || $slug === '' || $content === '') {
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit;
}

// Blog must exist
$checkSql = "SELECT id FROM blogs WHERE id = ? LIMIT 1";
$stmt = $conn->prepare($checkSql);
$stmt->bind_param("i", $blog_id);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Blog not found"]);
    exit;
}
$stmt->close();

// Slug must be unique (except for current blog)
$checkSlugSql = "SELECT id FROM blogs WHERE slug = ? AND id != ? LIMIT 1";
$stmt = $conn->prepare($checkSlugSql);
$stmt->bind_param("si", $slug, $blog_id);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "Slug already exists"]);
    exit;
}
$stmt->close();

// ============= UPDATE QUERY =============
$sql = "
    UPDATE blogs SET
        title = ?,
        short_description = ?,
        slug = ?,
        content = ?,
        meta_title = ?,
        meta_description = ?,
        category = ?,
        tags = ?,
        image = ?,
        status = ?
    WHERE id = ?
";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode(["status" => "error", "message" => "Query preparation failed"]);
    exit;
}

$stmt->bind_param(
    "ssssssssssi",
    $title,
    $short_description,
    $slug,
    $content,
    $meta_title,
    $meta_description,
    $category,
    $tags,
    $image,
    $status,
    $blog_id
);

$ok = $stmt->execute();
$stmt->close();

if (!$ok) {
    echo json_encode(["status" => "error", "message" => "Failed to update blog"]);
    exit;
}

echo json_encode([
    "status" => "success",
    "message" => "Blog updated successfully"
]);
exit;
