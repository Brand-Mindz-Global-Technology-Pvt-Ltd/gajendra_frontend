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
        
        $user_id = intval($input['user_id'] ?? 0);
        $product_id = intval($input['product_id'] ?? 0);
        $quantity = intval($input['quantity'] ?? 1);
        $session_id = $input['session_id'] ?? null;
        
        // Validation
        if (!$product_id) {
            echo json_encode(['success' => false, 'message' => 'Product ID is required']);
            exit;
        }
        
        if ($quantity <= 0) {
            echo json_encode(['success' => false, 'message' => 'Invalid quantity']);
            exit;
        }
        
        // For guest users, session_id is required
        if ($user_id == 0 && !$session_id) {
            echo json_encode(['success' => false, 'message' => 'Session ID is required for guest users']);
            exit;
        }
        
        // Add to cart
        $result = Cart::addToCart($user_id, $product_id, $quantity, $session_id);
        
        echo json_encode($result);
        
    } catch (Exception $e) {
        error_log("Add to Cart API Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Internal server error']);
    }
};