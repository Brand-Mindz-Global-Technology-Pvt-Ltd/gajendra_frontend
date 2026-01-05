<?php
// =====================================
// CORS CONFIG (FIXED)
// =====================================
$allowed_origins = [
    'http://127.0.0.1:5504',
    'http://localhost:5504',
    'https://gajendhrademo.brandmindz.com'
];

if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
}

header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// =====================================
// DB CONNECTION
// =====================================
require_once "../../../config/db.php";

if (!$conn) {
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed"
    ]);
    exit;
}

// =====================================
// INPUT
// =====================================
$shop_id = $_GET['shop_id'] ?? null;

// =====================================
// FETCH CATEGORIES
// =====================================
try {
    if ($shop_id) {
        $stmt = $conn->prepare("
            SELECT id, name, slug
            FROM categories
            WHERE shop_id = ?
            ORDER BY name ASC
        ");
        $stmt->bind_param("i", $shop_id);
    } else {
        $stmt = $conn->prepare("
            SELECT id, name, slug
            FROM categories
            ORDER BY name ASC
        ");
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $categories = [];
    while ($row = $result->fetch_assoc()) {
        $categories[] = $row;
    }

    echo json_encode([
        "success" => true,
        "categories" => $categories
    ]);

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
