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
    $otp = $_POST['otp'] ?? null;

    if (!$email || !$otp) {
        echo json_encode(['status' => 'error', 'message' => 'Email and OTP are required']);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['status' => 'error', 'message' => 'Valid email is required']);
        exit;
    }

    if (strlen($otp) !== 4 || !is_numeric($otp)) {
        echo json_encode(['status' => 'error', 'message' => 'OTP must be a 4-digit number']);
        exit;
    }

    $auth = new AuthController($conn);
    $result = $auth->verifyForgotPasswordOTPOnly($email, $otp);
    
    echo json_encode($result);

} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}
?>
