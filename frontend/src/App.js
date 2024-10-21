import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import Register from './components/Register';
import Login from './components/Login';
import CategoryList from './components/CategoryList';
import CategoryItems from './components/CategoryItems';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/categories" element={<CategoryList/>}/>
        <Route path="/categories/:categoryId" element={<CategoryItems/>}/>
      </Routes>
    </Router>
  );
};

export default App;
