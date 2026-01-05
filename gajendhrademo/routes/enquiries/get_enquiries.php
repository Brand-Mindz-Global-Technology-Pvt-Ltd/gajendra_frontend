<?php
date_default_timezone_set('Asia/Kolkata');

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

require_once '../../config/db.php';

$sql = "SELECT id, name, email, phone, message, created_at FROM enquiries ORDER BY id DESC";
$result = $conn->query($sql);

$enquiries = [];

while ($row = $result->fetch_assoc()) {
    $enquiries[] = $row;
}

echo json_encode([
    "success" => true,
    "data" => $enquiries
]);

$conn->close();
?>
