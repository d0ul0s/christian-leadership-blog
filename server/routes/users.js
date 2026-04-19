const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Article = require('../models/Article');
const { protect, restrictTo } = require('../middleware/auth');

// GET /api/users - Fetch all users (Superadmin only)
router.get('/', protect, restrictTo('superadmin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
});

// PUT /api/users/profile/:id - Update user profile
router.put('/profile/:id', async (req, res) => {
  try {
    const { fullName, email, currentPassword, newPassword, profilePicture, removeProfilePicture } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ message: 'Email address is already in use' });
      }
      user.email = email.toLowerCase();
    }

    if (fullName) user.fullName = fullName;
    
    // Check if changing password
    if (newPassword) {
      if (!currentPassword || user.password !== currentPassword) {
        return res.status(400).json({ message: 'Incorrect current password' });
      }
      user.password = newPassword;
    }

    // Check profile picture
    if (removeProfilePicture) {
      user.profilePicture = '';
    } else if (profilePicture !== undefined) {
      user.profilePicture = profilePicture;
    }

    await user.save();

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      isAdmin: user.isAdmin || user.email.toLowerCase() === 'exact-subzero-jury@duck.com',
      role: user.role,
      profilePicture: user.profilePicture,
      authorName: user.authorName,
      authorBio: user.authorBio,
      authorAvatar: user.authorAvatar,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
});

// PUT /api/users/:id/role - Update user role (Superadmin only + Password Gate)
router.put('/:id/role', protect, restrictTo('superadmin'), async (req, res) => {
  try {
    const { role, adminPassword } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Verify admin password for sensitive role changes
    if (req.user.password !== adminPassword) {
      return res.status(401).json({ message: 'Incorrect admin password. Action denied.' });
    }

    if (user.email.toLowerCase() === 'exact-subzero-jury@duck.com') {
      return res.status(400).json({ message: 'Cannot change role of the super admin' });
    }

    user.role = role;
    // Keep isAdmin in sync: superadmin, editor, author, moderator are all dashboard-capable
    user.isAdmin = ['superadmin', 'editor', 'author', 'moderator'].includes(role);
    
    await user.save();
    res.json({ message: 'User role updated successfully', user: { _id: user._id, fullName: user.fullName, email: user.email, role: user.role, isAdmin: user.isAdmin } });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
});

// DELETE /api/users/:id - Delete a user (Superadmin only)
router.delete('/:id', protect, restrictTo('superadmin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.email.toLowerCase() === 'exact-subzero-jury@duck.com') {
      return res.status(400).json({ message: 'Cannot delete the super admin' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
});

// DELETE /api/users/me - Self-delete with password confirmation
router.delete('/me/account', async (req, res) => {
  try {
    const { userId, password } = req.body;
    if (!userId || !password) {
      return res.status(400).json({ message: 'User ID and password are required' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.email.toLowerCase() === 'exact-subzero-jury@duck.com') {
      return res.status(400).json({ message: 'The super admin account cannot be self-deleted.' });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: 'Incorrect password. Account not deleted.' });
    }

    // Anonymize all comments by this user across all articles
    await Article.updateMany(
      { 'comments.user': userId },
      { $set: { 'comments.$[elem].fullName': 'Deleted User', 'comments.$[elem].user': null } },
      { arrayFilters: [{ 'elem.user': user._id }], multi: true }
    );

    await User.findByIdAndDelete(userId);
    res.json({ message: 'Account deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
});

// PUT /api/users/author-profile/:id - Update the admin's author profile
router.put('/author-profile/:id', async (req, res) => {
  try {
    const { authorName, authorBio, authorAvatar } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (authorName !== undefined) user.authorName = authorName;
    if (authorBio !== undefined) user.authorBio = authorBio;
    if (authorAvatar !== undefined) user.authorAvatar = authorAvatar;

    await user.save();
    res.json({ message: 'Author profile updated', authorName: user.authorName, authorBio: user.authorBio, authorAvatar: user.authorAvatar });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
});

module.exports = router;
