const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');
const nodemailer = require('nodemailer');
const categoryRoutes = require('./routes/category');
const eventRoutes = require('./routes/event');


// Load environment variables
dotenv.config();


const app = express();
const router = express.Router();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/yourDatabaseName';


// Connect to MongoDB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(error => console.error('MongoDB connection error:', error));


// User Schema
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  address: String,
  imagePath: String,
});


// User Model
const User = mongoose.model('User', userSchema);


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


// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/categories', categoryRoutes);
app.use('/api/events',eventRoutes);


// Register Route
app.post('/register', upload.single('image'), async (req, res) => {
  const { firstName, lastName, email, password, phone, address } = req.body;
  const image = req.file; // Image can be undefined if not uploaded


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
      imagePath: image ? image.path : undefined, // Store image path only if image is uploaded
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


    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, message: 'Login successful' });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Forgot Password Route
app.post('/api/users/forgot-password', async (req, res) => {
  const { email } = req.body;


  try {
    const user = await User.findOne({ email });


    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }


    // Sending reset email
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
    Console.error('Error in forgot-password:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// GET user profile route
app.get('/user', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });


    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Profile Update Route (PUT)
app.put('/user', upload.single('image'), async (req, res) => {
  const { firstName, lastName, email, phone } = req.body;
  const image = req.file;


  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;


    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        email,
        phone,
        imagePath: image ? image.path : undefined, // Update image path only if new image is uploaded
      },
      { new: true }
    );


    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// API Documentation Route
router.get("/", (req, res) => {
  res.send("API Documentation page");
});


app.use("/", router);


// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
