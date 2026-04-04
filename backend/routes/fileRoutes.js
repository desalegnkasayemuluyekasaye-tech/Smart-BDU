const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { upload, uploadFile, getFiles, getMyFiles, downloadFile, deleteFile } = require('../controllers/fileController');

router.post('/upload', protect, upload, uploadFile);
router.get('/', protect, getFiles);
router.get('/my-files', protect, getMyFiles);
router.get('/download/:id', protect, downloadFile);
router.delete('/:id', protect, deleteFile);

module.exports = router;