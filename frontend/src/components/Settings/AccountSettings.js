import React, { useState } from 'react';
import axios from 'axios';

const AccountSettings = () => {
  const [open, setOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const toggleOpen = () => setOpen(!open);

  const handleChangePassword = () => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      setMessage('Error changing password. Please try again.');
      return;
    }

    if (!oldPassword || !newPassword) {
      setMessage('Please enter both old and new passwords.');
      return;
    }

    axios
      .put(
        'http://localhost:5001/user/change-password',
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(response => {
        setMessage('Password changed successfully!');
        setOldPassword('');
        setNewPassword('');
      })
      .catch(error => {
        setMessage('Error changing password. Please try again.');
        console.error(error);
      });
  };

  return (
    <div className="settings-section">
      <button className="button" onClick={toggleOpen}>
        Account Settings
      </button>
      {open && (
        <div className="dropdown-menu">
          <h4>Change Password</h4>
          <input
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button className="dropdown-item" onClick={handleChangePassword}>
            Change Password
          </button>

          {message && <p className="message">{message}</p>}
        </div>
      )}
    </div>
  );
};

export default AccountSettings;
