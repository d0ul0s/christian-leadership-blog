const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const DirectMessage = require('../models/DirectMessage');
const { protect } = require('../middleware/auth');

// GET /api/conversations - List user's conversations
router.get('/', protect, async (req, res) => {
  try {
    const userConversations = await Conversation.find({
      participants: req.user._id
    })
    .populate('participants', 'fullName profilePicture role')
    .sort({ updatedAt: -1 });
    
    res.json(userConversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/conversations - Find or Create conversation between two users
router.post('/', protect, async (req, res) => {
  try {
    const { participantId } = req.body;
    if (!participantId) return res.status(400).json({ message: 'Participant ID is required' });

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId], $size: 2 }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, participantId]
      });
      await conversation.populate('participants', 'fullName profilePicture role');
    }

    res.status(201).json(conversation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/conversations/unread-count
router.get('/unread-count', protect, async (req, res) => {
  try {
    // Simplified: Count conversations where the last message was not by the current user 
    // AND the user hasn't read the latest messages in that conversation.
    // Real implementation should be more granular, but for now we'll check unreadCount map.
    const conversations = await Conversation.find({ participants: req.user._id });
    let totalUnread = 0;
    conversations.forEach(c => {
      const count = c.unreadCount.get(req.user._id.toString()) || 0;
      totalUnread += count;
    });
    res.json({ count: totalUnread });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
