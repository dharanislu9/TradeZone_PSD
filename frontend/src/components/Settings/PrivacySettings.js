import React, { useState } from 'react';

const PrivacySettings = ({ updateSetting }) => {
  const [open, setOpen] = useState(false);

  const toggleOpen = () => setOpen(!open);

  return (
    <div className="settings-section">
      <button className="button" onClick={toggleOpen}>
        Privacy Settings
      </button>
      {open && (
        <div className="dropdown-menu">
          <button className="dropdown-item" onClick={() => updateSetting('privacy', 'public')}>Public</button>
          <button className="dropdown-item" onClick={() => updateSetting('privacy', 'private')}>Private</button>
        </div>
      )}
    </div>
  );
};

export default PrivacySettings;
