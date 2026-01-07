<?php
error_reporting(E_ALL); // Report all errors
ini_set('display_errors', '0'); // Do not display errors to the browser

${basename(__FILE__, '.php')} = function () {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    $conn = Database::getConnection();

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(["success" => false, "message" => "Invalid request method"]);
        exit;
    }

    // Collect input
    $shop_id = isset($_POST['shop_id']) ? intval($_POST['shop_id']) : 0;
    $name    = isset($_POST['name']) ? trim($_POST['name']) : '';
    $slug    = isset($_POST['slug']) ? trim($_POST['slug']) : '';
    $edit    = isset($_POST['edit']) ? $_POST['edit'] : '0';
    $delete  = isset($_POST['delete']) ? $_POST['delete'] : '0';
    $id      = isset($_POST['id']) ? intval($_POST['id']) : 0;

    $image_path = NULL; // Initialize image_path to NULL
    $upload_dir = __DIR__ . '/../uploads/categories/'; // Corrected path to use 'categories'

    // Handle image upload if a file is provided
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $file_tmp_name = $_FILES['image']['tmp_name'];
        $file_name = $_FILES['image']['name'];
        $file_size = $_FILES['image']['size'];
        $file_type = $_FILES['image']['type'];
        $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));

        $allowed_extensions = array("jpg", "jpeg", "png", "gif", "webp", "avif");

        if (!in_array($file_ext, $allowed_extensions)) {
            echo json_encode(["success" => false, "message" => "Invalid image file type."]);
            exit;
        }

        // Generate a unique file name
        $new_file_name = uniqid() . '.' . $file_ext;
        $dest_path = $upload_dir . $new_file_name;

        if (!move_uploaded_file($file_tmp_name, $dest_path)) {
            echo json_encode(["success" => false, "message" => "Failed to upload image."]);
            exit;
        }
        $image_path = 'categories/' . $new_file_name; // Path to store in DB, using 'categories'
    }

    // Debug logging
    // error_log("Category API - Edit mode: " . $edit);
    // error_log("Category API - Delete mode: " . $delete);
    // error_log("Category API - ID: " . $id);
    // error_log("Category API - Name: " . $name);
    // error_log("Category API - Slug: " . $slug);

    if ($delete === '1') {
        // Delete mode
        if ($id === 0) {
            echo json_encode(["success" => false, "message" => "Category ID is required for deletion"]);
            exit;
        }

        // Delete category
        $stmt = $conn->prepare("DELETE FROM categories WHERE id = ?");
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode(["success" => true, "message" => "Category deleted successfully"]);
            } else {
                echo json_encode(["success" => false, "message" => "Category not found or already deleted"]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
        }
    } elseif ($edit === '1') {
        // Edit mode
        if ($id === 0) {
            echo json_encode(["success" => false, "message" => "Category ID is required for editing"]);
            exit;
        }

        // Update category
        $update_query = "UPDATE categories SET name = ?, slug = ?" . ($image_path ? ", image_path = ?" : "") . " WHERE id = ?";
        $stmt = $conn->prepare($update_query);

        if ($image_path) {
            $stmt->bind_param("sssi", $name, $slug, $image_path, $id);
        } else {
            $stmt->bind_param("ssi", $name, $slug, $id);
        }

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Category updated successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
        }
    } else {
        // Add mode
        if ($shop_id === 0) {
            echo json_encode(["success" => false, "message" => "shop_id is required"]);
            exit;
        }

        // Insert category
        $insert_query = "INSERT INTO categories (shop_id, name, slug" . ($image_path ? ", image_path" : "") . ") VALUES (?, ?, ?" . ($image_path ? ", ?" : "") . ")";
        $stmt = $conn->prepare($insert_query);

        if ($image_path) {
            $stmt->bind_param("isss", $shop_id, $name, $slug, $image_path);
        } else {
            $stmt->bind_param("iss", $shop_id, $name, $slug);
        }

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Category added successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
        }
    }

    $stmt->close();
    $conn->close();
};
