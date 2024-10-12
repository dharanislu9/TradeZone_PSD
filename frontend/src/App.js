import React from 'react';
import "./App.css"
import {Route, Routes, BrowserRouter } from 'react-router-dom';
import {LoginPage, SignupPage} from "./routes/Routes.js"

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LoginPage/>} />
        <Route path="/sign-up" element={<SignupPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

