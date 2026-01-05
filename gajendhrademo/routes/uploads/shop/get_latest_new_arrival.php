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

try {
    $conn = Database::getConnection();

    // Get the latest new arrival product
    $query = "
        SELECT 
            p.id,
            p.name,
            p.slug,
            p.description,
            p.price,
            p.stock,
            p.is_new_arrival,
            p.best_sale,
            p.status,
            p.shop_id,
            p.created_at,
            p.updated_at,
            c.name AS category_name,
            c.slug AS category_slug,
            s.name AS shop_name
        FROM products p
        INNER JOIN categories c ON p.category_id = c.id
        INNER JOIN shops s ON p.shop_id = s.id
        WHERE p.is_new_arrival = 1 AND p.status = 'active'
        ORDER BY p.created_at DESC
        LIMIT 1
    ";

    $stmt = $conn->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Database prepare failed: " . $conn->error);
    }
    
    if (!$stmt->execute()) {
        throw new Exception("Database execute failed: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode([
            "success" => true,
            "message" => "No new arrival products found",
            "data" => [
                "product" => null,
                "found" => false
            ]
        ]);
        exit;
    }
    
    $row = $result->fetch_assoc();
    $product_id = $row['id'];
    
    // Fetch all images for this product
    $img_stmt = $conn->prepare("SELECT image_path, is_spotlight FROM product_images WHERE product_id = ? ORDER BY is_spotlight DESC, created_at ASC");
    $img_stmt->bind_param("i", $product_id);
    $img_stmt->execute();
    $img_result = $img_stmt->get_result();
    $images = [];
    
    while ($img_row = $img_result->fetch_assoc()) {
        $images[] = [
            'image_path' => $img_row['image_path'],
            'is_spotlight' => (bool)$img_row['is_spotlight']
        ];
    }
    $img_stmt->close();
    
    $stmt->close();

    // Build robust formatted price and keep raw price (could be JSON map or numeric)
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
    $formattedPrice = '₹' . number_format($displayAmount, 2);

    $product = [
        'id' => (int)$row['id'],
        'name' => $row['name'],
        'slug' => $row['slug'],
        'description' => $row['description'],
        'price' => $row['price'],
        'formatted_price' => $formattedPrice,
        'stock' => (int)$row['stock'],
        'is_new_arrival' => (bool)$row['is_new_arrival'],
        'best_sale' => (bool)$row['best_sale'],
        'status' => $row['status'],
        'shop_id' => (int)$row['shop_id'],
        'category_name' => $row['category_name'],
        'category_slug' => $row['category_slug'],
        'shop_name' => $row['shop_name'],
        'created_at' => $row['created_at'],
        'updated_at' => $row['updated_at'],
        'images' => $images
    ];

    echo json_encode([
        "success" => true,
        "message" => "Latest new arrival product retrieved successfully",
        "data" => [
            "product" => $product,
            "found" => true
        ]
    ]);

} catch (Exception $e) {
    // Log the error for debugging
    error_log("Get Latest New Arrival API error: " . $e->getMessage());

    // Return error response
    echo json_encode([
        "success" => false,
        "message" => "Failed to retrieve new arrival product. Please try again later."
    ]);
} finally {
    // Close database connection if needed
    if (isset($conn)) {
        $conn->close();
    }
}
};
