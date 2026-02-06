// Utility functions
const Helpers = {
    // Format number with leading zeros
    padNumber: (num, length) => String(num).padStart(length, '0'),
    
    // Generate example code
    generateExampleCode: (digitCount) => '0'.repeat(digitCount - 1) + '1',
    
    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Parse weight from input
    parseWeight: (value, maxDigits) => {
        if (!value) return '';
        const strValue = String(value).replace(/\D/g, '');
        return strValue.slice(0, maxDigits);
    },
    
    // Create DOM element
    createElement: (tag, className, innerHTML, attributes = {}) => {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        return element;
    }
};

// Export
window.Helpers = Helpers;
