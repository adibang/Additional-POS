// Categories Module.
class CategoriesManager {
    constructor() {
        this.categories = [];
    }
    
    async init() {
        this.categories = await database.loadCategories();
        return this.categories;
    }
    
    async add(categoryName) {
        try {
            if (!categoryName || categoryName.trim() === '') {
                throw new Error('Nama kategori tidak boleh kosong');
            }
            
            if (categoryName === 'all') {
                throw new Error('Kategori "all" tidak dapat digunakan');
            }
            
            // Check if category already exists
            const categories = await database.getAll(AppConfig.STORES.CATEGORIES);
            const existingCategory = categories.find(c => c.name === categoryName);
            
            if (existingCategory) {
                throw new Error(`Kategori "${categoryName}" sudah ada`);
            }
            
            const newCategory = {
                name: categoryName,
                createdAt: new Date().toISOString()
            };
            
            await database.add(AppConfig.STORES.CATEGORIES, newCategory);
            
            // Update local state
            if (!this.categories.includes(categoryName)) {
                this.categories.push(categoryName);
                this.categories.sort();
            }
            
            Notifications.show(`Kategori "${categoryName}" berhasil ditambahkan`, 'success');
            return true;
            
        } catch (error) {
            console.error('Error adding category:', error);
            Notifications.show(`Gagal menambah kategori: ${error.message}`, 'error');
            return false;
        }
    }
    
    async update(oldName, newName) {
        try {
            if (!oldName || !newName) {
                throw new Error('Nama kategori tidak boleh kosong');
            }
            
            if (oldName === 'all' || newName === 'all') {
                throw new Error('Kategori "all" tidak dapat digunakan');
            }
            
            const categories = await database.getAll(AppConfig.STORES.CATEGORIES);
            const categoryToUpdate = categories.find(c => c.name === oldName);
            
            if (!categoryToUpdate) {
                throw new Error(`Kategori "${oldName}" tidak ditemukan`);
            }
            
            // Check if new name already exists
            const existingCategory = categories.find(c => c.name === newName && c.id !== categoryToUpdate.id);
            if (existingCategory) {
                throw new Error(`Kategori "${newName}" sudah ada`);
            }
            
            // Update category
            categoryToUpdate.name = newName;
            categoryToUpdate.updatedAt = new Date().toISOString();
            await database.put(AppConfig.STORES.CATEGORIES, categoryToUpdate);
            
            // Update products with old category
            const productsToUpdate = appState.products.filter(p => p.category === oldName);
            for (const product of productsToUpdate) {
                product.category = newName;
                product.updatedAt = new Date().toISOString();
                await database.put(AppConfig.STORES.PRODUCTS, product);
            }
            
            // Update local state
            const index = this.categories.indexOf(oldName);
            if (index !== -1) {
                this.categories[index] = newName;
                this.categories.sort();
            }
            
            if (appState.selectedCategory === oldName) {
                appState.selectedCategory = newName;
            }
            
            Notifications.show(`Kategori berhasil diubah dari "${oldName}" ke "${newName}"`, 'success');
            return true;
            
        } catch (error) {
            console.error('Error updating category:', error);
            Notifications.show(`Gagal mengubah kategori: ${error.message}`, 'error');
            return false;
        }
    }
    
    async delete(categoryName) {
        try {
            if (categoryName === 'all') {
                throw new Error('Tidak dapat menghapus kategori "all"');
            }
            
            if (!confirm(`Hapus kategori "${categoryName}"?\nProduk dalam kategori ini akan dipindahkan ke kategori "Lainnya".`)) {
                return false;
            }
            
            const categories = await database.getAll(AppConfig.STORES.CATEGORIES);
            const categoryToDelete = categories.find(c => c.name === categoryName);
            
            if (!categoryToDelete) {
                throw new Error(`Kategori "${categoryName}" tidak ditemukan`);
            }
            
            // Delete category from database
            await database.delete(AppConfig.STORES.CATEGORIES, categoryToDelete.id);
            
            // Update products to use "Lainnya" category
            const productsToUpdate = appState.products.filter(p => p.category === categoryName);
            for (const product of productsToUpdate) {
                product.category = "Lainnya";
                product.updatedAt = new Date().toISOString();
                await database.put(AppConfig.STORES.PRODUCTS, product);
            }
            
            // Ensure "Lainnya" category exists
            const lainnyaExists = categories.some(c => c.name === "Lainnya");
            if (!lainnyaExists) {
                await this.add("Lainnya");
            }
            
            // Update local state
            this.categories = this.categories.filter(c => c !== categoryName);
            
            if (appState.selectedCategory === categoryName) {
                appState.selectedCategory = 'all';
            }
            
            Notifications.show(`Kategori "${categoryName}" berhasil dihapus`, 'success');
            return true;
            
        } catch (error) {
            console.error('Error deleting category:', error);
            Notifications.show(`Gagal menghapus kategori: ${error.message}`, 'error');
            return false;
        }
    }
    
    getAll() {
        return ['all', ...this.categories.filter(c => c !== 'all')];
    }
    
    getCurrent() {
        return appState.selectedCategory;
    }
    
    setCurrent(category) {
        appState.selectedCategory = category;
    }
    
    renderDropdown() {
        const dropdownLabel = document.getElementById('category-dropdown-label');
        if (dropdownLabel) {
            dropdownLabel.textContent = appState.selectedCategory === 'all' ? 'Semua Produk' : appState.selectedCategory;
        }
    }
    
    renderTabs() {
        const tabsContainer = document.getElementById('category-tabs');
        if (!tabsContainer) return;
        
        tabsContainer.innerHTML = '';
        
        this.getAll().forEach(category => {
            const tab = document.createElement('div');
            tab.className = `category-tab ${appState.selectedCategory === category ? 'active' : ''}`;
            tab.dataset.category = category;
            
            if (category === 'all') {
                tab.innerHTML = `
                    <div style="display:flex;align-items:center;gap:6px;">
                        <svg class="icon icon-sm" viewBox="0 0 24 24" style="width:14px;height:14px;opacity:0.7;">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <line x1="3" y1="9" x2="21" y2="9"/>
                            <line x1="9" y1="21" x2="9" y2="9"/>
                        </svg>
                        Semua Produk
                    </div>
                `;
            } else {
                tab.innerHTML = `
                    <div style="display:flex;align-items:center;gap:6px;">
                        <svg class="icon icon-sm" viewBox="0 0 24 24" style="width:14px;height:14px;opacity:0.7;">
                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                            <path d="M10 2v20"/>
                        </svg>
                        ${category}
                    </div>
                `;
            }
            
            tab.onclick = () => {
                appState.selectedCategory = category;
                appState.searchQuery = '';
                
                const searchInput = document.getElementById('search-input');
                if (searchInput) searchInput.value = '';
                
                this.renderDropdown();
                this.renderTabs();
                uiManager.renderProducts();
            };
            
            tabsContainer.appendChild(tab);
        });
    }
}

window.categoriesManager = new CategoriesManager();
