const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Ensure only 2 participants per chat
chatSchema.pre('save', function (next) {
    if (this.participants.length !== 2) {
        next(new Error('Chat must have exactly 2 participants'));
    } else {
        next();
    }
});

// Create index to prevent duplicate chats between same users
chatSchema.index({ participants: 1 });

module.exports = mongoose.model('Chat', chatSchema);
