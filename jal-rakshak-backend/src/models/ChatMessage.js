const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatSession',
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: 'en',
    },
    citations: [
      {
        type: String,
      },
    ],
    suggestedActions: [
      {
        label: String,
        link: String,
        phone: String,
        urgent: Boolean,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
