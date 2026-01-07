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

    $category_id = isset($_GET['category_id']) ? intval($_GET['category_id']) : 0;
    $exclude_product_id = isset($_GET['exclude_product_id']) ? intval($_GET['exclude_product_id']) : 0;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 8;

    if ($category_id === 0) {
        echo json_encode(["success" => false, "message" => "category_id is required"]);
        exit;
    }

    // Build the query to get products by category
    $query = "
        SELECT p.id, p.name, p.slug, p.description, p.price, p.stock, 
               p.is_new_arrival, p.status, p.shop_id, c.name AS category_name, s.name AS shop_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN shops s ON p.shop_id = s.id
        WHERE p.category_id = ? AND p.status = 'active'
    ";
    
    $params = [$category_id];
    $param_types = "i";
    
    // Exclude current product if specified
    if ($exclude_product_id > 0) {
        $query .= " AND p.id != ?";
        $params[] = $exclude_product_id;
        $param_types .= "i";
    }
    
    $query .= " ORDER BY p.is_new_arrival DESC, p.id DESC LIMIT ?";
    $params[] = $limit;
    $param_types .= "i";

    $stmt = $conn->prepare($query);
    $stmt->bind_param($param_types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();

    $products = [];
    while ($row = $result->fetch_assoc()) {
        // Fetch images for each product
        $img_stmt = $conn->prepare("SELECT image_path FROM product_images WHERE product_id = ? LIMIT 1");
        $img_stmt->bind_param("i", $row['id']);
        $img_stmt->execute();
        $img_result = $img_stmt->get_result();
        
        if ($img_row = $img_result->fetch_assoc()) {
            $row['image'] = $img_row['image_path'];
        } else {
            $row['image'] = null;
        }
        $img_stmt->close();
        
        $products[] = $row;
    }
    $stmt->close();

    echo json_encode(["success" => true, "products" => $products]);

    $conn->close();
};
