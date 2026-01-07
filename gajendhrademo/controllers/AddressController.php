<?php

class AddressController {
    private $conn;

    public function __construct($dbConn) {
        $this->conn = $dbConn;
    }

    public function getAllAddresses($userId) {
        try {
            $stmt = $this->conn->prepare("
                SELECT * FROM user_addresses
                WHERE user_id = ?
                ORDER BY is_default DESC, id DESC
            ");
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            $result = $stmt->get_result();

            $addresses = [];
            while ($row = $result->fetch_assoc()) {
                $addresses[] = $row;
            }

            return ['success' => true, 'data' => $addresses];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function saveAddress($data) {
        try {
            $user_id = $data['user_id'];
            $address_id = $data['address_id'] ?? null;
            $is_default = $data['is_default'] ?? 0;

            // Manage Default Address
            if ($is_default == 1) {
                $this->conn->query("UPDATE user_addresses SET is_default = 0 WHERE user_id = $user_id");
            }

            if ($address_id) {
                return $this->updateAddress($data);
            } else {
                return $this->addAddress($data);
            }
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    private function addAddress($data) {
        $stmt = $this->conn->prepare("
            INSERT INTO user_addresses 
            (user_id, address_type, full_name, phone, address_line1, address_line2,
             city, state, pincode, country, landmark, is_default)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $country = $data['country'] ?? 'India';
        
        $stmt->bind_param(
            "isssssssssii",
            $data['user_id'],
            $data['address_type'],
            $data['full_name'],
            $data['phone'],
            $data['address_line1'],
            $data['address_line2'],
            $data['city'],
            $data['state'],
            $data['pincode'],
            $country,
            $data['landmark'],
            $data['is_default']
        );

        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Address added successfully'];
        }
        return ['success' => false, 'message' => 'Failed to add address'];
    }

    private function updateAddress($data) {
        $stmt = $this->conn->prepare("
            UPDATE user_addresses
            SET 
                address_type = ?, full_name = ?, phone = ?, 
                address_line1 = ?, address_line2 = ?,
                city = ?, state = ?, pincode = ?, country = ?, 
                landmark = ?, is_default = ?
            WHERE id = ? AND user_id = ?
        ");

        $country = $data['country'] ?? 'India';

        $stmt->bind_param(
            "ssssssssssiii",
            $data['address_type'],
            $data['full_name'],
            $data['phone'],
            $data['address_line1'],
            $data['address_line2'],
            $data['city'],
            $data['state'],
            $data['pincode'],
            $country,
            $data['landmark'],
            $data['is_default'],
            $data['address_id'],
            $data['user_id']
        );

        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Address updated successfully'];
        }
        return ['success' => false, 'message' => 'Failed to update address'];
    }

    public function deleteAddress($addressId, $userId) {
        try {
            $stmt = $this->conn->prepare("DELETE FROM user_addresses WHERE id = ? AND user_id = ?");
            $stmt->bind_param("ii", $addressId, $userId);
            
            if ($stmt->execute()) {
                return ['success' => true, 'message' => 'Address deleted successfully'];
            }
            return ['success' => false, 'message' => 'Failed to delete address'];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
}
?>
