// Database Module
class Database {
    constructor() {
        this.db = null;
    }
    
    async init() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                reject(new Error("Browser tidak mendukung IndexedDB"));
                return;
            }
            
            const request = indexedDB.open(AppConfig.DB_NAME, AppConfig.DB_VERSION);
            
            request.onerror = (event) => reject(event.target.error);
            request.onblocked = () => reject(new Error('Database blocked'));
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                appState.db = this.db;
                
                this.db.onerror = (event) => {
                    console.error('Database error:', event.target.error);
                    Notifications.show('Error database: ' + event.target.error, 'error');
                };
                
                console.log('Database initialized successfully');
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create all object stores
                Object.values(AppConfig.STORES).forEach(storeName => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        const options = storeName === 'settings' || storeName === 'appState' 
                            ? { keyPath: 'key' }
                            : { keyPath: 'id', autoIncrement: true };
                        
                        const store = db.createObjectStore(storeName, options);
                        
                        // Create indexes
                        switch(storeName) {
                            case AppConfig.STORES.PRODUCTS:
                                store.createIndex('category', 'category', { unique: false });
                                store.createIndex('code', 'code', { unique: true });
                                break;
                            case AppConfig.STORES.CATEGORIES:
                                store.createIndex('name', 'name', { unique: true });
                                break;
                            case AppConfig.STORES.HISTORY:
                                store.createIndex('timestamp', 'timestamp', { unique: false });
                                break;
                        }
                    }
                });
            };
        });
    }
    
    // CRUD operations
    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = (e) => reject(e.target.error);
        });
    }
    
    async get(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e.target.error);
        });
    }
    
    async add(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e.target.error);
        });
    }
    
    async put(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e.target.error);
        });
    }
    
    async delete(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e.target.error);
        });
    }
    
    async clear(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e.target.error);
        });
    }
    
    // Product-specific methods
    async loadProducts() {
        try {
            const products = await this.getAll(AppConfig.STORES.PRODUCTS);
            appState.products = products.filter(p => p && p.name && p.code);
            appState.products.sort((a, b) => a.name.localeCompare(b.name));
            return appState.products;
        } catch (error) {
            console.error('Error loading products:', error);
            appState.products = [];
            throw error;
        }
    }
    
    async loadCategories() {
        try {
            const categories = await this.getAll(AppConfig.STORES.CATEGORIES);
            const categoryNames = categories.map(c => c.name).filter(Boolean);
            appState.categories = ['all', ...categoryNames];
            return appState.categories;
        } catch (error) {
            console.error('Error loading categories:', error);
            appState.categories = ['all'];
            throw error;
        }
    }
    
    async loadSettings() {
        try {
            const settings = await this.getAll(AppConfig.STORES.SETTINGS);
            
            settings.forEach(setting => {
                switch(setting.key) {
                    case 'barcodeConfig':
                        appState.digitConfig = setting.value;
                        break;
                    case 'printDesign':
                        appState.printDesign = setting.value;
                        break;
                    case 'weightPresets':
                        appState.weightPresets = setting.value;
                        break;
                }
            });
            
            return true;
        } catch (error) {
            console.error('Error loading settings:', error);
            return false;
        }
    }
}

// Create and export instance
window.database = new Database();
