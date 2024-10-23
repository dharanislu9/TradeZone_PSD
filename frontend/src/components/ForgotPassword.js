import React, { useState } from 'react';
import './ForgotPassword.css'; // Import your CSS file for styling
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(''); // For success/error messages

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/users/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password reset instructions have been sent to your email.');
      } else {
        setMessage(data.error || 'Error in sending reset instructions. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="forgot-password-wrapper">
      <form onSubmit={handleSubmit}>
        <p className="form-title">Forgot Password</p>

        <div className="input-box">
          <input
            required
            placeholder="Enter your email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Update email state
          />
        </div>

        {/* Display success or error message */}
        {message && <p className="message">{message}</p>}

        <button className="btn" type="submit">
          Send Reset Instructions
        </button>

        <div className="back-to-login">
          <p><Link to="/">Back to Login</Link></p>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
