// Products Module
class ProductsManager {
    constructor() {
        this.products = [];
    }
    
    async init() {
        this.products = await database.loadProducts();
        return this.products;
    }
    
    async save(productData) {
        try {
            // Validation
            if (!productData.name || !productData.code) {
                throw new Error('Nama dan kode produk harus diisi');
            }
            
            // Format code
            productData.code = Helpers.padNumber(productData.code, appState.digitConfig.product);
            productData.flex = Helpers.padNumber(productData.flex || '01', appState.digitConfig.flex);
            productData.catcode = Helpers.padNumber(productData.catcode || '01', appState.digitConfig.category);
            
            // Check for duplicate code
            const duplicate = this.products.find(p => 
                p.code === productData.code && 
                (!productData.id || p.id !== productData.id)
            );
            
            if (duplicate) {
                throw new Error(`Kode ${productData.code} sudah digunakan oleh produk "${duplicate.name}"`);
            }
            
            // Save to database
            const now = new Date().toISOString();
            if (productData.id) {
                // Update
                productData.updatedAt = now;
                await database.put(AppConfig.STORES.PRODUCTS, productData);
                
                // Update local state
                const index = this.products.findIndex(p => p.id === productData.id);
                if (index !== -1) this.products[index] = productData;
            } else {
                // Create new
                productData.createdAt = now;
                productData.updatedAt = now;
                const id = await database.add(AppConfig.STORES.PRODUCTS, productData);
                productData.id = id;
                this.products.push(productData);
            }
            
            // Sort products
            this.products.sort((a, b) => a.name.localeCompare(b.name));
            
            Notifications.show(`Produk ${productData.name} berhasil disimpan`, 'success');
            return productData;
            
        } catch (error) {
            console.error('Error saving product:', error);
            Notifications.show(`Gagal menyimpan produk: ${error.message}`, 'error');
            throw error;
        }
    }
    
    async delete(productId) {
        try {
            await database.delete(AppConfig.STORES.PRODUCTS, productId);
            this.products = this.products.filter(p => p.id !== productId);
            
            if (appState.currentProduct?.id === productId) {
                appState.currentProduct = null;
            }
            
            Notifications.show('Produk berhasil dihapus', 'success');
            return true;
        } catch (error) {
            console.error('Error deleting product:', error);
            Notifications.show('Gagal menghapus produk', 'error');
            throw error;
        }
    }
    
    getFiltered(searchQuery = '', category = 'all') {
        let filtered = [...this.products];
        
        // Filter by category
        if (category !== 'all') {
            filtered = filtered.filter(p => p.category === category);
        }
        
        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(query) || 
                p.code.toLowerCase().includes(query)
            );
        }
        
        return filtered;
    }
    
    findById(id) {
        return this.products.find(p => p.id === id);
    }
    
    findByCode(code) {
        return this.products.find(p => p.code === code);
    }
}

window.productsManager = new ProductsManager();
