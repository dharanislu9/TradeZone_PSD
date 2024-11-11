import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [location, setLocation] = useState("St. Louis, Missouri");
  const [radius, setRadius] = useState("1 mile");
  const navigate = useNavigate();

  // Handle logout logic
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Toggle location modal visibility
  const toggleLocationModal = () => {
    setIsLocationModalOpen((prevState) => !prevState);
  };

  // Handle updating location with backend API call
  const handleLocationChange = async () => {
    try {
      const response = await fetch('http://localhost:5001/user/location', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ location, radius })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Location updated:', data);
        toggleLocationModal();
      } else {
        console.error('Failed to update location');
      }
    } catch (error) {
      console.error('Error updating location:', error.message);
    }
  };

  // Images with descriptions and prices
  const images = [
    { src: "https://th.bing.com/th/id/OIP.qwy2jAdkv5p4kmRI5b02fwHaHa?w=179&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7", id: 1, description: "Kitchen Cabinets", price: 50 },
    { src: "https://www.lowergear.com/img/cms/resizedIMG_20221211_132326907.jpg", id: 2, description: "Kerosene Heater", price: 70 },
    { src: "https://i.ebayimg.com/00/s/NzY4WDEwMjQ=/z/eeIAAOSwjatbugiE/$_86.JPG", id: 3, description: "Sofa", price: 20 },
    { src: "https://th.bing.com/th/id/OIP.mDbfiLwyexcVa2e0iXz8RgHaFj?rs=1&pid=ImgDetMain", id: 4, description: "Mitsubishi Delica Engine", price: 35 },
    { src: "https://i.etsystatic.com/13148713/r/il/9af7aa/2956782678/il_1588xN.2956782678_850g.jpg", id: 5, description: "Wooden Rolling Pin", price: 5 },
    { src: "https://th.bing.com/th/id/OIP.tf5bCQXp_CGT2RhSJcyUOQAAAA?w=241&h=181&c=7&r=0&o=5&dpr=1.3&pid=1.7", id: 6, description: "Washroom Essentials", price: 40 },
    { src: "https://th.bing.com/th/id/OIP.bvGI1USB9ckFU74p5UUWawHaE7?rs=1&pid=ImgDetMain", id: 7, description: "Outdoor Travel Gear", price: 30 },
    { src: "https://www.new2you-furniture.com/images/listing_photos/medium_3436_rocking_chair_tn_2021-01-19_14.35.46.jpg", id: 8, description: "Chair", price: 50 },
    { src: "https://th.bing.com/th/id/OIP.rpTu4bid4-txJrZStWLbZAHaHa?w=187&h=187&c=7&r=0&o=5&dpr=1.3&pid=1.7", id: 9, description: "Computer", price: 80 },
  ];

  // Handle add to cart with backend API call
  const handleAddToCart = async (productId) => {
    try {
      const response = await fetch('http://localhost:5001/user/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ productId })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Item added to cart:', data);
        setCartCount(cartCount + 1);
      } else {
        console.error('Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error.message);
    }
  };

  return (
    <div className="home-wrapper">
      <header>
        <div className="header-container">
          <div className="logo-container">
            <h1 className="logo-text">TradeZone</h1>
          </div>
          <div className="header-container-right">
            <div className="cart-container">
              <button className="cart-button">
                🛒 Cart
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </button>
            </div>
            <div className="nav-buttons">
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
        </div>
      </header>

      <div className="main-container">
        <div className="left-block">
          <div className="dropdown">
            <Link to="/settings">Settings</Link>
            <Link to="/categories">Categories</Link>
            <button className="location-button" onClick={toggleLocationModal}>Location</button>
            <Link to="/appearance">Appearance</Link>
          </div>
        </div>
        <div className="right-block">
          <div className="image-scroll">
            {images.map((image) => (
              <div key={image.id} className="image-container">
                <Link to={`/product/${image.id}`}>
                  <img src={image.src} alt={image.description} />
                </Link>
                <h3>{image.description}</h3>
                <p>Price: ${image.price}</p>
                <button
                  className="add-to-cart-button"
                  onClick={() => handleAddToCart(image.id)}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Location Modal */}
      {isLocationModalOpen && (
        <div className="modal-overlay">
          <div className="location-modal">
            <div className="modal-header">
              <h2>Change Location</h2>
              <button className="close-button" onClick={toggleLocationModal}>×</button>
            </div>
            <div className="modal-content">
              <label>Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Search by city, neighborhood, or ZIP code"
              />
              <label>Radius</label>
              <select value={radius} onChange={(e) => setRadius(e.target.value)}>
                <option value="1 mile">1 mile</option>
                <option value="5 miles">5 miles</option>
                <option value="10 miles">10 miles</option>
                <option value="20 miles">20 miles</option>
              </select>
              <div className="map-placeholder">
                <p>Map showing location with a radius of {radius}</p>
              </div>
              <button className="apply-button" onClick={handleLocationChange}>Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
