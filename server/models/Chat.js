// server/models/Chat.js
const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    studentId: { type: String, required: true }, // In real app, hash this!
    messages: [
        {
            sender: { type: String, enum: ['user', 'ai', 'therapist'] },
            text: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
        }
    ],
    // The "Traffic Light" system for therapists
    riskLevel: { type: String, enum: ['green', 'yellow', 'red'], default: 'green' },
    isFlagged: { type: Boolean, default: false }
});

module.exports = mongoose.model('Chat', ChatSchema);