<?php
require_once '../../../config/db.php';

// ============================
// CORS HEADERS (FIXED)
// ============================
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

$allowed_origins = [
    'http://127.0.0.1:5504',
    'http://localhost:5504',
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'https://gajendhrademo.brandmindz.com'
];

if (
    $origin === 'null' || 
    $origin === 'https://gajendhrademo.brandmindz.com' || 
    preg_match('/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/', $origin)
) {
    header("Access-Control-Allow-Origin: " . ($origin === 'null' ? '*' : $origin));
    header("Access-Control-Allow-Credentials: true");
}

header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 86400");
header("Content-Type: application/json");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// =======================================================
// INPUTS (PRICE REMOVED COMPLETELY)
// =======================================================
$product_id = intval($_POST['id'] ?? $_POST['product_id'] ?? 0);
$name = trim($_POST['name'] ?? '');
$slug = trim($_POST['slug'] ?? '');
$description = trim($_POST['description'] ?? '');
$product_description = trim($_POST['product_description'] ?? '');
$benefits = trim($_POST['benefits'] ?? '');
$how_to_use = trim($_POST['how_to_use'] ?? '');
$variations = $_POST['variations'] ?? '';
$stock = intval($_POST['stock'] ?? 0);

$is_new_arrival    = (!empty($_POST['is_new_arrival']) && $_POST['is_new_arrival'] != '0') ? 1 : 0;
$is_best_seller    = (!empty($_POST['is_best_seller']) && $_POST['is_best_seller'] != '0') ? 1 : 0;
$is_fourth_section = (!empty($_POST['is_fourth_section']) && $_POST['is_fourth_section'] != '0') ? 1 : 0;

$category_id    = intval($_POST['category_id'] ?? 0);
$subcategory_id = intval($_POST['subcategory_id'] ?? 0);
$status = $_POST['status'] ?? 'active';

// =======================================================
// VALIDATE VARIATIONS JSON
// =======================================================
if (!empty($variations)) {
    $decoded = json_decode($variations, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid JSON format"
        ]);
        exit;
    }
    $variations = json_encode($decoded);
} else {
    $variations = '[]';
}

// =======================================================
// VALIDATE REQUIRED DATA
// =======================================================
if ($product_id === 0 || $name === '' || $slug === '') {
    echo json_encode([
        "success" => false,
        "message" => "Invalid input"
    ]);
    exit;
}

