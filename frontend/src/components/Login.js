// Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Log raw response to inspect format
      console.log('Raw response:', response);

      const data = await response.json();
      
      // Log parsed response data
      console.log('Parsed response data:', data);

      if (!response.ok) {
        console.log('Error from server:', data); // Debug log
        setError(data.error || 'Login failed. Please try again.');
        return;
      }

      if (data.token && data.username) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('username', data.username);
        navigate('/'); // Redirect to the homepage or dashboard after login
      } else {
        setError('Unexpected response from server.');
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('Network error. Please try again later.');
    }
  };

  return (
    <div className="login-container">
      <h2 className="form-login">Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <div className="input-box">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-box">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="forgot-password" style={{ textAlign: 'right' }}>
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
        <button type="submit" className="btn">Login</button>
      </form>
      <div className="register-link">
        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
