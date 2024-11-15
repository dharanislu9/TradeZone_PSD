// src/components/ThemeSettings.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SettingsPage.css';

const ThemeSettings = ({ currentTheme, updateSetting }) => {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(currentTheme || 'light');

  const toggleOpen = () => setOpen(!open);

  // Function to apply the theme to the document body
  const applyTheme = (theme) => {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
  };

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error("No token found");

        const response = await axios.get('http://localhost:5001/user/theme', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTheme(response.data.theme);
        applyTheme(response.data.theme); // Apply theme when fetched
      } catch (error) {
        console.error('Error fetching theme:', error);
      }
    };
    fetchTheme();
  }, []);

  const handleThemeChange = async (newTheme) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error("No token found");

      const response = await axios.put(
        'http://localhost:5001/user/theme',
        { theme: newTheme },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTheme(response.data.theme);
      applyTheme(response.data.theme);  // Apply theme when updated
      if (updateSetting) updateSetting('theme', response.data.theme);
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  return (
    <div className="settings-section">
      <button className="button" onClick={toggleOpen}>
        Theme Options
      </button>
      {open && (
        <div className="dropdown-menu">
          <button
            className={`dropdown-item ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => handleThemeChange('dark')}
          >
            Dark Mode
          </button>
          <button
            className={`dropdown-item ${theme === 'light' ? 'active' : ''}`}
            onClick={() => handleThemeChange('light')}
          >
            Light Mode
          </button>
        </div>
      )}
    </div>
  );
};

export default ThemeSettings;
