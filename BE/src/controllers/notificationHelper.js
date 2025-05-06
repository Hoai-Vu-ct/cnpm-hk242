// Simple helper to push notification into memory store
const notificationController = require('./notificationController');

exports.sendSystemNotification = (userId, title, message) => {
    // Directly call controller's sendNotification logic
    notificationController.sendNotification(
        { body: { userId, title, message } },
        { 
            status: () => ({ json: () => {} })  // Dummy response
        }
    );
};