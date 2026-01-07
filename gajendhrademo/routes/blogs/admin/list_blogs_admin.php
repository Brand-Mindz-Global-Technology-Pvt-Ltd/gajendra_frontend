<?php
// list_blogs_admin.php

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
    echo json_encode(["status" => "error", "message" => "Database error"]);
    exit;
}

// ===================== INPUTS ===================== //
$search   = trim($_POST['search'] ?? '');
$status   = trim($_POST['status'] ?? '');  // draft / published / empty
$page     = isset($_POST['page']) ? (int)$_POST['page'] : 1;
$limit    = isset($_POST['limit']) ? (int)$_POST['limit'] : 10;
$offset   = ($page - 1) * $limit;

// ===================== BUILD QUERY ===================== //
$where = "WHERE 1=1";

if ($search !== '') {
    $searchTerm = "%" . $search . "%";
    $where .= " AND (title LIKE '$searchTerm' OR slug LIKE '$searchTerm' OR category LIKE '$searchTerm')";
}

if ($status !== '' && ($status === 'draft' || $status === 'published')) {
    $where .= " AND status = '$status'";
}

// ===================== GET TOTAL COUNT ===================== //
$countSql = "SELECT COUNT(*) as total FROM blogs $where";
$countRes = $conn->query($countSql);
$countRow = $countRes->fetch_assoc();
$totalRows = (int)$countRow['total'];

// ===================== MAIN QUERY ===================== //
$sql = "
    SELECT 
        id,
        title,
        slug,
        short_description,
        category,
        tags,
        status,
        image,
        created_at,
        updated_at
    FROM blogs
    $where
    ORDER BY created_at DESC
    LIMIT $limit OFFSET $offset
";

$result = $conn->query($sql);

$blogs = [];
while ($row = $result->fetch_assoc()) {
    $blogs[] = [
        "id" => (int)$row['id'],
        "title" => $row['title'],
        "slug" => $row['slug'],
        "short_description" => $row['short_description'],
        "category" => $row['category'],
        "tags" => $row['tags'],
        "status" => $row['status'],
        "image" => $row['image'],
        "created_at" => $row['created_at'],
        "updated_at" => $row['updated_at']
    ];
}

echo json_encode([
    "status" => "success",
    "total"  => $totalRows,
    "page"   => $page,
    "limit"  => $limit,
    "data"   => $blogs
]);
exit;
