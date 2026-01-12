<?php
error_reporting(E_ALL);
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
${basename(__FILE__, '.php')} = function () {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(["success" => false, "message" => "Invalid request method"]);
        exit;
    }

    $conn = Database::getConnection();

$user_id    = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;
$product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0;
$rating     = isset($_POST['rating']) ? intval($_POST['rating']) : 0;
$review_text = isset($_POST['review_text']) ? trim($_POST['review_text']) : '';

if ($user_id === 0 || $product_id === 0 || $rating < 1 || $rating > 5) {
    echo json_encode(["success" => false, "message" => "Invalid input"]);
    exit;
}

// Handle optional photo upload(s) - support up to 3 images via field name "photos[]"
$primary_photo_path = null; // keep legacy single column support
$uploaded_images = [];
if (!empty($_FILES['photos']['name']) && is_array($_FILES['photos']['name'])) {
    $count = min(3, count($_FILES['photos']['name']));
    $upload_dir = __DIR__ . '/../uploads/review/';
    if (!is_dir($upload_dir)) {
        if (!mkdir($upload_dir, 0755, true)) {
            echo json_encode(["success" => false, "message" => "Failed to create upload directory."]);
            exit;
        }
    }
    $allowed_extensions = array("jpg", "jpeg", "png", "gif", "webp", "avif");
    for ($i = 0; $i < $count; $i++) {
        if ($_FILES['photos']['error'][$i] === UPLOAD_ERR_OK) {
            $file_tmp_name = $_FILES['photos']['tmp_name'][$i];
            $file_name = $_FILES['photos']['name'][$i];
            $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
            if (!in_array($file_ext, $allowed_extensions)) continue;
            $new_file_name = uniqid() . '.' . $file_ext;
            $dest_path = $upload_dir . $new_file_name;
            if (move_uploaded_file($file_tmp_name, $dest_path)) {
                $db_path = 'review/' . $new_file_name;
                $uploaded_images[] = $db_path;
                if ($primary_photo_path === null) $primary_photo_path = $db_path;
            }
        }
    }
} elseif (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
    // Backward compatibility: single photo field
    $file_tmp_name = $_FILES['photo']['tmp_name'];
    $file_name = $_FILES['photo']['name'];
    $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
    $allowed_extensions = array("jpg", "jpeg", "png", "gif", "webp", "avif");
    if (in_array($file_ext, $allowed_extensions)) {
        $upload_dir = __DIR__ . '/../uploads/review/';
        if (!is_dir($upload_dir)) {
            if (!mkdir($upload_dir, 0755, true)) {
                echo json_encode(["success" => false, "message" => "Failed to create upload directory."]);
                exit;
            }
        }
        $new_file_name = uniqid() . '.' . $file_ext;
        $dest_path = $upload_dir . $new_file_name;
        if (move_uploaded_file($file_tmp_name, $dest_path)) {
            $primary_photo_path = 'review/' . $new_file_name;
            $uploaded_images[] = $primary_photo_path;
        }
    }
}

// Insert review
$stmt = $conn->prepare("INSERT INTO reviews (product_id, user_id, rating, review_text, photo) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("iiiss", $product_id, $user_id, $rating, $review_text, $primary_photo_path);

if ($stmt->execute()) {
    $review_id = $stmt->insert_id;
    // If multiple images uploaded, persist to review_images table if exists
    if (!empty($uploaded_images)) {
        // Create table if not exists (safe)
        $conn->query("CREATE TABLE IF NOT EXISTS review_images (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            review_id INT UNSIGNED NOT NULL,
            image_path VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_review_id (review_id),
            CONSTRAINT fk_review_images_review FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
        ) ENGINE=InnoDB");
        $ins = $conn->prepare("INSERT INTO review_images (review_id, image_path) VALUES (?, ?)");
        foreach ($uploaded_images as $p) {
            $ins->bind_param("is", $review_id, $p);
            $ins->execute();
        }
        if ($ins) $ins->close();
    }
    echo json_encode(["success" => true, "message" => "Review added successfully"]);
    exit;
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
    exit;
}

$stmt->close();
$conn->close();
};
