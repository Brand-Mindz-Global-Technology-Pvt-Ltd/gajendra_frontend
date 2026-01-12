<?php
// list_blogs.php

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

// ============= INPUTS ============= //
$search   = trim($_POST['search'] ?? '');
$category = trim($_POST['category'] ?? '');
$page     = isset($_POST['page']) ? (int)$_POST['page'] : 1;
$limit    = isset($_POST['limit']) ? (int)$_POST['limit'] : 6;

$offset   = ($page - 1) * $limit;

// ============= WHERE CONDITIONS ============= //
$where = "WHERE status = 'published'";

if ($search !== '') {
    $searchTerm = "%$search%";
    $where .= " AND (title LIKE '$searchTerm' OR short_description LIKE '$searchTerm' OR tags LIKE '$searchTerm')";
}

if ($category !== '') {
    $categoryTerm = trim($category);
    $where .= " AND category = '$categoryTerm'";
}

// ============= TOTAL COUNT ============= //
$countSql = "SELECT COUNT(*) AS total FROM blogs $where";
$countRes = $conn->query($countSql);
$total     = $countRes->fetch_assoc()['total'] ?? 0;

// ============= MAIN QUERY ============= //
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
    "total" => (int)$total,
    "page" => $page,
    "limit" => $limit,
    "data" => $blogs
]);
exit;

