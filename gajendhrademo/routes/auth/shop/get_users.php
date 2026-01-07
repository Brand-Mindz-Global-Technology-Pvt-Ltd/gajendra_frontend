<?php
// ================================
// CORS + JSON HEADERS (WORKING)
// ================================
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: false");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "../../../config/db.php";

// ================================
// FETCH USERS
// ================================
try {

    $query = "
        SELECT 
            id,
            name,
            email,
            phone,
            role,
            created_at
        FROM users
        ORDER BY created_at DESC
    ";

    $result = $conn->query($query);

    if (!$result) {
        throw new Exception("Query failed");
    }

    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }

    echo json_encode([
        "success" => true,
        "data" => $users
    ]);

} catch (Exception $e) {

    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to fetch users"
    ]);
}
