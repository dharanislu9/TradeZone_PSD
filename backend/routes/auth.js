const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Your user model
const authMiddleware = require('../middleware/authMiddleware'); // Import the auth middleware
const router = express.Router();

router.post('/signup', async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword, username, phone, address } = req.body;

  if (!firstName || !lastName || !email || !password || !confirmPassword || !username || !phone || !address) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      username, // Save new fields
      phone,
      address,
    });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ error: 'Error registering user. Please try again.' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { email: user.email, firstName: user.firstName, lastName: user.lastName },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Protected Route: Get Profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    console.log('Fetching user profile for userId:', req.user.userId); // Log the userId
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      console.log('User not found in database.');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User profile fetched successfully:', user); // Log the user profile
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching profile:', error); // Log any errors
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});


// Update Profile Route
// Protected Route: Update Profile
router.put('/profile', authMiddleware, async (req, res) => {
  const { firstName, lastName, email, username, phone, address } = req.body;
  console.log('Received profile update request for userId:', req.user.userId); // Log the userId

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { firstName, lastName, email, username, phone, address },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      console.log('User not found in database.');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User profile updated successfully:', updatedUser); // Log updated user profile
    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error.message); // Log any errors
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});


module.exports = router;
