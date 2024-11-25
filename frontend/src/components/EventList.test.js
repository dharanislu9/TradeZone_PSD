// src/components/EventList.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import EventList from './EventList';

const server = setupServer(
  
  rest.get('http://localhost:5001/api/events', (req, res, ctx) => {
    return res(
      ctx.json({
        events: [
          {
            _id: '1',
            title: 'Black Friday Sale',
            description: 'Get up to 70% off on selected items!',
            startDate: '2024-11-25T00:00:00Z',
            endDate: '2024-11-30T23:59:59Z',
            imageUrl: 'http://example.com/black-friday.jpg'
          },
          {
            _id: '2',
            title: 'Christmas Special',
            description: 'Exclusive discounts on holiday collections.',
            startDate: '2024-12-20T00:00:00Z',
            endDate: '2024-12-25T23:59:59Z',
            imageUrl: 'http://example.com/christmas-special.jpg'
          },
        ]
      })
    );
  })
);


beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('EventList Component', () => {
  it('displays loading initially', () => {
    render(<EventList />);

    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  it('displays events after successful fetch', async () => {
    render(<EventList />);

    await waitFor(() => {
      expect(screen.getByText('Events and Limited Sales')).toBeInTheDocument();
      expect(screen.getByText('Black Friday Sale')).toBeInTheDocument();
      expect(screen.getByText('Get up to 70% off on selected items!')).toBeInTheDocument();
      expect(screen.getByText('Christmas Special')).toBeInTheDocument();
      expect(screen.getByText('Exclusive discounts on holiday collections.')).toBeInTheDocument();
    });

    const images = screen.getAllByRole('img');
    expect(images[0]).toHaveAttribute('src', 'http://example.com/black-friday.jpg');
    expect(images[1]).toHaveAttribute('src', 'http://example.com/christmas-special.jpg');
  });

  it('displays error message on fetch failure', async () => {
    // Mock the API to return an error
    server.use(
      rest.get('http://localhost:5001/api/events', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    render(<EventList />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch events')).toBeInTheDocument();
    });
  });
});