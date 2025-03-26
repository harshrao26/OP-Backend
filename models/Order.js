import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
  products: [{ 
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, 
    quantity: Number 
  }],
  totalAmount: { type: Number, required: true },
  
  // 📌 **New Fields**
  paymentStatus: { type: String, enum: ["Pending", "Completed", "Failed"], default: "Pending" },
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  status: { type: String, enum: ["Pending", "Prepared for Shipping", "Shipped", "Delivered"], default: "Pending" },
}, { timestamps: true });

export default mongoose.model("Order", OrderSchema);
