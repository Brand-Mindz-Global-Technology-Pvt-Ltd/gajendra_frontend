<?php
${basename(__FILE__, '.php')} = function () {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(["success" => false, "message" => "Invalid request method"]);
        exit;
    }

    $conn = Database::getConnection();

$order_id = isset($_POST['order_id']) ? intval($_POST['order_id']) : 0;
$status     = isset($_POST['status']) ? $_POST['status'] : '';

if ($order_id === 0 || !in_array($status, ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])) {
    echo json_encode(["success" => false, "message" => "Invalid input"]);
    exit;
}

$stmt = $conn->prepare("UPDATE orders SET status = ? WHERE id = ?");
$stmt->bind_param("si", $status, $order_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Order status updated to $status"]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
};
