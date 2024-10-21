// routes/itemRoutes.js

const express = require('express');
const { getItemsByCategory } = require('../controller/ItemController');
const router = express.Router();

// GET items by category
router.get('/items', getItemsByCategory);

module.exports = router;