<?php
require_once '../../config/db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
    exit;
}

$user_id = $_POST['user_id'] ?? '';

if (!$user_id) {
    echo json_encode(['status' => 'error', 'message' => 'User ID missing']);
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

// Safe updates (do not overwrite with empty values)
$name = !empty($_POST['name']) ? $_POST['name'] : $current['name'];
$email = !empty($_POST['email']) ? $_POST['email'] : $current['email'];
$phone = !empty($_POST['phone']) ? $_POST['phone'] : $current['phone'];
$dob = !empty($_POST['dob']) ? $_POST['dob'] : $current['dob'];
$gender = !empty($_POST['gender']) ? $_POST['gender'] : $current['gender'];
$profile_image = !empty($_POST['profile_image']) ? $_POST['profile_image'] : $current['profile_image'];

// Update only changed fields
$update = $conn->prepare("
    UPDATE users 
    SET name = ?, email = ?, phone = ?, dob = ?, gender = ?, profile_image = ?
    WHERE id = ?
");
$update->bind_param("ssssssi", $name, $email, $phone, $dob, $gender, $profile_image, $user_id);

if ($update->execute()) {
    echo json_encode(['status' => 'success', 'message' => 'Profile updated']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to update']);
}
?>
