import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post('http://localhost:5500/api/auth/login', {
        email,
        password,
      });
  
      localStorage.setItem('token', response.data.token); // Save the token
      localStorage.setItem('user', JSON.stringify(response.data.user)); // Optionally store user data
  
      alert(response.data.message);
      navigate('/dashboard'); // Navigate to the dashboard
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.response?.data?.error || 'Login failed. Please try again.');
    }
  };
  

  return (
    <form className="login-form" onSubmit={handleLogin}> {/* Scoped class for login */}
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="login-input"
      />
      <input
        type="password"
        placeholder="Enter Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="login-input"
      />
      <button type="submit" className="login-button">Login</button>

      {error && <p className="login-error">{error}</p>}
    </form>
  );
};

export default Login;
