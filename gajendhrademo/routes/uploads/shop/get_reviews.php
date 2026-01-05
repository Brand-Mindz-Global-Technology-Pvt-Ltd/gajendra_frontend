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

    $conn = Database::getConnection();

    $product_id = isset($_GET['product_id']) ? intval($_GET['product_id']) : 0;
    $rating = isset($_GET['rating']) ? intval($_GET['rating']) : null; // optional 1..5

    if ($product_id === 0) {
        echo json_encode(["success" => false, "message" => "product_id is required"]);
        exit;
    }

    // Fetch reviews (optionally filter by rating)
    $sql = "
    SELECT r.id, r.rating, r.review_text, r.photo, r.created_at, u.name AS user_name
    FROM reviews r
    LEFT JOIN users u ON r.user_id = u.id
    WHERE r.product_id = ?";

    $types = "i";
    $params = [$product_id];

    if (!is_null($rating) && $rating >= 1 && $rating <= 5) {
        $sql .= " AND r.rating = ?";
        $types .= "i";
        $params[] = $rating;
    }

    $sql .= " ORDER BY r.created_at DESC";

    $stmt = $conn->prepare($sql);
    if ($types === "i") {
        $stmt->bind_param($types, $params[0]);
    } else {
        $stmt->bind_param($types, $params[0], $params[1]);
    }
    $stmt->execute();
    $result = $stmt->get_result();

    $reviews = [];
    while ($row = $result->fetch_assoc()) {
        $row['photos'] = [];
        // Load additional images if table exists
        $check = $conn->query("SHOW TABLES LIKE 'review_images'");
        if ($check && $check->num_rows > 0) {
            $imgStmt = $conn->prepare("SELECT image_path FROM review_images WHERE review_id = ? ORDER BY id ASC LIMIT 3");
            $imgStmt->bind_param("i", $row['id']);
            if ($imgStmt->execute()) {
                $imgRes = $imgStmt->get_result();
                while ($img = $imgRes->fetch_assoc()) {
                    $row['photos'][] = $img['image_path'];
                }
            }
            $imgStmt->close();
        }
        // Also include legacy single photo if present and not duplicated
        if (!empty($row['photo']) && !in_array($row['photo'], $row['photos'])) {
            array_unshift($row['photos'], $row['photo']);
        }
        $reviews[] = $row;
    }

    if (count($reviews) > 0) {
        echo json_encode(["success" => true, "reviews" => $reviews]);
    } else {
        echo json_encode(["success" => false, "message" => "No reviews found"]);
    }

    $stmt->close();
    $conn->close();
};
