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
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600">
    <div className="bg-white p-8 rounded-2xl shadow-xl w-96">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Login
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Login
        </button>
      </form>

      <p className="text-center mt-4 text-gray-600">
        Don't have an account?{" "}
        <span
          className="text-blue-600 cursor-pointer hover:underline"
          onClick={() => navigate("/register")}
        >
          Register
        </span>
      </p>
    </div>
  </div>
);
};

export default Login;