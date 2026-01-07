<?php

class WishlistController {
    private $conn;

    public function __construct($dbConn) {
        $this->conn = $dbConn;
    }

    public function getUserWishlist($userId) {
        // TODO: Replace with Real SQL
        /*
        $stmt = $this->conn->prepare("
            SELECT w.id, p.name, p.image, p.price 
            FROM wishlist w 
            JOIN products p ON w.product_id = p.id 
            WHERE w.user_id = ?
        ");
        */

        // Returning Empty Array for Empty State UI Testing
        return [
            'success' => true,
            'data' => [] 
        ];
    }
}
?>
