// Barcode Module
class BarcodeManager {
    constructor() {
        this.currentBarcode = '';
    }
    
    generateBarcodeData() {
        if (!appState.currentProduct || !appState.weightValue || appState.weightValue === '0') {
            return null;
        }
        
        const flexCode = appState.currentProduct.flex?.padStart(appState.digitConfig.flex, '0') || '01';
        const catCode = appState.currentProduct.catcode?.padStart(appState.digitConfig.category, '0') || '01';
        const productCode = appState.currentProduct.code?.padStart(appState.digitConfig.product, '0') || '0000';
        const weight = appState.weightValue.padStart(appState.digitConfig.weight, '0');
        
        appState.currentBarcodeData = flexCode + catCode + productCode + weight;
        
        const totalDigits = appState.digitConfig.flex + appState.digitConfig.category + 
                           appState.digitConfig.product + appState.digitConfig.weight;
        
        if (appState.currentBarcodeData.length !== totalDigits) {
            Notifications.show(`Total digit harus ${totalDigits}`, 'error');
            return null;
        }
        
        return appState.currentBarcodeData;
    }
    
    generateDisplay() {
        const barcodeData = this.generateBarcodeData();
        if (!barcodeData) return false;
        
        const barcodeSvg = document.getElementById('barcode-svg');
        if (!barcodeSvg) return false;
        
        barcodeSvg.innerHTML = '';
        
        try {
            JsBarcode("#barcode-svg", barcodeData, {
                format: "CODE128",
                displayValue: true,
                fontSize: 16,
                height: 60,
                margin: 10,
                background: "white",
                lineColor: "#000000",
                width: 2
            });
            
            // Update display elements
            const displayBarcode = document.getElementById('display-barcode');
            const currentBarcode = document.getElementById('current-barcode');
            
            if (displayBarcode) displayBarcode.textContent = barcodeData;
            if (currentBarcode) currentBarcode.textContent = barcodeData;
            
            Notifications.show('Barcode berhasil digenerate!', 'success');
            return true;
            
        } catch (error) {
            console.error("Barcode generation error:", error);
            Notifications.show('Gagal membuat barcode: ' + error.message, 'error');
            return false;
        }
    }
    
    async print() {
        const barcodeData = this.generateBarcodeData();
        if (!barcodeData) return false;
        
        try {
            const esc = '\x1B';
            const gs = '\x1D';
            const lf = '\x0A';
            
            let data = esc + '@';
            data += esc + 'a' + '\x01'; // Center alignment
            data += lf;
            
            if (appState.printDesign === 1) {
                // Design 1: Simple barcode
                data += barcodeData + '\n';
                data += gs + 'h' + '\x50';
                data += gs + 'w' + '\x02';
                data += gs + 'k' + '\x49';
                data += String.fromCharCode(barcodeData.length);
                data += barcodeData;
                data += lf + lf;
                
            } else if (appState.printDesign === 2) {
                // Design 2: Detailed barcode
                data += '-----------------------------\n';
                data += appState.currentProduct.name + '\n';
                data += gs + 'h' + '\x50';
                data += gs + 'w' + '\x02';
                data += gs + 'k' + '\x49';
                data += String.fromCharCode(barcodeData.length);
                data += barcodeData;
                data += lf;
                data += barcodeData + '\n';
                data += appState.weightValue + ' gram\n';
                data += '-----------------------------\n';
                data += lf + lf;
            }
            
            // Paper cut
            data += gs + 'V' + '\x41' + '\x00';
            
            const encoder = new TextEncoder();
            const printData = encoder.encode(data);
            
            const success = await printerManager.print(printData);
            
            if (success) {
                await this.savePrintHistory(barcodeData);
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.error("Print error:", error);
            Notifications.show('Gagal mencetak: ' + error.message, 'error');
            return false;
        }
    }
    
    async savePrintHistory(barcodeData) {
        try {
            await database.add(AppConfig.STORES.HISTORY, {
                barcode: barcodeData,
                productName: appState.currentProduct.name,
                weight: appState.weightValue,
                timestamp: new Date().toISOString(),
                printedAt: new Date().toLocaleString('id-ID')
            });
        } catch (error) {
            console.error('Error saving print history:', error);
        }
    }
    
    clear() {
        appState.weightValue = '';
        appState.currentBarcodeData = '';
        
        const displayWeight = document.getElementById('display-weight');
        const displayBarcode = document.getElementById('display-barcode');
        const currentBarcode = document.getElementById('current-barcode');
        const barcodeSvg = document.getElementById('barcode-svg');
        
        if (displayWeight) displayWeight.textContent = '0';
        if (displayBarcode) displayBarcode.textContent = '-';
        if (currentBarcode) currentBarcode.textContent = 'Klik GENERATE untuk membuat barcode';
        if (barcodeSvg) barcodeSvg.innerHTML = '';
    }
    
    appendNumber(num) {
        if (num === '00') {
            if (appState.weightValue.length <= appState.digitConfig.weight - 2) {
                appState.weightValue += '00';
            }
        } else if (appState.weightValue.length < appState.digitConfig.weight) {
            appState.weightValue += num;
        }
        
        this.updateDisplay();
    }
    
    backspace() {
        if (appState.weightValue.length > 0) {
            appState.weightValue = appState.weightValue.slice(0, -1);
        }
        this.updateDisplay();
    }
    
    updateDisplay() {
        const displayWeight = document.getElementById('display-weight');
        if (displayWeight) {
            displayWeight.textContent = appState.weightValue || '0';
        }
    }
    
    setWeightFromPreset(presetKey) {
        const presetValue = appState.weightPresets[presetKey];
        if (presetValue && presetValue > 0) {
            const maxDigits = appState.digitConfig.weight;
            let weightString = presetValue.toString();
            
            if (weightString.length > maxDigits) {
                weightString = weightString.substring(0, maxDigits);
                Notifications.show(`Berat dipotong menjadi ${weightString} (maks ${maxDigits} digit)`, 'info');
            }
            
            appState.weightValue = weightString;
            this.updateDisplay();
            Notifications.show(`Berat diatur ke preset: ${presetValue}g`, 'success');
        } else {
            Notifications.show('Preset belum diatur!', 'error');
        }
    }
    
    updatePresetButtons() {
        const presetContainer = document.getElementById('weight-preset-buttons');
        if (!presetContainer) return;
        
        presetContainer.innerHTML = '';
        
        for (let i = 1; i <= 4; i++) {
            const presetKey = `preset${i}`;
            const presetValue = appState.weightPresets[presetKey] || 0;
            
            const button = document.createElement('button');
            button.className = 'weight-preset-btn';
            button.innerHTML = `
                <div class="weight-preset-label">Preset ${i}</div>
                <div class="weight-preset-value">${presetValue}g</div>
            `;
            button.onclick = () => this.setWeightFromPreset(presetKey);
            
            presetContainer.appendChild(button);
        }
    }
}

window.barcodeManager = new BarcodeManager();
