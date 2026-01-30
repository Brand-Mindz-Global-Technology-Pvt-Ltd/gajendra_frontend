import CONFIG from "../config.js";

/**
 * ImageUtils - Utility functions for processing product images
 * Consistent image URL handling across the application
 */

/**
 * Get product image URL with proper fallback
 * Handles thumbnail, images array, domain normalization, and __EMPTY__ filtering
 * @param {Object} product - Product object with thumbnail, images, and name
 * @param {String} productName - Product name for placeholder (optional, uses product.name if available)
 * @returns {String} Full normalized image URL
 */
export function getProductImageUrl(product, productName = null) {
    // Support both object and legacy format
    let thumbnail = null;
    let images = null;
    let name = productName;

    if (typeof product === 'object' && product !== null) {
        thumbnail = product.thumbnail || null;
        images = product.images || null;
        name = name || product.name || 'Product';
    } else {
        // Legacy format: images as first param, name as second
        images = product;
        name = productName || 'Product';
    }

    // First check for thumbnail field
    let productImage = thumbnail || null;
    
    if (!productImage && images) {
        // Process images array
        let imageArray = images;
        if (typeof images === 'string') {
            try { 
                imageArray = JSON.parse(images); 
            } catch (e) { 
                imageArray = images.split(',').map(img => img.trim()); 
            }
        }
        
        // Handle case where images might be a single string (not array)
        if (!Array.isArray(imageArray) && imageArray) {
            imageArray = [imageArray];
        }
        
        // Filter out __EMPTY__ images
        if (Array.isArray(imageArray) && imageArray.length > 0) {
            const validImages = imageArray.filter(img => {
                if (!img) return false;
                const imgStr = String(img);
                return imgStr !== '__EMPTY__' && !imgStr.endsWith('/__EMPTY__') && imgStr !== 'null' && imgStr !== 'undefined';
            });
            productImage = validImages.length > 0 ? validImages[0] : null;
        }
    }

    // Normalize domain and build full URL
    if (productImage) {
        let imageUrl = String(productImage);
        
        // Normalize domain (replace gajendhrademo with gajendhrademo)
        if (imageUrl.includes('gajendhrademo.brandmindz.com')) {
            imageUrl = imageUrl.replace('gajendhrademo.brandmindz.com', 'gajendhrademo.brandmindz.com');
        }
        
        // If already a full URL, return as is
        if (imageUrl.startsWith('http')) {
            return imageUrl;
        }
        
        // Otherwise, prepend uploads URL
        return CONFIG.UPLOADS_URL + '/' + imageUrl;
    }
    
    // Fallback to placeholder
    return 'https://placehold.co/300x300/FDF5ED/DAA520?text=' + encodeURIComponent(name);
}

/**
 * Get all product images as array of URLs
 * @param {Object|Array|String} images - Product images
 * @returns {Array<String>} Array of image URLs
 */
export function getAllProductImages(images) {
    let imageArray = images;
    
    if (typeof images === 'string') {
        try {
            imageArray = JSON.parse(images);
        } catch (e) {
            imageArray = images.split(',').map(img => img.trim());
        }
    }
    
    if (!Array.isArray(imageArray) || imageArray.length === 0) {
        return [];
    }
    
    return imageArray
        .filter(img => img && img !== '__EMPTY__')
        .map(img => {
            if (img.startsWith('http')) {
                return img;
            }
            return CONFIG.UPLOADS_URL + '/' + img;
        });
}

