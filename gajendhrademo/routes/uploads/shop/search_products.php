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

    // Params
    $q           = isset($_GET['q']) ? trim($_GET['q']) : '';
    $shop_id     = isset($_GET['shop_id']) ? intval($_GET['shop_id']) : 0;
    $category_id = isset($_GET['category_id']) ? intval($_GET['category_id']) : 0;
    $page        = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit       = isset($_GET['limit']) ? max(1, min(50, intval($_GET['limit']))) : 12;

    $offset = ($page - 1) * $limit;

    if ($q === '') {
        echo json_encode(["success" => false, "message" => "Query 'q' is required"]);
        exit;
    }

    // Base query (include one image via subquery)
    $query = "
        SELECT 
            p.id, p.name, p.slug, p.description, p.price, p.stock, p.is_new_arrival, p.status, p.shop_id,
            c.id AS category_id, c.name AS category_name, c.slug AS category_slug,
            (
              SELECT pi.image_path 
              FROM product_images pi 
              WHERE pi.product_id = p.id 
              ORDER BY pi.id ASC 
              LIMIT 1
            ) AS image_path
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.status = 'active' AND (
            p.name LIKE ? OR p.slug LIKE ? OR p.description LIKE ?
        )
    ";

    $params = [];
    $types  = '';

    // Bind search terms
    $like = '%' . $q . '%';
    $params[] = $like; $types .= 's';
    $params[] = $like; $types .= 's';
    $params[] = $like; $types .= 's';

    // Optional filters
    if ($shop_id > 0) {
        $query .= " AND p.shop_id = ?";
        $params[] = $shop_id; $types .= 'i';
    }
    if ($category_id > 0) {
        $query .= " AND p.category_id = ?";
        $params[] = $category_id; $types .= 'i';
    }

    // Ordering + pagination
    $query .= " ORDER BY p.created_at DESC LIMIT ? OFFSET ?";
    $params[] = $limit;  $types .= 'i';
    $params[] = $offset; $types .= 'i';

    // Execute
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        echo json_encode(["success" => false, "message" => "Database prepare failed"]);
        exit;
    }

    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();

    $products = [];
    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }

    $stmt->close();
    $conn->close();

    echo json_encode([
        "success" => true,
        "message" => "Search results",
        "products" => $products,
        "count" => count($products)
    ]);
};
?>
