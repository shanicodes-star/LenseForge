/**
 * Product Detail Page Script - With Related Products
 */

// ==================== GLOBAL VARIABLES ====================
let currentProduct = null;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Detail page loading...');
    
    try {
        // Load navbar and footer
        await Promise.all([loadNavbar(), loadFooter()]);
        
        // Get product ID from URL
        const productId = getProductIdFromURL();
        console.log('Product ID from URL:', productId);
        
        if (!productId) {
            showProductNotFound();
            return;
        }
        
        // Load and display product
        await loadProductDetails(productId);
        
        console.log('Detail page loaded successfully');
        
    } catch (error) {
        console.error('Detail page initialization error:', error);
        showError('Failed to load product details. Please try again.');
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

// ==================== GET PRODUCT ID ====================
function getProductIdFromURL() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        let productId = urlParams.get('id');
        
        console.log('Raw ID from URL:', productId);
        
        if (!productId) {
            console.warn('No product ID found in URL');
            return null;
        }
        
        // Convert to number
        const id = parseInt(productId);
        
        if (isNaN(id) || id <= 0) {
            console.warn('Invalid product ID:', productId);
            return null;
        }
        
        return id;
        
    } catch (error) {
        console.error('Error getting product ID:', error);
        return null;
    }
}

// ==================== LOAD PRODUCT DETAILS ====================
async function loadProductDetails(productId) {
    try {
        console.log('Loading product details for ID:', productId);
        
        // Show loading state
        document.getElementById('loadingState').classList.remove('d-none');
        document.getElementById('productDetail').classList.add('d-none');
        document.getElementById('errorState').classList.add('d-none');
        
        // Fetch all products
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Products data not found');
        
        const products = await response.json();
        console.log('Total products loaded:', products.length);
        
        // Find the specific product
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            console.error('Product not found with ID:', productId);
            showProductNotFound();
            return;
        }
        
        console.log('Product found:', product.name);
        currentProduct = product;
        
        // Hide loading, show product
        document.getElementById('loadingState').classList.add('d-none');
        document.getElementById('productDetail').classList.remove('d-none');
        displayProductDetails(product);
        
        // Load related products
        loadRelatedProducts(product.category, product.id);
        
    } catch (error) {
        console.error('Error loading product details:', error);
        showProductNotFound();
    }
}

