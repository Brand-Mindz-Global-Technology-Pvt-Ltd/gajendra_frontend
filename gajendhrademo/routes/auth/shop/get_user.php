<?php
header("Content-Type: application/json");
session_start();
require_once "../../../config/db.php";

/* ---------- Admin Check (flexible) ---------- */
function is_admin() {
  if (isset($_SESSION["role"]) && $_SESSION["role"] === "admin") return true;
  if (isset($_SESSION["user"]["role"]) && $_SESSION["user"]["role"] === "admin") return true;
  if (isset($_SESSION["admin"]["role"]) && $_SESSION["admin"]["role"] === "admin") return true;
  return false;
}

if (!is_admin()) {
  http_response_code(401);
  echo json_encode(["success" => false, "message" => "Unauthorized"]);
  exit;
}

$id = isset($_GET["id"]) ? intval($_GET["id"]) : 0;
if ($id <= 0) {
  http_response_code(400);
  echo json_encode(["success" => false, "message" => "Invalid user id"]);
  exit;
}

try {
  $stmt = $conn->prepare("SELECT id, name, email, phone, role, created_at FROM users WHERE id = ? LIMIT 1");
  $stmt->bind_param("i", $id);
  $stmt->execute();
  $res = $stmt->get_result();

  if ($res->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "User not found"]);
    exit;
  }

  $user = $res->fetch_assoc();
  echo json_encode(["success" => true, "data" => $user]);

} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["success" => false, "message" => "Server error"]);
}
