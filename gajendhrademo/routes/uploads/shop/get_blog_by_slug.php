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

    try {
        $conn = Database::getConnection();

        $slug = isset($_GET['slug']) ? trim($_GET['slug']) : '';

        if (empty($slug)) {
            echo json_encode(["success" => false, "message" => "Slug is required"]);
            exit;
        }

        $stmt = $conn->prepare("SELECT id, title, slug, content, image, created_at, updated_at FROM blogs WHERE slug = ?");
        $stmt->bind_param("s", $slug);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            echo json_encode(["success" => false, "message" => "Blog not found"]);
            exit;
        }

        $blog = $result->fetch_assoc();
        
        // Format the blog data similar to get_blogs.php
        $blog['blog_url'] = "blog-detail.html?slug=" . $blog['slug'];
        $blog['image_url'] = $blog['image'] ? "uploads/" . $blog['image'] : null;
        $blog['formatted_date'] = date('M d, Y', strtotime($blog['created_at']));
        $blog['excerpt'] = substr(strip_tags($blog['content']), 0, 150) . '...';
        
        // Extract category from content or use default
        $blog['category'] = 'General';
        if (preg_match('/#(\w+)/', $blog['content'], $matches)) {
            $blog['category'] = ucfirst($matches[1]);
        }
        
        // Get real admin name
        $admin_stmt = $conn->prepare("SELECT name FROM users WHERE role = 'admin' LIMIT 1");
        if ($admin_stmt) {
            $admin_stmt->execute();
            $admin_result = $admin_stmt->get_result();
                if ($admin_result->num_rows > 0) {
                    $admin = $admin_result->fetch_assoc();
                    $blog['author'] = ucwords($admin['name']);
                } else {
                    $blog['author'] = 'Admin';
                }
            $admin_stmt->close();
        } else {
            $blog['author'] = 'Admin';
        }

        echo json_encode(["success" => true, "blog" => $blog]);

        $stmt->close();
    } catch (Exception $e) {
        error_log("Blog by slug API Error: " . $e->getMessage());
        echo json_encode([
            "success" => false, 
            "message" => "Failed to fetch blog. Please try again later."
        ]);
    } finally {
        if (isset($conn)) {
            $conn->close();
        }
    }
};
