# Wishlist Functionality Setup Guide

This guide explains how to set up and use the complete wishlist functionality for the Narpavi Honey e-commerce website.

## 🚀 Quick Setup

### 1. Database Setup

First, create the wishlist table in your database:

```sql
-- Run this SQL script in your MySQL database
USE narpavihoney;

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
```

Or simply run the provided SQL file:
```bash
mysql -u your_username -p narpavihoney < setup_wishlist_table.sql
```

### 2. Test the API

Run the test script to verify everything is working:
```bash
# Open in browser: http://localhost/Narpavi_Honey/Narpavi_Honey_Backend/test_wishlist_api.php
```

## 📁 Files Created/Modified

### Backend Files
- `routes/auth/shop/wishlist.php` - Main wishlist API endpoints
- `setup_wishlist_table.sql` - Database table creation script
- `test_wishlist_api.php` - API testing script

### Frontend Files
- `public/pages/shop.html` - Added heart icons to product cards
- `public/pages/productpage.html` - Added heart icon to product detail page
- `public/pages/wishlist.html` - Complete wishlist page

## 🔧 API Endpoints

### 1. Add to Wishlist
```
POST /wishlist/add
Parameters:
- user_id (int): User ID
- product_id (int): Product ID

Response:
{
  "success": true,
  "message": "Product added to wishlist successfully"
}
```

### 2. Remove from Wishlist
```
POST /wishlist/remove
Parameters:
- user_id (int): User ID
- product_id (int): Product ID

Response:
{
  "success": true,
  "message": "Product removed from wishlist successfully"
}
```

### 3. Get Wishlist Count
```
GET /wishlist/count?user_id=1
Response:
{
  "success": true,
  "message": "Wishlist count retrieved successfully",
  "data": {
    "count": 5
  }
}
```

### 4. Get Wishlist Products
```
GET /wishlist/list?user_id=1
Response:
{
  "success": true,
  "message": "Wishlist products retrieved successfully",
  "data": {
    "products": [
      {
        "wishlist_id": 1,
        "product_id": 1,
        "name": "Product Name",
        "price": 299.99,
        "images": ["image1.jpg", "image2.jpg"],
        "variations": [...],
        "added_date": "2024-01-01 12:00:00"
      }
    ]
  }
}
```

## 🎨 Frontend Features

### 1. Heart Icons on Product Cards
- **Location**: Shop page and product detail page
- **Behavior**: 
  - Gray heart by default
  - Red heart when product is in wishlist
  - Click to toggle wishlist status
  - Shows toast notifications

### 2. Navbar Wishlist Count
- **Location**: Top navigation bar
- **Behavior**:
  - Shows current wishlist item count
  - Updates dynamically after add/remove
  - Click to navigate to wishlist page

### 3. Wishlist Page
- **URL**: `/pages/wishlist.html`
- **Features**:
  - Grid layout of wishlist products
  - Remove individual items
  - Add to cart from wishlist
  - Clear all wishlist items
  - Empty state handling
  - Loading states

## 🔐 Authentication

The wishlist functionality requires user authentication:
- Users must be logged in to add/remove items
- Wishlist is tied to user accounts
- Guest users see login prompts

## 🎯 Usage Examples

### Adding to Wishlist (JavaScript)
```javascript
// Add product to wishlist
async function addToWishlist(userId, productId) {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('product_id', productId);
    
    const response = await fetch('/wishlist/add', {
        method: 'POST',
        body: formData
    });
    
    const data = await response.json();
    if (data.success) {
        console.log('Added to wishlist!');
    }
}
```

### Getting Wishlist Count (JavaScript)
```javascript
// Get wishlist count
async function getWishlistCount(userId) {
    const response = await fetch(`/wishlist/count?user_id=${userId}`);
    const data = await response.json();
    
    if (data.success) {
        return data.data.count;
    }
    return 0;
}
```

## 🐛 Troubleshooting

### Common Issues

1. **"User not found" error**
   - Ensure the user exists in the `users` table
   - Check user authentication status

2. **"Product not found" error**
   - Ensure the product exists in the `products` table
   - Check if product status is 'active'

3. **Database connection errors**
   - Verify database credentials in `config/db.php`
   - Ensure MySQL server is running

4. **CORS errors**
   - Check that CORS headers are properly set in the API
   - Verify the frontend is making requests to the correct URL

### Testing Checklist

- [ ] Database table created successfully
- [ ] API endpoints respond correctly
- [ ] Heart icons appear on product cards
- [ ] Clicking heart toggles wishlist status
- [ ] Navbar count updates correctly
- [ ] Wishlist page loads and displays items
- [ ] Remove functionality works
- [ ] Add to cart from wishlist works

## 🔄 Integration with Cart System

The wishlist system is designed to work alongside the existing cart system:
- Products can be added to cart directly from wishlist
- Cart count updates when items are added from wishlist
- Both systems use localStorage for immediate UI updates
- Backend APIs handle the actual data persistence

## 📱 Mobile Responsiveness

All wishlist features are fully responsive:
- Heart icons scale appropriately on mobile
- Wishlist page grid adapts to screen size
- Touch-friendly button sizes
- Mobile-optimized navigation

## 🚀 Future Enhancements

Potential improvements for the wishlist system:
- Wishlist sharing functionality
- Price drop notifications
- Bulk operations (add multiple to cart)
- Wishlist categories/folders
- Export wishlist to PDF
- Social sharing of wishlist items

## 📞 Support

If you encounter any issues:
1. Check the browser console for JavaScript errors
2. Verify API responses using the test script
3. Ensure all database tables and relationships are correct
4. Check that user authentication is working properly

---

**Note**: This wishlist system is production-ready and includes proper error handling, security measures, and user experience optimizations.

