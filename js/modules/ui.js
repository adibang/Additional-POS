// UI Module
class UIManager {
    constructor() {
        this.modals = {};
    }
    
    // Render main app layout
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
                    <div class="header-actions">
                        <div class="printer-led-container">
                            <div class="printer-led ${appState.isPrinterConnected ? 'connected' : 'disconnected'}" 
                                 id="printer-led"></div>
                            <div class="printer-status-text" id="printer-status-text">
                                ${appState.isPrinterConnected ? 'Printer Online' : 'Printer Offline'}
                            </div>
                        </div>
                        <button onclick="uiManager.showSettings()">
                            <svg class="icon settings-icon icon-primary" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                            </svg>
                            Settings
                        </button>
                    </div>
                </div>
            </header>

            <!-- Loading Overlay -->
            <div id="loading-overlay" class="loading-overlay">
                <div class="loading-spinner"></div>
                <div style="margin-top: 20px; color: #006B54; font-weight: 600;">Memuat aplikasi...</div>
            </div>

            <!-- Main Content -->
            <main class="main-content">
                <!-- Products will be rendered here -->
            </main>

            <!-- Modals Container -->
            <div id="modals-container"></div>

            <!-- Notification -->
            <div id="notification"></div>
        `;
        
        this.setupEventListeners();
    }
    
    // Render products grid
    renderProducts() {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;
        
        const filteredProducts = productsManager.getFiltered(
            appState.searchQuery, 
            appState.selectedCategory
        );
        
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
                    <p>${appState.searchQuery ? 'Tidak ditemukan produk' : 'Tambahkan produk baru'}</p>
                </div>
            `;
        } else {
            productsHTML = filteredProducts.map(product => `
                <div class="product-card" data-id="${product.id}">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                    <div class="product-info">
                        <div class="product-name">${product.name}</div>
                        <div class="product-code">${product.code}</div>
                    </div>
                </div>
            `).join('');
        }
        
        // Add product button
        productsHTML += `
            <div class="add-product-card" onclick="uiManager.showProductForm()">
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
        
        mainContent.innerHTML = `
            <div class="products-grid">
                ${productsHTML}
            </div>
        `;
        
        // Add click events to product cards
        document.querySelectorAll('.product-card[data-id]').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.product-actions')) {
                    const productId = parseInt(card.dataset.id);
                    const product = productsManager.findById(productId);
                    if (product) {
                        appState.currentProduct = product;
                        this.showWeightInput();
                    }
                }
            });
        });
    }
    
    // Show weight input modal
    showWeightInput() {
        if (!appState.currentProduct) return;
        
        const modalHTML = `
            <div class="modal-overlay active">
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
                            Input Berat
                        </h2>
                    </div>
                    <div class="modal-body">
                        <!-- Product Info -->
                        <div class="product-info-section">
                            <img src="${appState.currentProduct.image}" alt="${appState.currentProduct.name}" class="product-thumbnail">
                            <div class="product-details">
                                <h4>${appState.currentProduct.name}</h4>
                                <div class="code">${appState.currentProduct.code} | ${appState.currentProduct.category}</div>
                            </div>
                        </div>
                        
                        <!-- Weight Input Form -->
                        <div class="weight-input-container">
                            <div class="display-section">
                                <div class="display-row">
                                    <span>BERAT:</span>
                                    <span id="display-weight">${appState.weightValue || '0'}</span> <span>gram</span>
                                </div>
                            </div>
                            
                            <!-- Weight Presets -->
                            <div class="weight-presets">
                                ${Object.entries(appState.weightPresets).map(([key, value], index) => `
                                    <button class="weight-preset-btn" onclick="uiManager.setWeightPreset('${key}')">
                                        <span class="preset-label">Preset ${index + 1}</span>
                                        <span class="preset-value">${value}g</span>
                                    </button>
                                `).join('')}
                            </div>
                            
                            <!-- Number Pad -->
                            <div class="number-pad">
                                ${[1,2,3,4,5,6,7,8,9,0,'00','⌫'].map(num => `
                                    <button class="number-btn" onclick="uiManager.handleNumberInput('${num}')">
                                        ${num === '⌫' ? '⌫' : num}
                                    </button>
                                `).join('')}
                            </div>
                            
                            <!-- Action Buttons -->
                            <div class="action-buttons">
                                <button class="btn btn-secondary" onclick="uiManager.closeModal()">Batal</button>
                                <button class="btn btn-primary" onclick="barcodeManager.generate()">Generate Barcode</button>
                                <button class="btn btn-success" onclick="barcodeManager.print()" 
                                        ${!appState.isPrinterConnected ? 'disabled' : ''}>
                                    Print
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.showModal('weight-input', modalHTML);
    }
    
    // Show modal
    showModal(id, content) {
        const container = document.getElementById('modals-container');
        if (!container) return;
        
        // Remove existing modal with same id
        const existing = document.getElementById(`modal-${id}`);
        if (existing) existing.remove();
        
        // Create new modal
        const modal = document.createElement('div');
        modal.id = `modal-${id}`;
        modal.innerHTML = content;
        container.appendChild(modal);
        
        // Store reference
        this.modals[id] = modal;
    }
    
    // Close modal
    closeModal(id = null) {
        if (id) {
            const modal = this.modals[id];
            if (modal) modal.remove();
            delete this.modals[id];
        } else {
            // Close all modals
            Object.values(this.modals).forEach(modal => modal.remove());
            this.modals = {};
        }
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Search input
        const searchInput = document.createElement('input');
        searchInput.id = 'search-input';
        searchInput.type = 'text';
        searchInput.placeholder = 'Cari produk...';
        searchInput.className = 'search-input';
        
        searchInput.addEventListener('input', Helpers.debounce((e) => {
            appState.searchQuery = e.target.value;
            this.renderProducts();
        }, 300));
        
        // Add search to header
        const header = document.querySelector('.header-content');
        if (header) {
            header.appendChild(searchInput);
        }
        
        // Close modal on overlay click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });
    }
    
    // Handle number input for weight
    handleNumberInput(num) {
        if (num === '⌫') {
            appState.weightValue = appState.weightValue.slice(0, -1);
        } else if (num === '00') {
            if (appState.weightValue.length + 2 <= appState.digitConfig.weight) {
                appState.weightValue += '00';
            }
        } else {
            if (appState.weightValue.length < appState.digitConfig.weight) {
                appState.weightValue += num;
            }
        }
        
        // Update display
        const display = document.getElementById('display-weight');
        if (display) {
            display.textContent = appState.weightValue || '0';
        }
    }
    
    // Set weight from preset
    setWeightPreset(presetKey) {
        const value = appState.weightPresets[presetKey];
        if (value) {
            appState.weightValue = String(value).slice(0, appState.digitConfig.weight);
            this.handleNumberInput('');
        }
    }
}

// Create and export instance
window.uiManager = new UIManager();
