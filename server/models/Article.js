const mongoose = require('mongoose');

const articleSchema = mongoose.Schema({
  articleId: { type: String, required: true, unique: true }, // URL slug
  title: { type: String, required: true, default: 'Untitled Article' },
  excerpt: { type: String, default: '' },
  content: { type: String, required: true, default: 'Content goes here...' },
  category: { type: String, default: 'Theology' },
  readTime: { type: String, default: '5 min read' },
  coverImage: { type: String, default: 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80' },
  authorName: { type: String, default: '' },
  authorBio: { type: String, default: '' },
  authorAvatar: { type: String, default: '' },
  isPublished: { type: Boolean, default: false }, // Keeping for legacy, now synced with status === 'published'
  status: { type: String, enum: ['draft', 'pending', 'published'], default: 'draft' },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fullName: { type: String, required: true },
    text: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    parentId: { type: mongoose.Schema.Types.ObjectId, default: null },
    date: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('Article', articleSchema);
