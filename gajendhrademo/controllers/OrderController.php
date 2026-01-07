<?php

class OrderController {
    private $conn;

    public function __construct($dbConn) {
        $this->conn = $dbConn;
    }

    public function getUserOrders($userId) {
        // TODO: Replace with Real SQL when Order Table is finalized
        /*
        $stmt = $this->conn->prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        ...
        */

        // Returning Empty Array for Empty State UI Testing
        // If data exists, format it as:
        // ['id' => 12345, 'status' => 'Delivered', 'item_count' => 2, 'total' => 650, 'date' => '02 Nov 2025']
        
        return [
            'success' => true,
            'data' => [] 
        ];
    }
}
?>
