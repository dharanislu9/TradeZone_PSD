import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import ProductDetails from './components/ProductDetails';
import RegisterForm from './components/Register';
import LoginForm from './components/Login';
import ForgotPassword from './components/ForgotPassword'; 

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State for login status

  const handleLogout = () => {
    setIsLoggedIn(false); // Update login status
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        {/* <Route path="/Login" element={<Login />} /> */}
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<HomePage handleLogout={handleLogout} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} /> {/* Forgot password route */}
      </Routes>
    </Router>
  );
};

export default App;
