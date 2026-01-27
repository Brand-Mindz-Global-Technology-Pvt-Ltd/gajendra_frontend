/**
 * PriceUtils - Utility functions for calculating product prices
 * Handles variations, strike prices, and price formatting
 */

/**
 * Calculate display price and strike price from product
 * @param {Object} product - Product object with price, variations, etc.
 * @returns {Object} { displayPrice: string, strikePrice: string|null }
 */
export function calculateProductPrice(product) {
    let displayPrice = "0.00";
    let strikePrice = null;
    
    let variations = product.variations || [];
    if (typeof variations === 'string') {
        try { 
            variations = JSON.parse(variations); 
        } catch (e) { 
            variations = []; 
        }
    }

    if (variations && variations.length > 0) {
        const normalizedVariations = variations.map(v => ({ 
            price: parseFloat(v.price || v.amount || 0),
            strikePrice: parseFloat(v.strike_amount || v.strike_price || 0)
        }));
        normalizedVariations.sort((a, b) => a.price - b.price);
        displayPrice = normalizedVariations[0].price.toFixed(2);
        strikePrice = normalizedVariations[0].strikePrice > 0 ? normalizedVariations[0].strikePrice.toFixed(2) : null;
    } else {
        displayPrice = parseFloat(product.price || product.amount || 0).toFixed(2);
        strikePrice = parseFloat(product.strike_price || product.strike_amount || 0) > 0 
            ? parseFloat(product.strike_price || product.strike_amount || 0).toFixed(2) 
            : null;
    }

    return { displayPrice, strikePrice };
}

