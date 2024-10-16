import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; // You can create a separate CSS file for the dashboard styling.

const Dashboard = () => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    phone: '',
    address: '',
    email: '',
  });

  const [editing, setEditing] = useState(false); // Toggle edit mode
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch user data from backend or localStorage
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userFromStorage = JSON.parse(localStorage.getItem('user'));

        if (userFromStorage) {
          setUserData(userFromStorage);
        } else {
          // Fetch user data from the backend if not found in localStorage
          const token = localStorage.getItem('token');
          const response = await axios.get('http://localhost:5500/api/auth/profile', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUserData(response.data.user);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setError('Unable to load user data. Please try again.');
      }
    };

    fetchUserData();
  }, []);

  const handleEdit = () => {
    setEditing(true); // Enable editing
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:5500/api/auth/profile', userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Profile updated successfully:', response.data);
      setEditing(false); // Disable editing after saving
    } catch (error) {
      console.error('Profile update failed:', error);
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <h2>Profile</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="profile-info">
        <label>
          First Name:
          {editing ? (
            <input
              type="text"
              name="firstName"
              value={userData.firstName}
              onChange={handleChange}
            />
          ) : (
            <p>{userData.firstName}</p>
          )}
        </label>

        <label>
          Last Name:
          {editing ? (
            <input
              type="text"
              name="lastName"
              value={userData.lastName}
              onChange={handleChange}
            />
          ) : (
            <p>{userData.lastName}</p>
          )}
        </label>

        <label>
          Username:
          {editing ? (
            <input
              type="text"
              name="username"
              value={userData.username}
              onChange={handleChange}
            />
          ) : (
            <p>{userData.username}</p>
          )}
        </label>

        <label>
          Phone Number:
          {editing ? (
            <input
              type="tel"
              name="phone"
              value={userData.phone}
              onChange={handleChange}
            />
          ) : (
            <p>{userData.phone}</p>
          )}
        </label>

        <label>
          Address:
          {editing ? (
            <input
              type="text"
              name="address"
              value={userData.address}
              onChange={handleChange}
            />
          ) : (
            <p>{userData.address}</p>
          )}
        </label>

        <label>
          Email:
          {editing ? (
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
            />
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
        <button className="edit-button" onClick={handleEdit}>
          Edit Profile
        </button>
      )}

      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
