const mongoose = require('mongoose');

const conversationSchema = mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastMessage: {
    type: String,
    default: ''
  },
  lastSender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Conversation', conversationSchema);
