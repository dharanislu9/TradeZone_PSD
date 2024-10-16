// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import RegisterForm from './components/Register'; // Ensure correct import
import LoginForm from './components/Login'; // Ensure correct import
import Dashboard from './components/Dashboard'; // Ensure this component exists

const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route
          path="/dashboard"
          element={
            isAuthenticated() ? <Dashboard /> : <Navigate to="/login" />
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
