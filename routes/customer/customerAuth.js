import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Customer from "../../models/Customer.js";

dotenv.config();
const router = express.Router();

// Customer Registration
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new customer
    const newCustomer = new Customer({ name, email, phone, password: hashedPassword });
    await newCustomer.save();

    res.status(201).json({ message: "Customer registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

// Customer Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find customer by email
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: customer._id, role: "customer" }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, customer });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

export default router;
