import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Initialize navigate hook
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [worth, setWorth] = useState(50);
  const [message, setMessage] = useState('');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [saved, setSaved] = useState(false); // Track if the product is saved

  // Fetch product details from the backend on component mount
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5001/products/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data); // Update the product state with fetched data
          setDescription(data.description || '');
          setPrice(data.price || '');
          setWorth(data.worth || 50);
        } else {
          console.error("Failed to fetch product details");
          setMessage("Failed to load product details.");
        }
      } catch (error) {
        console.error("Error fetching product details:", error.message);
        setMessage("Error fetching product details.");
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchProductDetails();
  }, [id]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Check if the data is valid
    if (!description || !price || !worth) {
      setMessage('Please fill out all fields');
      return;
    }

    const productData = { description, price, worth };

    try {
      const response = await fetch(`http://localhost:5001/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message || 'Product saved successfully!');
        setSaved(true); // Set saved state to true after successful submission
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Failed to save product.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error: Failed to save product.');
    }
  };

  // Loading or error handling state
  if (loading) {
    return <div>Loading product details...</div>; // More specific loading message
  }

  if (!product) {
    return <div>Product not found.</div>; // In case no product is found
  }

  return (
    <div className="product-details">
      {/* Display product image */}
      <img
        src={product.imagePath ? `http://localhost:5001/${product.imagePath}` : "https://via.placeholder.com/300"}
        alt={product.description}
        className="product-image"
      />

      <form className="product-info" onSubmit={handleSubmit}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter product description"
          className="description-box"
          required
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Set price (USD)"
          className="price-input"
          required
        />
        <div className="worth-slider">
          <label>Worthiness: {worth}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={worth}
            onChange={(e) => setWorth(e.target.value)}
          />
        </div>

        <button type="submit" className="submit-button">Save Product</button>
      </form>

      {/* Back Button */}
      <button className="back-button" onClick={() => navigate('/home')}>
        ← Back to Home
      </button>

      {/* Display message */}
      {message && <p className="response-message">{message}</p>}
    </div>
  );
};

export default ProductDetails;
