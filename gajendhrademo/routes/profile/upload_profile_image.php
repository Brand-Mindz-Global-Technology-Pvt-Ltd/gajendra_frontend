<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../config/db.php';
require_once '../../controllers/AuthController.php';

$user_id = $_POST['user_id'] ?? '';

if (!$user_id) {
    echo json_encode(['status' => 'error', 'message' => 'User ID missing']);
    exit;
}

if (!isset($_FILES['profile_image'])) {
    echo json_encode(['status' => 'error', 'message' => 'No file uploaded']);
    exit;
}

$file = $_FILES['profile_image'];

$allowed = ['jpg','jpeg','png'];
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

if (!in_array($ext, $allowed)) {
    echo json_encode(['status' => 'error', 'message' => 'Only JPG/PNG allowed']);
    exit;
}

$folder = "../../uploads/profile/";
if (!file_exists($folder)) {
    mkdir($folder, 0775, true);
}

$newName = "profile_" . $user_id . "_" . time() . "." . $ext;
$path = $folder . $newName;

if (move_uploaded_file($file['tmp_name'], $path)) {

    $baseUrl = "https://narpavihoney.brandmindz.com";
$url = $baseUrl . "/uploads/profile/" . $newName;


    $stmt = $conn->prepare("UPDATE users SET profile_image = ? WHERE id = ?");
    $stmt->bind_param("si", $url, $user_id);
    $stmt->execute();
if (!empty($row['profile_image'])) {
    if (strpos($row['profile_image'], "http") !== 0) {
        $row['profile_image'] = "https://narpavihoney.brandmindz.com" . $row['profile_image'];
    }
}
    echo json_encode([
        'status' => 'success',
        'message' => 'Profile image updated',
        'image_url' => $url
    ]);

} else {
    echo json_encode(['status' => 'error', 'message' => 'Upload failed']);
}
?>
