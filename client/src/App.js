import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './components/Login';
import Register from './components/Register';
import StudentChat from './components/StudentChat';
import TherapistDashboard from './components/TherapistDashboard';

function App() {

  // Check authentication
  const isAuthenticated = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  return (
    <Router>
      <div className="App">

        <Routes>

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student Protected Route */}
          <Route
            path="/chat"
            element={
              isAuthenticated && userRole === 'student'
                ? <StudentChat />
                : <Navigate to="/login" />
            }
          />

          {/* Therapist Protected Route */}
          <Route
            path="/therapist-dashboard"
            element={
              isAuthenticated && userRole === 'therapist'
                ? <TherapistDashboard />
                : <Navigate to="/login" />
            }
          />

          {/* Default Redirect */}
          <Route
            path="/"
            element={
              isAuthenticated
                ? userRole === 'therapist'
                  ? <Navigate to="/therapist-dashboard" />
                  : <Navigate to="/chat" />
                : <Navigate to="/login" />
            }
          />

        </Routes>

      </div>
    </Router>
  );
}

export default App;