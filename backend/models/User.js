const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // Ensure email is unique
  password: { type: String, required: true }, // Hashed password will be stored here
});

const User = mongoose.model('User', userSchema);
module.exports = User;