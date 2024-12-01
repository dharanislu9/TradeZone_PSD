import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrdersPage.css';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:5001/user/orders', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        } else {
          console.error('Failed to fetch orders:', response.status);
        }
      } catch (error) {
        console.error('Error fetching orders:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading your orders...</p>
        <div className="spinner"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="no-orders-container">
        <p>No orders found.</p>
        <button onClick={() => navigate('/home')}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h1>Your Orders</h1>
      <div className="orders-list">
        {orders.map((order) => (
          <div key={order._id} className="order-card">
            <h2>Product: {order.productId?.description || 'Unknown'}</h2>
            <p>Quantity: {order.quantity}</p>
            <p>Total Price: ${order.totalPrice}</p>
            <p>Shipping Address: {order.shippingAddress}</p>
            <p>Payment Method: {order.paymentMethod}</p>
            <p>Order Date: {new Date(order.orderDate).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
      <button onClick={() => navigate('/home')}>Back to Home</button>
    </div>
  );
};

export default OrdersPage;
