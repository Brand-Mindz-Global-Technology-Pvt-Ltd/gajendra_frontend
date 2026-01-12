<?php

$host = "localhost";
$db   = "u488332695_gajendra_db";   // NOT username
$user = "u488332695_gajendra";
$pass = "5/jRt91Rj!MN";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed"
    ]);
    exit;
}
