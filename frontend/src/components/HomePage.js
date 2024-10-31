import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HomePage.css';


const HomePage = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();


  // Handle logout logic
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove the token from localStorage
    navigate('/login'); // Redirect to login page
  };


  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };


  // Sample images for scrolling section
  const images = [
    { src: "https://th.bing.com/th/id/OIP.qwy2jAdkv5p4kmRI5b02fwHaHa?w=179&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7", id: 1 },
    { src: "https://www.lowergear.com/img/cms/resizedIMG_20221211_132326907.jpg", id: 2 },
    { src: "https://i.ebayimg.com/00/s/NzY4WDEwMjQ=/z/eeIAAOSwjatbugiE/$_86.JPG", id: 3 },
    { src: "https://th.bing.com/th/id/OIP.mDbfiLwyexcVa2e0iXz8RgHaFj?rs=1&pid=ImgDetMain", id: 4 },
    { src: "https://i.etsystatic.com/13148713/r/il/9af7aa/2956782678/il_1588xN.2956782678_850g.jpg", id: 5 },
    { src: "https://th.bing.com/th/id/OIP.tf5bCQXp_CGT2RhSJcyUOQAAAA?w=241&h=181&c=7&r=0&o=5&dpr=1.3&pid=1.7", id: 6 },
    { src: "https://th.bing.com/th/id/OIP.bvGI1USB9ckFU74p5UUWawHaE7?rs=1&pid=ImgDetMain", id: 7 },
    { src: "https://www.new2you-furniture.com/images/listing_photos/medium_3436_rocking_chair_tn_2021-01-19_14.35.46.jpg", id: 8 },
    { src: "https://th.bing.com/th/id/OIP.rpTu4bid4-txJrZStWLbZAHaHa?w=187&h=187&c=7&r=0&o=5&dpr=1.3&pid=1.7", id: 9 },
  ];


  return (
    <div className="home-wrapper">
      <header>
        <div className="header-container">
          {/* Logo Container */}
          <div className="logo-container">
            <h1 className="logo-text">TradeZone</h1>
          </div>


          {/* Right-side Buttons Container */}
          <div className="nav-buttons">
            <Link to="/login" className="button login-btn">Login</Link>
            <button className="button" onClick={toggleDropdown}>
                Profile
              </button>


              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <Link to="/profile" className="dropdown-item">My Details</Link>
                  <button className="dropdown-item" onClick={handleLogout}>Logout</button>
                </div>
              )}
          </div>
        </div>
      </header>


      <div className="main-container">
        {/* Left block for navigation links */}
        <div className="left-block">
          <div className="dropdown">
            <Link to="/settings">Settings</Link>
            <Link to="/categories">Categories</Link>
            <Link to="/appearance">Appearance</Link>
          </div>
        </div>


        {/* Right block for image scrolling */}
        <div className="right-block">
          <div className="image-scroll">
            {images.map((image) => (
              <Link key={image.id} to={`/product/${image.id}`}>
                <img src={image.src} alt={`Sample Image ${image.id}`} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


export default HomePage;