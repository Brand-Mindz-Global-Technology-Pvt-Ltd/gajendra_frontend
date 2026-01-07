<?php
${basename(__FILE__, '.php')} = function () {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        echo json_encode(["success" => false, "message" => "Invalid request method"]);
        exit;
    }

    $conn = Database::getConnection();

$blog_id = isset($_GET['blog_id']) ? intval($_GET['blog_id']) : 0;

if ($blog_id === 0) {
    echo json_encode(["success" => false, "message" => "blog_id is required"]);
    exit;
}

$stmt = $conn->prepare("SELECT id, title, slug, content, image, created_at FROM blogs WHERE id = ?");
$stmt->bind_param("i", $blog_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Blog not found"]);
    exit;
}

$blog = $result->fetch_assoc();

echo json_encode(["success" => true, "blog" => $blog]);

$stmt->close();
$conn->close();
};
