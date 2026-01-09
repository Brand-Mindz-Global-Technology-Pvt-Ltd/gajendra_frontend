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
$lifetime = 2592000;
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

/* ===============================
   FILE UPLOAD
================================ */
if (!isset($_FILES['profile_image'])) {
    echo json_encode(['status' => 'error', 'message' => 'No file uploaded']);
    exit;
}

$file = $_FILES['profile_image'];
$allowed = ['jpg','jpeg','png', 'webp'];
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

if (!in_array($ext, $allowed)) {
    echo json_encode(['status' => 'error', 'message' => 'Only JPG, PNG, WEBP allowed']);
    exit;
}

// Ensure Folder Exists
$folder = "../../uploads/profile/";
if (!file_exists($folder)) {
    mkdir($folder, 0775, true);
}

// Generate Name
$newName = "user_" . $user_id . "_" . time() . "." . $ext;
$targetPath = $folder . $newName;

if (move_uploaded_file($file['tmp_name'], $targetPath)) {

    // Correct URL Construction
    $domain = "https://gajendhrademo.brandmindz.com";
    $publicUrl = $domain . "/uploads/profile/" . $newName;

    $stmt = $conn->prepare("UPDATE users SET profile_image = ? WHERE id = ?");
    $stmt->bind_param("si", $publicUrl, $user_id);
    
    if ($stmt->execute()) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Profile image updated',
            'image_url' => $publicUrl
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Database update failed']);
    }

} else {
    echo json_encode(['status' => 'error', 'message' => 'File move failed']);
}
?>
