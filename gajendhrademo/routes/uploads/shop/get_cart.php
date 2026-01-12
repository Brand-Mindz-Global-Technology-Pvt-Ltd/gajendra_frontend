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
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            exit;
        }
        
        // Get GET parameters
        $user_id = intval($_GET['user_id'] ?? 0);
        $session_id = $_GET['session_id'] ?? null;
        
        // For guest users, session_id is required
        if ($user_id == 0 && !$session_id) {
            echo json_encode(['success' => false, 'message' => 'Session ID is required for guest users']);
            exit;
        }
        
        // Get cart items
        $result = Cart::getCartItems($user_id, $session_id);
        
        echo json_encode($result);
        
    } catch (Exception $e) {
        error_log("Get Cart API Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Internal server error']);
    }
};