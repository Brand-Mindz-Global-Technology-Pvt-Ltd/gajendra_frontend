<?php
require_once "../../../config/db.php"; 

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (
    $origin === 'https://gajendhrademo.brandmindz.com' || 
    preg_match('/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/', $origin)
) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
} else {
    header("Access-Control-Allow-Origin: *");
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
} 

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
