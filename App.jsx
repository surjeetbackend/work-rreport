// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Register from './components/Register';
import Login from './components/Login';
import WorkSubmission from './components/WorkSubmission';
import ClientDashboard from './components/ClientDashboard';
import AdminDashboard from './components/AdminDashboard'; // renamed for clarity
import SupervisorDashboard from './components/SupervisorDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <nav style={{ marginBottom: '1rem' }}>
          <Link to="/register">Register</Link> |{' '}
          <Link to="/login">Login</Link> |{' '}
          <Link to="/submit-work">Submit Work</Link> |{' '}
          <Link to="/client-dashboard">Client Dashboard</Link> |{' '}
          <Link to="/admin-dashboard">Admin Dashboard</Link> |{' '}
          <Link to="/supervisor-dashboard">Supervisor Dashboard</Link>
        </nav>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/submit-work" element={<WorkSubmission />} />
          <Route path="/client-dashboard" element={<ClientDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          
<Route path="/supervisor-dashboard" element={<SupervisorDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
