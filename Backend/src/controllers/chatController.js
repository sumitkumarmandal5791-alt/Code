const { User } = require('../Modles/user');
const Conversation = require('../Modles/conversation');
const Message = require('../Modles/message');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user._id } })
            .select('firstName lastName emailId');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const startConversation = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        if (!targetUserId) {
            return res.status(400).json({ error: 'targetUserId is required' });
        }

        // Find existing conversation with exact match of both participants
        let conversation = await Conversation.findOne({
            participants: { $all: [req.user._id, targetUserId], $size: 2 }
        }).populate('participants', 'firstName lastName emailId');

        if (!conversation) {
            conversation = new Conversation({
                participants: [req.user._id, targetUserId]
            });
            await conversation.save();
            conversation = await Conversation.findById(conversation._id)
                .populate('participants', 'firstName lastName emailId');
        }

        res.status(200).json(conversation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user._id
        })
        .populate('participants', 'firstName lastName emailId')
        .sort({ updatedAt: -1 });

        res.status(200).json(conversations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({ conversationId })
            .sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Message text is required' });
        }

        const message = new Message({
            conversationId,
            sender: req.user._id,
            text
        });

        await message.save();

        // Update the conversation's last message info
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: {
                text,
                sender: req.user._id,
                createdAt: new Date()
            }
        });

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllUsers,
    startConversation,
    getConversations,
    getMessages,
    sendMessage
};
