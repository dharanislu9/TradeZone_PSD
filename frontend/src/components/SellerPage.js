import React, { useState } from 'react';
import './SellerPage.css'; // Import your CSS file

const SellerPage = () => {
  // State to hold the form data
  const [formData, setFormData] = useState({
    image: null,
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
  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submit logic here
    console.log('Form Data:', formData);
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
