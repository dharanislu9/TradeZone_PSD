import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import HomePage from './components/HomePage';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';

// Test cases for HomePage component
describe('HomePage Component', () => {
  test('renders HomePage with logo and navigation links', () => {
    render(
      <Router>
        <HomePage />
      </Router>
    );

    expect(screen.getByText('TradeZone')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  test('toggles profile dropdown menu', () => {
    render(
      <Router>
        <HomePage />
      </Router>
    );

    fireEvent.click(screen.getByText('Profile'));
    expect(screen.getByText('My Details')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('logs out and navigates to login page', () => {
    render(
      <Router>
        <HomePage />
      </Router>
    );

    fireEvent.click(screen.getByText('Profile'));
    fireEvent.click(screen.getByText('Logout'));
    expect(localStorage.getItem('token')).toBeNull();
  });

  test('renders image scroll section', () => {
    render(
      <Router>
        <HomePage />
      </Router>
    );

    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
  });
});

// Test cases for Login component
describe('Login Component', () => {
  test('renders Login form with email and password fields', () => {
    render(
      <Router>
        <Login />
      </Router>
    );

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  test('displays error message for invalid credentials', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Login failed' }),
      })
    );

    render(
      <Router>
        <Login />
      </Router>
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getAllByText('Login')[1]);

    await waitFor(() => {
      expect(screen.getByText(/Login failed/i)).toBeInTheDocument();
    });
  });

  test('navigates to homepage after successful login', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: 'mockToken' }),
      })
    );

    render(
      <Router>
        <Login />
      </Router>
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getAllByText('Login')[1]);

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('mockToken');
    });
  });

  
});

// Test cases for Register component
describe('Register Component', () => {
  test('renders Register form with all fields', () => {
    render(
      <Router>
        <Register />
      </Router>
    );

    expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Phone Number')).toBeInTheDocument();
  });

  test('displays error when passwords do not match', async () => {
    render(
      <Router>
        <Register />
      </Router>
    );

    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'password456' } });
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });

  

  test('successfully submits registration form with valid data', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Registration successful' }),
      })
    );

    render(
      <Router>
        <Register />
      </Router>
    );

    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Address'), { target: { value: '123 Main St' } });
    fireEvent.change(screen.getByPlaceholderText('Phone Number'), { target: { value: '1234567890' } });
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.getByText(/Registration successful/i)).toBeInTheDocument();
    });
  });
});

// Test cases for Profile component
describe('Profile Component', () => {
  test('renders Profile form with user data fields', () => {
    render(
      <Router>
        <Profile />
      </Router>
    );

    expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Phone')).toBeInTheDocument();
  });

  test('fetches and displays user data', async () => {
    const mockUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUser),
      })
    );

    render(
      <Router>
        <Profile />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument();
    });
  });

  test('displays error when failing to fetch user data', async () => {
    global.fetch = jest.fn(() => Promise.reject('Fetch error'));

    render(
      <Router>
        <Profile />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText(/Could not load user data/i)).toBeInTheDocument();
    });
  });

  test('updates profile successfully with valid data', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Profile updated successfully' }),
      })
    );

    render(
      <Router>
        <Profile />
      </Router>
    );

    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'Jane' } });
    fireEvent.click(screen.getByText('Update Profile'));

    await waitFor(() => {
      expect(screen.getByText(/Profile updated successfully/i)).toBeInTheDocument();
    });
  });

  
});
