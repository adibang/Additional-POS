// UI Module - Complete
class UIManager {
    constructor() {
        this.modals = {};
    }
    
    // Loading state
    showLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }
    
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
    
    // Render main app
    renderApp() {
        const app = document.getElementById('app');
        if (!app) return;
        
        app.innerHTML = `
            <!-- Header -->
            <header class="app-header">
                <div class="header-content">
                    <div class="app-title">
                        <div class="icon-container">
                            <svg class="icon box-icon icon-primary" viewBox="0 0 24 24">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                                <line x1="12" y1="22.08" x2="12" y2="12"/>
                            </svg>
                        </div>
                        <span>POS Barcode Generator</span>
                    </div>
                    
                    <!-- Search Input -->
                    <div class="search-container">
                        <input type="text" id="search-input" class="search-input" 
                               placeholder="Cari produk berdasarkan nama atau kode...">
                    </div>
                    
                    <div class="header-actions">
                        <div class="printer-led-container">
                            <div class="printer-led ${appState.isPrinterConnected ? 'connected' : 'disconnected'}" 
                                 id="printer-led"></div>
                            <div class="printer-status-text" id="printer-status-text">
                                ${appState.isPrinterConnected ? 'Printer Online' : 'Printer Offline'}
                            </div>
                        </div>
                        <button onclick="settingsManager.showSettingsModal()" class="btn btn-secondary">
                            <svg class="icon settings-icon icon-primary" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                            </svg>
                            Settings
                        </button>
                    </div>
                </div>
            </header>
            
            <!-- Category Navigation -->
            <div class="category-navigation">
                <div class="category-tabs" id="category-tabs"></div>
            </div>
            
            <!-- Main Content -->
            <main class="main-content">
                <div class="products-grid" id="products-grid"></div>
            </main>
            
            <!-- Loading Overlay -->
            <div id="loading-overlay" class="loading-overlay">
                <div class="loading-spinner"></div>
                <div style="margin-top: 20px; color: #006B54; font-weight: 600;">Memuat aplikasi...</div>
            </div>
            
            <!-- Modals Container -->
            <div id="modals-container"></div>
            
            <!-- Notification Container -->
            <div id="notification-container"></div>
        `;
        
        this.setupEventListeners();
        categoriesManager.renderTabs();
        this.renderProducts();
    }
    
    // Render products grid
    renderProducts() {
        const productsGrid = document.getElementById('products-grid');
        if (!productsGrid) return;
        
        const filteredProducts = productsManager.getFiltered(appState.searchQuery, appState.selectedCategory);
        
        let productsHTML = '';
        
        if (filteredProducts.length === 0) {
            productsHTML = `
                <div class="empty-state">
                    <svg class="icon" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <h3>Tidak ada produk</h3>
                    <p>${appState.searchQuery ? 'Produk tidak ditemukan' : 'Tambahkan produk baru'}</p>
                </div>
            `;
        } else {
            productsHTML = filteredProducts.map(product => `
                <div class="product-card" data-id="${product.id}">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                    <div class="product-info">
                        <div class="product-name">${product.name}</div>
                        <div class="product-code">${product.code}</div>
                        <div class="product-category">${product.category}</div>
                    </div>
                    <div class="product-actions">
                        <button class="action-btn edit-btn" onclick="uiManager.showEditProductForm(${product.id})">
                            <svg class="icon icon-sm" viewBox="0 0 24 24">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="action-btn delete-btn" onclick="uiManager.deleteProduct(${product.id})">
                            <svg class="icon icon-sm" viewBox="0 0 24 24">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                <line x1="10" y1="11" x2="10" y2="17"/>
                                <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `).join('');
        }
        
        // Add product button
        productsHTML += `
            <div class="add-product-card" onclick="uiManager.showAddProductForm()">
                <div class="add-product-content">
                    <div class="add-icon">
                        <svg class="icon" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="16"/>
                            <line x1="8" y1="12" x2="16" y2="12"/>
                        </svg>
                    </div>
                    <div class="add-text">Tambah Produk</div>
                </div>
            </div>
        `;
        
        productsGrid.innerHTML = productsHTML;
        
        // Add click event to product cards
        document.querySelectorAll('.product-card[data-id]').forEach(card => {
            const productId = parseInt(card.dataset.id);
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking on action buttons
                if (!e.target.closest('.product-actions')) {
                    this.showWeightInputModal(productId);
                }
            });
        });
    }
    
    // Show weight input modal
    async showWeightInputModal(productId) {
        const product = productsManager.findById(productId);
        if (!product) return;
        
        appState.currentProduct = product;
        appState.weightValue = '';
        
        const modalHTML = `
            <div class="modal-overlay active" id="weight-input-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title">
                            <svg class="icon weight-icon icon-primary" viewBox="0 0 24 24">
                                <path d="M3 6h18"/>
                                <path d="M3 10h18"/>
                                <path d="M12 6v8"/>
                                <path d="M12 14v4"/>
                                <path d="M7 18h10"/>
                            </svg>
                            Input Berat - ${product.name}
                        </h2>
                        <button class="close-modal" onclick="uiManager.closeModal()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="product-info-section">
                            <img src="${product.image}" alt="${product.name}" class="product-thumbnail">
                            <div class="product-details">
                                <h4>${product.name}</h4>
                                <div class="code">${product.code} | ${product.category}</div>
                            </div>
                        </div>
                        
                        <div class="display-section">
                            <div class="display-row">
                                <span>PRODUK:</span>
                                <span>${product.code}</span>
                            </div>
                            <div class="display-row">
                                <span>BERAT:</span>
                                <span id="display-weight">0</span> <span>gram</span>
                            </div>
                            <div class="display-row">
                                <span>BARCODE:</span>
                                <span id="display-barcode">-</span>
                            </div>
                        </div>
                        
                        <div class="weight-preset-buttons" id="weight-preset-buttons"></div>
                        
                        <div class="function-row">
                            <button class="function-btn" onclick="barcodeManager.clear()">
                                <svg class="icon icon-sm" viewBox="0 0 24 24">
                                    <path d="M3 6h18"/>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                                CLEAR
                            </button>
                            <button class="function-btn" onclick="barcodeManager.generateDisplay()">
                                <svg class="icon icon-sm" viewBox="0 0 24 24">
                                    <path d="M12 2v4"/>
                                    <path d="m5 5 2 2"/>
                                    <path d="M19 5l-2 2"/>
                                    <path d="M2 12h4"/>
                                    <path d="m5 19 2-2"/>
                                    <path d="M22 12h-4"/>
                                    <path d="m12 22-2-4h4l-2 4z"/>
                                    <circle cx="12" cy="12" r="4"/>
                                </svg>
                                GENERATE
                            </button>
                            <button class="function-btn" onclick="printerManager.toggleConnection()">
                                <svg class="icon icon-sm" viewBox="0 0 24 24">
                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                                </svg>
                                ${appState.isPrinterConnected ? 'DISCONNECT' : 'CONNECT'}
                            </button>
                        </div>
                        
                        <div class="number-pad">
                            ${[7,8,9,4,5,6,1,2,3,0,'00','⌫'].map(num => `
                                <button class="number-btn" onclick="uiManager.handleNumberInput('${num}')">
                                    ${num}
                                </button>
                            `).join('')}
                            <button class="print-btn" onclick="barcodeManager.print()">
                                <svg class="icon icon-sm" viewBox="0 0 24 24">
                                    <polyline points="6 9 6 2 18 2 18 9"/>
                                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1-2 2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                                    <rect x="6" y="14" width="12" height="8"/>
                                </svg>
                                PRINT
                            </button>
                        </div>
                        
                        <div class="barcode-preview">
                            <div class="barcode-title">
                                <svg class="icon" viewBox="0 0 24 24">
                                    <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/>
                                    <path d="M8 7V5"/>
                                    <path d="M16 7V5"/>
                                    <path d="M8 12h8"/>
                                    <path d="M8 17h5"/>
                                </svg>
                                PREVIEW BARCODE
                            </div>
                            <div class="barcode-container">
                                <svg id="barcode-svg"></svg>
                            </div>
                            <div class="barcode-info" id="current-barcode">
                                Klik GENERATE untuk membuat barcode
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const modalsContainer = document.getElementById('modals-container');
        modalsContainer.innerHTML = modalHTML;
        
        // Update preset buttons
        barcodeManager.updatePresetButtons();
    }
    
    // Show add product form
    showAddProductForm() {
        this.showProductForm();
    }
    
    // Show edit product form
    showEditProductForm(productId) {
        const product = productsManager.findById(productId);
        if (!product) return;
        
        this.showProductForm(product);
    }
    
    // Show product form (add/edit)
    showProductForm(product = null) {
        const isEdit = !!product;
        const categories = categoriesManager.getAll().filter(c => c !== 'all');
        
        const modalHTML = `
            <div class="modal-overlay active" id="product-form-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title">
                            <svg class="icon icon-primary" viewBox="0 0 24 24">
                                ${isEdit ? 
                                    '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>' :
                                    '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>'
                                }
                            </svg>
                            ${isEdit ? 'Edit Produk' : 'Tambah Produk'}
                        </h2>
                        <button class="close-modal" onclick="uiManager.closeModal()">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="product-form">
                            <div class="form-group">
                                <label for="product-name">Nama Produk *</label>
                                <input type="text" id="product-name" class="form-input" 
                                       value="${product?.name || ''}" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="product-code">Kode Produk (${appState.digitConfig.product} digit) *</label>
                                <input type="text" id="product-code" class="form-input" 
                                       value="${product?.code || ''}" 
                                       maxlength="${appState.digitConfig.product}" 
                                       pattern="\\d+" required>
                                <small>Hanya angka, contoh: ${Helpers.generateExampleCode(appState.digitConfig.product)}</small>
                            </div>
                            
                            <div class="form-group">
                                <label for="product-category">Kategori *</label>
                                <select id="product-category" class="form-input" required>
                                    <option value="">-- Pilih Kategori --</option>
                                    ${categories.map(cat => `
                                        <option value="${cat}" ${product?.category === cat ? 'selected' : ''}>
                                            ${cat}
                                        </option>
                                    `).join('')}
                                    <option value="_new">+ Tambah Kategori Baru</option>
                                </select>
                                <div id="new-category-field" style="display: none; margin-top: 10px;">
                                    <input type="text" id="new-category-name" class="form-input" 
                                           placeholder="Nama kategori baru">
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="product-flex">Flex Code (${appState.digitConfig.flex} digit)</label>
                                    <input type="text" id="product-flex" class="form-input" 
                                           value="${product?.flex || '01'}" 
                                           maxlength="${appState.digitConfig.flex}" 
                                           pattern="\\d+">
                                    <small>Contoh: ${Helpers.generateExampleCode(appState.digitConfig.flex)}</small>
                                </div>
                                
                                <div class="form-group">
                                    <label for="product-catcode">Kode Kategori (${appState.digitConfig.category} digit)</label>
                                    <input type="text" id="product-catcode" class="form-input" 
                                           value="${product?.catcode || '01'}" 
                                           maxlength="${appState.digitConfig.category}" 
                                           pattern="\\d+">
                                    <small>Contoh: ${Helpers.generateExampleCode(appState.digitConfig.category)}</small>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="product-image">Gambar Produk</label>
                                <div id="image-upload-area" class="image-upload-area">
                                    ${product?.image ? 
                                        `<img src="${product.image}" alt="Preview" class="image-preview">` :
                                        `<div class="upload-placeholder">
                                            <svg class="icon" viewBox="0 0 24 24">
                                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                                                <circle cx="12" cy="13" r="4"/>
                                            </svg>
                                            <span>Klik untuk upload gambar</span>
                                            <small>Rekomendasi: 300x300px</small>
                                        </div>`
                                    }
                                    <input type="file" id="product-image" accept="image/*" style="display: none;">
                                </div>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" onclick="uiManager.closeModal()">
                                    Batal
                                </button>
                                <button type="submit" class="btn btn-primary">
                                    ${isEdit ? 'Update Produk' : 'Simpan Produk'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        const modalsContainer = document.getElementById('modals-container');
        modalsContainer.innerHTML = modalHTML;
        
        // Setup form event listeners
        this.setupProductFormEvents(product);
    }
    
    // Setup product form events
    setupProductFormEvents(product = null) {
        const form = document.getElementById('product-form');
        const categorySelect = document.getElementById('product-category');
        const imageUploadArea = document.getElementById('image-upload-area');
        const imageInput = document.getElementById('product-image');
        
        // Category select change event
        if (categorySelect) {
            categorySelect.addEventListener('change', (e) => {
                const newCategoryField = document.getElementById('new-category-field');
                if (e.target.value === '_new') {
                    newCategoryField.style.display = 'block';
                } else {
                    newCategoryField.style.display = 'none';
                }
            });
        }
        
        // Image upload event
        if (imageUploadArea && imageInput) {
            imageUploadArea.addEventListener('click', () => imageInput.click());
            
            imageInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                const validation = Validations.validateImage(file);
                if (!validation.isValid) {
                    Notifications.show(validation.errors[0], 'error');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (event) => {
                    imageUploadArea.innerHTML = `
                        <img src="${event.target.result}" alt="Preview" class="image-preview">
                    `;
                };
                reader.readAsDataURL(file);
            });
        }
        
        // Form submit event
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const productData = {
                    id: product?.id,
                    name: document.getElementById('product-name').value.trim(),
                    code: document.getElementById('product-code').value.trim(),
                    category: document.getElementById('product-category').value,
                    flex: document.getElementById('product-flex').value.trim(),
                    catcode: document.getElementById('product-catcode').value.trim(),
                    image: product?.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f5f5f5'/%3E%3C/svg%3E"
                };
                
                // Handle new category
                if (productData.category === '_new') {
                    const newCategoryName = document.getElementById('new-category-name').value.trim();
                    if (newCategoryName) {
                        const success = await categoriesManager.add(newCategoryName);
                        if (success) {
                            productData.category = newCategoryName;
                        } else {
                            return;
                        }
                    } else {
                        Notifications.show('Nama kategori baru harus diisi', 'error');
                        return;
                    }
                }
                
                // Handle image upload
                const imagePreview = imageUploadArea.querySelector('.image-preview');
                if (imagePreview && imagePreview.src) {
                    productData.image = imagePreview.src;
                }
                
                // Validate product data
                const validation = Validations.validateProduct(productData, !!product);
                if (!validation.isValid) {
                    Notifications.show(validation.errors[0], 'error');
                    return;
                }
                
                // Save product
                try {
                    await productsManager.save(productData);
                    this.closeModal();
                    this.renderProducts();
                } catch (error) {
                    console.error('Error saving product:', error);
                }
            });
        }
    }
    
    // Delete product
    async deleteProduct(productId) {
        if (!confirm('Hapus produk ini?')) return;
        
        try {
            await productsManager.delete(productId);
            this.renderProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    }
    
    // Handle number input for weight
    handleNumberInput(num) {
        if (num === '⌫') {
            barcodeManager.backspace();
        } else {
            barcodeManager.appendNumber(num);
        }
    }
    
    // Close modal
    closeModal(modalId = null) {
        if (modalId) {
            const modal = document.getElementById(modalId);
            if (modal) modal.remove();
        } else {
            const modalsContainer = document.getElementById('modals-container');
            if (modalsContainer) modalsContainer.innerHTML = '';
        }
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', Helpers.debounce((e) => {
                appState.searchQuery = e.target.value.trim().toLowerCase();
                this.renderProducts();
            }, 300));
        }
        
        // Close modal on overlay click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            // Handle responsive adjustments
            this.handleResponsive();
        });
        
        // Page visibility
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.refreshData();
            }
        });
    }
    
    // Handle responsive adjustments
    handleResponsive() {
        const width = window.innerWidth;
        
        if (width <= 768) {
            // Mobile adjustments
            document.body.classList.add('mobile-view');
        } else {
            document.body.classList.remove('mobile-view');
        }
    }
    
    // Refresh data
    async refreshData() {
        try {
            this.showLoading();
            await productsManager.init();
            await categoriesManager.init();
            this.renderProducts();
            categoriesManager.renderTabs();
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            this.hideLoading();
        }
    }
}

window.uiManager = new UIManager();
