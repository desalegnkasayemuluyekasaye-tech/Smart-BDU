const express = require('express');
const router = express.Router();
const { createPost, getPosts, getMyPosts, deletePost } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createPost);
router.get('/', protect, getPosts);
router.get('/my-posts', protect, getMyPosts);
router.delete('/:id', protect, deletePost);

module.exports = router;