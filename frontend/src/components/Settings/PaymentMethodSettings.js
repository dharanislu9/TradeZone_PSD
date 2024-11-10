import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

  // Fetch payment methods from the backend on mount
  useEffect(() => {
    if (open) {
      fetchPaymentMethods();
    }
  }, [open]);

  const fetchPaymentMethods = () => {
    const token = localStorage.getItem('authToken');
    console.log('Auth token:', token); // Log token to ensure it's not null or undefined
  
    if (!token) {
      setMessage('Please log in to view payment methods.');
      return;
    }
  
    axios
      .get('http://localhost:5001/user/payment-methods', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log('Fetch response:', response); // Log full response for debugging
        if (response.data.paymentMethods) {
          setPaymentMethods(response.data.paymentMethods);
        } else {
          setPaymentMethods([]);
          console.warn('No payment methods found in response');
        }
      })
      .catch((error) => {
        console.error('Error fetching payment methods:', error.response ? error.response.data : error.message);
        setMessage('Failed to fetch payment methods. Please try again.');
      });
  };
  

  // Toggle the dropdown menu
  const toggleOpen = () => {
    setMessage('');
    setOpen(!open);
  };

  // Add a new payment method
  const handleAddPaymentMethod = () => {
    const { cardNumber, expDate, cvv, country } = newPaymentMethod;

    // Validation for each field
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
    axios
      .put(
        'http://localhost:5001/user/payment-method',
        { cardNumber, expDate, cvv, country },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        setMessage('Payment method added successfully!');
        setPaymentMethods((prevMethods) => [...prevMethods, newPaymentMethod]);
        setNewPaymentMethod({ cardNumber: '', expDate: '', cvv: '', country: '' }); // Clear input fields
      })
      .catch((error) => {
        let errorMessage = 'Error updating payment method. Please try again.';

        if (error.response) {
          // Status-based error handling
          if (error.response.status === 401) {
            errorMessage = 'Unauthorized access. Please log in again.';
          } else if (error.response.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          } else if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          }

          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
          console.error('Error response headers:', error.response.headers);
        } else {
          console.error('Error message:', error.message);
        }

        setMessage(errorMessage);
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
                    Card: **** **** **** {method.cardNumber.slice(-4)}, Exp: {method.expDate}, Country: {method.country}
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
