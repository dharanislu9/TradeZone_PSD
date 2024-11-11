const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');
const nodemailer = require('nodemailer');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/yourDatabaseName';

// Connect to MongoDB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(error => console.error('MongoDB connection error:', error));

// User Schema with location
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  address: String,
  imagePath: String,
  theme: { type: String, default: 'light' },
  locations: [
    {
      city: {type: String, required: true},
      radius:{type: String, required: true},
    }
  ],
  paymentMethods: [
    {
      cardNumber: String,
      expDate: String,
      cvv: String,
      country: String
    }
  ],
  cart: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, default: 1 }
    }
  ]
});

const User = mongoose.model('User', userSchema);

// Product Schema
const productSchema = new mongoose.Schema({
  description: String,
  price: Number,
  imagePath: String,
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const Product = mongoose.model('Product', productSchema);

// Middleware for verifying JWT tokens with enhanced error handling
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ error: 'Authorization header missing or malformed' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(403).json({ error: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return res.status(401).json({ error: 'Invalid or malformed token' });
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

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.post('/register', upload.single('image'), async (req, res) => {
  const { firstName, lastName, email, password, phone, address, location, radius } = req.body;
  const image = req.file;

  if (!firstName || !lastName || !email || !password || !phone || !address) {
    return res.status(400).json({ error: 'All fields are required except for the image' });
  }

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
      locations: location && radius ? [{ city: location, radius }] : [], // Add location if provided
      imagePath: image ? `uploads/${image.filename}` : undefined,
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully', locations: newUser.locations });
  } catch (error) {
    console.error('Error during registration:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ 
      token, 
      username: user.firstName, 
      location: user.location,
      message: 'Login successful' 
    });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change Password Route
app.put('/user/change-password', verifyToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Both old and new passwords are required' });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect old password' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error.message);
    res.status(500).json({ error: 'Internal server error while changing password' });
  }
});

// Forgot Password Route
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Password Reset Request',
      text: `Please click the link below to reset your password:
        http://localhost:3000/reset-password/${user._id}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Password reset instructions have been sent to your email.' });
  } catch (error) {
    console.error('Error in forgot-password:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET user profile route
app.get('/user', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Profile Update Route (PUT)
app.put('/user', verifyToken, upload.single('image'), async (req, res) => {
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

// GET user theme route
app.get('/user/theme', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ theme: user.theme || 'light' });
  } catch (error) {
    console.error('Error fetching theme:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT user theme update route
app.put('/user/theme', verifyToken, async (req, res) => {
  try {
    const { theme } = req.body;
    if (!theme) return res.status(400).json({ error: 'Theme value is required' });

    const updatedUser = await User.findByIdAndUpdate(req.userId, { theme }, { new: true });
    res.status(200).json({ theme: updatedUser.theme });
  } catch (error) {
    console.error('Error updating theme:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.put('/user/location', verifyToken, async (req, res) => {
  const { city, radius } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: { "locations.0": { city, radius } } }, // Upserts the location as the first item in the array
      { new: true, upsert: true }
    );

    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ message: 'Location added successfully', location: updatedUser.locations[0] });
  } catch (error) {
    console.error('Error adding location:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/user/location', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Send the first location in the array or a default location if the array is empty
    const location = user.locations.length > 0 ? user.locations[0] : { city: "Default City", radius: "1 mile" };
    res.status(200).json({ location });
  } catch (error) {
    console.error('Error fetching location:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Add to Cart
app.post('/user/cart', verifyToken, async (req, res) => {
  const { productId } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $push: { cart: { productId } } },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ message: 'Product added to cart', cart: user.cart });
  } catch (error) {
    console.error('Error adding to cart:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Cart
app.get('/user/cart', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('cart.productId');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ cart: user.cart });
  } catch (error) {
    console.error('Error fetching cart:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove from Cart
app.delete('/user/cart/:productId', verifyToken, async (req, res) => {
  const { productId } = req.params;

  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $pull: { cart: { productId } } },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ message: 'Product removed from cart', cart: user.cart });
  } catch (error) {
    console.error('Error removing from cart:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Product Submission Route
app.post('/products', verifyToken, upload.single('image'), async (req, res) => {
  const { description, price } = req.body;
  const image = req.file;

  if (!description || !price || !image) {
    return res.status(400).json({ error: 'All fields including image are required' });
  }

  try {
    const newProduct = new Product({
      description,
      price,
      imagePath: `uploads/${image.filename}`,
      sellerId: req.userId,
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully' });
  } catch (error) {
    console.error('Error adding product:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update entire locations array
app.put('/user/locations', verifyToken, async (req, res) => {
  const { locations } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { locations },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ message: 'Locations updated successfully', locations: updatedUser.locations });
  } catch (error) {
    console.error('Error updating locations:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Fetch all user locations
app.get('/user/locations', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ locations: user.locations || [] });
  } catch (error) {
    console.error('Error fetching locations:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// GET Payment Methods Route
app.get('/user/payment-methods', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ paymentMethods: user.paymentMethods });
  } catch (error) {
    console.error('Error fetching payment methods:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT Payment Method Route
app.put('/user/payment-method', verifyToken, async (req, res) => {
  console.log('Request Body:', req.body); // Log the request body for debugging
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


// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
