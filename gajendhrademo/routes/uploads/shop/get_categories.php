<?php
${basename(__FILE__, '.php')} = function () {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

// Check if shop_id is provided
if (!isset($_GET['shop_id'])) {
    echo json_encode(["success" => false, "message" => "shop_id is required"]);
    exit;
}

$conn = Database::getConnection();

$shop_id = intval($_GET['shop_id']);

// Prepare statement to fetch categories
$stmt = $conn->prepare("SELECT id, name, slug, image_path FROM categories WHERE shop_id = ?");
$stmt->bind_param("i", $shop_id);
$stmt->execute();
$result = $stmt->get_result();

$categories = [];
while ($row = $result->fetch_assoc()) {
    $categories[] = $row;
}

if (count($categories) > 0) {
    echo json_encode(["success" => true, "categories" => $categories]);
} else {
    echo json_encode(["success" => false, "message" => "No categories found"]);
}

$stmt->close();
$conn->close();
};
