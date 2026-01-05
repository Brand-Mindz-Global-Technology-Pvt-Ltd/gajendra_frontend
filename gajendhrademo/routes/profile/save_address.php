<?php
require_once '../../config/db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
    exit;
}

$user_id = $_POST['user_id'] ?? '';
$address_id = $_POST['address_id'] ?? '';  // empty means add new
$address_type = $_POST['address_type'] ?? 'Home';
$full_name = $_POST['full_name'] ?? '';
$phone = $_POST['phone'] ?? '';
$line1 = $_POST['address_line1'] ?? '';
$line2 = $_POST['address_line2'] ?? '';
$city = $_POST['city'] ?? '';
$state = $_POST['state'] ?? '';
$pincode = $_POST['pincode'] ?? '';
$country = $_POST['country'] ?? 'India';
$landmark = $_POST['landmark'] ?? '';
$is_default = $_POST['is_default'] ?? 0;

if (!$user_id) {
    echo json_encode(['status' => 'error', 'message' => 'User ID is required']);
    exit;
}

if (!$full_name || !$phone || !$line1 || !$city || !$state || !$pincode) {
    echo json_encode(['status' => 'error', 'message' => 'All required fields must be filled']);
    exit;
}

// If this is default, remove default from others
if ($is_default == 1) {
    $conn->query("UPDATE user_addresses SET is_default = 0 WHERE user_id = $user_id");
}

if ($address_id == '') {
    // ----------------------
    //  ADD NEW ADDRESS
    // ----------------------
    $stmt = $conn->prepare("
        INSERT INTO user_addresses 
        (user_id, address_type, full_name, phone, address_line1, address_line2,
         city, state, pincode, country, landmark, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->bind_param(
        "isssssssssii",
        $user_id,
        $address_type,
        $full_name,
        $phone,
        $line1,
        $line2,
        $city,
        $state,
        $pincode,
        $country,
        $landmark,
        $is_default
    );

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Address added successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to add address']);
    }
} else {
    // ----------------------
    //  UPDATE EXISTING ADDRESS
    // ----------------------
    $stmt = $conn->prepare("
        UPDATE user_addresses
        SET 
            address_type = ?,
            full_name = ?,
            phone = ?,
            address_line1 = ?,
            address_line2 = ?,
            city = ?,
            state = ?,
            pincode = ?,
            country = ?,
            landmark = ?,
            is_default = ?
        WHERE id = ? AND user_id = ?
    ");

    $stmt->bind_param(
        "ssssssssssiii",
        $address_type,
        $full_name,
        $phone,
        $line1,
        $line2,
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
        echo json_encode(['status' => 'success', 'message' => 'Address updated successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to update address']);
    }
}
