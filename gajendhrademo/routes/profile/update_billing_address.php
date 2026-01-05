<?php
// update_billing_address.php
require_once '../../config/db.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['id'])) {
    echo json_encode(["success" => false, "message" => "Address ID is required"]);
    exit;
}

$address_id = intval($data['id']);
$user_id = intval($data['user_id']);
$full_name = $data['full_name'] ?? "";
$phone = $data['phone'] ?? "";
$address_line1 = $data['address_line1'] ?? "";
$address_line2 = $data['address_line2'] ?? "";
$city = $data['city'] ?? "";
$state = $data['state'] ?? "";
$pincode = $data['pincode'] ?? "";
$country = $data['country'] ?? "India";
$landmark = $data['landmark'] ?? "";
$is_default = isset($data['is_default']) ? intval($data['is_default']) : 0;

// If user marks this as default → remove default from others
if ($is_default == 1) {
    $conn->query("UPDATE billing_addresses SET is_default = 0 WHERE user_id = $user_id");
}

$sql = "UPDATE billing_addresses
        SET full_name=?, phone=?, address_line1=?, address_line2=?, city=?, state=?, pincode=?, country=?, landmark=?, is_default=?
        WHERE id=? AND user_id=?";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Prepare failed: " . $conn->error]);
    exit;
}

// Fixed: removed spaces in type string - should be "ssssssssiiii" not "sssssssssi ii"
$stmt->bind_param(
    "ssssssssiiii",
    $full_name,
    $phone,
    $address_line1,
    $address_line2,
    $city,
    $state,
    $pincode,
    $country,
    $landmark,
    $is_default,
    $address_id,
    $user_id
);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["success" => true, "message" => "Billing address updated successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "No changes made or address not found"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Database error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
