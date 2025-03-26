import express from "express";
import Product from "../../models/Product.js";
import { verifySeller, verifySeller2 } from "../../middleware/seller/authMiddleware.js";
import Seller from "../../models/Seller.js";

const router = express.Router();

// Create a product (Only seller can post)
router.post("/add", verifySeller, async (req, res) => {
  try {
    const { name, description, price, category, stock, images, brand } = req.body;

    // Ensure seller ID is present
    if (!req.sellerId) {
      return res.status(401).json({ message: "Unauthorized seller" });
    }

    // Create and save product
    const newProduct = new Product({
      sellerId: req.sellerId,
      name,
      description,
      price,
      category,
      stock,
      brand,
      images,
    });

    await newProduct.save();
    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/all", verifySeller, async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.sellerId });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});


// Update a product (Only seller can update their own product)
router.put("/update/:id", verifySeller, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });
      
    // Check if the seller owns the product
    if (product.sellerId.toString() !== req.sellerId) {
      return res.status(401).json({ message: "Unauthorized seller" });
    }
    
    // Update only provided fields
    const { name, description, price, category, stock, images, brand } = req.body;
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (stock) product.stock = stock;
    if (images) product.images = images;
    if (brand) product.brand = brand;

    await product.save();
    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete a product (Only seller can delete their own product)
// Delete a product (Only seller can delete their own product)
router.delete("/delete/:id", verifySeller, async (req, res) => {
  try {
    // Use deleteOne to remove product based on id and seller ownership
    const result = await Product.deleteOne({ _id: req.params.id, sellerId: req.sellerId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Product not found or unauthorized" });
    }
    
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});




export default router;
