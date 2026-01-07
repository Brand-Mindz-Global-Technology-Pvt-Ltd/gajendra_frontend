<?php
// delete_billing_address.php

require_once '../../config/db.php';

header("Access-Control-Allow-Origin: http://127.0.0.1:5500");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id']) || !isset($data['user_id'])) {
    echo json_encode(["success" => false, "message" => "Address ID and user_id are required"]);
    exit;
}

$address_id = intval($data['id']);
$user_id = intval($data['user_id']);

// Check how many billing addresses the user has
$count_res = $conn->query("SELECT COUNT(*) as total FROM billing_addresses WHERE user_id = $user_id");
$count_row = $count_res->fetch_assoc();

if ($count_row['total'] <= 1) {
    echo json_encode(["success" => false, "message" => "You must have at least one billing address"]);
    exit;
}

// Check if deleting default address
$check_default = $conn->query("SELECT is_default FROM billing_addresses WHERE id = $address_id");
$default_row = $check_default->fetch_assoc();
$is_default = $default_row['is_default'];

// Delete the address
$conn->query("DELETE FROM billing_addresses WHERE id = $address_id AND user_id = $user_id");

// If deleted address was default → assign new default to latest remaining address
if ($is_default == 1) {
    $conn->query("
        UPDATE billing_addresses 
        SET is_default = 1 
        WHERE user_id = $user_id 
        ORDER BY created_at DESC 
        LIMIT 1
    ");
}

echo json_encode([
    "success" => true,
    "message" => "Billing address deleted successfully"
]);

$conn->close();
?>
