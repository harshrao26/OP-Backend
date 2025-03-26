import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true },
  images: [{ type: String, required: true }], // Array of image URLs
  brand: { type: String, required: true },
  ratings: { type: Number, default: 0 },
  reviews: [{ user: String, rating: Number, comment: String }],
}, { timestamps: true });

export default mongoose.model("Product", ProductSchema);
