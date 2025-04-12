import express from "express";
import Product from "../../models/Product.js";
import {
  verifySeller,
  verifySeller2,
  isApproved,
} from "../../middleware/seller/authMiddleware.js";
import Seller from "../../models/Seller.js";
import Order from "../../models/Order.js";

const router = express.Router();

// Create a product (Only seller can post)
router.post("/add", verifySeller, isApproved, async (req, res) => {
  try {
    const { name, description, price, category, stock, images, brand } =
      req.body;

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
    res
      .status(201)
      .json({ message: "Product added successfully", product: newProduct });
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
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Check if the seller owns the product
    if (product.sellerId.toString() !== req.sellerId) {
      return res.status(401).json({ message: "Unauthorized seller" });
    }

    // Update only provided fields
    const { name, description, price, category, stock, images, brand } =
      req.body;
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
router.delete("/delete/:id", verifySeller, async (req, res) => {
  try {
    // Use deleteOne to remove product based on id and seller ownership
    const result = await Product.deleteOne({
      _id: req.params.id,
      sellerId: req.sellerId,
    });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Product not found or unauthorized" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
// Get orders for the logged in seller
// Get orders for the logged in seller
router.get("/orders", verifySeller, async (req, res) => {
  try {
    const orders = await Order.find({ sellerId: req.sellerId })
      .populate("products.productId", "name images price") // populate product info
      .populate("customerId", "name email"); // optional, good for tracking

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update order status (Only seller can update their own order)
router.put("/orders/:orderId", verifySeller, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Find the order by ID
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Ensure the seller owns this order
    if (order.sellerId.toString() !== req.sellerId) {
      return res.status(401).json({ message: "Unauthorized seller" });
    }

    // Update the status and save
    order.status = status;
    await order.save();

    res.status(200).json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get seller dashboard data: order history, total sales, pending orders
router.get("/dashboard", verifySeller, async (req, res) => {
  try {
    // Fetch all orders for the seller
    const orders = await Order.find({ sellerId: req.sellerId });
    
    let totalSale = 0;
    let pendingOrders = 0;
    
    // Calculate total sales (assuming each order has a totalPrice field) and count pending orders
    orders.forEach(order => {
      if(order.status === "Delivered") {
        totalSale += order.totalPrice;
      }
      if(order.status === "Pending") {
        pendingOrders++;
      }
    });
    
    res.status(200).json({
      orders,        
      totalSale,      
      pendingOrders   
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


export default router;
