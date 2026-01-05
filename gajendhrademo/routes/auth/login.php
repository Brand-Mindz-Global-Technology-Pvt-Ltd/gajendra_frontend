<?php
require_once '../../config/db.php';
require_once '../../controllers/AuthController.php';

session_start();

/* ================= CORS ================= */
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/* ================= LOGIN ================= */
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

$auth = new AuthController($conn);
$result = $auth->login($email, $password);

if ($result['status'] === 'success') {
    $_SESSION['user_id'] = $result['user_id'];
    $_SESSION['email'] = $email;

    echo json_encode([
        'success' => true,
        'message' => 'Login successful'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => $result['message']
    ]);
}
exit;
