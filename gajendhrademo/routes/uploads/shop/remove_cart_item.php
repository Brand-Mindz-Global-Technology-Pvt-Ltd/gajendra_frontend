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
    
    // Enable error reporting for debugging
    error_reporting(E_ALL);
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
    
    try {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            exit;
        }
        
        // Get POST data
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            $input = $_POST;
        }
        
        $cart_item_id = intval($input['cart_item_id'] ?? 0);
        
        // Validation
        if (!$cart_item_id) {
            echo json_encode(['success' => false, 'message' => 'Cart item ID is required']);
            exit;
        }
        
        // Remove cart item
        $result = Cart::removeCartItem($cart_item_id);
        
        echo json_encode($result);
        
    } catch (Exception $e) {
        error_log("Remove Cart Item API Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Internal server error']);
    }
};