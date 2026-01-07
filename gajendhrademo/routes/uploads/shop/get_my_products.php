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

    $shop_id = isset($_GET['shop_id']) ? intval($_GET['shop_id']) : 0;

    if ($shop_id === 0) {
        echo json_encode(["success" => false, "message" => "shop_id is required"]);
        exit;
    }

    // Fetch products with main details
    $stmt = $conn->prepare("
    SELECT p.id, p.name, p.slug, p.description, p.full_description, p.key_benefits, p.price, p.stock, p.status, p.is_new_arrival, c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.shop_id = ?
    ORDER BY p.created_at DESC
");
    $stmt->bind_param("i", $shop_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $products = [];
    while ($row = $result->fetch_assoc()) {
        $product_id = $row['id'];

        // Fetch images for each product
        $img_stmt = $conn->prepare("SELECT image_path FROM product_images WHERE product_id = ?");
        $img_stmt->bind_param("i", $product_id);
        $img_stmt->execute();
        $img_result = $img_stmt->get_result();

        $images = [];
        while ($img_row = $img_result->fetch_assoc()) {
            $images[] = $img_row['image_path'];
        }
        $img_stmt->close();

        $row['images'] = $images;
        $products[] = $row;
    }

    if (count($products) > 0) {
        echo json_encode(["success" => true, "products" => $products]);
    } else {
        echo json_encode(["success" => false, "message" => "No products found"]);
    }

    $stmt->close();
    $conn->close();
};
