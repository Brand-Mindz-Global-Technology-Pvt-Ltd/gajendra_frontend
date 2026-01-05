<?php
// ===============================
// ERROR HANDLING
// ===============================
ini_set('display_errors', 1);
error_reporting(E_ALL);

// ===============================
// CORS FIX (🔥 IMPORTANT)
// ===============================
$allowed_origins = [
    'http://127.0.0.1:5504',
    'http://localhost:5504',
    'https://gajendhrademo.brandmindz.com'
];

if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ===============================
// DB CONNECTION
// ===============================
require_once '../../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
    exit;
}

// ===============================
// INPUT
// ===============================
$shop_id = isset($_POST['shop_id']) ? intval($_POST['shop_id']) : 0;
$name    = isset($_POST['name']) ? trim($_POST['name']) : '';
$slug    = isset($_POST['slug']) ? trim($_POST['slug']) : '';
$edit    = isset($_POST['edit']) ? $_POST['edit'] : '0';
$delete  = isset($_POST['delete']) ? $_POST['delete'] : '0';
$id      = isset($_POST['id']) ? intval($_POST['id']) : 0;

$response = ["success" => false, "message" => "Unknown error"];

try {

    // ========================
    // DELETE MODE
    // ========================
    if ($delete === '1') {

        if ($id === 0) {
            echo json_encode(["success" => false, "message" => "Category ID is required"]);
            exit;
        }

        // Delete subcategories
        $stmtSub = $conn->prepare("DELETE FROM subcategories WHERE category_id = ?");
        if ($stmtSub) {
            $stmtSub->bind_param("i", $id);
            $stmtSub->execute();
            $stmtSub->close();
        }

        // Delete category
        $stmt = $conn->prepare("DELETE FROM categories WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();

        echo json_encode([
            "success" => true,
            "message" => "Category deleted successfully"
        ]);

        $stmt->close();
        $conn->close();
        exit;
    }

    // ========================
    // EDIT MODE
    // ========================
    if ($edit === '1') {

        if ($id === 0 || $name === '' || $slug === '') {
            echo json_encode(["success" => false, "message" => "Invalid edit data"]);
            exit;
        }

        $stmt = $conn->prepare("UPDATE categories SET name = ?, slug = ? WHERE id = ?");
        $stmt->bind_param("ssi", $name, $slug, $id);
        $stmt->execute();

        echo json_encode([
            "success" => true,
            "message" => "Category updated successfully"
        ]);

        $stmt->close();
        $conn->close();
        exit;
    }

    // ========================
    // ADD MODE
    // ========================
    if ($shop_id === 0 || $name === '' || $slug === '') {
        echo json_encode(["success" => false, "message" => "Invalid input"]);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO categories (shop_id, name, slug) VALUES (?, ?, ?)");
    $stmt->bind_param("iss", $shop_id, $name, $slug);
    $stmt->execute();

    echo json_encode([
        "success" => true,
        "message" => "Category added successfully"
    ]);

    $stmt->close();
    $conn->close();
    exit;

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Server error"
    ]);
    $conn->close();
    exit;
}
