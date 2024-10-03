import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; 

const HomePage = () => {
  return (
    <div className="home-wrapper">
      <h1>Welcome to TradeZone</h1>
      <p>Your go-to platform for trading and user management.</p>
      <div className="button-container">
        <Link to="/login" className="button">Login</Link>
        <Link to="/register" className="button">Register</Link>
      </div>
    </div>
  );
};

export default HomePage;

