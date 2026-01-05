<?php
// get_billing_addresses.php

require_once '../../config/db.php';

header("Access-Control-Allow-Origin: http://127.0.0.1:5500");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// GET user_id from query
if (!isset($_GET['user_id'])) {
    echo json_encode(["success" => false, "message" => "user_id is required"]);
    exit;
}

$user_id = intval($_GET['user_id']);

$sql = "SELECT * FROM billing_addresses WHERE user_id = ? ORDER BY created_at DESC";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$addresses = [];

while ($row = $result->fetch_assoc()) {
    $addresses[] = $row;
}

echo json_encode([
    "success" => true,
    "addresses" => $addresses
]);

$stmt->close();
$conn->close();
?>
