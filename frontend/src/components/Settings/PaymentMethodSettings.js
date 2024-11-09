import React, { useState } from 'react';

const PaymentMethodSettings = ({ paymentMethod, updateSetting }) => {
  const [open, setOpen] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState('');

  const toggleOpen = () => setOpen(!open);

  const handleAddPaymentMethod = () => {
    if (newPaymentMethod) {
      updateSetting('paymentMethod', newPaymentMethod);
      setNewPaymentMethod(''); // Reset the input field
    }
  };

  return (
    <div className="settings-section">
      <button className="button" onClick={toggleOpen}>
        Payment Method
      </button>
      {open && (
        <div className="dropdown-menu">
          <input
            type="text"
            placeholder="Add Payment Method"
            value={newPaymentMethod}
            onChange={(e) => setNewPaymentMethod(e.target.value)}
          />
          <button className="dropdown-item" onClick={handleAddPaymentMethod}>
            Add Payment Method
          </button>
          {paymentMethod && <p>Current Payment Method: {paymentMethod}</p>}
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSettings;
