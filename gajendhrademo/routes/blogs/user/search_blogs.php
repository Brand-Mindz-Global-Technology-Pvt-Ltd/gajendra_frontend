<?php
// search_blogs.php

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
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit;
}

// ==================== INPUTS ==================== //
$query = trim($_POST['query'] ?? '');
$page  = isset($_POST['page']) ? (int)$_POST['page'] : 1;
$limit = isset($_POST['limit']) ? (int)$_POST['limit'] : 10;

$offset = ($page - 1) * $limit;

if ($query === '') {
    echo json_encode(["status" => "error", "message" => "Search query required"]);
    exit;
}

$escapedQuery = "%" . $conn->real_escape_string($query) . "%";

// ==================== COUNT QUERY ==================== //
$countSql = "
    SELECT COUNT(*) AS total 
    FROM blogs 
    WHERE status = 'published'
      AND (
          title LIKE '$escapedQuery'
          OR short_description LIKE '$escapedQuery'
          OR content LIKE '$escapedQuery'
          OR category LIKE '$escapedQuery'
          OR tags LIKE '$escapedQuery'
      )
";
$countRes = $conn->query($countSql);
$totalRows = $countRes->fetch_assoc()['total'] ?? 0;

// ==================== MAIN SEARCH QUERY ==================== //
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
    WHERE status = 'published'
      AND (
          title LIKE '$escapedQuery'
          OR short_description LIKE '$escapedQuery'
          OR content LIKE '$escapedQuery'
          OR category LIKE '$escapedQuery'
          OR tags LIKE '$escapedQuery'
      )
    ORDER BY created_at DESC
    LIMIT $limit OFFSET $offset
";

$res = $conn->query($sql);

$blogs = [];
while ($row = $res->fetch_assoc()) {
    $blogs[] = [
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
    "query" => $query,
    "total" => $totalRows,
    "page" => $page,
    "limit" => $limit,
    "data" => $blogs
]);
exit;
