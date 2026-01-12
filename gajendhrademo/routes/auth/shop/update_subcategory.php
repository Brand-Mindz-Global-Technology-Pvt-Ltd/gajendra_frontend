<?php
require_once "../../../config/db.php"; 

$id = $_POST['id'] ?? null;
$category_id = $_POST['category_id'] ?? null;
$name = $_POST['name'] ?? null;
$slug = $_POST['slug'] ?? null;

$response = ["success" => false];

if (!$id || !$category_id || !$name || !$slug) {
    $response["message"] = "Missing fields";
    echo json_encode($response);
    exit;
}

$sql = "UPDATE subcategories SET category_id=?, name=?, slug=? WHERE id=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("issi", $category_id, $name, $slug, $id);

if ($stmt->execute()) {
    $response["success"] = true;
    $response["message"] = "Subcategory updated";
} else {
    $response["message"] = "Database error";
}

echo json_encode($response);
?>
