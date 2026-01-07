<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once '../../../config/db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? $_POST['action'] ?? '';

function sendResponse($success, $message, $data = null, $status_code = 200) {
    http_response_code($status_code);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit();
}

function validateRequired($params, $required_fields) {
    foreach ($required_fields as $field) {
        if (!isset($params[$field]) || $params[$field] === '') {
            return "Missing required field: $field";
        }
    }
    return null;
}

function userExists($user_id) {
    global $conn;
    $stmt = $conn->prepare("SELECT id FROM users WHERE id = ?");
    if (!$stmt) return false;
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    return $result && $result->num_rows > 0;
}

function productExists($product_id) {
    global $conn;
    $stmt = $conn->prepare("SELECT id FROM products WHERE id = ? AND status = 'active'");
    if (!$stmt) return false;
    $stmt->bind_param("i", $product_id);
    $stmt->execute();
    $result = $stmt->get_result();
    return $result && $result->num_rows > 0;
}

function addToWishlist($user_id, $product_id) {
    global $conn;
    $stmt = $conn->prepare("SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?");
    $stmt->bind_param("ii", $user_id, $product_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) return ['success'=>false,'message'=>'Product already in wishlist'];

    $stmt = $conn->prepare("INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)");
    $stmt->bind_param("ii", $user_id, $product_id);

    if ($stmt->execute()) return ['success'=>true,'message'=>'Product added to wishlist'];
    return ['success'=>false,'message'=>'Failed to add product'];
}

function removeFromWishlist($user_id, $product_id) {
    global $conn;
    $stmt = $conn->prepare("DELETE FROM wishlist WHERE user_id=? AND product_id=?");
    $stmt->bind_param("ii", $user_id, $product_id);
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) return ['success'=>true,'message'=>'Product removed'];
        return ['success'=>false,'message'=>'Product not in wishlist'];
    }
    return ['success'=>false,'message'=>'Failed to remove product'];
}

function getWishlistCount($user_id) {
    global $conn;
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM wishlist WHERE user_id=?");
    if (!$stmt) return ['success'=>false,'message'=>'Query failed'];
    $stmt->bind_param("i",$user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    return ['success'=>true,'count'=>(int)$row['count']];
}

function getWishlistProducts($user_id) {
    global $conn;
    $stmt = $conn->prepare("
        SELECT w.id AS wishlist_id, p.id AS product_id, p.name AS product_name, p.price AS product_price, p.variations, p.category_id, p.shop_id, p.status
        FROM wishlist w
        JOIN products p ON w.product_id = p.id
        WHERE w.user_id = ?
        ORDER BY w.created_at DESC
    ");
    $stmt->bind_param("i",$user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $products = [];
    $imageBaseURL = "https://narpavihoney.brandmindz.com/routes/uploads/products/";

    while ($row = $result->fetch_assoc()) {
        $product_id = $row['product_id'];

        // Decode variations if JSON
        if (!empty($row['variations'])) {
            $row['variations'] = json_decode($row['variations'], true);
        } else {
            $row['variations'] = [];
        }

        // Fetch all images for this product
        $img_stmt = $conn->prepare("SELECT image_path FROM product_images WHERE product_id=? ORDER BY id ASC");
        $img_stmt->bind_param("i", $product_id);
        $img_stmt->execute();
        $img_result = $img_stmt->get_result();

        $images = [];
        while ($img_row = $img_result->fetch_assoc()) {
            if (!empty($img_row['image_path'])) {
                $images[] = $imageBaseURL . $img_row['image_path'];
            }
        }
        $img_stmt->close();

        $products[] = [
            'wishlist_id' => (int)$row['wishlist_id'],
            'product_id'  => (int)$row['product_id'],
            'name'        => $row['product_name'],
            'price'       => (float)$row['product_price'],
            'variations'  => $row['variations'],
            'images'      => $images,
            'category_id' => (int)$row['category_id'],
            'shop_id'     => (int)$row['shop_id'],
            'status'      => $row['status']
        ];
    }

    return $products;
}

// Get input
$input = $method==='POST'?$_POST:$_GET;

try {
    switch($action) {
        case 'add':
            $error = validateRequired($input,['user_id','product_id']);
            if ($error) sendResponse(false,$error,null,400);
            $uid=(int)$input['user_id']; $pid=(int)$input['product_id'];
            if(!userExists($uid)) sendResponse(false,'User not found',null,404);
            if(!productExists($pid)) sendResponse(false,'Product not found',null,404);
            $res = addToWishlist($uid,$pid);
            sendResponse($res['success'],$res['message']);
        break;

        case 'remove':
            $error = validateRequired($input,['user_id','product_id']);
            if ($error) sendResponse(false,$error,null,400);
            $uid=(int)$input['user_id']; $pid=(int)$input['product_id'];
            if(!userExists($uid)) sendResponse(false,'User not found',null,404);
            $res = removeFromWishlist($uid,$pid);
            sendResponse($res['success'],$res['message']);
        break;

        case 'count':
            $error = validateRequired($input,['user_id']);
            if ($error) sendResponse(false,$error,null,400);
            $uid=(int)$input['user_id'];
            if(!userExists($uid)) sendResponse(false,'User not found',null,404);
            $res = getWishlistCount($uid);
            sendResponse($res['success'],'Wishlist count retrieved',['count'=>$res['count']]);
        break;

        case 'list':
            $error = validateRequired($input,['user_id']);
            if ($error) sendResponse(false,$error,null,400);
            $uid=(int)$input['user_id'];
            if(!userExists($uid)) sendResponse(false,'User not found',null,404);
            $products = getWishlistProducts($uid);
            sendResponse(true,'Wishlist products retrieved',['products'=>$products]);
        break;

        default:
            sendResponse(false,'Invalid action. Use add/remove/count/list',null,400);
    }
} catch(Exception $e) {
    sendResponse(false,'Internal server error: '.$e->getMessage(),null,500);
}
?>
