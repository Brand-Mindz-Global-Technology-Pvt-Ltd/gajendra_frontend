-- Create wishlist table for Narpavi Honey Shop System
-- This script creates the wishlist table for the wishlist functionality

-- Use the narpavihoney database
USE narpavihoney;

-- Create wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uniq_wishlist (user_id, product_id),
    KEY user_id (user_id),
    KEY product_id (product_id),
    CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Insert sample wishlist data for testing (optional)
-- INSERT IGNORE INTO wishlist (user_id, product_id) VALUES 
-- (1, 1),
-- (1, 2),
-- (2, 1);

