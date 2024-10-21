import React, { useState } from 'react';
import './Register.css'; // Import your CSS file
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate

const Register = () => {
  // State for form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Initialize useNavigate
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // Send a POST request to the backend
    const response = await fetch('http://localhost:5000/api/users/register', { // Ensure correct URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstname: firstName,
        lastname: lastName,
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Registration successful:', data);
      // Redirect to the login page after successful registration
      navigate('/login');
    } else {
      console.error('Error registering:', data);
      alert(data.message || 'Registration failed');
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
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
          <span>Firstname</span>
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
          <span>Lastname</span>
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
      
      <button className="submit" type="submit">Submit</button>
      <p className="signin">Already have an account? <Link to="/login">Signin</Link></p>
    </form>
  );
};

export default Register;