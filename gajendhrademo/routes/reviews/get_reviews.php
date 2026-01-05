<?php
// get_reviews.php

error_reporting(0);
ini_set('display_errors', 0);

require_once '../../config/db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit;
}

// product_id can come from GET or POST
$product_id = 0;
if (isset($_GET['product_id'])) {
    $product_id = (int) $_GET['product_id'];
} elseif (isset($_POST['product_id'])) {
    $product_id = (int) $_POST['product_id'];
}

if (!$product_id) {
    echo json_encode(["status" => "error", "message" => "Product ID is required"]);
    exit;
}

// ✅ 1. Fetch review list
$sql = "
    SELECT 
        r.id,
        r.rating,
        r.review_text,
        r.photo,
        r.is_verified_purchase,
        r.created_at,
        u.name AS user_name
    FROM reviews r
    INNER JOIN users u ON r.user_id = u.id
    WHERE r.product_id = ?
      AND r.status = 'approved'
    ORDER BY r.created_at DESC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $product_id);
$stmt->execute();
$result = $stmt->get_result();

$reviews = [];
while ($row = $result->fetch_assoc()) {
    $reviews[] = [
        "id"                  => (int) $row['id'],
        "user_name"           => $row['user_name'],
        "rating"              => (int) $row['rating'],
        "review_text"         => $row['review_text'],
        "photo"               => $row['photo'],
        "is_verified_purchase"=> (int) $row['is_verified_purchase'],
        "created_at"          => $row['created_at']
    ];
}
$stmt->close();

// ✅ 2. Fetch summary (avg rating, total reviews, count by rating)
$summarySql = "
    SELECT 
        AVG(rating) AS avg_rating,
        COUNT(*) AS total_reviews,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS rating_5,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS rating_4,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS rating_3,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS rating_2,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS rating_1
    FROM reviews
    WHERE product_id = ?
      AND status = 'approved'
";

$stmt = $conn->prepare($summarySql);
$stmt->bind_param("i", $product_id);
$stmt->execute();
$summaryRes = $stmt->get_result();
$summary = $summaryRes->fetch_assoc();
$stmt->close();

$avg_rating    = $summary && $summary['avg_rating'] ? round((float)$summary['avg_rating'], 1) : 0;
$total_reviews = $summary && $summary['total_reviews'] ? (int)$summary['total_reviews'] : 0;

echo json_encode([
    "status"         => "success",
    "product_id"     => $product_id,
    "average_rating" => $avg_rating,
    "total_reviews"  => $total_reviews,
    "rating_breakup" => [
        "5" => (int)($summary['rating_5'] ?? 0),
        "4" => (int)($summary['rating_4'] ?? 0),
        "3" => (int)($summary['rating_3'] ?? 0),
        "2" => (int)($summary['rating_2'] ?? 0),
        "1" => (int)($summary['rating_1'] ?? 0),
    ],
    "data" => $reviews
]);
exit;
