// PaymentMethodSettings.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentMethodSettings = ({ updateSetting }) => {
  const [open, setOpen] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]); // List of payment methods
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Toggle the dropdown menu
  const toggleOpen = () => {
    setMessage(''); // Clear any previous message
    setOpen(!open);
  };

  // Fetch existing payment methods whenever the component mounts or reopens
  useEffect(() => {
    if (open) {
      fetchPaymentMethods();
    }
  }, [open]);

  // Fetch payment methods from the backend
  const fetchPaymentMethods = () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    axios
      .get('http://localhost:5001/user/payment-methods', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        setPaymentMethods(response.data.paymentMethods); // Set fetched payment methods
      })
      .catch(error => {
        console.error('Error fetching payment methods:', error);
      });
  };

  // Add a new payment method
  const handleAddPaymentMethod = () => {
    if (!newPaymentMethod) {
      setMessage('Please enter a valid payment method.');
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Please log in first.');
      return;
    }

    setLoading(true);
    axios
      .put(
        'http://localhost:5001/user/payment-method', 
        { paymentMethod: newPaymentMethod }, 
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(response => {
        setMessage('Payment method added successfully!');
        setPaymentMethods([...paymentMethods, newPaymentMethod]); // Update list with new method
        setNewPaymentMethod(''); // Clear input field
      })
      .catch(error => {
        setMessage('Error updating payment method. Please try again.');
        console.error('Error updating payment method:', error);
      })
      .finally(() => setLoading(false));
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
          <button 
            className="dropdown-item" 
            onClick={handleAddPaymentMethod}
            disabled={loading} // Disable button when loading
          >
            {loading ? 'Adding...' : 'Add Payment Method'}
          </button>
          <div className="payment-method-list">
            <h4>Current Payment Methods:</h4>
            <ul>
              {paymentMethods.map((method, index) => (
                <li key={index}>{method}</li>
              ))}
            </ul>
          </div>
          {message && <p className="message">{message}</p>}
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSettings;
