<?php
require_once '../../config/db.php';
require_once '../../controllers/AuthController.php';

/* ==================================================
   CORS FUNCTION (DYNAMIC ORIGIN SUPPORT)
================================================== */
function cors() {
    // Allow any origin that sends a request
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    // If an origin is present, allow it and enable credentials
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
}

cors();

/* ==================================================
   ALLOW ONLY POST
================================================== */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
    exit;
}

/* ==================================================
   INPUT DATA
================================================== */
$data = [
    'name' => $_POST['name'] ?? '',
    'phone' => $_POST['phone'] ?? '',
    'email' => $_POST['email'] ?? '',
    'password' => $_POST['password'] ?? '',
    'confirm_password' => $_POST['confirm_password'] ?? '',
    'agreed_terms' => $_POST['agreed_terms'] ?? 0
];

/* ==================================================
   PROCESS
================================================== */
$auth = new AuthController($conn);
$result = $auth->sendRegistrationOTP($data);

/* ==================================================
   RESPONSE NORMALIZATION (🔥 IMPORTANT)
================================================== */
if (isset($result['status']) && $result['status'] === 'success') {
    echo json_encode([
        'success' => true,
        'message' => $result['message']
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => $result['message'] ?? 'Registration failed'
    ]);
}
exit;
