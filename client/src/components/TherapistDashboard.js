import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io.connect("http://localhost:5000");

const TherapistDashboard = () => {
    const [flaggedChats, setFlaggedChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [reply, setReply] = useState('');
    const [loading, setLoading] = useState(true);

    // 1. Token ko yahan define kiya taaki crash na ho
    const token = localStorage.getItem('token'); 

    useEffect(() => {
        const fetchChats = async () => {
            try {
                // Agar token nahi hai toh request na bhejein
                if (!token) {
                    console.error("No token found!");
                    setLoading(false);
                    return;
                }

                const res = await axios.get('http://localhost:5000/api/therapist/flagged', {
                    headers: { 'x-auth-token': token }
                });
                setFlaggedChats(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching chats:", err);
                setLoading(false);
            }
        };
        fetchChats();

        socket.on("receive_message", (data) => {
            setSelectedChat(prev => {
                if (prev && prev.studentId === data.studentId) {
                    return { ...prev, messages: [...prev.messages, data] };
                }
                return prev;
            });
        });

        return () => socket.off("receive_message");
    }, [token]);

    const openChat = (chat) => {
        setSelectedChat(chat);
        socket.emit("join_chat", chat.studentId);
    };

    const sendTherapistMessage = () => {
        if (!reply || !selectedChat) return;
        const msgData = { 
            studentId: selectedChat.studentId, 
            text: reply, 
            sender: 'therapist' 
        };
        socket.emit("send_message", msgData);
        setSelectedChat(prev => ({
            ...prev, 
            messages: [...prev.messages, msgData]
        }));
        setReply('');
    };

    if (loading) return <h2 style={{padding: '20px'}}>Loading Dashboard...</h2>;

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            <h1>Counselor Intervention Panel</h1>
            
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f4f4f4' }}>
                        <th>Student ID</th>
                        <th>Risk Level</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {/* UI Fix Logic */}
                    {flaggedChats && flaggedChats.length > 0 ? (
                        flaggedChats.map(chat => (
                            <tr key={chat._id} style={{ borderLeft: chat.riskLevel === 'red' ? '10px solid red' : '10px solid orange' }}>
                                <td>{chat.studentId}</td>
                                <td><strong style={{ color: chat.riskLevel === 'red' ? 'red' : 'orange' }}>{chat.riskLevel?.toUpperCase()}</strong></td>
                                <td>{chat.isFlagged ? "⚠️ Intervention Needed" : "Resolved"}</td>
                                <td>
                                    <button onClick={() => openChat(chat)} style={{ cursor: 'pointer', padding: '5px 10px' }}>
                                        Intervene Now
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                                No flagged chats found. Student side se "kill" keyword bhej kar test karein.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {selectedChat && (
                <div style={{ marginTop: '20px', padding: '20px', border: '2px solid #3b82f6', borderRadius: '10px', backgroundColor: '#f0f7ff' }}>
                    <h3>Live Intervention: {selectedChat.studentId}</h3>
                    <div style={{ height: '300px', overflowY: 'scroll', backgroundColor: 'white', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
                        {selectedChat.messages.map((m, i) => (
                            <div key={i} style={{ textAlign: m.sender === 'therapist' ? 'right' : 'left', margin: '10px 0' }}>
                                <span style={{ 
                                    padding: '8px 12px', 
                                    borderRadius: '10px', 
                                    display: 'inline-block',
                                    backgroundColor: m.sender === 'therapist' ? '#dcfce7' : '#f3f4f6' 
                                }}>
                                    <strong>{m.sender}:</strong> {m.text}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: '10px' }}>
                        <input 
                            value={reply} 
                            onChange={(e) => setReply(e.target.value)}
                            placeholder="Type your message..."
                            style={{ width: '70%', padding: '10px' }}
                        />
                        <button onClick={sendTherapistMessage} style={{ padding: '10px', marginLeft: '10px', backgroundColor: '#22c55e', color: 'white' }}>
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TherapistDashboard;