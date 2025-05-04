const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

// Create new reservation
router.post('/', reservationController.createReservation);

// Cancel reservation
router.post('/cancel', reservationController.cancelReservation);

// Get reservations by student
router.get('/student/:studentId', reservationController.getReservationsByStudent);

// Admin: Get all reservations
router.get('/get-all', reservationController.getAllReservations);

module.exports = router;