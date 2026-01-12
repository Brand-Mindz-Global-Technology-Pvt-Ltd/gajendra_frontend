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
}
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../config/db.php';

/* ===============================
   SESSION AUTH
================================ */
$lifetime = 2592000; // 30 days
ini_set('session.gc_maxlifetime', $lifetime);
ini_set('session.cookie_lifetime', $lifetime);
ini_set('session.cookie_secure', 1);
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_samesite', 'None');

session_start();

$user_id = $_SESSION['user_id'] ?? 0;

if (!$user_id) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized: Please login']);
    exit;
}

// Fetch current user details
$check = $conn->prepare("SELECT * FROM users WHERE id = ?");
$check->bind_param("i", $user_id);
$check->execute();
$result = $check->get_result();

if ($result->num_rows == 0) {
    echo json_encode(['status' => 'error', 'message' => 'User not found']);
    exit;
}

$current = $result->fetch_assoc();

// Map POST fields (Frontend uses full_name, DB uses name)
$name = !empty($_POST['full_name']) ? $_POST['full_name'] : $current['name'];
$email = !empty($_POST['email']) ? $_POST['email'] : $current['email']; // Usually immutable, but keeping logic
$phone = !empty($_POST['phone']) ? $_POST['phone'] : $current['phone'];
$dob = !empty($_POST['dob']) ? $_POST['dob'] : $current['dob']; // If sent
$gender = !empty($_POST['gender']) ? $_POST['gender'] : $current['gender'];

// Update only changed fields
$update = $conn->prepare("UPDATE users SET name = ?, email = ?, phone = ?, dob = ?, gender = ? WHERE id = ?");
$update->bind_param("sssssi", $name, $email, $phone, $dob, $gender, $user_id);

if ($update->execute()) {
    echo json_encode(['status' => 'success', 'message' => 'Profile updated successfully']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to update profile']);
}
?>
