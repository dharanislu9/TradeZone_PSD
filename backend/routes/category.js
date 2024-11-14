const express = require('express');
const router = express.Router();
const Category = require('../models/category');

// Fetch all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new categories (useful for bulk uploading or initial setup)
router.post('/', async (req, res) => {
  const category = new Category({
    id: req.body.id,
    title: req.body.title,
    subTitle: req.body.subTitle,
    image_Url: req.body.image_Url
  });
  try {
    const newCategory = await category.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;