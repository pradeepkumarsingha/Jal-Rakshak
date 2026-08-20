const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
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
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const ChatSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    language: {
      type: String,
      enum: ['en', 'hi', 'or'],
      default: 'en',
    },
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
      district: String,
      state: String,
    },
    scenario: {
      type: String,
      default: 'Live Real-Time Monitoring',
    },
    messages: [ChatMessageSchema],
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
  }
);

ChatSessionSchema.pre('save', function (next) {
  if (!this.sessionId) {
    this.sessionId = `CHAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

module.exports = mongoose.model('ChatSession', ChatSessionSchema);
