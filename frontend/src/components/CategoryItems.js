// src/components/CategoryItems.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './CategoryItems.css';

const CategoryItems = () => {
  const { categoryId } = useParams(); // Get the category ID from the URL
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        // Corrected URL with backticks for string interpolation
        const response = await axios.get('http://localhost:8000/api/items?category=${categoryId}');
        setItems(response.data.items); // Assuming backend returns items under "items"
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch items');
        setLoading(false);
      }
    };

    fetchItems();
  }, [categoryId]); // Refetch items when the categoryId changes

  if (loading) return <p>Loading items...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="category-items">
      <h2>Items in this category</h2>
      <div className="items-container">
        {items.map((item) => (
          <div key={item._id} className="item">
            <img src={item.image_Url} alt={item.title} />
            <h3>{item.title}</h3>
            <p>{item.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryItems;