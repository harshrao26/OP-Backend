import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Customer from "../../models/Customer.js";
import { verifyCustomer } from "../../middleware/customer/customerAuth.js";
import Cart from "../../models/Cart.js";
import Order from "../../models/Order.js";
import { sendEmail } from "../../utils/emailSender.js";

dotenv.config();
const router = express.Router();

// Customer Registration
router.post("/register", async (req, res) => {
  try {
    let { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    console.log(name, email, phone, password);
    email = email.toLowerCase();
    phone = phone.replace(/\D/g, ""); // Keep digits only

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({
      $or: [{ email }, { phone }],
    });
    if (existingCustomer) {
      return res
        .status(400)
        .json({ message: "Email or phone already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new customer
    const newCustomer = new Customer({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    await newCustomer.save();

    res.status(201).json({ message: "Customer registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
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
    const token = jwt.sign(
      { id: customer._id, role: "customer" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, customer });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

// User Profile Route
router.get("/profile", verifyCustomer, async (req, res) => {
  try {
    // Retrieve customer using the id from the token (set by authMiddleware)
    const customerProfile = await Customer.findById(req.user.id).select("name email phone");

    const currentOrders = await Order.find({
      customerId: req.user.id,
      status: { $ne: "Delivered" },
    })
      .populate("products.productId", "name images price")
      .sort({ createdAt: -1 });
    
    const pastOrders = await Order.find({
      customerId: req.user.id,
      status: "Delivered",
    }).populate("products.productId", "name images price");
    
    res.status(200).json({
      profile: customerProfile,
      currentOrders,
      pastOrders,
    });
    
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

// Forgot Password - send reset link
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Incoming forgot-password request for:", email);

    const customer = await Customer.findOne({ email: email });
    if (!customer) {
      console.log("Customer not found");
      return res.status(404).json({ message: "Email not found" });
    }

    const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
    console.log("Reset link generated:", resetLink);

    const emailContent = `
      <h2>Reset Your Password</h2>
      <p>Click below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
    `;

    await sendEmail(email, "Reset Your Password", emailContent);
    console.log("Email sent");

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const customer = await Customer.findById(decoded.id);
    if (!customer) {
      return res.status(404).json({ message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);

    customer.password = hashed;
    await customer.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

router.get("/test-mail", async (req, res) => {
  try {
    await sendEmail("harshrao724@gmail.com", "Test", "<p>It works!</p>");
    res.send("Email sent");
  } catch (e) {
    console.error("Email test error:", e);
    res.status(500).send("Email failed");
  }
});

export default router;
