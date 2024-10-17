import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',  // New field
    phone: '',     // New field
    address: '',   // New field
  });

  const [editing, setEditing] = useState(false); 
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token'); // Get token from localStorage
        if (!token) {
          setError('User not authenticated. Please login.');
          console.log('No token found. Redirecting to login.');
          navigate('/login'); // Redirect to login if token not found
          return;
        }
  
        console.log('Token found:', token);
  
        // Fetch user data from the backend using the token
        const response = await axios.get('http://localhost:5500/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`, // Make sure the token is sent correctly
          },
        });
  
        console.log('Response from server:', response.data);
        setUserData(response.data); // Set user data
      } catch (error) {
        console.error('Failed to fetch user data:', error.response);
        setError('Unable to load user data. Please try again.');
      }
    };
  
    fetchUserData();
  }, [navigate]);
  
  

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token'); // Get token from localStorage
      if (!token) {
        setError('User not authenticated. Please login.');
        console.log('No token found. Unable to update profile.');
        return;
      }
  
      console.log('Attempting to update profile with data:', userData);
  
      // Send updated user data to the server
      const response = await axios.put('http://localhost:5500/api/auth/profile', userData, {
        headers: {
          Authorization: `Bearer ${token}`, // Send the token in the headers
        },
      });
  
      console.log('Profile update response:', response.data);
      setEditing(false); // Exit edit mode
    } catch (error) {
      console.error('Profile update failed:', error.response || error);
      setError('Failed to update profile. Please try again.');
    }
  };
  
  

return (
  <div className="dashboard-container">
    <h2>Profile</h2>
    {error && <p style={{ color: 'red' }}>{error}</p>}

    <div className="profile-info">
      <label>
        First Name:
        {editing ? (
          <input type="text" name="firstName" value={userData.firstName} onChange={handleChange}
          />
        ) : (
          <p>{userData.firstName}</p>
        )}
        </label>

        <label>
          Last Name:
          {editing ? (
            <input type="text" name="lastName" value={userData.lastName} onChange={handleChange} />
          ) : (
            <p>{userData.lastName}</p>
          )}
        </label>

        {/* New Fields */}
        <label>
          Username:
          {editing ? (
            <input type="text" name="username" value={userData.username} onChange={handleChange} />
          ) : (
            <p>{userData.username}</p>
          )}
        </label>

        <label>
          Phone Number:
          {editing ? (
            <input type="tel" name="phone" value={userData.phone} onChange={handleChange} />
          ) : (
            <p>{userData.phone}</p>
          )}
        </label>

        <label>
          Address:
          {editing ? (
            <input type="text" name="address" value={userData.address} onChange={handleChange} />
          ) : (
            <p>{userData.address}</p>
          )}
        </label>

        <label>
          Email:
          {editing ? (
            <input type="email" name="email" value={userData.email} onChange={handleChange} />
          ) : (
            <p>{userData.email}</p>
          )}
        </label>
      </div>

      {editing ? (
        <button className="save-button" onClick={handleSave}>
          Save Changes
        </button>
      ) : (
        <button className="edit-button" onClick={() => setEditing(true)}>
          Edit Profile
        </button>
      )}

      <button className="logout-button" onClick={() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }}>
        Logout
      </button>
    </div>
  );
};
  
export default Dashboard;
  
