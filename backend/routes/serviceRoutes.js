const express = require('express');
const router = express.Router();
const { getServices, getServiceById, createService, updateService } = require('../controllers/serviceController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getServices);
router.get('/:id', getServiceById);
router.post('/', protect, admin, createService);
router.put('/:id', protect, admin, updateService);

module.exports = router;
