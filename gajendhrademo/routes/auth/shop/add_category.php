<?php
// =====================================================
// ERROR REPORTING (DEV MODE)
// =====================================================
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Throw MySQL errors as exceptions
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

// =====================================================
// CORS (FULL + SAFE)
// =====================================================
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 86400"); // cache preflight for 24 hrs
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// =====================================================
// DB CONNECTION
// =====================================================
require_once '../../../config/db.php';

if (!isset($conn)) {
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed"
    ]);
    exit;
}

// =====================================================
// ONLY POST ALLOWED
// =====================================================
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request method"
    ]);
    exit;
}

// =====================================================
// INPUTS (shop_id OPTIONAL)
// =====================================================
$shop_id = (isset($_POST['shop_id']) && $_POST['shop_id'] !== '')
    ? intval($_POST['shop_id'])
    : null;

$name   = isset($_POST['name']) ? trim($_POST['name']) : '';
$slug   = isset($_POST['slug']) ? trim($_POST['slug']) : '';
$id     = isset($_POST['id']) ? intval($_POST['id']) : 0;

$edit   = $_POST['edit'] ?? '0';
$delete = $_POST['delete'] ?? '0';

// =====================================================
// MAIN LOGIC
// =====================================================
try {

    /* ==============================
       DELETE CATEGORY
    ============================== */
    if ($delete === '1') {

        if ($id === 0) {
            throw new Exception("Category ID is required");
        }

        // Delete subcategories
        $stmtSub = $conn->prepare(
            "DELETE FROM subcategories WHERE category_id = ?"
        );
        $stmtSub->bind_param("i", $id);
        $stmtSub->execute();
        $stmtSub->close();

        // Delete category
        $stmt = $conn->prepare(
            "DELETE FROM categories WHERE id = ?"
        );
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $stmt->close();

        echo json_encode([
            "success" => true,
            "message" => "Category deleted successfully"
        ]);
        exit;
    }

    /* ==============================
       EDIT CATEGORY
    ============================== */
    if ($edit === '1') {

        if ($id === 0 || $name === '' || $slug === '') {
            throw new Exception("Invalid edit data");
        }

        $stmt = $conn->prepare(
            "UPDATE categories SET name = ?, slug = ? WHERE id = ?"
        );
        $stmt->bind_param("ssi", $name, $slug, $id);
        $stmt->execute();
        $stmt->close();

        echo json_encode([
            "success" => true,
            "message" => "Category updated successfully"
        ]);
        exit;
    }

    /* ==============================
       ADD CATEGORY
    ============================== */
    if ($name === '' || $slug === '') {
        throw new Exception("Name and slug are required");
    }

    // Duplicate slug check
    if ($shop_id !== null) {
        $check = $conn->prepare(
            "SELECT id FROM categories WHERE slug = ? AND shop_id = ?"
        );
        $check->bind_param("si", $slug, $shop_id);
    } else {
        $check = $conn->prepare(
            "SELECT id FROM categories WHERE slug = ?"
        );
        $check->bind_param("s", $slug);
    }

    $check->execute();
    $check->store_result();

    if ($check->num_rows > 0) {
        throw new Exception("Category slug already exists");
    }
    $check->close();

    // Insert category
    if ($shop_id !== null) {
        $stmt = $conn->prepare(
            "INSERT INTO categories (shop_id, name, slug, created_at)
             VALUES (?, ?, ?, NOW())"
        );
        $stmt->bind_param("iss", $shop_id, $name, $slug);
    } else {
        $stmt = $conn->prepare(
            "INSERT INTO categories (name, slug, created_at)
             VALUES (?, ?, NOW())"
        );
        $stmt->bind_param("ss", $name, $slug);
    }

    $stmt->execute();
    $stmt->close();

    echo json_encode([
        "success" => true,
        "message" => "Category added successfully"
    ]);
    exit;

} catch (Throwable $e) {

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
    exit;

} finally {
    $conn->close();
}
