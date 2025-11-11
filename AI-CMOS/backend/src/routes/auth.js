import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();
const router = express.Router();
const SALT_ROUNDS = 10;

// signup (create normal user)
router.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "username and password required" });
    }

    // Validate username length
    if (username.length < 3) {
      return res.status(400).json({ message: "Username must be at least 3 characters" });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: "username already exists" });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({ username, passwordHash, role: "normal" });
    await user.save();

    return res.status(201).json({
      message: "User created",
      user: { id: user._id, username: user.username, role: user.role }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "username and password required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return res.json({
      token,
      user: { id: user._id, username: user.username, role: user.role }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// logout (client-side, but we can add a token blacklist endpoint if needed)
router.post("/logout", async (req, res) => {
  // In a stateless JWT system, logout is handled client-side by removing the token
  // This endpoint can be used for token blacklisting if needed in the future
  return res.json({ message: "Logged out successfully" });
});

export default router;
