import React, { useState } from 'react';
import './Login.css'; // Import your CSS file
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState(''); // State for email input
  const [password, setPassword] = useState(''); // State for password input
  const [errorMessage, setErrorMessage] = useState(''); // State for error message
  const navigate = useNavigate(); // Hook to navigate between routes

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Send a POST request to the backend for login
    const response = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    // If the login is successful, redirect to homepage
    if (response.ok) {
      console.log('Login successful:', data);
      navigate('/'); // Redirect to homepage
    } else {
      // Display error message for invalid credentials or user not found
      setErrorMessage(data.error || 'Invalid credentials, please try again.');
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
            onChange={(e) => setEmail(e.target.value)} // Update email state
          />
        </div>

        <div className="input-box">
          <input
            required
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Update password state
          />
        </div>

        {/* Display error message if credentials are incorrect */}
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