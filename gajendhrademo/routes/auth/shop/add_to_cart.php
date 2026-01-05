<?php
require_once '../../../config/db.php';

// CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
    exit;
}

// Read JSON body (if sent)
$raw = file_get_contents("php://input");
$json = json_decode($raw, true);

// Support both JSON & Form-Data
$user_id    = $json['user_id']    ?? ($_POST['user_id'] ?? 0);
$product_id = $json['product_id'] ?? ($_POST['product_id'] ?? 0);
$quantity   = $json['quantity']   ?? ($_POST['quantity'] ?? 1);

$user_id    = intval($user_id);
$product_id = intval($product_id);
$quantity   = intval($quantity);

// Validate
if ($user_id === 0 || $product_id === 0) {
    echo json_encode([
        "success" => false,
        "message" => "user_id and product_id are required",
        "debug"   => ["user_id" => $user_id, "product_id" => $product_id]
    ]);
    exit;
}

// Check if user exists (avoid FK error)
$user_check = $conn->prepare("SELECT id FROM users WHERE id = ?");
$user_check->bind_param("i", $user_id);
$user_check->execute();
$u_res = $user_check->get_result();

if ($u_res->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Invalid user_id"]);
    exit;
}

// Check if product exists in cart
$stmt = $conn->prepare("SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?");
$stmt->bind_param("ii", $user_id, $product_id);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {

    $new_quantity = $row['quantity'] + $quantity;

    $update_stmt = $conn->prepare("UPDATE cart SET quantity = ? WHERE id = ?");
    $update_stmt->bind_param("ii", $new_quantity, $row['id']);
    $update_stmt->execute();

    echo json_encode(["success" => true, "message" => "Cart updated", "quantity" => $new_quantity]);
    exit;
}

// Insert new cart item
$insert_stmt = $conn->prepare("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)");
$insert_stmt->bind_param("iii", $user_id, $product_id, $quantity);

if ($insert_stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Product added to cart"]);
} else {
    echo json_encode(["success" => false, "message" => "Insert failed", "error" => $insert_stmt->error]);
}

?>
