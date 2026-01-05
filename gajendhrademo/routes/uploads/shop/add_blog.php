<?php
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

    $title   = isset($_POST['title']) ? trim($_POST['title']) : '';
    $slug    = isset($_POST['slug']) ? trim($_POST['slug']) : '';
    $content = isset($_POST['content']) ? trim($_POST['content']) : '';
    $edit    = isset($_POST['edit']) ? $_POST['edit'] : '0';
    $delete  = isset($_POST['delete']) ? $_POST['delete'] : '0';
    $id      = isset($_POST['id']) ? intval($_POST['id']) : 0;
    $image_path = null;

    // Debug logging
    error_log("Blog API - Edit mode: " . $edit);
    error_log("Blog API - Delete mode: " . $delete);
    error_log("Blog API - ID: " . $id);
    error_log("Blog API - Title: " . $title);
    error_log("Blog API - Slug: " . $slug);

    if ($delete === '1') {
        // Delete mode
        if ($id === 0) {
            echo json_encode(["success" => false, "message" => "Blog ID is required for deletion"]);
            exit;
        }

        // Delete blog
        $stmt = $conn->prepare("DELETE FROM blogs WHERE id = ?");
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode(["success" => true, "message" => "Blog deleted successfully"]);
            } else {
                echo json_encode(["success" => false, "message" => "Blog not found or already deleted"]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
        }
        $stmt->close();
        $conn->close();
        exit;
    }

    if ($title === '' || $slug === '' || $content === '') {
        echo json_encode(["success" => false, "message" => "title, slug, and content are required"]);
        exit;
    }

    // Handle image upload
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = __DIR__ . '/../uploads/blogs/';
        
        // Create directory if it doesn't exist
        if (!is_dir($upload_dir)) {
            if (!mkdir($upload_dir, 0777, true)) {
                echo json_encode(["success" => false, "message" => "Failed to create upload directory"]);
                exit;
            }
        }

        $file_name = $_FILES['image']['name'];
        $file_size = $_FILES['image']['size'];
        $file_type = $_FILES['image']['type'];
        $file_tmp_name = $_FILES['image']['tmp_name'];
        $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));

        // Validate file type
        $allowed_extensions = array("jpg", "jpeg", "png", "gif", "webp", "avif");
        if (!in_array($file_ext, $allowed_extensions)) {
            echo json_encode(["success" => false, "message" => "Invalid image file type. Allowed: " . implode(", ", $allowed_extensions)]);
            exit;
        }

        // Validate file size (max 5MB)
        if ($file_size > 5 * 1024 * 1024) {
            echo json_encode(["success" => false, "message" => "Image file too large. Maximum size is 5MB"]);
            exit;
        }

        // Generate unique filename
        $image_name = uniqid() . '_' . time() . '.' . $file_ext;
        $target_path = $upload_dir . $image_name;

        if (move_uploaded_file($file_tmp_name, $target_path)) {
            $image_path = 'blogs/' . $image_name; // Store relative path
            error_log("Blog API - Image uploaded successfully: " . $image_path);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to upload image"]);
            exit;
        }
    }

    if ($edit === '1') {
        // Edit mode
        if ($id === 0) {
            echo json_encode(["success" => false, "message" => "Blog ID is required for editing"]);
            exit;
        }

        if ($image_path) {
            // Update with new image
            $stmt = $conn->prepare("UPDATE blogs SET title = ?, slug = ?, content = ?, image = ? WHERE id = ?");
            $stmt->bind_param("ssssi", $title, $slug, $content, $image_path, $id);
        } else {
            // Update without changing image
            $stmt = $conn->prepare("UPDATE blogs SET title = ?, slug = ?, content = ? WHERE id = ?");
            $stmt->bind_param("sssi", $title, $slug, $content, $id);
        }

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Blog updated successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
        }
    } else {
        // Add mode
        $stmt = $conn->prepare("INSERT INTO blogs (title, slug, content, image) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $title, $slug, $content, $image_path);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Blog added successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
        }
    }

    $stmt->close();
    $conn->close();
};
