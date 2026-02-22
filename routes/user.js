const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all users (for finding people to chat with)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const users = await User.find({
            _id: { $ne: req.userId } // Exclude current user
        }).select('username email online lastSeen');

        res.json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Server error fetching users' });
    }
});

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        res.json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Server error fetching profile' });
    }
});

module.exports = router;
