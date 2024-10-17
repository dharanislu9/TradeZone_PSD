const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true },  // Ensure this field is added
  phone: { type: String, required: true },     // Ensure this field is added
  address: { type: String, required: true },   // Ensure this field is added
});

const User = mongoose.model('User', userSchema);
module.exports = User;
