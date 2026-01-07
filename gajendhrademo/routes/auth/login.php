<?php
require_once '../../config/db.php';
require_once '../../controllers/AuthController.php';

// Set session configuration for LONG persistence (30 days)
$lifetime = 2592000; // 30 days in seconds
ini_set('session.gc_maxlifetime', $lifetime);
ini_set('session.cookie_lifetime', $lifetime);

$cookieParams = session_get_cookie_params();
session_set_cookie_params([
    'lifetime' => $lifetime, // FORCE 30 days
    'path' => '/',
    // 'domain' => ... let PHP handle the domain automatically
    'secure' => true, // Always true for HTTPS
    'httponly' => true,
    'samesite' => 'None'
]);

session_start();

/* ================= CORS ================= */
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/* ================= LOGIN ================= */
try {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        throw new Exception('Email and password are required');
    }

    $auth = new AuthController($conn);
    $result = $auth->login($email, $password);

    // DEBUG: Handle backwards compatibility for mismatched file versions
    // Check for 'success' (new) OR 'status' === 'success' (old)
    $isSuccess = ($result['success'] ?? false) === true || ($result['status'] ?? '') === 'success';

    if ($isSuccess) {
        // Extract Data - handle both formats
        $userId = $result['data']['id'] ?? $result['user_id'] ?? null;
        
        if (!$userId) {
            throw new Exception("Login logic error: User ID not returned from controller");
        }

        $_SESSION['user_id'] = $userId;
        $_SESSION['email'] = $email;

        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'token' => session_id(), // Return session ID for manual persistence
            'data' => [
                'id' => $_SESSION['user_id'],
                'email' => $_SESSION['email']
            ]
        ]);
    } else {
        throw new Exception($result['message'] ?? 'Invalid credentials');
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
exit;
