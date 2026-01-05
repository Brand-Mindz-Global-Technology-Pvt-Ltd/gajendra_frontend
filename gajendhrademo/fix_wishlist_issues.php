<?php
/**
 * Fix Wishlist Issues Script
 * 
 * This script addresses the main issues with the wishlist functionality:
 * 1. Creates the wishlist table if it doesn't exist
 * 2. Tests the API endpoints
 * 3. Provides debugging information
 */

// Database configuration
$host = 'localhost';
$db = 'narpavihoney';
$user = 'root';
$pass = 'Karthick@2003';

echo "<h1>Wishlist Issues Fix Script</h1>";
echo "<style>body{font-family:Arial,sans-serif;margin:20px;} .success{color:green;} .error{color:red;} .info{color:blue;} .warning{color:orange;} pre{background:#f5f5f5;padding:10px;border-radius:5px;}</style>";

try {
    $conn = new mysqli($host, $user, $pass, $db);
    
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    echo "<div class='success'>✓ Database connected successfully!</div>";
    
    // Step 1: Create wishlist table
    echo "<h2>Step 1: Creating Wishlist Table</h2>";
    
    $createTableSQL = "CREATE TABLE IF NOT EXISTS wishlist (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id INT NOT NULL,
        product_id INT UNSIGNED NOT NULL,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uniq_wishlist (user_id, product_id),
        KEY user_id (user_id),
        KEY product_id (product_id)
    )";
    
    if ($conn->query($createTableSQL)) {
        echo "<div class='success'>✓ Wishlist table created/verified successfully!</div>";
    } else {
        echo "<div class='error'>✗ Error creating wishlist table: " . $conn->error . "</div>";
    }
    
    // Step 2: Check required tables
    echo "<h2>Step 2: Checking Required Tables</h2>";
    
    $tables = ['users', 'products', 'wishlist'];
    foreach ($tables as $table) {
        $result = $conn->query("SHOW TABLES LIKE '$table'");
        if ($result->num_rows > 0) {
            $countResult = $conn->query("SELECT COUNT(*) as count FROM $table");
            $count = $countResult->fetch_assoc()['count'];
            echo "<div class='success'>✓ Table '$table' exists with $count records</div>";
        } else {
            echo "<div class='error'>✗ Table '$table' does not exist!</div>";
        }
    }
    
    // Step 3: Test API endpoints
    echo "<h2>Step 3: Testing API Endpoints</h2>";
    
    $testUserId = 1;
    $testProductId = 1;
    
    // Test add endpoint
    echo "<h3>Testing Add Endpoint</h3>";
    $addData = http_build_query(['user_id' => $testUserId, 'product_id' => $testProductId]);
    $addContext = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => 'Content-type: application/x-www-form-urlencoded',
            'content' => $addData
        ]
    ]);
    
    $addResult = file_get_contents('http://localhost/Narpavi_Honey/Narpavi_Honey_Backend/routes/auth/shop/wishlist.php?action=add', false, $addContext);
    if ($addResult) {
        $addResponse = json_decode($addResult, true);
        if ($addResponse && $addResponse['success']) {
            echo "<div class='success'>✓ Add endpoint working: " . $addResponse['message'] . "</div>";
        } else {
            echo "<div class='warning'>⚠ Add endpoint response: " . ($addResponse['message'] ?? 'Unknown error') . "</div>";
        }
    } else {
        echo "<div class='error'>✗ Add endpoint not responding</div>";
    }
    
    // Test count endpoint
    echo "<h3>Testing Count Endpoint</h3>";
    $countResult = file_get_contents('http://localhost/Narpavi_Honey/Narpavi_Honey_Backend/routes/auth/shop/wishlist.php?action=count&user_id=' . $testUserId);
    if ($countResult) {
        $countResponse = json_decode($countResult, true);
        if ($countResponse && $countResponse['success']) {
            echo "<div class='success'>✓ Count endpoint working: " . $countResponse['data']['count'] . " items</div>";
        } else {
            echo "<div class='warning'>⚠ Count endpoint response: " . ($countResponse['message'] ?? 'Unknown error') . "</div>";
        }
    } else {
        echo "<div class='error'>✗ Count endpoint not responding</div>";
    }
    
    // Step 4: Provide debugging information
    echo "<h2>Step 4: Debugging Information</h2>";
    
    echo "<h3>Wishlist Table Structure:</h3>";
    $structure = $conn->query("DESCRIBE wishlist");
    echo "<table border='1' cellpadding='5' cellspacing='0'>";
    echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
    while ($row = $structure->fetch_assoc()) {
        echo "<tr>";
        echo "<td>" . $row['Field'] . "</td>";
        echo "<td>" . $row['Type'] . "</td>";
        echo "<td>" . $row['Null'] . "</td>";
        echo "<td>" . $row['Key'] . "</td>";
        echo "<td>" . $row['Default'] . "</td>";
        echo "<td>" . $row['Extra'] . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    // Step 5: Sample data
    echo "<h2>Step 5: Sample Data</h2>";
    
    $wishlistData = $conn->query("SELECT * FROM wishlist LIMIT 5");
    if ($wishlistData->num_rows > 0) {
        echo "<h3>Recent Wishlist Items:</h3>";
        echo "<table border='1' cellpadding='5' cellspacing='0'>";
        echo "<tr><th>ID</th><th>User ID</th><th>Product ID</th><th>Created At</th></tr>";
        while ($row = $wishlistData->fetch_assoc()) {
            echo "<tr>";
            echo "<td>" . $row['id'] . "</td>";
            echo "<td>" . $row['user_id'] . "</td>";
            echo "<td>" . $row['product_id'] . "</td>";
            echo "<td>" . $row['created_at'] . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<div class='info'>No wishlist items found. Try adding some items from the frontend.</div>";
    }
    
    echo "<h2>Next Steps</h2>";
    echo "<div class='info'>";
    echo "<ol>";
    echo "<li>Make sure you have at least one user in the users table</li>";
    echo "<li>Make sure you have at least one product in the products table</li>";
    echo "<li>Test the frontend by clicking heart icons on product cards</li>";
    echo "<li>Check the browser console for any JavaScript errors</li>";
    echo "<li>Verify the wishlist page loads correctly</li>";
    echo "</ol>";
    echo "</div>";
    
} catch (Exception $e) {
    echo "<div class='error'>Error: " . $e->getMessage() . "</div>";
    echo "<div class='info'>Make sure XAMPP is running and MySQL is started.</div>";
}
?>

