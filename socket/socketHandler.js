const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');

const setupSocket = (io) => {
    // Store connected users
    const connectedUsers = new Map(); // userId -> socketId
    const usersOpenedChats = new Map();

    // Socket.IO middleware for authentication
    // io.use(async (socket, next) => {
    //     try {
    //         const token = socket.handshake.auth.token;

    //         if (!token) {
    //             return next(new Error('Authentication token required'));
    //         }

    //         const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //         const user = await User.findById(decoded.userId);
    1
    //         if (!user) {
    //             return next(new Error('User not found'));
    //         }

    //         socket.userId = user._id.toString();
    //         socket.username = user.username;
    //         next();
    //     } catch (error) {
    //         next(new Error('Invalid authentication token'));
    //     }
    // });

    io.on('connection', async (socket) => {
        const { userId, username } = socket.handshake.auth;

        socket.userId = userId;
        socket.username = username;

        console.log('socket:', socket.handshake.auth);
        console.log(`User connected: ${socket.username} (${socket.userId})`);

        // Store connected user
        connectedUsers.set(socket.userId, socket.id);

        // Update user online status
        await User.findByIdAndUpdate(socket.userId, {
            online: true,
            lastSeen: new Date()
        });

        // Notify all users about online status
        io.emit('user_status', {
            userId: socket.userId,
            online: true
        });

        // Join user to their personal room
        socket.join(socket.userId);

        // Handle joining a chat room
        socket.on('join_chat', async (chatId) => {
            try {
                // Verify user is participant in this chat
                const chat = await Chat.findOne({
                    _id: chatId,
                    participants: socket.userId
                });

                if (chat) {
                    socket.join(chatId);
                    console.log(`${socket.username} joined chat: ${chatId}`);

                    usersOpenedChats.set(socket.userId, chatId);
                }
            } catch (error) {
                console.error('Join chat error:', error);
            }
        });

        // Handle sending a message
        socket.on('send_message', async (data) => {
            try {
                const { chatId, content, type } = data;

                // Verify user is participant in this chat
                const chat = await Chat.findOne({
                    _id: chatId,
                    participants: socket.userId
                });

                if (!chat) {
                    socket.emit('error', { message: 'Chat not found or unauthorized' });
                    return;
                }

                // Create message
                const message = new Message({
                    chat: chatId,
                    sender: socket.userId,
                    content: content.trim(),
                    type: type || 'text'
                });

                await message.save();
                await message.populate('sender', 'username');

                // Update chat's last message and timestamp
                chat.lastMessage = message._id;
                chat.updatedAt = new Date();
                await chat.save();

                // Emit message to all users in the chat room except sender
                const participants = chat.participants.map(participantId => participantId.toString());

                participants.forEach(async (participantId) => {
                    if (participantId === socket.userId) return; // Skip sender

                    const participantSocketId = connectedUsers.get(participantId);
                    if (participantSocketId) {
                        // Mark as read if chat opened for online users
                        const participantOpenedChatId = usersOpenedChats.get(participantId);
                        if (participantOpenedChatId === chatId) {
                            message.read = true;
                            await message.save();

                            const senderSocketId = connectedUsers.get(socket.userId);
                            io.to(senderSocketId).emit('message_read', {
                                message: {
                                    _id: message._id,
                                    chat: message.chat,
                                    read: message.read,
                                    readBy: participantId
                                }
                            })
                        }

                        io.to(participantSocketId).emit('new_message', {
                            message: {
                                _id: message._id,
                                chat: message.chat,
                                sender: message.sender,
                                content: message.content,
                                type: message.type,
                                read: message.read,
                                createdAt: message.createdAt
                            }
                        });
                    } else {
                        // User is offline, could implement push notification here
                    }
                });

                // Notify participants about chat update
                chat.participants.forEach(participantId => {
                    io.to(participantId.toString()).emit('chat_updated', {
                        chatId: chatId,
                        lastMessage: message
                    });
                });

            } catch (error) {
                console.error('Send message error:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Handle sending an image
        socket.on('send_image', async (data) => {
            try {
                const { chatId, imageData, isImage } = data;

                // Verify user is participant in this chat
                const chat = await Chat.findOne({
                    _id: chatId,
                    participants: socket.userId
                });

                if (!chat) {
                    socket.emit('error', { message: 'Chat not found or unauthorized' });
                    return;
                }

                // Create message
                const message = new Message({
                    chat: chatId,
                    sender: socket.userId,
                    content: imageData,
                    isImage: isImage || false
                });

                await message.save();
                await message.populate('sender', 'username');

                // Update chat's last message and timestamp
                chat.lastMessage = message._id;
                chat.updatedAt = new Date();
                await chat.save();

                // Emit message to all users in the chat room except sender
                const participants = chat.participants.map(participantId => participantId.toString());

                participants.forEach(async (participantId) => {
                    if (participantId === socket.userId) return; // Skip sender
                    const participantSocketId = connectedUsers.get(participantId);

                    if (participantSocketId) {
                        // Mark as read if chat opened for online users
                        const participantOpenedChatId = usersOpenedChats.get(participantId);
                        if (participantOpenedChatId === chatId) {
                            message.read = true;
                            await message.save();

                            const senderSocketId = connectedUsers.get(socket.userId);
                            io.to(senderSocketId).emit('message_read', {
                                message: {
                                    _id: message._id,
                                    chat: message.chat,
                                    read: message.read,
                                    readBy: participantId
                                }
                            })
                        }

                        io.to(participantSocketId).emit('new_message', {
                            message: {
                                _id: message._id,
                                chat: message.chat,
                                sender: message.sender,
                                content: message.content,
                                read: message.read,
                                createdAt: message.createdAt
                            }
                        });
                    } else {
                        // User is offline, could implement push notification here
                    }
                });

                // Notify participants about chat update
                chat.participants.forEach(participantId => {
                    io.to(participantId.toString()).emit('chat_updated', {
                        chatId: chatId,
                        lastMessage: message
                    });
                });

            } catch (error) {
                console.error('Send message error:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        })

        // Handle typing indicator
        socket.on('typing', (data) => {
            const { chatId, isTyping } = data;
            socket.to(chatId).emit('user_typing', {
                userId: socket.userId,
                username: socket.username,
                isTyping
            });
        });

        // Handle marking messages as read
        socket.on('mark_read', async (data) => {
            try {
                const { chatId } = data;

                console.log(`Marking messages as read in chat: ${chatId} by user: ${socket.userId}`);

                await Message.updateMany(
                    {
                        chat: chatId,
                        sender: { $ne: socket.userId },
                        read: false
                    },
                    { read: true }
                );

                console.log('Messages marked as read');

                const chat = await Chat.findById(chatId);

                if (!chat) {
                    console.error('Chat not found for marking read:', chatId);
                    return;
                }

                socket.to(chatId).emit('messages_read', {
                    chatId,
                    readBy: socket.userId
                    // readBy: chat?.participants?.filter(id => id.toString() !== socket.userId)[0]
                });
            } catch (error) {
                console.error('Mark read error:', error);
            }
        });

        // Handle disconnection
        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${socket.username} (${socket.userId})`);

            // Remove from connected users
            connectedUsers.delete(socket.userId);
            usersOpenedChats.delete(socket.userId);

            // Update user online status
            await User.findByIdAndUpdate(socket.userId, {
                online: false,
                lastSeen: new Date()
            });

            // Notify all users about offline status
            io.emit('user_status', {
                userId: socket.userId,
                online: false
            });
        });
    });
};

module.exports = setupSocket;
