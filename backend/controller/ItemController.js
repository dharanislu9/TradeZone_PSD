// Backend: controller/itemController.js

const Item = require('../model/Item');

// Fetch items by category ID
exports.getItemsByCategory = async (req, res) => {
  try {
    const categoryId = req.query.category;
    const items = await Item.find({ category: categoryId }); // Match category ID
    res.status(200).json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch items' });
  }
};