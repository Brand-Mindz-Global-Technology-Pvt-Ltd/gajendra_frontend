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

    $conn = Database::getConnection();

$product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;

if ($product_id === 0) {
    echo json_encode(["success" => false, "message" => "product_id is required"]);
    exit;
}

// Delete product images from DB (and optionally from filesystem)
$img_query = $conn->prepare("SELECT image_path FROM product_images WHERE product_id = ?");
$img_query->bind_param("i", $product_id);
$img_query->execute();
$result = $img_query->get_result();

$upload_dir = "../uploads/products/";
while ($row = $result->fetch_assoc()) {
    $file = $upload_dir . $row['image_path'];
    if (file_exists($file)) {
        unlink($file); // delete image file
    }
}
$img_query->close();

// Delete product images records
$conn->query("DELETE FROM product_images WHERE product_id = $product_id");

// Delete product
$stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
$stmt->bind_param("i", $product_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Product deleted successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
};
