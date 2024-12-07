// models/category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  subTitle: { type: String, required: true },
  code: { type: String, required: true, unique: true }, // Unique code for each category
  image_Url: { type: String, required: true }
});

module.exports = mongoose.model('Category', categorySchema);
