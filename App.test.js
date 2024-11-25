
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import userEvent from '@testing-library/user-event';



describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear(); // Clear localStorage before each test
  });

  it('redirects to landing page by default', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/Landing Page/i)).toBeInTheDocument();
  });

  it('navigates to login when accessing /home while not logged in', () => {
    render(
      <MemoryRouter initialEntries={['/home']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });

  it('renders HomePage when accessing /home while logged in', () => {
    localStorage.setItem('isLoggedIn', 'true');
    render(
      <MemoryRouter initialEntries={['/home']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/Home Page/i)).toBeInTheDocument();
  });

  it('renders Profile when accessing /profile while logged in', () => {
    localStorage.setItem('isLoggedIn', 'true');
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/Profile/i)).toBeInTheDocument();
  });

  it('navigates to login when accessing /profile while not logged in', () => {
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });

  it('renders CategoryList when accessing /categories', () => {
    render(
      <MemoryRouter initialEntries={['/categories']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/Categories/i)).toBeInTheDocument();
  });

  it('renders EventList when accessing /events', () => {
    render(
      <MemoryRouter initialEntries={['/events']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/Events and Limited Sales/i)).toBeInTheDocument();
  });

  it('updates login state on logout', () => {
    localStorage.setItem('isLoggedIn', 'true');
    render(
      <MemoryRouter initialEntries={['/home']}>
        <App />
      </MemoryRouter>
    );

    const logoutButton = screen.getByText(/Logout/i); // Assuming a "Logout" button exists in HomePage
    userEvent.click(logoutButton);

    expect(localStorage.getItem('isLoggedIn')).toBe(null);
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });
});// src/App.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import userEvent from '@testing-library/user-event';

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear(); // Clear localStorage before each test
  });

  it('redirects to landing page by default', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/Landing Page/i)).toBeInTheDocument();
  });

  it('navigates to login when accessing /home while not logged in', () => {
    render(
      <MemoryRouter initialEntries={['/home']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });

  it('renders HomePage when accessing /home while logged in', () => {
    localStorage.setItem('isLoggedIn', 'true');
    render(
      <MemoryRouter initialEntries={['/home']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/Home Page/i)).toBeInTheDocument();
  });

  it('renders Profile when accessing /profile while logged in', () => {
    localStorage.setItem('isLoggedIn', 'true');
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/Profile/i)).toBeInTheDocument();
  });

  it('navigates to login when accessing /profile while not logged in', () => {
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });

  it('renders CategoryList when accessing /categories', () => {
    render(
      <MemoryRouter initialEntries={['/categories']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/Categories/i)).toBeInTheDocument();
  });

  it('renders EventList when accessing /events', () => {
    render(
      <MemoryRouter initialEntries={['/events']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/Events and Limited Sales/i)).toBeInTheDocument();
  });

  it('updates login state on logout', () => {
    localStorage.setItem('isLoggedIn', 'true');
    render(
      <MemoryRouter initialEntries={['/home']}>
        <App />
      </MemoryRouter>
    );

    const logoutButton = screen.getByText(/Logout/i); // Assuming a "Logout" button exists in HomePage
    userEvent.click(logoutButton);

    expect(localStorage.getItem('isLoggedIn')).toBe(null);
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });
});