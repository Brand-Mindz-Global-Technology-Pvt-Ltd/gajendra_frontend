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
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $user_id = $_POST['user_id'] ?? 0;

    $auth = new AuthController($conn);
    $result = $auth->getUserAddress($user_id);

    echo json_encode($result);
    exit;
}

echo json_encode(['status' => 'error', 'message' => 'Invalid method']);
?>
