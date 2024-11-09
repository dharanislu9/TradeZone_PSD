import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  // Fetch the username from localStorage on component mount
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    console.log("Stored username:", storedUsername); // Debug log
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Handle logout logic
  const handleLogout = () => {
    console.log("Logging out..."); // Debug log
    localStorage.removeItem('authToken'); // Ensure correct key is cleared
    localStorage.removeItem('username');
    navigate('/'); // Redirect to the landing page after logout
  };

  // Debugging: Ensure that "Shop Now" button links correctly
  const handleShopNowClick = () => {
    console.log("Navigating to /home"); // Debug log for button click
    navigate('/home');
  };

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-left">
          <div className="logo-container">
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-icon">
              <path d="M3 3H21V7C21 7.79565 20.6839 8.55871 20.1213 9.12132C19.5587 9.68393 18.7956 10 18 10H6C5.20435 10 4.44129 9.68393 3.87868 9.12132C3.31607 8.55871 3 7.79565 3 7V3ZM7 14H10V20H7V14ZM14 14H17V20H14V14ZM5 12H19V22H5V12Z" fill="#00E676"/>
            </svg>
            <h1 className="logo-text">TradeZone</h1>
          </div>
        </div>

        <div className="navbar-center">
          <input type="text" placeholder="Search for product..." className="search-bar" />
        </div>

        <div className="navbar-right">
          <Link to="/seller-page" className="become-seller">Become Seller</Link>
          {username ? (
            <div className="dropdown">
              <button className="dropdown-toggle" onClick={toggleDropdown}>
                {username}
              </button>
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <button className="dropdown-item" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="login-btn">Login</Link>
          )}
        </div>
      </nav>

      <section className="banner">
        <div className="banner-content">
          <h1>TradeZone</h1>
          <p>
            TradeZone is a secondhand goods marketplace designed to facilitate the buying, selling, and trading of pre-owned electronics. Our app also features trade-in facilities where two sellers can exchange products, and collaborates with third-party repair shops. Our platform promotes sustainability by extending the life of products and providing users with an affordable alternative to new items.
          </p>
          {/* Button to navigate to /home */}
          <button className="shop-now" onClick={handleShopNowClick}>Shop Now</button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
