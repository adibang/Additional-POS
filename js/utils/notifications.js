// Notification system
const Notifications = {
    show: (message, type = 'success') => {
        let notification = document.getElementById('notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                padding: 12px 24px;
                border-radius: 15px;
                color: white;
                background-color: #006B54;
                max-width: 90%;
                text-align: center;
                z-index: 1001;
                font-size: 14px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                display: none;
            `;
            document.body.appendChild(notification);
        }
        
        // Set color based on type
        const colors = {
            success: '#006B54',
            error: '#ff6b6b',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        
        notification.textContent = message;
        notification.style.backgroundColor = colors[type] || colors.success;
        notification.style.display = 'block';
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
};

window.Notifications = Notifications;
