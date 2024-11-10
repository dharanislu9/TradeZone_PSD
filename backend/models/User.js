// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define payment method schema as an embedded document schema
const paymentMethodSchema = new mongoose.Schema({
  cardNumber: String,
  expDate: String,
  cvv: String,
  country: String,
});

// Define User Schema
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  address: String,
  imagePath: String,
  theme: { type: String, default: 'light' },
  paymentMethods: [
    {
      cardNumber: String,
      expDate: String,
      cvv: String,
      country: String
    }
  ],
});


// Hash password before saving the user document
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
