const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../config/email');

// Helper to generate 6-digit code
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, profilePicture } = req.body;
    
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const isOwner = email.trim().toLowerCase() === 'exact-subzero-jury@duck.com';
    const isAdmin = isOwner;
    const verificationCode = generateCode();

    const user = await User.create({
      fullName,
      email,
      password,
      isAdmin,
      profilePicture: profilePicture || '',
      isVerified: isOwner, 
      verificationCode: isOwner ? null : verificationCode
    });
    
    if (user) {
      if (isOwner) {
         return res.status(201).json({
           _id: user._id,
           fullName: user.fullName,
           email: user.email,
           isAdmin: user.isAdmin,
           role: user.role,
           profilePicture: user.profilePicture,
           authorName: user.authorName,
           authorBio: user.authorBio,
           authorAvatar: user.authorAvatar,
           isVerified: true,
           message: "User successfully registered!"
         });
      }

      await sendVerificationEmail(user.email, verificationCode);

      res.status(201).json({
        message: "Verification code sent to email",
        requiresVerification: true,
        userId: user._id
      });
    } else {
      res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
});

// POST /api/auth/verify
router.post('/verify', async (req, res) => {
  try {
    const { userId, code } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });
    
    if (user.verificationCode !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
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
      message: 'Email verified successfully!'
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

// POST /api/auth/resend-code
router.post('/resend-code', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Already verified' });

    const newCode = generateCode();
    user.verificationCode = newCode;
    await user.save();
    
    await sendVerificationEmail(user.email, newCode);
    res.json({ message: 'Verification code resent' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register first.' });
    }
    
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ 
        message: 'Please verify your email address to log in.',
        requiresVerification: true,
        userId: user._id
      });
    }
    
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
      message: 'Login successful!'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'No account found with that email' });

    const resetToken = generateCode();
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 30 * 60 * 1000; // 30 mins
    await user.save();

    await sendPasswordResetEmail(user.email, resetToken);
    res.json({ message: 'Password reset code sent to your email.' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      resetToken: code,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password has been safely reset. You may now log in.' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

module.exports = router;
