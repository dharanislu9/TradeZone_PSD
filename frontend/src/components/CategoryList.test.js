import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CategoryList from './CategoryList';
import axios from 'axios';
import { BrowserRouter as Router } from 'react-router-dom';
import { act } from 'react-dom/test-utils';

await act(async () => {
    render(
      <Router>
        <CategoryList />
      </Router>
    );
  });
  
  // Check if loading text is displayed initially
  expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  
  // Wait for categories to be displayed after fetching
  await waitFor(() => {
    expect(screen.getByText(/category 1/i)).toBeInTheDocument();
    expect(screen.getByText(/category 2/i)).toBeInTheDocument();
  });
  
  // Check if the category details are displayed correctly
  expect(screen.getByText('Subcategory 1')).toBeInTheDocument();
  expect(screen.getByText('Subcategory 2')).toBeInTheDocument();

  await act(async () => {
    render(
      <Router>
        <CategoryList />
      </Router>
    );
  });
  
  // Check if the error message is displayed
  await waitFor(() => {
    expect(screen.getByText(/failed to fetch categories/i)).toBeInTheDocument();
  });