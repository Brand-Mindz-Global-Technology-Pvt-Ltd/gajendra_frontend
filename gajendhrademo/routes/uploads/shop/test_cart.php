<?php
${basename(__FILE__, '.php')} = function () {
    // Handle CORS
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Content-Type: application/json');
    
    // Handle preflight OPTIONS request
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Cart API is working!',
        'timestamp' => date('Y-m-d H:i:s'),
        'endpoints' => [
            'add_to_cart' => 'POST - Add product to cart',
            'get_cart' => 'GET - Get cart items',
            'update_cart_item' => 'POST - Update cart item quantity',
            'remove_cart_item' => 'POST - Remove item from cart'
        ]
    ]);
};