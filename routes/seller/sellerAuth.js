import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Seller from "../../models/Seller.js";

const router = express.Router();

// ✅ Register a new seller
router.post("/register", async (req, res) => {
  try {
    const {
      ownerName,
      contactNo,
      shopName,
      email,
      sellerAddress,
      gstNumber,
      idProof,
      yearsInBusiness,
      customerSupport,
    } = req.body;

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res
        .status(400)
        .json({ message: "Seller already registered with this email." });
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create a new seller instance
    const newSeller = new Seller({
      ownerName,
      contactNo,
      shopName,
      email,
      sellerAddress,
      gstNumber,
      idProof,
      yearsInBusiness,
      customerSupport,
      password: hashedPassword, // Storing hashed password
    });

    await newSeller.save();
    res.status(201).json({ message: "Seller registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Seller Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if seller exists
    const seller = await Seller.findOne({ email });
    console.log(seller);
    if (!seller) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, seller.password);
    console.log(isMatch);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: seller._id, role: "seller" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, seller });
  } catch (error) {
    res.status(500).json({ message: "Server error:", error: error.message });
  }
});

export default router;
