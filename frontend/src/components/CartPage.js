import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const response = await fetch('http://localhost:5001/user/cart', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.cart);
      } else {
        console.error('Failed to fetch cart items');
      }
    } catch (error) {
      console.error('Error fetching cart items:', error.message);
    }
  };

  const handleDeleteItem = async (productId) => {
    try {
      const response = await fetch(`http://localhost:5001/user/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        fetchCartItems();
      } else {
        console.error('Failed to delete item from cart');
      }
    } catch (error) {
      console.error('Error deleting item from cart:', error.message);
    }
  };

  return (
    <div className="cart-wrapper">
      <div className="cart-header">
        <h1>Your Cart</h1>
      </div>
      
      <div className="cart-items">
        {cartItems.length > 0 ? (
          cartItems.map((item, index) => (
            <div key={index} className="cart-item">
              <img
                src={`http://localhost:5001/${item.productId.imagePath}`}
                alt={item.productId.description}
                className="cart-item-image"
              />
              <div className="cart-item-details">
                <p className="cart-item-title">{item.productId.description}</p>
              </div>
              <div className="cart-item-price">
                <p>Price:</p>
                <p>${item.productId.price}</p>
              </div>
              <div className="cart-item-quantity">
                <p>Quantity:</p>
                <p>{item.quantity}</p>
              </div>
              <button className="remove-button" onClick={() => handleDeleteItem(item.productId._id)}>
                Remove
              </button>
            </div>
          ))
        ) : (
          <p className="empty-cart-message">Your cart is empty.</p>
        )}
      </div>

      <button className="back-button" onClick={() => navigate('/home')}>
        ← Back to Home
      </button>
    </div>
  );
};

export default CartPage;
