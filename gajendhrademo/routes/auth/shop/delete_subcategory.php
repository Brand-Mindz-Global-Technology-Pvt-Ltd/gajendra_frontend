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
if ($origin === 'null') {
    header("Access-Control-Allow-Origin: *");
} elseif (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}

header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 86400");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ============================
// API LOGIC
// ============================
header("Content-Type: application/json");
require_once "../../../config/db.php"; 

$id = $_POST['id'] ?? null;
$response = ["success" => false];

if (!$id) {
    $response["message"] = "Missing id";
    echo json_encode($response);
    exit;
}

// Check if any product uses this subcategory
$check = $conn->prepare("SELECT id FROM products WHERE subcategory_id=? LIMIT 1");
$check->bind_param("i", $id);
$check->execute();
$res = $check->get_result();

if ($res->num_rows > 0) {
    $response["message"] = "Cannot delete — products exist under this subcategory";
    echo json_encode($response);
    exit;
}

// Delete subcategory
$sql = "DELETE FROM subcategories WHERE id=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    $response["success"] = true;
    $response["message"] = "Subcategory deleted";
} else {
    $response["message"] = "Database error";
}

echo json_encode($response);
