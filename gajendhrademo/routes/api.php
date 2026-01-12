<?php

header('Content-Type: application/json');

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// If hosted inside a folder, uncomment this
// $uri = str_replace('/indiantribedemo', '', $uri);

switch ($uri) {

    /* =======================
       SHOP - CATEGORY APIs
       ======================= */

    case '/auth/shop/get-categories':
        require __DIR__ . '/auth/shop/get_categories.php';
        break;

    case '/auth/shop/add-category':
        require __DIR__ . '/auth/shop/add_category.php';
        break;

    /* =======================
       SHOP - BLOG APIs
       ======================= */

    case '/auth/shop/add-blog':
        require __DIR__ . '/auth/shop/add_blog.php';
        break;

    default:
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "API route not found"
        ]);
        break;
}
