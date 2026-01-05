<?php
// ==== CORS SETTINGS ====
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "../../config/Database.php";

try {
    $db = Database::getConnection();

    $input = json_decode(file_get_contents("php://input"), true) ?? $_POST;
    $user_id = intval($input['user_id'] ?? 0);
    $product_id = intval($input['product_id'] ?? 0);

    if (!$user_id || !$product_id) {
        echo json_encode(['success' => false, 'message' => 'User ID and Product ID required']);
        exit;
    }

    $stmt = $db->prepare("DELETE FROM wishlist WHERE user_id = ? AND product_id = ?");
    $stmt->bind_param("ii", $user_id, $product_id);

    if ($stmt->execute() && $stmt->affected_rows > 0) {
        echo json_encode(['success' => true, 'message' => 'Removed from wishlist']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Item not found']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
