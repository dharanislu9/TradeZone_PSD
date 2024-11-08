import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import ProductDetails from './components/ProductDetails';
import Register from './components/Register';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import SellerPage from './components/SellerPage';
import LandingPage from './components/LandingPage';
import Profile from './components/Profile'; // Import the Profile component
import SettingsPage from './components/SettingsPage';


const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Check localStorage to see if the user is logged in when the app loads
    return localStorage.getItem('isLoggedIn') === 'true';
  });


  // When login state changes, store it in localStorage
  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
  }, [isLoggedIn]);


  const handleLogout = () => {
    setIsLoggedIn(false); // Update login status
    localStorage.removeItem('isLoggedIn'); // Remove from localStorage on logout
    localStorage.removeItem('token'); // Also clear the token
  };


  return (
    <Router>
      <Routes>
        <Route path="/landing-page" element={<LandingPage setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/" element={<Navigate to="/landing-page" />} /> {/* Redirect to Landing Page */}
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/home" element={isLoggedIn ? <HomePage handleLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/seller-page" element={<SellerPage />} />
        <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/login" />} /> {/* Add this line */}
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Router>
  );
};


export default App;