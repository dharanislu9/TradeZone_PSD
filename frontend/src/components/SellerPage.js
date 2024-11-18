import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SellerPage.css';

const SellerPage = () => {
  const [formData, setFormData] = useState({
    image: null,
    title: '',
    description: '',
    price: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageUpload = (e) => {
    setFormData({
      ...formData,
      image: e.target.files[0],
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image || !formData.title || !formData.description || !formData.price) {
      alert('Please fill out all fields.');
      return;
    }
    setLoading(true); // Start loading
    const data = new FormData();
    data.append('image', formData.image);
    data.append('title', formData.title); // Fixed the issue here
    data.append('description', formData.description);
    data.append('price', formData.price);

    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('You need to be logged in to submit a product.');
      setLoading(false);
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

      if (response.ok) {
        setSuccessMessage('Product submitted successfully!');
        setFormData({ image: null, title: '', description: '', price: '' });
        setTimeout(() => {
          setSuccessMessage('');
          navigate('/');
        }, 2000);
      } else {
        const errorData = await response.json();
        alert(`Failed to submit product: ${errorData.error}`);
      }
    } catch (error) {
      alert('An error occurred while submitting the product. Please try again.');
    } finally {
      setLoading(false); // Stop loading
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

        {/* Title Field */}
        <div className="form-group">
          <label htmlFor="title">Product Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter the product title"
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
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Product'}
        </button>
        <button type="button" onClick={() => navigate('/')}>Back</button>
      </form>
    </div>
  );
};

export default SellerPage;
