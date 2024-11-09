// src/components/SettingsPage.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './SettingsPage.css';
import ThemeSettings from './ThemeSettings';
import PaymentMethodSettings from './PaymentMethodSettings';
import NotificationsSettings from './NotificationsSettings';
import MessagesSettings from './MessagesSettings';
import AccountSettings from './AccountSettings';
import PrivacySettings from './PrivacySettings';

const SettingsPage = () => {
  const [settings, setSettings] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('');
  const navigate = useNavigate();

  // Function to apply the theme to the document body
  const applyTheme = (theme) => {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
  };

  // Fetch initial settings and apply theme on load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      axios
        .get('http://localhost:5001/user/settings', {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
          setSettings(response.data.settings);
          setPaymentMethod(response.data.settings.paymentMethod || ''); 
          applyTheme(response.data.settings.theme); // Apply theme initially
        })
        .catch(error => {
          if (error.response && error.response.status === 401) {
            navigate('/login');
          } else {
            console.error('Error fetching settings:', error);
          }
        });
    }
  }, [navigate]);

  // Update specific setting and apply theme if updated
  const updateSetting = (settingName, value) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }
  
    axios.put('http://localhost:5001/user/settings', { [settingName]: value }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
      setSettings(response.data.settings);
      if (settingName === 'theme') applyTheme(value); // Apply theme on change
      if (settingName === 'paymentMethod') setPaymentMethod(value); 
    })
    .catch(error => {
      console.error('Error updating setting:', error);
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken'); 
    navigate('/'); 
  };

  return (
    <div className="settings-wrapper">
      <h2>Settings</h2>
      <ThemeSettings currentTheme={settings.theme} updateSetting={updateSetting} />
      <PaymentMethodSettings paymentMethod={paymentMethod} updateSetting={updateSetting} />
      <NotificationsSettings updateSetting={updateSetting} />
      <MessagesSettings updateSetting={updateSetting} />
      <AccountSettings updateSetting={updateSetting} />
      <PrivacySettings updateSetting={updateSetting} />
      <div className="settings-section">
        <button className="button logout-button" onClick={handleLogout}>Back</button>
      </div>
    </div>
  );
};

export default SettingsPage;
