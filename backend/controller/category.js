const Category = require('../models/category');

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

const addCategory = async (req, res) => {
  const { id, title, subTitle, image_Url } = req.body;
  const category = new Category({
    id,
    title,
    subTitle,
    image_Url
  });

  try {
    const newCategory = await category.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({ message: 'Failed to add category' });
  }
};

module.exports = { getCategories, addCategory };