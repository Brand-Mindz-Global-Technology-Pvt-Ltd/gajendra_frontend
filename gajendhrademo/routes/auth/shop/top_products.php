<?php
header("Content-Type: application/json");
require_once "../../../config/db.php";

$viewBy = $_GET['viewBy'] ?? null;
$start  = $_GET['start'] ?? null;
$end    = $_GET['end'] ?? null;

$start = ($start === '') ? null : $start;
$end   = ($end === '') ? null : $end;

try {

    /* =========================
       DATE FILTER
    ========================= */

    $dateSql = "";

    if ($start && $end) {
        $dateSql = " AND DATE(o.created_at) BETWEEN '$start' AND '$end'";
    } 
    else if ($viewBy) {
        switch ($viewBy) {
            case "weekly":
                $dateSql = " AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
                break;

            case "monthly":
                $dateSql = " AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
                break;

            case "yearly":
                $dateSql = " AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)";
                break;
        }
    }

    /* =========================
       KPI METRICS
    ========================= */

    // ✅ Total Orders (ALL orders)
    $ordersRes = mysqli_query($conn, "
        SELECT COUNT(DISTINCT o.id) AS total_orders
        FROM orders o
        WHERE 1 $dateSql
    ");
    $totalOrders = (int)mysqli_fetch_assoc($ordersRes)['total_orders'];

    // ✅ User Orders (role = user)
    $userOrdersRes = mysqli_query($conn, "
        SELECT COUNT(DISTINCT o.id) AS user_orders
        FROM orders o
        JOIN users u ON u.id = o.user_id
        WHERE u.role = 'user' $dateSql
    ");
    $userOrders = (int)mysqli_fetch_assoc($userOrdersRes)['user_orders'];

    // ✅ Total Sales Amount (ALL orders)
 $salesRes = mysqli_query($conn, "
    SELECT IFNULL(SUM(oi.price * oi.quantity), 0) AS total_sales
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE 1 $dateSql
");
$totalSales = (float)mysqli_fetch_assoc($salesRes)['total_sales'];
/* =========================
   TOTAL PRODUCTS SOLD
========================= */

$productsRes = mysqli_query($conn, "
    SELECT IFNULL(SUM(oi.quantity), 0) AS total_products
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE 1 $dateSql
");
$totalProducts = (int)mysqli_fetch_assoc($productsRes)['total_products'];


    // ✅ Total Customers (role=user who placed orders)
    $customersRes = mysqli_query($conn, "
        SELECT COUNT(DISTINCT u.id) AS total_customers
        FROM users u
        JOIN orders o ON o.user_id = u.id
        WHERE u.role = 'user' $dateSql
    ");
    $totalCustomers = (int)mysqli_fetch_assoc($customersRes)['total_customers'];

    /* =========================
       TOP 5 ORDERED PRODUCTS
       (ALL ORDERS)
    ========================= */

    $topRes = mysqli_query($conn, "
        SELECT 
            p.name,
            SUM(oi.quantity) AS total_sold
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        JOIN products p ON p.id = oi.product_id
        WHERE 1 $dateSql
        GROUP BY p.id
        ORDER BY total_sold DESC
        LIMIT 5
    ");

    $topProducts = [];
    while ($row = mysqli_fetch_assoc($topRes)) {
        $topProducts[] = $row;
    }

    /* =========================
       FINAL RESPONSE
    ========================= */
echo json_encode([
    "success" => true,
    "metrics" => [
        "total_orders"    => $totalOrders,
        "user_orders"     => $userOrders,
        "total_products"  => $totalProducts,   // ✅ ADD THIS LINE
        "total_sales"     => $totalSales,
        "total_customers" => $totalCustomers
    ],
    "top_products" => $topProducts
]);


} catch (Exception $e) {

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
