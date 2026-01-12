<?php
// save_billing_address.php

require_once '../../config/db.php';

// Allow CORS
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "Invalid input"]);
    exit;
}

// Required fields
$required_fields = ['user_id', 'full_name', 'phone', 'address_line1', 'pincode', 'city', 'state'];

foreach ($required_fields as $field) {
    if (empty($data[$field])) {
        echo json_encode(["success" => false, "message" => "$field is required"]);
        exit;
    }
}

// Sanitize input
$user_id = $data['user_id'];
$full_name = $data['full_name'];
$phone = $data['phone'];
$address_line1 = $data['address_line1'];
$address_line2 = $data['address_line2'] ?? "";
$pincode = $data['pincode'];
$city = $data['city'];
$state = $data['state'];
$country = $data['country'] ?? "India";
$landmark = $data['landmark'] ?? "";
$is_default = isset($data['is_default']) ? intval($data['is_default']) : 0;

// If is_default = 1 → reset all others
if ($is_default == 1) {
    $conn->query("UPDATE billing_addresses SET is_default = 0 WHERE user_id = $user_id");
}

// Insert into DB
$sql = "INSERT INTO billing_addresses 
        (user_id, full_name, phone, address_line1, address_line2, city, state, pincode, country, landmark, is_default) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param(
    "isssssssssi",
    $user_id,
    $full_name,
    $phone,
    $address_line1,
    $address_line2,
    $city,
    $state,
    $pincode,
    $country,
    $landmark,
    $is_default
);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Billing address saved successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Database error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
