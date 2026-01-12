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
        
        // Get all spotlights ordered by display_order and id
        $sql = "SELECT id, title, spotlight_short_description, learn_more_url, image_path, is_active, display_order, created_at, updated_at 
                FROM spotlights 
                ORDER BY display_order ASC, id DESC";
        
        $result = $conn->query($sql);
        
        if ($result && $result->num_rows > 0) {
            $spotlights = [];
            while ($row = $result->fetch_assoc()) {
                // Build image URL
                $imageUrl = null;
                if ($row['image_path']) {
                    $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'];
                    $imageUrl = $baseUrl . '/api/v1/uploads/spotlights/' . urlencode($row['image_path']);
                }
                
                $spotlights[] = [
                    'id' => $row['id'],
                    'title' => $row['title'],
                    'spotlight_short_description' => $row['spotlight_short_description'],
                    'learn_more_url' => $row['learn_more_url'],
                    'image_path' => $row['image_path'],
                    'image_url' => $imageUrl,
                    'is_active' => $row['is_active'],
                    'display_order' => $row['display_order'],
                    'created_at' => $row['created_at'],
                    'updated_at' => $row['updated_at']
                ];
            }
            
            echo json_encode([
                "success" => true,
                "message" => "Spotlights retrieved successfully",
                "data" => [
                    "spotlights" => $spotlights,
                    "count" => count($spotlights)
                ]
            ]);
        } else {
            echo json_encode([
                "success" => true,
                "message" => "No spotlights found",
                "data" => [
                    "spotlights" => [],
                    "count" => 0
                ]
            ]);
        }

    } catch (Exception $e) {
        // Log the error for debugging
        error_log("Get Spotlights API error: " . $e->getMessage());

        // Return error response
        echo json_encode([
            "success" => false,
            "message" => "Failed to retrieve spotlights. Please try again later."
        ]);
    } finally {
        // Close database connection if needed
        if (isset($conn)) {
            $conn->close();
        }
    }
};
