// Main Application
class App {
    constructor() {
        this.initialized = false;
    }
    
    async init() {
        try {
            console.log('Starting application initialization...');
            
            this.showLoading();
            
            // Initialize database
            await database.init();
            
            // Load settings
            await settingsManager.load();
            
            // Initialize managers
            await productsManager.init();
            await categoriesManager.init();
            
            // Initialize printer
            printerManager.init();
            
            // Render UI
            uiManager.renderApp();
            
            // Update preset buttons
            barcodeManager.updatePresetButtons();
            
            this.initialized = true;
            
            console.log('Application initialized successfully');
            Notifications.show('Aplikasi siap digunakan', 'success');
            
        } catch (error) {
            console.error('Application initialization failed:', error);
            
            let errorMessage = 'Gagal memuat aplikasi: ';
            if (error.name === 'VersionError') {
                errorMessage += 'Database versi tidak kompatibel. Coba reset aplikasi.';
            } else if (error.name === 'InvalidStateError') {
                errorMessage += 'Database dalam state tidak valid. Refresh halaman.';
            } else if (error.message.includes('IndexedDB')) {
                errorMessage += 'Browser tidak mendukung IndexedDB. Gunakan Chrome/Edge/Firefox.';
            } else {
                errorMessage += error.message;
            }
            
            this.showError(errorMessage);
            
        } finally {
            this.hideLoading();
        }
    }
    
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
    
    showError(message) {
        // Create error state
        const errorHTML = `
            <div class="error-state">
                <svg class="icon" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <h3>Gagal memuat aplikasi</h3>
                <p>${message}</p>
                <button class="retry-button" onclick="app.retry()">
                    <svg class="icon icon-sm" viewBox="0 0 24 24">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                        <path d="M3 3v5h5"/>
                    </svg>
                    Coba Lagi
                </button>
            </div>
        `;
        
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = errorHTML;
        }
    }
    
    async retry() {
        await this.init();
    }
    
    async refresh() {
        try {
            this.showLoading();
            await productsManager.init();
            await categoriesManager.init();
            uiManager.renderProducts();
            categoriesManager.renderTabs();
            Notifications.show('Data diperbarui', 'success');
        } catch (error) {
            console.error('Failed to refresh:', error);
            Notifications.show('Gagal memperbarui data', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    getState() {
        return appState;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    app.init();
});

// Global event handlers
window.addEventListener('beforeunload', (e) => {
    // Save any pending data
    if (printerManager.getStatus()) {
        printerManager.saveConnection();
    }
});

// Make core functions globally available
window.showWeightInput = (productId) => uiManager.showWeightInputModal(productId);
window.showSettings = () => settingsManager.showSettingsModal();
window.addProduct = () => uiManager.showAddProductForm();
window.editProduct = (id) => uiManager.showEditProductForm(id);
window.deleteProduct = (id) => uiManager.deleteProduct(id);
window.closeModal = () => uiManager.closeModal();
window.refreshApp = () => app.refresh();
