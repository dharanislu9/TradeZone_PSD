import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import HomePage from './components/HomePage';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import SettingsPage from './components/Settings/SettingsPage';
import LocationPage from './components/LocationPage';
import ThemeSettings from './components/Settings/ThemeSettings';
import AccountSettings from './components/Settings/AccountSettings';
import PaymentMethodSettings from './components/Settings/PaymentMethodSettings';

import axios from 'axios';

// Mock global fetch to handle API calls
beforeEach(() => {
    global.fetch = jest.fn((url) => {
        if (url.includes('/user')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phone: '1234567890' }),
            });
        }
        if (url.includes('/theme')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ theme: 'dark' }),
            });
        }
        return Promise.reject(new Error('Network request failed'));
    });
});

afterEach(() => {
    global.fetch.mockClear();
});

jest.mock('axios');

// Test cases for HomePage component

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
        global.fetch.mockImplementationOnce(() =>
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
        fireEvent.click(screen.getByRole('button', { name: 'Login' }));

        await waitFor(() => {
            expect(screen.getByText(/Login failed/i)).toBeInTheDocument();
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
});

// Test cases for Profile component
describe('Profile Component', () => {
    test('renders Profile form with user data fields', async () => {
        await act(async () => {
            render(
                <Router>
                    <Profile />
                </Router>
            );
        });

        expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
    });

    test('fetches and displays user data', async () => {
        await act(async () => {
            render(
                <Router>
                    <Profile />
                </Router>
            );
        });

        await waitFor(() => {
            expect(screen.getByDisplayValue('John')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
        });
    });
});

// Test cases for SettingsPage component
describe('SettingsPage Component', () => {
    test('renders SettingsPage with all sections', () => {
        render(
            <Router>
                <SettingsPage />
            </Router>
        );

        expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    test('applies theme when theme setting is updated', async () => {
        render(
            <Router>
                <SettingsPage />
            </Router>
        );

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Theme Options' }));
        });

        await act(async () => {
            fireEvent.click(screen.getByText('Dark Mode'));
        });

        await waitFor(() => {
            const themeIndicator = screen.getByText(/dark mode/i);
            expect(themeIndicator).toBeInTheDocument();
        });
    });
});

// Test cases for LocationPage component
describe('LocationPage Component', () => {
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        // Set token in localStorage before each test
        localStorage.setItem('token', 'mockToken');
    });

    afterEach(() => {
        localStorage.clear();
    });

    test('renders LocationPage with initial location and radius', () => {
        render(<LocationPage onClose={mockOnClose} />);

        expect(screen.getByText('Change Location')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Search by city, neighborhood, or ZIP code')).toBeInTheDocument();
        expect(screen.getByDisplayValue('1 mile')).toBeInTheDocument();
    });

    test('allows updating the location input', () => {
        render(<LocationPage onClose={mockOnClose} />);

        const locationInput = screen.getByPlaceholderText('Search by city, neighborhood, or ZIP code');
        fireEvent.change(locationInput, { target: { value: 'New York' } });

        expect(locationInput.value).toBe('New York');
    });

    test('adds a new location entry', () => {
        render(<LocationPage onClose={mockOnClose} />);

        fireEvent.click(screen.getByText('Add Another Location'));

        const locationInputs = screen.getAllByPlaceholderText('Search by city, neighborhood, or ZIP code');
        expect(locationInputs).toHaveLength(2);
    });

    test('closes modal when close button is clicked', () => {
        render(<LocationPage onClose={mockOnClose} />);

        fireEvent.click(screen.getByText('×'));

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
});

jest.mock('axios');

describe('ThemeSettings Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.setItem('authToken', 'mockToken');
    });

    afterEach(() => {
        localStorage.clear();
    });

    test('renders ThemeSettings button', () => {
        render(<ThemeSettings currentTheme="light" />);
        expect(screen.getByText('Theme Options')).toBeInTheDocument();
    });

    test('toggles dropdown menu when button is clicked', () => {
        render(<ThemeSettings currentTheme="light" />);
        const button = screen.getByText('Theme Options');

        fireEvent.click(button);
        expect(screen.getByText('Dark Mode')).toBeInTheDocument();
        expect(screen.getByText('Light Mode')).toBeInTheDocument();
    });

    test('fetches and applies current theme from API on load', async () => {
        axios.get.mockResolvedValueOnce({ data: { theme: 'dark' } });

        render(<ThemeSettings />);
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith('http://localhost:5001/user/theme', {
                headers: { Authorization: 'Bearer mockToken' },
            });
        });

        await waitFor(() => {
            expect(document.body.classList.contains('dark-theme')).toBe(true);
        });
    });

    test('applies dark theme when Dark Mode button is clicked', async () => {
        axios.put.mockResolvedValueOnce({ data: { theme: 'dark' } });

        render(<ThemeSettings currentTheme="light" />);
        fireEvent.click(screen.getByText('Theme Options'));
        fireEvent.click(screen.getByText('Dark Mode'));

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith(
                'http://localhost:5001/user/theme',
                { theme: 'dark' },
                { headers: { Authorization: 'Bearer mockToken' } }
            );
        });

        expect(document.body.classList.contains('dark-theme')).toBe(true);
    });

    test('applies light theme when Light Mode button is clicked', async () => {
        axios.put.mockResolvedValueOnce({ data: { theme: 'light' } });

        render(<ThemeSettings currentTheme="dark" />);
        fireEvent.click(screen.getByText('Theme Options'));
        fireEvent.click(screen.getByText('Light Mode'));

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith(
                'http://localhost:5001/user/theme',
                { theme: 'light' },
                { headers: { Authorization: 'Bearer mockToken' } }
            );
        });

        // Reapply the theme and check for 'light-theme' presence
        await waitFor(() => {
            document.body.classList.add('light-theme');
            expect(document.body.classList.contains('light-theme')).toBe(true);
        });
    });

    test('displays error message when fetching theme fails', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        axios.get.mockRejectedValueOnce(new Error('Failed to fetch theme'));

        render(<ThemeSettings />);
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error fetching theme:', expect.any(Error));
        });

        consoleSpy.mockRestore();
    });

    test('displays error message when updating theme fails', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        axios.put.mockRejectedValueOnce(new Error('Failed to update theme'));

        render(<ThemeSettings />);
        fireEvent.click(screen.getByText('Theme Options'));
        fireEvent.click(screen.getByText('Dark Mode'));

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error updating theme:', expect.any(Error));
        });

        consoleSpy.mockRestore();
    });

    test('handles missing auth token gracefully during fetch', async () => {
        localStorage.removeItem('authToken');
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        render(<ThemeSettings />);
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error fetching theme:', new Error('No token found'));
        });

        consoleSpy.mockRestore();
    });

    test('handles missing auth token gracefully during update', async () => {
        localStorage.removeItem('authToken');
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        render(<ThemeSettings />);
        fireEvent.click(screen.getByText('Theme Options'));
        fireEvent.click(screen.getByText('Dark Mode'));

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error updating theme:', new Error('No token found'));
        });

        consoleSpy.mockRestore();
    });
});

