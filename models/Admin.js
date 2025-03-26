import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const AdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    role: { 
      type: String, 
      enum: ["Super Admin", "Moderator"], 
      default: "Moderator" 
    }, // Super Admin has all rights, Moderator has limited access

    contactNo: { type: String, required: true },
    
    permissions: {
      manageUsers: { type: Boolean, default: false },
      manageSellers: { type: Boolean, default: false },
      manageOrders: { type: Boolean, default: false },
      manageProducts: { type: Boolean, default: false },
      managePayments: { type: Boolean, default: false },
    },

    lastLogin: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before saving
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model("Admin", AdminSchema);
