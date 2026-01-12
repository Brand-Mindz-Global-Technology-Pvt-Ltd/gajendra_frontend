-- Quick setup for wishlist functionality
-- Run this in your MySQL database

USE narpavihoney;

-- Create wishlist table if it doesn't exist
CREATE TABLE IF NOT EXISTS wishlist (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uniq_wishlist (user_id, product_id),
    KEY user_id (user_id),
    KEY product_id (product_id)
);

-- Insert some test data if tables exist
-- Make sure you have at least one user and one product first

-- Check if we have users
SELECT 'Users in database:' as info, COUNT(*) as count FROM users;

-- Check if we have products  
SELECT 'Products in database:' as info, COUNT(*) as count FROM products;

-- Show wishlist table structure
DESCRIBE wishlist;

