<?php
// Simple test script to check if the database tables exist and endpoints work
require_once 'config/db.php';

echo "Testing Database Connection and Tables...\n\n";

// Check database connection
if (!$conn) {
    echo "❌ Database connection failed\n";
    exit;
}
echo "✅ Database connection successful\n";

// Check if required tables exist
$tables = ['users', 'categories', 'products', 'orders', 'order_items', 'blogs', 'product_images', 'reviews', 'cart'];
$missing_tables = [];

foreach ($tables as $table) {
    $result = $conn->query("SHOW TABLES LIKE '$table'");
    if ($result->num_rows == 0) {
        $missing_tables[] = $table;
    } else {
        echo "✅ Table '$table' exists\n";
    }
}

if (!empty($missing_tables)) {
    echo "\n❌ Missing tables: " . implode(', ', $missing_tables) . "\n";
    echo "Please run the setup_shop_database.sql script to create missing tables.\n";
} else {
    echo "\n✅ All required tables exist\n";
}

// Test a simple query
echo "\nTesting sample queries...\n";

// Test categories query
$result = $conn->query("SELECT COUNT(*) as count FROM categories");
if ($result) {
    $row = $result->fetch_assoc();
    echo "✅ Categories table accessible - " . $row['count'] . " records\n";
} else {
    echo "❌ Categories table query failed: " . $conn->error . "\n";
}

// Test products query
$result = $conn->query("SELECT COUNT(*) as count FROM products");
if ($result) {
    $row = $result->fetch_assoc();
    echo "✅ Products table accessible - " . $row['count'] . " records\n";
} else {
    echo "❌ Products table query failed: " . $conn->error . "\n";
}

// Test orders query
$result = $conn->query("SELECT COUNT(*) as count FROM orders");
if ($result) {
    $row = $result->fetch_assoc();
    echo "✅ Orders table accessible - " . $row['count'] . " records\n";
} else {
    echo "❌ Orders table query failed: " . $conn->error . "\n";
}

// Test blogs query
$result = $conn->query("SELECT COUNT(*) as count FROM blogs");
if ($result) {
    $row = $result->fetch_assoc();
    echo "✅ Blogs table accessible - " . $row['count'] . " records\n";
} else {
    echo "❌ Blogs table query failed: " . $conn->error . "\n";
}

echo "\nTest completed.\n";
$conn->close();
?>
