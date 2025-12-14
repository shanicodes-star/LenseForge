/**
 * Cart Page Script - Optimized
 */

// ==================== GLOBAL VARIABLES ====================
let cart = [];
let subtotal = 0;
let shipping = 0;
let total = 0;

// DOM Elements Cache
const elements = {
    cartItems: null,
    subTotalEl: null,
    shippingEl: null,
    totalEl: null,
    checkoutBtn: null,
    emptyCartMsg: null
};

// Shipping Rates Configuration
const SHIPPING_RATES = {
    BASE: 0,
    ONE_ITEM: 170,
    TWO_ITEMS: 220,
    THREE_TO_FIVE: 270,
    SIX_PLUS: 350
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Load navbar and footer
        await Promise.all([loadNavbar(), loadFooter()]);
        
        // Initialize cart
        await initializeCart();
        
        // Setup event listeners
        setupEventListeners();
        
        console.log('Cart page initialized');
    } catch (error) {
        console.error('Cart initialization error:', error);
        showError('Failed to load cart. Please refresh the page.');
    }
});

// ==================== LOAD FUNCTIONS ====================
async function loadNavbar() {
    try {
        const response = await fetch('navbar.html');
        if (!response.ok) throw new Error('Navbar not found');
        const html = await response.text();
        document.getElementById('navbar').innerHTML = html;
        updateCartCount();
    } catch (error) {
        console.error('Error loading navbar:', error);
    }
}

async function loadFooter() {
    try {
        const response = await fetch('footer.html');
        if (!response.ok) throw new Error('Footer not found');
        const html = await response.text();
        document.getElementById('footer').innerHTML = html;
    } catch (error) {
        console.error('Error loading footer:', error);
    }
}

// ==================== CART FUNCTIONS ====================
async function initializeCart() {
    // Cache DOM elements
    cacheElements();
    
    // Load cart from localStorage
    loadCartFromStorage();
    
    // Calculate and display
    calculateCart();
    displayCartItems();
    updateSummary();
    
    // Show/hide empty cart message
    toggleEmptyCartMessage();
}

function cacheElements() {
    elements.cartItems = document.getElementById('cartItems');
    elements.subTotalEl = document.getElementById('subTotal');
    elements.shippingEl = document.getElementById('shipping');
    elements.totalEl = document.getElementById('total');
    elements.checkoutBtn = document.getElementById('addCartBTN');
    elements.emptyCartMsg = document.getElementById('emptyCartMsg');
}

function loadCartFromStorage() {
    try {
        const cartData = localStorage.getItem('cart');
        cart = cartData ? JSON.parse(cartData) : [];
    } catch (error) {
        console.error('Error parsing cart data:', error);
        cart = [];
    }
}

function calculateCart() {
    subtotal = 0;
    
    // Calculate subtotal
    cart.forEach(item => {
        // Use numeric price from data.json
        const price = typeof item.price === 'number' ? item.price : 
                     parseFloat((item.price || '0').toString().replace('$', '')) || 0;
        subtotal += price;
    });
    
    // Calculate shipping
    shipping = calculateShipping(cart.length);
    
    // Calculate total
    total = subtotal + shipping;
}

function calculateShipping(itemCount) {
    if (itemCount === 0) return SHIPPING_RATES.BASE;
    if (itemCount === 1) return SHIPPING_RATES.ONE_ITEM;
    if (itemCount === 2) return SHIPPING_RATES.TWO_ITEMS;
    if (itemCount >= 3 && itemCount <= 5) return SHIPPING_RATES.THREE_TO_FIVE;
    if (itemCount >= 6) return SHIPPING_RATES.SIX_PLUS;
    return SHIPPING_RATES.BASE;
}

// ==================== DISPLAY FUNCTIONS ====================
function displayCartItems() {
    if (!elements.cartItems || cart.length === 0) return;
    
    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    
    cart.forEach((item, index) => {
        const itemElement = createCartItemElement(item, index);
        fragment.appendChild(itemElement);
    });
    
    elements.cartItems.innerHTML = '';
    elements.cartItems.appendChild(fragment);
}

