<?php
// delete_cart_item.php

header('Content-Type: application/json');
require_once '../../../config/db.php';

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);

// Debug: log incoming data
error_log("Delete Cart POST Data: " . print_r($data, true));

if (!isset($data['id']) || !isset($data['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'id and user_id are required'
    ]);
    exit;
}

$id = intval($data['id']);
$user_id = intval($data['user_id']);

// Debug: log the values after conversion
error_log("id: $id, user_id: $user_id");

try {
    // Prepare delete query using `id` instead of cart_id
    $stmt = $conn->prepare("DELETE FROM cart WHERE id = ? AND user_id = ?");
    if(!$stmt){
        error_log("Prepare failed: " . $conn->error);
        throw new Exception("Prepare failed: " . $conn->error);
    }

    $stmt->bind_param("ii", $id, $user_id);

    if ($stmt->execute()) {
        error_log("Affected rows: " . $stmt->affected_rows);
        if ($stmt->affected_rows > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Cart item deleted successfully'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Cart item not found'
            ]);
        }
    } else {
        error_log("Execute failed: " . $stmt->error);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to delete cart item'
        ]);
    }

    $stmt->close();
} catch (Exception $e) {
    error_log("Exception: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
