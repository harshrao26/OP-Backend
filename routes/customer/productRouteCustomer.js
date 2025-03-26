import express from "express";
import Product from "../../models/Product.js";
import { verifyCustomer } from "../../middleware/customer/customerAuth.js";
import Cart from "../../models/Cart.js";
const router = express.Router();
import jwt from "jsonwebtoken";
import Customer from "../../models/Customer.js";
import mongoose from "mongoose";
router.get("/all", async (req, res) => {
   
      try {
        const products = await Product.find(); // Fetch all products
        res.status(200).json(products);
      } catch (error) {
        console.error("Error fetching products:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
      }
  });
// Get a single product by ID
router.get("/:id", async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(200).json(product);
    } catch (error) {
      console.error("Error fetching product:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

// Get cart items for a customer
router.get("/cart", verifyCustomer, async (req, res) => {
  try {
    const userId = req.user.id;
    // Query by the correct field and populate the "product" in items
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart) {
      return res.status(200).json({ success: true, cartItems: [] });
    }
    res.status(200).json({ success: true, cartItems: cart.items });
  } catch (error) {
    console.error("Error fetching cart items:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


router.post("/cart/add-product", verifyCustomer, async (req, res) => {
  try {
    let { productId, quantity } = req.body;
    const userId = req.user.id; 

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid Product ID" });
    }

    productId = new mongoose.Types.ObjectId(productId); // Convert to ObjectId

    let userCart = await Cart.findOne({ user: userId });
    if (!userCart) {
      userCart = new Cart({ user: userId, items: [] });
    } else if (!Array.isArray(userCart.items)) {
      userCart.items = []; // Ensure items is an array
    }

    const productIndex = userCart.items.findIndex((item) =>
      item.product.equals(productId)
    );

    if (productIndex !== -1) {
      if (quantity > 0) {
        userCart.items[productIndex].quantity = quantity;
      } else {
        userCart.items.splice(productIndex, 1);
      }
    } else if (quantity > 0) {
      userCart.items.push({ product: productId, quantity });
    }

    await userCart.save();
    res.json({ message: "Cart updated", cart: userCart.items });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



router.post("/cart/update", async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id; // Assuming you have authentication

    // Find user's cart
    let userCart = await Cart.findOne({ user: userId });

    if (!userCart) {
      userCart = new Cart({ user: userId, items: [] });
    }

    // Check if product exists in cart
    const productIndex = userCart.items.findIndex((item) => item.product.toString() === productId);

    if (productIndex !== -1) {
      if (quantity > 0) {
        userCart.items[productIndex].quantity = quantity;
      } else {
        userCart.items.splice(productIndex, 1); // Remove product if quantity is 0
      }
    } else if (quantity > 0) {
      userCart.items.push({ product: productId, quantity });
    }

    await userCart.save();
    res.json({ message: "Cart updated", cart: userCart.items });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// Remove item
router.delete("/cart/remove/:id", verifyCustomer, async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.json({ message: "Item removed" });
  } catch (error) {
    res.status(500).json({ message: "Error removing item" });
  }
});


export default router;