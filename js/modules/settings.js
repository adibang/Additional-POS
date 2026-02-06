// Settings Module
class SettingsManager {
    constructor() {
        this.settingsLoaded = false;
    }
    
    async load() {
        try {
            const savedConfig = await database.get(AppConfig.STORES.SETTINGS, 'barcodeConfig');
            if (savedConfig) {
                appState.digitConfig = savedConfig.value;
            }
            
            const savedPrintDesign = await database.get(AppConfig.STORES.SETTINGS, 'printDesign');
            if (savedPrintDesign) {
                appState.printDesign = savedPrintDesign.value;
            }
            
            const savedWeightPresets = await database.get(AppConfig.STORES.SETTINGS, 'weightPresets');
            if (savedWeightPresets) {
                appState.weightPresets = savedWeightPresets.value;
            }
            
            this.settingsLoaded = true;
            return true;
            
        } catch (error) {
            console.error('Error loading settings:', error);
            return false;
        }
    }
    
    async save() {
        try {
            await database.put(AppConfig.STORES.SETTINGS, {
                key: 'barcodeConfig',
                value: appState.digitConfig,
                updatedAt: new Date().toISOString()
            });
            
            await database.put(AppConfig.STORES.SETTINGS, {
                key: 'printDesign',
                value: appState.printDesign,
                updatedAt: new Date().toISOString()
            });
            
            await database.put(AppConfig.STORES.SETTINGS, {
                key: 'weightPresets',
                value: appState.weightPresets,
                updatedAt: new Date().toISOString()
            });
            
            Notifications.show('Pengaturan berhasil disimpan', 'success');
            return true;
            
        } catch (error) {
            console.error('Error saving settings:', error);
            Notifications.show('Gagal menyimpan pengaturan: ' + error.message, 'error');
            return false;
        }
    }
    
