import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; 

const HomePage = () => {
  return (
    <div className="home-wrapper">
      <header>
        <div className="header-container">
          {/* Logo Container */}
          <div className="logo-container">
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-icon">
              <path d="M3 3H21V7C21 7.79565 20.6839 8.55871 20.1213 9.12132C19.5587 9.68393 18.7956 10 18 10H6C5.20435 10 4.44129 9.68393 3.87868 9.12132C3.31607 8.55871 3 7.79565 3 7V3ZM7 14H10V20H7V14ZM14 14H17V20H14V14ZM5 12H19V22H5V12Z" fill="#00E676"/>
            </svg>
            <h1 className="logo-text">TradeZone</h1>
          </div>
          <div className="nav-buttons">
            <Link to="/login" className="button">Login</Link>
            <Link to="/register" className="button">Register</Link>
          </div>
        </div>
      </header>

      <div className="main-container">
        {/* Left block for profile and dropdown */}
        <div className="left-block">
          <button className="profile-btn">Profile</button>
          <div className="dropdown">
            <Link to="/profile">Settings</Link>
            <Link to="/settings">Categories</Link>
            <Link to="/appearance">appearence</Link>
          </div>
        </div>

        {/* Right block for image scrolling */}
        <div className="right-block">
          <div className="image-scroll">
            <img src="https://th.bing.com/th/id/OIP.qwy2jAdkv5p4kmRI5b02fwHaHa?w=179&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7"alt="Sample Image 1" />
            <img src="https://www.lowergear.com/img/cms/resizedIMG_20221211_132326907.jpg" alt="Sample Image 2" />
            <img src="https://i.ebayimg.com/00/s/NzY4WDEwMjQ=/z/eeIAAOSwjatbugiE/$_86.JPG" alt="Sample Image 3" />
            <img src="https://th.bing.com/th/id/OIP.mDbfiLwyexcVa2e0iXz8RgHaFj?rs=1&pid=ImgDetMain" alt="Sample Image 4" />
            <img src="https://i.etsystatic.com/13148713/r/il/9af7aa/2956782678/il_1588xN.2956782678_850g.jpg" alt="Sample Image 5" />
            <img src="https://th.bing.com/th/id/OIP.tf5bCQXp_CGT2RhSJcyUOQAAAA?w=241&h=181&c=7&r=0&o=5&dpr=1.3&pid=1.7" alt="Sample Image 6" />
            <img src="https://th.bing.com/th/id/OIP.bvGI1USB9ckFU74p5UUWawHaE7?rs=1&pid=ImgDetMain"  alt="Sample Image 7" />
            <img src="https://www.new2you-furniture.com/images/listing_photos/medium_3436_rocking_chair_tn_2021-01-19_14.35.46.jpg" alt="Sample Image 8" />
            <img src="https://th.bing.com/th/id/OIP.rpTu4bid4-txJrZStWLbZAHaHa?w=187&h=187&c=7&r=0&o=5&dpr=1.3&pid=1.7"alt="Sample Image 9" />

          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