function createCartItemElement(item, index) {
    const div = document.createElement('div');
    div.className = 'card bg-secondary text-light mb-3 p-3';
    div.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
                <h5 class="mb-1">${escapeHTML(item.name)}</h5>
                <p class="text-light mb-2">${escapeHTML(item.summary || '')}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <strong class="fs-5 text-warning">${item.displayPrice || `$${item.price}`}</strong>
                    <button class="btn btn-outline-danger btn-sm remove-item-btn" 
                            data-index="${index}"
                            aria-label="Remove ${escapeHTML(item.name)} from cart">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return div;
}

function updateSummary() {
    if (!elements.subTotalEl || !elements.shippingEl || !elements.totalEl) return;
    
    elements.subTotalEl.textContent = `$${subtotal.toFixed(2)}`;
    elements.shippingEl.textContent = `$${shipping.toFixed(2)}`;
    elements.totalEl.textContent = `$${total.toFixed(2)}`;
}

function toggleEmptyCartMessage() {
    if (!elements.cartItems) return;
    
    if (cart.length === 0) {
        elements.cartItems.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-shopping-cart fa-4x text-muted mb-3"></i>
                <h4 class="text-muted">Your cart is empty</h4>
                <p class="text-muted mb-4">Add some products to get started!</p>
                <a href="index.html" class="btn btn-warning">
                    <i class="fas fa-shopping-bag me-2"></i> Continue Shopping
                </a>
            </div>
        `;
        
        // Disable checkout button
        if (elements.checkoutBtn) {
            elements.checkoutBtn.disabled = true;
            elements.checkoutBtn.innerHTML = '<i class="fas fa-lock me-2"></i> Cart Empty';
        }
    } else {
        // Enable checkout button
        if (elements.checkoutBtn) {
            elements.checkoutBtn.disabled = false;
            elements.checkoutBtn.innerHTML = '<i class="fas fa-credit-card me-2"></i> Proceed to Checkout';
        }
    }
}

// ==================== EVENT HANDLERS ====================
function setupEventListeners() {
    // Checkout button
    if (elements.checkoutBtn) {
        elements.checkoutBtn.addEventListener('click', handleCheckout);
    }
    
    // Delegate remove item events
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-item-btn')) {
            const button = e.target.closest('.remove-item-btn');
            const index = parseInt(button.getAttribute('data-index'));
            removeItemFromCart(index);
        }
    });
}

function handleCheckout() {
    if (cart.length === 0) {
        showToast('Your cart is empty!', 'warning');
        return;
    }
    
    // Show confirmation
    if (confirm(`Proceed to checkout? Total: $${total.toFixed(2)}`)) {
        // In a real app, this would redirect to payment gateway
        showToast('Checkout functionality coming soon!', 'info');
        console.log('Checkout initiated:', {
            items: cart.length,
            subtotal: subtotal,
            shipping: shipping,
            total: total
        });
    }
}

function removeItemFromCart(index) {
    if (index < 0 || index >= cart.length) return;
    
    const itemName = cart[index].name;
    cart.splice(index, 1);
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Recalculate and update display
    calculateCart();
    displayCartItems();
    updateSummary();
    toggleEmptyCartMessage();
    updateCartCount();
    
    // Show confirmation
    showToast(`Removed ${itemName} from cart`, 'success');
}

// ==================== UTILITY FUNCTIONS ====================
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.cart-toast');
    existingToasts.forEach(toast => toast.remove());
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = `cart-toast position-fixed bottom-0 end-0 m-3 alert alert-${type} alert-dismissible fade show`;
    toast.style.zIndex = '1050';
    toast.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger m-3';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle me-2"></i>
        ${message}
        <button class="btn btn-sm btn-outline-light ms-3" onclick="location.reload()">
            Retry
        </button>
    `;
    
    const container = document.querySelector('.container');
    if (container) {
        container.prepend(errorDiv);
    }
}

// ==================== GLOBAL FUNCTIONS ====================
// Make cart functions available globally if needed
window.updateCartCount = function() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const count = cart.length;
        
        // Update navbar cart count
        const badges = document.querySelectorAll('#cartCount');
        badges.forEach(badge => {
            badge.textContent = count;
        });
        
        // ALSO update cart page item count
        const cartItemCount = document.getElementById('cartItemCount');
        if (cartItemCount) {
            cartItemCount.textContent = count;
        }
        
        // Also update order summary item count
        const itemCount = document.getElementById('itemCount');
        if (itemCount) {
            itemCount.textContent = count;
        }
        
        console.log('Cart count updated:', count);
        
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
};

// Initialize cart count on load
updateCartCount();