import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";
import { getProfileCompleteness } from "../services/dietEngineService.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: "Database not connected yet. Please try again in a few seconds.",
      });
    }

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: normalizedEmail, password: hashed });
    const token = generateToken({ id: user._id });
    const profileMeta = getProfileCompleteness(user);

    return res.status(201).json({
      message: "Registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileComplete: profileMeta.profileComplete,
        missingFields: profileMeta.missingFields,
      },
    });
  } catch (error) {
    console.error("Register error:", error?.message || error);

    if (error?.code === 11000) {
      return res.status(400).json({ message: "User already exists" });
    }

    const dbAuthError =
      /bad auth|authentication failed|timed out|server selection/i.test(
        String(error?.message || "")
      ) || error?.name === "MongooseServerSelectionError";

    if (dbAuthError) {
      return res.status(503).json({
        message: "Database connection issue. Please try again shortly.",
      });
    }

    return res.status(500).json({ message: "Registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: "Database not connected yet. Please try again in a few seconds.",
      });
    }
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "Server auth config missing (JWT_SECRET).",
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken({ id: user._id });
    const profileMeta = getProfileCompleteness(user);

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileComplete: profileMeta.profileComplete,
        missingFields: profileMeta.missingFields,
      },
    });
  } catch (error) {
    console.error("Login error:", error?.message || error);
    if (/secretorprivatekey|jwt/i.test(String(error?.message || ""))) {
      return res.status(500).json({
        message: "Server auth config missing (JWT_SECRET).",
      });
    }
    return res.status(500).json({ message: "Login failed" });
  }
};
