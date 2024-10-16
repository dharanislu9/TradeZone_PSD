
import React, { useState } from 'react';
import axios from 'axios';
import './Register.css'; 
import { Link, useNavigate } from 'react-router-dom'; 

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post('http://localhost:5500/api/auth/signup', {
        firstName, // Make sure these field names match your backend expectations
        lastName,
        email,
        password,
        confirmPassword,
      });
  
      setSuccess(response.data.message); // Show success message
      console.log('Registration successful:', response.data.message);
  
      // Redirect to the login page after successful registration
      setTimeout(() => {
        navigate('/login'); // Redirect to the login page
      }, 2000); // Add a 2-second delay for the user to see the success message
    } catch (error) {
      console.error('Registration failed:', error);
      setError(error.response?.data?.error || 'Registration failed. Please try again.');
    }
  };
  

  return (
    <form className="form" onSubmit={handleRegister}>
      <p className="title">Register</p>
      <p className="message">Signup now and get full access to our app.</p>
      <div className="flex">
        <label>
          <input 
            required 
            placeholder="" 
            type="text" 
            className="input" 
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <span>First Name</span>
        </label>

        <label>
          <input 
            required 
            placeholder="" 
            type="text" 
            className="input" 
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <span>Last Name</span>
        </label>
      </div>

      <label>
        <input 
          required 
          placeholder="" 
          type="email" 
          className="input" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <span>Email</span>
      </label>

      <label>
        <input 
          required 
          placeholder="" 
          type="password" 
          className="input" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <span>Password</span>
      </label>
      
      <label>
        <input 
          required 
          placeholder="" 
          type="password" 
          className="input" 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <span>Confirm Password</span>
      </label>
      
      <button className="submit" type="submit">Register</button>
      <p className="signin">Already have an account? <Link to="/login">Signin</Link></p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </form>
  );
};

export default Register;