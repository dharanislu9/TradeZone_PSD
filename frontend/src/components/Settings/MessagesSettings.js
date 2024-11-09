import React, { useState } from 'react';

const MessagesSettings = ({ updateSetting }) => {
  const [open, setOpen] = useState(false);

  const toggleOpen = () => setOpen(!open);

  return (
    <div className="settings-section">
      <button className="button" onClick={toggleOpen}>
        Messages
      </button>
      {open && (
        <div className="dropdown-menu">
          <button className="dropdown-item" onClick={() => updateSetting('messages', 'read')}>Mark all as read</button>
          <button className="dropdown-item" onClick={() => updateSetting('messages', 'unread')}>Mark all as unread</button>
        </div>
      )}
    </div>
  );
};

export default MessagesSettings;
