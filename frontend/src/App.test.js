import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import HomePage from './components/HomePage';
import Login from './components/Login';
import Register from './components/Register';

// Mock axios
jest.mock('axios');

// Mock useNavigate from react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('Dashboard.js Tests', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'fakeToken');
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('redirects to login page if token is missing', async () => {
    localStorage.removeItem('token');
    renderWithRouter(<Dashboard />);
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'));
  });

  test('updates profile details successfully', async () => {
    const mockUserData = { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' };
    axios.get.mockResolvedValueOnce({ data: mockUserData });
    axios.put.mockResolvedValueOnce({ data: { message: 'Profile updated' } });
    renderWithRouter(<Dashboard />);

    fireEvent.click(await screen.findByText('Edit Profile'));
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'Jane' } });
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => expect(axios.put).toHaveBeenCalled());
  });

  test('displays error when profile update fails', async () => {
    axios.get.mockResolvedValueOnce({ data: { firstName: 'John' } });
    axios.put.mockRejectedValueOnce(new Error('Failed to update'));
    renderWithRouter(<Dashboard />);

    fireEvent.click(await screen.findByText('Edit Profile'));
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => expect(screen.getByText(/Failed to update profile/i)).toBeInTheDocument());
  });

  test('toggles profile edit mode', async () => {
    axios.get.mockResolvedValueOnce({ data: { firstName: 'John' } });
    renderWithRouter(<Dashboard />);

    fireEvent.click(screen.getByText('Edit Profile')); 
    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    });

    
  });

  test('logs out and redirects to login', async () => {
    axios.get.mockResolvedValueOnce({ data: { firstName: 'John' } });
    renderWithRouter(<Dashboard />);

    fireEvent.click(await screen.findByText('Logout'));
    expect(localStorage.getItem('token')).toBeNull();
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'));
  });

  test('displays error if unable to fetch user data', async () => {
    axios.get.mockRejectedValueOnce(new Error('Failed to fetch'));
    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Unable to load user data/i)).toBeInTheDocument();
    });
  });
});

describe('HomePage.js Tests', () => {
  test('renders logo and navigation buttons', () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByText(/TradeZone/i)).toBeInTheDocument();
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    expect(screen.getByText(/Register/i)).toBeInTheDocument();
  });

  test('displays image scroll with images', () => {
    renderWithRouter(<HomePage />);
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
  });

  test('has functional navigation links', () => {
    renderWithRouter(<HomePage />);
    expect(screen.getByText(/Login/i).closest('a')).toHaveAttribute('href', '/login');
    expect(screen.getByText(/Register/i).closest('a')).toHaveAttribute('href', '/register');
  });
});

describe('Login.js Tests', () => {
  test('renders login form', () => {
    renderWithRouter(<Login />);
    expect(screen.getByPlaceholderText(/Enter Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter Password/i)).toBeInTheDocument();
  });

  test('displays error if login fails', async () => {
    axios.post.mockRejectedValueOnce(new Error('Login failed'));
    renderWithRouter(<Login />);

    fireEvent.change(screen.getByPlaceholderText(/Enter Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter Password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));


    await waitFor(() => expect(screen.getByText(/Login failed/i)).toBeInTheDocument());
  });

  test('logs in and redirects to dashboard', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        token: 'fakeToken',
        user: { firstName: 'John', lastName: 'Doe' },
      },
    });
    renderWithRouter(<Login />);

    fireEvent.change(screen.getByPlaceholderText(/Enter Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter Password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('fakeToken');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });    
  });
});
