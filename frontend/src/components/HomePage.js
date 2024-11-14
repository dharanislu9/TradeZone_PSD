import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // State to hold the search query
  const [products, setProducts] = useState([]); // State to hold fetched products
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

  // Fetch products from backend on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/products"); // Adjust URL if needed
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          console.error("Failed to fetch products");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchProducts();
  }, []);

  console.log(products);

  // Filter products based on search query
  const filteredProducts = products.filter(product => 
    product.title && product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="home-wrapper">
      <header>
        <div className="header-container">
          {/* Logo Container */}
          <div className="logo-container">
            <Link to="/"><h1 className="logo-text">TradeZone</h1></Link>
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
        {/* Left block for navigation links */}
        <div className="left-block">
          <div className="dropdown">
            <Link to="/settings">Settings</Link>
            <Link to="/categories">Categories</Link>
            <Link to="/appearance">Appearance</Link>
          </div>
        </div>

        {/* Right block for search and product scrolling */}
        <div className="right-block">
          

          {/* Product Scrolling Section */}
          <div className="image-scroll">
            {filteredProducts.length ? filteredProducts.map((product) => (
              <Link key={product._id} to={`/product/${product._id}`}>
                <img src={`http://localhost:5001${product.image_url || product.imagePath}`} alt={product.title || "Product Image"} />
                <p>{product.title}</p>
              </Link>
            )) : "No products available"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;