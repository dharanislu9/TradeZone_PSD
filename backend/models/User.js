const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User'); // Adjust the path based on your project structure
const router = express.Router();


// Registration Route
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
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});


// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;


  try {
    const user = await User.findOne({ email });


    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }


    // Optionally, generate a JWT token here if you plan to use authentication tokens
    // const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: 1h' });


    res.status(200).json({ message: 'Login successful!', userId: user._id }); // Include token if using JWT
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});


module.exports = router;