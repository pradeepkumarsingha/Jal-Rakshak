const ChatSession = require('../models/ChatSession');
const { aiService } = require('../services');
const { successResponse, errorResponse } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * @desc    Chat with Jal Rakshak AI Flood Intelligence Assistant
 * @route   POST /api/v1/assistant/chat
 * @access  Private / Public
 */
const chat = async (req, res, next) => {
  try {
    const {
      message,
      language = 'en',
      chat_history = [],
      history = [],
      location,
      userLocation,
      sessionId,
    } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please provide a message string',
        },
      });
    }

    const loc = userLocation || location;

    // Normalize chat history
    const normalizedHistory = (chat_history.length > 0 ? chat_history : history).map((msg) => ({
      role: msg.role || (msg.sender === 'user' ? 'user' : 'assistant'),
      content: msg.content || msg.text || '',
    }));

    // Call AI Service
    const aiResult = await aiService.chat({
      message: message.trim(),
      language,
      chat_history: normalizedHistory,
      location: loc,
    });

    const responsePayload = {
      message: aiResult.reply,
      reply: aiResult.reply,
      citations: aiResult.citations || [
        'National Disaster Management Authority (NDMA) Guidelines on Flood Management (2024)',
        'Central Water Commission (CWC) Standard Operating Procedures',
      ],
      suggestedActions: aiResult.suggestedActions || [],
      nearest_shelters: aiResult.nearest_shelters || [],
      helplines: aiResult.helplines || { Emergency: '112', NDRF: '1078', SDRF: '1070' },
      disclaimer: 'AI assistant provides guidance based on official NDMA/CWC protocols. For immediate life-threatening situations, use SOS or call 112 / 1078.',
      timestamp: new Date().toISOString(),
    };

    // Optionally persist chat session if user is logged in
    if (req.user && (req.user.id || req.user._id)) {
      try {
        await ChatSession.create({
          user: req.user.id || req.user._id,
          language,
          location: loc,
          messages: [
            ...normalizedHistory,
            { role: 'user', content: message.trim() },
            {
              role: 'assistant',
              content: aiResult.reply,
              citations: responsePayload.citations,
              suggestedActions: responsePayload.suggestedActions,
            },
          ],
        });
      } catch (saveErr) {
        logger.warn(`Could not persist chat session: ${saveErr.message}`);
      }
    }

    return res.status(200).json({
      success: true,
      data: responsePayload,
      ...responsePayload, // Direct properties for backward compatibility
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's chat sessions
 * @route   GET /api/v1/assistant/sessions
 * @access  Private
 */
const getSessions = async (req, res, next) => {
  try {
    const sessions = await ChatSession.find({ user: req.user ? req.user.id || req.user._id : null }).sort({
      updatedAt: -1,
    });
    return successResponse(res, sessions, 'Chat history sessions retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  chat,
  getSessions,
};
