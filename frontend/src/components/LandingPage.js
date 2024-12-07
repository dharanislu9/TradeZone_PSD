import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    navigate('/');
  };

  const handleShopNowClick = () => {
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

        

        <div className="navbar-right">
          {username ? (
            <div className="dropdown">
              <button className="common-button" onClick={toggleDropdown}>
                {username}
              </button>
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <button className="dropdown-item" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="common-button">Login</Link>
          )}
        </div>
      </nav>

      <section className="banner">
        <div className="banner-content">
          <h1>TradeZone</h1>
          <p>
            TradeZone is a secondhand goods marketplace designed to facilitate the buying, selling, and trading of pre-owned electronics. Our app also features trade-in facilities where two sellers can exchange products, and collaborates with third-party repair shops. Our platform promotes sustainability by extending the life of products and providing users with an affordable alternative to new items.
          </p>
          <div className="button-container">
            <button className="common-button" onClick={() => navigate('/seller-page')}>Sell Now</button>
            <button className="common-button" onClick={handleShopNowClick}>Shop Now</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
