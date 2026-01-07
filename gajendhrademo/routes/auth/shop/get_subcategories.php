<?php
// ============================
// CORS HEADERS
// ============================
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

$allowed_origins = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:8081',
    'http://127.0.0.1:5504',
    'http://localhost:5500',
    'http://127.0.0.1:5501',
    'http://localhost:5501',
    'http://localhost'
];

// Allow file:// protocol (Origin: null)
if ($origin === 'null') {
    header("Access-Control-Allow-Origin: *");
} elseif (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}

header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 86400");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ============================
// API LOGIC
// ============================
header("Content-Type: application/json");
require_once "../../../config/db.php";

$shop_id = $_GET['shop_id'] ?? null;
$category_id = $_GET['category_id'] ?? null;

try {
    if ($shop_id && $category_id) {
        // Filter by shop + category
        $stmt = $conn->prepare("
            SELECT id, name, slug, category_id
            FROM subcategories
            WHERE shop_id = ? AND category_id = ?
            ORDER BY name ASC
        ");
        $stmt->bind_param("ii", $shop_id, $category_id);

    } elseif ($category_id) {
        // Filter only by category
        $stmt = $conn->prepare("
            SELECT id, name, slug, category_id
            FROM subcategories
            WHERE category_id = ?
            ORDER BY name ASC
        ");
        $stmt->bind_param("i", $category_id);

    } elseif ($shop_id) {
        // Filter only by shop
        $stmt = $conn->prepare("
            SELECT id, name, slug, category_id
            FROM subcategories
            WHERE shop_id = ?
            ORDER BY name ASC
        ");
        $stmt->bind_param("i", $shop_id);

    } else {
        // No filter → return all
        $stmt = $conn->prepare("
            SELECT id, name, slug, category_id
            FROM subcategories
            ORDER BY name ASC
        ");
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $subcategories = [];
    while ($row = $result->fetch_assoc()) {
        $subcategories[] = $row;
    }

    echo json_encode([
        "success" => true,
        "subcategories" => $subcategories
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
