<?php
${basename(__FILE__, '.php')} = function () {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(["success" => false, "message" => "Invalid request method"]);
        exit;
    }

    try {
        $conn = Database::getConnection();
        
        // Check if this is a delete request
        if (isset($_POST['delete']) && $_POST['delete'] == '1') {
            $spotlightId = $_POST['id'] ?? null;
            
            if (!$spotlightId) {
                echo json_encode(["success" => false, "message" => "Spotlight ID is required"]);
                exit;
            }

            // Delete spotlight
            $sql = "DELETE FROM spotlights WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $spotlightId);
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Spotlight deleted successfully"]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to delete spotlight"]);
            }
            $stmt->close();
            exit;
        }

        // Check if this is an edit request
        $isEdit = isset($_POST['edit']) && $_POST['edit'] == '1';
        $spotlightId = $_POST['id'] ?? null;

        // Validate required fields
        $title = $_POST['title'] ?? '';
        $description = $_POST['spotlight_short_description'] ?? '';
        $learnMoreUrl = $_POST['learn_more_url'] ?? '';
        $displayOrder = $_POST['display_order'] ?? 1;
        $isActive = $_POST['is_active'] ?? 1;

        if (empty($title) || empty($description)) {
            echo json_encode(["success" => false, "message" => "Title and description are required"]);
            exit;
        }

        // Handle image upload
        $imagePath = null;
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = "/var/www/html/indian_tribe/api/v1/uploads/spotlights/";
            
            // Create directory if it doesn't exist
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $fileExtension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
            $fileName = time() . '_' . uniqid() . '.' . $fileExtension;
            $uploadPath = $uploadDir . $fileName;

            if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadPath)) {
                $imagePath = $fileName;
            } else {
                echo json_encode(["success" => false, "message" => "Failed to upload image"]);
                exit;
            }
        } elseif (!$isEdit) {
            // Image is required for new spotlights
            echo json_encode(["success" => false, "message" => "Image is required"]);
            exit;
        }

        if ($isEdit && $spotlightId) {
            // Update existing spotlight
            if ($imagePath) {
                $sql = "UPDATE spotlights SET title = ?, spotlight_short_description = ?, learn_more_url = ?, display_order = ?, is_active = ?, image_path = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("sssiiis", $title, $description, $learnMoreUrl, $displayOrder, $isActive, $imagePath, $spotlightId);
            } else {
                $sql = "UPDATE spotlights SET title = ?, spotlight_short_description = ?, learn_more_url = ?, display_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("sssiii", $title, $description, $learnMoreUrl, $displayOrder, $isActive, $spotlightId);
            }
        } else {
            // Insert new spotlight
            $sql = "INSERT INTO spotlights (title, spotlight_short_description, learn_more_url, display_order, is_active, image_path) VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("sssiis", $title, $description, $learnMoreUrl, $displayOrder, $isActive, $imagePath);
        }

        if ($stmt->execute()) {
            $message = $isEdit ? "Spotlight updated successfully" : "Spotlight added successfully";
            echo json_encode(["success" => true, "message" => $message]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to save spotlight"]);
        }

        $stmt->close();

    } catch (Exception $e) {
        // Log the error for debugging
        error_log("Add Spotlight API error: " . $e->getMessage());

        // Return error response
        echo json_encode([
            "success" => false,
            "message" => "Failed to process spotlight request. Please try again later."
        ]);
    } finally {
        // Close database connection if needed
        if (isset($conn)) {
            $conn->close();
        }
    }
};
