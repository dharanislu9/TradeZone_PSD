const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const router = express.Router();
const jwt = require('jsonwebtoken');
 
router.post('/register', async (req, res) => {
    const { firstname, lastname, email, password } = req.body;


    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already registered' });
        }


        const hashedPassword = await bcrypt.hash(password, 10);


        const newUser = new User({ firstname, lastname, email, password: hashedPassword });


        await newUser.save();


        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error('Error registering user:', error.message);
       
        res.status(500).json({
            error: 'Error registering user',
            details: error.message
        });
    }
});


router.post('/login', async (req, res) => {
    const { email, password } = req.body;
 
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
 
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }


      res.status(200).json({ message: 'Login successful', userId: user._id });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
 


module.exports = router;