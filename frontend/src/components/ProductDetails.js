import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import './ProductDetails.css';


const ProductDetails = () => {
  const { id } = useParams();
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [worth, setWorth] = useState(50);
  const [message, setMessage] = useState('');


  const productImages = {
    1: "https://th.bing.com/th/id/OIP.qwy2jAdkv5p4kmRI5b02fwHaHa?w=179&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7",
    2: "https://www.lowergear.com/img/cms/resizedIMG_20221211_132326907.jpg",
    3: "https://i.ebayimg.com/00/s/NzY4WDEwMjQ=/z/eeIAAOSwjatbugiE/$_86.JPG",
    4: "https://th.bing.com/th/id/OIP.mDbfiLwyexcVa2e0iXz8RgHaFj?rs=1&pid=ImgDetMain",
  };


  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission


    const productData = { description, price, worth };


    try {
      const response = await fetch('http://localhost:5001/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });


      if (response.ok) {
        const data = await response.json();
        setMessage(data.message); // Set success message
        // Optionally, reset form fields after successful submission
        setDescription('');
        setPrice('');
        setWorth(50);
      } else {
        const errorData = await response.json();
        setMessage(errorData.message); // Set error message
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Failed to save product.');
    }
  };


  return (
    <div className="product-details">
      <img src={productImages[id]} alt={`Product ${id}`} className="product-image" />
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
      {message && <p className="response-message">{message}</p>}
    </div>
  );
};


export default ProductDetails;