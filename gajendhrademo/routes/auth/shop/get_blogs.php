<?php
// ===============================
// ERROR HANDLING
// ===============================
error_reporting(0);
ini_set('display_errors', 0);

// ===============================
// CORS FIX (🔥 THIS IS THE KEY)
// ===============================
$allowed_origins = [
    'http://127.0.0.1:5504',
    'http://localhost:5500',
    'https://gajendhrademo.brandmindz.com'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (
    $origin === 'https://gajendhrademo.brandmindz.com' || 
    preg_match('/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/', $origin)
) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ===============================
// DB CONNECTION
// ===============================
require_once '../../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request method"
    ]);
    exit;
}

if (!$conn) {
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed"
    ]);
    exit;
}

// ===============================
// FETCH BLOGS
// ===============================
try {
    $stmt = $conn->prepare("
        SELECT id, title, slug, content, image, created_at
        FROM blogs
        ORDER BY created_at DESC
    ");

    if (!$stmt->execute()) {
        echo json_encode([
            "success" => false,
            "message" => "Query execution failed"
        ]);
        exit;
    }

    $result = $stmt->get_result();

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
    exit;
}

// ===============================
// RESPONSE
// ===============================
$blogs = [];

while ($row = $result->fetch_assoc()) {
    $blogs[] = $row;
}

if (!empty($blogs)) {
    echo json_encode([
        "success" => true,
        "blogs" => $blogs
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "No blogs found"
    ]);
}

$stmt->close();
$conn->close();
