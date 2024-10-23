const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({
  description: { type: String, required: true },
  price: { type: Number, required: true },
  worth: { type: Number, default: 50 },
});


const Product = mongoose.model('Product', productSchema);
module.exports = Product;


