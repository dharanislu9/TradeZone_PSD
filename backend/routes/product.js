const express = require("express");
const multer = require("multer");
const ProductModel = require("../models/product.js");
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure the 'uploads' folder exists in your project root
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});

const upload = multer({ storage: storage });

// POST route to create a product with an image
router.post("/products", upload.single("image"), async (req, res) => {
  try {
    const { description, price } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null; // Save image path

    const newProduct = await ProductModel.create({
      description,
      price,
      image_url: imageUrl, // Save the image path in the product document
      seller_id: 1, // Adjust seller_id as needed, or accept from req.body
      title: req.body.title || "Sample Product", // Optional title
      category: req.body.category || "General", // Optional category
      status: "available"
    });

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Unknown Server Error" });
  }
});

module.exports = router;
