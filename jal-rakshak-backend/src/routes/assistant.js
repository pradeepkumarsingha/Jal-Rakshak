const express = require('express');
const { chat, getSessions } = require('../controllers/assistantController');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/chat', optionalAuth, chat);
router.get('/sessions', protect, getSessions);

module.exports = router;
