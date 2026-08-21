const axios = require('axios');
const ChatSession = require('../models/ChatSession');
const { successResponse, errorResponse } = require('../utils/helpers');
const logger = require('../utils/logger');

const DEPLOYED_ASSISTANT_API_URL = process.env.DEPLOYED_ASSISTANT_API_URL || '';
const DEPLOYED_ASSISTANT_API_KEY = process.env.DEPLOYED_ASSISTANT_API_KEY || '';

/**
 * Handle AI Assistant reply using deployed assistant URL or domain RAG safety engine
 */
async function generateAssistantReply({ message, language = 'en', chat_history = [], location = null }) {
  if (DEPLOYED_ASSISTANT_API_URL) {
    try {
      const response = await axios.post(
        DEPLOYED_ASSISTANT_API_URL,
        {
          message,
          language,
          chat_history,
          location,
        },
        {
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json',
            ...(DEPLOYED_ASSISTANT_API_KEY ? { Authorization: `Bearer ${DEPLOYED_ASSISTANT_API_KEY}` } : {}),
          },
        }
      );
      if (response.data) {
        return {
          reply: response.data.reply || response.data.message || response.data.response,
          citations: response.data.citations || [
            'National Disaster Management Authority (NDMA) Guidelines on Flood Management',
            'Central Water Commission (CWC) Standard Operating Procedures',
          ],
          suggestedActions: response.data.suggestedActions || [],
          nearest_shelters: response.data.nearest_shelters || [],
          helplines: response.data.helplines || { Emergency: '112', NDRF: '1078', SDRF: '1070' },
        };
      }
    } catch (err) {
      logger.warn(`Deployed Assistant API unreachable (${err.message}). Using domain safety RAG fallback.`);
    }
  }

  // Built-in NDMA/CWC Multilingual Safety Knowledge Engine
  const q = message.toLowerCase();
  let reply = '';
  const citations = [
    'National Disaster Management Authority (NDMA) Guidelines on Flood Management (2024)',
    'Central Water Commission (CWC) Standard Operating Procedures',
  ];
  let suggestedActions = [];

  if (
    q.includes('purif') ||
    q.includes('clean water') ||
    q.includes('drinking water') ||
    q.includes('पानी') ||
    q.includes('ପାଣି')
  ) {
    reply = `**Safe Drinking Water Guidelines during Floods:**\n\n1. **Boil Water Rapidly:** Boil flood/tap water vigorously for at least 1-3 minutes to kill waterborne bacteria and viruses.\n2. **Halazone / Chlorine Tablets:** Use 1 chlorine tablet per 5 liters of clear water; stir and allow to stand for 30 minutes before drinking.\n3. **Do NOT Drink Contaminated Flood Water:** It carries sewage runoff, industrial effluents, and leptospirosis pathogens.\n4. **ORS Packets:** Distribute Oral Rehydration Salts to prevent severe dehydration in children and elderly.`;
    suggestedActions = [
      { label: 'Find Shelter with Water Plant', link: '/shelters' },
      { label: 'Report Contaminated Water Source', link: '/report' },
    ];
  } else if (
    q.includes('sos') ||
    q.includes('trapped') ||
    q.includes('rescue') ||
    q.includes('help') ||
    q.includes('फंसे') ||
    q.includes('ଉଦ୍ଧାର')
  ) {
    reply = `🚨 **EMERGENCY ASSISTANCE PROTOCOL:**\n\nIf you or someone nearby is trapped by rising floodwaters:\n1. **Move to highest available floor / rooftop immediately.**\n2. **Do not enter fast-flowing water on foot or vehicles.**\n3. **Use the Jal Rakshak SOS Wizard** below to transmit your exact GPS coordinates to NDRF Battalion.\n4. **Signal rescuers:** Wave bright/red cloth or use phone flashlight in groups of 3 pulses (SOS).`;
    suggestedActions = [
      { label: 'LAUNCH EMERGENCY SOS BEACON NOW', link: '/emergency', urgent: true },
      { label: 'Call NDRF Helpline 1078', phone: '1078' },
    ];
  } else if (
    q.includes('shelter') ||
    q.includes('camp') ||
    q.includes('relief') ||
    q.includes('राहत') ||
    q.includes('ଆଶ୍ରୟ')
  ) {
    reply = `**Nearby Relief Camp Status:**\n\nRelief shelters provide high ground security, food rations, clean drinking water, and first-aid medical camps. You can view all nearby verified relief shelters and check real-time bed capacity from the Shelter Finder.`;
    suggestedActions = [
      { label: 'Open Relief Shelter Finder', link: '/shelters' },
      { label: 'Get Turn-by-Turn Safe Route', link: '/route' },
    ];
  } else {
    reply = `**Jal Rakshak Advisory:**\n\nStay alert for official CWC and IMD updates. Keep mobile devices fully charged in power-bank mode, prepare an emergency go-bag (documents in waterproof pouch, emergency medication, torch, dry rations for 48 hours), and monitor the live flood map for real-time inundation progression.`;
    suggestedActions = [
      { label: 'Check Local Flood Risk Index', link: '/dashboard' },
      { label: 'Report Ground Hazards', link: '/report' },
    ];
  }

  return {
    reply,
    citations,
    suggestedActions,
    nearest_shelters: [],
    helplines: { Emergency: '112', NDRF: '1078', SDRF: '1070' },
  };
}

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

    // Call Assistant
    const aiResult = await generateAssistantReply({
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
      ...responsePayload,
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
