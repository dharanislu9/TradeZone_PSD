// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the Payment Method schema as an embedded document schema
const paymentMethodSchema = new mongoose.Schema({
  cardNumber: String,
  expDate: String,
  cvv: String,
  country: String,
});

// Define the Cart Item schema for items added to the cart
const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: { type: Number, default: 1 },
});

// Define the User Schema
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

// Hash password before saving the user document
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check if password matches the stored hash
userSchema.methods.isValidPassword = async function(password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
