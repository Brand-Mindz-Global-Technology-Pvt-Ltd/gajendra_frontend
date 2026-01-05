<?php
header("Content-Type: application/json");
require_once "../../../config/db.php";

$viewBy = $_GET['viewBy'] ?? 'monthly';
$start  = $_GET['start'] ?? null;
$end    = $_GET['end'] ?? null;

/* Normalize empty values */
$start = ($start === '') ? null : $start;
$end   = ($end === '') ? null : $end;

try {

    /* =========================
       DATE FILTER LOGIC
    ========================= */
    $dateSql = "";

    if ($start && $end) {
        $dateSql = " AND DATE(o.created_at) BETWEEN '$start' AND '$end'";
    } else {
        switch ($viewBy) {
            case "weekly":
                $dateSql = " AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
                break;
            case "monthly":
                $dateSql = " AND MONTH(o.created_at) = MONTH(CURDATE())
                             AND YEAR(o.created_at) = YEAR(CURDATE())";
                break;
            case "yearly":
                $dateSql = " AND YEAR(o.created_at) = YEAR(CURDATE())";
                break;
        }
    }

    /* =========================
       KPI CARDS DATA
    ========================= */

    // 1️⃣ Total Orders
    $ordersRes = mysqli_query($conn, "
        SELECT COUNT(*) AS total_orders
        FROM orders o
        WHERE 1 $dateSql
    ");
    $totalOrders = mysqli_fetch_assoc($ordersRes)['total_orders'];

    // 2️⃣ Total Sales Amount
    $salesRes = mysqli_query($conn, "
        SELECT IFNULL(SUM(o.total_amount),0) AS total_sales
        FROM orders o
        WHERE 1 $dateSql
    ");
    $totalSales = mysqli_fetch_assoc($salesRes)['total_sales'];

    // 3️⃣ Total Customers Purchased (role = user)
    $customersRes = mysqli_query($conn, "
        SELECT COUNT(DISTINCT u.id) AS total_customers
        FROM users u
        JOIN orders o ON o.user_id = u.id
        WHERE u.role = 'user' $dateSql
    ");
    $totalCustomers = mysqli_fetch_assoc($customersRes)['total_customers'];

    /* =========================
       TOP SOLD PRODUCTS
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

    $top = [];
    while ($row = mysqli_fetch_assoc($topRes)) {
        $top[] = $row;
    }

    /* =========================
       LEAST SOLD PRODUCTS
    ========================= */
    $leastRes = mysqli_query($conn, "
        SELECT 
            p.name,
            IFNULL(SUM(oi.quantity),0) AS total_sold
        FROM products p
        LEFT JOIN order_items oi ON oi.product_id = p.id
        LEFT JOIN orders o ON o.id = oi.order_id $dateSql
        GROUP BY p.id
        ORDER BY total_sold ASC
        LIMIT 5
    ");

    $least = [];
    while ($row = mysqli_fetch_assoc($leastRes)) {
        $least[] = $row;
    }

    echo json_encode([
        "success" => true,
        "metrics" => [
            "total_orders"    => (int)$totalOrders,
            "total_sales"     => (float)$totalSales,
            "total_customers" => (int)$totalCustomers
        ],
        "top"   => $top,
        "least" => $least
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
