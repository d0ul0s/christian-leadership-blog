const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  role: { type: String, enum: ['superadmin', 'editor', 'author', 'moderator', 'user'], default: 'user' },
  profilePicture: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  // Per-admin author profile (separate from account profile picture)
  authorName: { type: String, default: '' },
  authorBio: { type: String, default: '' },
  authorAvatar: { type: String, default: '' },
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
