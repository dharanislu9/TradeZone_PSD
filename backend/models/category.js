const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  subTitle: { type: String },
  image_Url: { type: String }
});

module.exports = mongoose.model('Category', categorySchema);