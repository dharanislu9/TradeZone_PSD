const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const router = express.Router();

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

    // Respond with success
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(400).json({ error: 'Error registering user' });
  }
});

module.exports = router;
