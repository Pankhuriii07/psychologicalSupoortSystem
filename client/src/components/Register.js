import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student'
    });

    // ✅ FIXED handleChange
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // ✅ Only ONE handleSubmit
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.post(
                'https://psychologicalsupoortsystem-2.onrender.com/api/auth/register',
                formData
            );

            alert("Registration Successful!");
            navigate('/login');

        } catch (err) {
            alert(
                "Error: " +
                (err.response?.data?.error || "Something went wrong")
            );
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-96">
                <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
                    Register
                </h2>

                

                <form onSubmit={handleSubmit} className="space-y-4">

                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    <option value="student">Student</option>
                    <option value="therapist">Therapist</option>
                </select>

                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />

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
                        Register
                    </button>

                </form>

                <p className="text-center mt-4 text-gray-600">
                    Already have an account?{" "}
                    <span
                        className="text-blue-600 cursor-pointer hover:underline"
                        onClick={() => navigate("/login")}
                    >
                        Login
                    </span>
                </p>

            </div>
        </div>
    );
};

export default Register;