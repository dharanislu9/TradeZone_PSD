// routes/user.js
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import User from '../models/User.js';
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Middleware for verifying JWT tokens
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(403).json({ error: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId; // Attach user ID to request object
    next();
  } catch (error) {
    console.error('JWT verification error:', error.message);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const imageFilter = (req, file, cb) => {
  if (file && !file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'), false);
  }
  cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFilter });

// Register Route
router.post('/register', upload.single('image'), async (req, res) => {
  const { firstName, lastName, email, password, phone, address } = req.body;
  const image = req.file;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      address,
      locations: location && radius ? [{ city: location, radius }] : [],
      imagePath: image ? `uploads/${image.filename}` : undefined,
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during registration:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, username: user.firstName, message: 'Login successful' });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Profile Route - GET user details
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Profile Update Route - PUT user details
router.put('/profile', verifyToken, upload.single('image'), async (req, res) => {
  const { firstName, lastName, email, phone } = req.body;
  const image = req.file;

  try {
    const updateData = { firstName, lastName, email, phone };
    if (image) {
      updateData.imagePath = `uploads/${image.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(req.userId, updateData, { new: true });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get User Theme Route
router.get('/theme', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ theme: user.theme || 'light' });
  } catch (error) {
    console.error('Error fetching theme:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update User Theme Route
router.put('/theme', verifyToken, async (req, res) => {
  try {
    const { theme } = req.body;
    if (!theme) return res.status(400).json({ error: 'Theme value is required' });

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { theme },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ theme: updatedUser.theme });
  } catch (error) {
    console.error('Error updating theme:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Payment Method Route
router.put('/payment-method', verifyToken, async (req, res) => {
  const { cardNumber, expDate, cvv, country } = req.body;

  if (!cardNumber || !expDate || !cvv || !country) {
    return res.status(400).json({ error: 'All payment method fields are required' });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $push: { paymentMethods: { cardNumber, expDate, cvv, country } } },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ message: 'Payment method added successfully', paymentMethods: updatedUser.paymentMethods });
  } catch (error) {
    console.error('Error updating payment method:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Payment Methods Route
router.get('/payment-methods', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ paymentMethods: user.paymentMethods || [] });
  } catch (error) {
    console.error('Error fetching payment methods:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change Password Route
router.put('/change-password', verifyToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Old password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10); // Hash new password
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update User Location Route
app.put('/user/location', verifyToken, async (req, res) => {
  const { location, radius } = req.body;

  if (!location || !radius) {
    return res.status(400).json({ error: 'Location and radius are required' });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { location, radius },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ message: 'Location updated successfully', location: updatedUser.location });
  } catch (error) {
    console.error('Error updating location:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


export default router;
