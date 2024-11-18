import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null); // State to hold fetched product data
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [worth, setWorth] = useState(50);
  const [message, setMessage] = useState('');

  // Fetch the product details when the component mounts
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/products/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
          setDescription(data.description);
          setPrice(data.price);
          setWorth(data.worth || 50); // Set worth with a default of 50 if it's not provided
        } else {
          setMessage("Product not found");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setMessage("Error fetching product");
      }
    };

    fetchProduct();
  }, [id]);


  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

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
        setMessage("Product updated successfully");
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || "Failed to update product");
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Failed to update product');
    }
  };

  if (message === "Product not found") {
    return <div>{message}</div>;
  }

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="product-details">
      <img src={`http://localhost:5001/${product.imagePath}`} alt={product.title || "Product"} className="product-image" />
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
        <button type="submit" className="submit-button">Update Product</button>
      </form>
      {message && <p className="response-message">{message}</p>}
    </div>
  );
};

export default ProductDetails;
