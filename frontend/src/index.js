import React from 'react';
import ReactDOM from 'react-dom/client';  // Use createRoot from React 18
import './index.css';  // Global styles
import App from './App';
import reportWebVitals from './reportWebVitals';  // Optional for measuring performance

// Create root for React 18
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Optional: For performance measurements, if needed
reportWebVitals();
