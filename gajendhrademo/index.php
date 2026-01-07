<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

require __DIR__ . '/config/db.php';
require __DIR__ . '/routes/api.php';
