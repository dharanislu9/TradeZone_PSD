import React, { useState } from 'react';

const AccountSettings = ({ updateSetting }) => {
  const [open, setOpen] = useState(false);

  const toggleOpen = () => setOpen(!open);

  return (
    <div className="settings-section">
      <button className="button" onClick={toggleOpen}>
        Account Settings
      </button>
      {open && (
        <div className="dropdown-menu">
          <button className="dropdown-item" onClick={() => updateSetting('account', 'updateEmail')}>Update Email</button>
          <button className="dropdown-item" onClick={() => updateSetting('account', 'changePassword')}>Change Password</button>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;
