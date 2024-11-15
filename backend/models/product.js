import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  imagePath: {
    type: String,
    required: [true, 'Image path is required'],
    validate: {
      validator: function (v) {
        return /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))$/.test(v);
      },
      message: 'Please enter a valid image URL'
    }
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update the `updatedAt` field on each update
productSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Check if the Product model already exists before defining it
export default mongoose.models.Product || mongoose.model('Product', productSchema);
