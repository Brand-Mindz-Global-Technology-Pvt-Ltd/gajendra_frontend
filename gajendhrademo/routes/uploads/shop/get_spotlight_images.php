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

    // Get spotlight images using the ProductImage model
    $spotlightImages = ProductImage::getSpotlightImages();

    if (count($spotlightImages) > 0) {
        echo json_encode([
            "success" => true,
            "message" => "Spotlight images retrieved successfully",
            "data" => [
                "images" => $spotlightImages,
                "count" => count($spotlightImages)
            ]
        ]);
    } else {
        echo json_encode([
            "success" => true,
            "message" => "No spotlight images found",
            "data" => [
                "images" => [],
                "count" => 0
            ]
        ]);
    }

} catch (Exception $e) {
    // Log the error for debugging
    error_log("Get Spotlight Images API error: " . $e->getMessage());

    // Return error response
    echo json_encode([
        "success" => false,
        "message" => "Failed to retrieve spotlight images. Please try again later."
    ]);
} finally {
    // Close database connection if needed
    if (isset($conn)) {
        $conn->close();
    }
}
};
