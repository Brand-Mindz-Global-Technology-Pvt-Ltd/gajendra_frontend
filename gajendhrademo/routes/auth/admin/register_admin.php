<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set JSON content type
header('Content-Type: application/json');

require_once '../../../config/db.php';

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:8081',
    'http://127.0.0.1:5504',
    'http://localhost:5500',
    'http://127.0.0.1:5501',
    'http://localhost:5501',
    'http://localhost',
    'null'  // For file:// protocol
];

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Client-Fingerprint");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
}

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Database connection is already established in db.php via $conn
    // Verify connection exists
    if (!isset($conn) || $conn->connect_error) {
        throw new Exception("Database connection failed");
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(["success" => false, "message" => "Invalid request method"]);
        exit;
    }

    $name = trim($_POST['name'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $shop_name = trim($_POST['shop_name'] ?? '');

    // Validate required fields
    if (!$name || !$phone || !$email || !$password || !$shop_name) {
        echo json_encode(["success" => false, "message" => "All fields are required"]);
        exit;
    }

    // Check if email already exists
    $check_email = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $check_email->bind_param("s", $email);
    $check_email->execute();
    $email_result = $check_email->get_result();
    if ($email_result->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "Email address already exists"]);
        exit;
    }
    $check_email->close();

    // Check if phone already exists
    $check_phone = $conn->prepare("SELECT id FROM users WHERE phone = ?");
    $check_phone->bind_param("s", $phone);
    $check_phone->execute();
    $phone_result = $check_phone->get_result();
    if ($phone_result->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "Phone number already exists"]);
        exit;
    }
    $check_phone->close();

    // Hash password
    $password_hash = password_hash($password, PASSWORD_BCRYPT);

    // Start transaction
    $conn->begin_transaction();

    try {
        // Insert user (admin role)
        $stmt = $conn->prepare("INSERT INTO users (name, phone, email, role, password_hash, is_verified, agreed_terms, status) VALUES (?, ?, ?, 'admin', ?, 1, 1, 'active')");
        if (!$stmt) {
            throw new Exception("User prepare failed: " . $conn->error);
        }
        $stmt->bind_param("ssss", $name, $phone, $email, $password_hash);
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        $user_id = $stmt->insert_id;
        $stmt->close();

        // Insert shop linked to this user
        $shop_stmt = $conn->prepare("INSERT INTO shops (name, description, user_id) VALUES (?, 'New shop created', ?)");
        if (!$shop_stmt) {
            throw new Exception("Shop prepare failed: " . $conn->error);
        }
        $shop_stmt->bind_param("si", $shop_name, $user_id);
        if (!$shop_stmt->execute()) {
            throw new Exception("Shop execute failed: " . $shop_stmt->error);
        }
        $shop_id = $shop_stmt->insert_id;
        $shop_stmt->close();

        // Commit transaction
        $conn->commit();

        echo json_encode([
            "success" => true,
            "message" => "Admin registration successful! You can now login.",
            "user" => [
                "id" => (int)$user_id,
                "name" => $name,
                "email" => $email,
                "role" => "admin",
                "shop_id" => (int)$shop_id,
                "shop_name" => $shop_name
            ]
        ]);
        exit;
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(["success" => false, "message" => "Registration failed: " . $e->getMessage()]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}
