const express = require('express');
const router = express.Router();
const spacesController = require('../controllers/spacesController');

// GET /api/spaces
router.get('/', spacesController.getAllSpaces);

// GET /api/spaces/:id
router.get('/:id', spacesController.getSpaceById);

// GET /api/spaces/:id/status
router.get('/:id/status', spacesController.getSpaceStatus);

// POST /api/spaces  (Admin only)
router.post('/', spacesController.createSpace);

// PUT /api/spaces/:id  (Admin only)
router.put('/:id', spacesController.updateSpace);

// DELETE /api/spaces/:id  (Admin only)
router.delete('/:id', spacesController.deleteSpace);

module.exports = router;