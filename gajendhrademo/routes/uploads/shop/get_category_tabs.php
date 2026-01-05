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
    // Get limit parameter (default to 3 for tabs)
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 3;
    
    // Ensure limit is reasonable (between 1 and 5 for tabs)
    $limit = max(1, min(5, $limit));

    // Get categories for tabs using the Category model
    $categories = Category::getLastUpdatedCategories($limit);

    if (count($categories) > 0) {
        echo json_encode([
            "success" => true,
            "message" => "Category tabs retrieved successfully",
            "data" => [
                "categories" => $categories,
                "count" => count($categories)
            ]
        ]);
    } else {
        echo json_encode([
            "success" => true,
            "message" => "No categories found",
            "data" => [
                "categories" => [],
                "count" => 0
            ]
        ]);
    }

} catch (Exception $e) {
    // Log the error for debugging
    error_log("Get Category Tabs API error: " . $e->getMessage());

    // Return error response
    echo json_encode([
        "success" => false,
        "message" => "Failed to retrieve category tabs. Please try again later."
    ]);
} finally {
    // Close database connection if needed
    if (isset($conn)) {
        $conn->close();
    }
}
};
