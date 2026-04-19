const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const { protect, restrictTo, canManageArticle } = require('../middleware/auth');

// GET /api/articles (Public Feed)
router.get('/', async (req, res) => {
  try {
    // Only show published articles for the public feed
    const articles = await Article.find({ status: 'published' }).sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/articles/admin/all (Admin Feed - includes drafts)
router.get('/admin/all', protect, async (req, res) => {
  try {
    let query = {};
    // Authors only see their own articles in the dashboard
    if (req.user.role === 'author') {
      query.createdBy = req.user._id;
    }
    const articles = await Article.find(query).sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/articles/:id
router.get('/:id', async (req, res) => {
  try {
    let article = await Article.findOne({ articleId: req.params.id })
      .populate('createdBy', 'authorName authorBio authorAvatar');
    
    // Automatically seed the first article if trying to visit the original demo
    if (!article && req.params.id === 'servant-leadership-modern') {
      article = await Article.create({
        articleId: 'servant-leadership-modern',
        title: 'Servant Leadership in a Modern World',
        excerpt: 'Exploring the biblical model of downward mobility in an age obsessed with platform and power.',
        content: `The world's definition of leadership is almost universally tied to upward mobility. Up the corporate ladder, up the org chart, up the social hierarchy. Influence is directly correlated with how many people report to you, how large your budget is, or the size of your latest funding round.\n\nYet, when we examine the most profound leadership lesson in human history—found not in a textbook, but in the upper room—the trajectory is precisely the opposite. The incarnate God took off His outer garments, wrapped a towel around His waist, and washed the filthy feet of His followers (John 13:1-17).\n\nTo understand Evangelical Christian leadership, we must first grapple with the concept of kenosis. In Philippians 2:5-8, Paul writes that Christ "emptied Himself, taking the form of a servant." True leadership in the Kingdom does not look like graspable divinity; it looks like voluntary self-emptying.\n\nIn the modern corporate structure, the goal is often self-actualization and self-protection. The Christian leader, however, is called to self-donation. Our authority is given not for our own aggrandizement, but for the flourishing of those placed under our care.`,
        category: 'Theology',
        readTime: '8 min read',
        isPublished: true,
        likes: [],
        comments: []
      });
    }

    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/articles
router.post('/', protect, restrictTo('superadmin', 'editor', 'author'), async (req, res) => {
  try {
    const { articleId, title, excerpt, content, category, readTime, coverImage, authorName, authorBio, authorAvatar, status } = req.body;
    
    const exists = await Article.findOne({ articleId });
    if (exists) return res.status(400).json({ message: 'An article with this URL slug already exists' });

    // Enforce workflow: Authors can only save as draft or pending
    let targetStatus = status || 'draft';
    if (req.user.role === 'author' && targetStatus === 'published') {
      targetStatus = 'pending'; // Authors need approval
    }

    const article = await Article.create({
      articleId, title, excerpt, content, category, readTime, coverImage, authorName, authorBio, authorAvatar, 
      status: targetStatus,
      isPublished: targetStatus === 'published',
      createdBy: req.user._id
    });
    
    res.status(201).json(article);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/articles/:id
router.put('/:id', protect, canManageArticle, async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates._id;
    delete updates.__v;
    delete updates.createdBy;

    if (updates.status) {
      if (req.user.role === 'author' && updates.status === 'published') {
        updates.status = 'pending';
      }
      updates.isPublished = updates.status === 'published';
    }

    Object.assign(req.article, updates);
    await req.article.save();
    res.json(req.article);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/articles/:id
router.delete('/:id', protect, canManageArticle, async (req, res) => {
  try {
    await Article.findOneAndDelete({ articleId: req.params.id });
    res.json({ message: 'Article deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// -------------------------------
// INTERACTION ROUTES (Likes/Comments)
// -------------------------------

router.post('/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'User ID is required' });
    
    const article = await Article.findOne({ articleId: req.params.id });
    if (!article) return res.status(404).json({ message: 'Article not found' });
    
    const index = article.likes.indexOf(userId);
    if (index === -1) {
      article.likes.push(userId); 
    } else {
      article.likes.splice(index, 1); 
    }
    
    await article.save();
    res.json(article);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/comment', async (req, res) => {
  try {
    const { userId, fullName, text, parentId } = req.body;
    if (!userId || !text || !fullName) {
      return res.status(400).json({ message: 'User ID, Full Name, and Comment text are required' });
    }
    
    const article = await Article.findOne({ articleId: req.params.id });
    if (!article) return res.status(404).json({ message: 'Article not found' });
    
    article.comments.push({ user: userId, fullName, text, parentId: parentId || null });
    await article.save();
    
    res.json(article);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id/comment/:commentId', async (req, res) => {
  try {
    const { userId, isAdmin } = req.body;
    if (!userId) return res.status(400).json({ message: 'User ID required' });
    
    const article = await Article.findOne({ articleId: req.params.id });
    if (!article) return res.status(404).json({ message: 'Article not found' });
    
    const comment = article.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    
    // Allow if the user is the comment author OR if they are an admin
    if (!isAdmin && comment.user.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
    
    article.comments.pull(req.params.commentId);
    await article.save();
    res.json(article);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/comment/:commentId/like', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'User ID required' });
    
    const article = await Article.findOne({ articleId: req.params.id });
    if (!article) return res.status(404).json({ message: 'Article not found' });
    
    const comment = article.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    
    const index = comment.likes.indexOf(userId);
    if (index === -1) {
      comment.likes.push(userId);
    } else {
      comment.likes.splice(index, 1);
    }
    
    await article.save();
    res.json(article);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
