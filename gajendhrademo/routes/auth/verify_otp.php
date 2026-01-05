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
    // Collect all POST data into a single array
    $data = [
        'email' => $_POST['email'] ?? '',
        'otp' => $_POST['otp'] ?? '',
        'name' => $_POST['name'] ?? '',
        'phone' => $_POST['phone'] ?? '',
        'password' => $_POST['password'] ?? '',
        'confirm_password' => $_POST['confirm_password'] ?? '',
        'agreed_terms' => $_POST['agreed_terms'] ?? 0,
    ];

    $auth = new AuthController($conn);
    // Pass the single data array to the controller method
    $result = $auth->verifyRegistrationOTP($data);

if ($result['status'] === 'success') {
    echo json_encode([
        'success' => true,
        'message' => $result['message']
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => $result['message']
    ]);
}
exit;

} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}
?>