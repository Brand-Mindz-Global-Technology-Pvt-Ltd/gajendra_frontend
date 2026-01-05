<?php
date_default_timezone_set('Asia/Kolkata');

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

require_once '../../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

$enquiryId = $data['id'] ?? '';

if (!$enquiryId) {
    echo json_encode(["success" => false, "message" => "Enquiry ID is required"]);
    exit;
}

$stmt = $conn->prepare("DELETE FROM enquiries WHERE id = ?");
$stmt->bind_param("i", $enquiryId);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Enquiry deleted"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to delete"]);
}

$stmt->close();
$conn->close();
?>
