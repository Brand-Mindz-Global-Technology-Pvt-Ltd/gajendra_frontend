<?php
require_once '../../../config/db.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

ini_set('display_errors', 1);
error_reporting(E_ALL);

/* =========================
   READ INPUT (JSON)
========================= */
$data = json_decode(file_get_contents("php://input"), true);

/* =========================
   VALIDATE REQUIRED FIELDS
========================= */
if (
    empty($data['product_id']) ||
    empty($data['customer_name']) ||
    empty($data['quantity']) ||
    empty($data['amount'])
) {
    echo json_encode([
        "success" => false,
        "message" => "Required fields missing"
    ]);
    exit;
}

/* =========================
   SANITIZE INPUTS
========================= */
$product_id     = intval($data['product_id']);
$customer_name  = mysqli_real_escape_string($conn, trim($data['customer_name']));
$quantity       = intval($data['quantity']);
$amount         = intval($data['amount']);

$payment_method = !empty($data['payment_method'])
    ? mysqli_real_escape_string($conn, trim($data['payment_method']))
    : null;

$description = !empty($data['description'])
    ? mysqli_real_escape_string($conn, trim($data['description']))
    : null;

/* =========================
   INSERT QUERY (WITH DATE CONDITION)
========================= */
$query = "
    INSERT INTO offline_orders
    (
        product_id,
        customer_name,
        quantity,
        amount,
        payment_method,
        description,
        order_date
    )
    VALUES
    (
        $product_id,
        '$customer_name',
        $quantity,
        $amount,
        " . ($payment_method ? "'$payment_method'" : "NULL") . ",
        " . ($description ? "'$description'" : "NULL") . ",
        NOW()
    )
";

$result = mysqli_query($conn, $query);

/* =========================
   RESPONSE
========================= */
if ($result) {
    echo json_encode([
        "success" => true,
        "message" => "Offline order inserted successfully",
        "offline_order_id" => mysqli_insert_id($conn)
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Insert failed",
        "error"   => mysqli_error($conn)
    ]);
}

mysqli_close($conn);
