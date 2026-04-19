const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { sendContactEmail } = require('../config/email');

// POST /api/messages - Save a new message
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }

    // 1. Save to database
    await Message.create({ name, email, subject, message });

    // 2. Send the email directly to the Admin
    await sendContactEmail(name, email, subject, message);

    res.status(201).json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
  }
});

// GET /api/messages - Fetch all messages
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
});

// DELETE /api/messages/:id - Delete a message
router.delete('/:id', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
});

module.exports = router;
