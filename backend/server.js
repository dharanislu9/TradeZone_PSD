const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv'); // Load environment variables
const userRoutes = require('./routes/user'); // Import user routes
const cors = require('cors');

// Import the Product model
const Product = require('./models/product'); // Make sure to create this model file

dotenv.config(); // Configure dotenv
const app = express();
app.use(express.json());

// CORS middleware setup
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from your frontend
    methods: ['GET', 'POST'], // Allow specific HTTP methods
    credentials: true // Allow credentials if needed
}));

// Connect to database (MongoDB)
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Use user routes with a prefix
app.use('/api/users', userRoutes); // This line adds the '/api/users' prefix

// POST route for saving product details
app.post('/api/products', async (req, res) => {
    const { description, price, worth } = req.body;

    try {
        const newProduct = new Product({ description, price, worth });
        await newProduct.save();
        res.status(201).json({ message: 'Product saved successfully!', product: newProduct });
    } catch (error) {
        res.status(400).json({ message: 'Error saving product', error });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});