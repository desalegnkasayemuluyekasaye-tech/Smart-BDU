const express = require('express');
const router = express.Router();
const { chatWithAI, generateRoadmap, generateCV } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/chat', protect, chatWithAI);
router.post('/roadmap', protect, generateRoadmap);
router.post('/cv', protect, generateCV);

module.exports = router;
