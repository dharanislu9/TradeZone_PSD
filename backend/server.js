import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import nodemailer from 'nodemailer';


import productRoutes from "./routes/product.js"
import userRoutes from "./routes/user.js"
import ProductModel from './models/product.js';
import { title } from 'process';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/yourDatabaseName';

// Connect to MongoDB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(error => console.error('MongoDB connection error:', error));

// Schemas
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  address: String,
  imagePath: String,
  theme: { type: String, default: 'light' },
  locations: [{ city: String, radius: String }],
  paymentMethods: [{ cardNumber: String, expDate: String, cvv: String, country: String }],
  cart: [{ productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, quantity: { type: Number, default: 1 } }]
});

const User = mongoose.model('User', userSchema);

const productSchema = new mongoose.Schema({
  description: String,
  price: Number,
  imagePath: String,
  title:String,
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const Product = mongoose.model('Product', productSchema);

// Middleware for verifying JWT tokens
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or malformed' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('JWT verification error:', error.message);
    res.status(401).json({ error: 'Invalid or malformed token' });
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

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      address,
      locations: location && radius ? [{ city: location, radius }] : [],
      imagePath: req.file ? `uploads/${req.file.filename}` : undefined
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
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

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '90h' });
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
// app.post('/forgot-password', async (req, res) => {
//   const { email } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     const transporter = nodemailer.createTransport({
//       service: 'Gmail',
//       auth: {
//         user: process.env.EMAIL,
//         pass: process.env.EMAIL_PASSWORD,
//       },
//     });

//     const mailOptions = {
//       from: process.env.EMAIL,
//       to: email,
//       subject: 'Password Reset Request',
//       text: `Please click the link below to reset your password:
//         http://localhost:3000/reset-password/${user._id}`,
//     };

//     await transporter.sendMail(mailOptions);
//     res.status(200).json({ message: 'Password reset instructions have been sent to your email.' });
//   } catch (error) {
//     console.error('Error in forgot-password:', error.message);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

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
  const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'image'];
  const updates = Object.keys(req.body);

  // Check if every field in the request is allowed
  const isValidOperation = updates.every(update => allowedFields.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid field provided' });
  }

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
// PUT user theme update route
app.put('/user/theme', verifyToken, async (req, res) => {
  const { theme } = req.body;
  
  // Validate theme value
  const validThemes = ['light', 'dark'];
  if (!theme || !validThemes.includes(theme)) {
    return res.status(400).json({ error: 'Invalid theme value' });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(req.userId, { theme }, { new: true });
    res.status(200).json({ theme: updatedUser.theme });
  } catch (error) {
    console.error('Error updating theme:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add or update a location
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

    const user = await User.findById(req.userId);
    const existingCartItem = user.cart.find(item => item.productId.equals(productId));

    if (existingCartItem) {
      existingCartItem.quantity += 1;
    } else {
      user.cart.push({ productId });
    }
    await user.save();
    
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
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const itemIndex = user.cart.findIndex(item => item.productId.toString() === productId);
    if (itemIndex === -1) return res.status(404).json({ error: 'Item not found in cart' });

    user.cart.splice(itemIndex, 1); // Remove the item from cart
    await user.save(); // Save updated user cart

    res.status(200).json({ message: 'Product removed from cart', cart: user.cart });
  } catch (error) {
    console.error('Error removing from cart:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Product Submission Route
app.post('/products', verifyToken, upload.single('image'), async (req, res) => {
  const { description, price, title } = req.body;
  const image = req.file;
  if (!description || !price || !image || !title) {
    return res.status(400).json({ error: 'All fields including image are required' });
  }

  try {
    const newProduct = new Product({
      description,
      price,
      title,
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

app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
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
// PUT Payment Method Route
app.put('/user/payment-method', verifyToken, async (req, res) => {
  console.log('Request Body:', req.body); // Log the request body for debugging
  const { cardNumber, expDate, cvv, country } = req.body;

  if (!cardNumber || !expDate || !cvv || !country) {
    return res.status(400).json({ error: 'All payment method fields are required' });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check for duplicate payment method
    const existingPaymentMethod = user.paymentMethods.find(
      (method) => method.cardNumber === cardNumber
    );

    if (existingPaymentMethod) {
      return res.status(400).json({ error: 'Duplicate payment method' });
    }

    // Add the new payment method
    user.paymentMethods.push({ cardNumber, expDate, cvv, country });
    await user.save();

    res.status(200).json({ message: 'Payment method added successfully', paymentMethods: user.paymentMethods });
  } catch (error) {
    console.error('Error updating payment method:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE user account route
app.delete('/user', verifyToken, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.userId);
    if (!deletedUser) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/user', verifyToken, async (req, res) => {
  const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'address'];
  const updates = Object.keys(req.body);

  const isValidOperation = updates.every(update => allowedFields.includes(update));
  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid field provided' });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: req.body },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.use("/api", productRoutes)
app.use("/api/users", userRoutes)
app.use("/uploads", express.static("uploads"));


if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
