import React, { useState } from 'react';
import './ForgotPassword.css'; // Import your CSS file for styling
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(''); // For success/error messages
  const [loading, setLoading] = useState(false); // For loading state

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Basic email validation
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setMessage(''); // Clear previous messages

    try {
      const response = await fetch('http://localhost:5001/api/users/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('If the email is associated with an account, reset instructions will be sent.');
      } else {
        setMessage(data.error || 'An error occurred. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred. Please try again later.');
    } finally {
      setLoading(false); // Reset loading state
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
        {message && <p className={`message ${message.includes('reset instructions') ? 'success' : 'error'}`}>{message}</p>}

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Instructions'}
        </button>

        <div className="back-to-login">
          <p>
            <Link to="/">Back to Login</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
