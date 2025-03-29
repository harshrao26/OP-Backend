
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../../models/Admin.js";
import Seller from "../../models/Seller.js";
import Product from "../../models/Product.js";

const router = express.Router();

// Middleware to verify admin token
const adminAuth = (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "No token, authorization denied." });
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== "admin") return res.status(403).json({ message: "Access denied." });
      req.admin = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: "Token is not valid." });
    }
  };
  

// GET: List all seller submissions with details
router.get("/sellers", adminAuth, async (req, res) => {
  try {
    const sellers = await Seller.find();
    res.status(200).json(sellers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// PUT: Approve a seller registration
router.put("/sellers/:id/approve", adminAuth, async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }
    seller.accountStatus = "Approved";
    await seller.save();
    res.status(200).json({ message: "Seller approved successfully", seller });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// PUT: Discard a seller registration (or mark as Rejected)
router.put("/sellers/:id/disabled", adminAuth, async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }
    seller.accountStatus = "Disabled"; // or "Discarded" as per your design
    await seller.save();
    res.status(200).json({ message: "Seller registration discarded", seller });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});



// Register a new admin
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists." });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newAdmin = new Admin({ email, password: hashedPassword });
    await newAdmin.save();
    res.status(201).json({ message: "Admin registered successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Login admin
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid email or password." });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }
    const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, admin });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


// Dashboard: View all platform activity
router.get("/dashboard", adminAuth, async (req, res) => {
  try {
    const sellers = await Seller.find();
    const products = await Product.find();
    // You can add more aggregated data as required.
    res.status(200).json({
      message: "Platform Activity Dashboard",
      totalSellers: sellers.length,
      totalProducts: products.length,
      sellers,
      products,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;

