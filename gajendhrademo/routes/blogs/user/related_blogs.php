<?php
// related_blogs.php

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
$category = trim($_POST['category'] ?? '');
$tags = trim($_POST['tags'] ?? '');

if (!$blog_id || $category === '') {
    echo json_encode(["status" => "error", "message" => "Blog ID and category required"]);
    exit;
}

// Prepare tag match
$tagParts = [];
if ($tags !== '') {
    foreach (explode(',', $tags) as $tag) {
        $tagParts[] = trim($tag);
    }
}

// Build WHERE condition
$where = "WHERE status = 'published' AND id != $blog_id AND category = '$category'";

// If tags exist, try matching them
if (!empty($tagParts)) {
    $tagConditions = [];
    foreach ($tagParts as $tag) {
        $safeTag = $conn->real_escape_string($tag);
        $tagConditions[] = "FIND_IN_SET('$safeTag', tags)";
    }

    if (!empty($tagConditions)) {
        $tagQuery = implode(' OR ', $tagConditions);
        $where .= " AND ($tagQuery)";
    }
}

// Query limited results
$sql = "
    SELECT 
        id,
        title,
        slug,
        short_description,
        image,
        category,
        created_at
    FROM blogs
    $where
    ORDER BY created_at DESC
    LIMIT 6
";

$result = $conn->query($sql);

$related = [];
while ($row = $result->fetch_assoc()) {
    $related[] = [
        "id" => (int)$row['id'],
        "title" => $row['title'],
        "slug" => $row['slug'],
        "short_description" => $row['short_description'],
        "image" => $row['image'],
        "category" => $row['category'],
        "created_at" => $row['created_at']
    ];
}

echo json_encode([
    "status" => "success",
    "count" => count($related),
    "data" => $related
]);
exit;
