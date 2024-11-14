// src/components/CategoryItems.js
import React from 'react';
import { useParams } from 'react-router-dom';

const CategoryItems = () => {
  const { categoryId } = useParams();

  return (
    <div>
      <h2>Category Details</h2>
      <p>Displaying items for category ID: {categoryId}</p>
      {/* Fetch and display details or items based on categoryId */}
    </div>
  );
};

export default CategoryItems;