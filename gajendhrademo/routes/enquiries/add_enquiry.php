<?php
// ==================================
// CORS + PREFLIGHT (FINAL, STABLE)
// ==================================
date_default_timezone_set('Asia/Kolkata');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Allowed origins
$allowed_origins = [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://127.0.0.1:5504',
    'http://localhost:5504',
    'http://127.0.0.1:8080',
    'http://localhost:8080',
    'https://gajendhrademo.brandmindz.com'
];

// Always send ONE valid origin
if ($origin && in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
} else {
    // fallback (no credentials)
    header("Access-Control-Allow-Origin: *");
}

header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 86400");
header("Content-Type: application/json");

// ======================
// PREFLIGHT EXIT
// ======================
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ======================
// DB CONNECTION
// ======================
require_once '../../config/db.php';

// ======================
// READ JSON
// ======================
$data = json_decode(file_get_contents("php://input"), true);

if (!is_array($data)) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid JSON payload"
    ]);
    exit;
}

// ======================
// INPUTS
// ======================
$enquiry_type = trim($data['enquiry_type'] ?? 'contact');
$name         = trim($data['name'] ?? '');
$email        = trim($data['email'] ?? '');
$phone        = trim($data['phone'] ?? '');

// Contact specific
$message      = trim($data['message'] ?? '');

// Bulk specific
$delivery_date = trim($data['delivery_date'] ?? '');
$category_id   = trim($data['category_id'] ?? '');
$product_id    = trim($data['product_id'] ?? '');
$address       = trim($data['address'] ?? '');
$remarks       = trim($data['remarks'] ?? '');

// ======================
// VALIDATION
// ======================
if ($name === '' || $email === '' || $phone === '') {
    echo json_encode([
        "success" => false,
        "message" => "Name, Email, and Phone are required"
    ]);
    exit;
}

if ($enquiry_type === 'contact' && $message === '') {
    echo json_encode([
        "success" => false,
        "message" => "Message is required for contact enquiries"
    ]);
    exit;
}

// ======================
// INSERT
// ======================
if ($enquiry_type === 'bulk') {
    $stmt = $conn->prepare(
        "INSERT INTO enquiries (enquiry_type, name, email, phone, delivery_date, category_id, product_id, address, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    if ($stmt) {
        $stmt->bind_param("sssssssss", $enquiry_type, $name, $email, $phone, $delivery_date, $category_id, $product_id, $address, $remarks);
    }
} else {
    $stmt = $conn->prepare(
        "INSERT INTO enquiries (enquiry_type, name, email, phone, message) VALUES (?, ?, ?, ?, ?)"
    );
    if ($stmt) {
        $stmt->bind_param("sssss", $enquiry_type, $name, $email, $phone, $message);
    }
}

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "DB prepare failed: " . $conn->error
    ]);
    exit;
}

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Enquiry submitted successfully"
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "DB insert failed: " . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
