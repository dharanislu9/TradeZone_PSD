import React from 'react';
import './Login.css'; // Import your CSS file
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="wrapper">
      <form action="">
        <p className="form-login">Login</p>
        
        <div className="input-box">
          <input required placeholder="Username" type="text" />
        </div>
        
        <div className="input-box">
          <input required placeholder="Password" type="password" />
        </div>
        
        <div className="remember-forgot">
          <label>
            <input type="checkbox" /> Remember Me
          </label>
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
        
        <button className="btn" type="submit">Login</button>
        
        <div className="register-link">
          <p>Don’t have an account? <Link to="/register">Register</Link></p>
        </div>
      </form>
    </div>
  );
};

export default Login;
