<?php
header("Content-Type: application/json");
require_once "../../../config/db.php";

try {

    /* =========================
       STOCK SUMMARY (LAST 30 DAYS)
    ========================= */

    $res = mysqli_query($conn, "
        SELECT
            p.id,
            p.name AS product_name,
            p.stock AS stock_value,

            IFNULL(SUM(
                CASE 
                    WHEN o.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                    THEN oi.quantity
                    ELSE 0
                END
            ), 0) AS total_30_days_sold

        FROM products p
        LEFT JOIN order_items oi ON oi.product_id = p.id
        LEFT JOIN orders o ON o.id = oi.order_id

        GROUP BY p.id
        ORDER BY p.stock ASC
    ");

    $products = [];

    while ($row = mysqli_fetch_assoc($res)) {

        $avg30 = round($row['total_30_days_sold'] / 30, 2);

        $products[] = [
            "product_id"        => (int)$row['id'],
            "product_name"      => $row['product_name'],
            "stock_value"       => (int)$row['stock_value'],
            "avg_30_days_order" => $avg30
        ];
    }

    echo json_encode([
        "success" => true,
        "products" => $products
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
