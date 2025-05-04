const express = require('express');
const router = express.Router();
const checkinController = require('../controllers/checkinController');

// Check-in
router.post('/checkin', checkinController.checkIn);

// Check-out
router.post('/checkout', checkinController.checkOut);

module.exports = router;