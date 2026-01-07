<?php
require_once '../../../config/db.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

ini_set('display_errors', 1);
error_reporting(E_ALL);

$category_id    = isset($_GET['category_id']) ? intval($_GET['category_id']) : null;
$subcategory_id = isset($_GET['subcategory_id']) ? intval($_GET['subcategory_id']) : null;
$min_price      = isset($_GET['min_price']) ? intval($_GET['min_price']) : null;
$max_price      = isset($_GET['max_price']) ? intval($_GET['max_price']) : null;
$page           = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit          = isset($_GET['limit']) ? intval($_GET['limit']) : 8;

$offset = ($page - 1) * $limit;

$imageBaseURL = "https://narpavihoney.brandmindz.com/routes/uploads/products/";

// Base condition query
$where = " WHERE 1=1";

if (!empty($category_id))    $where .= " AND category_id = $category_id";
if (!empty($subcategory_id)) $where .= " AND subcategory_id = $subcategory_id";

// Query to get total count
$countQuery = "SELECT COUNT(*) as total FROM products $where";
$countResult = mysqli_query($conn, $countQuery);
$total = mysqli_fetch_assoc($countResult)['total'];

// Main query with LIMIT + OFFSET
$productQuery = "SELECT * FROM products $where ORDER BY id DESC LIMIT $offset, $limit";
$result = mysqli_query($conn, $productQuery);

$products = [];

while ($row = mysqli_fetch_assoc($result)) {
    
    // Decode variations JSON
    $row['variations'] = !empty($row['variations'])
        ? json_decode($row['variations'], true)
        : [];

    // Price filter applied on variations
    if (!empty($min_price) || !empty($max_price)) {
        $row['variations'] = array_filter($row['variations'], function($v) use ($min_price, $max_price){
            if (!empty($min_price) && $v['amount'] < $min_price) return false;
            if (!empty($max_price) && $v['amount'] > $max_price) return false;
            return true;
        });

        // Skip product if no matching variations
        if (empty($row['variations'])) continue;
    }

    // Get product images
    $img_q = mysqli_query($conn,
        "SELECT image_path FROM product_images WHERE product_id = ".$row['id']
    );
    $images = [];
    while ($img = mysqli_fetch_assoc($img_q)) {
        $images[] = $imageBaseURL . $img['image_path'];
    }
    if (empty($images)) $images[] = $imageBaseURL . "no-image.png";
    $row['images'] = $images;

    $products[] = $row;
}

echo json_encode([
    "success" => true,
    "total" => $total,
    "page" => $page,
    "limit" => $limit,
    "products" => $products
]);

mysqli_close($conn);
?>