import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SettingsPage.css';

const PaymentMethodSettings = () => {
  const [open, setOpen] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    cardNumber: '',
    expDate: '',
    cvv: '',
    country: '',
  });
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch payment methods from the backend when dropdown is opened
  useEffect(() => {
    if (open) {
      fetchPaymentMethods();
    }
  }, [open]);

  const fetchPaymentMethods = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setMessage('Please log in to view payment methods.');
      return;
    }

    try {
      const response = await axios.get('http://localhost:5001/user/payment-methods', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPaymentMethods(response.data.paymentMethods || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      setMessage('Failed to fetch payment methods. Please try again.');
    }
  };

  // Toggle the dropdown menu
  const toggleOpen = () => {
    setMessage('');
    setOpen(!open);
  };

  // Add a new payment method
  const handleAddPaymentMethod = async () => {
    const { cardNumber, expDate, cvv, country } = newPaymentMethod;

    if (!cardNumber || !expDate || !cvv || !country) {
      setMessage('Please fill in all payment details.');
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      setMessage('Please log in first.');
      return;
    }

    setLoading(true);
    try {
      await axios.put(
        'http://localhost:5001/user/payment-method',
        { cardNumber, expDate, cvv, country },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Payment method added successfully!');
      setPaymentMethods((prevMethods) => [
        ...prevMethods,
        { cardNumber: cardNumber.slice(-4), expDate, country },
      ]);
      setNewPaymentMethod({ cardNumber: '', expDate: '', cvv: '', country: '' });
    } catch (error) {
      setMessage('Error updating payment method. Please try again.');
      console.error('Error adding payment method:', error);
    } finally {
      setLoading(false);
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
            placeholder="Card Number"
            value={newPaymentMethod.cardNumber}
            onChange={(e) =>
              setNewPaymentMethod({ ...newPaymentMethod, cardNumber: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Expiration Date (MM/YY)"
            value={newPaymentMethod.expDate}
            onChange={(e) =>
              setNewPaymentMethod({ ...newPaymentMethod, expDate: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="CVV"
            value={newPaymentMethod.cvv}
            onChange={(e) =>
              setNewPaymentMethod({ ...newPaymentMethod, cvv: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Country"
            value={newPaymentMethod.country}
            onChange={(e) =>
              setNewPaymentMethod({ ...newPaymentMethod, country: e.target.value })
            }
          />
          <button
            className="dropdown-item"
            onClick={handleAddPaymentMethod}
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Payment Method'}
          </button>
          <div className="payment-method-list">
            <h4>Current Payment Methods:</h4>
            <ul>
              {paymentMethods.length > 0 ? (
                paymentMethods.map((method, index) => (
                  <li key={index}>
                    Card: **** **** **** {method.cardNumber}, Exp: {method.expDate}, Country: {method.country}
                  </li>
                ))
              ) : (
                <p>No payment methods available.</p>
              )}
            </ul>
          </div>
          {message && <p className="message">{message}</p>}
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSettings;
