<?php
require_once '../../config/db.php';
require_once '../../controllers/AuthController.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $data = [
        'user_id' => $_POST['user_id'] ?? 0,
        'full_name' => $_POST['full_name'] ?? '',
        'phone' => $_POST['phone'] ?? '',
        'address_line1' => $_POST['address_line1'] ?? '',
        'address_line2' => $_POST['address_line2'] ?? '',
        'city' => $_POST['city'] ?? '',
        'state' => $_POST['state'] ?? '',
        'pincode' => $_POST['pincode'] ?? '',
        'country' => $_POST['country'] ?? 'India',
        'landmark' => $_POST['landmark'] ?? ''
    ];

    $auth = new AuthController($conn);
    $result = $auth->updateUserAddress($data);

    echo json_encode($result);
    exit;
}

echo json_encode(['status' => 'error', 'message' => 'Invalid method']);
?>
