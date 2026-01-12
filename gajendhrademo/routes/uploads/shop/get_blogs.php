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

        $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 3;
        $offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;

        // Get blogs with pagination
        $query = "
            SELECT id, title, slug, content, image, created_at, updated_at
            FROM blogs 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        ";

        $stmt = $conn->prepare($query);
        $stmt->bind_param("ii", $limit, $offset);
        $stmt->execute();
        $result = $stmt->get_result();

        $blogs = [];
        while ($row = $result->fetch_assoc()) {
            // Format the blog data
            $row['blog_url'] = "blog-detail.html?slug=" . $row['slug'];
            $row['image_url'] = $row['image'] ? "uploads/" . $row['image'] : null;
            $row['formatted_date'] = date('M d, Y', strtotime($row['created_at']));
            $row['excerpt'] = substr(strip_tags($row['content']), 0, 100) . '...';
            
            // Extract category from content or use default
            $row['category'] = 'General'; // Default category
            if (preg_match('/#(\w+)/', $row['content'], $matches)) {
                $row['category'] = ucfirst($matches[1]);
            }
            
            // Get real admin name
            $admin_stmt = $conn->prepare("SELECT name FROM users WHERE role = 'admin' LIMIT 1");
            if ($admin_stmt) {
                $admin_stmt->execute();
                $admin_result = $admin_stmt->get_result();
                if ($admin_result->num_rows > 0) {
                    $admin = $admin_result->fetch_assoc();
                    $row['author'] = ucwords($admin['name']);
                } else {
                    $row['author'] = 'Admin';
                }
                $admin_stmt->close();
            } else {
                $row['author'] = 'Admin';
            }

            $blogs[] = $row;
        }

        $stmt->close();

        if (count($blogs) > 0) {
            echo json_encode([
                "success" => true, 
                "blogs" => $blogs,
                "total_count" => count($blogs),
                "limit" => $limit,
                "offset" => $offset
            ]);
        } else {
            echo json_encode([
                "success" => false, 
                "message" => "No blogs found",
                "blogs" => []
            ]);
        }

    } catch (Exception $e) {
        error_log("Blogs API Error: " . $e->getMessage());
        echo json_encode([
            "success" => false, 
            "message" => "Failed to fetch blogs. Please try again later."
        ]);
    } finally {
        if (isset($conn)) {
            $conn->close();
        }
    }
};