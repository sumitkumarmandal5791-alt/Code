const express = require('express');
const router = express.Router();
const { validateToken } = require('../middleware/userMiddleware');
const {
    getAllUsers,
    startConversation,
    getConversations,
    getMessages,
    sendMessage
} = require('../controllers/chatController');

router.use(validateToken);

router.get('/users', getAllUsers);
router.get('/conversations', getConversations);
router.post('/conversations', startConversation);
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/conversations/:conversationId/messages', sendMessage);

module.exports = router;
