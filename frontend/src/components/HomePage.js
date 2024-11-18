import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const [products, setProducts] = useState([]); // State to hold products
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [location, setLocation] = useState("St. Louis, Missouri");
  const [radius, setRadius] = useState("1 mile");
  const [searchQuery, setSearchQuery] = useState(""); // State to hold the search query
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch products from the backend
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5001/products'); // Adjust this URL if needed
        if (response.ok) {
          const data = await response.json();
          setProducts(data); // Update products state with data from backend
        } else {
          console.error("Failed to fetch products");
        }
      } catch (error) {
        console.error("Error fetching products:", error.message);
      }
    };

    fetchProducts();
  }, []); // Empty dependency array means this runs once when component mounts

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch('http://localhost:5001/user/location', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.location) {
            setLocation(data.location.city || "Default City");
            setRadius(data.location.radius || "1 mile");
          }
        } else {
          console.error("Failed to fetch location");
        }
      } catch (error) {
        console.error("Error fetching location:", error.message);
      }
    };
  
    fetchLocation();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('locationData');
    navigate('/login');
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleLocationModal = () => {
    setIsLocationModalOpen(prevState => !prevState);
  };

  const handleLocationChange = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch('http://localhost:5001/user/location', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ city: location, radius }),
      });
  
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('locationData', JSON.stringify(data.location));
        toggleLocationModal();
      } else {
        console.error('Failed to update location');
      }
    } catch (error) {
      console.error('Error updating location:', error.message);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      const response = await fetch('http://localhost:5001/user/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
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
 // Filter products based on search query
 const filteredProducts = products.filter(product => 
  product.title && product.title.toLowerCase().includes(searchQuery.toLowerCase())
);
  return (
    <div className="home-wrapper">
      <header>
        <div className="header-container">
          <div className="logo-container">
            <Link to="/"><h1 className="logo-text">TradeZone</h1></Link>
          </div>
          <div className="header-container-right">
            <div className="cart-container">
              <Link to= "/cart" className="cart-button" onClick={() => navigate('/cart')}>
                🛒 Cart
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </Link>
            </div>
          </div>
            {/* Search Bar */}
            <div className="search-bar-container">
            <input
              type="text"
              placeholder="Search for a product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-bar"
            />
          </div>

          {/* Right-side Buttons Container */}
          <div className="nav-buttons">
            <Link to="/login" className="button login-btn">Login</Link>
            <button className="button" style={{marginTop: "0px"}} onClick={toggleDropdown}>Profile</button>

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
        <div className="left-block">
          <div className="dropdown">
            <Link to="/settings" className="sidebar-link">Settings</Link>
            <Link to="#" onClick={toggleLocationModal} className="sidebar-link">Location</Link>
            <Link to="/" className="sidebar-link">Back</Link>
          </div>
        </div>


        {/* Right block for image scrolling */}
        <div className="right-block">
          

          {/* Product Scrolling Section */}
          <div className="image-scroll">
            {products.map((product) => (
              <div key={product._id} className="image-container">
                <Link to={`/product/${product._id}`}>
                  <img src={`http://localhost:5001/${product.imagePath}`} alt={product.description} />
                </Link>
                <h3>{product.title}</h3>
                <p>Price: ${product.price}</p>
                <button
                  className="add-to-cart-button"
                  onClick={() => handleAddToCart(product._id)}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

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

{filteredProducts.length ? filteredProducts.map((product) => (
              <Link key={product._id} to={`/product/${product._id}`}>
                <img src={`http://localhost:5001${product.image_url || product.imagePath}`} alt={product.title || "Product Image"} />
                <p>{product.title}</p>
              </Link>
            )) : "No products available"}
    </div>
  );


};

export default HomePage;
