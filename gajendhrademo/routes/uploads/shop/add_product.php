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
    $shop_id       = isset($_POST['shop_id']) ? intval($_POST['shop_id']) : 0;
    $category_id   = isset($_POST['category_id']) ? intval($_POST['category_id']) : 0;
    $name          = isset($_POST['name']) ? trim($_POST['name']) : '';
    $slug          = isset($_POST['slug']) ? trim($_POST['slug']) : '';
    $description   = isset($_POST['description']) ? trim($_POST['description']) : '';
    $full_description = isset($_POST['full_description']) ? trim($_POST['full_description']) : '';
    $key_benefits  = isset($_POST['key_benefits']) ? trim($_POST['key_benefits']) : '';
    // price may be JSON string (variant map) or numeric
    $price         = isset($_POST['price']) ? trim($_POST['price']) : '';
    $stock         = isset($_POST['stock']) ? intval($_POST['stock']) : 0;
    $is_new_arrival = isset($_POST['is_new_arrival']) ? 1 : 0;

    // Validate
    // Validate: allow either valid JSON with at least one entry, or a positive numeric
    $priceIsValid = false;
    if ($price !== '') {
        if (is_numeric($price) && floatval($price) > 0) {
            $priceIsValid = true;
        } else {
            $decoded = json_decode($price, true);
            if (is_array($decoded) && count($decoded) > 0) {
                $priceIsValid = true;
            }
        }
    }
    if ($shop_id === 0 || $category_id === 0 || $name === '' || $slug === '' || !$priceIsValid) {
        echo json_encode(["success" => false, "message" => "Missing or invalid product details (price)"]);
        exit;
    }

    // Insert product (with optional full_description)
    $status = isset($_POST['status']) ? $_POST['status'] : 'active';

    $columns = "shop_id, category_id, name, slug, description, price, stock, is_new_arrival, status";
    $placeholders = "?, ?, ?, ?, ?, ?, ?, ?, ?";
    // Treat price as string (JSON) now
    $types = "iissssiis";
    $values = [$shop_id, $category_id, $name, $slug, $description, $price, $stock, $is_new_arrival, $status];

    // Try including full_description and key_benefits if columns exist. Fallbacks included.
    $stmt = $conn->prepare("INSERT INTO products ($columns, full_description, key_benefits) VALUES ($placeholders, ?, ?)");
    if ($stmt) {
        $types_with_more = $types . "ss";
        $bindValues = array_merge($values, [$full_description, $key_benefits]);
        $stmt->bind_param($types_with_more, ...$bindValues);
    } else {
        // Fallbacks if some columns missing
        $stmt = $conn->prepare("INSERT INTO products ($columns, full_description) VALUES ($placeholders, ?)");
        if ($stmt) {
            $types_with_fd = $types . "s";
            $bindValues2 = array_merge($values, [$full_description]);
            $stmt->bind_param($types_with_fd, ...$bindValues2);
        } else {
            $stmt = $conn->prepare("INSERT INTO products ($columns) VALUES ($placeholders)");
            $stmt->bind_param($types, ...$values);
        }
    }


    if ($stmt->execute()) {
        $product_id = $stmt->insert_id;

        // Handle multiple images (up to 4)
        if (!empty($_FILES['images']['name'][0])) {
            $upload_dir = dirname(__DIR__) . '/uploads/products/';
            if (!is_dir($upload_dir)) {
                // Create directory with proper permissions
                if (!mkdir($upload_dir, 0755, true)) {
                    echo json_encode(["success" => false, "message" => "Failed to create upload directory"]);
                    exit;
                }
            }

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

        $message = "Product added successfully";
        if (isset($uploaded_count) && $uploaded_count > 0) {
            $message .= " with {$uploaded_count} image(s)";
        }
        echo json_encode(["success" => true, "message" => $message, "product_id" => $product_id]);
    } else {
        echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
    }

    $stmt->close();
    $conn->close();
};
