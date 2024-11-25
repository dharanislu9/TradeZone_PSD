

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import CategoryList from './CategoryList';

// Mock server setup
const server = setupServer(
  // Mock for successful category fetch
  rest.get('http://localhost:5001/api/categories', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          _id: '1',
          title: 'Electronics',
          subTitle: 'Phones, Laptops, and more',
          image_Url: 'http://example.com/electronics.jpg',
        },
        {
          _id: '2',
          title: 'Clothing',
          subTitle: 'Men and Women',
          image_Url: 'http://example.com/clothing.jpg',
        },
      ])
    );
  })
);

// Enable the mock server before tests and reset it after each test
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CategoryList Component', () => {
  it('displays loading initially', () => {
    render(
      <BrowserRouter>
        <CategoryList />
      </BrowserRouter>
    );

    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  it('displays categories after successful fetch', async () => {
    render(
      <BrowserRouter>
        <CategoryList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Categories')).toBeInTheDocument();
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Phones, Laptops, and more')).toBeInTheDocument();
      expect(screen.getByText('Clothing')).toBeInTheDocument();
      expect(screen.getByText('Men and Women')).toBeInTheDocument();
    });

    const images = screen.getAllByRole('img');
    expect(images[0]).toHaveAttribute('src', 'http://example.com/electronics.jpg');
    expect(images[1]).toHaveAttribute('src', 'http://example.com/clothing.jpg');
  });

  it('displays error message on fetch failure', async () => {
    // Mock the API to return an error
    server.use(
      rest.get('http://localhost:5001/api/categories', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    render(
      <BrowserRouter>
        <CategoryList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch categories')).toBeInTheDocument();
    });
  });
});