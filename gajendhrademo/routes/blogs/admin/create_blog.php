
<?php
// create_blog.php
error_reporting(0);
ini_set('display_errors', 0);

require_once '../../../config/db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
    exit;
}

if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit;
}

// ============= INPUTS ============= //
$title             = trim($_POST['title'] ?? '');
$short_description = trim($_POST['short_description'] ?? '');
$slug              = trim($_POST['slug'] ?? '');
$content           = $_POST['content'] ?? '';
$meta_title        = trim($_POST['meta_title'] ?? '');
$meta_description  = trim($_POST['meta_description'] ?? '');
$category          = trim($_POST['category'] ?? '');
$tags              = trim($_POST['tags'] ?? '');
$status            = $_POST['status'] ?? 'published';
$author_id = NULL;
$image             = trim($_POST['image'] ?? '');  // image URL from upload API

// ============= VALIDATION ============= //
if ($title === '' || $slug === '' || $content === '') {
    echo json_encode(["status" => "error", "message" => "Title, slug and content are required"]);
    exit;
}

// Slug must be unique
$checkSlugSql = "SELECT id FROM blogs WHERE slug = ? LIMIT 1";
$stmt = $conn->prepare($checkSlugSql);
$stmt->bind_param("s", $slug);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "Slug already exists. Use another URL slug."]);
    exit;
}
$stmt->close();

// ============= INSERT QUERY ============= //
$sql = "
    INSERT INTO blogs 
    (title, short_description, slug, content, meta_title, meta_description, category, tags, image, status, author_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ssssssssssi", 
    $title,
    $short_description,
    $slug,
    $content,
    $meta_title,
    $meta_description,
    $category,
    $tags,
    $image,
    $status,
    $author_id   // becomes NULL
);


$ok = $stmt->execute();
$blog_id = $stmt->insert_id;
$stmt->close();

if (!$ok) {
    echo json_encode(["status" => "error", "message" => "Failed to create blog"]);
    exit;
}

echo json_encode([
    "status" => "success",
    "message" => "Blog created successfully",
    "blog_id" => $blog_id
]);
exit;
