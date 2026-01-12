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

    // Get category ID or slug from request
    $categoryId = isset($_GET['category_id']) ? intval($_GET['category_id']) : 0;
    $categorySlug = isset($_GET['category_slug']) ? trim($_GET['category_slug']) : '';
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 8; // Default 8 products

    // Validate input
    if ($categoryId === 0 && empty($categorySlug)) {
        echo json_encode(["success" => false, "message" => "Category ID or slug is required"]);
        exit;
    }

    // Build query to get products by category
    if ($categoryId > 0) {
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
                c.name AS category_name,
                c.slug AS category_slug,
                s.name AS shop_name
            FROM products p
            INNER JOIN categories c ON p.category_id = c.id
            INNER JOIN shops s ON p.shop_id = s.id
            WHERE p.category_id = ? AND p.status = 'active'
            ORDER BY p.updated_at DESC
            LIMIT ?
        ";
        $params = [$categoryId, $limit];
        $types = "ii";
    } else {
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
                c.name AS category_name,
                c.slug AS category_slug,
                s.name AS shop_name
            FROM products p
            INNER JOIN categories c ON p.category_id = c.id
            INNER JOIN shops s ON p.shop_id = s.id
            WHERE c.slug = ? AND p.status = 'active'
            ORDER BY p.updated_at DESC
            LIMIT ?
        ";
        $params = [$categorySlug, $limit];
        $types = "si";
    }

    $stmt = $conn->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Database prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param($types, ...$params);
    
    if (!$stmt->execute()) {
        throw new Exception("Database execute failed: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    $products = [];
    
    while ($row = $result->fetch_assoc()) {
        $product_id = $row['id'];
        
        // Fetch main image for each product
        $img_stmt = $conn->prepare("SELECT image_path FROM product_images WHERE product_id = ? LIMIT 1");
        $img_stmt->bind_param("i", $product_id);
        $img_stmt->execute();
        $img_result = $img_stmt->get_result();
        $img_row = $img_result->fetch_assoc();
        $row['image'] = $img_row ? $img_row['image_path'] : null;
        $img_stmt->close();

        // Build robust formatted price: supports JSON map or numeric
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

        $products[] = [
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
            'image' => $row['image']
        ];
    }
    
    $stmt->close();

    if (count($products) > 0) {
        echo json_encode([
            "success" => true,
            "message" => "Products retrieved successfully",
            "data" => [
                "products" => $products,
                "count" => count($products),
                "category_id" => $categoryId,
                "category_slug" => $categorySlug
            ]
        ]);
    } else {
        echo json_encode([
            "success" => true,
            "message" => "No products found for this category",
            "data" => [
                "products" => [],
                "count" => 0,
                "category_id" => $categoryId,
                "category_slug" => $categorySlug
            ]
        ]);
    }

} catch (Exception $e) {
    // Log the error for debugging
    error_log("Get Products by Category Tab API error: " . $e->getMessage());

    // Return error response
    echo json_encode([
        "success" => false,
        "message" => "Failed to retrieve products. Please try again later."
    ]);
} finally {
    // Close database connection if needed
    if (isset($conn)) {
        $conn->close();
    }
}
};
