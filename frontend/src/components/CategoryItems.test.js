import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CategoryItems from './CategoryItems';
import axios from 'axios';
import { BrowserRouter as Router } from 'react-router-dom';
import { act } from 'react-dom/test-utils';

await act(async () => {
    render(
      <Router>
        <CategoryItems />
      </Router>
    );
  });
  
  // Check if loading text is displayed initially
  expect(screen.getByText(/loading items.../i)).toBeInTheDocument();
  
  // Wait for the items to appear after fetching
  await waitFor(() => {
    expect(screen.getByText(/item 1/i)).toBeInTheDocument();
    expect(screen.getByText(/item 2/i)).toBeInTheDocument();
  });
  
  // Check if item details are displayed correctly
  expect(screen.getByText('$10')).toBeInTheDocument();
  expect(screen.getByText('$20')).toBeInTheDocument();

  await act(async () => {
    render(
      <Router>
        <CategoryItems />
      </Router>
    );
  });
  
  // Check if the error message is displayed
  await waitFor(() => {
    expect(screen.getByText(/failed to fetch items/i)).toBeInTheDocument();
  });