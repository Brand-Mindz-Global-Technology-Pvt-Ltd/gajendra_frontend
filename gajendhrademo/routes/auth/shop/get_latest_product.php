<?php
require_once '../../../config/db.php';

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Content-Type: application/json');

// Get seasonal products (latest 3)
$query = "
    SELECT 
        p.id, 
        p.name, 
        p.price, 
        p.description,
        CONCAT(
            'https://narpavihoney.brandmindz.com/routes/uploads/products/', 
            (SELECT image_path FROM product_images WHERE product_id = p.id LIMIT 1)
        ) AS image
    FROM products p
    ORDER BY p.created_at DESC
    LIMIT 3
";

$result = mysqli_query($conn, $query);
$response = [];

if (mysqli_num_rows($result) > 0) {
    $products = [];

    while ($row = mysqli_fetch_assoc($result)) {
        // If no image found, give default no-image
        if (!$row['image'] || !str_contains($row['image'], '.')) {
            $row['image'] = "https://narpavihoney.brandmindz.com/routes/uploads/products/no-image.png";
        }

        $products[] = $row;
    }

    echo json_encode([
        "success" => true,
        "products" => $products
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "No products found"
    ]);
}
?>
