<?php
require_once '../../config/db.php';
require_once '../../controllers/AuthController.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $user_id = $_POST['user_id'] ?? 0;

    $auth = new AuthController($conn);
    $result = $auth->getUserAddress($user_id);

    echo json_encode($result);
    exit;
}

echo json_encode(['status' => 'error', 'message' => 'Invalid method']);
?>
