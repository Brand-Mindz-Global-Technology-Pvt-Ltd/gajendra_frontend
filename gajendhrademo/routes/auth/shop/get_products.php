<?php
require_once '../../../config/db.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

ini_set('display_errors', 1);
error_reporting(E_ALL);

// =====================================================
// INPUTS
// =====================================================
$category_id    = isset($_GET['category_id']) ? intval($_GET['category_id']) : null;
$subcategory_id = isset($_GET['subcategory_id']) ? intval($_GET['subcategory_id']) : null;
$min_price      = isset($_GET['min_price']) ? intval($_GET['min_price']) : null;
$max_price      = isset($_GET['max_price']) ? intval($_GET['max_price']) : null;
$is_best_seller = isset($_GET['is_best_seller']) ? intval($_GET['is_best_seller']) : null;
$page           = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit          = isset($_GET['limit']) ? intval($_GET['limit']) : 8;

$offset = ($page - 1) * $limit;

$imageBaseURL = "https://gajendhrademo.brandmindz.com/routes/uploads/products/";

// =====================================================
// WHERE CONDITIONS
// =====================================================
$where = " WHERE 1=1";

if (!empty($category_id))     $where .= " AND category_id = $category_id";
if (!empty($subcategory_id))  $where .= " AND subcategory_id = $subcategory_id";
if ($is_best_seller !== null) $where .= " AND is_best_seller = $is_best_seller";

// =====================================================
// TOTAL COUNT
// =====================================================
$countQuery  = "SELECT COUNT(*) as total FROM products $where";
$countResult = mysqli_query($conn, $countQuery);
$total       = mysqli_fetch_assoc($countResult)['total'];

// =====================================================
// MAIN QUERY
// =====================================================
$productQuery = "
    SELECT *
    FROM products
    $where
    ORDER BY id DESC
    LIMIT $offset, $limit
";
$result = mysqli_query($conn, $productQuery);

$products = [];

// =====================================================
// LOOP PRODUCTS
// =====================================================
while ($row = mysqli_fetch_assoc($result)) {

    // ❌ REMOVE PRICE COLUMN FROM RESPONSE
    unset($row['price']);

    // Decode variations JSON
    $row['variations'] = !empty($row['variations'])
        ? json_decode($row['variations'], true)
        : [];

    // =================================================
    // PRICE FILTER (USING VARIATIONS ONLY)
    // =================================================
    if (!empty($min_price) || !empty($max_price)) {

        $row['variations'] = array_values(array_filter(
            $row['variation]()
