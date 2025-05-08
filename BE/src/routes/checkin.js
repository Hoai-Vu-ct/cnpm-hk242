const express = require('express');
const router = express.Router();
const checkinController = require('../controllers/checkinController');

// Check-in
router.post('/checkin', checkinController.checkIn);

// Check-in QR
router.get('/checkin/qr', checkinController.checkInQR);

// Check-out
router.post('/checkout', checkinController.checkOut);

// Auto-release reservations not checked in
router.post('/auto-release', checkinController.autoReleaseNoShows);

module.exports = router;