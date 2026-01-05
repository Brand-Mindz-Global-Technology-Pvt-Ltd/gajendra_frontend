<?php
// get_default_billing_address.php

require_once '../../config/db.php';

header("Access-Control-Allow-Origin: http://127.0.0.1:5500");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if (!isset($_GET['user_id'])) {
    echo json_encode(["success" => false, "message" => "user_id is required"]);
    exit;
}

$user_id = intval($_GET['user_id']);

$sql = "SELECT * FROM billing_addresses WHERE user_id = ? AND is_default = 1 LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$address = $result->fetch_assoc();

if ($address) {
    echo json_encode(["success" => true, "address" => $address]);
} else {
    echo json_encode(["success" => true, "address" => null]);
}

$stmt->close();
$conn->close();
?>
