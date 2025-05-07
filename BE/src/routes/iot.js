const express = require('express');
const router = express.Router();
const iotController = require('../controllers/iotController');

// POST /api/iot/turn-on
router.post('/turn-on', iotController.turnOnDevices)

// POST /api/iot/turn-off
router.post('/turn-off', iotController.turnOffDevices)

module.exports = router;