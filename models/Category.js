import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Automatically set from token
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
