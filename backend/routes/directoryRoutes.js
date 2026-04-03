const express = require('express');
const router = express.Router();
const { getDirectory, createDirectoryEntry } = require('../controllers/directoryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getDirectory);
router.post('/', protect, admin, createDirectoryEntry);

module.exports = router;
