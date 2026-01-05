<?php
require_once '../../config/db.php';
require_once '../../controllers/AuthController.php';



header('Content-Type: application/json');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Collect ALL POST data into a single array
    $data = [
        'name' => $_POST['name'] ?? '',
        'phone' => $_POST['phone'] ?? '',
        'email' => $_POST['email'] ?? '',
        'password' => $_POST['password'] ?? '',
        'confirm_password' => $_POST['confirm_password'] ?? '',
        'agreed_terms' => $_POST['agreed_terms'] ?? '1',
        'purpose' => 'signup', // Hardcode purpose for this route
    ];
    
    $auth = new AuthController($conn);
    // Pass the single data array to the controller method
    $result = $auth->resendOTP($data);
    
    echo json_encode($result);
    exit;
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}
?>