import React, { useState } from 'react';
import './ForgetPassword.css';
import { Link } from 'react-router-dom';

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5500/api/users/forgot-password', {
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
        setMessage(data.error || 'Error in sending reset instructions.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="forget-password-wrapper">
      <form onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {message && <p className="message">{message}</p>}
        <button type="submit">Send Reset Instructions</button>
        <Link to="/login">Back to Login</Link>
      </form>
    </div>
  );
};

export default ForgetPassword;
