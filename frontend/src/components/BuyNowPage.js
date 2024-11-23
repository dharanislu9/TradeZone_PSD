import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const BuyNowPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [shippingAddress, setShippingAddress] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log("Fetching product with ID:", productId); // Debugging
        const response = await fetch(`http://localhost:5001/products/${productId}`);
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched Product:", data); // Debugging
          setProduct(data);
          setPrice(data.price);
        } else {
          console.error("Failed to fetch product details:", response.status);
        }
      } catch (error) {
        console.error("Error fetching product:", error.message);
      } finally {
        setLoading(false); // Set loading to false regardless of success or failure
      }
    };

    const fetchPaymentMethods = async () => {
      try {
        const response = await fetch(`http://localhost:5001/user/payment-methods`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched Payment Methods:", data.paymentMethods); // Debugging
          setPaymentMethods(data.paymentMethods || []);
        } else {
          console.error("Failed to fetch payment methods:", response.status);
        }
      } catch (error) {
        console.error("Error fetching payment methods:", error.message);
      }
    };

    fetchProduct();
    fetchPaymentMethods();
  }, [productId]);

  const handleQuantityChange = (e) => {
    const qty = parseInt(e.target.value, 10) || 1; // Default to 1 if invalid
    setQuantity(qty);
    if (product) setPrice(qty * product.price);
  };

  const handleOrder = async () => {
    if (!shippingAddress || !selectedPaymentMethod) {
      alert("Please fill all fields before placing an order.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/user/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          productId,
          quantity,
          shippingAddress,
          paymentMethod: selectedPaymentMethod,
        }),
      });

      if (response.ok) {
        alert("Order placed successfully!");
        navigate('/');
      } else {
        console.error("Failed to place order:", response.status);
      }
    } catch (error) {
      console.error("Error placing order:", error.message);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading product details...</p>
        <div className="spinner"></div> {/* Add a spinner for better UX */}
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="loading-container">
        <p>Product not found. Please try again later.</p>
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

      <button onClick={handleOrder}>Order</button>
      <button onClick={() => navigate('/home')}>Back</button>
    </div>
  );
};

export default BuyNowPage;
