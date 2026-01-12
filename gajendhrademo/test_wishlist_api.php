<?php
/**
 * Test script for Wishlist API
 * 
 * This script tests all the wishlist API endpoints to ensure they work correctly.
 * Run this script to verify the wishlist functionality is working.
 */

// Include database configuration
require_once 'config/db.php';

echo "<h1>Wishlist API Test</h1>\n";
echo "<style>body{font-family:Arial,sans-serif;margin:20px;} .success{color:green;} .error{color:red;} .info{color:blue;} pre{background:#f5f5f5;padding:10px;border-radius:5px;}</style>\n";

// Test data
$test_user_id = 1; // Make sure this user exists in your database
$test_product_id = 1; // Make sure this product exists in your database

echo "<h2>Testing Wishlist API Endpoints</h2>\n";

// Test 1: Add to wishlist
echo "<h3>Test 1: Add to Wishlist</h3>\n";
$add_data = [
    'user_id' => $test_user_id,
    'product_id' => $test_product_id
];

$add_result = testWishlistAPI('add', $add_data);
echo "<div class='" . ($add_result['success'] ? 'success' : 'error') . "'>";
echo "Result: " . ($add_result['success'] ? 'SUCCESS' : 'FAILED') . "<br>";
echo "Message: " . $add_result['message'] . "<br>";
echo "</div>\n";

// Test 2: Get wishlist count
echo "<h3>Test 2: Get Wishlist Count</h3>\n";
$count_result = testWishlistAPI('count', ['user_id' => $test_user_id]);
echo "<div class='" . ($count_result['success'] ? 'success' : 'error') . "'>";
echo "Result: " . ($count_result['success'] ? 'SUCCESS' : 'FAILED') . "<br>";
echo "Count: " . ($count_result['data']['count'] ?? 'N/A') . "<br>";
echo "</div>\n";

// Test 3: Get wishlist list
echo "<h3>Test 3: Get Wishlist List</h3>\n";
$list_result = testWishlistAPI('list', ['user_id' => $test_user_id]);
echo "<div class='" . ($list_result['success'] ? 'success' : 'error') . "'>";
echo "Result: " . ($list_result['success'] ? 'SUCCESS' : 'FAILED') . "<br>";
echo "Products count: " . (isset($list_result['data']['products']) ? count($list_result['data']['products']) : 'N/A') . "<br>";
if (isset($list_result['data']['products']) && count($list_result['data']['products']) > 0) {
    echo "First product: " . $list_result['data']['products'][0]['name'] . "<br>";
}
echo "</div>\n";

// Test 4: Remove from wishlist
echo "<h3>Test 4: Remove from Wishlist</h3>\n";
$remove_result = testWishlistAPI('remove', $add_data);
echo "<div class='" . ($remove_result['success'] ? 'success' : 'error') . "'>";
echo "Result: " . ($remove_result['success'] ? 'SUCCESS' : 'FAILED') . "<br>";
echo "Message: " . $remove_result['message'] . "<br>";
echo "</div>\n";

// Test 5: Verify count after removal
echo "<h3>Test 5: Verify Count After Removal</h3>\n";
$count_after_result = testWishlistAPI('count', ['user_id' => $test_user_id]);
echo "<div class='" . ($count_after_result['success'] ? 'success' : 'error') . "'>";
echo "Result: " . ($count_after_result['success'] ? 'SUCCESS' : 'FAILED') . "<br>";
echo "Count after removal: " . ($count_after_result['data']['count'] ?? 'N/A') . "<br>";
echo "</div>\n";

// Test 6: Test error handling (invalid user)
echo "<h3>Test 6: Error Handling (Invalid User)</h3>\n";
$error_result = testWishlistAPI('add', ['user_id' => 99999, 'product_id' => $test_product_id]);
echo "<div class='" . ($error_result['success'] ? 'error' : 'success') . "'>";
echo "Result: " . ($error_result['success'] ? 'FAILED (Expected)' : 'SUCCESS (Unexpected)') . "<br>";
echo "Message: " . $error_result['message'] . "<br>";
echo "</div>\n";

echo "<h2>Database Check</h2>\n";

// Check if wishlist table exists
$table_check = $conn->query("SHOW TABLES LIKE 'wishlist'");
if ($table_check->num_rows > 0) {
    echo "<div class='success'>✓ Wishlist table exists</div>\n";
    
    // Check table structure
    $structure = $conn->query("DESCRIBE wishlist");
    echo "<h3>Wishlist Table Structure:</h3>\n";
    echo "<table border='1' cellpadding='5' cellspacing='0'>\n";
    echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>\n";
    while ($row = $structure->fetch_assoc()) {
        echo "<tr>";
        echo "<td>" . $row['Field'] . "</td>";
        echo "<td>" . $row['Type'] . "</td>";
        echo "<td>" . $row['Null'] . "</td>";
        echo "<td>" . $row['Key'] . "</td>";
        echo "<td>" . $row['Default'] . "</td>";
        echo "<td>" . $row['Extra'] . "</td>";
        echo "</tr>\n";
    }
    echo "</table>\n";
} else {
    echo "<div class='error'>✗ Wishlist table does not exist. Please run setup_wishlist_table.sql</div>\n";
}

// Check if test user exists
$user_check = $conn->query("SELECT id, name FROM users WHERE id = $test_user_id");
if ($user_check->num_rows > 0) {
    $user = $user_check->fetch_assoc();
    echo "<div class='success'>✓ Test user exists: " . $user['name'] . " (ID: " . $user['id'] . ")</div>\n";
} else {
    echo "<div class='error'>✗ Test user (ID: $test_user_id) does not exist. Please create a test user or update the test script.</div>\n";
}

// Check if test product exists
$product_check = $conn->query("SELECT id, name FROM products WHERE id = $test_product_id");
if ($product_check->num_rows > 0) {
    $product = $product_check->fetch_assoc();
    echo "<div class='success'>✓ Test product exists: " . $product['name'] . " (ID: " . $product['id'] . ")</div>\n";
} else {
    echo "<div class='error'>✗ Test product (ID: $test_product_id) does not exist. Please create a test product or update the test script.</div>\n";
}

echo "<h2>Summary</h2>\n";
echo "<div class='info'>If all tests show SUCCESS, your wishlist API is working correctly!</div>\n";
echo "<div class='info'>Make sure to:</div>\n";
echo "<ul>\n";
echo "<li>Create the wishlist table using setup_wishlist_table.sql</li>\n";
echo "<li>Have at least one user and one product in your database</li>\n";
echo "<li>Update the test_user_id and test_product_id variables if needed</li>\n";
echo "</ul>\n";

/**
 * Test a wishlist API endpoint
 */
function testWishlistAPI($action, $data) {
    $url = "http://localhost/Narpavi_Honey/Narpavi_Honey_Backend/routes/auth/shop/wishlist.php/$action";
    
    $options = [
        'http' => [
            'header' => "Content-type: application/x-www-form-urlencoded\r\n",
            'method' => 'POST',
            'content' => http_build_query($data)
        ]
    ];
    
    $context = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    
    if ($result === FALSE) {
        return [
            'success' => false,
            'message' => 'Failed to connect to API'
        ];
    }
    
    $decoded = json_decode($result, true);
    return $decoded ?: [
        'success' => false,
        'message' => 'Invalid JSON response'
    ];
}
?>

