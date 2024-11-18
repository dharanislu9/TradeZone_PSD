import express from "express";
import  multer from "multer";
import  ProductModel from "../models/product.js";
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
    const { title, description, price, category } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null; // Save image path

    const newProduct = await ProductModel.create({
      title,
      description,
      price,
      image_url: imageUrl, // Save the image path in the product document
      seller_id: 1, // Adjust seller_id as needed, or accept from req.body
      category:category ??"General", // Optional category
      status: "available"
    });

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || "Unknown Server Error" });
  }
});

// GET route to retrieve all products
router.get("/products", async (req, res) => {
  try {
    const products = await ProductModel.find(); // Fetch all products from the database
    res.status(200).json(products); // Send the products as a JSON response
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET route to retrieve a single product by ID
router.get("/products/:id", async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


export default router;
