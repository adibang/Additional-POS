// Printer Module
class PrinterManager {
    constructor() {
        this.port = null;
        this.writer = null;
        this.reconnectAttempts = 0;
    }
    
    async init() {
        try {
            const savedConnection = localStorage.getItem('printerConnection');
            if (savedConnection) {
                const connectionData = JSON.parse(savedConnection);
                const savedTime = new Date(connectionData.timestamp);
                const currentTime = new Date();
                const minutesDifference = (currentTime - savedTime) / (1000 * 60);
                
                if (connectionData.isPrinterConnected && minutesDifference < 5) {
                    appState.isPrinterConnected = false;
                    this.updatePrinterLED(false);
                    setTimeout(() => {
                        this.autoReconnect();
                    }, 1000);
                } else {
                    appState.isPrinterConnected = false;
                    this.updatePrinterLED(false);
                    localStorage.removeItem('printerConnection');
                }
            } else {
                appState.isPrinterConnected = false;
                this.updatePrinterLED(false);
            }
        } catch (e) {
            console.error('Error loading printer connection:', e);
            appState.isPrinterConnected = false;
            this.updatePrinterLED(false);
        }
    }
    
    updatePrinterLED(connected) {
        const printerLED = document.getElementById('printer-led');
        const statusText = document.getElementById('printer-status-text');
        
        if (printerLED) {
            printerLED.className = `printer-led ${connected ? 'connected' : 'disconnected'}`;
        }
        
        if (statusText) {
            statusText.textContent = connected ? 'Printer Online' : 'Printer Offline';
        }
    }
    
    async autoReconnect() {
        if (this.reconnectAttempts >= AppConfig.MAX_RECONNECT_ATTEMPTS) {
            return;
        }
        
        try {
            if (!("serial" in navigator)) {
                return;
            }
            
            const ports = await navigator.serial.getPorts();
            if (ports.length === 0) {
                Notifications.show('Printer perlu dihubungkan kembali setelah refresh halaman', 'info');
                return;
            }
            
            this.port = ports[0];
            
            if (this.port.readable || this.port.writable) {
                this.writer = this.port.writable.getWriter();
                appState.isPrinterConnected = true;
                this.reconnectAttempts = 0;
                this.updatePrinterLED(true);
                this.saveConnection();
                Notifications.show('Printer berhasil terhubung ulang!', 'success');
                this.port.addEventListener('disconnect', () => this.handleDisconnect());
                return;
            }
            
            await this.port.open({ baudRate: 9600 });
            this.writer = this.port.writable.getWriter();
            appState.isPrinterConnected = true;
            this.reconnectAttempts = 0;
            this.updatePrinterLED(true);
            this.saveConnection();
            Notifications.show('Printer berhasil terhubung ulang!', 'success');
            this.port.addEventListener('disconnect', () => this.handleDisconnect());
        } catch (error) {
            console.error("Auto-reconnect error:", error);
            this.reconnectAttempts++;
            if (this.reconnectAttempts < AppConfig.MAX_RECONNECT_ATTEMPTS) {
                setTimeout(() => this.autoReconnect(), 2000);
            } else {
                Notifications.show('Gagal menghubungkan ulang ke printer.', 'error');
                appState.isPrinterConnected = false;
                this.updatePrinterLED(false);
            }
        }
    }
    
    async connect() {
        try {
            if (!("serial" in navigator)) {
                Notifications.show("Browser tidak mendukung Web Serial API. Gunakan Chrome/Edge.", 'error');
                return false;
            }
            
            Notifications.show("Memilih printer...", 'info');
            this.port = await navigator.serial.requestPort();
            
            Notifications.show("Membuka koneksi...", 'info');
            await this.port.open({ baudRate: 9600 });
            
            this.writer = this.port.writable.getWriter();
            appState.isPrinterConnected = true;
            this.reconnectAttempts = 0;
            this.updatePrinterLED(true);
            this.saveConnection();
            
            Notifications.show('Printer Connected!', 'success');
            this.port.addEventListener('disconnect', () => this.handleDisconnect());
            
            return true;
        } catch (error) {
            console.error("Connection error:", error);
            if (error.name === 'NotFoundError') {
                Notifications.show("Tidak ada printer yang dipilih", 'error');
            } else if (error.name === 'InvalidStateError') {
                Notifications.show("Printer sudah terhubung", 'error');
            } else {
                Notifications.show("Gagal terhubung ke printer: " + error.message, 'error');
            }
            
            appState.isPrinterConnected = false;
            this.updatePrinterLED(false);
            return false;
        }
    }
    
    async disconnect() {
        try {
            if (this.writer) {
                this.writer.releaseLock();
                this.writer = null;
            }
            
            if (this.port) {
                await this.port.close();
                this.port = null;
            }
            
            appState.isPrinterConnected = false;
            this.reconnectAttempts = 0;
            this.updatePrinterLED(false);
            this.saveConnection();
            Notifications.show('Printer disconnected', 'success');
            
        } catch (error) {
            console.error("Disconnection error:", error);
            appState.isPrinterConnected = false;
            this.updatePrinterLED(false);
            this.saveConnection();
            Notifications.show('Printer disconnected', 'success');
        }
    }
    
    async print(data) {
        if (!appState.isPrinterConnected || !this.writer) {
            Notifications.show('Printer belum terhubung. Klik CONNECT dulu.', 'error');
            return false;
        }
        
        try {
            Notifications.show("Mengirim data ke printer...", 'info');
            await this.writer.write(data);
            return true;
        } catch (error) {
            console.error("Print error:", error);
            Notifications.show("Gagal mengirim ke printer: " + error.message, 'error');
            
            if (error.message.includes("closed") || error.message.includes("disconnected") || error.name === 'NetworkError') {
                this.handleDisconnect();
            }
            return false;
        }
    }
    
    handleDisconnect() {
        appState.isPrinterConnected = false;
        this.port = null;
        this.writer = null;
        this.updatePrinterLED(false);
        this.saveConnection();
        Notifications.show('Printer terputus!', 'error');
    }
    
    saveConnection() {
        try {
            const connectionData = {
                isPrinterConnected: appState.isPrinterConnected,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('printerConnection', JSON.stringify(connectionData));
        } catch (e) {
            console.error('Error saving printer connection:', e);
        }
    }
    
    toggleConnection() {
        if (appState.isPrinterConnected) {
            this.disconnect();
        } else {
            this.connect();
        }
    }
    
    getStatus() {
        return appState.isPrinterConnected;
    }
}

window.printerManager = new PrinterManager();
