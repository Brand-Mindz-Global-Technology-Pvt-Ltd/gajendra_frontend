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
header("Access-Control-Allow-Headers: Content-Type, Authorization");

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
    $result = $auth->verifyRegistrationOTP($data);

    if ($result['status'] === 'success') {
        // Auto-login: Set session configuration for LONG persistence (30 days)
        $lifetime = 2592000; // 30 days in seconds
        ini_set('session.gc_maxlifetime', $lifetime);
        ini_set('session.cookie_lifetime', $lifetime);

        $cookieParams = session_get_cookie_params();
        session_set_cookie_params([
            'lifetime' => $lifetime,
            'path' => '/',
            'secure' => true,
            'httponly' => true,
            'samesite' => 'None'
        ]);
        session_start();
        $_SESSION['user_id'] = $result['user_id'];
        $_SESSION['email'] = $result['user_email'];

        echo json_encode([
            'success' => true,
            'message' => $result['message'],
            'token' => session_id()
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