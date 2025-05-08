const express = require('express');
const router = express.Router();
const spacesController = require('../controllers/spacesController');

// GET /api/spaces
router.get('/', spacesController.getAllSpaces);

// GET /api/spaces/:id
router.get('/:spaceId', spacesController.getSpaceById);

// POST /api/spaces  (Admin only)
router.post('/', spacesController.createSpace);

// PUT /api/spaces/:id  (Admin only)
router.put('/:spaceId', spacesController.updateSpace);

// DELETE /api/spaces/:id  (Admin only)
router.delete('/:spaceId', spacesController.deleteSpace);

module.exports = router;