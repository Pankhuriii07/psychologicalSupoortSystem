import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Login.js ke handleLogin function ke andar:
    const handleLogin = async (e) => {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });

        // Save token and role
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.user.role);

        // Role-based redirection
        if (res.data.user.role === 'therapist') {
            navigate('/therapist-dashboard');
        } 
        else if (res.data.user.role === 'student') {
            navigate('/StudentChat');   // ✅ Add student page route
        }
        else {
            navigate('/'); // fallback
        }

    } catch (err) {
        alert("Login failed!");
    }
};

    const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const res = await axios.post(
            'http://localhost:5000/api/auth/login',
            formData
        );

        // ✅ Save token
        localStorage.setItem('token', res.data.token);

        // ✅ Save role (VERY IMPORTANT)
        localStorage.setItem('role', res.data.user.role);

        alert("Login Successful!");

        // ✅ Redirect based on role
        if (res.data.user.role === 'therapist') {
            navigate('/therapist-dashboard');
        } else {
            navigate('/chat');
        }

    } catch (err) {
        const errorMsg =
            err.response?.data?.error ||
            "Login failed. Please check your connection.";
        alert("Error: " + errorMsg);
        console.error(err);
    }
};

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2 style={{ textAlign: 'center' }}>Login to PSS</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label>Email:</label>
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="Enter your email" 
                        onChange={handleChange} 
                        required 
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="Enter your password" 
                        onChange={handleChange} 
                        required 
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>
                <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Login
                </button>
            </form>
            <p style={{ marginTop: '15px', textAlign: 'center' }}>
                Don't have an account? <span style={{ color: 'blue', cursor: 'pointer' }} onClick={() => navigate('/register')}>Register here</span>
            </p>
        </div>
    );
};

export default Login;