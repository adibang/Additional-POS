// Main Application Entry Point
class App {
    constructor() {
        this.isInitialized = false;
    }
    
    async init() {
        try {
            console.log('Initializing application...');
            
            // Show loading state
            this.showLoading();
            
            // Initialize database
            await database.init();
            
            // Load data
            await database.loadSettings();
            await productsManager.init();
            await database.loadCategories();
            
            // Initialize UI
            uiManager.renderApp();
            
            // Initialize printer
            printerManager.init();
            
            // Render products
            uiManager.renderProducts();
            
            // Set initialized flag
            this.isInitialized = true;
            
            console.log('Application initialized successfully');
            Notifications.show('Aplikasi siap digunakan', 'success');
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showError(error.message);
        } finally {
            this.hideLoading();
        }
    }
    
    showLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.style.display = 'flex';
    }
    
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.style.display = 'none';
    }
    
    showError(message) {
        // Create error state if not exists
        let errorState = document.getElementById('error-state');
        if (!errorState) {
            errorState = document.createElement('div');
            errorState.id = 'error-state';
            errorState.className = 'error-state';
            errorState.innerHTML = `
                <svg class="icon" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <h3>Gagal memuat aplikasi</h3>
                <p id="error-message"></p>
                <button class="retry-button" onclick="app.init()">
                    <svg class="icon icon-sm" viewBox="0 0 24 24">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                        <path d="M3 3v5h5"/>
                    </svg>
                    Coba Lagi
                </button>
            `;
            document.getElementById('app').appendChild(errorState);
        }
        
        document.getElementById('error-message').textContent = message;
        errorState.style.display = 'block';
    }
    
    // Refresh data
    async refreshData() {
        try {
            this.showLoading();
            await productsManager.init();
            await database.loadCategories();
            uiManager.renderProducts();
            Notifications.show('Data diperbarui', 'success');
        } catch (error) {
            console.error('Failed to refresh data:', error);
            Notifications.show('Gagal memperbarui data', 'error');
        } finally {
            this.hideLoading();
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    app.init();
});
