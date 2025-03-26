import mongoose from "mongoose";

const SellerSchema = new mongoose.Schema(
  {
    ownerName: { type: String, required: true },
    contactNo: { type: String, required: true },
    shopName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, 

    sellerAddress: { type: String, required: true },
    shopWebsite: { type: String }, // Optional
    gstNumber: { type: String, required: true },
    idProof: { type: String, required: true }, // File path/URL
    socialMedia: {
      facebook: { type: String },
      instagram: { type: String },
      twitter: { type: String },
      linkedin: { type: String },
    },
    yearsInBusiness: { type: Number, required: true },
    customerSupport: { type: String, required: true },

    // Admin Payments
    totalEarnings: { type: Number, default: 0 },
    amountPaidByAdmin: { type: Number, default: 0 },
    pendingBalance: { type: Number, default: 0 },

    // Order Analytics
    totalOrders: { type: Number, default: 0 },
    ordersShipped: { type: Number, default: 0 },
    pendingOrders: { type: Number, default: 0 },
    totalSalesAmount: { type: Number, default: 0 },

    // Performance Metrics
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    refundCount: { type: Number, default: 0 },

    // Seller Account Status
    accountStatus: {
      type: String,
      enum: ["Pending", "Approved", "Disabled"],
      default: "Pending",
    },

    // Verification & Active Status
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Seller", SellerSchema);
