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
    // Get limit parameter (default to 3)
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 3;
    
    // Ensure limit is reasonable (between 1 and 10)
    $limit = max(1, min(10, $limit));

    // Get last updated categories using the Category model
    $categories = Category::getLastUpdatedCategories($limit);

    if (count($categories) > 0) {
        echo json_encode([
            "success" => true,
            "message" => "Categories retrieved successfully",
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
    error_log("Get Last Categories API error: " . $e->getMessage());

    // Return error response
    echo json_encode([
        "success" => false,
        "message" => "Failed to retrieve categories. Please try again later."
    ]);
} finally {
    // Close database connection if needed
    if (isset($conn)) {
        $conn->close();
    }
}
};
