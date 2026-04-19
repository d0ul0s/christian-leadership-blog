const express = require('express');
const router = express.Router();
const DirectMessage = require('../models/DirectMessage');
const Conversation = require('../models/Conversation');
const { protect } = require('../middleware/auth');

// GET /api/direct-messages/:conversationId - Get messages for a thread
router.get('/:conversationId', protect, async (req, res) => {
  try {
    const messages = await DirectMessage.find({ 
      conversationId: req.params.conversationId 
    }).sort({ createdAt: 1 });
    
    // Mark as read (simplified)
    await DirectMessage.updateMany(
      { conversationId: req.params.conversationId, sender: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/direct-messages - Send a message
router.post('/', protect, async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    if (!conversationId || !text) return res.status(400).json({ message: 'Incomplete message data' });

    const message = await DirectMessage.create({
      conversationId,
      sender: req.user._id,
      text
    });

    // Update conversation metadata
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text,
      lastSender: req.user._id,
      updatedAt: Date.now()
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
