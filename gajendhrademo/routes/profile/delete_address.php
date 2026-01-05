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

$address_id = $_POST['address_id'] ?? '';
$user_id = $_POST['user_id'] ?? '';

if (!$address_id || !$user_id) {
    echo json_encode(['status' => 'error', 'message' => 'Address ID and User ID are required']);
    exit;
}

// Optional rule:
// Prevent deleting default address — enable if needed
// $check = $conn->query("SELECT is_default FROM user_addresses WHERE id = $address_id")->fetch_assoc();
// if ($check['is_default'] == 1) {
//     echo json_encode(['status' => 'error', 'message' => 'Cannot delete default address. Set another address as default first.']);
//     exit;
// }

try {
    $stmt = $conn->prepare("DELETE FROM user_addresses WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $address_id, $user_id);
    
    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Address deleted successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to delete address']);
    }
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
