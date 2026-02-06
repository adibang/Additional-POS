// Validations Module
const Validations = {
    // Product validations
    validateProduct: (productData, isEdit = false) => {
        const errors = [];
        
        // Name validation
        if (!productData.name || productData.name.trim() === '') {
            errors.push('Nama produk harus diisi');
        } else if (productData.name.length > 100) {
            errors.push('Nama produk maksimal 100 karakter');
        }
        
        // Code validation
        if (!productData.code || productData.code.trim() === '') {
            errors.push('Kode produk harus diisi');
        } else if (!/^\d+$/.test(productData.code)) {
            errors.push('Kode produk hanya boleh berisi angka');
        } else if (productData.code.length > appState.digitConfig.product) {
            errors.push(`Kode produk maksimal ${appState.digitConfig.product} digit`);
        }
        
        // Category validation
        if (!productData.category || productData.category.trim() === '') {
            errors.push('Kategori produk harus diisi');
        }
        
        // Flex code validation
        if (productData.flex && !/^\d+$/.test(productData.flex)) {
            errors.push('Flex code hanya boleh berisi angka');
        }
        
        if (productData.flex && productData.flex.length > appState.digitConfig.flex) {
            errors.push(`Flex code maksimal ${appState.digitConfig.flex} digit`);
        }
        
        // Category code validation
        if (productData.catcode && !/^\d+$/.test(productData.catcode)) {
            errors.push('Kode kategori hanya boleh berisi angka');
        }
        
        if (productData.catcode && productData.catcode.length > appState.digitConfig.category) {
            errors.push(`Kode kategori maksimal ${appState.digitConfig.category} digit`);
        }
        
        // Check for duplicate code (only for new products)
        if (!isEdit) {
            const duplicate = appState.products.find(p => p.code === productData.code);
            if (duplicate) {
                errors.push(`Kode produk "${productData.code}" sudah digunakan oleh "${duplicate.name}"`);
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },
    
    // Category validations
    validateCategory: (categoryName) => {
        const errors = [];
        
        if (!categoryName || categoryName.trim() === '') {
            errors.push('Nama kategori harus diisi');
        } else if (categoryName.length > 50) {
            errors.push('Nama kategori maksimal 50 karakter');
        } else if (categoryName === 'all') {
            errors.push('Kategori "all" tidak dapat digunakan');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },
    
    // Weight validations
    validateWeight: (weight) => {
        const errors = [];
        
        if (!weight || weight.trim() === '') {
            errors.push('Berat harus diisi');
        } else if (!/^\d+$/.test(weight)) {
            errors.push('Berat hanya boleh berisi angka');
        } else if (parseInt(weight) <= 0) {
            errors.push('Berat harus lebih dari 0');
        } else if (weight.length > appState.digitConfig.weight) {
            errors.push(`Berat maksimal ${appState.digitConfig.weight} digit`);
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },
    
    // Barcode validations
    validateBarcode: () => {
        const errors = [];
        
        if (!appState.currentProduct) {
            errors.push('Pilih produk terlebih dahulu');
        }
        
        if (!appState.weightValue || appState.weightValue === '0') {
            errors.push('Masukkan berat terlebih dahulu');
        }
        
        const barcodeData = barcodeManager.generateBarcodeData();
        if (!barcodeData) {
            errors.push('Gagal membuat data barcode');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },
    
    // Settings validations
    validateSettings: (settings) => {
        const errors = [];
        
        if (!settings.digitConfig) {
            errors.push('Konfigurasi digit harus diisi');
        } else {
            const { flex, category, product, weight } = settings.digitConfig;
            
            if (!flex || flex < 1 || flex > 5) {
                errors.push('Digit flex harus antara 1-5');
            }
            
            if (!category || category < 1 || category > 5) {
                errors.push('Digit kategori harus antara 1-5');
            }
            
            if (!product || product < 1 || product > 5) {
                errors.push('Digit produk harus antara 1-5');
            }
            
            if (!weight || weight < 1 || weight > 5) {
                errors.push('Digit berat harus antara 1-5');
            }
            
            const total = flex + category + product + weight;
            if (total !== 13) {
                errors.push('Total digit harus tepat 13');
            }
        }
        
        if (!settings.printDesign || (settings.printDesign !== 1 && settings.printDesign !== 2)) {
            errors.push('Desain cetak tidak valid');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },
    
    // Image validations
    validateImage: (file) => {
        const errors = [];
        
        if (!file) {
            return { isValid: true, errors: [] };
        }
        
        // Check file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            errors.push('Format file harus JPG, PNG, GIF, atau WebP');
        }
        
        // Check file size (max 2MB)
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
            errors.push('Ukuran file maksimal 2MB');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },
    
    // Form field validation
    validateField: (field, value) => {
        switch (field) {
            case 'name':
                if (!value || value.trim() === '') {
                    return 'Nama harus diisi';
                }
                if (value.length > 100) {
                    return 'Nama maksimal 100 karakter';
                }
                return '';
                
            case 'code':
                if (!value || value.trim() === '') {
                    return 'Kode harus diisi';
                }
                if (!/^\d+$/.test(value)) {
                    return 'Kode hanya boleh berisi angka';
                }
                if (value.length > appState.digitConfig.product) {
                    return `Kode maksimal ${appState.digitConfig.product} digit`;
                }
                return '';
                
            case 'category':
                if (!value || value.trim() === '') {
                    return 'Kategori harus diisi';
                }
                return '';
                
            case 'weight':
                if (!value || value.trim() === '') {
                    return 'Berat harus diisi';
                }
                if (!/^\d+$/.test(value)) {
                    return 'Berat hanya boleh berisi angka';
                }
                if (parseInt(value) <= 0) {
                    return 'Berat harus lebih dari 0';
                }
                return '';
                
            default:
                return '';
        }
    }
};

window.Validations = Validations;
