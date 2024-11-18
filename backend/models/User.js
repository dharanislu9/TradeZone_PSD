import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Payment Method Schema
const paymentMethodSchema = new mongoose.Schema({
  cardNumber: String,
  expDate: String,
  cvv: String,
  country: String,
});

// Cart Item Schema
const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: { type: Number, default: 1 },
});

// User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  imagePath: String,
  theme: { type: String, default: 'light' },
  locations: { type: [{ city: String, radius: String }], default: [] },
  paymentMethods: { type: [paymentMethodSchema], default: [] },
  cart: { type: [cartItemSchema], default: [] },
  resetPasswordToken: { type: String }, // Token for password reset
  resetPasswordExpires: { type: Date }, // Expiry time for the token
});

// Middleware to hash password on save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware to hash password on update
userSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  if (update.password) {
    try {
      update.password = await bcrypt.hash(update.password, 10);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Password validation method
userSchema.methods.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    console.error('Error validating password:', error.message);
    throw new Error('Password validation failed');
  }
};

// Exclude sensitive data in responses
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password; // Remove password from response
    delete ret.paymentMethods; // Optional: Remove payment methods for security
    delete ret.resetPasswordToken; // Exclude reset token
    delete ret.resetPasswordExpires; // Exclude token expiry
    return ret;
  },
});

// Prevent OverwriteModelError
const User = mongoose.models.User || mongoose.model('Users', userSchema);

export default User;
