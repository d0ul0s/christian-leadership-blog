const User = require('../models/User');
const Article = require('../models/Article');

// Basic "auth" middleware - expects userId in headers or body
// In a real app, this would be JWT verification
const protect = async (req, res, next) => {
  const userId = req.headers['x-user-id'] || req.body.userId;
  if (!userId) return res.status(401).json({ message: 'Not authorized, no user ID' });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ message: 'User not found' });
    
    // Hardcoded bypass for the primary persona to ensure they are never locked out
    if (user.email.toLowerCase() === 'exact-subzero-jury@duck.com') {
      user.role = 'superadmin';
      user.isAdmin = true;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Not authorized' });
  }
};

// Restrict to specific roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }
    next();
  };
};

// Check if user is owner of the article OR has higher role (editor/superadmin)
const canManageArticle = async (req, res, next) => {
  try {
    const article = await Article.findOne({ articleId: req.params.id });
    if (!article) return res.status(404).json({ message: 'Article not found' });

    const isOwner = article.createdBy && article.createdBy.toString() === req.user._id.toString();
    const isHigherRole = ['superadmin', 'editor'].includes(req.user.role);

    if (!isOwner && !isHigherRole) {
      return res.status(403).json({ message: 'You can only manage your own articles or you need editor permissions' });
    }

    req.article = article; // Pass article to next middleware
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

module.exports = { protect, restrictTo, canManageArticle };