    showSettingsModal() {
        const modalHTML = `
            <div class="modal-overlay active" id="settings-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title">
                            <svg class="icon icon-primary settings-icon" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                            </svg>
                            Pengaturan
                        </h2>
                    </div>
                    <div class="modal-body">
                        <div id="settings-content">
                            <!-- Settings form will be loaded dynamically -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const modalsContainer = document.getElementById('modals-container');
        if (!modalsContainer) return;
        
        modalsContainer.innerHTML = modalHTML;
        this.loadSettingsForm();
    }
    
    loadSettingsForm() {
        const settingsContent = document.getElementById('settings-content');
        if (!settingsContent) return;
        
        const totalDigits = appState.digitConfig.flex + appState.digitConfig.category + 
                           appState.digitConfig.product + appState.digitConfig.weight;
        const isValid = totalDigits === 13;
        
        settingsContent.innerHTML = `
            <div style="margin-bottom: 20px;">
                <h3 style="color: #006B54; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                    <svg class="icon icon-sm" viewBox="0 0 24 24">
                        <path d="M12 20h9"/>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                    Konfigurasi Digit Barcode
                </h3>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #333; font-weight: 500;">
                            Digit Flex
                        </label>
                        <input type="number" id="flex-digits" class="setting-input" 
                               value="${appState.digitConfig.flex}" min="1" max="5">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #333; font-weight: 500;">
                            Digit Kategori
                        </label>
                        <input type="number" id="category-digits" class="setting-input" 
                               value="${appState.digitConfig.category}" min="1" max="5">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #333; font-weight: 500;">
                            Digit Produk
                        </label>
                        <input type="number" id="product-digits" class="setting-input" 
                               value="${appState.digitConfig.product}" min="1" max="5">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; color: #333; font-weight: 500;">
                            Digit Berat
                        </label>
                        <input type="number" id="weight-digits" class="setting-input" 
                               value="${appState.digitConfig.weight}" min="1" max="5">
                    </div>
                </div>
                
                <div class="digit-summary" style="background: ${isValid ? '#f5f5f5' : '#ffe6e6'}; 
                    border: 2px solid ${isValid ? '#d9d9d9' : '#ffcccc'}; 
                    padding: 15px; border-radius: 15px; text-align: center;">
                    <div style="font-weight: 600; margin-bottom: 5px; color: ${isValid ? '#155724' : '#721c24'}">
                        Total Digit: ${totalDigits}
                    </div>
                    <div style="font-size: 0.9rem; color: ${isValid ? '#155724' : '#721c24'}">
                        ${isValid ? '✓ Format barcode valid (13 digit)' : '⚠ Harus tepat 13 digit!'}
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #006B54; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                    <svg class="icon icon-sm" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="7" height="7"/>
                        <rect x="14" y="3" width="7" height="7"/>
                        <rect x="3" y="14" width="7" height="7"/>
                        <rect x="14" y="14" width="7" height="7"/>
                    </svg>
                    Preset Berat (gram)
                </h3>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                    ${[1,2,3,4].map(i => `
                        <div>
                            <label style="display: block; margin-bottom: 5px; color: #333; font-weight: 500;">
                                Preset ${i}
                            </label>
                            <input type="number" id="weight-preset${i}" class="setting-input" 
                                   value="${appState.weightPresets[`preset${i}`] || 0}" min="0" step="1">
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #006B54; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                    <svg class="icon icon-sm" viewBox="0 0 24 24">
                        <polyline points="6 9 6 2 18 2 18 9"/>
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1-2 2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                        <rect x="6" y="14" width="12" height="8"/>
                    </svg>
                    Desain Cetak
                </h3>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; color: #333; font-weight: 500;">
                        Pilih Desain Cetak
                    </label>
                    <select id="print-design-select" class="setting-select">
                        <option value="1" ${appState.printDesign === 1 ? 'selected' : ''}>Desain 1: Sederhana</option>
                        <option value="2" ${appState.printDesign === 2 ? 'selected' : ''}>Desain 2: Lengkap</option>
                    </select>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px;">
                <button class="btn btn-secondary" onclick="settingsManager.closeModal()">
                    <svg class="icon icon-sm" viewBox="0 0 24 24">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    BATAL
                </button>
                <button class="btn btn-primary" onclick="settingsManager.saveSettings()">
                    <svg class="icon icon-sm" viewBox="0 0 24 24">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                    </svg>
                    SIMPAN
                </button>
            </div>
        `;
        
        // Add event listeners for digit validation
        ['flex-digits', 'category-digits', 'product-digits', 'weight-digits'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.updateDigitSummary());
            }
        });
    }
    
    updateDigitSummary() {
        const flex = parseInt(document.getElementById('flex-digits').value) || 0;
        const category = parseInt(document.getElementById('category-digits').value) || 0;
        const product = parseInt(document.getElementById('product-digits').value) || 0;
        const weight = parseInt(document.getElementById('weight-digits').value) || 0;
        const total = flex + category + product + weight;
        const isValid = total === 13;
        
        const summary = document.querySelector('.digit-summary');
        if (summary) {
            summary.innerHTML = `
                <div style="font-weight: 600; margin-bottom: 5px; color: ${isValid ? '#155724' : '#721c24'}">
                    Total Digit: ${total}
                </div>
                <div style="font-size: 0.9rem; color: ${isValid ? '#155724' : '#721c24'}">
                    ${isValid ? '✓ Format barcode valid (13 digit)' : '⚠ Harus tepat 13 digit!'}
                </div>
            `;
            summary.style.background = isValid ? '#f5f5f5' : '#ffe6e6';
            summary.style.borderColor = isValid ? '#d9d9d9' : '#ffcccc';
        }
    }
    
    async saveSettings() {
        // Get values from form
        const flex = parseInt(document.getElementById('flex-digits').value) || 2;
        const category = parseInt(document.getElementById('category-digits').value) || 2;
        const product = parseInt(document.getElementById('product-digits').value) || 4;
        const weight = parseInt(document.getElementById('weight-digits').value) || 5;
        const design = parseInt(document.getElementById('print-design-select').value) || 1;
        
        // Get weight presets
        const weightPresets = {
            preset1: parseInt(document.getElementById('weight-preset1').value) || 0,
            preset2: parseInt(document.getElementById('weight-preset2').value) || 0,
            preset3: parseInt(document.getElementById('weight-preset3').value) || 0,
            preset4: parseInt(document.getElementById('weight-preset4').value) || 0
        };
        
        // Validate total digits
        const total = flex + category + product + weight;
        if (total !== 13) {
            Notifications.show('Total digit harus 13!', 'error');
            return;
        }
        
        // Update app state
        appState.digitConfig = { flex, category, product, weight };
        appState.printDesign = design;
        appState.weightPresets = weightPresets;
        
        // Save to database
        const success = await this.save();
        
        if (success) {
            this.closeModal();
            barcodeManager.updatePresetButtons();
        }
    }
    
    closeModal() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.remove();
        }
    }
    
    async exportData() {
        try {
            uiManager.showLoading();
            
            const exportData = {
                products: await database.getAll(AppConfig.STORES.PRODUCTS),
                categories: await database.getAll(AppConfig.STORES.CATEGORIES),
                settings: await database.getAll(AppConfig.STORES.SETTINGS),
                exportDate: new Date().toISOString(),
                version: AppConfig.DB_VERSION
            };
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            const exportFileName = `pos-backup-${new Date().toISOString().split('T')[0]}.json`;
            
            const link = document.createElement('a');
            link.href = dataUri;
            link.download = exportFileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            Notifications.show('Data berhasil dieksport!', 'success');
            
        } catch (error) {
            console.error('Error exporting data:', error);
            Notifications.show('Gagal mengeksport data: ' + error.message, 'error');
        } finally {
            uiManager.hideLoading();
        }
    }
    
    async importData() {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) {
                    resolve(false);
                    return;
                }
                
                uiManager.showLoading();
                
                const reader = new FileReader();
                
                reader.onload = async (event) => {
                    try {
                        const importedData = JSON.parse(event.target.result);
                        
                        if (!importedData.products || !Array.isArray(importedData.products)) {
                            throw new Error('Format data tidak valid');
                        }
                        
                        // Clear existing data
                        await database.clear(AppConfig.STORES.PRODUCTS);
                        await database.clear(AppConfig.STORES.CATEGORIES);
                        await database.clear(AppConfig.STORES.SETTINGS);
                        
                        // Import products
                        for (const product of importedData.products) {
                            try {
                                await database.add(AppConfig.STORES.PRODUCTS, product);
                            } catch (error) {
                                console.warn('Failed to import product:', error);
                            }
                        }
                        
                        // Import categories
                        if (importedData.categories && Array.isArray(importedData.categories)) {
                            for (const category of importedData.categories) {
                                try {
                                    await database.add(AppConfig.STORES.CATEGORIES, category);
                                } catch (error) {
                                    console.warn('Failed to import category:', error);
                                }
                            }
                        }
                        
                        // Import settings
                        if (importedData.settings && Array.isArray(importedData.settings)) {
                            for (const setting of importedData.settings) {
                                try {
                                    await database.add(AppConfig.STORES.SETTINGS, setting);
                                } catch (error) {
                                    console.warn('Failed to import setting:', error);
                                }
                            }
                        }
                        
                        // Reload data
                        await productsManager.init();
                        await categoriesManager.init();
                        await this.load();
                        
                        // Update UI
                        categoriesManager.renderTabs();
                        uiManager.renderProducts();
                        
                        Notifications.show('Data berhasil diimport!', 'success');
                        resolve(true);
                        
                    } catch (error) {
                        console.error('Error importing data:', error);
                        Notifications.show('Gagal mengimport data: ' + error.message, 'error');
                        resolve(false);
                    } finally {
                        uiManager.hideLoading();
                    }
                };
                
                reader.onerror = () => {
                    Notifications.show('Gagal membaca file', 'error');
                    uiManager.hideLoading();
                    resolve(false);
                };
                
                reader.readAsText(file);
            };
            
            input.click();
        });
    }
    
    async clearAllData() {
        if (!confirm('Apakah Anda yakin ingin menghapus SEMUA data?\nTindakan ini tidak dapat dibatalkan!')) {
            return;
        }
        
        try {
            uiManager.showLoading();
            
            await database.clear(AppConfig.STORES.PRODUCTS);
            await database.clear(AppConfig.STORES.CATEGORIES);
            await database.clear(AppConfig.STORES.HISTORY);
            await database.clear(AppConfig.STORES.APP_STATE);
            
            // Reset app state
            appState.products = [];
            appState.categories = ['all'];
            appState.selectedCategory = 'all';
            
            // Update UI
            categoriesManager.renderTabs();
            uiManager.renderProducts();
            
            Notifications.show('Semua data berhasil dihapus!', 'success');
            
        } catch (error) {
            console.error('Error clearing data:', error);
            Notifications.show('Gagal menghapus data: ' + error.message, 'error');
        } finally {
            uiManager.hideLoading();
        }
    }
}

window.settingsManager = new SettingsManager();
