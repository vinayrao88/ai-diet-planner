import DietPlan from "../models/DietPlan.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { generateAndSaveDietForUser } from "../services/dietEngineService.js";

/**
 * Generate a new diet plan for logged-in user
 */
export const generateDiet = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const forceRegenerate = String(req.query.force || "").toLowerCase() === "true";

    const result = await generateAndSaveDietForUser({
      user,
      forceRegenerate,
    });

    if (!result.profileComplete) {
      return res.status(400).json({
        message: "Please complete profile before generating diet plan",
        missingFields: result.missingFields,
      });
    }

    return res.json(result.plan);
  } catch (err) {
    console.error("Generate diet error:", err);
    return res.status(500).json({ message: "Diet generation failed" });
  }
};

/**
 * Get latest diet plan for logged-in user
 */
export const currentDiet = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const result = await generateAndSaveDietForUser({ user, forceRegenerate: false });
    return res.json(result.plan);
  } catch (err) {
    console.error("Fetch diet error:", err);
    return res.status(500).json({ message: "Failed to fetch diet" });
  }
};
export const dietHistory = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);
    const plans = await DietPlan.aggregate([
      { $match: { user: userObjectId } },

      // 🔥 createdAt se YYYY-MM-DD nikaalo
      {
        $addFields: {
          day: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
        },
      },

      // 🔥 same day ke plans ko group karo
      {
        $group: {
          _id: "$day",
          totalCalories: { $last: "$totalCalories" },
          bmi: { $last: "$bmi" },
          goal: { $last: "$goal" },
          createdAt: { $last: "$createdAt" },
        },
      },

      { $sort: { createdAt: -1 } },
    ]);

    res.json(plans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch history" });
  }
};
