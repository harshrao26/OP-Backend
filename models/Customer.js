import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zip: String,
  country: { type: String, default: "India" },
  isDefault: { type: Boolean, default: false }, // Default address
});

const WishlistSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  addedAt: { type: Date, default: Date.now },
});

const CartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  quantity: { type: Number, default: 1 },
  addedAt: { type: Date, default: Date.now },
});

const NotificationSchema = new mongoose.Schema({
  message: String,
  type: { type: String, enum: ["order", "promotion", "general"], default: "general" },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

const ReviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  createdAt: { type: Date, default: Date.now },
});

const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Encrypted
    addresses: [AddressSchema], // Multiple Addresses
    wishlist: [WishlistSchema], // Wishlist Items
    cart: [CartItemSchema], // Cart Items
    notifications: [NotificationSchema], // User Notifications
    reviews: [ReviewSchema], // Product Reviews
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Customer", CustomerSchema);