<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set JSON content type
header('Content-Type: application/json');

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

try {
    // Test database connection
    require_once '../../../config/db.php';
    
    if (!isset($conn) || $conn->connect_error) {
        throw new Exception("Database connection failed: " . ($conn->connect_error ?? 'Connection not established'));
    }
    
    // Test database query
    $result = $conn->query("SELECT 1");
    if (!$result) {
        throw new Exception("Database query failed: " . $conn->error);
    }
    
    // Check if users table exists
    $table_check = $conn->query("SHOW TABLES LIKE 'users'");
    $users_table_exists = $table_check && $table_check->num_rows > 0;
    
    // Check if shops table exists
    $shop_check = $conn->query("SHOW TABLES LIKE 'shops'");
    $shops_table_exists = $shop_check && $shop_check->num_rows > 0;
    
    echo json_encode([
        "success" => true,
        "message" => "Backend is working correctly!",
        "database" => [
            "connected" => true,
            "host" => "localhost",
            "database" => "u488332695_narpavi_db"
        ],
        "tables" => [
            "users" => $users_table_exists,
            "shops" => $shops_table_exists
        ],
        "php_version" => phpversion(),
        "timestamp" => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Backend test failed",
        "error" => $e->getMessage(),
        "file" => __FILE__,
        "php_version" => phpversion()
    ]);
}
?>