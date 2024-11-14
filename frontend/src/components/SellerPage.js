// SellerPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import './SellerPage.css'; // Import your CSS file

const SellerPage = () => {
  const [formData, setFormData] = useState({
    image: null,
    description: '',
    price: '',
  });

  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate inside the component

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    setFormData({
      ...formData,
      image: e.target.files[0],
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create FormData object
    const data = new FormData();
    data.append('image', formData.image);
    data.append('description', formData.description);
    data.append('price', formData.price);

    // Retrieve the token from localStorage right before making the request
    const token = localStorage.getItem('authToken');
    console.log('Auth Token:', token); // Debug log to check token

    // Check if token exists
    if (!token) {
      alert('You need to be logged in to submit a product.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/products', {
        method: 'POST',
        body: data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Check if response is OK
      if (response.ok) {
        setSuccessMessage('Product submitted successfully!');
        setFormData({ image: null, description: '', price: '' });
        
        // Redirect to LandingPage after 2 seconds
        setTimeout(() => navigate('/'), 2000); 
      } else {
        // Extract error message from response
        const errorData = await response.json();
        console.error('Error from server:', errorData);
        alert(`Failed to submit product: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error submitting product:', error);
      alert('An error occurred while submitting the product. Please try again.');
    }
  };

  return (
    <div className="seller-page">
      <h2>Sell Your Product</h2>
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      <form onSubmit={handleSubmit} className="seller-form">
        {/* Image Upload Field */}
        <div className="form-group">
          <label htmlFor="image">Product Image:</label>
          <input 
            type="file" 
            id="image" 
            name="image" 
            accept="image/*" 
            onChange={handleImageUpload} 
            required
          />
        </div>

        {/* Description Field */}
        <div className="form-group">
          <label htmlFor="description">Product Description:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Write a brief description of your product..."
            required
          />
        </div>

        {/* Price Field */}
        <div className="form-group">
          <label htmlFor="price">Product Price ($):</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="Enter the price"
            min="0"
            required
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="submit-button">Submit Product</button>
      </form>
    </div>
  );
};

export default SellerPage;