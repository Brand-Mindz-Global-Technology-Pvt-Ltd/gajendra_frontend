<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include "../../../config/database.php";  // change path based on your structure

// Check required values
if (!isset($_POST["segments"]) || !isset($_POST["product_id"])) {
    echo json_encode([
        "status" => false,
        "message" => "Missing required fields (segments or product_id)"
    ]);
    exit;
}

$product_id = intval($_POST["product_id"]);
$segments = json_decode($_POST["segments"], true);

if (!is_array($segments)) {
    echo json_encode([
        "status" => false,
        "message" => "Invalid segments format"
    ]);
    exit;
}

// Insert Query
$query = $conn->prepare("INSERT INTO taste_segment (title, description, product_id) VALUES (?, ?, ?)");

foreach ($segments as $seg) {
    $title = trim($seg["title"] ?? "");
    $description = trim($seg["description"] ?? "");

    // Skip empty rows
    if ($title === "" && $description === "") continue;

    $query->bind_param("ssi", $title, $description, $product_id);
    $query->execute();
}

echo json_encode([
    "status" => true,
    "message" => "Taste segments saved successfully"
]);
