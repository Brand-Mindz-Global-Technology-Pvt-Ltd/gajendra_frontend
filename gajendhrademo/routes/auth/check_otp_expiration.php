<?php
require_once '../../config/db.php';
require_once '../../controllers/AuthController.php';

header('Content-Type: application/json');

/* ================= CORS ================= */
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $purpose = $_POST['purpose'] ?? 'signup';

    // Basic validation
    if (!$email) {
        echo json_encode(['status' => 'error', 'message' => 'Email is required']);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid email format']);
        exit;
    }

    // Use AuthController to check OTP expiration
    $auth = new AuthController($conn);
    $result = $auth->checkOTPExpiration($email, $purpose);
    
    echo json_encode($result);
    exit;

} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}
?> 