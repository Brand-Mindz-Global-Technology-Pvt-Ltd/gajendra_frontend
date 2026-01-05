<?php
${basename(__FILE__, '.php')} = function () {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        echo json_encode(["success" => false, "message" => "Invalid request method"]);
        exit;
    }

    $conn = Database::getConnection();

$shop_id     = isset($_GET['shop_id']) ? intval($_GET['shop_id']) : 0;
$category_id = isset($_GET['category_id']) ? intval($_GET['category_id']) : 0;
$new_arrival = isset($_GET['new_arrival']) ? intval($_GET['new_arrival']) : -1; // -1 = no filter

// Debug: Log the shop_id being used
error_log("Get Products API - shop_id: " . $shop_id);

// Base query - get products from all shops if no shop_id provided
if ($shop_id === 0) {
    // Get products from all shops
    $query = "
        SELECT p.id, p.name, p.price, p.stock, p.is_new_arrival, p.status, p.shop_id, c.name AS category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.status = 'active'
    ";
    $params = [];
    $types  = "";
    error_log("No shop_id provided, getting products from all shops");
} else {
    // Get products from specific shop
    $query = "
        SELECT p.id, p.name, p.price, p.stock, p.is_new_arrival, p.status, p.shop_id, c.name AS category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.shop_id = ? AND p.status = 'active'
    ";
    $params = [$shop_id];
    $types  = "i";
    error_log("Getting products for shop_id: " . $shop_id);
}

// Debug: Log the query
error_log("Get Products API - Query: " . $query);
error_log("Get Products API - Params: " . json_encode($params));

// Filter by category
if ($category_id > 0) {
    $query .= " AND p.category_id = ?";
    $params[] = $category_id;
    $types   .= "i";
}

// Filter by new_arrival
if ($new_arrival === 0 || $new_arrival === 1) {
    $query .= " AND p.is_new_arrival = ?";
    $params[] = $new_arrival;
    $types   .= "i";
}

$query .= " ORDER BY p.created_at DESC";

$stmt = $conn->prepare($query);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();

// Debug: Log number of rows found
error_log("Get Products API - Rows found: " . $result->num_rows);

$products = [];
while ($row = $result->fetch_assoc()) {
    $product_id = $row['id'];
    
    // Debug: Log each product found
    error_log("Get Products API - Product: " . json_encode($row));

    // Fetch one main image
    $img_stmt = $conn->prepare("SELECT image_path FROM product_images WHERE product_id = ? LIMIT 1");
    $img_stmt->bind_param("i", $product_id);
    $img_stmt->execute();
    $img_result = $img_stmt->get_result();
    $img_row = $img_result->fetch_assoc();
    $row['image'] = $img_row ? $img_row['image_path'] : null;
    $img_stmt->close();

    // Robust formatted_price: handle JSON map or numeric price
    $rawPrice = $row['price'];
    $displayAmount = null;
    if (is_string($rawPrice)) {
        $trim = trim($rawPrice);
        if (strlen($trim) && $trim[0] === '{') {
            $decoded = json_decode($trim, true);
            if (is_array($decoded)) {
                $keys = array_keys($decoded);
                if (!empty($keys)) {
                    $firstKey = $keys[0];
                    $displayAmount = floatval($decoded[$firstKey]);
                }
            }
        }
    }
    if ($displayAmount === null) {
        $displayAmount = floatval($rawPrice);
    }
    $row['formatted_price'] = '₹' . number_format($displayAmount, 2);

    $products[] = $row;
}

// Debug: Log final products array
error_log("Get Products API - Final products count: " . count($products));

if (count($products) > 0) {
    echo json_encode(["success" => true, "products" => $products]);
} else {
    echo json_encode(["success" => false, "message" => "No products found"]);
}

$stmt->close();
$conn->close();
};
