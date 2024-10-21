// backend/models/Item.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image_Url: {
    type: String,
    required: true,
  },
  category: {
    type: String, // Or use mongoose.Schema.Types.ObjectId if referencing a Category model
    required: true,
  }
});

module.exports = mongoose.model('Item', itemSchema);