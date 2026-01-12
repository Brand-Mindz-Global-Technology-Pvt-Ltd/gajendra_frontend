<?php
require_once '../../../config/db.php';

// Set CORS headers
header('Access-Control-Allow-Origin: http://127.0.0.1:5500');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

         // $conn = Database::getConnection();

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
    if (!empty($_FILES['image']['name'])) {
        // Use relative path for XAMPP/Windows
        $upload_dir = __DIR__ . "/../../uploads/blogs/";
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        $image_name = time() . "_" . basename($_FILES['image']['name']);
        $target_path = $upload_dir . $image_name;

        if (move_uploaded_file($_FILES['image']['tmp_name'], $target_path)) {
            $image_path = $image_name;
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
