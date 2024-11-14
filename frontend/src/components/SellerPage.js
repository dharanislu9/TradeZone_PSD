import React, { useState } from 'react';
import './SellerPage.css';

const SellerPage = () => {
  // State to hold the form data
  const [formData, setFormData] = useState({
    image: null,
    title: '',
    description: '',
    price: '',
  });

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

    // Create FormData object to send as multipart/form-data
    const form = new FormData();
    form.append('image', formData.image); // Add image file to FormData
    form.append('title', formData.title);
    form.append('description', formData.description);
    form.append('price', formData.price);

    try {
      const response = await fetch("http://localhost:5001/api/products", {
        method: "POST",
        body: form,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Product created successfully:', data);
        // Optionally reset the form
        setFormData({
          image: null,
          title: '',
          description: '',
          price: '',
        });
      } else {
        console.error('Failed to create product');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="seller-page">
      <h2>Sell Your Product</h2>
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

        {/* Submit Button */}
        <button type="submit" className="submit-button">Submit Product</button>
      </form>
    </div>
  );
};

export default SellerPage;
