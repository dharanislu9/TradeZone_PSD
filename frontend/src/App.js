import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage'
import HomePage from './components/HomePage';
import Register from './components/Register';
import Login from './components/Login';
import SellerPage from './components/SellerPage';

const App = () => {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<LandingPage />} />
        <Route path="/HomePage" element={<HomePage />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/SellerPage" element={<SellerPage/>} />

      </Routes>
    </Router>
  );
};

export default App;
