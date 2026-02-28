require('dotenv').config();
console.log("Server file started...");
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const Chat = require('./models/Chat');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
connectDB();

app.use(express.json());
app.use(cors());


const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Gemini Initialization
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeRisk = (text) => {
    const crisisKeywords = ['suicide', 'kill', 'die', 'hurt myself', 'end it'];
    return crisisKeywords.some(word => text.toLowerCase().includes(word));
};

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword, role });
        await user.save();
        res.status(201).json({ message: "User registered!" });
    } catch (err) {
        res.status(400).json({ error: "Email already exists" });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        console.log("User from DB:", user);
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password match:", isMatch);

        if (!isMatch) {
            return res.status(401).json({ error: "Password wrong" });
        }
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// --- UPDATED CHAT ROUTE ---
app.post('/api/chat', async (req, res) => {
    const { studentId, message } = req.body;

    try {
        let chat = await Chat.findOne({ studentId });
        if (!chat) chat = new Chat({ studentId, messages: [] });

        const isCrisis = analyzeRisk(message);
        let aiResponseText = "";

        if (isCrisis) {
            aiResponseText = "I am detecting serious distress. Please call the 988 helpline immediately. I am here for you.";
            chat.isFlagged = true;
        } else {
            try {
                // Use 'gemini-1.5-flash' which is the most reliable current model
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                // Simplified call structure
                const result = await model.generateContent(message);
                const response = await result.response;
                aiResponseText = response.text();
            } catch (aiError) {
                console.error("Gemini API Error:", aiError.message);
                // Fallback response if API fails
                aiResponseText = "I am here to listen. Tell me more about how you are feeling.";
            }
        }

        chat.messages.push({ sender: 'user', text: message });
        chat.messages.push({ sender: 'ai', text: aiResponseText });
        await chat.save();


        res.json({ reply: aiResponseText });

    } catch (error) {
        console.error("Detailed Server Error:", error);
        res.status(500).json({ error: "Something went wrong on the server." });
    }
});

app.get('/api/chat/:studentId', async (req, res) => {
    try {
        const chat = await Chat.findOne({ studentId: req.params.studentId });
        res.json(chat ? chat.messages : []);
    } catch (err) {
        res.status(500).send("History error");
    }
});

// server.js mein add karein
app.get('/api/admin/chats', async (req, res) => {
    try {
        const chats = await Chat.find().populate('studentId', 'name email');
        res.json(chats);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch chats" });
    }
});

// --- SOCKET LOGIC ---
io.on('connection', (socket) => {
    socket.on('join_chat', (studentId) => {
        socket.join(studentId);
    });

    socket.on('send_message', async (data) => {
        const { studentId, text, sender } = data;
        try {
            const chat = await Chat.findOne({ studentId });
            if (chat) {
                chat.messages.push({ sender, text });
                await chat.save();
                io.to(studentId).emit('receive_message', { studentId, text, sender });
            }
        } catch (err) {
            console.error("Socket Error:", err);
        }
    });
});

// server.js mein ye route zaroor daalein
app.get('/api/therapist/flagged', async (req, res) => {
    try {
        // Sirf wahi chats nikaalna jo flagged hain (Risk detected)
        const chats = await Chat.find({ isFlagged: true });
        res.json(chats);
    } catch (err) {
        res.status(500).json({ error: "Data fetch fail" });
    }
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));