// ==================== RELATED PRODUCTS ====================
async function loadRelatedProducts(category, currentProductId) {
    try {
        console.log('Loading related products for category:', category);
        
        const response = await fetch('data.json');
        const products = await response.json();
        
        // Filter related products (same category, excluding current)
        const related = products
            .filter(p => p.category === category && p.id !== currentProductId)
            .slice(0, 4);
        
        console.log('Found related products:', related.length);
        
        const relatedContainer = document.getElementById('relatedProducts');
        const loadingContainer = document.getElementById('relatedProductsLoading');
        const noRelatedContainer = document.getElementById('noRelatedProducts');
        
        if (!relatedContainer || !loadingContainer) {
            console.log('Related products containers not found');
            return;
        }
        
        // Hide loading
        loadingContainer.classList.add('d-none');
        
        if (related.length === 0) {
            console.log('No related products found');
            if (noRelatedContainer) {
                noRelatedContainer.classList.remove('d-none');
            }
            return;
        }
        
        // Show related products
        relatedContainer.classList.remove('d-none');
        relatedContainer.innerHTML = related.map(product => `
            <div class="col-md-3 col-sm-6 mb-4">
                <div class="card product-card h-100 shadow-sm border-0">
                    <img src="${product.images[0]}" 
                         class="card-img-top" 
                         alt="${product.name}"
                         loading="lazy"
                         height="160">
                    
                    <div class="card-body">
                        <span class="badge bg-dark">${product.brand}</span>
                        <h6 class="card-title mt-2">${product.name}</h6>
                        <p class="card-text text-muted small">${product.summary}</p>
                    </div>
                    
                    <div class="card-footer bg-dark border-0">
                        <div class="d-flex justify-content-between align-items-center">
                            <strong class="price">${product.displayPrice || `$${product.price}`}</strong>
                            <a href="detail.html?id=${product.id}" 
                               class="btn btn-outline-warning btn-sm">
                                View
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading related products:', error);
        const loadingContainer = document.getElementById('relatedProductsLoading');
        if (loadingContainer) loadingContainer.classList.add('d-none');
    }
}

// ==================== DISPLAY FUNCTIONS ====================
function displayProductDetails(product) {
    const productDetail = document.getElementById('productDetail');
    if (!productDetail) return;
    
    productDetail.innerHTML = `
        <div class="row g-4">
            <!-- Product Images -->
            <div class="col-lg-6">
                <div class="card border-0 shadow-lg bg-transparent">
                    <img src="${product.images[0]}" 
                         class="img-fluid rounded-3" 
                         alt="${product.name}"
                         loading="eager"
                         id="mainProductImage">
                </div>
            </div>
            
            <!-- Product Information -->
            <div class="col-lg-6">
                <div class="product-info">
                    <!-- Brand Badge -->
                    <span class="badge bg-warning text-dark fs-6 mb-2">${product.brand}</span>
                    
                    <!-- Product Name -->
                    <h1 class="display-5 fw-bold mb-3">${product.name}</h1>
                    
                    <!-- Summary -->
                    <p class="lead text-warning mb-3">${product.summary}</p>
                    
                    <!-- Price -->
                    <div class="price-section mb-4">
                        <h2 class="text-warning fw-bold">${product.displayPrice || `$${product.price}`}</h2>
                    </div>
                    
                    <!-- Product Details -->
                    <div class="details-section mb-4">
                        <h4 class="mb-3">Product Details</h4>
                        <p class="text-light">${product.details}</p>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="action-buttons d-flex gap-3">
                        <button class="btn btn-warning btn-lg flex-grow-1" 
                                id="addCartBTN"
                                onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                            <i class="fas fa-cart-plus me-2"></i> Add to Cart
                        </button>
                        
                        <button class="btn btn-outline-warning btn-lg" 
                                onclick="window.location.href='index.html'">
                            <i class="fas fa-arrow-left me-2"></i> Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ==================== CART FUNCTION ====================
function addToCart(product) {
    try {
        // Get current cart
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Check if product already in cart
        const existingIndex = cart.findIndex(item => item.id === product.id);
        
        if (existingIndex !== -1) {
            showSimpleNotification(`${product.name} is already in your cart!`, 'warning');
            return;
        }
        
        // Prepare product data for cart
        const cartProduct = {
            id: product.id,
            name: product.name,
            brand: product.brand,
            summary: product.summary,
            price: product.price,
            displayPrice: product.displayPrice || `$${product.price}`,
            images: product.images,
            category: product.category
        };
        
        // Add to cart
        cart.push(cartProduct);
        
        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart count
        updateCartCount();
        
        // Show success notification
        showSimpleNotification(`${product.name} added to cart!`, 'success');
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        showSimpleNotification('Failed to add product to cart', 'error');
    }
}

// ==================== UTILITY FUNCTIONS ====================
function showSimpleNotification(message, type = 'success') {
    const notification = document.createElement('div');
    
    const colors = {
        success: 'alert-success',
        error: 'alert-danger',
        warning: 'alert-warning',
        info: 'alert-info'
    };
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    notification.className = `alert ${colors[type]} position-fixed top-0 end-0 m-3`;
    notification.style.zIndex = '9999';
    notification.style.maxWidth = '350px';
    notification.style.borderLeft = '4px solid';
    notification.style.borderLeftColor = type === 'success' ? '#28a745' : 
                                         type === 'error' ? '#dc3545' : 
                                         type === 'warning' ? '#ffc107' : '#17a2b8';
    
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas ${icons[type]} me-2 fa-lg"></i>
            <div class="flex-grow-1">${message}</div>
            <button type="button" class="btn-close" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

function showProductNotFound() {
    document.getElementById('loadingState').classList.add('d-none');
    document.getElementById('productDetail').classList.add('d-none');
    document.getElementById('errorState').classList.remove('d-none');
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
window.updateCartCount = function() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const badges = document.querySelectorAll('#cartCount');
        badges.forEach(badge => {
            badge.textContent = cart.length;
        });
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
};

// Make functions available globally
window.addToCart = addToCart;
window.showSimpleNotification = showSimpleNotification;