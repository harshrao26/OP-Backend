import Customer from "../models/Customer.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register Customer
export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the customer exists
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(400).json({ message: "Customer not found" });
    }

    // Validate the password
    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token, customer });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

// Login Customer

// Login Route
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the customer exists
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(400).json({ message: "Customer not found" });
    }

    // Validate the password
    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token, customer });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

// Get Customer Profile
export const getProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id).select("-password");
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update Customer Profile
export const updateProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    customer.name = req.body.name || customer.name;
    customer.phone = req.body.phone || customer.phone;
    customer.addresses = req.body.addresses || customer.addresses;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      customer.password = await bcrypt.hash(req.body.password, salt);
    }

    await customer.save();
    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
