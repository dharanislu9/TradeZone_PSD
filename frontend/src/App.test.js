import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import HomePage from './components/HomePage';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import SellerPage from './components/SellerPage';

// Mock global fetch function
global.fetch = jest.fn();

// HomePage Component Tests
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

  test('renders image scroll section or shows "No products available" placeholder', () => {
    render(
      <Router>
        <HomePage />
      </Router>
    );

    const placeholderText = screen.queryByText(/No products available/i);
    if (placeholderText) {
      expect(placeholderText).toBeInTheDocument();
    } else {
      const images = screen.queryAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    }
  });
});

// Login Component Tests
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
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Login failed' }),
    });

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
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'mockToken' }),
    });

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

// Register Component Tests
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
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Registration successful' }),
    });

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

// Profile Component Tests
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

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });

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
    global.fetch.mockRejectedValueOnce(new Error('Fetch error'));

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
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Profile updated successfully' }),
    });

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

// SellerPage Component Tests
describe('SellerPage Component', () => {
  test('renders SellerPage with all input fields', () => {
    render(
      <Router>
        <SellerPage />
      </Router>
    );

    expect(screen.getByLabelText(/Product Image:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Product Title:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Product Description:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Product Price/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit Product/i })).toBeInTheDocument();
  });

  test('updates input fields correctly in SellerPage', () => {
    render(
      <Router>
        <SellerPage />
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/Product Title:/i), { target: { value: 'Test Product' } });
    fireEvent.change(screen.getByLabelText(/Product Description:/i), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText(/Product Price/i), { target: { value: '100' } });

    expect(screen.getByLabelText(/Product Title:/i).value).toBe('Test Product');
    expect(screen.getByLabelText(/Product Description:/i).value).toBe('Test Description');
    expect(screen.getByLabelText(/Product Price/i).value).toBe('100');
  });

  test('handles image upload in SellerPage', () => {
    render(
      <Router>
        <SellerPage />
      </Router>
    );

    const file = new File(['dummy image content'], 'test-image.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/Product Image:/i);

    fireEvent.change(input, { target: { files: [file] } });

    expect(input.files[0]).toBe(file);
    expect(input.files).toHaveLength(1);
  });

  test('submits the form and resets inputs on successful submission', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Product created successfully' }),
    });

    render(
      <Router>
        <SellerPage />
      </Router>
    );

    // Fill the form fields
    fireEvent.change(screen.getByLabelText(/Product Title:/i), { target: { value: 'Test Product' } });
    fireEvent.change(screen.getByLabelText(/Product Description:/i), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText(/Product Price/i), { target: { value: '100' } });

    const file = new File(['dummy image content'], 'test-image.jpg', { type: 'image/jpeg' });
    fireEvent.change(screen.getByLabelText(/Product Image:/i), { target: { files: [file] } });

    fireEvent.click(screen.getByRole('button', { name: /Submit Product/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // Verify if form data is reset after successful submission
    await waitFor(() => {
      expect(screen.getByLabelText(/Product Title:/i).value).toBe('');
      expect(screen.getByLabelText(/Product Description:/i).value).toBe('');
      expect(screen.getByLabelText(/Product Price/i).value).toBe('');
      expect(screen.getByLabelText(/Product Image:/i).value).toBe('');
    });
  });
});