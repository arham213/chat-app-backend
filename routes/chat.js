const express = require('express');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const authMiddleware = require('../middleware/auth');
const { put } = require('@vercel/blob');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Get all chats for logged-in user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const chats = await Chat.find({
            participants: req.userId
        })
            .populate('participants', 'username email online lastSeen')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });

        res.json({ chats });
    } catch (error) {
        console.error('Get chats error:', error);
        res.status(500).json({ error: 'Server error fetching chats' });
    }
});

// Create or get existing chat with another user
router.post('/create', authMiddleware, async (req, res) => {
    try {
        const { participantId } = req.body;

        if (!participantId) {
            return res.status(400).json({ error: 'Participant ID is required' });
        }

        if (participantId === req.userId.toString()) {
            return res.status(400).json({ error: 'Cannot create chat with yourself' });
        }

        // Check if chat already exists
        const existingChat = await Chat.findOne({
            participants: { $all: [req.userId, participantId] }
        })
            .populate('participants', 'username email online lastSeen')
            .populate('lastMessage');

        if (existingChat) {
            return res.json({
                message: 'Chat already exists',
                chat: existingChat
            });
        }

        // Create new chat
        const chat = new Chat({
            participants: [req.userId, participantId]
        });

        await chat.save();
        await chat.populate('participants', 'username email online lastSeen');

        res.status(201).json({
            message: 'Chat created successfully',
            chat
        });
    } catch (error) {
        console.error('Create chat error:', error);
        res.status(500).json({ error: 'Server error creating chat' });
    }
});

// Get messages for a specific chat
router.get('/:chatId/messages', authMiddleware, async (req, res) => {
    try {
        const { chatId } = req.params;
        const { limit = 50, skip = 0 } = req.query;

        // Verify user is participant in this chat
        const chat = await Chat.findOne({
            _id: chatId,
            participants: req.userId
        });

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        const messages = await Message.find({ chat: chatId })
            .populate('sender', 'username')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        res.json({ messages: messages.reverse() });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Server error fetching messages' });
    }
});

router.post('/uploadImage', upload.single('image'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const blob = await put(`chat-images/${Date.now()}-${file.originalname}`, file.buffer, {
            access: 'public',
            contentType: file.mimetype
        });

        res.json({ success: true, imageUrl: blob.url });
    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({ error: 'Server error uploading image' });
    }
});

module.exports = router;
