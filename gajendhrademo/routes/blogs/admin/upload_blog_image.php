<?php
// upload_blog_image.php

error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
    exit;
}

if (!isset($_FILES['image'])) {
    echo json_encode(["status" => "error", "message" => "No image uploaded"]);
    exit;
}

$file = $_FILES['image'];

if ($file['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(["status" => "error", "message" => "Upload error"]);
    exit;
}

// Create directory if not exists
$uploadDir = __DIR__ . "/../../../uploads/blogs/";

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0775, true);
}

// Validate extension
$allowedExt = ["jpg", "jpeg", "png", "webp"];
$ext = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));

if (!in_array($ext, $allowedExt)) {
    echo json_encode(["status" => "error", "message" => "Invalid image format"]);
    exit;
}

$newFileName = "blog_" . time() . "_" . rand(1000, 9999) . "." . $ext;
$destination = $uploadDir . $newFileName;

// Move file
if (!move_uploaded_file($file["tmp_name"], $destination)) {
    echo json_encode(["status" => "error", "message" => "Failed to upload image"]);
    exit;
}

// Public URL
$imageUrl = "https://narpavihoney.brandmindz.com/uploads/blogs/" . $newFileName;

echo json_encode([
    "status" => "success",
    "message" => "Image uploaded successfully",
    "image_url" => $imageUrl
]);
exit;
