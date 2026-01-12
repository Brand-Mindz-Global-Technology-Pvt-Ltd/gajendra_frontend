<?php
require_once 'config/db.php';

echo "Testing database connection...\n";

if ($conn->connect_error) {
    echo "Connection failed: " . $conn->connect_error . "\n";
} else {
    echo "Database connected successfully!\n";
    
    // Check if wishlist table exists
    $result = $conn->query("SHOW TABLES LIKE 'wishlist'");
    if ($result->num_rows > 0) {
        echo "Wishlist table exists!\n";
    } else {
        echo "Wishlist table does not exist. Creating it...\n";
        $sql = "CREATE TABLE IF NOT EXISTS wishlist (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id INT NOT NULL,
            product_id INT UNSIGNED NOT NULL,
            created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uniq_wishlist (user_id, product_id),
            KEY user_id (user_id),
            KEY product_id (product_id)
        )";
        if ($conn->query($sql)) {
            echo "Wishlist table created successfully!\n";
        } else {
            echo "Error creating wishlist table: " . $conn->error . "\n";
        }
    }
    
    // Check if users table exists
    $result = $conn->query("SHOW TABLES LIKE 'users'");
    if ($result->num_rows > 0) {
        echo "Users table exists!\n";
        $result = $conn->query("SELECT COUNT(*) as count FROM users");
        $row = $result->fetch_assoc();
        echo "Users count: " . $row['count'] . "\n";
    } else {
        echo "Users table does not exist!\n";
    }
    
    // Check if products table exists
    $result = $conn->query("SHOW TABLES LIKE 'products'");
    if ($result->num_rows > 0) {
        echo "Products table exists!\n";
        $result = $conn->query("SELECT COUNT(*) as count FROM products");
        $row = $result->fetch_assoc();
        echo "Products count: " . $row['count'] . "\n";
    } else {
        echo "Products table does not exist!\n";
    }
}
?>

