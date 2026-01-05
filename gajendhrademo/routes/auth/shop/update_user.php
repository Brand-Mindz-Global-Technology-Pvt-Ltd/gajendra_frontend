<?php
header("Content-Type: application/json");

// IMPORTANT: must be exact admin domain (NOT *)
header("Access-Control-Allow-Origin: http://127.0.0.1:5507");

// allow cookies / sessions
header("Access-Control-Allow-Credentials: true");

// allow methods
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

// allow headers
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();
session_start();
require_once "../../../config/db.php";

/* ---------- Admin Check ---------- */
function is_admin() {
    if (isset($_SESSION["role"]) && $_SESSION["role"] === "admin") return true;
    if (isset($_SESSION["user"]["role"]) && $_SESSION["user"]["role"] === "admin") return true;
    if (isset($_SESSION["admin"]["role"]) && $_SESSION["admin"]["role"] === "admin") return true;
    return false;
}

// if (!is_admin()) {
//     http_response_code(401);
//     echo json_encode(["success" => false, "message" => "Unauthorized"]);
//     exit;
// }

/* ---------- Read JSON Body ---------- */
$input = json_decode(file_get_contents("php://input"), true);

$id    = isset($input["id"]) ? intval($input["id"]) : 0;
$name  = trim($input["name"] ?? "");
$email = trim($input["email"] ?? "");
$phone = trim($input["phone"] ?? "");
$role  = trim($input["role"] ?? "");

/* ---------- Validation ---------- */
if ($id <= 0 || $name === "" || $email === "" || $phone === "" || $role === "") {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "All fields are required"]);
    exit;
}

if (!in_array($role, ["admin", "user"])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid role"]);
    exit;
}

/* ---------- Prevent Self Role Change ---------- */
$currentAdminId = $_SESSION["user"]["id"] ?? $_SESSION["admin"]["id"] ?? null;

if ($currentAdminId && intval($currentAdminId) === $id && $role !== "admin") {
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "message" => "You cannot change your own admin role"
    ]);
    exit;
}

/* ---------- Update User ---------- */
try {
    $stmt = $conn->prepare(
        "UPDATE users 
         SET name = ?, email = ?, phone = ?, role = ? 
         WHERE id = ?"
    );
    $stmt->bind_param("ssssi", $name, $email, $phone, $role, $id);

    if (!$stmt->execute()) {
        throw new Exception("Update failed");
    }

    echo json_encode([
        "success" => true,
        "message" => "User updated successfully"
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Server error"
    ]);
}
