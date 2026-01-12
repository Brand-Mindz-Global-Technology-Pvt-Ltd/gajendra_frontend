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

    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
    if ($limit <= 0 || $limit > 50) {
        $limit = 10;
    }

    $sql = "
        SELECT r.id, r.rating, r.review_text, r.photo, r.created_at,
               u.name AS user_name, r.product_id
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC
        LIMIT ?
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $limit);
    $stmt->execute();
    $result = $stmt->get_result();

    $reviews = [];
    while ($row = $result->fetch_assoc()) {
        $row['photos'] = [];
        // Backfill photos with legacy single photo if present
        if (!empty($row['photo'])) {
            $row['photos'][] = $row['photo'];
        }
        $reviews[] = $row;
    }

    echo json_encode(["success" => true, "reviews" => $reviews]);

    $stmt->close();
    $conn->close();
};


