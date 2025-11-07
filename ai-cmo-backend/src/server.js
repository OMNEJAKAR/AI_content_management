import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import { ensureAdminExists } from "./utils/ensureAdmin.js";
import { authenticate } from "./middleware/auth.js";
import { permit } from "./middleware/roles.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Auth routes
app.use("/api/auth", authRoutes);

// Example protected admin-only route
app.get("/api/admin", authenticate, permit("admin"), (req, res) => {
  res.json({ message: "Welcome admin panel", user: req.user });
});

// Root route
app.get("/", (req, res) => {
  res.send("AI-CMO Backend running ✅");
});

// Connect DB and start server
const PORT = process.env.PORT || 5050; // changed to avoid conflicts

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Ensure main admin exists
    await ensureAdminExists();

    // Start the server
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server actively listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

start();
