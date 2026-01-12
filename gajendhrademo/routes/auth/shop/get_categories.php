<?php
// =====================================
// CORS CONFIG (FULL + SAFE)
// =====================================
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

$allowed_origins = [
    'http://127.0.0.1:5506',
    'http://localhost:5500',
    'http://127.0.0.1:5504',
    'http://localhost:5504',
    'http://127.0.0.1:8080',
    'http://localhost:8080',
    'https://gajendhrademo.brandmindz.com'
];

// Allow local file:// testing
if ($origin === 'null') {
    header("Access-Control-Allow-Origin: *");
} elseif (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}

// Always required headers
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 86400");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// =====================================
// DB CONNECTION
// =====================================
require_once "../../../config/db.php";

if (!isset($conn)) {
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed"
    ]);
    exit;
}

// =====================================
// FETCH CATEGORIES
// =====================================
try {

    $stmt = $conn->prepare("
        SELECT id, name, slug, created_at
        FROM categories
        ORDER BY name ASC
    ");

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

} catch (Throwable $e) {

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
