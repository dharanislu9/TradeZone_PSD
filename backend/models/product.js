// backend/models/product.js
import  mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: {type: String, required: true},
  description: { type: String, required: true },
  price: { type: Number, required: true },
  worth: { type: Number, default: 50 },
  image_url: { type: String } // New field to store the image URL or path
});

const ProductModel = mongoose.model('Products', productSchema);
export default ProductModel;
