const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // Ensure email is unique
  password: { type: String, required: true }, // Hashed password will be stored here
});

// Export the User model
module.exports = mongoose.model('User', userSchema);
