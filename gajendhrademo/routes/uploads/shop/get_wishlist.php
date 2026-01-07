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

    $user_id = intval($_GET['user_id'] ?? 0);
    if (!$user_id) {
        echo json_encode(['success' => false, 'message' => 'User ID required']);
        exit;
    }

    // Fetch wishlist with product details
    $query = "
        SELECT w.id AS wishlist_id, w.product_id, p.product_name, p.price, p.image_url
        FROM wishlist w
        JOIN products p ON w.product_id = p.id
        WHERE w.user_id = ?
        ORDER BY w.created_at DESC
    ";

    $stmt = $db->prepare($query);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $wishlist = [];
    while ($row = $result->fetch_assoc()) {
        $wishlist[] = $row;
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'count' => count($wishlist),
            'products' => $wishlist
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
