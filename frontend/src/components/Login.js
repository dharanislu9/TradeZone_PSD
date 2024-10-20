login.js

import React, { useState } from 'react';
import './Login.css'; // Import your CSS file
import { Link, useNavigate } from 'react-router-dom';

const Login = ({ setIsLoggedIn }) => { // Accept the prop
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful:', data);
        // Set login status to true
        setIsLoggedIn(true);
        navigate('/home'); // Redirect to homepage
      } else {
        setErrorMessage(data.error || 'Invalid credentials, please try again.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="wrapper">
      <form onSubmit={handleSubmit}>
        <p className="form-login">Login</p>
        <div className="input-box">
          <input
            required
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input-box">
          <input
            required
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {errorMessage && <p className="error">{errorMessage}</p>}
        <div className="remember-forgot">
          <label>
            <input type="checkbox" /> Remember Me
          </label>
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
        <button className="btn" type="submit">Login</button>
        <div className="register-link">
          <p>Don’t have an account? <Link to="/register">Register</Link></p>
        </div>
      </form>
    </div>
  );
};

export default Login;
