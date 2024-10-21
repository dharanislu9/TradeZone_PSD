const express = require('express');
const { getCategories, addCategory } = require('../controller/category');
const router = express.Router();

// Route to get all categories
router.get('/', getCategories);

// Route to add a new category (if needed)
router.post('/add', addCategory);

module.exports = router;