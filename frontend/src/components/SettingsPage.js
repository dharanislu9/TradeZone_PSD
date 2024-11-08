import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SettingsPage.css';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
  const [settings, setSettings] = useState({});
  const [openSection, setOpenSection] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      axios
        .get('http://localhost:5001/api/user/settings', {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
          setSettings(response.data.settings);
          setPaymentMethod(response.data.settings.paymentMethod || ''); 
          applyTheme(response.data.settings.theme);
        })
        .catch(error => {
          if (error.response && error.response.status === 401) {
            navigate('/login');
          }
        });
    }
  }, [navigate]);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const updateSetting = (settingName, value) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    axios.put('http://localhost:5001/api/user/settings', { [settingName]: value }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
      setSettings(response.data.settings);
      if (settingName === 'theme') applyTheme(value); 
      if (settingName === 'paymentMethod') setPaymentMethod(value); 
    });
  };

  const applyTheme = (theme) => {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken'); 
    navigate('/'); 
  };

  return (
    <div className="settings-wrapper">
      <h2>Settings</h2>

      {/* Theme Options Section */}
      <div className="settings-section">
        <button className="button" onClick={() => toggleSection('theme')}>
          Theme Options
        </button>
        {openSection === 'theme' && (
          <div className="dropdown-menu">
            <button className="dropdown-item" onClick={() => updateSetting('theme', 'dark')}>Dark Mode</button>
            <button className="dropdown-item" onClick={() => updateSetting('theme', 'light')}>Light Mode</button>
          </div>
        )}
      </div>

      {/* Payment Method Section */}
      <div className="settings-section">
        <button className="button" onClick={() => toggleSection('paymentMethod')}>
          Payment Method
        </button>
        {openSection === 'paymentMethod' && (
          <div className="dropdown-menu">
            <button className="dropdown-item" onClick={() => updateSetting('paymentMethod', 'creditCard')}>Credit Card</button>
            <button className="dropdown-item" onClick={() => updateSetting('paymentMethod', 'paypal')}>PayPal</button>
            <button className="dropdown-item" onClick={() => updateSetting('paymentMethod', 'bankTransfer')}>Bank Transfer</button>
          </div>
        )}
        {paymentMethod && <p>Current Payment Method: {paymentMethod}</p>}
      </div>

      {/* Notifications Section */}
      <div className="settings-section">
        <button className="button" onClick={() => toggleSection('notifications')}>
          Notifications
        </button>
        {openSection === 'notifications' && (
          <div className="dropdown-menu">
            <button className="dropdown-item" onClick={() => updateSetting('notifications', 'enabled')}>Enable Notifications</button>
            <button className="dropdown-item" onClick={() => updateSetting('notifications', 'disabled')}>Disable Notifications</button>
          </div>
        )}
      </div>

      {/* Messages Section */}
      <div className="settings-section">
        <button className="button" onClick={() => toggleSection('messages')}>
          Messages
        </button>
        {openSection === 'messages' && (
          <div className="dropdown-menu">
            <button className="dropdown-item" onClick={() => updateSetting('messages', 'read')}>Mark all as read</button>
            <button className="dropdown-item" onClick={() => updateSetting('messages', 'unread')}>Mark all as unread</button>
          </div>
        )}
      </div>

      {/* Account Settings Section */}
      <div className="settings-section">
        <button className="button" onClick={() => toggleSection('account')}>
          Account Settings
        </button>
        {openSection === 'account' && (
          <div className="dropdown-menu">
            <button className="dropdown-item" onClick={() => updateSetting('account', 'updateEmail')}>Update Email</button>
            <button className="dropdown-item" onClick={() => updateSetting('account', 'changePassword')}>Change Password</button>
          </div>
        )}
      </div>

      {/* Privacy Settings Section */}
      <div className="settings-section">
        <button className="button" onClick={() => toggleSection('privacy')}>
          Privacy Settings
        </button>
        {openSection === 'privacy' && (
          <div className="dropdown-menu">
            <button className="dropdown-item" onClick={() => updateSetting('privacy', 'public')}>Public</button>
            <button className="dropdown-item" onClick={() => updateSetting('privacy', 'private')}>Private</button>
          </div>
        )}
      </div>

      {/* Back Button */}
      <div className="settings-section">
        <button className="button logout-button" onClick={handleLogout}>
          Back
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
