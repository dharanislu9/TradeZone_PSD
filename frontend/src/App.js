import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import ProductDetails from './components/ProductDetails';
import Register from './components/Register';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import SellerPage from './components/SellerPage';
import LandingPage from './components/LandingPage';
import Profile from './components/Profile';
import SettingsPage from './components/Settings/SettingsPage';
import LocationPage from './components/LocationPage';
import CartPage from './components/CartPage';
import BuyNowPage from './components/BuyNowPage';

const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  console.log("Checking authentication: ", token); // Debug log
  return token !== null;
};

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const [theme, setTheme] = useState('light');

  // Apply theme to the body class
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
  }, [isLoggedIn]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('authToken'); // Ensure this key matches the token storage
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) setTheme(storedTheme);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/landing-page" element={<LandingPage setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/" element={<Navigate to="/landing-page" />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        
        {/* Protected Routes */}
        <Route
          path="/home"
          element={isLoggedIn ? <HomePage handleLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={isLoggedIn ? <Profile /> : <Navigate to="/login" />}
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage theme={theme} onThemeChange={handleThemeChange} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage /> {/* Cart page protected by authentication */}
            </ProtectedRoute>
          }
        />

        {/* Public Routes */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/seller-page" element={<SellerPage />} />
        <Route path="/location" element={<LocationPage />} />
        <Route path="/buy-now/:productId" element={<BuyNowPage />} />
      </Routes>
    </Router>
  );
};

export default App;
