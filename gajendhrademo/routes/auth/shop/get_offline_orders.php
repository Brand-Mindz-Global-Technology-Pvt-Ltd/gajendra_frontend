<?php
require_once '../../../config/db.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

ini_set('display_errors', 1);
error_reporting(E_ALL);

/* =========================
   INPUT PARAMS
========================= */
$page  = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$limit = isset($_GET['limit']) ? max(1, intval($_GET['limit'])) : 10;

$offset = ($page - 1) * $limit;

/* =========================
   TOTAL COUNT
========================= */
$countQuery  = "SELECT COUNT(*) AS total FROM offline_orders";
$countResult = mysqli_query($conn, $countQuery);
$total       = mysqli_fetch_assoc($countResult)['total'];

/* =========================
   FETCH ORDERS
   (Join products if needed)
========================= */
$query = "
    SELECT 
        o.offline_order_id,
        o.product_id,
        p.name,
        o.customer_name,
        o.quantity,
        o.amount,
        o.payment_method,
        o.description,
        o.order_date
    FROM offline_orders o
    LEFT JOIN products p ON p.id = o.product_id
    ORDER BY o.offline_order_id DESC
    LIMIT $offset, $limit
";

$result = mysqli_query($conn, $query);

$orders = [];

while ($row = mysqli_fetch_assoc($result)) {
    $orders[] = $row;
}

/* =========================
   RESPONSE
========================= */
echo json_encode([
    "success" => true,
    "total"   => intval($total),
    "page"    => $page,
    "limit"   => $limit,
    "orders"  => $orders
]);

mysqli_close($conn);
