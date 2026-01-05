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

        // Make shop_id optional: if not provided or invalid, fetch across all shops
        $shop_id = null;
        if (isset($_GET['shop_id']) && $_GET['shop_id'] !== '' && is_numeric($_GET['shop_id'])) {
            $shop_id = intval($_GET['shop_id']);
        }
        // Accept both human labels and flag-style values
        $raw_filter = isset($_GET['filter']) ? trim($_GET['filter']) : 'best sellers';
        $filter_type = strtolower($raw_filter);

        // Build query based on filter type
        $query = "
            SELECT p.id, p.name, p.slug, p.description, p.price, p.stock, p.is_new_arrival, 
                   p.status, p.shop_id, p.best_sale, p.onsale, p.created_at,
                   c.name AS category_name, c.slug AS category_slug
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.status = 'active'
        ";

        $params = [];
        $types = "";

        if (!is_null($shop_id)) {
            $query .= " AND p.shop_id = ?";
            $params[] = $shop_id;
            $types .= "i";
        }

        // Apply filter based on type (robust mapping)
        switch ($filter_type) {
            // Best sellers synonyms
            case 'best sellers':
            case 'best_sellers':
            case 'best-sale':
            case 'best_sale':
            case 'best':
                $query .= " AND p.best_sale = 1";
                break;

            // On sale synonyms
            case 'on sale':
            case 'on_sale':
            case 'onsale':
            case 'sale':
                $query .= " AND p.onsale = 1";
                break;

            // New arrivals synonyms
            case 'new arrivals':
            case 'new_arrivals':
            case 'new-arrivals':
            case 'new':
            case 'is_new_arrival':
                $query .= " AND p.is_new_arrival = 1";
                break;

            default:
                // Default to best sellers if invalid filter
                $query .= " AND p.best_sale = 1";
                break;
        }

        $query .= " ORDER BY p.created_at DESC LIMIT 12";

        $stmt = $conn->prepare($query);
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result();

        $products = [];
        while ($row = $result->fetch_assoc()) {
            $product_id = $row['id'];

            // Fetch main image (spotlight image if available, otherwise first image)
            $img_query = "
                SELECT image_path 
                FROM product_images 
                WHERE product_id = ? 
                ORDER BY is_spotlight DESC, id ASC 
                LIMIT 1
            ";
            $img_stmt = $conn->prepare($img_query);
            $img_stmt->bind_param("i", $product_id);
            $img_stmt->execute();
            $img_result = $img_stmt->get_result();
            $img_row = $img_result->fetch_assoc();
            $row['image'] = $img_row ? $img_row['image_path'] : null;
            $img_stmt->close();

            // Format price (supports JSON map or numeric)
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

            // Add product URL
            $row['product_url'] = "product-details.html?slug=" . $row['slug'];

            // Add image URL
            $row['image_url'] = $row['image'] ? "uploads/products/" . $row['image'] : null;

            $products[] = $row;
        }

        $stmt->close();

        if (count($products) > 0) {
            echo json_encode([
                "success" => true,
                "products" => $products,
                "filter_type" => $raw_filter,
                "total_count" => count($products)
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "No products found for filter: " . $filter_type,
                "products" => [],
                "filter_type" => $filter_type
            ]);
        }
    } catch (Exception $e) {
        error_log("Slider Products API Error: " . $e->getMessage());
        echo json_encode([
            "success" => false,
            "message" => "Failed to fetch products. Please try again later."
        ]);
    } finally {
        if (isset($conn)) {
            $conn->close();
        }
    }
};
