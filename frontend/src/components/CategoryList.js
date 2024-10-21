// src/components/CategoryList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './CategoryList.css';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories');
        setCategories(response.data.categories);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch categories');
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="category-list">
      <h2>Categories</h2>
      <div className="categories-container">
        {categories.map((category) => (
          <Link 
            key={category._id} 
            to={'/categories/${category._id}'}  // Send the category ID in the URL
            className="category-item"
          >
            <img src={category.image_Url} alt={category.title} />
            <h3>{category.title}</h3>
            <p>{category.subTitle}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryList;