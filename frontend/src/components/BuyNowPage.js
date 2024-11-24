import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './BuyNowPage.css';

const BuyNowPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [shippingAddress, setShippingAddress] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [loading, setLoading] = useState(true);
  const [isOrdering, setIsOrdering] = useState(false);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      console.log("Fetching product with ID:", productId); // Debugging
      try {
        const response = await fetch(`http://localhost:5001/products/${productId}`);
        if (response.ok) {
          const data = await response.json();
          console.log("Product data received:", data); // Debugging
          setProduct(data);
          setPrice(data.price);
        } else {
          const error = await response.json();
          console.error("Error fetching product:", error);
          alert(error.error || "Failed to fetch product.");
        }
      } catch (error) {
        console.error("Fetch error:", error.message);
        alert("An unexpected error occurred while fetching product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Fetch payment methods
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        console.log("Fetching payment methods..."); // Debugging
        const response = await fetch(`http://localhost:5001/user/payment-methods`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched payment methods:", data.paymentMethods); // Debugging
          setPaymentMethods(data.paymentMethods || []);
        } else {
          const error = await response.json();
          console.error("Error fetching payment methods:", error.message);
          alert(error.message || "Failed to fetch payment methods.");
        }
      } catch (error) {
        console.error("Error fetching payment methods:", error.message);
        alert("An unexpected error occurred while fetching payment methods.");
      }
    };

    fetchPaymentMethods();
  }, []);

  const handleQuantityChange = (e) => {
    const qty = parseInt(e.target.value, 10) || 1;
    setQuantity(qty);
    if (product) setPrice(qty * product.price);
  };

  const handleOrder = async () => {
    if (!shippingAddress || !selectedPaymentMethod) {
      alert('Please fill in all fields before placing the order.');
      return;
    }
  
    setIsOrdering(true);
    console.log("Placing order with:", {
      productId,
      quantity,
      shippingAddress,
      paymentMethod: selectedPaymentMethod,
    });
  
    try {
      const response = await fetch(`http://localhost:5001/user/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          productId,
          quantity,
          shippingAddress,
          paymentMethod: selectedPaymentMethod,
        }),
      });
  
      console.log("Response status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("Order placed successfully:", data);
        alert('Order placed successfully!');
        navigate('/home');
      } else {
        const error = await response.json();
        console.error("Failed to place order:", error);
        alert(error.error || 'Failed to place order.');
      }
    } catch (error) {
      console.error("Error placing order:", error.message);
      alert('An unexpected error occurred while placing the order.');
    } finally {
      setIsOrdering(false);
    }
  };
  

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading product details...</p>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="error-container">
        <p>Product not found. Please try again later.</p>
        <button onClick={() => navigate('/home')}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="buy-now-container">
      <h1>Buy Now</h1>
      <h2>{product.description}</h2>
      <p>Price per item: ${product.price}</p>

      <label>Quantity:</label>
      <input
        type="number"
        value={quantity}
        min="1"
        onChange={handleQuantityChange}
      />
      <p>Total Price: ${price}</p>

      <label>Shipping Address:</label>
      <textarea
        value={shippingAddress}
        onChange={(e) => setShippingAddress(e.target.value)}
        placeholder="Enter shipping address"
      />

      <label>Payment Method:</label>
      <select
        value={selectedPaymentMethod}
        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
      >
        <option value="">Select a payment method</option>
        {paymentMethods.map((method, index) => (
          <option key={index} value={method.cardNumber}>
            {`${method.cardNumber} - ${method.country}`}
          </option>
        ))}
      </select>

      {paymentMethods.length === 0 && (
        <p className="no-payment-methods">
          No payment methods found. Please add a payment method in Settings.
        </p>
      )}

      <div className="button-group">
        <button onClick={handleOrder} disabled={isOrdering}>
          {isOrdering ? 'Placing Order...' : 'Order'}
        </button>
        <button onClick={() => navigate('/home')}>Back</button>
      </div>
    </div>
  );
};

export default BuyNowPage;
