const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const router = express.Router();
const jwt = require('jsonwebtoken');
  
// Registration route
router.post('/register', async (req, res) => {
    const { firstname, lastname, email, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already registered' });
        }

        // Hash the password before saving the user
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user with hashed password
        const newUser = new User({ firstname, lastname, email, password: hashedPassword });

        // Save the user in the database
        await newUser.save();

        // Respond with success message
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        // Log the specific error message for debugging
        console.error('Error registering user:', error.message);
        
        // Send a detailed error response
        res.status(500).json({
            error: 'Error registering user',
            details: error.message // Include error details for debugging
        });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Check if the user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
  
      // Check if the password is correct
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
  
      // Respond with success
      res.status(200).json({ message: 'Login successful', userId: user._id });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

module.exports = router;