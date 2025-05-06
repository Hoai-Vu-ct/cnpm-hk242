const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// List notifications for a user
router.get('/:userId', notificationController.listNotifications);

// Send notification (internal system use)
router.post('/send', notificationController.sendNotification);

// Mark notification as read
router.post('/read', notificationController.markAsRead);

module.exports = router;
