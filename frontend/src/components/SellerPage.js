import React, { useState } from 'react';
import './SettingsPage.css'; // Import your CSS file

const SettingsPage = () => {
  // State for each settings section
  const [settings, setSettings] = useState({
    name: '',
    email: '',
    password: '',
    notifications: {
      newListing: true,
      messages: true,
      priceDrops: false,
    },
    privacy: 'public',
    payment: {
      cardNumber: '',
      cardName: '',
    },
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: value,
    });
  };

  // Handle notification checkbox changes
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [name]: checked,
      },
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Settings Data:', settings);
    // Save settings logic here
  };

  return (
    <div className="settings-page">
      <h2>Settings</h2>
      <form onSubmit={handleSubmit} className="settings-form">
        {/* Account Settings */}
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={settings.name}
            onChange={handleInputChange}
            placeholder="Enter your name"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={settings.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={settings.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            required
          />
        </div>

        {/* Notification Settings */}
        <div className="form-group">
          <label>Notification Settings:</label>
          <div>
            <label>
              <input
                type="checkbox"
                name="newListing"
                checked={settings.notifications.newListing}
                onChange={handleNotificationChange}
              />
              Notify me of new listings
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                name="messages"
                checked={settings.notifications.messages}
                onChange={handleNotificationChange}
              />
              Notify me of new messages
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                name="priceDrops"
                checked={settings.notifications.priceDrops}
                onChange={handleNotificationChange}
              />
              Notify me of price drops
            </label>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="form-group">
          <label htmlFor="privacy">Profile Visibility:</label>
          <select
            id="privacy"
            name="privacy"
            value={settings.privacy}
            onChange={handleInputChange}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="friends">Friends Only</option>
          </select>
        </div>

        {/* Payment Settings */}
        <div className="form-group">
          <label htmlFor="cardNumber">Card Number:</label>
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            value={settings.payment.cardNumber}
            onChange={(e) =>
              setSettings({
                ...settings,
                payment: { ...settings.payment, cardNumber: e.target.value },
              })
            }
            placeholder="Enter your card number"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="cardName">Cardholder Name:</label>
          <input
            type="text"
            id="cardName"
            name="cardName"
            value={settings.payment.cardName}
            onChange={(e) =>
              setSettings({
                ...settings,
                payment: { ...settings.payment, cardName: e.target.value },
              })
            }
            placeholder="Enter the cardholder's name"
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="submit-button">Save Changes</button>
      </form>
    </div>
  );
};

export default SettingsPage;
