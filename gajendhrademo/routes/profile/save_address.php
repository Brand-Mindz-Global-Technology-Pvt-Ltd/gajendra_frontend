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
    header("Access-Control-Allow-Origin: *");
}
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

/* ===============================
   SESSION & AUTH CHECK
================================ */
require_once '../../config/db.php';
require_once '../../controllers/AddressController.php';

// Session Params
$lifetime = 2592000; 
ini_set('session.gc_maxlifetime', $lifetime);
ini_set('session.cookie_lifetime', $lifetime);
session_set_cookie_params([
    'lifetime' => $lifetime,
    'path' => '/',
    'secure' => true,
    'httponly' => true,
    'samesite' => 'None'
]);

// Token Fallback
if (empty($_COOKIE['PHPSESSID'])) {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        session_id($matches[1]);
    }
}

session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

/* ===============================
   CONTROLLER ACTION
================================ */
// Merge Session User ID into POST data for security
$data = $_POST;
$data['user_id'] = $_SESSION['user_id'];

$controller = new AddressController($conn);
$result = $controller->saveAddress($data);

echo json_encode($result);
exit;
