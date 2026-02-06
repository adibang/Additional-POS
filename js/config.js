// App Configuration
const AppConfig = {
    DB_NAME: 'POSBarcodeDB',
    DB_VERSION: 5,
    STORES: {
        PRODUCTS: 'products',
        CATEGORIES: 'categories',
        SETTINGS: 'settings',
        HISTORY: 'printHistory',
        APP_STATE: 'appState'
    },
    DEFAULT_SETTINGS: {
        digitConfig: { flex: 2, category: 2, product: 4, weight: 5 },
        printDesign: 1,
        weightPresets: { preset1: 100, preset2: 200, preset3: 500, preset4: 1000 }
    },
    MAX_RECONNECT_ATTEMPTS: 3
};

// Global Application State
class AppState {
    constructor() {
        this.db = null;
        this.products = [];
        this.categories = [];
        this.currentProduct = null;
        this.weightValue = '';
        this.digitConfig = { ...AppConfig.DEFAULT_SETTINGS.digitConfig };
        this.printDesign = AppConfig.DEFAULT_SETTINGS.printDesign;
        this.selectedCategory = 'all';
        this.editingProductId = null;
        this.port = null;
        this.writer = null;
        this.isPrinterConnected = false;
        this.currentBarcodeData = '';
        this.reconnectAttempts = 0;
        this.searchQuery = '';
        this.isFirstLoad = true;
        this.categoryViewMode = 'tabs';
        this.weightPresets = { ...AppConfig.DEFAULT_SETTINGS.weightPresets };
    }
}

// Export for use in modules
window.AppConfig = AppConfig;
window.appState = new AppState();
