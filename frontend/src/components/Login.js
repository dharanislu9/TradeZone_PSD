import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';


const Login = ({ setIsLoggedIn }) => {  // Accept setIsLoggedIn as a prop
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
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


      const data = await response.json();
      console.log("Login response:", data);  // Log the response


      if (!response.ok) {
        setError(data.error || 'Login failed. Please try again.');
        return;
      }


      // Store the token in localStorage
      localStorage.setItem('token', data.token);
      console.log("Token stored:", data.token); // Log stored token


      // Set login state
      setIsLoggedIn(true); // <-- Update login status here


      // Redirect to homepage after successful login
      console.log("Redirecting to home");
      navigate('/home'); // <-- Redirecting to the homepage
    } catch (err) {
      console.error('Network error:', err);
      setError('Network error. Please try again later.');
    }
  };


  const handleForgotPassword = async (e) => {
    e.preventDefault();


    try {
      const response = await fetch('http://localhost:5001/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });


      const data = await response.json();


      if (!response.ok) {
        setError(data.error || 'Failed to send reset email. Please try again.');
        return;
      }


      alert('Password reset email sent! Check your inbox.'); // Notify the user
      setShowForgotPassword(false); // Close the modal
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
        <button type="submit" className="btn">Login</button>
      </form>
      <div className="remember-forgot">
        <label>
          <input type="checkbox" /> Remember Me
        </label>
        <a href="#" onClick={() => setShowForgotPassword(true)}>Forgot Password?</a>
      </div>
      <div className="register-link">
        <p>
          Don't have an account? <a href="/register">Register</a>
        </p>
      </div>


      {/* Modal for Forgot Password */}
      {showForgotPassword && (
        <div className="forgot-password-modal">
          <h3>Forgot Password</h3>
          <form onSubmit={handleForgotPassword}>
            <div className="input-box">
              <input
                type="email"
                placeholder="Enter your email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn">Send Reset Email</button>
            <button type="button" className="btn" onClick={() => setShowForgotPassword(false)}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
};


export default Login;