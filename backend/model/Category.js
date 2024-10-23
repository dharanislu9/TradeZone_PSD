// model/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  image_Url: {
    type: String,
    required: false  // If you need an image for the category
  }
});

// Use existing model if it exists, otherwise create a new one
module.exports = mongoose.models.Category || mongoose.model('Category', categorySchema);