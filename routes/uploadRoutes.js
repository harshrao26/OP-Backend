import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import Product from "../models/Product.js"; 

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    cloudinary.uploader.upload_stream({ folder: "online_planet" }, async (error, result) => {
      if (error) return res.status(500).json({ error: "Upload failed" });

      // Save image URL to MongoDB
      const product = new Product({ imageUrl: result.secure_url });
      await product.save();

      res.json({ imageUrl: result.secure_url });
    }).end(req.file.buffer);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
