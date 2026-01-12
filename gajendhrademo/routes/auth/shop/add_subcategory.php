<?php
// ============================
// CORS HEADERS
// ============================
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

$allowed_origins = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:8081',
    'http://127.0.0.1:5504',
    'http://localhost:5500',
    'http://127.0.0.1:5501',
    'http://localhost:5501',
    'http://localhost'
];

// Allow file:// protocol (Origin: null)
if (
    $origin === 'null' || 
    $origin === 'https://gajendhrademo.brandmindz.com' || 
    preg_match('/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/', $origin)
) {
    header("Access-Control-Allow-Origin: " . ($origin === 'null' ? '*' : $origin));
    header("Access-Control-Allow-Credentials: true");
}

header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 86400");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ============================
// API LOGIC
// ============================
header("Content-Type: application/json");
require_once "../../../config/db.php"; 

$shop_id = $_POST['shop_id'] ?? null;
$category_id = $_POST['category_id'] ?? null;
$name = $_POST['name'] ?? null;
$slug = $_POST['slug'] ?? null;

$response = ["success" => false];

if (!$shop_id || !$category_id || !$name || !$slug) {
    $response["message"] = "Missing fields";
    echo json_encode($response);
    exit;
}

$sql = "INSERT INTO subcategories (shop_id, category_id, name, slug) VALUES (?,?,?,?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iiss", $shop_id, $category_id, $name, $slug);

if ($stmt->execute()) {
    $response["success"] = true;
    $response["message"] = "Subcategory added successfully";
} else {
    $response["message"] = "Database error";
}

echo json_encode($response);
