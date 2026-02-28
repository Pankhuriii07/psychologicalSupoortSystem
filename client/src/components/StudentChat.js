import React, { useState, useEffect } from 'react'; // useEffect ko yahan import karein
import axios from 'axios';
import io from 'socket.io-client';

// Socket connection component ke bahar bhi reh sakta hai, lekin initialization andar behtar hai
const socket = io.connect("https://psychologicalsupoortsystem-2.onrender.com");

const StudentChat = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [riskAlert, setRiskAlert] = useState(false);
    const studentId = 'student_123'; // Hardcoded for now

    // --- YEH SECTION ANDAR HONA CHAHIYE ---
    useEffect(() => {
        // 1. Backend ko batao ki ye student online hai
        socket.emit("join_chat", studentId);

        // 2. Real-time messages receive karne ke liye listener
        socket.on("receive_message", (data) => {
            setMessages((prev) => [...prev, data]);
        });

        // Cleanup function taaki duplicate messages na aayein
        return () => socket.off("receive_message");
    }, [studentId]);

    useEffect(() => {
    const loadHistory = async () => {
        const res = await axios.get(`https://psychologicalsupoortsystem-2.onrender.com/api/chat/${studentId}`);
        setMessages(res.data);
    };
    loadHistory();
    // ... baki socket logic ...
}, []);

    const sendMessage = async () => {
        if (!input) return;

        // Message object banayein
        const userMsg = { sender: 'user', text: input };
        
        // UI ko turant update karein
        setMessages((prev) => [...prev, userMsg]);
        
        const currentInput = input;
        setInput(''); 

        try {
            const res = await axios.post('https://psychologicalsupoortsystem-2.onrender.com/api/chat', {
                studentId: studentId,
                message: currentInput
            });

            // AI ka response UI mein add karne ki zaroorat nahi agar hum socket use kar rahe hain,
            // lekin agar socket sirf therapist ke liye hai, toh ye line rehne dein:
            setMessages((prev) => [...prev, { sender: 'ai', text: res.data.reply }]);

            if (res.data.riskLevel === 'red') {
                setRiskAlert(true);
            }

        } catch (err) {
            console.error("Chat error:", err);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
            <h2>Psychological Support AI</h2>
            
            {riskAlert && (
                <div style={{ backgroundColor: '#fee2e2', padding: '15px', border: '1px solid #ef4444', color: '#b91c1c', borderRadius: '8px', marginBottom: '15px' }}>
                    <strong>SOS:</strong> Humne aapki pareshani ko detect kiya hai. Ek counselor ko alert bhej diya gaya hai.
                </div>
            )}

            <div style={{ border: '1px solid #e5e7eb', height: '400px', overflowY: 'scroll', padding: '15px', marginBottom: '10px', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                {messages.map((msg, index) => (
                    <div key={index} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left', margin: '10px 0' }}>
                        <div style={{ 
                            backgroundColor: msg.sender === 'user' ? '#3b82f6' : '#ffffff', 
                            color: msg.sender === 'user' ? 'white' : 'black',
                            padding: '10px 15px', 
                            borderRadius: '15px',
                            display: 'inline-block',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            maxWidth: '80%'
                        }}>
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Apni pareshani likhein..."
                    style={{ flex: 1, padding: '12px', borderRadius: '25px', border: '1px solid #d1d5db', outline: 'none' }}
                />
                <button onClick={sendMessage} style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer' }}>
                    Send
                </button>
            </div>
        </div>
    );
};

export default StudentChat;