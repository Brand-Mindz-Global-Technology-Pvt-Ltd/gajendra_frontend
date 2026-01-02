/**
 * Product Module Configuration
 */

// Ensure API_BASE is available, or define it if not
if (typeof API_BASE === 'undefined') {
    window.API_BASE = "https://gajendhrademo.brandmindz.com/routes/auth/shop";
}

// Shared constants can be added here
const PRODUCT_CONSTANTS = {
    MAX_IMAGES: 4,
    IMAGE_UPLOAD_PATH: "https://gajendhrademo.brandmindz.com/routes/uploads/products/"
};
