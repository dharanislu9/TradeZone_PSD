const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv'); // Load environment variables
const userRoutes = require('./routes/user'); // Import user routes
const cors = require('cors');

dotenv.config(); // Configure dotenv
const app = express();
const router =express.Router();
app.use(express.json());

// CORS middleware setup
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from your frontend
    methods: ['GET', 'POST'], // Allow specific HTTP methods
    credentials: true // Allow credentials if needed
}));

const documentation = router.get("/",(req,res)=>{
    res.send("API Documentation page")
})

app.use("/", documentation)
// Connect to database (MongoDB)
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Use user routes with a prefix
app.use('/api/users', userRoutes); // This line adds the '/api/users' prefix

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
