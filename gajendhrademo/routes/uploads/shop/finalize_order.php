<?php
${basename(__FILE__, '.php')} = function () {
    header('Content-Type: application/json');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(["success" => false, "message" => "Invalid request method"]);
        exit;
    }

    $conn = Database::getConnection();

    $user_id = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;
    $session_id = isset($_POST['session_id']) ? trim($_POST['session_id']) : '';
    $rzp_payment_id = isset($_POST['razorpay_payment_id']) ? trim($_POST['razorpay_payment_id']) : '';
    $shipping_address = isset($_POST['shipping_address']) ? trim($_POST['shipping_address']) : null;
    $billing_address = isset($_POST['billing_address']) ? trim($_POST['billing_address']) : null;

    if ($user_id === 0 && $session_id === '') {
        echo json_encode(["success" => false, "message" => "user_id or session_id is required"]);
        exit;
    }
    if ($rzp_payment_id === '') {
        echo json_encode(["success" => false, "message" => "razorpay_payment_id is required"]);
        exit;
    }
    // Check if shipping_address is provided. If not, fallback to 'N/A' or similar default.
    if ($shipping_address === null || $shipping_address === '') {
        $shipping_address = 'N/A';
    }
    // Check if billing_address is provided. If not, fallback to 'N/A' or similar default.
    if ($billing_address === null || $billing_address === '') {
        $billing_address = 'N/A';
    }

    // Resolve cart id: prefer session cart (guest) if provided, else fallback to user cart
    $cart_id = null;
    if ($session_id !== '') {
        $stmt = $conn->prepare("SELECT id FROM carts WHERE session_id = ? ORDER BY id DESC LIMIT 1");
        $stmt->bind_param("s", $session_id);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($row = $res->fetch_assoc()) {
            $cart_id = intval($row['id']);
        }
        $stmt->close();
    }
    if (!$cart_id && $user_id > 0) {
        $stmt = $conn->prepare("SELECT id FROM carts WHERE user_id = ? ORDER BY id DESC LIMIT 1");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($row = $res->fetch_assoc()) {
            $cart_id = intval($row['id']);
        }
        $stmt->close();
    }

    if (!$cart_id) {
        echo json_encode(["success" => false, "message" => "Cart not found"]);
        exit;
    }

    // Load cart items with product prices
    $items_stmt = $conn->prepare("SELECT ci.product_id, ci.quantity, ci.price FROM cart_items ci WHERE ci.cart_id = ?");
    $items_stmt->bind_param("i", $cart_id);
    $items_stmt->execute();
    $items_res = $items_stmt->get_result();

    $items = [];
    $total_amount = 0.0;
    while ($r = $items_res->fetch_assoc()) {
        $qty = intval($r['quantity']);
        $price = floatval($r['price']);
        $total_amount += ($qty * $price);
        $items[] = [
            'product_id' => intval($r['product_id']),
            'quantity' => $qty,
            'price' => $price,
        ];
    }
    $items_stmt->close();

    if (count($items) === 0) {
        echo json_encode(["success" => false, "message" => "Cart is empty"]);
        exit;
    }

    // Begin transaction
    $conn->begin_transaction();
    try {
        $order_number = 'ORD-' . date('YmdHis') . '-' . bin2hex(random_bytes(3));
        $status = 'confirmed';
        $payment_status = 'paid';
        $payment_method = 'razorpay';

        $ins_order = $conn->prepare("INSERT INTO orders (user_id, order_number, total_amount, status, shipping_address, billing_address, payment_method, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $ins_order->bind_param("isdsssss", $user_id, $order_number, $total_amount, $status, $shipping_address, $billing_address, $payment_method, $payment_status);
        if (!$ins_order->execute()) {
            throw new Exception('Failed to insert order: ' . $ins_order->error);
        }
        $order_id = $ins_order->insert_id;
        $ins_order->close();

        // Insert order items
        $ins_item = $conn->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
        foreach ($items as $it) {
            $pid = $it['product_id'];
            $qty = $it['quantity'];
            $prc = $it['price'];
            $ins_item->bind_param("iiid", $order_id, $pid, $qty, $prc);
            if (!$ins_item->execute()) {
                throw new Exception('Failed to insert order item: ' . $ins_item->error);
            }
        }
        $ins_item->close();

        // Clear cart
        $del_items = $conn->prepare("DELETE FROM cart_items WHERE cart_id = ?");
        $del_items->bind_param("i", $cart_id);
        $del_items->execute();
        $del_items->close();

        $del_cart = $conn->prepare("DELETE FROM carts WHERE id = ?");
        $del_cart->bind_param("i", $cart_id);
        $del_cart->execute();
        $del_cart->close();

        $conn->commit();

        echo json_encode([
            'success' => true,
            'message' => 'Order finalized',
            'order_id' => $order_id,
            'order_number' => $order_number,
            'total_amount' => $total_amount,
            'razorpay_payment_id' => $rzp_payment_id,
        ]);
    } catch (Exception $ex) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => $ex->getMessage()]);
    }

    $conn->close();
};