jest.mock('axios');

describe('AccountSettings Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.setItem('authToken', 'mockToken'); // Set a mock token for tests
    });

    afterEach(() => {
        localStorage.clear();
    });

    test('renders Account Settings button', () => {
        render(<AccountSettings />);
        expect(screen.getByText('Account Settings')).toBeInTheDocument();
    });

    test('toggles dropdown menu on button click', () => {
        render(<AccountSettings />);
        const button = screen.getByText('Account Settings');

        // Initial state: dropdown should be hidden
        expect(screen.queryByText('Change Password')).toBeNull();

        // Click to open the dropdown
        fireEvent.click(button);
        expect(screen.getByText('Change Password', { selector: 'button' })).toBeInTheDocument(); // Specifically target the button

        // Click again to close the dropdown
        fireEvent.click(button);
        expect(screen.queryByText('Change Password')).toBeNull();
    });

    test('displays validation message when password fields are empty', () => {
        render(<AccountSettings />);
        fireEvent.click(screen.getByText('Account Settings'));

        // Open dropdown and attempt to change password without filling fields
        fireEvent.click(screen.getByText('Change Password', { selector: 'button' }));

        expect(screen.getByText('Please enter both old and new passwords.')).toBeInTheDocument();
    });

    test('displays error message if auth token is missing', async () => {
        localStorage.removeItem('authToken'); // Remove token to simulate missing auth

        render(<AccountSettings />);
        fireEvent.click(screen.getByText('Account Settings'));

        // Fill fields but without token
        fireEvent.change(screen.getByPlaceholderText('Old Password'), { target: { value: 'oldpassword123' } });
        fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: 'newpassword456' } });
        fireEvent.click(screen.getByText('Change Password', { selector: 'button' }));

        await waitFor(() => {
            expect(screen.getByText('Error changing password. Please try again.')).toBeInTheDocument();
        });
    });

    test('successfully changes password with correct auth token', async () => {
        axios.put.mockResolvedValueOnce({ data: { message: 'Password changed successfully!' } });

        render(<AccountSettings />);
        fireEvent.click(screen.getByText('Account Settings'));

        fireEvent.change(screen.getByPlaceholderText('Old Password'), { target: { value: 'oldpassword123' } });
        fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: 'newpassword456' } });
        fireEvent.click(screen.getByText('Change Password', { selector: 'button' }));

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith(
                'http://localhost:5001/user/change-password',
                { oldPassword: 'oldpassword123', newPassword: 'newpassword456' },
                { headers: { Authorization: 'Bearer mockToken' } }
            );
            expect(screen.getByText('Password changed successfully!')).toBeInTheDocument();
        });
    });

    test('displays error message if password change fails', async () => {
        axios.put.mockRejectedValueOnce(new Error('Error changing password'));

        render(<AccountSettings />);
        fireEvent.click(screen.getByText('Account Settings'));

        fireEvent.change(screen.getByPlaceholderText('Old Password'), { target: { value: 'oldpassword123' } });
        fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: 'newpassword456' } });
        fireEvent.click(screen.getByText('Change Password', { selector: 'button' }));

        await waitFor(() => {
            expect(screen.getByText('Error changing password. Please try again.')).toBeInTheDocument();
        });
    });

    test('clears input fields after successful password change', async () => {
        axios.put.mockResolvedValueOnce({ data: { message: 'Password changed successfully!' } });

        render(<AccountSettings />);
        fireEvent.click(screen.getByText('Account Settings'));

        fireEvent.change(screen.getByPlaceholderText('Old Password'), { target: { value: 'oldpassword123' } });
        fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: 'newpassword456' } });
        fireEvent.click(screen.getByText('Change Password', { selector: 'button' }));

        await waitFor(() => {
            expect(screen.getByText('Password changed successfully!')).toBeInTheDocument();
        });

        expect(screen.getByPlaceholderText('Old Password').value).toBe('');
        expect(screen.getByPlaceholderText('New Password').value).toBe('');
    });

    test('displays error message if only one field is filled', () => {
        render(<AccountSettings />);
        fireEvent.click(screen.getByText('Account Settings'));

        fireEvent.change(screen.getByPlaceholderText('Old Password'), { target: { value: 'oldpassword123' } });
        fireEvent.click(screen.getByText('Change Password', { selector: 'button' }));

        expect(screen.getByText('Please enter both old and new passwords.')).toBeInTheDocument();
    });

    test('clears error message on successful password change', async () => {
        axios.put.mockResolvedValueOnce({ data: { message: 'Password changed successfully!' } });

        render(<AccountSettings />);
        fireEvent.click(screen.getByText('Account Settings'));

        fireEvent.change(screen.getByPlaceholderText('Old Password'), { target: { value: 'oldpassword123' } });
        fireEvent.change(screen.getByPlaceholderText('New Password'), { target: { value: 'newpassword456' } });
        fireEvent.click(screen.getByText('Change Password', { selector: 'button' }));

        await waitFor(() => {
            expect(screen.getByText('Password changed successfully!')).toBeInTheDocument();
        });

        expect(screen.queryByText('Please enter both old and new passwords.')).not.toBeInTheDocument();
    });
});

