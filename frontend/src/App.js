import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage'
import HomePage from './components/HomePage';
import Register from './components/Register';
import Login from './components/Login';
import SellerPage from './components/SellerPage';
import ProductDetails from './components/ProductDetails';
import ForgotPassword from './components/ForgotPassword'; 
import Profile from './components/Profile';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State for login status

  const handleLogout = () => {
    setIsLoggedIn(false); // Update login status
  };

  return (
    <Router>
      <Routes>
      <Route path="/" element={<LandingPage />} />
        <Route path="/HomePage" element={<HomePage />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/SellerPage" element={<SellerPage/>} />
        <Route path="/" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        {/* <Route path="/Login" element={<Login />} /> */}
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<HomePage handleLogout={handleLogout} />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/forgot-password" element={<ForgotPassword />} /> {/* Forgot password route */}
      </Routes>
    </Router>
  );
};

export default App;
