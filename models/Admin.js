import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