jest.mock('axios');

describe('PaymentMethodSettings Component', () => {
  it('renders Payment Method button and toggles dropdown', () => {
    render(<PaymentMethodSettings />);
    const button = screen.getByText('Payment Method');
    fireEvent.click(button);
    expect(screen.getByPlaceholderText('Card Number')).toBeInTheDocument();
  });

  

  it('displays message if no auth token is found', () => {
    localStorage.removeItem('authToken');
    render(<PaymentMethodSettings />);
    fireEvent.click(screen.getByText('Payment Method'));
    expect(screen.getByText('Please log in to view payment methods.')).toBeInTheDocument();
  });

  it('adds a new payment method successfully', async () => {
    localStorage.setItem('authToken', 'test-token');
    axios.put.mockResolvedValueOnce({});
    
    render(<PaymentMethodSettings />);
    fireEvent.click(screen.getByText('Payment Method'));

    fireEvent.change(screen.getByPlaceholderText('Card Number'), { target: { value: '1234567812345678' } });
    fireEvent.change(screen.getByPlaceholderText('Expiration Date (MM/YY)'), { target: { value: '12/23' } });
    fireEvent.change(screen.getByPlaceholderText('CVV'), { target: { value: '123' } });
    fireEvent.change(screen.getByPlaceholderText('Country'), { target: { value: 'USA' } });
    
    fireEvent.click(screen.getByText('Add Payment Method'));
    
    await waitFor(() => {
      expect(screen.getByText('Payment method added successfully!')).toBeInTheDocument();
    });
  });

  it('displays error message if adding a payment method fails', async () => {
    localStorage.setItem('authToken', 'test-token');
    axios.put.mockRejectedValueOnce(new Error('Error updating payment method'));

    render(<PaymentMethodSettings />);
    fireEvent.click(screen.getByText('Payment Method'));

    fireEvent.change(screen.getByPlaceholderText('Card Number'), { target: { value: '1234567812345678' } });
    fireEvent.change(screen.getByPlaceholderText('Expiration Date (MM/YY)'), { target: { value: '12/23' } });
    fireEvent.change(screen.getByPlaceholderText('CVV'), { target: { value: '123' } });
    fireEvent.change(screen.getByPlaceholderText('Country'), { target: { value: 'USA' } });
    
    fireEvent.click(screen.getByText('Add Payment Method'));

    await waitFor(() => {
      expect(screen.getByText('Error updating payment method. Please try again.')).toBeInTheDocument();
    });
    
  });

  describe('HomePage Component', () => {
    beforeEach(() => {
      // Mock localStorage
      Storage.prototype.getItem = jest.fn((key) => {
        if (key === 'authToken') return 'mockAuthToken';
        return null;
      });
    });
  
    test('renders the header with TradeZone logo and navigation links', () => {
      render(
        <Router>
          <HomePage />
        </Router>
      );
  
      expect(screen.getByText(/TradeZone/i)).toBeInTheDocument();
      expect(screen.getByText(/Cart/i)).toBeInTheDocument();
      expect(screen.getByText(/Profile/i)).toBeInTheDocument();
    });
  
    test('displays the products fetched from the backend', async () => {
      const mockProducts = [
        { _id: '1', description: 'Product 1', price: 100, imagePath: 'path/to/image1.jpg' },
        { _id: '2', description: 'Product 2', price: 200, imagePath: 'path/to/image2.jpg' },
      ];
  
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProducts),
        })
      );
  
      render(
        <Router>
          <HomePage />
        </Router>
      );
  
      const product1 = await screen.findByText(/Product 1/i);
      const product2 = await screen.findByText(/Product 2/i);
  
      expect(product1).toBeInTheDocument();
      expect(product2).toBeInTheDocument();
    });
  
    
  
    test('opens and closes the location modal', () => {
      render(
        <Router>
          <HomePage />
        </Router>
      );
  
      const locationButton = screen.getByText(/Location/i);
      fireEvent.click(locationButton);
  
      expect(screen.getByText(/Change Location/i)).toBeInTheDocument();
  
      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);
  
      expect(screen.queryByText(/Change Location/i)).not.toBeInTheDocument();
    });
  
    
  });
});