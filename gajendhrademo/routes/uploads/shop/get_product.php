<?php
${basename(__FILE__, '.php')} = function () {
    header('Content-Type: application/json');
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

if ($product_id === 0) {
    echo json_encode(["success" => false, "message" => "product_id is required"]);
    exit;
}

// Fetch product details
$stmt = $conn->prepare("
    SELECT p.id, p.name, p.slug, p.description, p.full_description, p.key_benefits, p.price, p.stock, 
           p.is_new_arrival, p.status, p.category_id, c.name AS category_name, s.name AS shop_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN shops s ON p.shop_id = s.id
    WHERE p.id = ?
");
$stmt->bind_param("i", $product_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Product not found"]);
    exit;
}

$product = $result->fetch_assoc();
$stmt->close();

// Fetch images
$img_stmt = $conn->prepare("SELECT image_path FROM product_images WHERE product_id = ?");
$img_stmt->bind_param("i", $product_id);
$img_stmt->execute();
$img_result = $img_stmt->get_result();
$images = [];
while ($row = $img_result->fetch_assoc()) {
    $images[] = $row['image_path'];
}
$img_stmt->close();
$product['images'] = $images;

// Fetch reviews (optional - table might not exist)
try {
    $rev_stmt = $conn->prepare("
        SELECT r.rating, r.review_text, r.photo, r.created_at, u.name AS user_name
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.product_id = ?
        ORDER BY r.created_at DESC
    ");
    $rev_stmt->bind_param("i", $product_id);
    $rev_stmt->execute();
    $rev_result = $rev_stmt->get_result();
    $reviews = [];
    while ($row = $rev_result->fetch_assoc()) {
        $reviews[] = $row;
    }
    $rev_stmt->close();
    $product['reviews'] = $reviews;
} catch (Exception $e) {
    // Reviews table doesn't exist or has issues, set empty array
    $product['reviews'] = [];
}

echo json_encode(["success" => true, "product" => $product]);

$conn->close();
};
