<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

/* ===============================
   CORS (SESSION SAFE)
================================ */
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

$allowed_origins = [
    'http://localhost:5500',
    'http://127.0.0.1:5504',
    'https://gajendhrademo.brandmindz.com'
];

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
} else {
    header("Access-Control-Allow-Origin: *");
}

header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
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
        'message' => 'Session expired or not logged in'
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
