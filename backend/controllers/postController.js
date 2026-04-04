const Post = require('../models/Post');
const User = require('../models/User');

const createPost = async (req, res) => {
  try {
    const { title, content, targetType, targetDepartment, targetYear, targetClass, attachments, category, priority } = req.body;
    
    const post = await Post.create({
      title,
      content,
      author: req.user._id,
      targetType: targetType || 'all',
      targetDepartment,
      targetYear,
      targetClass,
      attachments: attachments || [],
      category: category || 'announcement',
      priority: priority || 'normal'
    });

    await post.populate('author', 'name email department');

    res.status(201).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPosts = async (req, res) => {
  try {
    const { department, year, class: className } = req.query;
    const user = await User.findById(req.user._id);
    
    let filter = { isPublished: true };
    
    // Students see posts relevant to them
    if (user.role === 'student') {
      filter.$or = [
        { targetType: 'all' },
        { targetDepartment: user.department },
        { targetDepartment: user.department, targetYear: user.year },
        { targetYear: user.year }
      ];
    }
    // Teachers see all their posts
    else if (user.role === 'faculty') {
      filter.author = user._id;
    }

    const posts = await Post.find(filter)
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Only author or admin can delete
    if (post.author.toString() !== req.user._id.toString()) {
      const user = await User.findById(req.user._id);
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createPost, getPosts, getMyPosts, deletePost };