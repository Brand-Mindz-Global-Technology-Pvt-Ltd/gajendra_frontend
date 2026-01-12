<?php
/**
 * Database Migration: Add variations column to products table
 * Run this script once to add the variations column to your products table
 */

require_once 'config/db.php';

header('Content-Type: application/json');

try {
    $conn = Database::getConnection();
    
    // Check if variations column already exists
    $result = $conn->query("SHOW COLUMNS FROM products LIKE 'variations'");
    
    if ($result->num_rows > 0) {
        echo json_encode([
            "success" => true,
            "message" => "Variations column already exists",
            "action" => "no_change_needed"
        ]);
    } else {
        // Add the variations column
        $sql = "ALTER TABLE products ADD COLUMN variations JSON NULL AFTER price";
        $conn->query($sql);
        
        echo json_encode([
            "success" => true,
            "message" => "Variations column added successfully",
            "action" => "column_added"
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Migration failed: " . $e->getMessage()
    ]);
}
?>