// ==========================================================
// ⭐ UPDATE PRODUCT (PRICE REMOVED)
// ==========================================================
$stmt = $conn->prepare("
    UPDATE products SET
        name=?,
        slug=?,
        description=?,
        product_description=?,
        benefits=?,
        how_to_use=?,
        variations=?,
        stock=?,
        is_new_arrival=?,
        is_best_seller=?,
        is_fourth_section=?,
        category_id=?,
        subcategory_id = NULLIF(?, 0),
        status=?
    WHERE id=?
");

$stmt->bind_param(
    "sssssssiiiiiisi",
    $name,
    $slug,
    $description,
    $product_description,
    $benefits,
    $how_to_use,
    $variations,
    $stock,
    $is_new_arrival,
    $is_best_seller,
    $is_fourth_section,
    $category_id,
    $subcategory_id,
    $status,
    $product_id
);

if (!$stmt->execute()) {
    echo json_encode([
        "success" => false,
        "message" => "Update failed"
    ]);
    exit;
}
$stmt->close();

// =======================================================
// ⭐ TASTE SEGMENT LOGIC (UNCHANGED)
// =======================================================
$taste_upload_dir = __DIR__ . "/../../uploads/taste_segments/";
if (!is_dir($taste_upload_dir)) {
    mkdir($taste_upload_dir, 0755, true);
}

// DELETE
if (!empty($_POST['delete_taste_segments']) && is_array($_POST['delete_taste_segments'])) {
    foreach ($_POST['delete_taste_segments'] as $del_id) {
        $del_id = intval($del_id);
        if ($del_id > 0) {
            $del = $conn->prepare(
                "DELETE FROM taste_segment WHERE id=? AND product_id=?"
            );
            $del->bind_param("ii", $del_id, $product_id);
            $del->execute();
            $del->close();
        }
    }
}

// INSERT / UPDATE
if (isset($_POST['taste_segments']) && is_array($_POST['taste_segments'])) {
    foreach ($_POST['taste_segments'] as $index => $seg) {

        $ts_id    = intval($seg['id'] ?? 0);
        $ts_title = trim($seg['title'] ?? '');
        $ts_desc  = trim($seg['description'] ?? '');

        $icon_field = "taste_icon_" . $index;
        $uploaded_icon = null;

        if (
            isset($_FILES[$icon_field]) &&
            $_FILES[$icon_field]['error'] === UPLOAD_ERR_OK &&
            $_FILES[$icon_field]['name'] !== ''
        ) {
            $file_name = time() . "_" . mt_rand(1000,9999) . "_" . basename($_FILES[$icon_field]['name']);
            $target_path = $taste_upload_dir . $file_name;

            if (move_uploaded_file($_FILES[$icon_field]['tmp_name'], $target_path)) {
                $uploaded_icon = $file_name;
            }
        }

        if ($ts_id > 0) {
            if ($uploaded_icon !== null) {
                $upd = $conn->prepare(
                    "UPDATE taste_segment SET title=?, description=?, icon=? WHERE id=? AND product_id=?"
                );
                $upd->bind_param("sssii", $ts_title, $ts_desc, $uploaded_icon, $ts_id, $product_id);
            } else {
                $upd = $conn->prepare(
                    "UPDATE taste_segment SET title=?, description=? WHERE id=? AND product_id=?"
                );
                $upd->bind_param("ssii", $ts_title, $ts_desc, $ts_id, $product_id);
            }
            $upd->execute();
            $upd->close();
        } else {
            if ($ts_title !== '' || $ts_desc !== '' || $uploaded_icon !== null) {
                $ins = $conn->prepare(
                    "INSERT INTO taste_segment (title, description, icon, product_id)
                     VALUES (?, ?, ?, ?)"
                );
                $icon_value = $uploaded_icon ?? "";
                $ins->bind_param("sssi", $ts_title, $ts_desc, $icon_value, $product_id);
                $ins->execute();
                $ins->close();
            }
        }
    }
}

// ===========================================================
// ⭐ IMAGE SLOT HANDLING (UNCHANGED)
// ===========================================================
$existing_images = [];
$q = $conn->prepare(
    "SELECT image_path FROM product_images WHERE product_id=? ORDER BY id ASC"
);
$q->bind_param("i", $product_id);
$q->execute();
$res = $q->get_result();
while ($r = $res->fetch_assoc()) {
    $existing_images[] = $r['image_path'];
}
$q->close();

$final_images = ["__EMPTY__", "__EMPTY__", "__EMPTY__", "__EMPTY__"];
for ($i = 0; $i < 4; $i++) {
    if (isset($existing_images[$i])) {
        $final_images[$i] = $existing_images[$i];
    }
}

for ($i = 0; $i < 4; $i++) {
    if (isset($_POST["delete_image_$i"]) && $_POST["delete_image_$i"] === "1") {
        $final_images[$i] = "__EMPTY__";
    }
}

$upload_dir = __DIR__ . "/../../uploads/products/";
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

for ($i = 0; $i < 4; $i++) {
    $key = "image_" . $i;
    if (isset($_FILES[$key]) && $_FILES[$key]['error'] === UPLOAD_ERR_OK) {

        $file_name = time() . "_" . mt_rand(1000,9999) . "_" . basename($_FILES[$key]['name']);
        $target_path = $upload_dir . $file_name;

        if (move_uploaded_file($_FILES[$key]['tmp_name'], $target_path)) {
            $final_images[$i] = $file_name;
        }
    }
}

$conn->query("DELETE FROM product_images WHERE product_id=$product_id");

$img_insert = $conn->prepare(
    "INSERT INTO product_images (product_id, image_path) VALUES (?, ?)"
);
foreach ($final_images as $img) {
    $img_insert->bind_param("is", $product_id, $img);
    $img_insert->execute();
}
$img_insert->close();

// ===========================================================
// RESPONSE
// ===========================================================
echo json_encode([
    "success" => true,
    "message" => "Product updated successfully"
]);

$conn->close();
