<?php
require_once '../../config/db.php';
require_once '../../controllers/AuthController.php';

// CORS headers
header('Content-Type: application/json');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? null;
    $password = $_POST['password'] ?? null;

    // Debug logging
    error_log("Reset Password Request - Email: " . ($email ?: 'null') . ", Password: " . ($password ? 'provided' : 'null'));

    if (!$email || !$password) {
        echo json_encode(['status' => 'error', 'message' => 'All fields are required']);
        exit;
    }

    $auth = new AuthController($conn);
    // The AuthController expects: email, new_password, confirm_password
    // Since we're only sending one password from frontend, we pass it twice
    $result = $auth->resetPasswordAfterOTP($email, $password, $password);
    
    echo json_encode($result);

} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}
?>
