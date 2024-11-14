import mongoose from 'mongoose';
const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({
  description: String,
  price: Number,
  imagePath: String,
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

// Check if the Product model already exists before defining it
export default mongoose.models.Product || mongoose.model('Product', productSchema);

