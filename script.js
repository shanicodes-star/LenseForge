/**
 * LensForge - Main Application Script
 * Optimized for Performance
 */

// Global Variables
let allProducts = [];
let currentProducts = [];
let searchTimeout = null;
const DEBOUNCE_DELAY = 300; // ms

// Cache DOM Elements
const domCache = {
    productsContainer: null,
    searchInput: null,
    mobileSearchInput: null,
    cartCount: null
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', initializeApp);

async function initializeApp() {
    try {
        console.log('🚀 Initializing LensForge...');
        
        // Load navbar first
        await loadNavbar();
        
        // Load hero section
        await loadHero();
        
        // Load products data
        await loadProducts();
        
        // Setup categories functionality
        setupCategories();
        
        // Initialize cart count
        updateCartCount();
        
        console.log('✅ App initialized successfully');
    } catch (error) {
        console.error('❌ Initialization error:', error);
        showError('Failed to load application. Please refresh.');
    }
}

// ==================== LOAD FUNCTIONS ====================
async function loadNavbar() {
    try {
        console.log('📱 Loading navbar...');
        const response = await fetch('navbar.html');
        if (!response.ok) throw new Error('Navbar not found');
        
        const html = await response.text();
        document.getElementById('navbar').innerHTML = html;
        
        // Cache DOM elements after navbar loads
        cacheDOMElements();
        
        // Setup event listeners
        setupEventListeners();
        
        console.log('✅ Navbar loaded');
    } catch (error) {
        console.error('❌ Error loading navbar:', error);
    }
}

async function loadHero() {
    try {
        console.log('🎨 Loading hero section...');
        const response = await fetch('hero.html');
        if (!response.ok) throw new Error('Hero not found');
        
        const html = await response.text();
        document.getElementById('hero').innerHTML = html;
        console.log('✅ Hero section loaded');
    } catch (error) {
        console.error('❌ Error loading hero:', error);
    }
}

async function loadProducts() {
    try {
        console.log('📦 Loading products...');
        
        // Check if products container exists
        const productsContainer = document.getElementById('products');
        if (!productsContainer) {
            console.error('❌ Products container not found!');
            return;
        }
        
        // Show loading state
        productsContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-warning" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3 text-muted">Loading products...</p>
            </div>
        `;
        
        // Fetch products data
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Products data not found');
        
        const products = await response.json();
        console.log(`✅ Products loaded: ${products.length} products found`);
        
        // Store products globally
        allProducts = products;
        currentProducts = [...products];
        
        // Display products
        showProducts(products);
        
    } catch (error) {
        console.error('❌ Error loading products:', error);
        showProductsError();
    }
}

// ==================== DOM CACHING ====================
function cacheDOMElements() {
    domCache.productsContainer = document.getElementById('products');
    domCache.searchInput = document.getElementById('searchInput');
    domCache.mobileSearchInput = document.getElementById('mobileSearchInput');
    domCache.cartCount = document.getElementById('cartCount');
    
    console.log('🔍 DOM Elements cached:', {
        productsContainer: !!domCache.productsContainer,
        searchInput: !!domCache.searchInput,
        mobileSearchInput: !!domCache.mobileSearchInput,
        cartCount: !!domCache.cartCount
    });
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    console.log('🎯 Setting up event listeners...');
    
    // Desktop search with debouncing
    if (domCache.searchInput) {
        domCache.searchInput.addEventListener('input', handleSearch);
        console.log('✅ Desktop search listener added');
    }
    
    // Mobile search with debouncing
    if (domCache.mobileSearchInput) {
        domCache.mobileSearchInput.addEventListener('input', handleSearch);
        console.log('✅ Mobile search listener added');
    }
    
    // Category filters
    const categoryLinks = document.querySelectorAll('.nav-link[data-category]');
    if (categoryLinks.length > 0) {
        categoryLinks.forEach(link => {
            link.addEventListener('click', handleCategoryFilter);
        });
        console.log(`✅ ${categoryLinks.length} category listeners added`);
    }
}

// ==================== EVENT HANDLERS ====================
function handleSearch(e) {
    clearTimeout(searchTimeout);
    
    searchTimeout = setTimeout(() => {
        const query = e.target.value.toLowerCase().trim();
        console.log(`🔍 Searching for: "${query}"`);
        filterProducts(query);
    }, DEBOUNCE_DELAY);
}

function handleCategoryFilter(e) {
    e.preventDefault();
    
    const category = this.getAttribute('data-category');
    const isHomeLink = this.getAttribute('href') === 'index.html';
    
    if (!isHomeLink) return;
    
    console.log(`🏷️ Filtering by category: ${category}`);
    
    // Update active state
    document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active'));
    this.classList.add('active');
    
    // Filter products
    const filtered = category === 'All' 
        ? allProducts 
        : allProducts.filter(p => p.category === category);
    
    currentProducts = filtered;
    showProducts(filtered);
}

// ==================== PRODUCT FUNCTIONS ====================
function filterProducts(query) {
    console.log(`🔍 Filtering products with query: "${query}"`);
    
    if (!query) {
        currentProducts = [...allProducts];
        showProducts(allProducts);
        return;
    }
    
    const filtered = allProducts.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        (product.summary && product.summary.toLowerCase().includes(query))
    );
    
    console.log(`🔍 Found ${filtered.length} products matching "${query}"`);
    currentProducts = filtered;
    showProducts(filtered);
}

function showProducts(products) {
    if (!domCache.productsContainer) {
        console.error('❌ Products container not found in showProducts!');
        return;
    }
    
    console.log(`🖼️ Displaying ${products.length} products`);
    
    if (products.length === 0) {
        domCache.productsContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h4 class="text-muted">No products found</h4>
                <p class="text-muted">Try adjusting your search or filter</p>
                <button onclick="showProducts(allProducts)" class="btn btn-warning mt-3">
                    Show All Products
                </button>
            </div>
        `;
        return;
    }
    
    // Clear container
    domCache.productsContainer.innerHTML = '';
    
    // Create row container
    const row = document.createElement('div');
    row.className = 'row';
    
    // Add product cards
    products.forEach((product, index) => {
        const productHTML = createProductCard(product);
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 col-xl-3 mb-4';
        col.innerHTML = productHTML;
        row.appendChild(col);
    });
    
    // Append to container
    domCache.productsContainer.appendChild(row);
    
    console.log(`✅ ${products.length} products displayed successfully`);
}

function createProductCard(product) {
    return `
        <div class="card product-card h-100 shadow-sm border-0">
            <div class="position-relative">
                <img src="${product.images[0]}" 
                     class="card-img-top" 
                     alt="${product.name}"
                     loading="lazy"
                     height="240">
                <span class="badge bg-dark position-absolute top-0 start-0 m-2">
                    ${product.brand}
                </span>
            </div>
            
            <div class="card-body d-flex flex-column">
                <h5 class="card-title">${product.name}</h5>
                <p class="card-text text-muted flex-grow-1">${product.summary}</p>
                
                <div class="mt-auto">
                    <div class="d-flex justify-content-between align-items-center">
                        <strong class="price fs-5">${product.displayPrice || `$${product.price}`}</strong>
                        <a href="detail.html?id=${product.id}" 
                           class="btn btn-outline-warning btn-sm">
                            <i class="fas fa-eye me-1"></i> View
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showProductsError() {
    if (!domCache.productsContainer) return;
    
    domCache.productsContainer.innerHTML = `
        <div class="col-12 text-center py-5">
            <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
            <h4 class="text-danger">Failed to load products</h4>
            <p class="text-muted mb-4">Please check your data.json file</p>
            <button onclick="location.reload()" class="btn btn-warning mt-2">
                <i class="fas fa-redo me-1"></i> Try Again
            </button>
        </div>
    `;
}

// ==================== CATEGORIES FUNCTIONALITY ====================
function setupCategories() {
    console.log('🏷️ Setting up categories...');
    
    // Category filter event for dropdown items
    const categoryFilters = document.querySelectorAll('.category-filter');
    if (categoryFilters.length > 0) {
        categoryFilters.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const category = this.getAttribute('data-category');
                
                console.log(`🏷️ Category selected: ${category}`);
                
                // Filter products
                const filtered = category === 'All' 
                    ? allProducts 
                    : allProducts.filter(p => p.category === category);
                
                // Show filtered products
                showProducts(filtered);
                
                // Update active state in navbar
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                
                // Make Home active
                const homeLink = document.querySelector('.nav-link[data-category="All"]');
                if (homeLink) homeLink.classList.add('active');
                
                // Scroll to products if on index page
                if (window.location.pathname.includes('index.html')) {
                    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
        console.log(`✅ ${categoryFilters.length} category filters setup`);
    }
    
    // Update category counts when products load
    if (allProducts.length > 0) {
        updateCategoryCounts();
    }
}

function updateCategoryCounts() {
    const counts = {
        'All': allProducts.length,
        'Cameras': allProducts.filter(p => p.category === 'Cameras').length,
        'Camera Lenses': allProducts.filter(p => p.category === 'Camera Lenses').length,
        'Lighting & Studio': allProducts.filter(p => p.category === 'Lighting & Studio').length,
        'Tripods & Supports': allProducts.filter(p => p.category === 'Tripods & Supports').length,
        'Accessories': allProducts.filter(p => p.category === 'Accessories').length
    };
    
    console.log('📊 Category counts:', counts);
    
    // Update counts in UI if elements exist
    Object.keys(counts).forEach(category => {
        const elementId = category.toLowerCase().replace(/ & /g, '').replace(/ /g, '') + 'Count';
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = counts[category];
        }
    });
}

// ==================== CART FUNCTIONS ====================
function updateCartCount() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const count = cart.length;
        
        console.log(`🛒 Cart count: ${count} items`);
        
        // Update all cart count elements
        const cartBadges = document.querySelectorAll('#cartCount, .cart-count');
        cartBadges.forEach(badge => {
            badge.textContent = count;
            badge.classList.toggle('d-none', count === 0);
        });
        
        return count;
    } catch (error) {
        console.error('❌ Error updating cart count:', error);
        return 0;
    }
}

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, type = 'success', duration = 3000) {
    // Toast container
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }
    
    // Icons for different toast types
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    // Colors for different toast types
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    
    // Create unique ID for toast
    const toastId = 'toast-' + Date.now();
    
    // Create toast HTML
    const toastHTML = `
        <div id="${toastId}" 
             class="toast custom-toast toast-${type}" 
             role="alert" 
             aria-live="assertive" 
             aria-atomic="true"
             data-bs-delay="${duration}">
            <div class="toast-body">
                <i class="fas ${icons[type] || icons.success}" 
                   style="color: ${colors[type] || colors.success}"></i>
                <div class="toast-content">
                    ${message}
                </div>
                <button type="button" 
                        class="btn-close" 
                        data-bs-dismiss="toast" 
                        aria-label="Close"></button>
            </div>
        </div>
    `;
    
    // Add toast to container
    container.insertAdjacentHTML('beforeend', toastHTML);
    
    // Get the toast element
    const toastElement = document.getElementById(toastId);
    
    // Initialize Bootstrap Toast
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: duration
    });
    
    // Show the toast
    toast.show();
    
    // Remove toast from DOM after it's hidden
    toastElement.addEventListener('hidden.bs.toast', function () {
        this.remove();
    });
    
    return toast;
}

// ==================== ERROR HANDLING ====================
function showError(message) {
    // Create error toast
    const toast = document.createElement('div');
    toast.className = 'position-fixed bottom-0 end-0 m-3 alert alert-danger';
    toast.innerHTML = `
        <i class="fas fa-exclamation-circle me-2"></i>
        ${message}
        <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    `;
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => toast.remove(), 5000);
}

// ==================== GLOBAL FUNCTIONS ====================
// Make functions available globally
window.updateCartCount = updateCartCount;
window.showToast = showToast;
window.showProducts = showProducts;
window.getCart = function() {
    return JSON.parse(localStorage.getItem('cart')) || [];
};
window.clearCart = function() {
    localStorage.removeItem('cart');
    updateCartCount();
};

console.log('✅ script.js loaded successfully');