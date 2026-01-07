<?php
// Test file to verify uploads directory is accessible
echo "Uploads directory is accessible!<br>";
echo "Current directory: " . __DIR__ . "<br>";
echo "Products directory exists: " . (is_dir(__DIR__ . "/products") ? "Yes" : "No") . "<br>";
echo "Blogs directory exists: " . (is_dir(__DIR__ . "/blogs") ? "Yes" : "No") . "<br>";

// List files in products directory
if (is_dir(__DIR__ . "/products")) {
    $files = scandir(__DIR__ . "/products");
    echo "Files in products directory: " . implode(", ", array_filter($files, function($f) { return $f !== '.' && $f !== '..'; })) . "<br>";
}
?>
