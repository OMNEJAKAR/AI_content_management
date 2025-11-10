import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["admin", "normal"], default: "normal" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
