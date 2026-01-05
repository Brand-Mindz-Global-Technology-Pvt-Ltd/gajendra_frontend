<?php
${basename(__FILE__, '.php')} = function () {
    header('Content-Type: application/json');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(["success" => false, "message" => "Invalid request method"]);
        exit;
    }

    $conn = Database::getConnection();

    // Collect input
    $product_id    = isset($_POST['id']) ? intval($_POST['id']) : (isset($_POST['product_id']) ? intval($_POST['product_id']) : 0);
    $name          = isset($_POST['name']) ? trim($_POST['name']) : '';
    $slug          = isset($_POST['slug']) ? trim($_POST['slug']) : '';
    $description   = isset($_POST['description']) ? trim($_POST['description']) : '';
    $full_description = isset($_POST['full_description']) ? trim($_POST['full_description']) : '';
    $key_benefits  = isset($_POST['key_benefits']) ? trim($_POST['key_benefits']) : '';
    // price now holds JSON (string)
    $price         = isset($_POST['price']) ? trim($_POST['price']) : '';
    $stock         = isset($_POST['stock']) ? intval($_POST['stock']) : 0;
    $is_new_arrival = isset($_POST['is_new_arrival']) && $_POST['is_new_arrival'] !== '' ? 1 : 0;
    $category_id   = isset($_POST['category_id']) ? intval($_POST['category_id']) : 0;
    $status        = isset($_POST['status']) ? $_POST['status'] : 'active';

    // Debug logging
    error_log("Edit Product API - Product ID: " . $product_id);
    error_log("Edit Product API - Name: " . $name);
    error_log("Edit Product API - Slug: " . $slug);
    error_log("Edit Product API - Price: " . $price);
    error_log("Edit Product API - Category ID: " . $category_id);
    error_log("Edit Product API - Status: " . $status);
    error_log("Edit Product API - Stock: " . $stock);
    error_log("Edit Product API - New Arrival: " . $is_new_arrival);

    // Validate
    if ($product_id === 0 || $name === '' || $slug === '' || $price <= 0 || $category_id === 0) {
        $error_details = [];
        if ($product_id === 0) $error_details[] = "Product ID is required";
        if ($name === '') $error_details[] = "Product name is required";
        if ($slug === '') $error_details[] = "Product slug is required";
        if ($price <= 0) $error_details[] = "Product price must be greater than 0";
        if ($category_id === 0) $error_details[] = "Product category is required";
        
        error_log("Edit Product API - Validation failed: " . implode(", ", $error_details));
        echo json_encode(["success" => false, "message" => "Missing or invalid product details: " . implode(", ", $error_details)]);
        exit;
    }

    // Update product
    // Try updating with full_description; if column doesn't exist, fall back gracefully.
    $stmt = $conn->prepare("UPDATE products 
    SET name = ?, slug = ?, description = ?, full_description = ?, key_benefits = ?, price = ?, stock = ?, is_new_arrival = ?, category_id = ?, status = ?
    WHERE id = ?");
    if ($stmt) {
        // types: s(name) s(slug) s(description) s(full_description) s(key_benefits) s(price-json) i(stock) i(is_new_arrival) i(category_id) s(status) i(id)
        $stmt->bind_param("ssssssiiisi", $name, $slug, $description, $full_description, $key_benefits, $price, $stock, $is_new_arrival, $category_id, $status, $product_id);
    } else {
        $stmt = $conn->prepare("UPDATE products 
        SET name = ?, slug = ?, description = ?, price = ?, stock = ?, is_new_arrival = ?, category_id = ?, status = ?
        WHERE id = ?");
        $stmt->bind_param("sssdiiisi", $name, $slug, $description, $price, $stock, $is_new_arrival, $category_id, $status, $product_id);
    }

    if ($stmt->execute()) {

        // If new images uploaded, replace old ones
        if (!empty($_FILES['images']['name'][0])) {
            $upload_dir = dirname(__DIR__) . '/uploads/products/';
            if (!is_dir($upload_dir)) {
                // Create directory with proper permissions
                if (!mkdir($upload_dir, 0755, true)) {
                    echo json_encode(["success" => false, "message" => "Failed to create upload directory"]);
                    exit;
                }
            }

            // Delete old images from DB
            $conn->query("DELETE FROM product_images WHERE product_id = $product_id");

            // Insert new images (up to 4)
            $image_count = count($_FILES['images']['name']);
            $uploaded_count = 0;
            
            for ($i = 0; $i < $image_count && $i < 4; $i++) {
                if ($_FILES['images']['error'][$i] === UPLOAD_ERR_OK) {
                    $image_name = time() . "_" . basename($_FILES['images']['name'][$i]);
                    $target_path = rtrim($upload_dir, '/\\') . '/' . $image_name;

                    if (move_uploaded_file($_FILES['images']['tmp_name'][$i], $target_path)) {
                        $img_stmt = $conn->prepare("INSERT INTO product_images (product_id, image_path) VALUES (?, ?)");
                        $img_stmt->bind_param("is", $product_id, $image_name);
                        if ($img_stmt->execute()) {
                            $uploaded_count++;
                        }
                        $img_stmt->close();
                    }
                }
            }
        }

        $message = "Product updated successfully";
        if (isset($uploaded_count) && $uploaded_count > 0) {
            $message .= " with {$uploaded_count} new image(s)";
        }
        echo json_encode(["success" => true, "message" => $message]);
    } else {
        echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
    }

    $stmt->close();
    $conn->close();
};
