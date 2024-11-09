import React, { useState } from 'react';

const NotificationsSettings = ({ updateSetting }) => {
  const [open, setOpen] = useState(false);

  const toggleOpen = () => setOpen(!open);

  return (
    <div className="settings-section">
      <button className="button" onClick={toggleOpen}>
        Notifications
      </button>
      {open && (
        <div className="dropdown-menu">
          <button className="dropdown-item" onClick={() => updateSetting('notifications', 'enabled')}>Enable Notifications</button>
          <button className="dropdown-item" onClick={() => updateSetting('notifications', 'disabled')}>Disable Notifications</button>
        </div>
      )}
    </div>
  );
};

export default NotificationsSettings;
