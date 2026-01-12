<?php
// =====================================
// CORS CONFIG (MUST BE AT TOP)
// =====================================
header("Access-Control-Allow-Origin: *"); // change to your domain in prod
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// =====================================
// DB CONNECTION
// =====================================
require_once '../../../config/db.php';

ini_set('display_errors', 1);
error_reporting(E_ALL);

// =====================================
// INPUT PARAMETERS
// =====================================
$category_id     = isset($_GET['category_id']) ? (int)$_GET['category_id'] : null;
$subcategory_id  = isset($_GET['subcategory_id']) ? (int)$_GET['subcategory_id'] : null;
$min_price       = isset($_GET['min_price']) ? (int)$_GET['min_price'] : null;
$max_price       = isset($_GET['max_price']) ? (int)$_GET['max_price'] : null;
$is_best_seller  = isset($_GET['is_best_seller']) ? (int)$_GET['is_best_seller'] : null;
$page            = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$limit           = isset($_GET['limit']) ? max(1, (int)$_GET['limit']) : 8;

$offset = ($page - 1) * $limit;

// =====================================
// IMAGE BASE URL
// =====================================
$imageBaseURL = "https://gajendhrademo.brandmindz.com/routes/uploads/products/";

// =====================================
// WHERE CONDITIONS
// =====================================
$where = "WHERE 1=1";

if (!empty($category_id)) {
    $where .= " AND category_id = $category_id";
}

if (!empty($subcategory_id)) {
    $where .= " AND subcategory_id = $subcategory_id";
}

if ($is_best_seller !== null) {
    $where .= " AND is_best_seller = $is_best_seller";
}

// =====================================
// TOTAL COUNT (BEFORE PRICE FILTER)
// =====================================
$countQuery  = "SELECT COUNT(*) as total FROM products $where";
$countResult = mysqli_query($conn, $countQuery);
$total       = mysqli_fetch_assoc($countResult)['total'];

// =====================================
// MAIN QUERY
// =====================================
$productQuery = "
    SELECT *
    FROM products
    $where
    ORDER BY id DESC
    LIMIT $offset, $limit
";

$result = mysqli_query($conn, $productQuery);

$products = [];

// =====================================
// LOOP PRODUCTS
// =====================================
while ($row = mysqli_fetch_assoc($result)) {

    // ❌ Remove base price column
    unset($row['price']);

    // =================================
    // Decode variations JSON
    // =================================
    $variations = !empty($row['variations'])
        ? json_decode($row['variations'], true)
        : [];

    // =================================
    // PRICE FILTER USING VARIATIONS
    // =================================
    if ($min_price !== null || $max_price !== null) {
        $variations = array_values(array_filter($variations, function ($v) use ($min_price, $max_price) {
            if (!isset($v['price'])) return false;
            if ($min_price !== null && $v['price'] < $min_price) return false;
            if ($max_price !== null && $v['price'] > $max_price) return false;
            return true;
        }));
    }

    // Skip product if no variations after price filter
    if (($min_price !== null || $max_price !== null) && empty($variations)) {
        continue;
    }

    $row['variations'] = $variations;

    // =================================
    // IMAGE HANDLING
    // =================================
    if (!empty($row['images'])) {
        $imgs = json_decode($row['images'], true);
        $row['images'] = array_map(fn($img) => $imageBaseURL . $img, $imgs);
        $row['thumbnail'] = $imageBaseURL . $imgs[0];
    } else {
        $row['images'] = [];
        $row['thumbnail'] = null;
    }

    $products[] = $row;
}

// =====================================
// RESPONSE
// =====================================
echo json_encode([
    'status' => true,
    'page' => $page,
    'limit' => $limit,
    'total' => $total,
    'total_pages' => ceil($total / $limit),
    'products' => $products
]);
