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

    try {
        // Get all categories with product counts from all shops
        $query = "
            SELECT 
                c.id,
                c.name,
                c.slug,
                c.shop_id,
                s.name as shop_name,
                COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN shops s ON c.shop_id = s.id
            LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
            GROUP BY c.id, c.name, c.slug, c.shop_id, s.name
            HAVING COUNT(p.id) > 0
            ORDER BY c.name ASC
        ";
        
        $stmt = $conn->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $categories = [];
        while ($row = $result->fetch_assoc()) {
            $categories[] = [
                'id' => (int)$row['id'],
                'name' => $row['name'],
                'slug' => $row['slug'],
                'shop_id' => (int)$row['shop_id'],
                'shop_name' => $row['shop_name'],
                'product_count' => (int)$row['product_count']
            ];
        }
        
        $stmt->close();
        
        if (count($categories) > 0) {
            echo json_encode([
                "success" => true,
                "message" => "Categories retrieved successfully",
                "categories" => $categories,
                "total_categories" => count($categories)
            ]);
        } else {
            echo json_encode([
                "success" => true,
                "message" => "No categories found",
                "categories" => [],
                "total_categories" => 0
            ]);
        }
        
    } catch (Exception $e) {
        error_log("Get All Categories API error: " . $e->getMessage());
        echo json_encode([
            "success" => false,
            "message" => "Failed to retrieve categories. Please try again later."
        ]);
    } finally {
        if (isset($conn)) {
            $conn->close();
        }
    }
};
?>

