<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

/* ===============================
   CORS (SESSION SAFE)
================================ */
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
} else {
    // Fallback for non-browser requests or testing
    header("Access-Control-Allow-Origin: *");
}

header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

/* ===============================
   PREFLIGHT
================================ */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/* ===============================
   SESSION
================================ */
/* ===============================
   SESSION
================================ */
$lifetime = 2592000; // 30 days
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

// TOKEN AUTHENTICATION FALLBACK
// If cookie is missing, check Authorization header
if (empty($_COOKIE['PHPSESSID'])) {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        session_id($matches[1]);
    }
}

session_start();

/* ===============================
   DEPENDENCIES
================================ */
require_once '../../config/db.php';
require_once '../../controllers/AuthController.php';

/* ===============================
   AUTH CHECK
================================ */
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Session expired or not logged in',
        'debug' => [
            'session_id' => session_id(),
            'cookies_received' => array_keys($_COOKIE),
            'session_vars' => $_SESSION
        ]
    ]);
    exit;
}

$user_id = (int) $_SESSION['user_id'];

/* ===============================
   CONTROLLER
================================ */
$auth = new AuthController($conn);

if (!method_exists($auth, 'getUserProfile')) {
    echo json_encode([
        'success' => false,
        'message' => 'getUserProfile() not found'
    ]);
    exit;
}

$result = $auth->getUserProfile($user_id);

echo json_encode($result);
exit;
